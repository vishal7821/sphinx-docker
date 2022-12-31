AUTH_NOVAL_1 = {'detail' : 'username and password both fields are mandatory', 'code':'NOVAL'}
AUTH_NOACTIVE_1 =  {'detail' : 'Your account is deactivated. Please contact Instructor', 'code':'NOACTIVE'}
AUTH_NOLOGIN_1 =  'Requested operation requires login - please login into your account first'
AUTH_NOLOGIN_2 = 'Your account is deactivated'
AUTH_SUCCESS_1 = {'detail':'user loggedin successfully'}
AUTH_LOGOUT_SUCCESS = {'detail':'user logout successfully'}
AUTH_NOKEY_1 =  {'detail' : 'invalid password/token', 'code':'NOKEY'}
AUTH_PASSWORD_UNMATCH = {'detail':'both the passwords didnt match', 'code':'NOVAL'}
AUTH_USER_NOUSER = {'detail':'user doesn\'t exists', 'code':'NOUSER'}
AUTH__PASSWORD_CHNANGE_SUCCESS = {"detail": "New password has been saved."}
AUTH__COURSE_NOEXIST = {"detail":"user is not enrolled in this course",'code':'NOEXIST'}
AUTH__COURSE_NOVAL_1 = {"detail":"course id is invalid",'code':'NOVAL'}

AUTHR_NOVAL_1 = 'Requested url is invalid'
AUTHR_NOVAL_2 = 'Unauthorized Access: Please contact Instructor'
AUTHR_NOVAL_3 =  {'detail' : 'Requested operation needed Role to be assigned. Please contact Instructor', 'code':'NOVAL'}

COURSE_NODUP_1 = {'details':"section with this name already exists", 'code':'NODUP'}
COURSE__MANAGER_ENROLLMENT_FILE_NOVAL = {"enrollment_file":"required field",'code':'NOVAL'}
#SECTION_NODEL_1 = {'details':"the deletion operation you are trying to perform will create inconsistencies in the database. Please rectify and try again",'code':'NODEL'}
SECTION_NODEL_1 = {'details':"the deletion of this section is not allowed. Please shift enrollments to another section and try again",'code':'NODEL'}
ROLE_NODEL_1 = {'details':"the deletion operation you are trying to perform will create "
                            "inconsistencies in the database. Please rectify and try again",'code':'NODEL'}

