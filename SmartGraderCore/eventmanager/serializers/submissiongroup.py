from rest_framework import serializers

from eventmanager.models import *


class SubmissionGroupSerializer(serializers.ModelSerializer):


    class Meta:
        model = SubmissionGroup
        fields = '__all__'


