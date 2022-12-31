from django.utils.decorators import decorator_from_middleware
from authentication.csrf_middleware import CsrfValidationMiddleware
from authentication.authentication_middleware import AuthenticationMiddleware
from authentication.authorization_middleware import AuthorizationMiddleware

csrf_protection = decorator_from_middleware(CsrfValidationMiddleware)
csrf_protection.__name__ = "csrf_protection"
csrf_protection.__doc__ = """
This decorator adds CSRF protection in exactly the same way as
CsrfViewMiddleware, but it can be used on a per view basis.  Using both, or
using the decorator multiple times, is harmless and efficient.
"""


authentication = decorator_from_middleware(AuthenticationMiddleware)
authentication.__name__ = "authentication"
authentication.__doc__ = """
This decorator adds authentication exactly same as middleware
"""


authorization = decorator_from_middleware(AuthorizationMiddleware)
authorization.__name__ = "authorization"
authorization.__doc__ = """
This decorator adds authorization exactly same as middleware
"""