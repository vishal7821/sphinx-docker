from rest_framework import serializers

from authentication.models import User
from authentication.serializers.course import CourseSerializer

class AccountViewSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField(max_length=100)
    roll_no = serializers.CharField(max_length=100,required=False,allow_null=True)
    first_name = serializers.CharField(max_length=100,required=False,allow_null=True)
    last_name = serializers.CharField(max_length=100,required=False,allow_null=True)
    email = serializers.EmailField(max_length=100,required=False,allow_null=True)
    department = serializers.CharField(max_length=100,required=False,allow_null=True)
    program = serializers.CharField(max_length=100,required=False,allow_null=True)
    last_login = serializers.DateTimeField(required=False,allow_null=True)
    last_login_ip = serializers.IPAddressField(allow_null=True,required=False)
    courses = CourseSerializer(many=True)



class AccountEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email','department','program')
