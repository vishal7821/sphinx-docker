import datetime
import json
import string
from importlib import import_module

from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.utils.crypto import constant_time_compare, get_random_string
from rest_framework import serializers, exceptions

from authentication.models import User
from helper import exceptions, constants, messages
from helper import raw_sql_queries

CSRF_SECRET_LENGTH = 32
CSRF_ALLOWED_CHARS = string.ascii_letters + string.digits


def _get_new_csrf_string():
    return get_random_string(CSRF_SECRET_LENGTH, allowed_chars=CSRF_ALLOWED_CHARS)

def _get_new_random_string():
    return get_random_string(CSRF_SECRET_LENGTH, allowed_chars=CSRF_ALLOWED_CHARS)

def authenticate(username, password):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        raise exceptions.UserException()
    else:
        if check_password(password, user.password):
            return user

def default(o):
    if isinstance(o, (datetime.date, datetime.datetime)):
        return o.isoformat()
    return o.__dict__

def clear_old_session_in_memcached(user):
    old_sess = user.session_id
    engine = import_module(settings.SESSION_ENGINE)
    old_session = engine.SessionStore(old_sess)
    try:
        del old_session[constants.USER_LOGGEDIN_BIT_CACHE_KEY]
    except KeyError:
        pass
    try:
        del old_session[constants.COURSES_CACHE_KEY]
    except KeyError:
        pass
    try:
        del old_session[constants.USER_CACHE_KEY]
    except KeyError:
        pass
    old_session.save()

def update_course_details_in_cache(session_id, user_id):
    engine = import_module(settings.SESSION_ENGINE)
    user_session = engine.SessionStore(session_id)
    # if user session exists in cache then refresh course list
    if user_session.exists(session_id):
        courses_list = raw_sql_queries.get_enrollment_courses_permissions_sections(user_id)
        course_details = json.dumps(courses_list)
        user_session[constants.COURSES_CACHE_KEY] = course_details
        user_session.save()


#You should have a valid session id before calling login
def login(request,user):
    session_key = request.session.session_key
    old_sess = user.session_id
    if request.session.exists(old_sess) and  not constant_time_compare(session_key,old_sess):
        #request.session.delete(old_session)
        engine = import_module(settings.SESSION_ENGINE)
        old_session = engine.SessionStore(old_sess)
        old_session[constants.USER_LOGGEDIN_BIT_CACHE_KEY] = 0
        old_session.save()

    #add course list with enrollment action list and enrollment section list, role id
    courses_list = raw_sql_queries.get_enrollment_courses_permissions_sections(user.id)
    course_details = json.dumps(courses_list)

    request.session[constants.COURSES_CACHE_KEY] = course_details

    # just rotate the session id, the data will be same , new session id will be sent to client
    request.session.cycle_key()
    request.session.modified = True

    # storing current session information in user table
    user.session_id = request.session.session_key
    user.is_logged_in = 1

    # saving data into memcached
    request.session[constants.USER_LOGGEDIN_BIT_CACHE_KEY] = 1
    user_data = {'id':user.id,'is_active':user.is_active,
                 'session_id':user.session_id,'username':user.username}
    user_json = json.dumps(user_data)
    request.session[constants.USER_CACHE_KEY] = user_json

    #clear password_reset_token in user table
    user.password_reset_token = ''
    user.save()

def logout(request):
    id = get_user_data_from_cache(request,'id')
    data = {'is_logged_in':0,'session_id':None}
    update_users_by_id(id,**data)
    #clear_session_data(request)
    request.session.flush()


def clear_session_data(request):
    # this will clear the session without deleting it
    try:
        del request.session[constants.USER_LOGGEDIN_BIT_CACHE_KEY]
    except KeyError:
        pass
    try:
        del request.session[constants.COURSES_CACHE_KEY]
    except KeyError:
        pass
    try:
        del request.session[constants.USER_CACHE_KEY]
    except KeyError:
        pass


def update_users_by_id(user_id, **val):
    user = User.objects.filter(id = user_id)
    user.update(**val)



def get_user_data_from_cache(request,key):
    try:
        user  = json.loads(request.session[constants.USER_CACHE_KEY])
        if user and key in user:
            return user[key]
        raise exceptions.MiscError()
    except KeyError:
        raise exceptions.LoginError()


def get_course_data_from_cache(request,course_id,key):
    try:
        courses  = json.loads(request.session[constants.COURSES_CACHE_KEY])
        course = None
        if courses and course_id in courses:
            course =  courses.get(course_id,None)
        if not course:
            raise serializers.ValidationError(messages.AUTH__COURSE_NOEXIST)
        return course[key]
    except KeyError:
        raise exceptions.LoginError()


def get_user(key,val):
    try:
        data = {key:val}
        return User.objects.get(**data)
    except User.DoesNotExist:
        raise serializers.ValidationError(**messages.AUTH_USER_NOUSER)

