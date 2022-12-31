import datetime
import random
from datetime import timezone
from rest_framework import serializers
import json
from eventmanager.models import *
from helper import messages, constants
from helper.exceptions import *
from django.utils.crypto import constant_time_compare, get_random_string
from django.db.models import  Q
from coursemanager.models import *

def validate_access_code(submitted_access_code, access_code_gold):
    if not constant_time_compare(submitted_access_code, access_code_gold):
        raise AccessException(detail="invalid access code")


def get_submissiongroup_has_user( event_id, enrollment_id):
    submission_group_has_user = SubmissionGroupHasUser.objects.filter(submission_group__subevent__event__id=event_id,
                                                                      submission_group__subevent__type='SUPLOAD',
                                                                      enrollment__id=enrollment_id
                                                                      )
    if submission_group_has_user.count() == 0:
        raise AccessException()
    return submission_group_has_user.get()


def validate_subevent_active_at_moment( subevent):
    end_time = None
    start_time = subevent.start_time
    if subevent.allow_late_ending:
        end_time = subevent.late_end_time
    else:
        end_time = subevent.end_time
    now = datetime.datetime.now(timezone.utc)

    if not (start_time <= now and now <= end_time):
        raise EventError()


def is_subevent_active_at_moment( subevent):
    end_time = None
    start_time = subevent.start_time
    if subevent.allow_late_ending:
        end_time = subevent.late_end_time
    else:
        end_time = subevent.end_time
    now = datetime.datetime.now(timezone.utc)

    if not (start_time <= now and now <= end_time):
        return False
    return True


def get_gupload_subevent(event_id, subevent_id):
    subevent = Subevent.objects.filter(id = subevent_id ,event__id = event_id , type = 'GUPLOAD')
    if subevent.count() == 0:
        raise ValidationException('Invalid subevent id')
    validate_subevent_active_at_moment(subevent.get())
    return subevent.get()

def validate_gupload_subevent(event_id, subevent_id):
    subevent = Subevent.objects.filter(id = subevent_id ,event__id = event_id , type = 'GUPLOAD')
    if subevent.count() == 0:
        raise ValidationException('Invalid subevent id')
    # validate_subevent_active_at_moment(subevent.get())
    return

def get_user_has_subevent(subevent_id, enrollment_id):
    uhs = UserHasSubevents.objects.filter(subevent__id=subevent_id, enrollment__id=enrollment_id)
    if len(uhs) == 0:
        raise EventError()
    return uhs.get()


def validate_user_has_subevents(subevent_id, enrollment_id, subevent, event_id):
    # return all the subevents of given type

    uhs = UserHasSubevents.objects.filter(subevent__id=subevent_id,
                                          enrollment__id=enrollment_id)
    if len(uhs) == 0:
        raise EventError()
    if (not is_subevent_active_at_moment(subevent)):
        if subevent.type == 'GUPLOAD':
            uhs_gview = UserHasSubevents.objects.filter(subevent__event__id=event_id, subevent__type='GVIEW',
                                                        enrollment__id=enrollment_id)
            if len(uhs_gview) == 0:
                raise EventError()
            se = uhs_gview[0]
            validate_subevent_active_at_moment(se.subevent)
        elif subevent.type == 'RGUPLOAD':
            uhs_gview = UserHasSubevents.objects.filter(subevent__event__id=event_id, subevent__type='RGVIEW',
                                                        enrollment__id=enrollment_id)
            if len(uhs_gview) == 0:
                raise EventError()
            se = uhs_gview[0]
            validate_subevent_active_at_moment(se.subevent)

def recompute_aggregate_marks(gradingduty_id , marks_adjustment =0 ):
    gradingduty_has_rubrics = get_gradingduty_has_rubrics(gradingduty_id)
    aggregated_marks = 0
    for gdhs in gradingduty_has_rubrics:
        if gdhs.rubric.marks:
            aggregated_marks += gdhs.rubric.marks
    if marks_adjustment is not None:
        aggregated_marks += marks_adjustment
    return aggregated_marks

