import csv
from django.http import Http404
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from authentication.models import UserHasCourses, Course
from rest_framework.views import APIView
from helper import messages
from coursemanager.serializers.enrollment import *
from helper.utils import send_multiple_mail

from authentication.decorator import csrf_protection, authentication
from django.utils.decorators import method_decorator


class EnrollmentList(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    parser_classes = (MultiPartParser,)

    def get(self, request, course_id):
        # since the softdelete library doesn't consider the deleted rows of m2m relationship table
        # so we need to consider that by using raw sql queries
        enrollments = Enrollment.objects.all()
        serializer = EnrollmentViewSerializer(enrollments, many=True)
        return Response({"enrollments":serializer.data})

    def post(self, request, course_id):
        if not Course.objects.filter(id = course_id).exists():
            raise serializers.ValidationError(messages.AUTH__COURSE_NOVAL_1)
        if not 'enrollment_file' in request.FILES:
            raise serializers.ValidationError(messages.COURSE__MANAGER_ENROLLMENT_FILE_NOVAL)

        file = request.FILES['enrollment_file']
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)
        data_list = list(reader)
        data = list()

        #create data
        for e in data_list:
            enroll= {}
            enroll['user'] = {'username': e['username'], 'first_name': e['first_name'], 'last_name': e['last_name'],
                              'email': e['email']}
            enroll['role'] = {'name': e['role_name']}
            sec_list = list()
            sections = e['sections'].split('|')
            for s in sections:
                sec_list.append({'name': s})
            enroll['sections'] = sec_list
            data.append(enroll)
        context = {'course_id':course_id}
        serializer = EnrollmentCreateSerializer(data=data, many=True, context=context)
        serializer.is_valid(raise_exception=True)
        enrollments_data = serializer.save()
        enrollments = list()
        email_data = list()
        for dt in enrollments_data:
            enrollments.append(dt['enrollment'])
            if dt['email_details'] is not None:
                email_data.append(dt['email_details'])
        email_data = tuple(email_data)
        send_multiple_mail(email_data)
        ser = EnrollmentViewSerializer(enrollments,many=True)
        return Response({'enrollments': ser.data}, status=status.HTTP_200_OK)


class EnrollmentDetail(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def revoke_access_for_course(self,course_id,enrollment_id, session_id):
        uhc = UserHasCourses.objects.get(enrollment_id = enrollment_id,course_id = course_id)
        user_id = uhc.user_id
        uhc.delete()
        if session_id :
            update_course_details_in_cache(session_id, user_id)

    def get_object(self, pk):
        try:
            return Enrollment.objects.get(pk=pk)
        except Enrollment.DoesNotExist:
            raise Http404

    def get(self,  request, course_id, enrollment_id):
        enrollment = self.get_object(enrollment_id)
        serializer = EnrollmentViewSerializer(enrollment)
        return Response({'enrollment':serializer.data})

    def put(self, request, course_id, enrollment_id):
        enrollment = self.get_object(enrollment_id)
        serializer = EnrollmentEditSerializer(enrollment, data=request.data)
        serializer.is_valid(raise_exception=True)
        enrollment = serializer.save()
        ser = EnrollmentViewSerializer(enrollment)
        return Response({'enrollment':ser.data},status=status.HTTP_200_OK)

    def delete(self, request, course_id, enrollment_id):
        enrollment = self.get_object(enrollment_id)
        enrollment.delete()
        #delete this enrollment from user_has_courses table and update cache
        self.revoke_access_for_course(course_id,enrollment_id,enrollment.user.session_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
