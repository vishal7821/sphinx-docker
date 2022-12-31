from eventmanager.utils import *
from rest_framework import fields
from eventmanager import validators
import json



class GuploadSerializer(serializers.Serializer):
    GDS = serializers.ChoiceField(choices=['MQS','MQR','RQS','RQR','RSS','RSR'],required=True)
    REP = serializers.IntegerField(required=False,allow_null=True)
    GLIST = serializers.CharField(max_length=500,required=False)
    plist_CSV_FILE = serializers.FileField(required=False)
    gen_subevent = serializers.ListField(child=serializers.CharField(), required=False)
    plist_subevents = serializers.ListField(child=serializers.CharField(allow_blank = True),  required=False)
    def __init__(self,data = fields.empty,**kwargs):
        super().__init__(data = data,**kwargs)
        self.GDS_REPETITION = ['MQR','RQR','RSR']
        self.GDS_CSV_REQUIRED = ['MQS','MQR']

    def validate_gen_subevent(self, value):
        if len(value)>0 and isinstance(value[0], str):
            value = json.loads(value[0])
        return value
    def validate_plist_subevents(self, value):
        if len(value)>0 and isinstance(value[0], str):
            value = json.loads(value[0])
        return value

    def validate(self,attrs):
        required_csv_fields = []

        #validate whether SUPLOAD is already present or not
        if not Subevent.objects.filter(event = self.context.get('event') , type = 'SUPLOAD').exists() :
            raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_39)

        #validate participants_spec
        if 'participants_spec' not in self.context.get('request').data:
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_13)

        #validate gen_subevent list
        if not ('gen_subevent' in attrs and attrs['gen_subevent']):
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_14)
        gen_subevent = attrs['gen_subevent']
        for id in gen_subevent:
            if not Subevent.objects.filter(pk= id , type= 'SUPLOAD' , event = self.context.get('event')).exists():
                raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_2)

        gds = attrs.get('GDS')
        rep = attrs.get('REP')

        if gds in self.GDS_REPETITION and (not rep or rep <= 0):
            raise serializers.ValidationError({"REP": "rep is required and it must be strictly positive"})

        required_csv_fields.append(constants.GRADER_LIST)
        if gds in self.GDS_CSV_REQUIRED:
            # validate participants_spec
            if not int(self.context.get('request').data['participants_spec']):
                if not ('plist_CSV_FILE' in attrs and attrs.get('plist_CSV_FILE')):
                    raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_15)
            else:
                raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_15)

            required_csv_fields.append(constants.QUESTION_SET)
            required_csv_fields.append(constants.QUESTION)
            p_csv_file =  attrs.get('plist_CSV_FILE',None)

            course_id = self.context.get('course_id')
            event = self.context.get('event')
            data = validators.validate_gupload_csv_data(p_csv_file, required_csv_fields, event, course_id, rep)
            self.context['data_list'] = data.get('data_list')
            self.context['grader_list'] = data.get('grader_list')
        else:

            if not int(self.context.get('request').data['participants_spec']):
                if not ('plist_CSV_FILE' in attrs and attrs.get('plist_CSV_FILE')):
                    raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_11)
                p_csv_file =  attrs.get('plist_CSV_FILE',None)
                course_id = self.context.get('course_id')
                event = self.context.get('event')
                data = validators.validate_gupload_csv_data(p_csv_file, required_csv_fields, event, course_id, rep)
                self.context['data_list'] = data.get('data_list')
                self.context['grader_list'] = data.get('grader_list')

            else:
                # validating participants subevent list and fetching all enrollments of subevents of plist_subevents
                if not ('plist_subevents' in attrs and attrs['plist_subevents']):
                    raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_12)
                plist_subevents = attrs['plist_subevents']
                all_enrollments = []
                for subevent in plist_subevents:
                    enrollment = UserHasSubevents.objects.filter(subevent=subevent).values_list('enrollment', flat=True)
                    all_enrollments.extend(enrollment)
                enrollments = set(all_enrollments)
                self.context['data_list'] = []
                self.context['grader_list'] = enrollments




        return attrs


    def create(self, validated_data):
        # get the list of all the graders
        #   find the list of all the solution for this assignment
        #   if GDS = RQS shuffle the submissions and form sets of size total #submission/#grader and assign grader to sets
        #   if GDS = RQR same as RQS assign each grader $max sets
        #    find list of all the submission groups
        #   if GDS = RSS , shuffle groups find the list of all submission, divide submission among graders, asisgn grading duty
        #               for all the solutions to that grader
        #   if GDS = RSS same as above but assign $MAX submission to grader
        #   if GDS = MQS
        #           process csv , for each row ,
        #               find the list of all the solution for this question ,
        #               divide the solutions randomly among graders and create grading duty
        #   if GDS = MQR$rep
        #           process csv , for each row ,
        #               find the list of all the solution for this question ,
        #               divide the solutions randomly among graders and create grading duty such that each solution == graded by rep
        #               graders
        gds = validated_data['GDS']

        rep = validated_data.get('REP',None)
        subevent = self.context.get('subevent')
        data_list = list(self.context.get('data_list',None))
        grader_list =  list(self.context.get('grader_list',None))
        GEN = validated_data['gen_subevent']
        param = {'GDS': gds , 'REP' : rep, 'GEN': GEN , 'data_list': data_list , constants.SUBEVENT_GUPLOAD_PARAM_GRADER_LIST: grader_list}

        #to be used during grading duty creation
        # if gds == 'MQS' or gds is 'MQR':
        #     qg_list = self.context.get('data_list') # data list has question_set_id, question_id, grader_list
        #     param['GLIST'] = qg_list
        #     #find all the resposes for these questions
        #     for qg in qg_list:
        #         q_id = qg.get('question_id')
        #         r_list = get_responses_by_question(q_id)
        #         g_list = qg.get('grader_list')
        #         #create grading duties
        #         d=None
        #         if gds == 'MQS':
        #             # assign  grading duties
        #             d = assign_grading_duty(r_list,g_list)
        #         elif gds == 'MQR':
        #             # create rep*r grading duties
        #             rep = validated_data['REP']
        #             d = assign_grading_duty(r_list,g_list,rep)
        #             # d contains {grader_enrollment_id:[list of response ids]}
        #         for k in d:
        #             grader = k
        #             response = d[k]
        #             # create grading duty
        #             for r in response:
        #                 data = {'grader_id': grader, 'response': r, 'subevent': subevent,
        #                         'is_regrading': False, 'is_completed': False
        #                     , 'is_late_grading': False}
        #                 g_d = GradingDuty(**data)
        #                 g_d.save()
        #             # create user has subevent
        #             if not UserHasSubevents.objects.filter(subevent_id = subevent.id , enrollment_id = grader).exists():
        #                 u_h_s = UserHasSubevents(**{'subevent':subevent, 'enrollment_id':grader})
        #                 u_h_s.save()
        # elif gds == 'RQS' or gds == 'RQR':
        #     # find all the responses in gen_subevent
        #     gen_subevent_id = self.context.get('request').data.get('gen_subevent', None)
        #     r_list = list(get_responses_by_subevent(gen_subevent_id))
        #     # find all the graders in the course
        #     g_list = list(get_all_graders())
        #     d = None
        #     if gds == 'RQS':
        #         d = assign_grading_duty(r_list, g_list)
        #     elif gds == 'RQR':
        #         rep = validated_data['REP']
        #         d = assign_grading_duty(r_list,g_list,rep)
        #     for k in d:
        #         grader = k
        #         response_ids = d[k]
        #         # create grading duty
        #         for r in response_ids:
        #             data = {'grader_id': grader, 'response_id': r, 'subevent': subevent,
        #                     'is_regrading': False, 'is_completed': False
        #                 , 'is_late_grading': False}
        #             g_d = GradingDuty(**data)
        #             g_d.save()
        #         if not UserHasSubevents.objects.filter(subevent_id=subevent.id, enrollment_id=grader).exists():
        #             u_h_s = UserHasSubevents(**{'subevent': subevent, 'enrollment_id': grader})
        #             u_h_s.save()
        # elif gds == 'RSS' or gds == 'RSR':
        #     gen_subevent_id = self.context.get('request').data.get('gen_subevent', None)
        #     submission_group_list = get_submissiongroup_by_subevent(gen_subevent_id)
        #     s_list = list(submission_group_list.values_list('id',flat = True))
        #     g_list = list(get_all_graders())
        #     # distribute submissions among graders
        #     d = None
        #     if gds == 'RSS':
        #         d = assign_grading_duty(s_list, g_list)
        #     elif gds == 'RSR':
        #         rep = validated_data['REP']
        #         d = assign_grading_duty(s_list, g_list, rep)
        #     # d is {grader : submission_group_list}
        #     for k in d:
        #         grader = k
        #         s_group = d[k]
        #         # find all the response of this group
        #         for s in s_group:
        #             responses = submission_group_list.filter(id = s).get().submissionresponse_set.all()
        #             for r in responses:
        #                 data = {'grader_id': grader, 'response': r, 'subevent': subevent,
        #                         'is_regrading': False, 'is_completed': False
        #                     , 'is_late_grading': False}
        #                 g_d = GradingDuty(**data)
        #                 g_d.save()
        #             if not UserHasSubevents.objects.filter(subevent_id=subevent.id, enrollment_id=grader).exists():
        #                 u_h_s = UserHasSubevents(**{'subevent': subevent, 'enrollment_id': grader})
        #                 u_h_s.save()
        #saving glist into param
        subevent.params = json.dumps(param)
        subevent.save()

        #create Enrollmenthassubevent entries
        enrollment_ids = grader_list
        enrollments = []
        for id in enrollment_ids:
            e = Enrollment.objects.get(pk=id)
            enrollments.append(e)
        # create enrollmentHasSubevent entries
        create_enrollment_has_subevents(enrollments, self.context.get('subevent'))
        return subevent


    #todo implemented but not tested, use this create before testing, this is class based
    def create1(self, validated_data):
        # get the list of all the graders
        #   find the list of all the solution for this assignment
        #   if GDS = RQS shuffle the submissions and form sets of size total #submission/#grader and assign grader to sets
        #   if GDS = RQR same as RQS assign each grader $max sets
        #    find list of all the submission groups
        #   if GDS = RSS , shuffle groups find the list of all submission, divide submission among graders, asisgn grading duty
        #               for all the solutions to that grader
        #   if GDS = RSS same as above but assign $MAX submission to grader
        #   if GDS = MQS
        #           process csv , for each row ,
        #               find the list of all the solution for this question ,
        #               divide the solutions randomly among graders and create grading duty
        #   if GDS = MQR$rep
        #           process csv , for each row ,
        #               find the list of all the solution for this question ,
        #               divide the solutions randomly among graders and create grading duty such that each solution is graded by rep
        #               graders
        gds = validated_data['GDS']
        subevent = self.context.get('subevent')

        param = {'GDS': gds}

        if gds == 'MQS' or gds == 'MQR':
            qg_list = self.context.get('data_list') # data list has question_set_id, question_id, grader_list
            param['GLIST'] = qg_list
            #find all the resposes for these questions
            for qg in qg_list:
                q_id = qg.get('question_id')
                r_list = get_responses_by_question(q_id)
                g_list = qg.get('grader_list')
                #create grading duties
                d=None
                if gds == 'MQS':
                    # assign  grading duties
                    grading_duty = QuestionGradingDuty(g_list,r_list)
                elif gds == 'MQR':
                    rep = validated_data['REP']
                    grading_duty = QuestionGradingDuty(g_list,r_list,rep)
                grading_duty.create_grading_duty(subevent)
        elif gds == 'RQS' or gds == 'RQR':
            # find all the responses in gen_subevent
            gen_subevent_id = self.context.get('request').data.get('gen_subevent', None)
            r_list = list(get_responses_by_subevent(gen_subevent_id))
            # find all the graders in the course
            g_list = list(get_all_graders())
            d = None
            if gds == 'RQS':
                grading_duty = QuestionGradingDuty(g_list,r_list)
                grading_duty.create_grading_duty(subevent)
            elif gds == 'RQR':
                rep = validated_data['REP']
                grading_duty = QuestionGradingDuty(g_list, r_list, rep)
                grading_duty.create_grading_duty(subevent)
        elif gds == 'RSS' or gds == 'RSR':
            gen_subevent_id = self.context.get('request').data.get('gen_subevent', None)
            submission_group_list = get_submissiongroup_by_subevent(gen_subevent_id)
            s_list = list(submission_group_list.values_list('id',flat = True))
            g_list = list(get_all_graders())
            # distribute submissions among graders
            d = None
            if gds == 'RSS':
                grading_duty = SubmissionGradingDuty(g_list,s_list)
            elif gds == 'RSR':
                rep = validated_data['REP']
                grading_duty = SubmissionGradingDuty(g_list, s_list, rep)
                grading_duty.create_grading_duty(subevent)
        #saving glist into param
        subevent.params = json.dumps(param)
        subevent.save()
        return subevent



