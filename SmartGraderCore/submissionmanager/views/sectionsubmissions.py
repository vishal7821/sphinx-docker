import json
from coursemanager.models import *
from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.decorator import csrf_protection, authentication
from authentication.utils import get_course_data_from_cache
from eventmanager.serializers.subevent import *
from helper.exceptions import *
from rest_framework.parsers import MultiPartParser, FormParser
from submissionmanager.serializers.submission import MySectionSubmissionsSerializer,MySectionSubmissionGroupsSerializer,SectionSubmissionGroupDataSerializer
from eventmanager.utils import get_section_list_enrollments,is_lists_intersects

class MySectionSubmission(APIView):

    parser_classes = (MultiPartParser, FormParser)

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)


    # get all the events with subevents
    def get(self, request, course_id,event_id,response_id = 10):
        # get section_list from cache
        section_list = get_course_data_from_cache(request, course_id, 'enrollment_section_list')
        suploads = Subevent.objects.filter(event__id = event_id , type = 'SUPLOAD')
        section_enrollments = get_section_list_enrollments(section_list)
        return_data =[]
        for subevent in suploads:
            params = json.loads(subevent.params)
            SGS = params.get('SGS', None)
            data = {'subevent' : subevent}
            submission_groups = SubmissionGroup.objects.filter(subevent_id = subevent.id)
            filtered_sub_grps_with_enrollments =[]
            enrollments_without_uploads=[]
            sub_grp_without_uploads = []
            sub_grp_users = []
            for sub_grp in submission_groups:
                s_g_h_users = SubmissionGroupHasUser.objects.filter(submission_group_id = sub_grp.id)
                grp_enrollments =[]
                grp_users=[]
                for s_g_h_u in s_g_h_users:
                    grp_enrollments.append(s_g_h_u.enrollment)
                    grp_users.append(s_g_h_u.enrollment.id)
                is_sub_grp_belongs_section = is_lists_intersects(section_enrollments , grp_users)
                if is_sub_grp_belongs_section:
                    submission_group_data ={'submission_group' : sub_grp , 'enrollments':grp_enrollments}
                    filtered_sub_grps_with_enrollments.append(submission_group_data)
                    if sub_grp.upload_id_main is None:
                        if SGS in ['IN','FG']:
                            sub_grp_without_uploads.append(sub_grp)
                        if SGS == 'OG' :
                            enrollments_without_uploads.append(grp_enrollments)
            data['submission_group_data'] = filtered_sub_grps_with_enrollments
            data['enrollments_without_uploads'] = enrollments_without_uploads
            data['submission_groups_without_upload'] = sub_grp_without_uploads
            return_data.append(data)

        serializer = MySectionSubmissionsSerializer(return_data,many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class MySectionSubmissionGroups(APIView):

    parser_classes = (MultiPartParser, FormParser)

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def _submission_grp_has_section_user(self,lst1,lst2):
        sec_users = list(set(lst1) & set(lst2))
        if len(sec_users)>0:
            return True
        else:
            return False

    def post(self , request, course_id,event_id):

        section_list = get_course_data_from_cache(request, course_id, 'enrollment_section_list')
        # section_list = section_list.split('|')

        context = {'event_id': event_id, 'course_id': course_id, 'section_list': section_list}
        serializer = MySectionSubmissionGroupsSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        data = serializer.save()

        viewserializer = SectionSubmissionGroupDataSerializer(data)

        return Response({"data": viewserializer.data}, status=status.HTTP_200_OK)



