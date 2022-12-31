from eventmanager.models import *
from eventmanager.validators import *
from helper.utils import get_pdf_encoded_content

class MyQuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Question
        fields = '__all__'




class MyQuestionsViewSerializer(serializers.ModelSerializer):
    question_file = serializers.SerializerMethodField()
    supplementary_file = serializers.SerializerMethodField()
    questions = MyQuestionSerializer(many=True)

    def get_question_file(self, obj):
        if bool(obj.get('question_file_path')):
            return get_pdf_encoded_content(file_path=obj.get('question_file_path'))

    def get_supplementary_file(self, obj):
        if bool(obj.get('supplementary_file_path')):
            return get_pdf_encoded_content(file_path=obj.get('supplementary_file_path'))

    class Meta:
        model = QuestionSet
        fields = ('id','name', 'total_marks','name_coords', 'roll_coords','question_file','supplementary_file','original_question_file_name',
                  'original_supplementary_file_name','questions')


class MySolutionsViewSerializer(serializers.ModelSerializer):
    solution_file = serializers.SerializerMethodField()

    def get_solution_file(self, obj):
        if bool(obj.solution_file_path):
            return get_pdf_encoded_content(file_path=obj.solution_file_path.path)

    class Meta:
        model = QuestionSet
        fields = ('id','name', 'total_marks','name_coords', 'roll_coords','solution_file','original_solution_file_name')