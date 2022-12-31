import datetime

from django.utils.crypto import constant_time_compare
import shutil
from eventmanager.models import *
from eventmanager.utils import validate_access_code
from eventmanager.validators import *
from helper.exceptions import *
from authentication.utils import _get_new_random_string
from helper.utils import get_image_directory,store_images_from_pdf,get_images_from_dir
#
class MainSubmissionCreateSerializer(serializers.Serializer):

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
        now = datetime.datetime.now(datetime.timezone.utc)
        data = {'file_path':file,'file_size':file.size,'is_successful_upload':True,
                'uploader_id':self.context.get('enrollment_id'),'uploaded_at':now,
                'is_bulk_upload':False,'is_paginated':False}
        upload = Upload(**data)
        upload.save()
        if now > subevent.end_time and now < subevent.late_end_time:
            submission_group.is_late_submission = True
        submission_group.upload_id_main = upload
        submission_group.save()
        return upload


class MainSubmissionEditSerializer(serializers.Serializer):
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
        validate_file_extension2(attrs['file'], mut)
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
        submission_type =  self.context.get('submission_type')
        now = datetime.datetime.now(datetime.timezone.utc)


        original_file_name = file.name
        newfilename = _get_new_random_string()
        file.name = newfilename


        data = {'file_path': file, 'file_size': file.size, 'original_file_name': original_file_name ,'is_successful_upload': True,
                'uploader_id': self.context.get('enrollment_id'), 'uploaded_at': now,
                'is_bulk_upload': False, 'is_paginated': False}

        if submission_type == 'main' :
            upload_id = submission_group.upload_id_main
        else:
            upload_id = submission_group.upload_id_supp

        old_dir_name = None
        if upload_id:
            data['id']=upload_id.id
            file_path = upload_id.file_path
            old_dir_name = file_path.name[:-4]


        upload = Upload(**data)
        upload.save()
        if now > subevent.end_time and now < subevent.late_end_time:
            submission_group.is_late_submission = True

        if submission_type == 'main' :
            submission_group.upload_id_main = upload
        else:
            submission_group.upload_id_supp = upload
        submission_group.save()

        # convert pdf to image and save it in course directory
        course_id = self.context.get('course_id')
        from_file_path = upload.file_path.path
        file_name = upload.file_path.name
        to_image_directory = get_image_directory(course_id)

        if not to_image_directory:
            raise serializers.ValidationError(**messages.COURSE_IMAGE_DIRECTORY_NOEXIST_1)

        if old_dir_name is not None:
            image_new_dir_path = os.path.join(to_image_directory, old_dir_name)
            if os.path.exists(image_new_dir_path):
                shutil.rmtree(image_new_dir_path)


        store_images_from_pdf(file_name, from_file_path, to_image_directory)

        file_path = upload.file_path
        dir_name = file_path.name[:-4]
        img_dirs = to_image_directory
        img_dir = img_dirs + '/' + dir_name
        content = get_images_from_dir(img_dir)

        return {'file_images': content, 'is_paginated': upload.is_paginated}


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
        sup = params.get('SUP')
        if not sup:
            raise ValidationException(detail="Supplementary submission not allowed")
        sut = params.get('SUT')
        sus = params.get('SUS')
        validate_file_extension(attrs['file'], sut)
        validate_file_size(attrs['file'], sus)

        # validate SHA
        file_sha = calculate_hash_sha1(attrs['file'])
        if not constant_time_compare(file_sha, attrs['file_hash']):
            raise ValidationException(detail="file is corrupted while uploading")

        return attrs

    def create(self,validated_data):
        file = validated_data.get('file')
        submission_group = self.context.get('submission_group')
        subevent = self.context.get('subevent')
        submission_type =  self.context.get('submission_type')
        now = datetime.datetime.now(datetime.timezone.utc)


        original_file_name = file.name
        newfilename = _get_new_random_string()
        file.name = newfilename


        data = {'file_path': file, 'file_size': file.size, 'original_file_name': original_file_name ,'is_successful_upload': True,
                'uploader_id': self.context.get('enrollment_id'), 'uploaded_at': now,
                'is_bulk_upload': False, 'is_paginated': False}


        upload_id = submission_group.upload_id_supp

        old_dir_name = None
        if upload_id:
            data['id']=upload_id.id
            file_path = upload_id.file_path
            old_dir_name = file_path.name[:-4]


        upload = Upload(**data)
        upload.save()
        if now > subevent.end_time and now < subevent.late_end_time:
            submission_group.is_late_submission = True


        submission_group.upload_id_supp = upload
        submission_group.save()



        return {}



