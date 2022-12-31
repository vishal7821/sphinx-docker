import json

from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.decorator import csrf_protection, authentication
from authentication.utils import get_course_data_from_cache
from eventmanager.serializers.subevent import *
from eventmanager.utils import get_gd_by_submission_group, get_submissiongroup_has_user , get_responses_per_submission_group,get_marksview_subevent , recompute_aggregate_marks , get_gradingduty_has_rubrics
from helper.exceptions import *
from rest_framework.parsers import MultiPartParser, FormParser

from helper.utils import get_image_directory, get_images_from_dir
from submissionmanager.serializers.gradingduty import MyMarksSerializer, MySubmissionMarksSerializer


class MyMarks(APIView):

    parser_classes = (MultiPartParser, FormParser)

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)


    # get all the events with subevents
    def get(self, request, course_id,event_id):
        # get enrollment id from cache
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        marksview_flags = get_marksview_subevent(event_id, enrollment_id)
        submission_group_has_user = get_submissiongroup_has_user(event_id,enrollment_id)
        submission_group = submission_group_has_user.submission_group
        gradingduties = get_gd_by_submission_group(submission_group.id)
        for gd in gradingduties:
            if gd.is_aggregate_marks_dirty :
                gd.aggregate_marks = recompute_aggregate_marks(gd.id, gd.marks_adjustment)
                gd.is_aggregate_marks_dirty = False
                gd.save()

        guploads=Subevent.objects.filter(event__id = event_id , type='GUPLOAD')
        filtered_guploads=[]
        for gupload in guploads:
            params = json.loads(gupload.params)
            linked_suploads = params.get('GEN', None)
            if submission_group.subevent.id in linked_suploads:
                filtered_guploads.append(gupload.id)

        rguploads = Subevent.objects.filter(event__id=event_id, type='RGUPLOAD')

        return_data = []
        if marksview_flags.get('is_mview_active'):

            gradingduties =[]
            for gupload_id in filtered_guploads:
                gradingduties.extend(GradingDuty.objects.filter(response__submission_group__id = submission_group.id , subevent__id = gupload_id , is_completed = True))

            for gd in gradingduties:
                gradingduty = gd
                gradingduty_has_rubrics = get_gradingduty_has_rubrics(gd.id)
                gradingduty_response = gd.response
                question_rubrics = []
                if gradingduty_response.question is not None:
                    question_rubrics = Rubric.objects.filter(question__id=gradingduty_response.question.id)

                serData = {'gradingduty': gradingduty, 'gradingduty_has_rubrics': gradingduty_has_rubrics, 'question_rubrics': question_rubrics}
                return_data.append(serData)

        if marksview_flags.get('is_rmview_active'):
            gradingduties = []
            for rgupload in rguploads:
                gradingduties.extend(GradingDuty.objects.filter(response__submission_group__id=submission_group.id,
                                                                subevent__id=rgupload.id, is_completed=True))
            filtered_gd = []
            for gd in gradingduties:
                rgreq_subevent = gd.request_subevent
                params = json.loads(rgreq_subevent.params)
                gupload_id = params.get('TED', None)
                if gupload_id and int(gupload_id) in filtered_guploads:
                    gradingduty = gd
                    gradingduty_has_rubrics = get_gradingduty_has_rubrics(gd.id)
                    gradingduty_response = gd.response
                    question_rubrics = []
                    if gradingduty_response.question is not None:
                        question_rubrics = Rubric.objects.filter(question__id=gradingduty_response.question.id)

                    serData = {'gradingduty': gradingduty, 'gradingduty_has_rubrics': gradingduty_has_rubrics,
                               'question_rubrics': question_rubrics}
                    return_data.append(serData)
        serializer = MyMarksSerializer(return_data , many = True)
        serData = serializer.data

        return Response({"data": serData}, status=status.HTTP_200_OK)



