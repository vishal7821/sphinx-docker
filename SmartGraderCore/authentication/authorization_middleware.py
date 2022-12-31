# TODO implement permission checking

import logging
import re

from django.http import HttpResponseNotAllowed, HttpResponse
from django.utils.log import log_response
from django.urls import get_callable
from django.conf import settings
from django.core.exceptions import DisallowedHost, ImproperlyConfigured
from django.utils.crypto import constant_time_compare, get_random_string
from django.utils.deprecation import MiddlewareMixin
from helper import constants, exceptions,messages
from django.http import HttpResponseForbidden
from authentication.utils import get_user_data_from_cache, get_course_data_from_cache

logger = logging.getLogger('django.security.authorization')
REASON_BAD_TOKEN = "you are not authorized to perform requested action."

class HttpResponseUnAuthorized(HttpResponse):
    status_code = 401

class AuthorizationMiddleware(MiddlewareMixin):

    def _accept(self, request):
        return None

    def _reject(self, request, reason):
        response = HttpResponseUnAuthorized(reason)
        log_response(
            'Forbidden (%s): %s', reason, request.path,
            response=response,
            request=request,
            logger=logger,
        )
        return response
    def process_request(self, request):
        # Todo : check permissions for the view
        # print(request)
        return self._accept(request)

    def process_view(self, request, view_func, view_args, view_kwargs):
        view_name = '.'.join((view_func.__module__, view_func.__name__))
        exclusion_set = getattr(settings, 'EXCLUDE_FROM_AUTHR_MIDDLEWARE', set())
        if view_name in exclusion_set:
            return None


        request_url = request.path
        request_method = request.method
        req_url = request_url + request_method + '/'

        res = -1
        # print('-------------------------------------')
        # print('Requested URL=',req_url)
        # print('-------------------------------------')
        for i in range(len(constants.COURSE_URLS)):
            match_res = re.fullmatch(constants.COURSE_URLS[i], req_url)
            if(match_res):
                res=i
                break
        if res==-1:
            # print('AAAAAAA:url is not matched')
            return self._reject(request, messages.AUTHR_NOVAL_2)
        course_id = view_kwargs.get('course_id',None)
        if(course_id == None):
            return self._reject(request, messages.AUTH__COURSE_NOVAL_1)
        user_action_list = get_course_data_from_cache(request,course_id, 'enrollment_action_list')

        # if res >= len(user_action_list):
        #     return self._reject(request, messages.AUTHR_NOVAL_2)
        if res < len(user_action_list):
            if user_action_list[res] == '0':
                # print('BBBBB:user dont have permission')
                return self._reject(request, messages.AUTHR_NOVAL_2)
        return self._accept(request)