EVENT_MANAGER_NOVAL_1 = {'detail':'both assignment_id or is_external must not be present', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_2 = {'detail':'grade aggregation method is invalid', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_3 = {'detail':'atleast one of assignment id or is_external must be present', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_3_1 =  {'detail':'is_external must be present', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_4 = {'detail':'event type is invalid', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_5 = {'detail':'start and end time is invalid', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_5_1 = {'detail':'end time must be less than or equal to late end time', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_5_2 = {'detail':'display end time must be less than or equal to end time', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_5_3 = {'detail':'display end time must be less than or equal to display late end time', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_6 = {'detail':'late end time and diaplay late end time must be present in request', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_7 = {'detail':'Event can\'t, have two subevents with the same name','code':'NODUP'}
EVENT_MANAGER_NOVAL_8 = {'detail':'Username in participants list is not Enrolled in this course','code':'NOVAL'}
EVENT_MANAGER_NOVAL_8_1 = {'detail':'Username in the csv file doesn\'t exists' ,'code':'NOVAL'}
EVENT_MANAGER_NOVAL_9 = {'detail':'Question set name in the csv file is not a valid name','code':'NOVAL'}
EVENT_MANAGER_NOVAL_10 = {'detail':'There can\'t be two SUPLOAD/GUPLOAD type subevent for same user' ,'code':'NOVAL'}
EVENT_MANAGER_NOVAL_10_1 = {'detail':'There can\'t be two GUPLOAD type subevent in same event' ,'code':'NOVAL'}
EVENT_MANAGER_NOVAL_10_2 = {'detail':'There can\'t be two RGUPLOAD type subevent in same event' ,'code':'NOVAL'}
EVENT_MANAGER_NOVAL_11 = {'detail':'event with this event-id doesn\'t exists' ,'code':'NOVAL'}
EVENT_MANAGER_NOVAL_12 =  {'detail':'suevent with this doesn\'t exists' ,'code':'NOVAL'}
EVENT_MANAGER_NOVAL_13 = {'detail':'Question id in the csv file is not valid','code':'NOVAL'}
EVENT_MANAGER_NOVAL_14 =  {'gen_subevent':'SUPLOAD subvent with this id doesn\'t exists' ,'code':'NOVAL'}
EVENT_MANAGER_NOVAL_15 = {'detail':'csv file expected in request','code':'NOVAL'}
EVENT_MANAGER_NOEXIST_1 = {'detail':'Invalid assignment! Try again', 'code':'NOEXIST'}
EVENT_MANAGER_NOVAL_16 = {'detail':'Invalid grader Id! Try again', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_17 = {'detail':'Invalid question Id! Try again', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_18 = {'detail':'subevent must be of type rgupload or gupload', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_19 = {'detail':'for creating a gupload event, the genevent must be supload', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_20 = {'detail':'for creating a rgupload event, the genevent must be gupload', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_1 = {'detail':'The genevent must be supload or gupload', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_2 = {'detail':'The genevent must be supload ', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_3 = {'detail':'The genevent must be gupload ', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_4 = {'detail':'participants_spec must be 1','code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_5 = {'detail':'Invalid gen_subevent ', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_6 = {'detail':'either all these subevents must be of type SUPLOAD or else all these subevents must be of type GUPLOAD or RGUPLOAD ', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_7 = {'detail':'Every user must have linked to any SUPLOAD subevent in this event ', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_8 = {'detail':'Every user must have linked to any GUPLOAD subevent in this event ', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_9 = {'detail':'Every user must have linked to any RGUPLOAD subevent in this event ', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_10 = {'detail':'All participants must be linked to any subevent of gen_subevent ', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_11 = {'detail':'Participants must provided through csv file for this type of subevent','code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_12 = {'detail':'participants subevent list expected in request','code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_13 = {'detail':'participants_spec expected in request','code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_14 = {'detail':'Generating subevent list expected in request','code':'NOVAL'}
EVENT_MANAGER_NOVAL_19_15 = {'detail':'Participants must provided through csv file for this Grading Duty Scheme','code':'NOVAL'}
#following additional parameters rules should be followed while creating SUPLOAD subevent
EVENT_MANAGER_NOVAL_21 = {'detail':'you must specify one previously created SUPLOAD, GUPLOAD, or RGUPLOAD-type subevent ', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_22_1 = {"Detail":" There is some mistake in making the request, please follow the below constraints\n"
                                   "1. submission mode(SBM) this must be one of the following: OLS, OLI, OSS (online by"
                                   " student(s), online by instructor, onsite by student(s))\n"
                                   "2.  If the mode is OLI, no more parameters are required else below parameters are required \n"
                                   "3.  SGS (submission group scheme): this must be one of the following: IN, FG, OG$max"
                                   " (individual, fixed-group, open-group with maximum of $max students in each group "
                                   "where $max is a strictly positive integer)\n"
                                   "4. If the SGS = FG or SGS = IN, we must expect a CSV file(CSV_FILE) with each row giving us a "
                                   "comma-separated list of rollnumbers/user names which belong to that group.\n"
                                    "5.  QSS (question set scheme): this must be one of the following: OS, FS (open-set, fixed-set)\n"
                                   "6. QSS = OS is allowed only if the assignment linked to the event corresponding to "
                                   "this subevent has at least two question sets associated with it.\n"
                                   "7.  If QSS = FS, the CSV file must have two columns, the second column having the "
                                   "question_set_name of the question set associated with that submission group.\n"
                                   "8.  Allow NAC = 1 only if SGS = IN or SGS = FG (NAC must be 0 if SGS = OG since "
                                   "NAC = 1 does not make sense here).\n"
                                   "9. If NAC = 1, the CSV file must contain a third column as well, the third column "
                                   "gCOLiving us the secret access code for each submission group.\n"
                                   "10. following fields are required main upload size(MUS), main upload type(MUT), allow supplementary(SUP)"
                                   ", delay parameter(DEL), Color(COL)\n"
                                   "11.if  SUP is true then following fields are required supplementary upload size(SUS), supplementary upload type(SUT)\n "                                    ,
                          "code":"NOVAL"}

EVENT_MANAGER_NOVAL_22  = {'detail':'submission group scheme is invalid/not present in request', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_23 =  {'detail':'QSS = OS is allowed only if the assignment linked to the event corresponding to '
                                     'this subevent has at least two question sets associated with it', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_24 = {'detail':'QSS = OS is allowed only if the assignment linked to the event corresponding to '
                                     'this subevent has at least two question sets associated with it', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_25 = {'detail':'if submission group scheme is Open Group then you must pass max group size', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_26 =  {'NA code':'NA code is required', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_27 =  {'NA code':'if its open group submission then Nacode must be 0', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_28 = {"MUS":'required field', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_29 = {"MUT":'required field', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_30 = {"SUP":'required field', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_31 = {"SUS":'required field', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_31_1 = {"SUT":'required field', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_32 = {"DEL":'required field', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_33 = {"COL":'required field', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_34 = {"NACODE":'NA code cannot be true if submission group scheme is OG', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_35 = {"NACODE":'CSV data is not valid/ check the column names and number and try again  ', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_36 = {"type":'there cannot be two subevent of type QVIEW, SVIEW, GVIEW, AVIEW for the same event',
                           'code':'NOVAL'}
EVENT_MANAGER_NOVAL_37 = {"type":'there cannot be two subevent of type SVIEW corresponds to same SUPLOAD for the same event',
                           'code':'NOVAL'}
EVENT_MANAGER_NOVAL_38 = {'detail':'NAC is invalid, must be alphanumeric only', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_39 = {'detail':'SUPLOAD subevent must present in the event', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_40 = {'detail':'gensubevent of type RGUPLOAD must present in request', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_41 = {'detail':'gensubevent must not be linked to other RGREQ subevent', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_42 = {'detail':'Invalid RDS value', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_43 = {'detail':'any single RGUPLOAD should given as gensubevent', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_44 = {'detail':'event should not have two overlapped blocking subevent for same user', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_45 = {'detail':'invalid grader_id', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_46 = {'detail':'invalid question_id', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_47 = {'detail':'parent subevent must not be linked to other RGREQ subevent', 'code':'NOVAL'}
EVENT_MANAGER_NOVAL_48 = {'detail':'gensubevent list must contain single gensubevent', 'code':'NOVAL'}

ASSIGNMENT_NODUP_1 = {'detail':'question set name should be unique in this assignment', 'code':'NODUP'}
ASSIGNMENT_NOVAL_1 =  {'detail':'marks cannot be negative', 'code':'NOVAL'}
ASSIGNMENT_NOVAL_2 =  {'detail':'subpart_no cannot be negative', 'code':'NOVAL'}
ASSIGNMENT_NOEXIST_1 = {'detail':'course does not exists' }
COURSE_IMAGE_DIRECTORY_NOEXIST_1 = {'detail':'course image directory does not exists', 'code':'NOEXIST' }
ASSIGNMENT_NODUP_2 = {'detail':'question file already exists', 'code':'NODUP'}
QUESTION_FILE_NAME_NOEXIST_1 =  {'detail':'question file is not uploaded', 'code':'NOEXIST' }
QUESTION_SET_NOEXIST_1 =  {'detail':'question file not exists', 'code':'NOEXIST' }
QUESTION_SET_NOEXIST_2 =  {'detail':'solution file not exists', 'code':'NOEXIST' }
QUESTION_SET_NOEXIST_3 =  {'detail':'supplementary file not exists', 'code':'NOEXIST' }
QUESTION_SET_NOEXIST_4 =  {'detail':'question set has not been choosen for your submission group yet', 'code':'NOEXIST' }
QUESTION_SET_NOVAL_1 =  {'detail':'question file is not provided', 'code':'NOVAL' }
QUESTION_SET_NOVAL_2 =  {'detail':'solution file is not provided', 'code':'NOVAL' }
QUESTION_SET_NOVAL_3 =  {'detail':'supplementary file is not provided', 'code':'NOVAL' }
QUESTION_NOVAL_2 = {'detail':'An actual question can only have its  marks column filled with non zero','code':'NOVAL'}
QUESTION_NOVAL_3 = {'detail':'question can only have parent from same questionset only','code':'NOVAL'}
QUESTION_NOVAL_4 = {'detail':'solution list must contain only T/F as answer','code':'NOVAL'}
QUESTION_NODEL_1 =  {'detail':'a question with subquestion cannot be deleted, first','code':'NODEL'}
QUESTION_NODUP_1 = {'detail':'parent id doesnot exists or subpart number is not unique for this question ',
                    'code':'NODUP'}
QUESTION_NODUP_2 = {'detail':'question title must be unique within question set ',
                    'code':'NODUP'}

QUESTION_TOPIC_NOEXIST_1 =  {'detail':'question-topic relation not exists', 'code':'NOEXIST' }

QUESTIONHASTOPIC_NODUP_1 = {'detail':'This relation already exists','code':'NODUP'}

SUBEVENT_NOVAL_1 = {'detail':'subevent request must always contain the type of the subrequest','code':'NOVAL'}

GRADE_NODEL_1 =  {'detail':'rubric is not applied yet to grading duty','code':'NODEL'}

QUESTION_TEXT_NOEXIST_1 = {'detail':'A question text cannot be empty','code':'NOVAL'}
LABEL_TEXT_NOEXIST_1 = {'detail':'A label text for an option cannot be empty','code':'NOVAL'}
OPTION_TEXT_NOEXIST_1 = {'detail':'An option text for an option cannot be empty','code':'NOVAL'}
QUESTION_TYPE_NOEXIST_1 = {'detail':'A question type cannot contain be empty','code':'NOVAL'}
QUESTION_TYPE_NOEXIST_2 = {'detail':'A question type cannot be invalid','code':'NOVAL'}
QUESTION_OPTIONS_NOEXIST_1 = {'detail':'A question option text cannot have empty options','code':'NOVAL'}
QUESTION_OPTIONS_NOEXIST_2 = {'detail':'A question cannot have empty solution text','code':'NOVAL'}