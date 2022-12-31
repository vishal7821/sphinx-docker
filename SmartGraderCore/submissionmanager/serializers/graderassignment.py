import json
from eventmanager.utils import *


class GraderAssignmentSerializer(serializers.Serializer):


    def create(self,validated_data):

        subevent = self.context.get('subevent')
        params = json.loads(subevent.params)
        suploads = params.get('GEN', None)
        grader_list  = params.get( constants.SUBEVENT_GUPLOAD_PARAM_GRADER_LIST, None)
        grading_data_list = params.get('data_list', None)
        gds = params.get('GDS', None)
        rep = params.get('REP', None)

        if gds == 'MQS' or gds == 'MQR':
            qg_list = params.get('data_list', None)  # data list has question_set_id, question_id, grader_list
            # find all the resposes for these questions
            for qg in qg_list:
                q_id = qg.get('question_id')
                r_list = get_responses_by_question(q_id , suploads)

                # q_title = qg.get('question_title')
                # qset_name = qg.get('question_set_name')
                # r_list = get_responses_by_question_title(q_title, qset_name, suploads)

                g_list = qg.get('grader_list')
                # create grading duties
                if gds == 'MQS':
                    # assign  grading duties
                    grading_duty = QuestionGradingDuty(g_list, r_list)
                elif gds == 'MQR':
                    rep = params.get('REP', None)
                    grading_duty = QuestionGradingDuty(g_list, r_list, rep)
                grading_duty.create_grading_duty(subevent)
        elif gds == 'RQS' or gds == 'RQR':
            # find all the responses in gen_subevent suploads
            # gen_subevent_id = self.context.get('request').data.get('gen_subevent', None)
            suploads = params.get('GEN', None)
            r_list=[]
            for gen_subevent_id in suploads:
                r_list.extend(list(get_responses_by_subevent(gen_subevent_id)))

            # find the graders list
            #g_list = list(get_all_graders())
            g_list = params.get( constants.SUBEVENT_GUPLOAD_PARAM_GRADER_LIST, None)
            if gds == 'RQS':
                grading_duty = QuestionGradingDuty(g_list, r_list)
                grading_duty.create_grading_duty(subevent)
            elif gds == 'RQR':
                rep = params.get('REP', None)
                grading_duty = QuestionGradingDuty(g_list, r_list, rep)
                grading_duty.create_grading_duty(subevent)
        elif gds == 'RSS' or gds == 'RSR':
            suploads = params.get('GEN', None)
            submission_group_list = []

            for gen_subevent_id in suploads:
                submission_group_list.extend(get_submissiongroup_by_subevent(gen_subevent_id))
                #s_list.extend(list(submission_group_list.values_list('id', flat=True)))
            # gen_subevent_id = self.context.get('request').data.get('gen_subevent', None)
            # submission_group_list = get_submissiongroup_by_subevent(gen_subevent_id)
            #s_list = list(submission_group_list.values_list('id', flat=True))
            s_list = submission_group_list

            # g_list = list(get_all_graders())
            g_list = params.get(constants.SUBEVENT_GUPLOAD_PARAM_GRADER_LIST, None)
            # distribute submissions among graders
            d = None
            if gds == 'RSS':
                grading_duty = SubmissionGradingDuty(g_list, s_list)
            elif gds == 'RSR':
                rep = params.get('REP', None)
                grading_duty = SubmissionGradingDuty(g_list, s_list, rep)
            grading_duty.create_grading_duty(subevent)

        return subevent



class RegraderAssignmentSerializer(serializers.Serializer):

    student_comment = serializers.CharField(required=True,allow_null=True)

    def validate(self, attrs):
        return attrs

    def create(self,validated_data):

        subevent = self.context.get('subevent')
        rgreq_subevent = self.context.get('rgreq_subevent')
        main_grading_duties = list(self.context.get('gd'))
        response_id = self.context.get('response_id')
        params = json.loads(rgreq_subevent.params)
        gensubevent_list = params.get('GEN')
        rgupload_id = gensubevent_list[0]
        rgupload_subevent = Subevent.objects.filter(id=rgupload_id)
        if not rgupload_subevent.exists():
            raise ValidationException("Invalid rgupload subevent id")
        rgupload_subevent = rgupload_subevent.get()
        params = json.loads(rgupload_subevent.params)
        grader_list  = params.get( constants.SUBEVENT_GUPLOAD_PARAM_REGRADER_LIST, None)
        regrading_data_list = params.get('data_list', None)
        rds = params.get('RDS', None)

        grader_id = getRegrader(rds , grader_list , regrading_data_list , main_grading_duties )

        regrading_duty = RegradingDutyCreation()
        regrading_duty.assign_user_duty(rgupload_subevent , grader_id)

        rgd = GradingDuty.objects.filter(response__id=response_id, request_subevent__id=rgreq_subevent.id).order_by('-created_at')
        student_comment = validated_data.get('student_comment',None)
        if rgd.count()>0 :
            prev_gd = rgd[0]
            data = {'student_comment': student_comment, 'prev_grading_duty': prev_gd, 'grader_id': grader_id,
                    'response': main_grading_duties[0].response, 'subevent': rgupload_subevent,
                    'request_subevent': rgreq_subevent, 'marks_adjustment': prev_gd.marks_adjustment,
                    'aggregate_marks': prev_gd.aggregate_marks,
                    'is_aggregate_marks_dirty': prev_gd.is_aggregate_marks_dirty, 'is_regrading': False,
                    'is_completed': False}
            rgd = regrading_duty.create_grading_duty_entry(data)
            prev_gd_has_rubrics = GradingdutyHasRubrics.objects.filter(gradingduty = prev_gd)
            for i in prev_gd_has_rubrics:
                entry_data = {'gradingduty' :rgd , 'rubric' : i.rubric}
                entry = GradingdutyHasRubrics(**entry_data)
                entry.save()
        else:
            prev_gd = main_grading_duties[0]
            if prev_gd.is_aggregate_marks_dirty :
                prev_gd.aggregate_marks = recompute_aggregate_marks(prev_gd.id, prev_gd.marks_adjustment)
                prev_gd.is_aggregate_marks_dirty = False
                prev_gd.save()
            data = {'student_comment': student_comment, 'prev_grading_duty': prev_gd, 'grader_id': grader_id,
                    'response': main_grading_duties[0].response, 'subevent': rgupload_subevent,
                    'request_subevent': rgreq_subevent, 'marks_adjustment': 0,'is_regrading': False,
                    'is_completed': False}
            rgd = regrading_duty.create_grading_duty_entry(data)


        return rgd



