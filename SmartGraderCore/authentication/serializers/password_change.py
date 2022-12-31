from django.contrib.auth.hashers import check_password
from rest_framework import serializers

from authentication.models import User
from authentication.utils import get_user_data_from_cache
from helper import messages


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(max_length=128)
    new_password_1 = serializers.CharField(max_length=128)
    new_password_2 = serializers.CharField(max_length=128)


    def validate_old_password(self, value):
        self.request = self.context['request']
        self.user = self.context['user']
        if not check_password(value, self.user.password):
            raise serializers.ValidationError(messages.AUTH_NOKEY_1)
        return value

    def validate(self,attrs):
        if attrs['new_password_1'] != attrs['new_password_2']:
            raise serializers.ValidationError(messages.AUTH_PASSWORD_UNMATCH)
        return attrs

    def save(self,**kwargs):
        self.user.set_password(self.validated_data['new_password_1'])
        self.user.save()
