import csv

import cv2
from assignmentmanager.utils import get_question_set_object
from authentication.models import User, UserHasCourses
from django.utils.crypto import get_random_string
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth.hashers import make_password
import os,base64
from pdf2image import convert_from_path

from coursemanager.models import Enrollment
from eventmanager.models import GradingDuty
from helper import constants, exceptions
import json
from django.core.files.storage import FileSystemStorage
from authentication.models import Course
from helper import messages
from rest_framework import serializers
from django.core.mail import send_mass_mail

from helper.ai_utils import calibrate_images, get_roll_numbers, getTFPredictions
from helper.exceptions import ValidationException


def send_multiple_mail(data):
    send_mass_mail(data)


def create_user(data):
    pwd = get_random_string(8)
    hash_pwd = make_password(pwd)
    data['password'] = hash_pwd
    user = User.objects.create(**data)
    subject = settings.CREATE_USER_SUBJECT
    body = settings.CREATE_USER_BODY + "\n username :" + user.username + "\n password:" + pwd
    to_email = user.email

    # email_message = EmailMultiAlternatives(subject, body, None, [to_email])
    # email_message.send()
    email_details =  (subject, body, None, [to_email])
    # return user
    return {'user': user, 'email_details': email_details}


def read_file(file_path):
    encoding = None
    try:
        with open(file_path, 'rb') as f:
            contents = f.read()
        encoding = base64.b64encode(contents)
    except (OSError, IOError) as e:
        raise exceptions.AccessException(detail="File is not found or corrupt")
    return encoding


def get_pdf_encoded_content(file_name = None, file_path = None):
    if file_name != None:
        file_path = os.path.join(settings.MEDIA_ROOT, file_name.name)
    return  read_file(file_path)



def store_images_from_pdf(file_name, from_file_path, to_image_directory):
    if to_image_directory is None:
        to_image_directory = ''
    images = convert_from_path(from_file_path,dpi=300)
    file_name = file_name[:-4]
    image_new_dir_path = os.path.join(to_image_directory, file_name)
    if not os.path.exists(image_new_dir_path):
        os.makedirs(image_new_dir_path)
    for i, im in enumerate(images):
        image_path = image_new_dir_path+'/' +file_name+'_' + str(i) + '.jpg'
        im.save(image_path, format='JPEG')


def get_course_directory(course_id):
    try:
        course = Course.objects.get(id = course_id)
    except Course.DoesNotFound:
        raise serializers.ValidationError(detail="Course is not found",code ="NOVAL")
    return course.image_directory


def save_course_file(file, path, course_id):
    dir = get_course_directory(course_id)
    fs = FileSystemStorage(location=dir)
    filename = fs.save(file.name,file)
    return filename

def get_enrollments_from_csv(csv_filename,course_id):
    dir = get_course_directory(course_id)
    file_path = os.path.join(dir,csv_filename)
    # fs = FileSystemStorage(location=dir)
    all_enrollments = []
    with open(file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            print(row[constants.USERNAME_LIST])
            usernames = row[constants.USERNAME_LIST].split('|')
            if not usernames:
                raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_35)

            enrollments = []
            for u in usernames:
                uhc = UserHasCourses.objects.get(user__username=u, course_id=course_id)
                enroll_id = uhc.enrollment_id
                enrollments.append(enroll_id)

            all_enrollments.extend(enrollments)
    print('-------------------------------------extracting enrollments----------------')
    print(all_enrollments)
    print('-------------------------------------extracting enrollments----------------')
    return all_enrollments

def get_images_from_dir(image_dir_path):
    file_system_storage = FileSystemStorage()
    image_list = file_system_storage.listdir(image_dir_path)
    # image_list = os.listdir(image_dir_path)
    image_name_list = image_list[1]
    # image_name_list = image_list
    image_name_list.sort()
    image_files = {}
    for image_file_name in image_name_list:
        image_path = os.path.join(image_dir_path, image_file_name)
        encoding = read_file(image_path)
        image_files[image_file_name] = encoding
    return image_files

def get_specific_image_from_dir(image_dir_path , image_file_name):
    image_path = os.path.join(image_dir_path, image_file_name)
    encoding = read_file(image_path)
    return encoding

def get_courses_details_from_cache(request):
    try:
        courses = json.loads(request.session[constants.COURSES_CACHE_KEY])
        if courses:
            return courses
        raise exceptions.MiscError()
    except KeyError:
        raise exceptions.LoginError()

def get_image_directory(course_id):
    try:
        return Course.objects.get(id = course_id).image_directory
    except Course.DoesNotExist:
        raise exceptions.AccessException(**messages.ASSIGNMENT_NOEXIST_1)



def get_qset_file_details(course_id, assignment_id, question_set_id):
    questionset = get_question_set_object(assignment_id, question_set_id)
    if not questionset.question_file_path.name:
        raise serializers.ValidationError(messages.QUESTION_FILE_NAME_NOEXIST_1)
    q_file_path = questionset.question_file_path.path
    q_file_path = os.path.join(settings.MEDIA_ROOT, questionset.question_file_path.name)
    q_file_name = questionset.question_file_path

    dir_name = q_file_name.name[:-4]

    img_dirs = get_image_directory(course_id)

    img_dir = img_dirs + '/' + dir_name

    file_system_storage = FileSystemStorage()
    image_list = file_system_storage.listdir(img_dir)
    image_name_list = image_list[1]
    subm_len = len(image_name_list)
    # content = get_images_from_dir(img_dir)
    return {'file_path': q_file_path, 'subm_len': subm_len}

