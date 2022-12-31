from rest_framework import serializers
from assignmentmanager.models import QuestionSet
from helper import messages
from authentication.utils import _get_new_random_string

# class QuestionSetFileCreateSerializer(serializers.ModelSerializer):
#
#     def validate_question_file_path(self,val):
#         if self.instance.question_file_path.name:
#             raise serializers.ValidationError(messages.ASSIGNMENT_NODUP_2)
#         return val
#
#     class Meta:
#         model = QuestionSet
#         fields = ('question_file_path',)
#
#     def update(self, instance, validated_data):
#         questionset = instance
#         questionset.question_file_path = validated_data['question_file_path']
#         original_file_name  = questionset.question_file_path.name
#         questionset.original_question_file_name = original_file_name
#         newfilename = _get_new_random_string()
#         questionset.question_file_path.name = newfilename
#         questionset.save()
#         return questionset

class QuestionSetFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = QuestionSet
        fields = ('question_file_path',)

    def update(self, instance, validated_data):
        questionset = instance
        questionset.question_file_path = validated_data['question_file_path']
        original_file_name  = questionset.question_file_path.name
        questionset.original_question_file_name = original_file_name
        newfilename = _get_new_random_string()
        questionset.question_file_path.name = newfilename
        questionset.save()
        return questionset


class SolutionFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = QuestionSet
        fields = ('solution_file_path',)

    def update(self, instance, validated_data):
        questionset = instance
        questionset.solution_file_path = validated_data['solution_file_path']
        original_file_name  = questionset.solution_file_path.name
        questionset.original_solution_file_name = original_file_name
        newfilename = _get_new_random_string()
        questionset.solution_file_path.name = newfilename
        questionset.save()
        return questionset

class SupplementaryFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = QuestionSet
        fields = ('supplementary_file_path',)

    def update(self, instance, validated_data):
        questionset = instance
        questionset.supplementary_file_path = validated_data['supplementary_file_path']
        original_file_name  = questionset.supplementary_file_path.name
        questionset.original_supplementary_file_name = original_file_name
        newfilename = _get_new_random_string()
        questionset.supplementary_file_path.name = newfilename
        questionset.save()
        return questionset

