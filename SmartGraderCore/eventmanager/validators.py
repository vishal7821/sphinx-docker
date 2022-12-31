from rest_framework import serializers
from helper import messages, constants, exceptions
from eventmanager.models import Enrollment, QuestionSet, Question
from authentication.models import UserHasCourses, User
from django.core.exceptions import MultipleObjectsReturned
import csv, os, hashlib


def validate_all_times(e_t, l_e_t, d_e_t, d_l_e_t):
    # validate_time(e_t, l_e_t)
    # validate_time(e_t, d_e_t)
    # validate_time(d_e_t, d_l_e_t)
    if e_t and l_e_t and (l_e_t < e_t):
        raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_5_1)
    if e_t and d_e_t and (e_t < d_e_t):
        raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_5_2)
    if d_e_t and d_l_e_t and (d_l_e_t < d_e_t):
        raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_5_3)


def validate_time(s_t, e_t):
    if e_t and s_t and (e_t < s_t):
        raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_5)




def validate_gen_type(subevent_type, gen_type):
    # validate specific gen_subevent_type
    SUPLOAD_DEPENDENT_SUBEVENT_TYPES = ['SVIEW', 'GUPLOAD', 'RGREQ']
    SUPLOAD_GUPLOAD_DEPENDENT_SUBEVENT_TYPES = ['QVIEW', 'GVIEW', 'AVIEW']
    GUPLOAD_DEPENDENT_SUBEVENT_TYPES = ['RGUPLOAD']

    if subevent_type in SUPLOAD_GUPLOAD_DEPENDENT_SUBEVENT_TYPES and gen_type not in [constants.SUBEVENT_TYPE_SUPLOAD,
                                                                                      constants.SUBEVENT_TYPE_GUPLOAD]:
        raise exceptions.ValidationException(messages.EVENT_MANAGER_NOVAL_19_1)
    elif subevent_type in SUPLOAD_DEPENDENT_SUBEVENT_TYPES and gen_type != constants.SUBEVENT_TYPE_SUPLOAD:
        raise exceptions.ValidationException(messages.EVENT_MANAGER_NOVAL_19_2)
    elif subevent_type in GUPLOAD_DEPENDENT_SUBEVENT_TYPES and gen_type != constants.SUBEVENT_TYPE_GUPLOAD:
        raise exceptions.ValidationException(messages.EVENT_MANAGER_NOVAL_19_3)
    # commenting below code as gensubevent type requirement changes as only supload and gupload have userhassubevent entry
    # gen_subevent_list_qview = [constants.SUBEVENT_TYPE_SUPLOAD ,constants.SUBEVENT_TYPE_RGUPLOAD
    #                            ,constants.SUBEVENT_TYPE_RGUPLOAD]
    # if subevent_type == constants.SUBEVENT_TYPE_GUPLOAD and gen_type != constants.SUBEVENT_TYPE_SUPLOAD:
    #     raise exceptions.ValidationException(messages.EVENT_MANAGER_NOVAL_19)
    # elif subevent_type == constants.SUBEVENT_TYPE_RGUPLOAD and gen_type != constants.SUBEVENT_TYPE_SUPLOAD:
    #     raise exceptions.ValidationException(messages.EVENT_MANAGER_NOVAL_20)
    # elif subevent_type == constants.SUBEVENT_TYPE_QVIEW and gen_type not in gen_subevent_list_qview:
    #     raise exceptions.ValidationException(messages.EVENT_MANAGER_NOVAL_21)


def validate_name(event, name):
    if event and event.subevents.filter(name=name).exists():
        raise exceptions.DuplicateEntryException(messages.EVENT_MANAGER_NOVAL_7)


# TODO check if this enrollment has this role in this course
def validate_enrollment(event_id, username, course_id, role):
    # student must be enrolled in the course
    enrollment = None
    try:
        uhc = UserHasCourses.objects.get(user__username=username, course_id=course_id)
        # uhc = UserHasCourses.objects.get(enrollment_id=username, course_id=course_id)
    except UserHasCourses.DoesNotExist:
        raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_8)
    except MultipleObjectsReturned:
        raise serializers.ValidationError(detail="user is enrolled in same course multiple times , its inconstient",
                                          code="MISC")
    return uhc.enrollment_id

    # this user should not have more than one  subevent_type subevent of this event


def validate_unique_user_has_subevent(enroll_id, event_id, subevent_type):
    try:
        enrollment = Enrollment.objects.get(id=enroll_id)
    except Enrollment.DoesNotExist:
        raise serializers.ValidationError(detail="inconsistent databases", code="NOVAL")
    if enrollment.subevents.filter(event_id=event_id, type=subevent_type).exists():
        raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_10)

    return enrollment.id


