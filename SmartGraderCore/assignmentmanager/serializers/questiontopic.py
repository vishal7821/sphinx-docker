from rest_framework import serializers
from helper import messages,exceptions
from assignmentmanager.models import QuestionHasTopics


class QuestionTopicCreateSerializer(serializers.ModelSerializer):

    def validate(self,attrs):
        if QuestionHasTopics.objects.filter(question = attrs['question'], topic = attrs['topic']).exists():
            raise exceptions.DuplicateEntryException(messages.QUESTIONHASTOPIC_NODUP_1)
        return attrs

    class Meta:
        model = QuestionHasTopics
        fields = '__all__'
