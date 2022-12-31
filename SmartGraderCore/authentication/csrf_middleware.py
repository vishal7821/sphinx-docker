import logging
from django.utils.log import log_response
from django.urls import get_callable
from django.conf import settings
from django.core.exceptions import DisallowedHost, ImproperlyConfigured
from django.utils.crypto import constant_time_compare, get_random_string
from django.utils.deprecation import MiddlewareMixin


logger = logging.getLogger('django.security.csrf')
CSRF_SESSION_KEY = '_csrftoken'
REASON_BAD_TOKEN = "CSRF token missing or incorrect."



def _get_failure_view():
    """Return the view to be used for CSRF rejections."""
    return get_callable(settings.CSRF_FAILURE_VIEW)


class CsrfValidationMiddleware(MiddlewareMixin):

    def _accept(self, request):
        # Avoid checking the request twice by adding a custom attribute to
        # request.  This will be relevant when both decorator and middleware
        # are used.
        return None

    def _reject(self, request, reason):
        response = _get_failure_view()(request, reason=reason)
        log_response(
            'Forbidden (%s): %s', reason, request.path,
            response=response,
            request=request,
            logger=logger,
        )
        return response

    def _get_token(self, request):
        try:
            return request.session.get(CSRF_SESSION_KEY)
        except AttributeError:
            raise ImproperlyConfigured(
                'request.session is not '
                'set. SessionMiddleware must appear before CsrfViewMiddleware '
                'in MIDDLEWARE%s.' % ('_CLASSES' if settings.MIDDLEWARE is None else '')
            )

    def process_request(self, request):
        if request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            csrf_token = self._get_token(request)
            request_csrf_token = ""
            if request.method == "POST":
                try:
                    request_csrf_token = request.POST.get('csrfmiddlewaretoken', '')
                except IOError:
                    # Handle a broken connection before we've completed reading
                    # the POST data. process_view shouldn't raise any
                    # exceptions, so we'll ignore and serve the user a 403
                    # (assuming they're still listening, which they probably
                    # aren't because of the error).
                    pass
            if request_csrf_token == "":
                # Fall back to X-CSRFToken, to make things easier for AJAX,
                # and possible for PUT/DELETE.
                request_csrf_token = request.META.get(settings.CSRF_HEADER_NAME, '')
            if not constant_time_compare(request_csrf_token, csrf_token):
                return self._reject(request, REASON_BAD_TOKEN)
        return self._accept(request)