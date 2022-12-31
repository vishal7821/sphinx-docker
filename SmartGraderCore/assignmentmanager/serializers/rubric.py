from rest_framework import serializers

from assignmentmanager.models import Rubric


#rubric serializers
class RubricViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rubric
        fields = '__all__'

class RubricCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Rubric
        fields = (
        'marks','text')
        #exclude = ('question',)
    def create(self, validated_data):

        validated_data['question'] = self.context.get('question')
        rubric = Rubric(**validated_data)
        rubric.save()
        return rubric


class RubricEditSerializer(serializers.ModelSerializer):

    class Meta:
        model = Rubric
        exclude = ('question',)
