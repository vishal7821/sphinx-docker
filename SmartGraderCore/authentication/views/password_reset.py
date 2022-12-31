from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.decorator import csrf_protection
from authentication.serializers.password_reset \
    import (PasswordResetSerializer, PasswordResetConfirmSerializer)


class PasswordResetView(APIView):
    """
    Accepts the following POST parameters: email
    Returns the success/fail message.
    """

    # @method_decorator(csrf_protection)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        # Create a serializer with request.data
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Return the success message with OK HTTP status
        return Response(
            {"detail": "Password reset e-mail has been sent."},
            status=status.HTTP_200_OK
        )

class PasswordResetConfirmView(APIView):
    """
    Accepts the following POST parameters: token, uid,
        new_password1, new_password2
    Returns the success/fail message.
    """

    @method_decorator(csrf_protection)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def put(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(serializer.validated_data['new_password_1'])
        return Response(
            {"detail": "Password has been reset with the new password."}
        )
