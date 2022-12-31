import json

from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.decorator import csrf_protection, authentication
from authentication.utils import get_course_data_from_cache
from eventmanager.serializers.subevent import *
from eventmanager.utils import get_upload_subevent, get_user_has_subevent, get_grading_duty, get_grader_subevent, \
    get_gradingduty_has_rubrics, recompute_aggregate_marks, is_subevent_active_at_moment, validate_subevent_active_at_moment,get_any_subevent,validate_user_has_subevents
from helper.exceptions import *
from rest_framework.parsers import MultiPartParser, FormParser
from submissionmanager.serializers.gradingduty import MyGradingDutiesSerializer, MyGradingDutyDetailSerializer, \
    GradingDutyUpdateSerializer, MyGDDataSerializer, MyReGradingDutyDetailSerializer
from helper.utils import get_image_directory,get_images_from_dir,get_pdf_encoded_content
import datetime
from datetime import timezone

class MyGradingDuties(APIView):

    parser_classes = (MultiPartParser, FormParser)

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)


    # get all the events with subevents
    def get(self, request, course_id,event_id,subevent_id):
        # get enrollment id from cache
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        subevent = get_any_subevent(event_id, subevent_id)
        validate_user_has_subevents(subevent_id , enrollment_id,subevent,event_id)

        gradingduties = GradingDuty.objects.filter(subevent__id =subevent_id , grader__id = enrollment_id)
        for gd in gradingduties:
            if (gd.is_aggregate_marks_dirty):
                gd.aggregate_marks = recompute_aggregate_marks(gd.id,
                                                               gd.marks_adjustment)
                gd.is_aggregate_marks_dirty = False
                gd.save()
        if(subevent.type in ['RGUPLOAD','RGVIEW']):
            return_data = []
            for gd in gradingduties:
                print(gd.id)

                tmp_gd = MyRegradingDutyData()
                tmp_gd.setGDDetails(gd.id, gd.is_completed,gd.aggregate_marks)
                tmp_question = gd.response.question
                tmp_gd.setQuestionDetails(tmp_question)
                tmp_sg = gd.response.submission_group
                tmp_gd.setSGDetails(tmp_sg)
                return_data.append(tmp_gd)
            serializer = MyGDDataSerializer(return_data, many=True)
        else:
            serializer = MyGradingDutiesSerializer(gradingduties, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        # return Response({"data": return_data}, status=status.HTTP_200_OK)

class MyRegradingDutyData:
    id = -1
    is_completed = False
    aggregate_marks = 0
    grp_member_names = ""
    grp_id = -1
    question_id = -1
    question_title = ""
    question_marks = 0
    qset_id = -1
    qset_name = ""

    def setGDDetails(self,id , is_completed, aggregate_marks):
        self.id = id
        self.is_completed = is_completed
        self.aggregate_marks = aggregate_marks

    def setQuestionDetails(self,question):
        self.question_id = question.id
        self.question_marks = question.marks
        self.question_title = question.title
        qset = question.question_set
        self.qset_id = qset.id
        self.qset_name = qset.name
        self.question_type = question.type
        self.question_text = question.text
        self.question_options = question.options

    def setSGDetails(self,submission_group):
        self.grp_id = submission_group.id
        sghu = SubmissionGroupHasUser.objects.filter(submission_group = submission_group.id)
        names = ""
        for dt in sghu:
            user = dt.enrollment.user
            nm = user.first_name + ' '+ user.last_name
            names = names + nm +", "
        self.grp_member_names = names[:-2]



class MyGradingDutyDetail(APIView):

    parser_classes = (MultiPartParser, FormParser)

    #
    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def getGuploadDetails(self,course_id,subevent_id,gradingduty_id,enrollment_id):
        gradingduty = get_grading_duty(gradingduty_id)
        if gradingduty.grader.id != enrollment_id :
            raise PermissionError()
        get_user_has_subevent(gradingduty.subevent.id,enrollment_id)

        gradingduty_has_rubrics = get_gradingduty_has_rubrics(gradingduty_id)
        gradingduty_response = gradingduty.response
        question_rubrics = []
        if gradingduty_response.question is not None:
            question_rubrics = Rubric.objects.filter(question__id=gradingduty_response.question.id)

        # recompute the aggregate marks and set the dirty flag to zero
        gradingduty.is_aggregate_marks_dirty = False
        gradingduty.aggregate_marks = recompute_aggregate_marks(gradingduty.id, gradingduty.marks_adjustment)
        gradingduty.save()
        serData = {'gradingduty': gradingduty, 'gradingduty_has_rubrics': gradingduty_has_rubrics,
                   'response': gradingduty_response, 'question_rubrics': question_rubrics}
        serializer = MyGradingDutyDetailSerializer(serData)
        serData = serializer.data
        if gradingduty.subevent.event.assignment.is_interactive :
            return  serData
        to_image_directory = get_image_directory(course_id)
        upload = gradingduty_response.upload
        if not to_image_directory:
            raise serializers.ValidationError(**messages.COURSE_IMAGE_DIRECTORY_NOEXIST_1)
        file_path = upload.file_path
        dir_name = file_path.name[:-4]
        img_dirs = to_image_directory
        img_dir = img_dirs + '/' + dir_name
        content = get_images_from_dir(img_dir)
        serData['submission_upload'] = content
        return serData

    def getRGuploadDetails(self,course_id, subevent_id, gradingduty_id, enrollment_id):
        gradingduty = get_grading_duty(gradingduty_id)
        if gradingduty.grader.id != enrollment_id :
            raise PermissionError()
        get_user_has_subevent(gradingduty.subevent.id, enrollment_id)
        gradingduty_has_rubrics = get_gradingduty_has_rubrics(gradingduty_id)
        gradingduty_response = gradingduty.response
        question_rubrics = []
        if gradingduty_response.question is not None:
            question_rubrics = Rubric.objects.filter(question__id=gradingduty_response.question.id)

        # recompute the aggregate marks and set the dirty flag to zero
        gradingduty.is_aggregate_marks_dirty = False
        gradingduty.aggregate_marks = recompute_aggregate_marks(gradingduty.id, gradingduty.marks_adjustment)
        gradingduty.save()

        #fetching prev grading duty data
        prev_gds = GradingDuty.objects.filter(response_id = gradingduty_response.id , request_subevent = None )
        prev_gd_data = []
        for prev_gd in prev_gds:
            gdhr = get_gradingduty_has_rubrics(prev_gd.id)
            tmp = {'gd': prev_gd, 'gradingduty_has_rubrics': gdhr}
            prev_gd_data.append(tmp)

        serData = {'gradingduty': gradingduty, 'gradingduty_has_rubrics': gradingduty_has_rubrics,
                   'response': gradingduty_response, 'question_rubrics': question_rubrics,
                   'prev_gradingduties': prev_gd_data}
        serializer = MyReGradingDutyDetailSerializer(serData)
        serData = serializer.data

        #fetching comments
        regrading_gds = GradingDuty.objects.filter(response_id = gradingduty_response.id , request_subevent = gradingduty.request_subevent )
        seq_id = 1
        regrading_messages = []
        for tmp_gd in regrading_gds:
            if tmp_gd.student_comment is not None:
                regrading_messages.append({'sender': 'student', 'message': tmp_gd.student_comment, 'seq_id':seq_id})
                seq_id+=1
            if tmp_gd.grader_comment is not None:
                regrading_messages.append({'sender': 'grader', 'message': tmp_gd.grader_comment, 'seq_id':seq_id})
                seq_id+=1
        serData['regrading_messages'] = regrading_messages

        if gradingduty.subevent.event.assignment.is_interactive:
            return serData
        to_image_directory = get_image_directory(course_id)
        upload = gradingduty_response.upload
        if not to_image_directory:
            raise serializers.ValidationError(**messages.COURSE_IMAGE_DIRECTORY_NOEXIST_1)
        file_path = upload.file_path
        dir_name = file_path.name[:-4]
        img_dirs = to_image_directory
        img_dir = img_dirs + '/' + dir_name
        content = get_images_from_dir(img_dir)
        serData['submission_upload'] = content


        return serData



    # get all the events with subevents
    def get(self, request, course_id,event_id,subevent_id , gradingduty_id):
        # get enrollment id from cache
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        subevent = get_any_subevent(event_id, subevent_id)
        # uhs = get_user_has_subevent(subevent_id , enrollment_id)

        validate_user_has_subevents(subevent_id, enrollment_id, subevent, event_id)
        serData = None
        if(subevent.type in ['GUPLOAD','GVIEW']):
            serData = self.getGuploadDetails(course_id,subevent_id,gradingduty_id,enrollment_id)
        if (subevent.type in ['RGUPLOAD','RGVIEW']):
            serData = self.getRGuploadDetails(course_id, subevent_id, gradingduty_id, enrollment_id)

        return Response({"data": serData}, status=status.HTTP_200_OK)


    def put(self , request, course_id,event_id,subevent_id , gradingduty_id):
        #validating subevent and user subevent link
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        subevent = get_upload_subevent(event_id, subevent_id)
        uhs = get_user_has_subevent(subevent_id, enrollment_id)

        #validating grading duty
        gd = get_grading_duty(gradingduty_id)
        if not (gd.subevent.id == int(subevent_id) and gd.grader.id == int(enrollment_id)):
            raise ValidationException('Invalid grading duty id')

        context = {'event_id': event_id , 'subevent' : subevent , 'gradingduty' : gd}
        serializer = GradingDutyUpdateSerializer(gd, data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class MyGradingDutyMainFile(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)


    # get all the events with subevents
    def get(self, request, course_id,event_id,subevent_id , gradingduty_id):
        # get enrollment id from cache
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        subevent = get_any_subevent(event_id, subevent_id)
        # uhs = get_user_has_subevent(subevent_id , enrollment_id)
        validate_user_has_subevents(subevent_id, enrollment_id, subevent, event_id)

        # validating grading duty

        gd = get_grading_duty(gradingduty_id)
        if not ( gd.grader.id == int(enrollment_id)):
            raise ValidationException('Invalid grading duty id')
        get_user_has_subevent(gd.subevent.id, enrollment_id)
        # upload = gd.upload
        gradingduty_response = gd.response
        upload = gradingduty_response.submission_group.upload_id_main
        if(upload.file_path.name):
            main_file_name = upload.file_path.path
        else:
            raise serializers.ValidationError(messages.QUESTION_SET_NOEXIST_1)

        main_file_content = get_pdf_encoded_content(file_path=main_file_name)
        to_image_directory = get_image_directory(course_id)
        upload = gradingduty_response.upload
        if not to_image_directory:
            raise serializers.ValidationError(**messages.COURSE_IMAGE_DIRECTORY_NOEXIST_1)
        file_path = upload.file_path
        original_file_name = upload.original_file_name
        dir_name = file_path.name[:-4]
        img_dirs = to_image_directory
        img_dir = img_dirs + '/' + dir_name
        main_file_images = get_images_from_dir(img_dir)
        data = {'main_file' : main_file_content , 'original_file_name': original_file_name, 'main_file_images' : main_file_images}
        return Response({"data": data}, status=status.HTTP_200_OK)

class MyGradingDutySuppFile(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    # get all the events with subevents
    def get(self, request, course_id, event_id, subevent_id, gradingduty_id):
        # get enrollment id from cache
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        subevent = get_any_subevent(event_id, subevent_id)
        # uhs = get_user_has_subevent(subevent_id, enrollment_id)
        validate_user_has_subevents(subevent_id, enrollment_id, subevent, event_id)
        # validating grading duty

        gd = get_grading_duty(gradingduty_id)
        if not ( gd.grader.id == int(enrollment_id)):
            raise ValidationException('Invalid grading duty id')
        get_user_has_subevent(gd.subevent.id, enrollment_id)
        # upload = gd.upload
        gradingduty_response = gd.response
        upload = gradingduty_response.submission_group.upload_id_supp
        if upload and upload.file_path.name:
            main_file_name = upload.file_path.path
        else:
            raise serializers.ValidationError(messages.QUESTION_SET_NOEXIST_3)

        main_file_content = get_pdf_encoded_content(file_path=main_file_name)
        # to_image_directory = get_image_directory(course_id)
        # upload = gradingduty_response.upload
        # if not to_image_directory:
        #     raise serializers.ValidationError(**messages.COURSE_IMAGE_DIRECTORY_NOEXIST_1)
        # file_path = upload.file_path
        # dir_name = file_path.name[:-4]
        # img_dirs = to_image_directory
        # img_dir = img_dirs + '/' + dir_name
        # main_file_images = get_images_from_dir(img_dir)
        main_file_images = None
        original_file_name = upload.original_file_name
        data = {'main_file': main_file_content,'original_file_name': original_file_name, 'main_file_images': main_file_images}
        return Response({"data": data}, status=status.HTTP_200_OK)




class MyGradingDutyRubrics(APIView):

    parser_classes = (MultiPartParser, FormParser)
    #
    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)



    def get_rubric(self,question_id , rubric_id):
        question_rubric = Rubric.objects.filter(id = rubric_id, question__id = question_id)
        if question_rubric.count() == 0:
            raise ValidationException('Invalid rubric id')
        return question_rubric.get()


    def post(self , request, course_id,event_id,subevent_id , gradingduty_id , rubric_id):
        #validating subevent and user subevent link
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        subevent = get_upload_subevent(event_id, subevent_id)
        uhs = get_user_has_subevent(subevent_id, enrollment_id)

        #validating grading duty
        gd = get_grading_duty(gradingduty_id)
        if not (gd.subevent.id == int(subevent_id) and gd.grader.id == int(enrollment_id)):
            raise ValidationException('Invalid grading duty id')
        gradingduty_response = gd.response
        #validating rubric id
        rubric = self.get_rubric(gradingduty_response.question.id , rubric_id)

        gd_has_rubric = GradingdutyHasRubrics.objects.filter(gradingduty = gd , rubric = rubric)
        if gd_has_rubric.count() > 0:
            raise DuplicateEntryException()
        #create gradingdutyhasrubrics row
        gd_has_rubric = GradingdutyHasRubrics(gradingduty = gd , rubric = rubric)
        gd_has_rubric.save()
        #update gradingduty row
        gd.is_aggregate_marks_dirty = True
        end_time = subevent.end_time
        now = datetime.datetime.now(timezone.utc)

        if not (now <= end_time):
            gd.is_late_grading = True
        gd.save()

        data = {'gradingduty_id' : gradingduty_id , 'rubric_id' : rubric_id}
        return Response({"data": data}, status=status.HTTP_200_OK)


    def delete(self , request, course_id,event_id,subevent_id , gradingduty_id , rubric_id):
        # validating subevent and user subevent link
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        subevent = get_upload_subevent(event_id, subevent_id)
        uhs = get_user_has_subevent(subevent_id, enrollment_id)

        # validating grading duty
        gd = get_grading_duty(gradingduty_id)
        if not (gd.subevent.id == int(subevent_id) and gd.grader.id == int(enrollment_id)):
            raise ValidationException('Invalid grading duty id')
        gradingduty_response = gd.response
        # validating rubric id
        rubric = self.get_rubric(gradingduty_response.question.id, rubric_id)

        gd_has_rubric = GradingdutyHasRubrics.objects.filter(gradingduty=gd, rubric=rubric)
        if gd_has_rubric.count() == 0:
            raise serializers.ValidationError(**messages.GRADE_NODEL_1)

        gd_has_rubric = gd_has_rubric.get()
        gd_has_rubric.delete()

        gd.is_aggregate_marks_dirty = True
        end_time = subevent.end_time
        now = datetime.datetime.now(timezone.utc)

        if not (now <= end_time):
            gd.is_late_grading = True
        gd.save()
        return Response({'detail': 'grading duty rubric link deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

