from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.decorator import csrf_protection, authentication
from eventmanager.utils import get_gupload_subevent
from helper.exceptions import *
from rest_framework.parsers import MultiPartParser, FormParser
from submissionmanager.serializers.graderassignment import RegraderAssignmentSerializer
from authentication.utils import get_course_data_from_cache
from eventmanager.utils import get_user_rgreq_subevent,get_gd_by_submission_group, get_submissiongroup_has_user , get_responses_per_submission_group,get_marksview_subevent , recompute_aggregate_marks , get_gradingduty_has_rubrics
import json
from eventmanager.models import *


class RegraderAssignment(APIView):
    parser_classes = (MultiPartParser, FormParser)

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)


    def post(self, request, course_id, event_id, subevent_id,response_id):

        #1.validating RGREQ for user exists or not
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        rgreq_subevent = get_user_rgreq_subevent(event_id, enrollment_id)

        #2.RGREQ TED param must have gupload type subevent_id
        params = json.loads(rgreq_subevent.params)
        gupload_id = params.get('TED', None)
        if gupload_id is None or gupload_id != subevent_id:
            raise PermissionError()
        gupload_subevent = Subevent.objects.filter(id=gupload_id, event__id=event_id, type='GUPLOAD')
        if gupload_subevent.count() == 0:
            raise ValidationException('Invalid subevent id')

        #3.grading_duty row validation for given response_id
        gd = GradingDuty.objects.filter(response__id = response_id , subevent__id = subevent_id)
        if gd.count() == 0:
            raise ValidationException('Invalid regrading request')

        #4 check presence of already regrading request is present or not
        # rgd = GradingDuty.objects.filter(response__id=response_id, request_subevent__id=rgreq_subevent.id , is_completed = False)
        rgd = GradingDuty.objects.filter(response__id=response_id, subevent__event__id=event_id,
                                         is_completed=False)
        if rgd.count() > 0:

            raise PermissionError()

        context = {'subevent': gupload_subevent , 'event_id': event_id , 'rgreq_subevent' : rgreq_subevent , 'gd' : gd , 'response_id' : response_id}
        serializer = RegraderAssignmentSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        rgd = serializer.save()
        return Response(
            {'data': {'student_comment':rgd.student_comment}}, status=status.HTTP_201_CREATED
        )
