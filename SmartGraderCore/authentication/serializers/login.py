from rest_framework import serializers

from authentication.utils import authenticate
from helper import exceptions as exceptions, messages


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField()

    def _validate_user(self, username, password):
        user = None
        if username and password:
            user = authenticate(username=username, password=password)
        else:
            raise exceptions.ValidationException(**messages.AUTH_NOVAL_1)
        return user

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        user = self._validate_user(username, password)

        if user:
            if not user.is_active:
                raise exceptions.ValidationException(**messages.AUTH_NOACTIVE_1)
        else:
            raise exceptions.KeyException()

        attrs['user'] = user
        return attrs