def get_grading_duty( gradingduty_id):
    gd = GradingDuty.objects.filter(id = gradingduty_id)
    if gd.count() == 0:
        raise ValidationException('Invalid grading duty id')
    return gd.get()

def get_gd_by_submission_group( submission_group_id):
    gd = GradingDuty.objects.filter(response__submission_group__id = submission_group_id)
    return gd


def get_upload_subevent(event_id, subevent_id):
    subevent = Subevent.objects.filter(id = subevent_id ,event__id = event_id)
    if subevent.count() == 0:
        raise ValidationException('Invalid subevent id')
    subevent = subevent.get()
    if subevent.type not in ['GUPLOAD' , 'RGUPLOAD']:
        raise ValidationException('Invalid subevent id')
    validate_subevent_active_at_moment(subevent)
    return subevent




def get_marksview_subevent(event_id, enrollment_id):
    userhassubevents = UserHasSubevents.objects.filter( Q(subevent__event__id = event_id) , Q(enrollment__id=enrollment_id),Q(subevent__type='MVIEW') | Q(subevent__type='RMVIEW'))
    if userhassubevents.count() == 0:
        raise PermissionError()
    is_rmview_active = False
    is_mview_active = False

    for uhse in userhassubevents:
        if is_subevent_active_at_moment(uhse.subevent):
            if uhse.subevent.type =='MVIEW':
                is_mview_active = True
            if uhse.subevent.type == 'RMVIEW':
                is_rmview_active = True

    if not (is_rmview_active or is_mview_active):
        raise EventError()
    return {'is_mview_active':is_mview_active , 'is_rmview_active':is_rmview_active}

def get_grader_subevent(event_id, subevent_id):
    subevent = Subevent.objects.filter(id = subevent_id ,event__id = event_id)
    if subevent.count() == 0:
        raise ValidationException('Invalid subevent id')
    subevent = subevent.get()
    if subevent.type not in ['GUPLOAD' , 'RGUPLOAD' ,'GVIEW' , 'RGVIEW']:
        raise ValidationException('Invalid subevent id')
    validate_subevent_active_at_moment(subevent)
    return subevent

def get_any_subevent(event_id, subevent_id):
    subevent = Subevent.objects.filter(id = subevent_id ,event__id = event_id)
    if subevent.count() == 0:
        raise ValidationException('Invalid subevent id')
    subevent = subevent.get()
    if subevent.type not in ['GUPLOAD' , 'RGUPLOAD' ,'GVIEW' , 'RGVIEW']:
        raise ValidationException('Invalid subevent id')
    # validate_subevent_active_at_moment(subevent)
    return subevent


def get_gradingduty_has_rubrics(gradingduty_id):
    gdhr = GradingdutyHasRubrics.objects.filter(gradingduty__id=gradingduty_id)
    return gdhr

def get_user_supload_subevent(event_id, enrollment_id):
    uhs = UserHasSubevents.objects.filter(subevent__event__id=event_id, enrollment__id=enrollment_id,
                                          subevent__type='SUPLOAD')
    if uhs.count() == 0:
        raise EventError()
    subevent = (uhs.get()).subevent
    validate_subevent_active_at_moment(subevent)
    return subevent

def get_user_rgreq_subevent(event_id, enrollment_id):
    uhs = UserHasSubevents.objects.filter(subevent__event__id=event_id, enrollment__id=enrollment_id,
                                          subevent__type='RGREQ')
    if uhs.count() == 0:
        raise EventError()
    subevent = (uhs.get()).subevent
    validate_subevent_active_at_moment(subevent)
    return subevent

