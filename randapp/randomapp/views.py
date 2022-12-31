from django.http import JsonResponse
from django.shortcuts import render
import random
from django.core.cache import cache
from django.views.decorators.csrf import csrf_exempt
import simplejson as json


# Create your views here.

@csrf_exempt
def random_no(request):
    print("into random function")
    data = json.loads(request.body)
    return JsonResponse({"randomno": random.randint(1000, 100000),"user data:": data['userdata'],"status": "success"})


'''
    def random_no(request):
    session_id = request.COOKIES.get('sessionid', None)
    print(session_id)
    if session_id is None:
        return JsonResponse({"status": "failure", "message": "unauthorized access"})
    session = cache.get(session_id, None)
    if session is None:
        return JsonResponse({"status": "unauthorized access","reason":"session Id not found", "sessionid":session_id})
    if session['login_bit'] == 1:
        return JsonResponse({"randomno": random.randint(1000, 100000), "sessionid": session_id,"status": "success"})
    else:
        return JsonResponse({"status": "unauthorized access"})
'''
