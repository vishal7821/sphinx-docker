from PIL import Image
from django.http import Http404
from rest_framework import status,serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from helper import exceptions, messages
from assignmentmanager.models import Question, QuestionHasTopics
from assignmentmanager.serializers.questiontopic import QuestionTopicCreateSerializer
from coursemanager.models import Topic

Image.MAX_IMAGE_PIXELS = None

from authentication.decorator import csrf_protection, authentication
from django.utils.decorators import method_decorator

#link topic
class QuestionTopicView(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_question(self,assignment_id, question_set_id, question_id):
        try:
            return Question.objects.get(question_set__assignment__id=assignment_id,
                                question_set__id=question_set_id, id=question_id)
        except Question.DoesNotExist:
            raise exceptions.AccessException()

    def get_topic(self,topic_id):
        try:
            return Topic.objects.get(id = topic_id)
        except Topic.DoesNotExist:
            raise exceptions.AccessException()

    def post(self, request,  course_id, assignment_id, question_set_id, question_id, topic_id):
        question = self.get_question( assignment_id, question_set_id, question_id)
        topic = self.get_topic(topic_id)
        data = {'question': question.id, 'topic': topic.id}
        serializer = QuestionTopicCreateSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data':serializer.data}, status=status.HTTP_201_CREATED)



    #verify that this question id belong to this assignment
    def delete(self,request, course_id, assignment_id, question_set_id, question_id, topic_id):
        question = self.get_question(assignment_id, question_set_id, question_id)
        topic = self.get_topic(topic_id)
        rel = QuestionHasTopics.objects.filter(question = question,topic = topic )
        if rel :
            rel.delete()
        else :
            raise serializers.ValidationError(messages.QUESTION_TOPIC_NOEXIST_1)
        return Response({'details':'topic deleted successfully'},status=status.HTTP_204_NO_CONTENT)


