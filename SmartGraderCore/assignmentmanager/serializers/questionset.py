from rest_framework import serializers
from helper.utils import get_pdf_encoded_content
from helper import messages, exceptions

from assignmentmanager.models import QuestionSet , Assignment

class QuestionSetsViewSerializer(serializers.ModelSerializer):

    class Meta:
        model = QuestionSet
        fields = ('id','name', 'total_marks','name_coords', 'roll_coords','original_question_file_name','original_supplementary_file_name','original_solution_file_name')


class QuestionSetViewSerializer(serializers.ModelSerializer):
    question_file = serializers.SerializerMethodField()
    supplementary_file = serializers.SerializerMethodField()
    solution_file = serializers.SerializerMethodField()

    def get_question_file(self, obj):
        if bool(obj.question_file_path):
            return get_pdf_encoded_content(file_path=obj.question_file_path.path)

    def get_supplementary_file(self, obj):
        if bool(obj.supplementary_file_path):
            return get_pdf_encoded_content(file_path=obj.supplementary_file_path.path)

    def get_solution_file(self, obj):
        if bool(obj.solution_file_path):
            return get_pdf_encoded_content(file_path=obj.solution_file_path.path)

    class Meta:
        model = QuestionSet
        fields = ('id','name', 'total_marks','name_coords', 'roll_coords','question_file','supplementary_file','solution_file','original_question_file_name',
                  'original_supplementary_file_name','original_solution_file_name')


class QuestionSetCreateSerializer(serializers.ModelSerializer):

    def validate_name(self,val):
        assgn = self.context.get('assignment',None)
        if assgn:
            if QuestionSet.objects.filter(assignment_id=assgn.id,name=val).exists():
                raise exceptions.DuplicateEntryException(messages.ASSIGNMENT_NODUP_1)
        return val
    def validate_total_marks(self,val):
        if val<0:
            raise serializers.ValidationError(messages.ASSIGNMENT_NOVAL_1 )
        return val

    class Meta:
        model = QuestionSet
        fields = ('name', 'total_marks','name_coords', 'roll_coords')


class QuestionSetEditSerializer(serializers.ModelSerializer):

    def validate_name(self, val):
        if self.instance.name != val:
            assgn = self.context.get('assignment', None)
            if QuestionSet.objects.filter(assignment_id=assgn.id, name=val).exists():
                raise exceptions.DuplicateEntryException(messages.ASSIGNMENT_NODUP_1)
        return val

    def validate_total_marks(self, val):
        if val < 0:
            raise serializers.ValidationError(messages.ASSIGNMENT_NOVAL_1)
        return val


    class Meta:
        model = QuestionSet
        fields = ('name', 'total_marks','name_coords', 'roll_coords')



