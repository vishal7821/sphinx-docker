import base64
import os

import cv2
from django.core.files.storage import FileSystemStorage
from rest_framework.response import Response
from rest_framework.views import APIView

from helper import exceptions
from helper.exceptions import *
from rest_framework.parsers import MultiPartParser, FormParser

from helper.utils import get_image_directory, get_pdf_encoded_content
from submissionmanager.serializers.bulksubmission import BulkUploadSerializer, UserRecognitionSerializer, \
    BulkSubmissionMapSerializer

from authentication.utils import get_course_data_from_cache

import json
from eventmanager.models import *

class UserRecognition(APIView):
    parser_classes = (MultiPartParser, FormParser)
    def get(self, request, course_id, event_id, subevent_id):

        # 1. Validate the subevent_id is corresponds to SUPLOAD type or not
        # 2.validating SUPLOAD subevent with SBM = OLI is present in this event or not
        supload_subevent = Subevent.objects.filter(id=subevent_id, event__id=event_id, type='SUPLOAD')
        if supload_subevent.count() == 0:
            raise ValidationException('Invalid subevent id')
        supload_subevent = supload_subevent.get()
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')

        #2.SUPLOAD SBM param must have mode as OLI(online by instructor)
        params = json.loads(supload_subevent.params)
        sbm = params.get('SBM', None)
        if sbm is None or sbm != 'OLI':
            raise PermissionError()


        context = {'course_id': course_id,'subevent': supload_subevent ,
                   'event_id': event_id,'enrollment_id': enrollment_id ,}
        serializer = UserRecognitionSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        return_data = serializer.save()
        return Response(
            data=return_data
        )

    def post(self, request, course_id, event_id, subevent_id):

        # 1. Validate the subevent_id is corresponds to SUPLOAD type or not
        # 2.validating SUPLOAD subevent with SBM = OLI is present in this event or not
        supload_subevent = Subevent.objects.filter(id=subevent_id, event__id=event_id, type='SUPLOAD')
        if supload_subevent.count() == 0:
            raise ValidationException('Invalid subevent id')
        supload_subevent = supload_subevent.get()
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')

        #2.SUPLOAD SBM param must have mode as OLI(online by instructor)
        params = json.loads(supload_subevent.params)
        sbm = params.get('SBM', None)
        if sbm is None or sbm != 'OLI':
            raise PermissionError()


        context = {'course_id': course_id,'subevent': supload_subevent ,
                   'event_id': event_id,'enrollment_id': enrollment_id ,}
        serializer = BulkSubmissionMapSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        return_data = serializer.save()
        return Response(
            data=return_data
        )

