import json

from rest_framework import serializers
from assignmentmanager.models import Question
from helper import messages
from coursemanager.models import *
from assignmentmanager.models import *
from assignmentmanager.utils import update_questiontree_on_insertion,update_questiontree_marks_on_deletion,update_questionset_marks,update_question_marks
import base64

class QuestionViewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Question
        fields = '__all__'




class QuestionCreateSerializer(serializers.ModelSerializer):
    topics  = serializers.ListField(child=serializers.IntegerField(),default=[])

    def validate_marks(self,val):
        if val<0:
            raise serializers.ValidationError(**messages.ASSIGNMENT_NOVAL_1)
        return val

    def _validate_is_actual_question(self, is_actual_question, marks):
        if not is_actual_question and marks:
            raise serializers.ValidationError(**messages.QUESTION_NOVAL_2)
        if is_actual_question and marks < 0:
            raise serializers.ValidationError(**messages.QUESTION_NOVAL_2)

    def validate_parent(self,val):
        if val and (self.context.get('question_set') != val.question_set):
            raise serializers.ValidationError(**messages.QUESTION_NOVAL_3)
        return val

    def validate_subpart_no(self, val):
        if int(val)<0:
            raise serializers.ValidationError(**messages.ASSIGNMENT_NOVAL_2)
        return val


    def unique_validate(self,parent_id, subpart_no, question_set_id,question_title):

        if Question.objects.filter(parent__id = parent_id, subpart_no = subpart_no, question_set__id = question_set_id).exists():
            raise serializers.ValidationError(**messages.QUESTION_NODUP_1)
        if Question.objects.filter(title = question_title, question_set__id = question_set_id).exists():
            raise serializers.ValidationError(**messages.QUESTION_NODUP_2)



    def validate(self,attrs):
        marks  = attrs.get('marks',0)
        is_actual_question = attrs.get('is_actual_question',None)
        self._validate_is_actual_question(is_actual_question, marks)
        val1 = attrs.get('parent',None)
        if val1:
            val1 = val1.id
        val2 = attrs.get('subpart_no',None)
        question_title = attrs.get('title',None)
        question_set = self.context.get('question_set')
        question_set_id = None
        if question_set:
            question_set_id = question_set.id
        self.unique_validate(val1,val2,question_set_id,question_title)
        return attrs


    class Meta:
        model = Question
        fields = ('subpart_no','title','type','file_page','file_cords','text','difficulty_level','marks','solution_list'
                  ,'is_autograded','parent','grading_duty_scheme','is_actual_question','topics', 'options')

    def create(self, validated_data):
        topics  = validated_data.pop('topics')
        validated_data['question_set'] = self.context.get('question_set')
        question = Question(**validated_data)
        question.save()
        for t in topics:
            topic = Topic.objects.get(id = t)
            QuestionHasTopics.objects.create(question=question, topic=topic)

        # update parent question fields like is_actual_question,marks in question tree
        update_questiontree_on_insertion(question)
        update_questionset_marks(question)
        return question

