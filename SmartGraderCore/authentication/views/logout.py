from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.decorator import csrf_protection, authentication
from authentication.utils import logout


class LogoutView(APIView):
    """
    delete the session
    assigned to the current User object.

    Accepts/Returns nothing.
    """

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response({"detail": "Successfull logout."},
                        status=status.HTTP_200_OK)

