#cache keys
USER_CACHE_KEY = 'user'
COURSES_CACHE_KEY = 'courses'
USER_LOGGEDIN_BIT_CACHE_KEY = 'is_logged_in'


# subevent supload csv column names
SUPLOAD_CSV_FILE = "plist_CSV_FILE"
USERNAME_LIST = 'user_list'
QUESTION_SET_NAME = 'question_set_name'
SECRET_ACCESS_CODE ='secret_access_code'

# subevent gupload csv column names
QUESTION_SET = 'question_set_name'
# QUESTION = 'question_id'
QUESTION = 'question_title'
GRADER_LIST = 'grader_list'


#
ROLE_GRADER_ID = 2


#subevent types
SUBEVENT_TYPE_SUPLOAD = 'SUPLOAD'
SUBEVENT_TYPE_GUPLOAD =  'GUPLOAD'
SUBEVENT_TYPE_RGUPLOAD =  'RGUPLOAD'
SUBEVENT_TYPE_QVIEW =  'QVIEW'
SUBEVENT_TYPE_SVIEW =  'SVIEW'

#constants
ROLE_STUDENT = 'STUDENT'
ROLE_GRADER = 'GRADER'



#subevent param dictionary fields
SUBEVENT_GUPLOAD_PARAM_GRADING_DUTY_SCHEME = 'GDS'
SUBEVENT_GUPLOAD_PARAM_GRADER_LIST ='GLIST'
SUBEVENT_GUPLOAD_PARAM_REGRADING_DUTY_SCHEME = 'RDS'
SUBEVENT_GUPLOAD_PARAM_REGRADER_LIST = 'GLIST'

#USER SPECIFIC URLS
USER_URLS = [
    r'^/auth/GET/$',
    r'^/auth/csrf_token/GET/$',
    r'^/auth/login/GET/$',
    r'^/auth/login/POST/$',
    r'^/auth/logout/POST/$',
    r'^/auth/account/GET/$',
    r'^/auth/account/PUT/$',
    r'^/auth/password/change/POST/$',
    r'^/auth/reset/password/GET/$',
    r'^/auth/reset/password/POST/$',
    r'^/auth/confirm/reset/password/PUT/$',
    r'^/courses/GET/$',
]

#COURSE SPECIFIC  URLS
COURSE_URLS = [
    r'^/course/(?P<course_id>[\w\-]+)/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/sections/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/sections/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/section/(?P<section_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/section/(?P<section_id>[\w\-]+)/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/roles/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/roles/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/role/(?P<role_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/role/(?P<role_id>[\w\-]+)/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/topics/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/topics/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/topic/(?P<topic_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/topic/(?P<topic_id>[\w\-]+)/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/enrollments/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/enrollments/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/enrollment/(?P<enrollment_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/enrollment/(?P<enrollment_id>[\w\-]+)/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignments/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignments/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_sets/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_sets/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/(?P<question_set_id>[\w\-]+)/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/(?P<question_set_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/(?P<question_set_id>[\w\-]+)/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/(?P<question_set_id>[\w\-]+)/question_file/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/(?P<question_set_id>[\w\-]+)/question_file/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/(?P<question_set_id>[\w\-]+)/question_file/images/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/(?P<question_set_id>[\w\-]+)/solution_file/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/(?P<question_set_id>[\w\-]+)/solution_file/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/(?P<question_set_id>[\w\-]+)/supplementary_file/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/(?P<question_set_id>[\w\-]+)/supplementary_file/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/(?P<question_set_id>[\w\-]+)/questions/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/(?P<question_set_id>[\w\-]+)/questions/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/topic/(?P<topic_id>[\w\-]+)/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/topic/(?P<topic_id>[\w\-]+)/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/rubrics/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/rubrics/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/rubric/(?P<rubric_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/rubric/(?P<rubric_id>[\w\-]+)/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/myevents/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/events/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/events/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevents/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/graderList/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myQuestions/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySolutions/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/main/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/main/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/supplementary/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/supplementary/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/(?P<submission_group_id>[\w\-]+)/join/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myResponses/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myResponses/(?P<question_id>[\w\-]+)/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myResponses/(?P<question_id>[\w\-]+)/(?P<page_no>[\w\-]+)/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/doGraderAssignment/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myGrading/(?P<subevent_id>[\w\-]+)/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myGrading/(?P<subevent_id>[\w\-]+)/gradingDuty/(?P<gradingduty_id>[\w\-]+)/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myGrading/(?P<subevent_id>[\w\-]+)/gradingDuty/(?P<gradingduty_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myGrading/(?P<subevent_id>[\w\-]+)/gradingDuty/(?P<gradingduty_id>[\w\-]+)/main/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myGrading/(?P<subevent_id>[\w\-]+)/gradingDuty/(?P<gradingduty_id>[\w\-]+)/supplementary/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myGrading/(?P<subevent_id>[\w\-]+)/gradingDuty/(?P<gradingduty_id>[\w\-]+)/(?P<rubric_id>[\w\-]+)/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myGrading/(?P<subevent_id>[\w\-]+)/gradingDuty/(?P<gradingduty_id>[\w\-]+)/(?P<rubric_id>[\w\-]+)/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissionMarks/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/response/(?P<response_id>[\w\-]+)/regrading/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionSubmissions/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionSubmissionGroups/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmission/verifyNAC/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionSubmissionGroup/(?P<submission_group_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionSubmissionGroup/(?P<submission_group_id>[\w\-]+)/main/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionSubmissionGroup/(?P<submission_group_id>[\w\-]+)/supplementary/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionEnrollment/(?P<enrollment_id>[\w\-]+)/mySectionSubmissionGroups/(?P<submission_group_id>[\w\-]+)/join/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionSubmissionGroup/(?P<submission_group_id>[\w\-]+)/responses/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/bulkUpload/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/bulkUpload/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/recognizeUsers/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/recognizeUsers/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/upload/(?P<upload_id>[\w\-]+)/bulkUploadDetail/DELETE/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/upload/(?P<upload_id>[\w\-]+)/bulkUploadDetail/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/autoGrade/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/autoGrade/POST/$',
    r'^/course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/(?P<question_set_id>[\w\-]+)/interactivequestion/(?P<question_id>[\w\-]+)/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/(?P<user_id>[\w\-]+)/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/main/(?P<user_id>[\w\-]+)/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/main/(?P<user_id>[\w\-]+)/PUT/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/impersonatedResponses/(?P<user_id>[\w\-]+)/GET/$',
    r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/impersonatedResponses/(?P<question_id>[\w\-]+)/(?P<user_id>[\w\-]+)/POST/$',
    #r'^/course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myResponses/(?P<user_id>[\w\-]+)/GET/$',
]

