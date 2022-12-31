from PIL import Image
from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from assignmentmanager.models import Assignment
from assignmentmanager.serializers.assignment import AssignmentsViewSerializer,AssignmentViewSerializer, AssignmentCreateSerializer,AssignmentEditSerializer

Image.MAX_IMAGE_PIXELS = None

from authentication.decorator import csrf_protection, authentication
from django.utils.decorators import method_decorator


class AssignmentList(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get(self, request, course_id):
        assignments = Assignment.objects.all()
        serializer = AssignmentsViewSerializer(assignments, many=True)
        return Response({"assignments":serializer.data})

    def post(self,request, course_id):
        serializer = AssignmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment  = serializer.save()
        ser = AssignmentViewSerializer(assignment)
        return Response({'assignment':ser.data}, status=status.HTTP_201_CREATED)


class AssignmentDetail(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_object(self, pk):
        try:
            return Assignment.objects.get(pk=pk)
        except Assignment.DoesNotExist:
            raise Http404

    def get(self,request,course_id,assignment_id):
        assignment = self.get_object(assignment_id)
        serializer = AssignmentViewSerializer(assignment)
        return Response({'assignments':serializer.data}, status=status.HTTP_201_CREATED)

    def put(self, request, course_id, assignment_id):
        assignment = self.get_object(assignment_id)
        serializer = AssignmentEditSerializer(assignment, data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        ser = AssignmentViewSerializer(assignment)
        return Response({'data':ser.data}, status=status.HTTP_200_OK)

    def delete(self, request, course_id, assignment_id):
        assignment = self.get_object(assignment_id)
        assignment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)