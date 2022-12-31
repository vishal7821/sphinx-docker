from rest_framework.exceptions import APIException
from rest_framework import status
from django.utils.translation import ugettext_lazy as _
from django.utils.encoding import force_text


#these can be handled by built in validation error
# NOKEY , NOUSER, NOVAL , NOEXIST,

class ValidationException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('input is invalid')
    default_code = 'NOVAL'

class UserException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('username is wrong or user does not exist - please try again')
    default_code = 'NOUSER'

class KeyException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('the key/password you entered is wrong - please try again')
    default_code = 'NOKEY'

class AccessException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _(' the resource you are trying to access or modify either does not exist or has been deleted. '
                       'Please check again and contact the instructor if you feel this is an error')
    default_code = 'NOEXIST'

class DuplicateEntryException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('You are trying to create a duplicate entry,It\'s not allowed')
    default_code = 'NODUP'


class LoginError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('Requested operation requires login - please login into your account first')
    default_code = 'NOLOGIN'


class CsrfError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('Requested operation requires a valid access token - your token seems to be old - please refresh this page to obtain a new valid token and try again')
    default_code = 'NOCSRF'

class PermissionError(APIException):
    status_code =  status.HTTP_401_UNAUTHORIZED
    default_detail = _('You do not have permission to perform the requested operation - please contact the instructor if you feel this is an error')
    default_code = 'NOACCESS'

class EventError(APIException):
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = _(
        'There is no event going on at the moment that permits this action - please contact the instructor if you feel this is an error')
    default_code ='NOEVENT'

class BlockError(APIException):
    status_code = status.HTTP_204_NO_CONTENT
    default_detail = _('Due to a blocking examination event going on at the moment, access to other events has been temporarily blocked. You will regain access to these events after this blocking event is over')
    default_code = 'BLOCK'

class MiscError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'unknown reason for failure - please try after some time or else contact the admin or the instructor'
    default_code = 'MISC_ERROR'
