import json
from eventmanager.utils import *

class MyGradingDutiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradingDuty
        fields = '__all__'
        depth = 4

class GradingDutyHasRubricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradingdutyHasRubrics
        fields = '__all__'

class SubmissionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionResponse
        fields = '__all__'

class RubricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rubric
        fields = '__all__'

class MyGradingDutyDetailSerializer(serializers.Serializer):
    gradingduty = MyGradingDutiesSerializer()
    gradingduty_has_rubrics  = GradingDutyHasRubricsSerializer(many=True)
    response = SubmissionResponseSerializer()
    question_rubrics = RubricSerializer(many = True)

class MyGradingDutySerializer(serializers.ModelSerializer):
    class Meta:
        model = GradingDuty
        fields = '__all__'
        # depth = 4
class GDAndRubricSerializer(serializers.Serializer):
    gd = MyGradingDutySerializer()
    gradingduty_has_rubrics = GradingDutyHasRubricsSerializer(many=True)

class MyReGradingDutyDetailSerializer(serializers.Serializer):
    gradingduty = MyGradingDutySerializer()
    gradingduty_has_rubrics  = GradingDutyHasRubricsSerializer(many=True)
    response = SubmissionResponseSerializer()
    question_rubrics = RubricSerializer(many = True)
    prev_gradingduties = GDAndRubricSerializer(many=True)



class GradingDutyUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = GradingDuty
        fields = ('grader_comment', 'marks_adjustment', 'is_completed')


    def update(self, instance, validated_data):
        subevent = self.context.get('subevent')
        end_time = subevent.end_time
        now = datetime.datetime.now(timezone.utc)

        if not (now <= end_time):
            validated_data['is_late_grading'] =True

        #recompute aggregated marks and set dirty bit to 0

        validated_data['is_aggregate_marks_dirty'] = False
        validated_data['aggregate_marks'] = recompute_aggregate_marks(instance.id , validated_data.get('marks_adjustment',None) )
        grading_duty = super().update(instance, validated_data)
        return grading_duty


#MyMarks Serializers
class MyMarksGradingDutySerializer(serializers.ModelSerializer):
    class Meta:
        model = GradingDuty
        exclude = ('grader','is_late_grading','is_aggregate_marks_dirty',)

class MyMarksSerializer(serializers.Serializer):
    gradingduty = MyMarksGradingDutySerializer()
    gradingduty_has_rubrics  = GradingDutyHasRubricsSerializer(many=True)
    question_rubrics = RubricSerializer(many = True)


class MySubmissionGDutiesSerializer(serializers.Serializer):
    gradingduty = MyMarksGradingDutySerializer()
    gradingduty_has_rubrics  = GradingDutyHasRubricsSerializer(many=True)

class RegradingMessageSerializer(serializers.Serializer):
    seq_id = serializers.IntegerField(required=False,allow_null=True)
    sender = serializers.CharField(max_length=500,required=False)
    message = serializers.CharField(max_length=500,required=False)

class MySubmissionMarksSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False,allow_null=True)
    title = serializers.CharField(max_length=500,required=False)
    marks = serializers.IntegerField(required=False,allow_null=True)
    upload_page_no = serializers.IntegerField(required=False,allow_null=True)
    rubrics = RubricSerializer(many = True)
    grading_duties = MySubmissionGDutiesSerializer(many=True)
    regrading_duty = MySubmissionGDutiesSerializer(allow_null=True)
    regrading_messages = RegradingMessageSerializer(many = True, allow_null = True)
    text = serializers.CharField(max_length=500,required=False)
    options = serializers.CharField(max_length=500, required=False)
    type = serializers.CharField(max_length=500, required=False)


class MyGDDataSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False,allow_null=True)
    is_completed = serializers.BooleanField(required=False)
    aggregate_marks = serializers.IntegerField(required=False,allow_null=True)
    grp_member_names =  serializers.CharField(max_length=500,required=False)
    grp_id = serializers.IntegerField(required=False,allow_null=True)
    question_id =serializers.IntegerField(required=False,allow_null=True)
    question_title = serializers.CharField(max_length=500,required=False)
    question_marks = serializers.IntegerField(required=False,allow_null=True)
    qset_id = serializers.IntegerField(required=False,allow_null=True)
    qset_name = serializers.CharField(max_length=500,required=False)
    question_type = serializers.CharField(max_length=500,required=False)
    question_options = serializers.CharField(max_length=500,required=False)
    question_text = serializers.CharField(max_length=500,required=False)

