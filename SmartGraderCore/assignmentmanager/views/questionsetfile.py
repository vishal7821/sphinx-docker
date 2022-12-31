from PIL import Image
from django.http import Http404
from rest_framework import status, serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView


from assignmentmanager.models import Assignment
from assignmentmanager.serializers.files import QuestionSetFileSerializer,\
    SupplementaryFileSerializer, SolutionFileSerializer
from assignmentmanager.utils import get_question_set_object
from authentication.models import Course
from helper.utils import get_pdf_encoded_content, store_images_from_pdf, get_images_from_dir, get_image_directory

from authentication.decorator import csrf_protection, authentication
from django.utils.decorators import method_decorator
from helper import exceptions, messages

Image.MAX_IMAGE_PIXELS = None



# TODO: so much code is repeated, We can use viewset
# TODO: change file name, store original filename in server
class QuestionSetFile(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    parser_classes = (MultiPartParser,FormParser)

    # read in chunks of 4096 bytes sequentially
    def get(self,  request, course_id,  assignment_id, question_set_id):
        questionset = get_question_set_object(assignment_id,question_set_id)
        if(questionset.question_file_path.name):
            question_file_name = questionset.question_file_path.path
        else:
            raise serializers.ValidationError(messages.QUESTION_SET_NOEXIST_1)
        content  = get_pdf_encoded_content(file_path=question_file_name)
        return Response({"question_file": content}, status=status.HTTP_200_OK)

    # def post(self,  request, course_id,  assignment_id, question_set_id):
    #     question_set = get_question_set_object(assignment_id, question_set_id)
    #     file_serializer = QuestionSetFileCreateSerializer(question_set, data=request.data)
    #     file_serializer.is_valid(raise_exception=True)
    #     updated_questionset = file_serializer.save()
    #
    #     #convert pdf to image and save it in course directory
    #     from_file_path = updated_questionset.question_file_path.path
    #     file_name = updated_questionset.question_file_path.name
    #     to_image_directory = get_image_directory(course_id)
    #
    #     if not to_image_directory:
    #         raise serializers.ValidationError(**messages.COURSE_IMAGE_DIRECTORY_NOEXIST_1)
    #     store_images_from_pdf(file_name, from_file_path, to_image_directory)
    #     return Response( status=status.HTTP_201_CREATED)

    def put(self, request, course_id,  assignment_id, question_set_id):

        if not request.data:
            raise serializers.ValidationError(messages.QUESTION_SET_NOVAL_1)
        question_set = get_question_set_object(assignment_id, question_set_id)
        file_serializer = QuestionSetFileSerializer(question_set, data=request.data)
        file_serializer.is_valid()
        updated_questionset = file_serializer.save()

        # convert pdf to image and save it in course directory
        from_file_path = updated_questionset.question_file_path.path
        file_name = updated_questionset.question_file_path.name
        to_image_directory = get_image_directory(course_id)

        if not to_image_directory:
            raise serializers.ValidationError(**messages.COURSE_IMAGE_DIRECTORY_NOEXIST_1)
        store_images_from_pdf(file_name, from_file_path, to_image_directory)
        return Response(status=status.HTTP_201_CREATED)

class QuestionSetFileImages(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    parser_classes = (MultiPartParser, FormParser)


    def get(self,  request, course_id,  assignment_id, question_set_id):
        questionset = get_question_set_object(assignment_id, question_set_id)
        if not questionset.question_file_path.name:
            raise serializers.ValidationError(messages.QUESTION_FILE_NAME_NOEXIST_1)
        q_file_name = questionset.question_file_path

        dir_name = q_file_name.name[:-4]

        img_dirs = get_image_directory(course_id)

        img_dir = img_dirs + '/' + dir_name

        content = get_images_from_dir(img_dir)

        return Response({"question_file_images": content}, status=status.HTTP_200_OK)




class QuestionSetSolutionFile(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    # read in chunks of 4096 bytes sequentially
    def get(self, request, course_id, assignment_id, question_set_id):
        questionset = get_question_set_object(assignment_id, question_set_id)
        if not questionset.solution_file_path.name:
            raise serializers.ValidationError(messages.QUESTION_SET_NOEXIST_2)

        file_path = questionset.solution_file_path
        content = get_pdf_encoded_content(file_path)
        return Response({"data": content}, status=status.HTTP_200_OK)

    # def post(self, request, course_id, assignment_id, question_set_id):
    #     question_set = get_question_set_object(assignment_id, question_set_id).solution_file_path
    #     file_serializer = SolutionFileSerializer(question_set, data=request.data)
    #     file_serializer.is_valid(raise_exception=True)
    #     file_serializer.save()
    #     return Response( status=status.HTTP_201_CREATED)

    def put(self, request, course_id,  assignment_id, question_set_id):

        if not request.data:
            raise serializers.ValidationError(messages.QUESTION_SET_NOVAL_2)
        question_set = get_question_set_object(assignment_id, question_set_id)
        file_serializer = SolutionFileSerializer(question_set, data=request.data)
        file_serializer.is_valid()
        file_serializer.save()
        return Response(status=status.HTTP_201_CREATED)



class QuestionSetSupplementaryFile(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    # read in chunks of 4096 bytes sequentially
    def get(self, request, course_id, assignment_id, question_set_id):
        questionset = get_question_set_object(assignment_id, question_set_id)
        if not questionset.supplementary_file_path.name:
            raise serializers.ValidationError(messages.QUESTION_SET_NOEXIST_3)

        file_path = questionset.supplementary_file_path

        content = get_pdf_encoded_content(file_path)
        return Response({"data": content}, status=status.HTTP_200_OK)

    # def post(self, request, course_id, assignment_id, question_set_id):
    #     question_set = get_question_set_object(assignment_id, question_set_id)
    #     file_serializer = SupplementaryFileSerializer(question_set, data=request.data)
    #     file_serializer.is_valid()
    #     file_serializer.save()
    #     return Response(status=status.HTTP_201_CREATED)

    def put(self, request, course_id,  assignment_id, question_set_id):

        if not request.data:
            raise serializers.ValidationError(messages.QUESTION_SET_NOVAL_2)
        question_set = get_question_set_object(assignment_id, question_set_id)
        file_serializer = SupplementaryFileSerializer(question_set, data=request.data)
        file_serializer.is_valid()
        file_serializer.save()
        return Response(status=status.HTTP_201_CREATED)

