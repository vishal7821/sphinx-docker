from django.http import Http404
from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from coursemanager.models import Role , Enrollment
from coursemanager.serializers.role import RoleEditSerializer, RoleViewSerializer
from authentication.decorator import csrf_protection, authentication
from django.utils.decorators import method_decorator
from helper import exceptions , messages

class RoleList(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get(self, request, course_id):
        roles = Role.objects.all()
        serializer = RoleViewSerializer(roles, many=True)
        return Response(serializer.data)

    def post(self,request, course_id):
        serializer = RoleEditSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = serializer.save()
        view_serializer = RoleViewSerializer(role)
        return Response(view_serializer.data, status=status.HTTP_201_CREATED)


#todo : do validations
#todo : permissions
class RoleDetail(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_object(self, pk):
        try:
            return Role.objects.get(pk=pk)
        except Role.DoesNotExist:
            raise exceptions.AccessException()

    def get_enrollments_with_role(self,role_id):
        return Enrollment.objects.filter(role_id = role_id)

    def put(self, request, course_id, role_id):
        role = self.get_object(role_id)
        serializer = RoleEditSerializer(role, data=request.data)
        serializer.is_valid(raise_exception=True)
        role  = serializer.save()
        view_serializer = RoleViewSerializer(role)
        return Response({'data':view_serializer.data},status=status.HTTP_200_OK)

    def delete(self, request, course_id, role_id):
        role = self.get_object(role_id)
        if self.get_enrollments_with_role(role_id).exists():
            raise serializers.ValidationError(messages.ROLE_NODEL_1)
        role.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

