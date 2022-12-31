from rest_framework import serializers

from eventmanager.models import *
from eventmanager.serializers.subevent import *



class SubmissionGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionGroup
        fields = ('id', 'access_code_gold', 'access_code_submitted', 'is_late_submission', 'chosen_question_set_id',
                  'enrollments')
        depth = 1




class AllSubmissionsSerializer(serializers.Serializer):
    subevent = SubeventViewSerializer()
    submissiongroups = SubmissionGroupSerializer(many=True)