from rest_framework import generics, serializers, status
from rest_framework.response import Response
from authentication.decorator import csrf_protection, authentication
from authentication.models import User
from authentication.serializers.account import (AccountViewSerializer, AccountEditSerializer)
from authentication.serializers.course import CourseSerializer
from authentication.utils import get_user_data_from_cache
from django.utils.decorators import method_decorator
from helper.exceptions import MiscError
from rest_framework.views import APIView
from helper.raw_sql_queries import get_enrollment_courses_permissions_sections , get_role_details
from django.http import Http404
from coursemanager.models import Role




class AccountDetail(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404
    def get(self,request):
            user_id = get_user_data_from_cache(self.request,'id')
            courses_d = get_enrollment_courses_permissions_sections(user_id)
            courses = list(courses_d.values())
            user = self.get_object(user_id)
            serializers = AccountViewSerializer(user)
            returnData = serializers.data
            filteredcourses=[]
            for course in courses:
                role = get_role_details(course.get('enrollment_role_id') , str(course.get('id'))+'_db')
                # print(role)
                # role = Role.objects.get(id = course.get('enrollment_role_id'))

                temp={
                    'course_id' : course.get('id'),
                    'course_name': course.get('name'),
                    'course_title': course.get('title'),
                    'enrollment_role_id': role[0].get('id'),
                    'enrollment_role_name': role[0].get('name'),
                    'enrollment_sectionlist': course.get('enrollment_section_list'),
                    'enrollment_actionlist': course.get('enrollment_action_list'),
                }
                filteredcourses.append(temp)
            courses= {'courses' : filteredcourses }
            returnData.update(courses)
           # serializers.is_valid()
            return Response(data=returnData, status=status.HTTP_201_CREATED)




    def put(self, request):
        user_id = get_user_data_from_cache(self.request,'id')
        user = self.get_object(user_id)
        serializer = AccountEditSerializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

