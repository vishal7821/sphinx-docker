from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.decorator import csrf_protection, authentication
from eventmanager.utils import get_gupload_subevent
from helper.exceptions import *
from rest_framework.parsers import MultiPartParser, FormParser
from submissionmanager.serializers.graderassignment import GraderAssignmentSerializer

class GraderAssignment(APIView):
    parser_classes = (MultiPartParser, FormParser)

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)


    def put(self, request, course_id, event_id, subevent_id):

        subevent = get_gupload_subevent(event_id , subevent_id)
        context = {'subevent': subevent , 'event_id': event_id}
        serializer = GraderAssignmentSerializer(data={}, context=context)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED )

