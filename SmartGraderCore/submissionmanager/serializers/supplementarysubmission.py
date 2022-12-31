from rest_framework import fields

from eventmanager import validators
from eventmanager.models import *
from eventmanager.validators import *
from helper.exceptions import *
from django.utils.crypto import constant_time_compare, get_random_string
import datetime
from eventmanager.utils import validate_access_code



class SuppSubmissionCreateSerializer(serializers.Serializer):

    file = serializers.FileField(allow_null=False,required=True)
    file_hash = serializers.CharField(allow_null=False, required=True)
    access_code = serializers.CharField(allow_blank=True)


    def validate(self,attrs):
        params = self.context.get('params')
        submission_group = self.context.get('submission_group')

        if 'NAC' in params and params['NAC'] == 1:
            if not 'access_code' in attrs:
                raise AccessException("access code required")
            validate_access_code(attrs.get('access_code'),submission_group.access_code_gold)

        mut = params.get('MUT')
        mus = params.get('MUS')
        validate_file_extension(attrs['file'],mut)
        validate_file_size(attrs['file'],mus)

        #validate SHA
        file_sha = calculate_hash_sha1(attrs['file'])
        if not constant_time_compare(file_sha,attrs['file_hash']):
            raise ValidationException(detail="file is corrupted while uploading")

        return attrs

    def create(self,validated_data):
        file = validated_data.get('file')
        submission_group = self.context.get('submission_group')
        subevent = self.context.get('subevent')
        now = datetime.datetime.now()
        data = {'file_path':file,'file_size':file.size,'is_successful_upload':True,
                'uploader_id':self.context.get('enrollment_id'),'uploaded_at':now,
                'is_bulk_upload':False,'is_paginated':False}
        upload = Upload(data)
        u = upload.save()
        if now > subevent.end_time and now < subevent.late_end_time:
            submission_group.is_late_submission = True
        submission_group.upload_id_supp = u.id
        submission_group.save()
        return u


class SuppSubmissionEditSerializer(serializers.Serializer):
    file = serializers.FileField(allow_null=False, required=True)
    file_hash = serializers.CharField(allow_null=False, required=True)
    access_code = serializers.CharField(allow_blank=True)

    def validate(self,attrs):
        params = self.context.get('params')
        submission_group = self.context.get('submission_group')
        if 'NAC' in params and params['NAC'] == 1:
            if not 'access_code' in attrs:
                raise AccessException("access code required")
            validate_access_code(attrs.get('access_code'),submission_group.access_code_gold)

        mut = params.get('MUT')
        mus = params.get('MUS')
        validate_file_extension(attrs['file'], mut)
        validate_file_size(attrs['file'], mus)

        # validate SHA
        file_sha = calculate_hash_sha1(attrs['file'])
        if not constant_time_compare(file_sha, attrs['file_hash']):
            raise ValidationException(detail="file is corrupted while uploading")

        return attrs

    def create(self,validated_data):
        file = validated_data.get('file')
        submission_group = self.context.get('submission_group')
        subevent = self.context.get('subevent')
        now = datetime.datetime.now()
        data = {'id':submission_group.upload_id_main.id ,'file_path': file, 'file_size': file.size, 'is_successful_upload': True,
                'uploader_id': self.context.get('enrollment_id'), 'uploaded_at': now,
                'is_bulk_upload': False, 'is_paginated': False}
        upload = Upload(data)
        upload.save()
        if now > subevent.end_time and now < subevent.late_end_time:
            submission_group.is_late_submission = True
        submission_group.upload_id_main = u.id
        submission_group.save()
        return upload