class QuestionEditSerializer(serializers.ModelSerializer):
    topics  = serializers.ListField(child=serializers.IntegerField(),default=[])

    def validate_marks(self,val):
        if val<0:
            raise serializers.ValidationError(**messages.ASSIGNMENT_NOVAL_1)
        return val

    def validate_subpart_no(self, val):
        if int(val)<0:
            raise serializers.ValidationError(**messages.ASSIGNMENT_NOVAL_2)
        return val

    def _validate_is_actual_question(self, is_actual_question, marks):
        if not is_actual_question and marks<0:
            raise serializers.ValidationError(**messages.QUESTION_NOVAL_2)

    def validate_question_details(self,question_type,question_text,question_options):
        if not question_type:
            raise serializers.ValidationError(**messages.QUESTION_TYPE_NOEXIST_1)
        else:
            if question_type not in ('MCQCB', 'MCQRB', 'TXT'):
                raise serializers.ValidationError(**messages.QUESTION_TYPE_NOEXIST_2)
        if not question_text:
            raise serializers.ValidationError(**messages.QUESTION_TEXT_NOEXIST_1)
            return
        if not question_options:
            raise serializers.ValidationError(**messages.QUESTION_OPTIONS_NOEXIST_1)
        else:
            if question_type not in ('TXT'):
                base64_bytes = question_options.encode('ascii')
                message_bytes = base64.b64decode(base64_bytes)
                message = message_bytes.decode('ascii')
                optionarray = json.loads(message)
                count = 0
                for options in optionarray:
                    if options['is_Correct'] == "":
                        count = count + 1
                    if options['is_Correct'] == False:
                        count = count + 1
                    if options['labelText'] == "":
                        raise serializers.ValidationError(**messages.LABEL_TEXT_NOEXIST_1)
                        return
                    if options['optionText'] == "":
                        raise serializers.ValidationError(**messages.OPTION_TEXT_NOEXIST_1)
                        return
                if count == len(optionarray):
                    raise serializers.ValidationError("At least one correct option should be marked")
                if len(optionarray) < 2 and question_type == 'MCQRB':
                    raise serializers.ValidationError("At least two valid options for the Multiple Choice Single Answer question should be provided")
                if len(optionarray) < 1 and question_type == 'MCQCB':
                    raise serializers.ValidationError("At least one valid option for the Multiple Choice Multiple Answer question should be provided")
            else:
                base64_bytes = question_options.encode('ascii')
                message_bytes = base64.b64decode(base64_bytes)
                message = message_bytes.decode('ascii')
                if message == "" :
                    raise serializers.ValidationError(**messages.QUESTION_OPTIONS_NOEXIST_2)


    def _validate_solution_list(self, solution_list, q_type):
        if q_type != '1':
            return
        solution_list = solution_list.upper()
        # print('--------------------')
        # print(' upper solution_list =', solution_list)
        # print('--------------------')
        solutions = solution_list.split(',')
        for s in solutions:
            # print(s)
            if s not in ['T', 'F']:
                raise serializers.ValidationError(**messages.QUESTION_NOVAL_4)

    def unique_validate(self, val1, val2, question_set_id):
        if ((val1 is not None and self.instance.parent_id != val1) or (val2 is not None and self.instance.subpart_no != val2 ))\
                and Question.objects.filter(parent__id = val1, subpart_no = val2, question_set__id = question_set_id).exists():
            raise serializers.ValidationError(**messages.QUESTION_NODUP_1)



    def validate(self,attrs):
        marks  = attrs.get('marks',0)
        is_actual_question = attrs.get('is_actual_question',None)
        self._validate_is_actual_question(is_actual_question, marks)
        val1 = attrs.get('parent',None)
        if val1:
            val1 = val1.id
        val2 = attrs.get('subpart_no',None)
        question_set = self.context.get('question_set')
        question_set_id = None
        if question_set:
            question_set_id = question_set.id
        self.unique_validate(val1,val2,question_set_id)

        question_type = attrs.get('type')
        question_text = attrs.get('text')
        question_options = attrs.get('options')
        self.validate_question_details(question_type, question_text, question_options)
        is_autograded =attrs.get('is_autograded',None)
        # print('--------------------')
        # print('is autograded =', is_autograded)
        # print('--------------------')
        if is_autograded:
            solution_list = attrs.get('solution_list','')
            question_type = attrs.get('type',None)
            # print('--------------------')
            # print(' solution_list =', solution_list , ', type =',question_type)
            # print('--------------------')
            self._validate_solution_list(solution_list, question_type)
        return attrs


    class Meta:
        model = Question
        fields = ('subpart_no','title','type','file_page','file_cords','text','difficulty_level','marks','solution_list'
                  ,'is_autograded','parent','grading_duty_scheme','is_actual_question','topics', 'options')


    def update(self, instance, validated_data):
        topics = validated_data.pop('topics')
        old_parent = instance.parent
        old_marks = instance.marks
        if instance.parent and validated_data['parent'] and instance.parent != validated_data['parent']:
            update_questiontree_marks_on_deletion(instance)
            validated_data['parent'] = Question.objects.get(id = validated_data['parent'].id)
        question = super().update(instance, validated_data)
        if topics:
            q_h_t = QuestionHasTopics.objects.filter(question__id =question.id)
            q_h_t.delete()
            for t in topics:
                topic = Topic.objects.get(id=t)
                QuestionHasTopics.objects.create(question=question, topic=topic)

        #update all parent marks in question tree if parent changed
        if old_parent and validated_data['parent'] and old_parent != validated_data['parent']:
            update_questiontree_on_insertion(question)
        else:
            update_question_marks(question, old_marks, question.marks)
        update_questionset_marks(question)

        return question