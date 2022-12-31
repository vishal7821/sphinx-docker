from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.decorator import csrf_protection
from authentication.serializers.login \
    import (LoginSerializer)
from authentication.utils import login
from helper.messages import AUTH_SUCCESS_1


# Create your views here.
class LoginView(APIView):
    """
        authenticate username and password
       delete previous sessions and initialize a new session
       in mem-cache
    """


    # @method_decorator(csrf_protection)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    serializer_class = LoginSerializer


    def post(self, request, *args, **kwargs):
        request = request
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return Response(AUTH_SUCCESS_1,status=status.HTTP_200_OK)

