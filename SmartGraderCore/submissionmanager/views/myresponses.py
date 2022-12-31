import json

from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.decorator import csrf_protection, authentication
from authentication.utils import get_course_data_from_cache
from eventmanager.serializers.subevent import *
from eventmanager.utils import get_user_supload_subevent, get_submissiongroup_has_user , get_responses_per_submission_group, is_subevent_active_at_moment
from helper.exceptions import *
from rest_framework.parsers import MultiPartParser, FormParser

class ResponsePage(APIView):
    def get(self, request, course_id, event_id, user_id):
        enrollment_id = user_id
        self.get_user_has_subevents(enrollment_id, event_id)
        submission_group_has_user = get_submissiongroup_has_user(event_id, enrollment_id)
        submission_group = submission_group_has_user.submission_group
        choosen_question_set = submission_group.choosen_question_set
        if choosen_question_set is None:
            raise serializers.ValidationError(messages.QUESTION_SET_NOEXIST_4)
        questions = Question.objects.filter(question_set=choosen_question_set, is_actual_question=True)
        responses = get_responses_per_submission_group(submission_group.id)
        returnData = []
        qidDict = {}
        for response in responses:
            temp = {'question_id': response.question.id, 'page_no': response.upload_page_no,
                    'reponseText': response.response_text}
            returnData.append(temp)
            qidDict[response.question.id] = response.upload_page_no
        for q in questions:
            if q.id not in qidDict:
                temp = {'question_id': q.id, 'page_no': None, 'reponseText': "-1"}
                returnData.append(temp)
                # returnData[q.id] = None

        return Response({"data": returnData}, status=status.HTTP_200_OK)


    def get_user_has_subevents(self, enrollment_id, event_id):
        # return all the subevents of given type

        uhs_sview = UserHasSubevents.objects.filter(subevent__event__id=event_id, subevent__type='SVIEW',
                                                    enrollment__id=enrollment_id)
        uhs_supload = UserHasSubevents.objects.filter(subevent__event__id=event_id, subevent__type='SUPLOAD',
                                                      enrollment__id=enrollment_id)
        # if len(uhs_sview) == 0 and len(uhs_supload) == 0:
        #     raise EventError()
        isactive = False
        for uhs in uhs_sview:
            subevent = uhs.subevent
            if (is_subevent_active_at_moment(subevent)):
                isactive = True
        for uhs in uhs_supload:
            subevent = uhs.subevent
            if (is_subevent_active_at_moment(subevent)):
                isactive = True
        if not isactive:
            raise EventError()











class MyResponses(APIView):

    parser_classes = (MultiPartParser, FormParser)

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
    def get(self, request, course_id,event_id, submission_group_id =None, is_masqueraded = False):

        if is_masqueraded:
            submission_group = SubmissionGroup.objects.filter(id=submission_group_id)
            if submission_group.count() == 0:
                raise ValidationException(detail='Invalid submission group id')
            submission_group = submission_group.get()
        else:
            # get enrollment id from cache
            enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
            self.get_user_has_subevents(enrollment_id, event_id)
            submission_group_has_user = get_submissiongroup_has_user(event_id,enrollment_id)
            submission_group = submission_group_has_user.submission_group
        choosen_question_set =  submission_group.choosen_question_set
        if choosen_question_set is None:
            raise serializers.ValidationError(messages.QUESTION_SET_NOEXIST_4)

        #fetch all question_id of choosen question_set
        questions = Question.objects.filter(question_set = choosen_question_set , is_actual_question = True)
        responses = get_responses_per_submission_group(submission_group.id)
        returnData = []
        qidDict = {}
        for response in responses:
            temp = {'question_id': response.question.id, 'page_no': response.upload_page_no, 'reponseText': response.response_text}
            returnData.append(temp)
            qidDict[response.question.id] = response.upload_page_no
        for q in questions:
            if q.id not in qidDict:
                temp = {'question_id': q.id, 'page_no': None, 'reponseText': "-1"}
                returnData.append(temp)
                # returnData[q.id] = None

        return Response({"data": returnData}, status=status.HTTP_200_OK)



