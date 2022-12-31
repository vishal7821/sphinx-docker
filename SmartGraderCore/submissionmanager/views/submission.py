import json

from django.utils.crypto import get_random_string
from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.decorator import csrf_protection, authentication
from authentication.utils import get_course_data_from_cache
from eventmanager.serializers.subevent import *
from submissionmanager.serializers.submission import SubmissionCreateSerializer, SubmissionEditSerializer,SubmissionViewSerializer,UserViewSerializer , SubmissionGroupViewSerializer , ParamViewSerializer
from eventmanager.validators import *
from helper.exceptions import *
from eventmanager.utils import validate_subevent_active_at_moment,get_user_supload_subevent,get_submissiongroup_has_user,is_subevent_active_at_moment

class ImpersonatedSubmission(APIView):

    def get_user_has_subevents(self,enrollment_id,event_id):
        # return all the subevents of given type

        uhs_sview = UserHasSubevents.objects.filter(subevent__event__id=event_id, subevent__type='SVIEW',
                                              enrollment__id=enrollment_id)
        uhs_supload = UserHasSubevents.objects.filter(subevent__event__id=event_id, subevent__type='SUPLOAD', enrollment__id = enrollment_id)
        # if len(uhs_sview) == 0 and len(uhs_supload) == 0:
        #     raise EventError()
        isactive = False
        for uhs in uhs_sview:
            subevent = uhs.subevent
            if(is_subevent_active_at_moment(subevent)):
                isactive = True
        for uhs in uhs_supload:
            subevent = uhs.subevent
            if(is_subevent_active_at_moment(subevent)):
                isactive = True
        if not isactive:
            raise EventError()



    def get(self, request, course_id, event_id, user_id):
        enrollment_id = user_id
        self.get_user_has_subevents(enrollment_id, event_id)
        submission_group_has_user = get_submissiongroup_has_user(event_id, enrollment_id)
        submission_group = submission_group_has_user.submission_group
        subevent = submission_group.subevent
        end_time = None
        # validate_subevent_active_at_moment(subevent)

        enrollments = submission_group.enrollments.filter()
        userList = list()
        for e in enrollments:
            user = User.objects.get(id=e.user_id)
            userList.append(user)

        # get subevevnt param value
        param = json.loads(submission_group.subevent.params)

        p = {}
        flag = False
        if 'DEL' in param:
            p['DEL'] = param['DEL']
        if 'COL' in param:
            p['COL'] = param['COL']
        if 'NAC' in param:
            p['NAC'] = param['NAC']
            if submission_group.access_code_gold == submission_group.access_code_submitted:
                flag = True
        if 'SGS' in param:
            p['SGS'] = param['SGS']
        if 'QSS' in param:
            p['QSS'] = param['QSS']
        if 'SUP' in param:
            p['SUP'] = param['SUP']
        if 'SUT' in param:
            p['SUT'] = param['SUT']
        p['NAC_flag'] = flag

        userSerializer = UserViewSerializer(userList, many=True)
        sgSerializer = SubmissionGroupViewSerializer(submission_group)
        paramSerializer = ParamViewSerializer(data=p)
        paramSerializer.is_valid()

        # data = {'users':userList,'submission_group':submission_group,'params':p}
        # serializer = SubmissionViewSerializer(data=data)
        # serializer.is_valid()
        return Response(
            {'users': userSerializer.data, 'submission_group': sgSerializer.data, 'params': paramSerializer.data})





