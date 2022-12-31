from django.http import Http404
from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from coursemanager.serializers.section import SectionViewSerializer,SectionEditSerializer
from coursemanager.models import Section , Enrollment
#EnrollmentHasSection
from authentication.decorator import csrf_protection, authentication
from django.utils.decorators import method_decorator
from helper import exceptions
from helper import messages , raw_sql_queries

class SectionList(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get(self, request, course_id):
        sections = Section.objects.all()
        serializer = SectionViewSerializer(sections, many=True)
        return Response({'data':serializer.data})

    def post(self,request, course_id):
        serializer = SectionEditSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        section = serializer.save()
        ser = SectionViewSerializer(section)
        return Response({'data':ser.data}, status=status.HTTP_201_CREATED)


class SectionDetail(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_object(self, pk):
        try:
            return Section.objects.get(pk=pk)
        except Section.DoesNotExist:
            raise exceptions.AccessException()

    def get_enrollment_has_section(self,section_id):
        return Enrollment.objects.filter(sections__id = section_id)

    def put(self, request, course_id, section_id):
        section = self.get_object(section_id)
        serializer = SectionEditSerializer(section, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        serializer = SectionViewSerializer(section)
        return Response({'data':serializer.data})

    def delete(self, request, course_id, section_id):
        section = self.get_object(section_id)
        db_alias = section._state.db
        #check if enrollment has section can have entries for this secion
        #enrollments = raw_sql_queries.get_section_enrollments(section_id,db_alias)
        if self.get_enrollment_has_section(section_id).exists():
            raise serializers.ValidationError(messages.SECTION_NODEL_1)
        section.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
