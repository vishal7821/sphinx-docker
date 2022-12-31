import datetime
import json
from django.core.files import File
from PyPDF2 import PdfFileReader, PdfFileWriter
from eventmanager.models import *
from eventmanager.serializers.submissiongroup import SubmissionGroupSerializer
from eventmanager.validators import *
from helper.exceptions import *
from authentication.utils import _get_new_random_string
from helper.utils import calibrate_uploads, get_qset_file_details, recognize_users


class BulkUploadSerializer(serializers.Serializer):
    file = serializers.FileField(allow_null=False, required=True)

    def validate(self, attrs):
        # params = self.context.get('params')
         # # validate SHA
        # file_sha = calculate_hash_sha1(attrs['file'])
        # if not constant_time_compare(file_sha, attrs['file_hash']):
        #     raise ValidationException(detail="file is corrupted while uploading")
        return attrs

    def create(self, validated_data):
        file = validated_data.get('file')
        subevent = self.context.get('subevent')
        event_id = self.context.get('event_id')
        course_id = self.context.get('course_id')
        uploader_id = self.context.get('enrollment_id')
        now = datetime.datetime.now(datetime.timezone.utc)



        event = Event.objects.get(id = event_id)
        assignment_id = event.assignment.id
        qset = QuestionSet.objects.filter(assignment_id = assignment_id)
        if qset.count() == 0:
            raise ValidationException('No question set present within assignment')
        if qset.count() > 1:
            raise ValidationException('More than one question set present within assignment')
        qset = qset.get()

        qset_details = get_qset_file_details(course_id, assignment_id, qset.id)
        sub_file_size = qset_details['subm_len']
        target_file_path = qset_details['file_path']

        #split the pdf and upload into table Upload
        upload_entries = []
        pdf_reader = PdfFileReader(file)
        file_page_cnt = pdf_reader.getNumPages()
        original_file_name = file.name
        newfilename = _get_new_random_string()
        file.name = newfilename

        if file_page_cnt % sub_file_size !=0:
            raise ValidationException('One or multiple submission have less number of pages')
        start_page_ids = []
        i = 0
        while i < file_page_cnt:
            start_page_ids.append(i)
            i += sub_file_size
        j = 1
        for start_id in start_page_ids:
            pdf_writer1 = PdfFileWriter()
            for page in range(start_id, start_id + sub_file_size):
                pdf_writer1.addPage(pdf_reader.getPage(page))
            new_original_name = str(j)+'_'+original_file_name
            newfilename = _get_new_random_string()
            f = open(newfilename, 'wb+')
            tmp_file = File(f)
            pdf_writer1.write(f)
            tmp_file.name =newfilename
            data = {'file_path': tmp_file, 'file_size': tmp_file.size, 'original_file_name': new_original_name,
                    'is_successful_upload': True,
                    'uploader_id': uploader_id, 'uploaded_at': now,
                    'is_bulk_upload': True, 'is_paginated': False, 'subevent_id':subevent.id}
            upload = Upload(**data)
            upload.save()
            f.close()
            upload_data = {'id': upload.id ,
                           'from_file_path': upload.file_path.path,'file_name':upload.file_path.name}
            upload_entries.append(upload_data)
            j += 1
        #calibrate the submissions and store into course directory
        output_data = calibrate_uploads(qset.name_coords, upload_entries, course_id, target_file_path)
        return output_data


class UserRecognitionSerializer(serializers.Serializer):

    def validate(self, attrs):
        # params = self.context.get('params')
         # # validate SHA
        # file_sha = calculate_hash_sha1(attrs['file'])
        # if not constant_time_compare(file_sha, attrs['file_hash']):
        #     raise ValidationException(detail="file is corrupted while uploading")
        return attrs

    def create(self, validated_data):
        subevent = self.context.get('subevent')
        event_id = self.context.get('event_id')
        course_id = self.context.get('course_id')
        uploader_id = self.context.get('enrollment_id')
        now = datetime.datetime.now(datetime.timezone.utc)

        event = Event.objects.get(id = event_id)
        assignment_id = event.assignment.id
        qset = QuestionSet.objects.filter(assignment_id = assignment_id)
        if qset.count() == 0:
            raise ValidationException('No question set present within assignment')
        if qset.count() > 1:
            raise ValidationException('More than one question set present within assignment')
        qset = qset.get()

        name_coords = qset.name_coords
        roll_coords = qset.roll_coords

        #predict the user written roll numbers from submission
        output_data = recognize_users(name_coords, roll_coords, course_id,subevent.id)
        return output_data


