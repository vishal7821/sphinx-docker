from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
import simplejson as json
import logging
from django.conf import settings
from rest_framework import generics
from .serializers import UserSerializer
from django.contrib.auth.models import User
from rest_framework import permissions

# Create your views here.
logger = logging.getLogger(__name__)


@csrf_exempt
def login(request):
    print("into functionc")
    data = json.loads(request.body)
    username = data['username']
    password = data['password']
    if username == 'hello' and password == 'world':
        print("username")
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


class UserList(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = User.objects.all()
    serializer_class = UserSerializer

'''
from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
import simplejson as json
import logging
from django.conf import settings

# Create your views here.
logger = logging.getLogger(__name__)


@csrf_exempt
def login(request):
    data = json.loads(request.body)
    username = data['username']
    password = data['password']
    session_id = request.COOKIES.get('sessionid', None)
    print(username)
    print(password)
    print(request.COOKIES)
    if session_id is None:
        return JsonResponse({"status": "failure", "message": "unauthorized access"})
    if username == 'hello' and password == 'world':
        new_dict = {'login_bit': 1}
        cache.set(session_id , new_dict)
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)
'''