def validate_question_set(val, assignment_id):
    try:
        return QuestionSet.objects.get(name=val, assignment__id=assignment_id)
    except QuestionSet.DoesNotExist:
        raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_9)


def validate_supload_csv_data(file, csv_fields, event, course_id):
    # validate columns in csv file
    decoded_file = file.read().decode('utf-8').splitlines()
    reader = csv.DictReader(decoded_file)
    data_list = list(reader)
    group_list = list()
    all_enrollments = list()

    if len(data_list) ==0:
        raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_35)
    for e in data_list:

        if not all(name in e for name in csv_fields):
            raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_35)

        group = {}

        if constants.QUESTION_SET_NAME in csv_fields:
            qs = e[constants.QUESTION_SET_NAME]
            group[constants.QUESTION_SET_NAME] = qs
            validate_question_set(qs, event.assignment.id)

        if constants.SECRET_ACCESS_CODE in csv_fields:
            if not e[constants.SECRET_ACCESS_CODE]:
                raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_35)
            # validate NAC contains only alphanumeric chars or not
            if not e[constants.SECRET_ACCESS_CODE].isalnum():
                raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_38)

            group[constants.SECRET_ACCESS_CODE] = e[constants.SECRET_ACCESS_CODE]

        if constants.USERNAME_LIST in csv_fields:
            usernames = e[constants.USERNAME_LIST].split('|')

            if not usernames:
                raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_35)

            enrollments = []

            for u in usernames:
                enroll_id = validate_enrollment(event.id, u, course_id, constants.ROLE_STUDENT)
                enrollments.append(enroll_id)
                validate_unique_user_has_subevent(enroll_id, event.id, constants.SUBEVENT_TYPE_SUPLOAD)
            group[constants.USERNAME_LIST] = usernames
            group['enrollment_list'] = enrollments
            all_enrollments.extend(enrollments)
        group_list.append(group)

    # repeated username
    if len(all_enrollments) != len(set(all_enrollments)):
        raise exceptions.DuplicateEntryException(
            detail='username is repeated in csv file. correct it and try again')
    return group_list


def validate_subevent_participants_csv_data(file, csv_fields, event, course_id):
    decoded_file = file.read().decode('utf-8').splitlines()
    reader = csv.DictReader(decoded_file)
    data_list = list(reader)

    all_enrollments = list()
    for e in data_list:
        # validate columns in csv file
        if not all(name in e for name in csv_fields):
            raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_35)

        usernames = e[constants.USERNAME_LIST].split('|')
        if not usernames:
            raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_35)

        enrollments = []
        for u in usernames:
            enroll_id = validate_enrollment(event.id, u, course_id, None)
            enrollments.append(enroll_id)

        all_enrollments.extend(enrollments)

    # repeated username
    if len(all_enrollments) != len(set(all_enrollments)):
        raise exceptions.DuplicateEntryException(
            detail='username is repeated in csv file. correct it and try again')
    return all_enrollments


def validate_question(qs_id, q_title):
    q = Question.objects.filter(question_set__id=qs_id, title=q_title)
    if not q.exists():
        raise serializers.ValidationError(detail={"question": "question in csv does not exists"}, code='NOVAL')
    que = q.get()
    if que.is_actual_question == False:
        raise serializers.ValidationError(detail={"question": "question in csv is not an actual question"},
                                          code='NOVAL')
    return que


# def validate_gupload_csv_data(file, event, course_id, rep=None):
#     decoded_file = file.read().decode('utf-8').splitlines()
#     reader = csv.DictReader(decoded_file)
#     csv_data = list(reader)
#     data_list = list()
#
#     for e in csv_data:
#         data = {}
#
#         qs_name = e.get(constants.QUESTION_SET, None)
#         qs = validate_question_set(qs_name, event.assignment.id)
#         data['question_set_name'] = qs_name
#         q = e.get(constants.QUESTION)
#         data['question_id'] = validate_question(qs.id, q).id
#
#         graders_username = e[constants.GRADER_LIST].split(',')
#
#         if rep and len(graders_username) < rep:
#             raise serializers.ValidationError(
#                 detail={"csv_graders": "number of graders is less than rep, change and try again"}, code='NOVAL')
#
#         graders = []
#         for u in graders_username:
#             graders.append(validate_enrollment(event.id, u, course_id, constants.ROLE_GRADER))
#         data['grader_list'] = graders
#         data_list.append(data)
#     return data_list