def calibrate_uploads(name_coords, upload_entries, course_id, target_file_path):
    output_data = []
    for upload in upload_entries:
        #get high and low resolution images
        from_file_path = upload['from_file_path']
        file_name = upload['file_name']

        to_image_directory = get_image_directory(course_id)
        if to_image_directory is None:
            to_image_directory = ''
        # hr_images = convert_from_path(from_file_path, dpi=300)
        # lr_images = convert_from_path(from_file_path, dpi=100)
        # get high resolution calibrated images
        hr_calibrated = calibrate_images(from_file_path, target_file_path)
        # store in directory

        file_name = file_name[:-4]
        image_new_dir_path = os.path.join(to_image_directory, file_name)
        if not os.path.exists(image_new_dir_path):
            os.makedirs(image_new_dir_path)
        for i, im in enumerate(hr_calibrated):
            image_path = image_new_dir_path + '/' + file_name + '_' + str(i) + '.jpg'
            # im.save(image_path, format='JPEG')
            # image_path = to_image_directory + '/0_high_mat_C.jpg'
            cv2.imwrite(image_path, im)

        #cropped name box
        coords = name_coords.split(',')
        i_coords = []
        for c in coords:
            i_coords.append(int(c))
        cropped_img = hr_calibrated[0]
        cropped_img = cropped_img[i_coords[1]:i_coords[3], i_coords[0]:i_coords[2]]
        img = cv2.imencode('.jpg', cropped_img)[1].tobytes()
        content = base64.b64encode(img)
        up_dt = {'upload_id':upload['id'], 'name_box': content }
        output_data.append(up_dt)
    return output_data


def get_course_enrollments(course_id):

    roll_numbers = []
    enrollments = Enrollment.objects.all()
    for e in enrollments:
        user = e.user
        if user.roll_no != None :
            roll_numbers.append(user.roll_no)
    return roll_numbers

def recognize_users(name_coords, roll_coords, course_id, subevent_id):
    #get roll numbers of course enrollments
    roll_numbers = get_course_enrollments(course_id)
    course_dirs = get_image_directory(course_id)
    #call the ai_recognition system api to recognise user roll numbers
    output = get_roll_numbers(course_dirs, roll_coords, roll_numbers,course_id,subevent_id)
    return output

def get_submission_image_path(gd,course_id):
    response = gd.response
    to_image_directory = get_image_directory(course_id)

    if not to_image_directory:
        raise serializers.ValidationError(**messages.COURSE_IMAGE_DIRECTORY_NOEXIST_1)
    file_path = response.upload.file_path
    dir_name = file_path.name[:-4]
    img_dirs = to_image_directory
    image_dir_path = img_dirs + '/' + dir_name

    file_system_storage = FileSystemStorage()
    image_list = file_system_storage.listdir(image_dir_path)
    # image_list = os.listdir(image_dir_path)
    image_name_list = image_list[1]
    # image_name_list = image_list
    image_name_list.sort()
    if response.upload_page_no is None or response.upload_page_no>= len(image_name_list):
        raise ValidationException('submission page is not paginated for the requested question')
    image_file_name = image_name_list[response.upload_page_no]
    src_img_path = os.path.join(image_dir_path, image_file_name)

    return (src_img_path,to_image_directory)

def true_false_computation(gds, q_ans_coords,no_of_contours,course_id):
    processed_gd_data = []
    for gd in gds:
        data = {'gd_id': gd.id, 'src_image_path':''}
        (src_img_path,course_dirs) = get_submission_image_path(gd,course_id)
        data['src_image_path'] = src_img_path
        processed_gd_data.append(data)
    # course_dirs = get_image_directory(course_id)
    tf_predictions = getTFPredictions( processed_gd_data,q_ans_coords, no_of_contours,course_dirs )
    cluster_dict = [[],[],[]]
    for pred in tf_predictions:
        # print('-------------------------------')
        # print(pred.get('predicted_label'))
        # print('-------------------------------')

        cluster_dict[pred['predicted_label']].append(pred)

    return cluster_dict


def mcq_computation(gds, q_ans_coords,q_solution_list,course_id):
    return []


def grading_computation(gds, q_type, q_ans_coords, q_solution_list,course_id):
    output = []
    #find no of contours in question
    sol = q_solution_list.split(',')
    no_of_contours = len(sol)
    #if question type is true/false
    if q_type == '1':
        output = true_false_computation(gds, q_ans_coords,no_of_contours,course_id)
    # if question type is mcq
    elif q_type =='2':
        output = mcq_computation(gds, q_ans_coords,q_solution_list,course_id)
    else:
        return []
    return output

def validate_gds(grading_duties, gupload_subevent,question_id):
    gd_dict = {}
    gd_db_dict = {}
    print('-----------------------------')
    print(grading_duties)
    print('-----------------------------')

    for entry in grading_duties:
        gd_id = entry.get('gd_id',None)
        gd = GradingDuty.objects.filter(id= gd_id, subevent = gupload_subevent.id,
                                        response__question__id = question_id)
        if gd.count() ==0:
            raise ValidationException('The provided grading duty data is invalid')
        if gd_id not in gd_dict:
            gd_dict[gd_id] = []
        gd_dict[gd_id].append(entry)
        gd_db_dict[gd_id] = gd

    return (gd_dict, gd_db_dict)