def get_responses_by_question( q_id , suploads):
    try:
        q = Question.objects.get(id=q_id)
        responses = []
        for s in suploads:
            # sub_groups_supload = SubmissionGroup.objects.filter( subevent__id= s)
            # for submission_group in sub_groups_supload:
            res = SubmissionResponse.objects.filter(submission_group__subevent__id = s , question__id = q_id).exclude(upload_page_no = -1)
            responses.extend(res)

        return list(set(responses))
    except Question.DoesNotExist:
        raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_13)
def get_responses_by_question_title( q_title ,qset_name, suploads):
    try:
        q = Question.objects.get(title=q_title, question_set__name = qset_name )
        responses = []
        for s in suploads:
            # sub_groups_supload = SubmissionGroup.objects.filter( subevent__id= s)
            # for submission_group in sub_groups_supload:
            res = SubmissionResponse.objects.filter(submission_group__subevent__id = s , question__id = q.id).exclude(upload_page_no = -1)
            responses.extend(res)

        return list(set(responses))
    except Question.DoesNotExist:
        raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_13)


def get_responses_by_subevent( id):

    responses = SubmissionResponse.objects.filter(submission_group__subevent__id = id).exclude(upload_page_no = -1)
    return responses

def get_submissiongroup_by_subevent( id):
    try:
        return SubmissionGroup.objects.filter(subevent__id = id )
    except SubmissionGroup.DoesNotExist:
        raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_14)


def get_all_graders():
    return Enrollment.objects.filter(role__id=constants.ROLE_GRADER_ID).values_list('id',flat=True)


def assign_grading_duty( r_list, g_list, r = 1):
    random.shuffle(r_list)
    random.shuffle(g_list)
    g_d_list = {}
    g_c = len(g_list)
    r_c = len(r_list)
    updated_r_list = []
    for i in range( r):
        updated_r_list.extend(r_list)
    r_list = updated_r_list
    g_s =  int((r_c *r ) /g_c)  # response count per grader
    j = 0
    i = 0
    while i < (g_s *g_c):
        if not g_list[j] in g_d_list.keys():
            g_d_list[g_list[j]] = []
        g_d_list[g_list[j]].extend(r_list[i:( i +g_s)])
        i += (g_s)
        j += 1
    j = 0
    while i< len(r_list):
        if not g_list[j] in g_d_list.keys():
            g_d_list[g_list[j]] = []
        g_d_list[g_list[j]].extend(r_list[i:i + 1])
        i += 1
        j += 1
    return g_d_list

def getRegrader(rds , grader_list , regrading_data_list , main_grading_duties):
    regrader=None
    if rds == 'SOR' :
        random.shuffle(main_grading_duties)
        regrader = main_grading_duties[0].grader.id
    elif rds == 'RAN':
        regrader =random.choice(grader_list)
    elif rds == 'QRN' :
        g_list = None
        question_id = main_grading_duties[0].response.question.id
        for qg in regrading_data_list:
            q_id = qg.get('question_id')
            if q_id == question_id:
                g_list = qg.get('grader_list')

        if g_list is None:
            raise ValidationException('No graders are mentioned for given response')
        regrader = random.choice(g_list)
    return regrader

def create_enrollment_has_subevents(enrollments,subevent):
    for enrollment in enrollments:
        user_has_subevent = UserHasSubevents(subevent=subevent, enrollment=enrollment)
        user_has_subevent.save()

def validate_participants_list(enrollments , type , event):
    # if type in ['SVIEW', 'MVIEW', 'RMVIEW','RGREQ']:
    # if type in ['RGREQ']:
    #     for e in enrollments:
    #         if not UserHasSubevents.objects.filter(enrollment = e, subevent__type = 'SUPLOAD' , subevent__event = event).exists():
    #             raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_7)

    if type == 'GVIEW':
        for e in enrollments:
            if not UserHasSubevents.objects.filter(enrollment = e, subevent__type = 'GUPLOAD' , subevent__event = event).exists():
                raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_8)

    if type == 'RGVIEW':
        for e in enrollments:
            if not UserHasSubevents.objects.filter(enrollment = e, subevent__type = 'RGUPLOAD' , subevent__event = event).exists():
                raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_9)