class BulkSubmissionMapSerializer(serializers.Serializer):
    uploads = serializers.ListField(child=serializers.CharField(), default=[])
    roll_numbers = serializers.ListField(child=serializers.CharField(), default=[])
    def validate(self, attrs):
        uploads = attrs.get('uploads', [])
        # uploads = json.loads(uploads)
        roll_numbers = attrs.get('roll_numbers', [])
        # roll_numbers = json.loads(roll_numbers)
        if len(uploads) != len(roll_numbers):
            raise ValidationException(detail="The number of roll numbers and uploads are not matching")
        # params = self.context.get('params')
         # # validate SHA
        # file_sha = calculate_hash_sha1(attrs['file'])
        # if not constant_time_compare(file_sha, attrs['file_hash']):
        #     raise ValidationException(detail="file is corrupted while uploading")
        return attrs

    def create(self, validated_data):
        subevent = self.context.get('subevent')
        event_id = self.context.get('event_id')
        course_id = self.context.get('course_id')
        uploader_id = self.context.get('enrollment_id')
        now = datetime.datetime.now(datetime.timezone.utc)

        uploads = validated_data.pop('uploads')
        roll_nos = validated_data.pop('roll_numbers')
        uploads = json.loads(uploads[0])
        roll_nos = json.loads(roll_nos[0])
        # fetch question set
        print('-----------------------------------------')
        print(uploads)
        print('-----------------------------------------')
        print('-----------------------------------------')
        print(roll_nos)
        print('-----------------------------------------')
        event = Event.objects.get(id=event_id)
        assignment_id = event.assignment.id
        qset = QuestionSet.objects.filter(assignment_id=assignment_id)
        if qset.count() == 0:
            raise ValidationException('No question set present within assignment')
        if qset.count() > 1:
            raise ValidationException('More than one question set present within assignment')
        qset = qset.get()

        questions = Question.objects.filter(question_set = qset.id)
        for i in range(len(uploads)):
            upload_id = int(uploads[i])
            rno = roll_nos[i]
            upload = Upload.objects.filter(id = upload_id)
            if upload.count() == 0:
                print('for index =',i,' no upload entry found')
                continue
            user = User.objects.filter(roll_no = rno)
            if user.count() == 0:
                raise ValidationException('No user enrolled with given roll no in the course')
            enrollment = None
            if user.count() >1:
                for u in user:
                    enrollment = Enrollment.objects.filter(user=u.id)
                    if enrollment.count() == 1:
                        enrollment = enrollment.get()
                        break;
                if enrollment == None:
                    print('for index =', i, ' no enrollment found')
                    continue;
            else:
                user = user.get()
                enrollment = Enrollment.objects.filter(user = user.id)
                if enrollment.count() == 0:
                    print('for index =', i, ' no enrollment entry found')
                    continue
                enrollment = enrollment.get()
            upload = upload.get()


            #create submission group
            group = {}
            group['access_code_gold'] = None
            group['access_code_submitted'] = None
            group['is_late_submission'] = False
            group['upload_id_main'] = upload.id
            group['choosen_question_set'] = qset.id
            group['subevent'] = subevent.id
            serializer = SubmissionGroupSerializer(data=group)
            serializer.is_valid(raise_exception=True)
            submission_group = serializer.save()

            # create submission group has user
            submission_group_has_user = SubmissionGroupHasUser(enrollment=enrollment,
                                                                   submission_group=submission_group)
            submission_group_has_user.save()

            #create responses for each question  in question set
            for q in questions:
                page_no = q.file_page
                if page_no == None:
                    page_no = 0
                data = {'submission_group': submission_group,
                        'question': q, 'upload_page_no': page_no,
                        'upload': upload,
                        'upload_coords': q.file_cords, 'response_text': None}
                response = SubmissionResponse(**data)
                response.save()
            upload.is_paginated = True
            upload.save()


        return {'output':'success'}