class BulkUpload(APIView):
    parser_classes = (MultiPartParser, FormParser)
    def get_cropped_name_box(self,course_id, file_path,name_coords):
        if not file_path.name:
            return None
        f_path = file_path.path
        file_name = file_path.name
        dir_name = file_name[:-4]
        img_dirs = get_image_directory(course_id)
        img_dir = img_dirs + '/' + dir_name
        image = {}
        file_system_storage = FileSystemStorage()
        image_list = file_system_storage.listdir(img_dir)
        image_name_list = image_list[1]
        image_name_list.sort()
        image_file_name = image_name_list[0]
        image_path = os.path.join(img_dir, image_file_name)
        # encoding = read_file(image_path)
        img = cv2.imread(image_path, cv2.IMREAD_COLOR)
        coords = name_coords.split(',')
        i_coords = []
        for c in coords:
            i_coords.append(int(c))
        cropped_img = img[i_coords[1]:i_coords[3], i_coords[0]:i_coords[2]]
        img = cv2.imencode('.jpg', cropped_img)[1].tobytes()
        content = base64.b64encode(img)
        return content

    # get all the events with subevents
    def get(self, request, course_id, event_id, subevent_id):
        supload_subevent = Subevent.objects.filter(id=subevent_id, event__id=event_id, type='SUPLOAD')
        if supload_subevent.count() == 0:
            raise ValidationException('Invalid subevent id')

        supload_subevent = supload_subevent.get()
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')

        # 2.SUPLOAD SBM param must have mode as OLI(online by instructor)
        params = json.loads(supload_subevent.params)
        sbm = params.get('SBM', None)
        if sbm is None or sbm != 'OLI':
            raise EventError()

        #get name coordinates from question set
        event = Event.objects.get(id=event_id)
        assignment_id = event.assignment.id
        qset = QuestionSet.objects.filter(assignment_id=assignment_id)
        if qset.count() == 0:
            raise ValidationException('No question set present within assignment')
        if qset.count() > 1:
            raise ValidationException('More than one question set present within assignment')
        qset = qset.get()

        name_coords = qset.name_coords
        #fetch upload entries created by Bulk upload
        uploads = Upload.objects.filter(is_bulk_upload=True, subevent_id = subevent_id)
        output_data = []
        for upload in uploads:
            upload_entry = {}
            upload_entry['upload_id'] = upload.id
            #fetch image and crop name box
            image = self.get_cropped_name_box(course_id, upload.file_path,name_coords)
            upload_entry['name_box'] = image
            upload_entry['roll_no'] = None
            if upload.is_paginated == True:
                sg = SubmissionGroup.objects.filter(upload_id_main = upload.id)
                if sg.count() ==1:
                    sg = sg.get()
                    sghu = SubmissionGroupHasUser.objects.filter(submission_group = sg)
                    if sghu.count() == 1:
                        sghu = sghu.get()
                        roll_no = sghu.enrollment.user.roll_no
                        # print('----------------------------------')
                        # print('user roll no =',roll_no)
                        # print('----------------------------------')
                        upload_entry['roll_no'] = roll_no
            output_data.append(upload_entry)
        return Response(
            data=output_data
        )

    def post(self, request, course_id, event_id, subevent_id):

        # 1. Validate the subevent_id is corresponds to SUPLOAD type or not
        # 2.validating SUPLOAD subevent with SBM = OLI is present in this event or not
        supload_subevent = Subevent.objects.filter(id=subevent_id, event__id=event_id, type='SUPLOAD')
        if supload_subevent.count() == 0:
            raise ValidationException('Invalid subevent id')
        supload_subevent = supload_subevent.get()
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')

        #2.SUPLOAD SBM param must have mode as OLI(online by instructor)
        params = json.loads(supload_subevent.params)
        sbm = params.get('SBM', None)
        if sbm is None or sbm != 'OLI':
            raise PermissionError()


        context = {'course_id': course_id,'subevent': supload_subevent ,
                   'event_id': event_id,'enrollment_id': enrollment_id ,}
        serializer = BulkUploadSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        return_data = serializer.save()
        return Response(
            data=return_data
        )


class BulkSubmissionDetail(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)
    #

    def get_object(self, upload_id):
        try:
            up = Upload.objects.get(id = upload_id)
        except Upload.DoesNotExist:
            raise exceptions.AccessException(detail='The upload entry is corrupted or not present')
        return up

    # read in chunks of 4096 bytes sequentially
    def get(self, request, course_id,event_id, subevent_id, upload_id):
        upload = self.get_object(upload_id)
        if (upload.file_path.name):
            upload_file_path = upload.file_path.path
        else:
            raise ValidationException('The requested file is corrupted or deleted')
        content = get_pdf_encoded_content(file_path=upload_file_path)
        return Response({"submission_file": content , 'file_name':upload.original_file_name}, status=status.HTTP_200_OK)


    def delete(self, request, course_id, event_id, subevent_id, upload_id):
        #todo check if cascading delete is working

        supload_subevent = Subevent.objects.filter(id=subevent_id, event__id=event_id, type='SUPLOAD')
        if supload_subevent.count() == 0:
            raise ValidationException('Invalid subevent id')
        supload_subevent = supload_subevent.get()

        # 2.SUPLOAD SBM param must have mode as OLI(online by instructor)
        params = json.loads(supload_subevent.params)
        sbm = params.get('SBM', None)
        if sbm is None or sbm != 'OLI':
            raise PermissionError()

        upload = self.get_object(upload_id)
        upload.delete()
        return Response({'detail': 'The submission deleted successfully'}, status=status.HTTP_204_NO_CONTENT)