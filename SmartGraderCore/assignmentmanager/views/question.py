from PIL import Image
from django.http import Http404
from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView


from assignmentmanager.models import QuestionSet, Question
from assignmentmanager.serializers.question import QuestionViewSerializer, QuestionCreateSerializer ,QuestionEditSerializer

from authentication.decorator import csrf_protection, authentication
from django.utils.decorators import method_decorator
from assignmentmanager.utils import get_question_set_object
from helper import exceptions, messages
from assignmentmanager.utils import update_questiontree_marks_on_deletion,update_questionset_marks

Image.MAX_IMAGE_PIXELS = None



class QuestionList(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_questions(self,assignment_id, question_set_id):
        questions=Question.objects.filter(question_set__id = question_set_id,question_set__assignment__id = assignment_id)

        # if questions.count()==0:
        #     raise exceptions.AccessException()
        return questions


    def get(self, request, course_id, assignment_id, question_set_id):
        questions = self.get_questions(assignment_id,question_set_id)
        serializer = QuestionViewSerializer(questions, many=True)
        return Response({'questions':serializer.data})

    def post(self,request, course_id, assignment_id, question_set_id):
        question_set = get_question_set_object(assignment_id , question_set_id)
        context = {'question_set':question_set}
        serializer = QuestionCreateSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        question  = serializer.save()
        ser = QuestionViewSerializer(question)
        return Response({'question': ser.data}, status=status.HTTP_201_CREATED)


#todo : do validations
#todo : permissions
class QuestionDetail(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_object(self, assignment_id, question_set_id, question_id):
        try:
            return Question.objects.get(question_set__assignment__id = assignment_id,question_set__id = question_set_id,id=question_id)
        except Question.DoesNotExist:
            raise exceptions.AccessException()

    def put(self, request, course_id, assignment_id, question_set_id, question_id):
        question = self.get_object(assignment_id, question_set_id, question_id)
        serializer = QuestionEditSerializer(question, data=request.data)
        serializer.is_valid(raise_exception=True)
        question = serializer.save()
        ser = QuestionViewSerializer(question)
        return Response({'question':ser.data},status=status.HTTP_200_OK)

    def delete(self, request, course_id, assignment_id, question_set_id, question_id):
        question = self.get_object(assignment_id, question_set_id, question_id)
        if Question.objects.filter(parent__id = question.id).exists():
            raise serializers.ValidationError(messages.QUESTION_NODEL_1)

        #update parent question marks in question tree
        update_questiontree_marks_on_deletion(question)
        question.delete()
        update_questionset_marks(question)
        return Response(status=status.HTTP_204_NO_CONTENT)

class InteractiveQuestionList(APIView):
    def get(self, request, course_id, assignment_id, question_set_id,question_id):
        questions = self.get_object(question_id)
        serializer = QuestionViewSerializer(questions, many=True)
        return Response({'questions': serializer.child.data})

    def get_object(self, pk):
        try:
            return Question.objects.get(pk=pk)
        except Question.DoesNotExist:
            raise Http404


