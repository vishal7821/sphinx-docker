from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response

from authentication.utils import _get_new_csrf_string


class CsrfTokenView(APIView):

    def get(self,request):
        csrf_token = ''
        try:
            csrf_token =  request.session.get(settings.CSRF_SESSION_KEY)
            if csrf_token is None:
                csrf_token = _get_new_csrf_string()
                request.session[settings.CSRF_SESSION_KEY] = csrf_token
        except AttributeError:
            raise ImproperlyConfigured(
                'request.session is not set'
            )
        return Response({'csrf_token':csrf_token},status=status.HTTP_200_OK)