def validate_gupload_csv_data(file, csv_fields, event, course_id , rep=None):
    # validate columns in csv file



    decoded_file = file.read().decode('utf-8').splitlines()
    reader = csv.DictReader(decoded_file)
    csv_data = list(reader)
    data_list = list()
    grader_list  = list()

    if len(csv_data) ==0:
        raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_35)
    for e in csv_data:

        if not all(name in e for name in csv_fields):
            raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_35)

        data = {}

        if constants.QUESTION_SET_NAME in csv_fields:
            qs_name = e.get(constants.QUESTION_SET, None)
            qs = validate_question_set(qs_name, event.assignment.id)
            data['question_set_name'] = qs_name

        if constants.QUESTION in csv_fields:
            q = e.get(constants.QUESTION)
            data['question_id'] = validate_question(qs.id, q).id



        if constants.GRADER_LIST in csv_fields:
            graders_username = e[constants.GRADER_LIST].split('|')

            if rep and constants.QUESTION_SET_NAME in csv_fields and len(graders_username) < rep:
                raise serializers.ValidationError(
                    detail={"csv_graders": "number of graders is less than rep, change and try again"}, code='NOVAL')

            graders = []
            for u in graders_username:
                graders.append(validate_enrollment(event.id, u, course_id, constants.ROLE_GRADER))
            data['grader_list'] = graders
            grader_list.extend(graders)

        data_list.append(data)

    return {'data_list' : data_list , 'grader_list' : set(grader_list)}


def validate_rgupload_csv_data(file, event, course_id):
    # validate columns in csv file

    decoded_file = file.read().decode('utf-8').splitlines()
    reader = csv.DictReader(decoded_file)
    csv_data = list(reader)
    data_list = list()

    for e in csv_data:
        data = {}

        qs_name = e.get(constants.QUESTION_SET, None)
        qs = validate_question_set(qs_name, event.assignment.id)
        data['question_set_id'] = qs.id
        q_id = e.get(constants.QUESTION)
        data['question_id'] = validate_question(qs.id, q_id).id
        graders_username = e[constants.GRADER_LIST].split(',')
        graders = []
        for u in graders_username:
            graders.append(validate_enrollment(event.id, u, course_id, constants.ROLE_GRADER))
        data['grader_list'] = graders
        data_list.append(data)
    return data_list


def read_graders(file, event, course_id):
    decoded_file = file.read().decode('utf-8').splitlines()
    reader = csv.DictReader(decoded_file)
    csv_data = list(reader)
    graders_list = list()
    for e in csv_data:
        graders_username = e[constants.GRADER_LIST].split(',')
        graders = []
        for u in graders_username:
            graders.append(validate_enrollment(event.id, u, course_id, constants.ROLE_GRADER))
        graders_list.extend(graders)

    if len(graders_list) != len(set(graders_list)):
        raise exceptions.DuplicateEntryException(
            detail='username is repeated in csv file. correct it and try again')
    return_dict = {'grader_list' : graders_list}
    return return_dict


def validate_supload_required_fields(kwargs):
    na_code = kwargs.get('NAC')
    sg_scheme = kwargs.get('SGS')
    mus = kwargs.get('MUS')
    if mus is None:
        raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_28)
    mut = kwargs.get('MUT')
    if mut is None:
        raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_29)
    sup = kwargs.get('SUP')
    if sup is None:
        raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_30)
    if sup and not kwargs.get('SUS'):
        raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_31)
    if sup and not kwargs.get('SUT'):
        raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_31_1)
    delp = kwargs.get('DEL')
    if delp is None:
        raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_32)
    col = kwargs.get('COL')
    if col is None:
        raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_33)
    if na_code and sg_scheme == 'OG':
        raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_34)


# valid_extensions = ['.pdf', '.doc', '.docx', '.jpg', '.png', '.xlsx', '.xls']
def validate_file_extension(value, allowed_files):
    ext = os.path.splitext(value.name)[1]  # [0] returns path+filename
    valid_extensions = []
    allowed_exts = allowed_files
    for x in allowed_exts:
        valid_extensions.append('.' + x.lower())
    if not ext.lower() in valid_extensions:
        raise exceptions.ValidationException(u'Unsupported file extension.')

def validate_file_extension2(value, allowed_files):
    ext = os.path.splitext(value.name)[1]  # [0] returns path+filename
    valid_extensions = []
    allowed_exts = allowed_files
    valid_extensions.append('.' + allowed_exts.lower())
    if not ext.lower() in valid_extensions:
        raise exceptions.ValidationException(u'Unsupported file extension.')

def validate_file_size(val, max_size):
    if (val.size / (1024 * 1024)) > max_size:
        raise exceptions.ValidationException(u'file size id too large.')


def calculate_hash_sha1(file):
    BUF_SIZE = 65536  # lets read stuff in 64kb chunks!

    sha1 = hashlib.sha1()

    for chunk in file.chunks():
        sha1.update(chunk)
    return sha1.hexdigest()
