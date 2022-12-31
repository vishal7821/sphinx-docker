from rest_framework import serializers
from helper import exceptions

from coursemanager.models import Topic


class TopicViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ('id','name', 'super_topic', 'description')


class TopicEditSerializer(serializers.ModelSerializer):

    def validate_name(self, val):
        if self.instance:
            if val is not None and self.instance.name != val and Topic.objects.filter(name=val).exists():
                raise exceptions.DuplicateEntryException(
                    detail='name already exists for different topic,change and try again')
        elif Topic.objects.filter(name=val).exists():
            raise exceptions.DuplicateEntryException(
                detail='name already exists for different topic,change and try again')
        return val

    class Meta:
        model = Topic
        fields = ('name', 'super_topic', 'description')
        extra_kwargs = {'description': {'required': False, 'allow_blank': True}}

