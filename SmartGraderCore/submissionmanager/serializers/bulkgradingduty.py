import datetime
import json
from django.core.files import File
from PyPDF2 import PdfFileReader, PdfFileWriter
from eventmanager.models import *
from eventmanager.serializers.submissiongroup import SubmissionGroupSerializer
from eventmanager.validators import *
from helper.exceptions import *
from eventmanager.utils import is_lists_intersects , get_section_list_enrollments
from django.utils.crypto import constant_time_compare
from authentication.utils import _get_new_random_string
from helper.utils import calibrate_uploads, get_qset_file_details, recognize_users, grading_computation


class BulkGradingSerializer(serializers.Serializer):

    def validate(self, attrs):
        return attrs

    def create(self, validated_data):
        subevent = self.context.get('subevent')
        event_id = self.context.get('event_id')
        course_id = self.context.get('course_id')
        enrollment_id = self.context.get('enrollment_id')
        question_id = self.context.get('question_id')
        now = datetime.datetime.now(datetime.timezone.utc)


        question = Question.objects.filter(id = question_id)
        if question.count() == 0:
            raise ValidationException('No such question present within assignment')
        question = question.get()

        q_ans_coords = question.file_cords
        q_is_autograded = question.is_autograded
        q_solution_list  = question.solution_list
        if not q_is_autograded:
            raise ValidationException('The request corresponding question is not autogradable')
        q_type = question.type

        gds = GradingDuty.objects.filter(subevent = subevent, response__question = question
                                         , is_regrading = False, is_completed = False,
                                          grader__id = enrollment_id)


        #predict the user written roll numbers from submission
        output_data = grading_computation(gds, q_type, q_ans_coords, q_solution_list,course_id)
        return output_data






class GradeSubmissionsSerializer(serializers.Serializer):
    gd_ids = serializers.ListField(child=serializers.CharField(), default=[])
    subquestion_ids = serializers.ListField(child=serializers.CharField(), default=[])
    rec_chars = serializers.ListField(child=serializers.CharField(), default=[])
    def validate(self, attrs):
        gd_ids = attrs.get('gd_ids', [])
        # uploads = json.loads(uploads)
        subquestion_ids = attrs.get('subquestion_ids', [])
        rec_chars = attrs.get('rec_chars', [])
        # roll_numbers = json.loads(roll_numbers)
        if len(gd_ids) != len(subquestion_ids) or len(gd_ids) != len(rec_chars) :
            raise ValidationException(detail="The length of input array must be equal")
        # params = self.context.get('params')
         # # validate SHA
        # file_sha = calculate_hash_sha1(attrs['file'])
        # if not constant_time_compare(file_sha, attrs['file_hash']):
        #     raise ValidationException(detail="file is corrupted while uploading")
        return attrs

    def create(self, validated_data):
        subevent = self.context.get('subevent')
        question = self.context.get('question')

        gd_ids = validated_data.pop('gd_ids')
        subquestion_ids = validated_data.pop('subquestion_ids')
        rec_chars = validated_data.pop('rec_chars')
        gd_ids = json.loads(gd_ids[0])
        subquestion_ids = json.loads(subquestion_ids[0])
        rec_chars = json.loads(rec_chars[0])
        # fetch question set
        print('-----------------------------------------')
        print(gd_ids)
        print('-----------------------------------------')
        print('-----------------------------------------')
        print(subquestion_ids)
        print('-----------------------------------------')
        print('-----------------------------------------')
        print(rec_chars)
        print('-----------------------------------------')

        gd_dict = {}
        gd_db_dict = {}
        i=0
        for gd_id in gd_ids:
            gd = GradingDuty.objects.filter(id=gd_id, subevent=subevent.id,
                                            response__question__id=question.id)
            if gd.count() == 0:
                raise ValidationException('The provided grading duty data is invalid')
            if gd_id not in gd_dict:
                gd_dict[gd_id] = []
            gd_dict[gd_id].append(i)
            if gd_id not in gd_db_dict:
                gd_db_dict[gd_id] = gd.get()
            i+=1

        q_solution = question.solution_list
        solution_list = q_solution.split(',')
        marks_per_subq = question.marks / len(solution_list)

        for key in gd_dict:
            subquestion_entries = gd_dict[key]
            correct_subq = []
            for idx in subquestion_entries:
                subquestion_id = subquestion_ids[idx]
                if solution_list[subquestion_id] == rec_chars[idx]:
                    correct_subq.append(subquestion_id + 1)
            gd = gd_db_dict[key]
            obtained_marks = len(correct_subq) * marks_per_subq
            correct_subq.sort()
            if len(correct_subq) > 0:
                tmp_str = ', '.join(map(str, correct_subq))
                remark = 'The correctly answered subquestions are ' + tmp_str
            else:
                remark = 'There are no correctly answered subquestions'
            gd.marks_adjustment = obtained_marks
            gd.grader_comment = remark
            gd.is_completed = True
            gd.is_aggregate_marks_dirty = True
            gd.save()

        return {'output':'success'}