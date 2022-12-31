from PIL import Image
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from assignmentmanager.models import Assignment, QuestionSet
from assignmentmanager.serializers.questionset import QuestionSetCreateSerializer, QuestionSetEditSerializer, \
    QuestionSetViewSerializer , QuestionSetsViewSerializer
from assignmentmanager.utils import get_question_set_object

from authentication.decorator import csrf_protection, authentication
from django.utils.decorators import method_decorator
from helper.exceptions import AccessException

Image.MAX_IMAGE_PIXELS = None


class QuestionSetList(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_object(self, pk):
        try:
            return Assignment.objects.get(pk=pk)
        except Assignment.DoesNotExist:
            raise AccessException()


    def get(self, request, course_id, assignment_id):
        question_sets = QuestionSet.objects.filter(assignment__id=assignment_id)
        serializer = QuestionSetsViewSerializer(question_sets, many=True)
        return Response({'questionsets':serializer.data})

    def post(self,request, course_id, assignment_id):
        assignment = self.get_object(assignment_id)
        context  = {'assignment':assignment}
        serializer = QuestionSetCreateSerializer(data=request.data,context=context)
        serializer.is_valid(raise_exception=True)
        question_set = assignment.questionset.create(**serializer.validated_data)
        serializer = QuestionSetViewSerializer(question_set)
        return Response({'questionset':serializer.data}, status=status.HTTP_201_CREATED)


#todo : do validations
#todo : permissions
class QuestionSetDetail(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_object(self, pk):
        try:
            return Assignment.objects.get(pk=pk)
        except Assignment.DoesNotExist:
            raise AccessException()

    def get(self, request, course_id, assignment_id, question_set_id):
        question_set = get_question_set_object(assignment_id, question_set_id)
        serializer = QuestionSetViewSerializer(question_set)
        return Response({'questionset':serializer.data})

    def put(self, request, course_id,  assignment_id, question_set_id):
        question_set = get_question_set_object(assignment_id, question_set_id)
        assignment = self.get_object(assignment_id)
        context = {'assignment': assignment}
        serializer = QuestionSetEditSerializer(question_set, data=request.data,context=context)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'questionset':serializer.data})

    def delete(self, request, course_id,  assignment_id, question_set_id):
        question_set = get_question_set_object(assignment_id, question_set_id)
        question_set.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)