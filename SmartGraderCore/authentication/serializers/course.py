from rest_framework import serializers

from authentication.models import Course

class CourseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField(max_length=100,required=False,allow_null=True)
    enrollment_role_id=  serializers.CharField(max_length=100,required=False,allow_null=True)
    enrollment_section_list =  serializers.CharField(max_length=100,required=False,allow_null=True)

