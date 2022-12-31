import json

from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.decorator import csrf_protection, authentication
from authentication.utils import get_course_data_from_cache
from eventmanager.serializers.subevent import *
from eventmanager.utils import get_user_supload_subevent
from helper.exceptions import *
from eventmanager.utils import is_lists_intersects , get_section_list_enrollments

class JoinSubmissionGroup(APIView):
    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def validate_user_has_submission_group(self,enrollment_id,subevent_id):
        s_g = SubmissionGroupHasUser.objects.filter(enrollment_id=enrollment_id,submission_group__subevent__id = subevent_id )
        if s_g.count()>0:
            raise DuplicateEntryException()

    def validate_submission_group(self,submission_group_id, subevent_id):
        s_g = SubmissionGroup.objects.filter(id = submission_group_id, subevent__id = subevent_id)
        if s_g.count() == 0:
            raise ValidationException()
        return s_g.get()

    def validate_submission_group_size(self,submission_group_id,max_size):
        s_g_h_u  =SubmissionGroupHasUser.objects.filter(submission_group__id = submission_group_id)
        if len(s_g_h_u)>=max_size:
            raise AccessException("Group size reached max")



    def post(self, request, course_id,event_id, submission_group_id, enrollment_id =None, is_masqueraded = False):

        if is_masqueraded:
            #validate any one submission group user belongs to section of url requesting user
            section_list = get_course_data_from_cache(request, course_id, 'enrollment_section_list')
            section_list_enrollments = get_section_list_enrollments(section_list)
            sg_enrollments = [enrollment_id]
            sg_enrolls = SubmissionGroupHasUser.objects.filter(submission_group__id = submission_group_id).values_list('enrollment', flat=True)
            sg_enrollments.extend(sg_enrolls)
            is_user_section_intersect = is_lists_intersects(section_list_enrollments, sg_enrollments)
            if not is_user_section_intersect:
                raise ValidationException(detail="Invalid enrollment id")
            subevent = get_user_supload_subevent(event_id, enrollment_id)
        else:
            enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
            subevent = get_user_supload_subevent(event_id, enrollment_id)


        params = json.loads(subevent.params)
        if 'SGS' in params and (params['SGS'] == 'FG' or params['SGS'] == 'IN'):
            raise DuplicateEntryException()
        if 'SGS' in params and params['SGS'] == 'OG':
            #if user is already part of some submission group with respect to this subevent then raise exception
            self.validate_user_has_submission_group(enrollment_id,subevent.id)
            #validate submission group id
            s_g = self.validate_submission_group(submission_group_id,subevent.id)
            # if subevent.type != 'SUPLOAD':
            #     raise ValidationException()
            #validate size
            g_size = params['SGS_OG_max']
            self.validate_submission_group_size(s_g.id,g_size)
            #add user to this group
            #s_g.enrollments.add(enrollment_id)
            #add submissiongrouphasusers entry
            enrollment = Enrollment.objects.get(id = enrollment_id)
            data = {'submission_group' : s_g , 'enrollment' : enrollment}
            s_g_h_u = SubmissionGroupHasUser(**data)
            s_g_h_u.save()

        return Response(
            status=status.HTTP_201_CREATED
        )