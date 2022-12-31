from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.crypto import (
    constant_time_compare, get_random_string, )
from rest_framework import serializers
from helper import messages
from authentication.models import User
from authentication.utils import get_user, clear_old_session_in_memcached


class PasswordResetSerializer(serializers.Serializer):
    """
    Serializer for requesting a password reset e-mail.
    """
    username = serializers.CharField(max_length=128)

    def validate_username(self, value):
        self.user = get_user('username',value)
        if not self.user:
            raise serializers.ValidationError(**messages.AUTH_USER_NOUSER,)
        return value

    def save(self):
        subject = settings.PASSWORD_RESET_SUBJECT
        token = get_random_string()
        body = settings.PASSWORD_RESET_BODY+"\n User ID: "+self.user.username+"\n Token: "+token
        to_email = self.user.email
        email_message = EmailMultiAlternatives(subject, body, None, [to_email])
        email_message.send()
        self.user.password_reset_token = token
        # #clear memcache
        # clear_old_session_in_memcached(self.user)
        # #clear previous valid session
        # self.user.is_logged_in = False
        # self.user.session_id = None
        self.user.save()




class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for requesting a password reset e-mail.
    """
    new_password_1 = serializers.CharField(max_length=128)
    new_password_2 = serializers.CharField(max_length=128)
    username = serializers.CharField(max_length=100)
    token = serializers.CharField(max_length=100)


    def validate(self, attrs):

        try:
            username = attrs['username']
            self.user = get_user('username',username)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError(messages.AUTH_USER_NOUSER)


        if not constant_time_compare(self.user.password_reset_token,attrs['token']):
            raise serializers.ValidationError(messages.AUTH_NOKEY_1)

        if attrs['new_password_1'] != attrs['new_password_2']:
            raise serializers.ValidationError(messages.AUTH_PASSWORD_UNMATCH)
        return attrs

    def save(self,value):
        self.user.set_password(value)
        self.user.password_reset_token = ""
        # clear memcache
        clear_old_session_in_memcached(self.user)
        # clear previous valid session
        self.user.is_logged_in = False
        self.user.session_id = None
        self.user.save()