class MySubmissionMarks(APIView):

    parser_classes = (MultiPartParser, FormParser)

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)


    # get all the events with subevents
    def get(self, request, course_id,event_id):
        # get enrollment id from cache
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        marksview_flags = get_marksview_subevent(event_id, enrollment_id)
        submission_group_has_user = get_submissiongroup_has_user(event_id,enrollment_id)
        submission_group = submission_group_has_user.submission_group
        gradingduties = get_gd_by_submission_group(submission_group.id)
        is_interactiveFlag = False
        for gd in gradingduties:
            if gd.is_aggregate_marks_dirty :
                gd.aggregate_marks = recompute_aggregate_marks(gd.id, gd.marks_adjustment)
                gd.is_aggregate_marks_dirty = False
                gd.save()
            if gd.response.question.question_set.assignment.is_interactive == True:
                is_interactiveFlag = True

        guploads=Subevent.objects.filter(event__id = event_id , type='GUPLOAD')
        filtered_guploads=[]
        for gupload in guploads:
            params = json.loads(gupload.params)
            linked_suploads = params.get('GEN', None)
            if submission_group.subevent.id in linked_suploads:
                filtered_guploads.append(gupload.id)

        rguploads = Subevent.objects.filter(event__id=event_id, type='RGUPLOAD')


        overall_details = {}
        #fetching overall details like submission images, aggregation method for event
        if is_interactiveFlag == False:

            to_image_directory = get_image_directory(course_id)
            upload = submission_group.upload_id_main
            if not to_image_directory:
                raise serializers.ValidationError(**messages.COURSE_IMAGE_DIRECTORY_NOEXIST_1)
            file_path = upload.file_path
            dir_name = file_path.name[:-4]
            img_dirs = to_image_directory
            img_dir = img_dirs + '/' + dir_name
            content = get_images_from_dir(img_dir)
            overall_details['submission_images'] = content

        choosen_question_set = submission_group.choosen_question_set
        if choosen_question_set is None:
            raise serializers.ValidationError(messages.QUESTION_SET_NOEXIST_4)
        questions = Question.objects.filter(question_set=choosen_question_set, is_actual_question=True)
        responses = get_responses_per_submission_group(submission_group.id)
        returnData = []
        qidDict = {}
        for response in responses:
            temp = {'question_id': response.question.id,'reponseText': response.response_text}
            returnData.append(temp)
            qidDict[response.question.id] = response.upload_page_no
        for q in questions:
            if q.id not in qidDict:
                temp = {'question_id': q.id, 'page_no': None, 'reponseText': "-1"}
                returnData.append(temp)

        my_event = Event.objects.get(id = event_id)
        overall_details['aggregation_method'] = my_event.grade_aggregation_method

        #fetching grading duty and question details
        question_dict = {}
        question_arr = []
        return_data = []
        if marksview_flags.get('is_mview_active'):

            gradingduties = []
            for gupload_id in filtered_guploads:
                gradingduties.extend(GradingDuty.objects.filter(response__submission_group__id = submission_group.id , subevent__id = gupload_id , is_completed = True))

            for gd in gradingduties:
                gradingduty = gd
                gradingduty_has_rubrics = get_gradingduty_has_rubrics(gd.id)
                gradingduty_response = gd.response
                question_rubrics = []
                question_obj = gradingduty_response.question
                if question_obj.id not in question_arr:

                    if gradingduty_response.question is not None:
                        question_rubrics = Rubric.objects.filter(question__id=gradingduty_response.question.id)
                    q = { 'id': question_obj.id, 'title': question_obj.title, 'marks': question_obj.marks, 'rubrics': question_rubrics , 'upload_page_no': gradingduty_response.upload_page_no,
                          'grading_duties': [] , 'regrading_duty': None, 'text': question_obj.text, 'options': question_obj.options, 'type': question_obj.type}
                    question_arr.append(question_obj.id)
                    question_dict[question_obj.id] = q
                question_dict[question_obj.id]['grading_duties'].append({'gradingduty': gradingduty, 'gradingduty_has_rubrics': gradingduty_has_rubrics})
                # serData = {'gradingduty': gradingduty, 'gradingduty_has_rubrics': gradingduty_has_rubrics, 'question_rubrics': question_rubrics}
                # return_data.append(serData)

        if marksview_flags.get('is_rmview_active'):
            gradingduties = []
            for rgupload in rguploads:
                gradingduties.extend(GradingDuty.objects.filter(response__submission_group__id=submission_group.id,
                                                                subevent__id=rgupload.id, is_completed=True))
            filtered_gd = []
            for gd in gradingduties:
                rgreq_subevent = gd.request_subevent
                params = json.loads(rgreq_subevent.params)
                gupload_id = params.get('TED', None)
                if gupload_id and int(gupload_id) in filtered_guploads:
                    gradingduty = gd
                    gradingduty_has_rubrics = get_gradingduty_has_rubrics(gd.id)
                    gradingduty_response = gd.response
                    question_rubrics = []
                    question_obj = gradingduty_response.question
                    if question_obj.id not in question_arr:
                        if gradingduty_response.question is not None:
                            question_rubrics = Rubric.objects.filter(question__id=gradingduty_response.question.id)
                        q = {'id': question_obj.id, 'title': question_obj.title, 'marks': question_obj.marks,
                             'rubrics': question_rubrics, 'upload_page_no': gradingduty_response.upload_page_no,
                             'grading_duties': [],'regrading_duty': None, 'text': question_obj.text, 'options': question_obj.options, 'type': question_obj.type}
                        question_arr.append(question_obj.id)
                        question_dict[question_obj.id] = q
                    question_dict[question_obj.id]['regrading_duty'] = {'gradingduty': gradingduty, 'gradingduty_has_rubrics': gradingduty_has_rubrics}

        #fetch regrading messages if exist for each response in this event
        for qid in question_arr:
            q_entry = question_dict[qid]
            response = SubmissionResponse.objects.filter(question_id = qid, submission_group = submission_group)
            if response.count()>0:
                response = response[0]
                gds = GradingDuty.objects.filter(response=response)
                seq_id = 1
                regrading_messages = []
                regradingduties = []
                for gd in gds:
                    if(gd.request_subevent is not None):
                        regradingduties.append(gd)
                for tmp_gd in regradingduties:
                    if tmp_gd.student_comment is not None:
                        regrading_messages.append(
                            {'sender': 'student', 'message': tmp_gd.student_comment, 'seq_id': seq_id})
                        seq_id += 1
                    if tmp_gd.grader_comment is not None:
                        regrading_messages.append({'sender': 'grader', 'message': tmp_gd.grader_comment, 'seq_id': seq_id})
                        seq_id += 1
                if not marksview_flags.get('is_rmview_active') and len(regrading_messages)>0:
                    filtered_rg_msgs = []
                    if(regrading_messages[0]['sender']=='student'):
                        filtered_rg_msgs.append(regrading_messages[0])
                    regrading_messages = filtered_rg_msgs
                q_entry['regrading_messages'] = regrading_messages
                question_dict[qid] = q_entry


        overall_details['questions'] = []
        for id in question_arr:
            overall_details['questions'].append(question_dict[id])
        serializer = MySubmissionMarksSerializer(overall_details['questions'] , many = True)
        serData = serializer.data

        if is_interactiveFlag == True:
            return Response({"question_data": serData,
                  'aggregation_method': overall_details['aggregation_method'], "reponseData":returnData}, status=status.HTTP_200_OK)
        else:
            return Response({"question_data": serData, 'submission_images': overall_details['submission_images'], 'aggregation_method': overall_details['aggregation_method']}, status=status.HTTP_200_OK)





