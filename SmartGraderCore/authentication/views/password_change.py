from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.decorator import csrf_protection, authentication
from authentication.serializers.password_change \
    import (PasswordChangeSerializer)
from authentication.utils import get_user, get_user_data_from_cache
from helper import messages
class PasswordChangeView(APIView):
    """
    Calls Django Auth SetPasswordForm save method.

    Accepts the following POST parameters: new_password1, new_password2
    Returns the success/fail message.
    """

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)


    def post(self, request):
        user = get_user('id',get_user_data_from_cache(request,'id'))
        serializer = PasswordChangeSerializer(data=request.data,context={'request': request,'user':user})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(messages.AUTH__PASSWORD_CHNANGE_SUCCESS)