class Submission(APIView):
    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_user_has_subevents(self,enrollment_id,event_id):
        # return all the subevents of given type

        uhs_sview = UserHasSubevents.objects.filter(subevent__event__id=event_id, subevent__type='SVIEW',
                                              enrollment__id=enrollment_id)
        uhs_supload = UserHasSubevents.objects.filter(subevent__event__id=event_id, subevent__type='SUPLOAD', enrollment__id = enrollment_id)
        # if len(uhs_sview) == 0 and len(uhs_supload) == 0:
        #     raise EventError()
        isactive = False
        for uhs in uhs_sview:
            subevent = uhs.subevent
            if(is_subevent_active_at_moment(subevent)):
                isactive = True
        for uhs in uhs_supload:
            subevent = uhs.subevent
            if(is_subevent_active_at_moment(subevent)):
                isactive = True
        if not isactive:
            raise EventError()

                # get all the events with subevents
    def get(self, request, course_id,event_id):
        # get enrollment id from cache
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        #validate user have SUPLOAD/SVIEW linked to this event or not
        self.get_user_has_subevents(enrollment_id, event_id)
        submission_group_has_user = get_submissiongroup_has_user(event_id,enrollment_id)
        submission_group = submission_group_has_user.submission_group

        #validate if this subevent is active at this event or not
        subevent = submission_group.subevent
        end_time = None
        # validate_subevent_active_at_moment(subevent)

        enrollments = submission_group.enrollments.filter()
        userList= list()
        for e in enrollments:
            user = User.objects.get(id =e.user_id)
            userList.append(user)

        #get subevevnt param value
        param = json.loads(submission_group.subevent.params)

        p = {}
        flag = False
        if 'DEL' in param:
            p['DEL'] = param['DEL']
        if 'COL' in param:
            p['COL'] = param['COL']
        if 'NAC' in param:
            p['NAC'] = param['NAC']
            if submission_group.access_code_gold == submission_group.access_code_submitted:
                flag = True
        if 'SGS' in param:
            p['SGS'] = param['SGS']
        if 'QSS' in param:
            p['QSS'] = param['QSS']
        if 'SUP' in param:
            p['SUP'] = param['SUP']
        if 'SUT' in param:
            p['SUT'] = param['SUT']
        p['NAC_flag'] = flag

        userSerializer = UserViewSerializer(userList , many = True)
        sgSerializer = SubmissionGroupViewSerializer(submission_group)
        paramSerializer = ParamViewSerializer(data = p)
        paramSerializer.is_valid()

        # data = {'users':userList,'submission_group':submission_group,'params':p}
        # serializer = SubmissionViewSerializer(data=data)
        # serializer.is_valid()
        return Response({'users' : userSerializer.data , 'submission_group':sgSerializer.data , 'params' : paramSerializer.data})



    def validate_submission_group_has_user(self,enrollment_id, event_id):
        submission_group_has_user = SubmissionGroupHasUser.objects.filter(
            submission_group__subevent__event__id=event_id,
            submission_group__subevent__type='SUPLOAD',
            enrollment__id=enrollment_id
            )
        if submission_group_has_user.count() >0:
            raise DuplicateEntryException()

    def post(self, request, course_id,event_id):
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        subevent = get_user_supload_subevent(event_id, enrollment_id)
        params = json.loads(subevent.params)
        #deprecating below check as no userhassubevent entries creates if SBM = OLI
        # if 'SBM' in params and params['SBM'] == 'OLI':
        #     raise AccessException()

        if 'SGS' in params and params['SGS'] in ['FG','IN']:
            raise DuplicateEntryException()

        if 'SGS' in params and params['SGS'] == 'OG':
            self.validate_submission_group_has_user(enrollment_id, event_id)
            id = get_random_string(length=10,
                              allowed_chars='0123456789')
            mutable = request.POST._mutable
            request.POST._mutable = True
            request.data['id'] = id
            request.POST._mutable = mutable
        context = {'subevent':subevent,'params':params, 'event_id':event_id , 'enrollment_id': enrollment_id}
        serializer = SubmissionCreateSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        submission_group = serializer.save()
        return Response(
            {'submission_group': serializer.data}, status=status.HTTP_201_CREATED
        )

    def put(self, request, course_id, event_id , submission_group_id =None, is_masqueraded = False):

        if is_masqueraded:
            submission_group = SubmissionGroup.objects.filter(id = submission_group_id)
            if submission_group.count()==0:
                raise ValidationException(detail='Invalid submission group id')
            submission_group = submission_group.get()
            subevent = submission_group.subevent
        else:
            enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
            s_g_h_u = get_submissiongroup_has_user(event_id, enrollment_id)
            submission_group = s_g_h_u.submission_group
            subevent = get_user_supload_subevent(event_id, enrollment_id)
        data = request.data
        params = json.loads(subevent.params)
        mutable = request.POST._mutable
        request.POST._mutable = True
        # if 'NAC' in params and params['NAC'] !=1:
        #     data.pop('access_code_submitted')
        if 'QSS' in params and params['QSS'] !='OS':
            data.pop('choosen_question_set')
        request.POST._mutable = mutable
        old_qset = submission_group.choosen_question_set
        context = {'event_id': event_id}
        serializer = SubmissionEditSerializer(submission_group, data=data, context=context)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        #delete gradingduties for old qset ,if exist
        if old_qset is not None:
            old_responses = SubmissionResponse.objects.filter(submission_group = submission_group, question__question_set = old_qset)
            for response in old_responses:
                response.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class SubmissionNAC(APIView):
    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def put(self, request, course_id, event_id , submission_group_id =None, is_masqueraded = False):

        if is_masqueraded:
            submission_group = SubmissionGroup.objects.filter(id = submission_group_id)
            if submission_group.count()==0:
                raise ValidationException(detail='Invalid submission group id')
            submission_group = submission_group.get()
            subevent = submission_group.subevent
        else:
            enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
            s_g_h_u = get_submissiongroup_has_user(event_id, enrollment_id)
            submission_group = s_g_h_u.submission_group
            subevent = get_user_supload_subevent(event_id, enrollment_id)
        data = request.data
        params = json.loads(subevent.params)
        is_NAC_correct = False
        if 'NAC' in params and params['NAC'] == 1:
            if submission_group.access_code_gold == data['access_code_submitted']:
                submission_group.access_code_submitted = data['access_code_submitted']
                submission_group.save()
                is_NAC_correct = True


        # return Response( {'is_NAC_correct': is_NAC_correct}, status=status.HTTP_204_NO_CONTENT)
        return Response(
            {'is_NAC_correct': is_NAC_correct}, status=status.HTTP_201_CREATED
        )
