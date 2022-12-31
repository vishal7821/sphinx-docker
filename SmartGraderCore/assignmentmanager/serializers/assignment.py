from rest_framework import serializers

from assignmentmanager.models import Assignment
from assignmentmanager.serializers.questionset import QuestionSetViewSerializer
from helper import exceptions


class AssignmentsViewSerializer(serializers.ModelSerializer):
    #questionset = QuestionSetViewSerializer(many=True,read_only=True)
    question_set_count = serializers.SerializerMethodField()
    def get_question_set_count(self,obj):
        return obj.questionset.count()

    class Meta:
        model = Assignment
        fields = ('id','name', 'comments','question_set_count','is_interactive')

class AssignmentViewSerializer(serializers.ModelSerializer):
    questionset = QuestionSetViewSerializer(many=True,read_only=True)
    #question_set_count = serializers.SerializerMethodField()
    def get_question_set_count(self,obj):
        return obj.questionset.count()

    class Meta:
        model = Assignment
        fields = ('id','name', 'comments','questionset','is_interactive')


class AssignmentCreateSerializer(serializers.ModelSerializer):

    def validate_name(self,val):
        if Assignment.objects.filter(name=val).exists():
            raise exceptions.DuplicateEntryException(
                detail='name already exists for different Assignment,change and try again')
        return val

    class Meta:
        model = Assignment
        fields = ('name', 'comments','is_interactive')


class AssignmentEditSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=100, validators=[])

    def validate_name(self,val):
        if self.instance:
            if val is not None and self.instance.name != val and Assignment.objects.filter(name=val).exists():
                raise exceptions.DuplicateEntryException(
                    detail='name already exists for different Assignment,change and try again')
        return val

    class Meta:
        model = Assignment
        fields = ('name', 'comments','is_interactive')

