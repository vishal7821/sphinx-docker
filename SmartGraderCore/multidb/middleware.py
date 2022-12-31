import threading
from django.http import Http404

request_cfg = threading.local()

class MultiDbRouterMiddleware(object):
    """
    The Multidb router middelware.

    he middleware process_view (or process_request) function sets some context
    from the URL into thread local storage, and process_response deletes it. In
    between, any database operation will call the router, which checks for this
    context and returns an appropriate database alias.

    Add this to your middleware, for example:

    MIDDLEWARE_CLASSES += ['multidb.middleware.MultiDbRouterMiddleware',]
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_view(self, request, view_func, args, kwargs):
        if 'course_id' in kwargs:
            request_cfg.db = kwargs['course_id']+'_db'

    def process_response(self, request, response):
        if hasattr(request_cfg, 'db'):
            del request_cfg.db
        return response


