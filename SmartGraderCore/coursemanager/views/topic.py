from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.decorator import csrf_protection, authentication
from django.utils.decorators import method_decorator
from coursemanager.models import Topic
from coursemanager.serializers.topic import TopicViewSerializer, TopicEditSerializer


class TopicList(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get(self, request, course_id):
        topics = Topic.objects.all()
        serializer = TopicViewSerializer(topics, many=True)
        return Response({'data':serializer.data})

    def post(self,request, course_id):
        serializer = TopicEditSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        t = serializer.save()
        ser = TopicViewSerializer(t)
        return Response({'data':ser.data}, status=status.HTTP_201_CREATED)


#todo : permissions
class TopicDetail(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_object(self, pk):
        try:
            return Topic.objects.get(pk=pk)
        except Topic.DoesNotExist:
            raise Http404

    def put(self, request, course_id, topic_id):
        topic = self.get_object(topic_id)
        serializer = TopicEditSerializer(topic, data=request.data)
        serializer.is_valid(raise_exception=True)
        t  = serializer.save()
        ser = TopicViewSerializer(t)
        return Response({'data':ser.data})

    def delete(self, request, course_id, topic_id):
        topic = self.get_object(topic_id)
        #update all the child topic's super topic to null
        Topic.objects.filter(super_topic_id = topic_id).update(super_topic_id = None)
        topic.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

