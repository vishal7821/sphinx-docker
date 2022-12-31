from rest_framework.response import Response
from rest_framework.views import APIView

from eventmanager.serializers.modifygrader import *
from helper.exceptions import AccessException


class ModifyGrader(APIView):
    def get_object(self, event_id, subevent_id):
        try:
            return Subevent.objects.get(event_id = event_id, subevent_id  = subevent_id)
        except Subevent.DoesNotExist:
            raise AccessException()

    def get_grading_duties(self,question_id,grader_id):
        try:
            return GradingDuty.objects.filter(response__question__id= question_id, grader_id = grader_id)
        except:
            raise AccessException()

    def put(self, request, course_id, event_id, subevent_id):
        context = {'event_id':event_id,'subevent_id':subevent_id}
        serializer = ModifyGraderSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)