def get_responses_per_submission_group(submission_group_id):
    submission_group_has_responses = SubmissionResponse.objects.filter(
        submission_group__id=submission_group_id
    )
    return submission_group_has_responses

def get_section_list_enrollments(section_list):
    section_list = section_list.split('|')
    section_enrollments = []
    for section_id in section_list:
        enrollments = EnrollmentHasSections.objects.filter(section_id=section_id).values_list('enrollment', flat=True)
        section_enrollments.extend(enrollments)
    return list(set(section_enrollments))

def is_lists_intersects(lst1,lst2):
    res_list = list(set(lst1) & set(lst2))
    if len(res_list)>0:
        return True
    else:
        return False


class GradingDutyCreation:

    def __init__(self,graders = None, responses = None):
        self.graders = graders
        self.responses = responses
        if graders is None :
            self.graders =[]
        if responses is None:
            self.responses = []
        # self.graders.append(graders)
        # self.responses.append(responses)

    def assign_user_duty(self, subevent, grader):
        if not UserHasSubevents.objects.filter(subevent_id=subevent.id, enrollment_id=grader).exists():
            u_h_s = UserHasSubevents(**{'subevent': subevent, 'enrollment_id': grader})
            u_h_s.save()

    def create_grading_duty_entry(self, grader, response, subevent):

        if not GradingDuty.objects.filter(grader_id= grader, response= response, subevent= subevent).exists():
            data = {'grader_id': grader, 'response': response, 'subevent': subevent,
                    'is_regrading': False, 'is_completed': False
                , 'is_late_grading': False}
            g_d = GradingDuty(**data)
            g_d.save()

class RegradingDutyCreation:


    def assign_user_duty(self, subevent, grader):
        if not UserHasSubevents.objects.filter(subevent_id=subevent.id, enrollment_id=grader).exists():
            u_h_s = UserHasSubevents(**{'subevent': subevent, 'enrollment_id': grader})
            u_h_s.save()

    def create_grading_duty_entry(self, data):
        g_d = GradingDuty(**data)
        g_d.save()
        return g_d




class QuestionGradingDuty(GradingDutyCreation):
    def __init__(self,graders,responses, rep= None):
        super().__init__(graders,responses)
        self.rep = rep

    def create_grading_duty(self,subevent):
        assigned_grader_responses = []
        if self.rep is None:
            assigned_grader_responses = assign_grading_duty(self.responses, self.graders)
        else:
            assigned_grader_responses = assign_grading_duty(self.responses, self.graders, self.rep)
        for k in assigned_grader_responses:
            grader = k
            responses = assigned_grader_responses[k]
            # create grading duty
            for response in responses:
                self.create_grading_duty_entry(grader, response, subevent)
            self.assign_user_duty(subevent,grader)



class SubmissionGradingDuty(GradingDutyCreation):
    def __init__(self,graders,submissions,rep= None):
        super().__init__(graders,None)
        self.rep = rep
        self.submissions = submissions


    def create_grading_duty(self,subevent):
        assigned_grader_submission_groups = []
        if self.rep is None:
            assigned_grader_submission_groups= assign_grading_duty(self.submissions, self.graders)
        else:
            assigned_grader_submission_groups = assign_grading_duty(self.submissions, self.graders, self.rep)
        for k in assigned_grader_submission_groups:
            grader = k
            submission_groups = assigned_grader_submission_groups[k]
            # find all the response of this group
            for submission_group in submission_groups:
                responses = SubmissionGroup.objects.filter(id=submission_group.id).get().submissionresponse_set.all()
                for response in responses:
                    if response.upload_page_no != -1:
                        self.create_grading_duty_entry(grader,response,subevent)
                self.assign_user_duty(subevent,grader)


