import logging

from django.http import HttpResponseForbidden, HttpResponse
from django.utils.deprecation import MiddlewareMixin
from django.utils.log import log_response

from authentication.utils import get_user_data_from_cache
from helper import constants, messages
from django.conf import settings

logger = logging.getLogger('django.security.authentication')


class HttpResponseUnAuthorized(HttpResponse):
    status_code = 401



class AuthenticationMiddleware(MiddlewareMixin):

    def _accept(self, request):
        return None


    def _reject(self, request, reason):
        response = HttpResponseUnAuthorized(reason)
        log_response(
            'UnAuthorized (%s): %s', reason, request.path,
            response=response,
            request=request,
            logger=logger,
        )
        return response

    # (constants.USER_LOGGEDIN_BIT_CACHE_KEY in request.session and \
    #  request.session[constants.USER_LOGGEDIN_BIT_CACHE_KEY] == 1)

    def process_view(self, request, view_func, view_args, view_kwargs):
        view_name = '.'.join((view_func.__module__, view_func.__name__))
        exclusion_set = getattr(settings, 'EXCLUDE_FROM_MY_MIDDLEWARE', set())
        if view_name in exclusion_set:
            return None
        elif request.session.get(constants.USER_LOGGEDIN_BIT_CACHE_KEY) == 1 :
            if get_user_data_from_cache(request,'is_active'):
                return self._accept(request)
            return self._reject(request,messages.AUTH_NOLOGIN_2)
        return self._reject(request,messages.AUTH_NOLOGIN_1)