from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.models import Course
from helper.exceptions import AccessException
from coursemanager.serializers.course import CourseViewSerializer
from helper.utils import get_courses_details_from_cache
from authentication.decorator import csrf_protection, authentication
from django.utils.decorators import method_decorator


# todo: handle permissions
class CourseList(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get(self, request):
        course = get_courses_details_from_cache(request)
        return Response({'courses': course}, status=status.HTTP_200_OK)



class CourseDetail(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_object(self, pk):
        try:
            return Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            raise AccessException(detail="Course doesn't exists")

    def get(self, request, course_id):
        course = self.get_object(course_id)
        serializer = CourseViewSerializer(course)
        return Response(serializer.data)

    def put(self, request, course_id):
        course = self.get_object(course_id)
        serializer = CourseViewSerializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"data": serializer.data}, status = status.HTTP_200_OK)
