/**
 *  The model represents form fields for CREATE/JOIN the submission group
 */
export class MySubmissionGroupForm {
    /**
     *   Model constructor receives and initializes The SubEvent model properties
     * @param isOpenSGroupForm The boolean flag representing the form view mode
     * @param choice Whether user want to create or join the submission group
     * @param accessCodeSubmitted The access code for verification
     * @param selectedQSet The selected question set for submission
     * @param sGroupID The submission group ID
     * @param questionSets List of question sets show in dropdown
     */
    constructor(
        public isOpenSGroupForm: boolean,
        public choice: string,
        public accessCodeSubmitted: string,
        public selectedQSet: number,
        public sGroupID: number,
        public questionSets: QuestionSet[],

    ) { }
}

/**
 *  The model represents the Event entity in the Course.
 *  It contains the properties which holds the detailed information about the user corresponding event
 * 
*/
export class MyEventClass {
    /**
     * The index representing event in the list of events,
     *  it used to retrieve user selected event from view for edit/delete
     */
    public id: number;
    /**
     * The database id from the Event table
     */
    public main_id: number;
    /**
     * The event name
     */
    public name: string;
    /**
    * The database id of the assignment associated with the event
    */
    public assignment_id: number;
    /**
     * The name of the assignment associated with the event
    */
    public assignment_name: string;
    /**
     * The grade aggregation method in case the submission
     *  in the event is graded by multiple graders. For example max, min, avg
    */
    public grade_aggregation_method: string;
     /**
     * The boolean flag representing whether this event is external or not.
     *  If event is external then no need to associate it with the assignment
     */
    public is_external: boolean;


    public assignment_isInteractive: boolean;
     /**
     * The list of user-allowed subevents corresponding to the event. 
     * Each subevent is represents using the instance of MySubEvent model class
     */
    public subevents: MySubEvent[];
     /**
     * The object of EventFlags model, contains boolean flag for each subevent type
     * representing whether subevent is created in the event or not
     */
    public subEventFlags: EventFlags;
     /**
     * The object of EventFlags model, contains boolean flag for each subevent type
     * representing whether subevent is active at the moment or not
     */
    public isActiveFlags: EventFlags;
     /**
     * The list of question sets associated with the event 
     */
    public questionSets: QuestionSet[];
     /**
     * The object of MySubmissionGroup model class, corresponds to
     * the user corresponding submission group in the event   
     */
    public submissionGroup: MySubmissionGroup;
     /**
     * The boolean flag represents whether the user
     *  corresponding submission group is created or not in the event
     */
    public isSGCreated: boolean;
     /**
     * The boolean flag representing whether access code verification is done 
     * or not for the submission in the event 
     */
    public isNACVerified: boolean;
     /**
     * The boolean flag representing whether access code verification is need to be done 
     * or not for the submission in the event
     */
    public isNACReq: boolean;
     /**
     * The boolean flag representing whether question set is selected 
     * or not for the submission in the event
    */
    public isQsetSelected: boolean;
     /**
     * The background color of the submission page for this assignment, the color value is
     * stored in the format provided by the ngx-color-picker library
   */
    public color: string;
     /**
     * A comma seperated a mean and standard deviation (in seconds) for the amount
     *  of time the frontend
     *  must artificially delay the upload of a submission after the student clicks the submit button
     */
    public del: string[];
     /**
     * The submission group scheme for the submission in the event
     */
    public sgs: string;
     /**
     * The question set scheme for the submission in the event
     */
    public qss: string;
     /**
     * The boolean flag representing whether the supplementary
     * submission is allowed or not for the submission in the event

     */
    public isSupAllowed: boolean;
     /**
     * What file types are allowed as the supplementary upload?
     *  The file extensions should be specified as a comma separated list e.g. PDF,ZIP,TXT
     */
    public SUT: string;
     /**
     * The object of the MySubmissionGroupForm model class,
     * used to hold submission group form data in the event
     */
    public sgrp_form: MySubmissionGroupForm;
     /**
     * The progrss bar value for timeline of the SUPLOAD subevent
     */
    public supload_time: SubEventTime;
     /**
     * The progrss bar value for timeline of the MVIEW subevent
     */
    public mview_time: SubEventTime;
      /**
     * The progrss bar value for timeline of the MVIEW subevent
     */
    public sview_time: SubEventTime;
    /**
     * Model constructor receives and initializes The MyEventClass model properties.
     * For the non recieived parameter values, constructor initializes those other properties with
     * empty values
     * @param id The index representing event in the list of events, it used to retrieve user selected event from view for edit/delete
     * @param main_id The database id from the Event table
     * @param name The event name
     * @param assignment_id The database id of the assignment associated with the event
     * @param assignment_name The name of the assignment associated with the event
     * @param grade_aggregation_method The grade aggregation method in case the submission
     *  in the event is graded by multiple graders. For example max, min, avg
     * @param is_external The boolean flag representing whether this event is external or not.
     *  If event is external then no need to associate it with the assignment
   */
    constructor(
        id: number,
        main_id: number,
        name: string,
        assignment_id: number,
        assignment_name: string,
        grade_aggregation_method: string,
        is_external: boolean,
        assignment_isInteractive: boolean

    ) {
        this.id = id;
        this.main_id = main_id;
        this.name = name;
        this.assignment_id = assignment_id;
        this.assignment_name = assignment_name;
        this.grade_aggregation_method = grade_aggregation_method;
        this.is_external = is_external;
        this.assignment_isInteractive = assignment_isInteractive;
        this.questionSets = [];
        this.submissionGroup = null;
        this.isSGCreated = false;
        this.isNACVerified = false;
        this.isNACReq = false;
        this.color = '';
        this.del = [];
        this.sgs = '';
        this.qss = '';
        this.isQsetSelected = false;
        this.sgrp_form = new MySubmissionGroupForm(false, '0', '', null, null, []);
        this.isSupAllowed = false;
        this.SUT = '';
    }
}

/**
 *  The model represent the flags for subevents of all types corresponding
 *  to the Event entity in the Course
 * 
 */
export class EventFlags {
    /**
     * 
     */
    SUPLOAD: boolean;
    /**
     * 
     */
    GUPLOAD: boolean;
    /**
     * 
     */
    RGUPLOAD: boolean;
    /**
     * 
     */
    QVIEW: boolean;
    /**
     * 
     */
    GVIEW: boolean;
    /**
     * 
     */
    RGVIEW: boolean;
    /**
     * 
     */
    RGREQ: boolean;
    /**
     * 
     */
    MVIEW: boolean;
    /**
     * 
     */
    RMVIEW: boolean;
    /**
     * 
     */
    SVIEW: boolean;
    /**
     * 
     */
    AVIEW: boolean;
    /**
     * On model object initialization, the constructor set all the flags to false state
     */
    constructor(){
        this.SUPLOAD = false;
        this.AVIEW = false;
        this.GUPLOAD = false;
        this.RGUPLOAD = false;
        this.QVIEW = false;
        this.GVIEW = false;
        this.RGVIEW = false;
        this.RGREQ = false;
        this.MVIEW = false;
        this.RMVIEW = false;
        this.SVIEW = false;
        this.AVIEW = false;
    }

}

/**
 *  The model represents the SubEvent entity in the Course.
 *  It contains the properties which holds the detailed information about the user-allowed subevent in the event
 * 
 */
export class MySubEvent {
    /**
     * Model constructor receives and initializes The MySubEvent model properties.
     * @param id The index representing subevent in the list of subevents,
     *  it used to retrieve the subevent corresponding to user actions on view
     * @param main_id The database id from the subevent table
     * @param event_id The database id of the corresponding event from the event table
     * @param name The name of subevent
     * @param time_range Time range is the list which holds the start time and end time of the subevent
     * @param type The type of subevent. for example SUPLOAD, GUPLOAD, QVIEW, SVIEW, etc
     * @param is_blocking The boolean flag representing whether is the subevent currently in blocking mode or not
     * @param allow_late_ending  The boolean flag representing whether the subevent activity has allowed late ending or not
     * @param display_end_time The end time used to show to the participant's of the subevent
     * @param late_end_time The late end time used for application logic if the property allow_late_ending set to true
     * @param display_late_end_time The late ed time used to show to 
     *  the participant's of the subevent if the property allow_late_ending set to true
     * @param time The variable holds the percentage of subevent time window passed. This variable used to show time progress bar for the subevent in the view
     * @param sbm The property represents the submission mode. If the subevent is of type SUPLOAD, then the property used to store the corresponding submission mode
     * @param sgs The property represents the submission group scheme. If the subevent is of type SUPLOAD, then the property used to store the corresponding submission group scheme
     * @param sgs_og_max The submission group size in case open group is opted as submission group scheme. Valid only if corresponding subevent type is SUPLOAD 
     * @param qss The question set scheme. Valid only if corresponding subevent type is SUPLOAD 
     * @param nac the boolean flag representing the submission access code is needed or not. Valid only if corresponding subevent type is SUPLOAD 
     * @param mus The maximum allowed size for main submission file. Valid only if corresponding subevent type is SUPLOAD 
     * @param mut The allowed file type for main submission file. Valid only if corresponding subevent type is SUPLOAD 
     * @param sup The boolean flag representing whether participant allow to make supplementar submission or not.
     * Valid only if corresponding subevent type is SUPLOAD 
     * @param sus The maximum allowed size for supplementary submission file. Valid only if corresponding subevent type is SUPLOAD 
     * @param sut The allowed file type for supplementary submission file. Valid only if corresponding subevent type is SUPLOAD 
     * @param del The delay parameter.Valid only if corresponding subevent type is SUPLOAD 
     * @param col The color should be shown as background, represented as rgb value. to be used for exam mode. Valid only if corresponding subevent type is SUPLOAD 
     * @param plist_csv_file The participant's CSV file. file holds the list of users allowing to perform the corresponding subevent activity
     * @param gen_subevent The corresponding generating subevent of the subevent. basically hold the database id from subevent table
     * @param gds The grading duty scheme. Valid only if corresponding subevent type is GUPLOAD 
     * @param participants_spec The variable represents the participant's selection mode,
     *  binary bit to represent whether participant's provided through CSV file or 
     * participant's list should be inherit from the subevents from participant's list subevents 
     * @param plist_subevents List of subevents from which participant's list can be inherited
     * @param gds_rep The repeatation factor for the corresponding grading duty scheme. Valid only if corresponding subevent type is GUPLOAD 
     * @param parent_subevent The subevent database id of corresponding parent subevent 
     * @param rds The regrading duty scheme. Valid only if corresponding subevent type is RGUPLOAD 
     
     */
    constructor(
        public id: number,
        public main_id: number,
        public event_id: number,
        public name: string,
        public time_range: string[],
        public type: string,
        public is_blocking: boolean,
        public allow_late_ending: boolean,
        public display_end_time: Date,
        public late_end_time: Date,
        public display_late_end_time: Date,
        public time: number,
        public sbm: string,
        public sgs: string,
        public sgs_og_max: number,
        public qss: string,
        public nac: boolean,
        public mus: number,
        public mut: string,
        public sup: boolean,
        public sus: number,
        public sut: string,
        public del: string,
        public col: string,
        public plist_csv_file: File,
        public gen_subevent: string[],
        public gds: string,
        public participants_spec: string,
        public plist_subevents: string[],
        public gds_rep: number,
        public parent_subevent: string,
        public rds: string,

    ) { }
}

/**
 * The model represents the QuestionSet entity in the Course.
 *  It contains the properties which holds the detailed
 *  information about the question set in the event associated assignment
 */
export class QuestionSet {
    /**
     *  Model constructor receives and initializes The QuestionSet model properties.
     * @param id The list index from the Question set list displayed in the view
     * @param main_id The database ID of the question set
     * @param name The subevent name
     * @param total_marks 
     * @param question_file The main question file object
     * @param supplementary_file The supplementary file object
     * @param solution_file The gold solution file object
     * @param question_name The name of main question file used to display in the view
     * @param supplementary_name The name of supplementary file used to display in the view
     * @param solution_name The name of main solution file used to display in the view
     * @param questions The list of questions belongs to the question set
     */
    constructor(
        public id: number,
        public main_id: number,
        public name: string,
        public total_marks: number,
        public question_file: any,
        public supplementary_file: any,
        public solution_file: any,
        public question_name: string,
        public supplementary_name: string,
        public solution_name: string,
        public questions: MyQuestion[],

    ) { }
}

/**
 * The model class holds the time range values associated to the subevent
 */
export class SubEventTime {
    /**
     * Model constructor receives and initializes The QuestionSet model properties.
     * @param start_time The start time of the subevent
     * @param end_time The end time of the subevent
     * @param time The integer representing progress bar value of the timeline of the subevent
     */
    constructor(
        public start_time: string,
        public end_time: string,
        public time: number,
    ) { }
}


/**
 *  The model represents the SubmissionGroup entity in the Course.
 *  It contains the properties which holds the detailed
 *  information about the user submission group in the event associated assignment
 */
export class MySubmissionGroup {
    /**
     * Model constructor receives and initializes The MySubmissionGroup model properties.
     * @param main_id The database ID of the submission group
     * @param choosenQset The database ID of the user-selected question set for the submission
     * @param accessCodeSubmitted The access code submitted for verification before the submission
     * @param isLateSubmission The boolean flag representing whether the user submission is late or not
     * @param groupMembers The list of group members, each list object is the instance of the GroupMember model class
     */
    constructor(
        public main_id: number,
        public choosenQset: string,
        public accessCodeSubmitted: string,
        public isLateSubmission: boolean,
        public groupMembers: GroupMember[],

    ) { }
}

/**
 *  The model represents the GroupMember associated to the submission group in the event.
 */
export class GroupMember {
    /**
     * Model constructor receives and initializes The GroupMember model properties.
     * @param rollNo The user roll number in the Course
     * @param firstName The first name of the user
     * @param lastName The last name of the user
     */
    constructor(
        public rollNo: string,
        public firstName: string,
        public lastName: string,

    ) {
        if (rollNo == null) {
            this.rollNo = '';
        }
        if (firstName == null) {
            this.firstName = '';
        }
        if (lastName == null) {
            this.lastName = '';
        }
    }
}

/**
 * The model represents the Question entity in the Course.
 *  It contains the properties which holds the detailed
 *  information about the question in the question set associated to the event
 */
export class MyQuestion {
    /**
     * Model constructor receives and initializes The MyQuestion model properties.
     * @param id The list index of the question from the question list displayed in the view
     * @param main_id The database ID of the question
     * @param title The question title
     * @param text The question description
     * @param marks The question marks
     * @param selectedPage The question corresponding page number from the main questin file
     * @param pageArray The array store the list of page numbers of the main question file
     */
    constructor(
        public id: number,
        public main_id: number,
        public title: string,
        public text: string,
        public marks: number,
        public selectedPage: number,
        public pageArray: number[],
        public type: string,
        public options: string,

    ) { }
}

/**
 * The model class holds the details about 
 * the supplementary file of the question set in the event
 */
export class SupplementaryFile {
    /**
     * Model constructor receives and initializes The SupplementaryFile model properties
     * @param name  The name of supplementary file used to display in the view
     * @param file The supplementary file object
     */
    constructor(

        public name: string,
        public file: File,
    ) { }
}

/**
 * The model class holds the question and corresponding list of grading duties
 *  allocated to the user in the event.
 *
 *  Current use: the model class used to hold the grading duty dashboard information corresponding to the user
 */
export class MyGradingDuties {
    /**
     * The list index of the grading duty group from the groups of grading duties displayed in the view
     */
    public id: number;
    /**
     * The database ID of the question corresponding to the grading duties
     */
    public question_id: number;
    /**
     * The title of the question corresponding to the grading duties
     */
    public question_title: string;
    /**
     * The marks of the question corresponding to the grading duties
     */
    public question_marks: number;
    /**
     * The count representing the total number of graded copies
     */
    public completed_cnt: number;
    /**
     * The count representing the total number of copies
     */
    public tot_cnt: number;
      /**
     * The boolean flag representing whether grading duty is auto-gradable or not
     */
    public is_autograded: boolean;
    /**
     * The list of grading duties allocated to the user
     */
    public grading_duties: MyGradingDuty[];
    /**
     * Model constructor receives and initializes The MyGradingDuties model properties
     * @param id The list index of the grading duty group from the groups of grading duties displayed in the view
     * @param question_id The database ID of the question corresponding to the grading duties
     * @param question_title The title of the question corresponding to the grading duties
     * @param question_marks The marks of the question corresponding to the grading duties
     * @param completed_cnt The count representing the total number of graded copies
     * @param tot_cnt  The count representing the total number of copies
     * @param grading_duties  The list of grading duties allocated to the user
     */
    constructor(
        id: number,
        question_id: number,
        question_title: string,
        question_marks: number,
        completed_cnt: number,
        tot_cnt: number,
        is_autograded: boolean,
        grading_duties: MyGradingDuty[],
    ) {
        this.id = id;
        this.question_id = question_id;
        this.question_title = question_title;
        this.grading_duties = grading_duties;
        this.question_marks = question_marks;
        this.completed_cnt = completed_cnt;
        this.tot_cnt = tot_cnt;
        this.is_autograded = is_autograded;
    }
}


/**
 * The model class holds details of the grading duty
 *  allocated to the user in the event.
 *
 */
export class MyGradingDuty {
    /**
     * The list index of the grading duty from the list of grading duties grouped by question in the view
     */
    public id: number;
    /**
     * The database ID of the grading duty
     */
    public main_id: number;
    /**
     * The boolean flag representing whether grading is completed or not for the copy associated with the grading duty
     */
    public is_completed: boolean;
  
    /**
     * The graded marks, marks are aggregated in case copy is graded by multiple graders
     */
    public aggregate_marks: number;
    /**
     * The string represents comma seperated group member names
     */
    public group_member_names: string;
    /**
     * The list of group members
     */
    public grp_members: GroupMember[];
    /**
     * The comment submitted by grader during grade submission
     */
    public grader_comment: string;
    /**
     * The external marks adjustment if rubric is not present in some case, the value can be positive/negative
     */
    public marks_adjustment: number;
    /**
     * The question corresponding page number in the submission copy associated with the grading duty
     */
    public upload_page_no: number;
    /**
     * The list of rubrics present for the grading of the corresponding question
     */
    public rubrics: MyRubric[];
  quetionText: string;
  options: any;
  responseText: any;
  questionType: any;
  solutionText: string;
    /**
     * Model constructor receives and initializes The MyGradingDuties model properties
     * @param id  The list index of the grading duty from the list of grading duties grouped by question in the view
     * @param main_id The database ID of the grading duty
     * @param is_completed The boolean flag representing whether grading 
     * is completed or not for the copy associated with the grading duty
     * @param aggregate_marks The graded marks, marks are aggregated in case copy is graded by multiple graders
     * @param group_member_names The string represents comma seperated group member names
     * @param grp_members The list of group members
     */
    constructor(
        id: number,
        main_id: number,
        is_completed: boolean,
        aggregate_marks: number,
        group_member_names: string,
        grp_members: GroupMember[],
    ) {
        this.id = id;
        this.main_id = main_id;
        this.is_completed = is_completed;
        this.aggregate_marks = aggregate_marks;
        this.grp_members = grp_members;
        this.group_member_names = group_member_names;

        this.grader_comment = '';
        this.marks_adjustment = 0;
        this.upload_page_no = 1;
        this.rubrics = [];
    }
}
/**
 * the model class holds details of the re-grading duty( corresponding to the regrading request)
 *  allocated to the user in the event.
 *
 */
export class MyReGradingDuty {
    /**
     * The list index of the re-grading request from the the list of re-grading reuests in the view
     */
    public id: number;
    /**
     * The database ID of the re-grading duty
     */
    public gd_id: number;
    /**
     * The boolean flag representing whether grading 
     * is completed or not for the copy associated with the grading duty
     */
    public is_completed: boolean;
    /**
     * The graded marks, marks are aggregated in case copy is graded by multiple graders
     */
    public aggregate_marks: number;
    /**
     * The comment submitted by grader during re-grade submission
     */
    public grader_comment: string;
    /**
     * The external marks adjustment if rubric is not present in some case, the value can be positive/negative
     */
    public marks_adjustment: number;
    /**
     * The question corresponding page number in the submission copy associated with the grading duty
     */
    public upload_page_no: number;
    /**
     * The list of rubrics present for the grading of the corresponding question
     */
    public rubrics: MyRubric[];

    /**
     * The database ID of the submission copy associated with the re-grading duty
     */
    public submission_group_id: number;
    /**
     * The string represents comma seperated group member names
     */
    public grp_member_names: string;
    
    /**
     * The database ID of the question corresponding to the re-grading duty
     */
    public question_id: number;
    /**
     * The title of the question corresponding to the re-grading duty
     */
    public question_title: string;
    /**
     * The marks of the question corresponding to the re-grading duty
     */
    public question_marks: number;
    
    /**
     * The database ID of the question-set of the question corresponding to the re-grading duty
     */
    public qset_id: number;
    /**
     * The name of the question-set of the question corresponding to the re-grading duty
     */
    public qset_name: string;
    /**
     * The list of old grading duties, each grading duty holds the graded marks and rubrics applied by the grader
     */
    public prev_gds: MyGradingDuty[];
    question_options: string;
    question_text: string;
    question_type: string;
    response: any;

    /**
     *  Model constructor receives and initializes The MyReGradingDuties model properties
     * @param id 
     * @param gd_id 
     * @param is_completed 
     * @param aggregate_marks 
     * @param submission_group_id 
     * @param grp_member_names 
     * @param question_id 
     * @param question_title 
     * @param question_marks 
     * @param qset_id 
     * @param qset_name 
     */
    constructor(
     id: number,
     gd_id: number,
     is_completed: boolean,
     aggregate_marks: number,
     submission_group_id: number,
     grp_member_names: string,
     question_id: number,
     question_title: string,
     question_marks: number,
     qset_id: number,
     qset_name: string,
     question_options: string,
     question_text: string,
     question_type: string,

    ) {
        this.id = id;
        this.gd_id = gd_id;
        this.is_completed = is_completed;
        this.aggregate_marks = aggregate_marks;
        this.submission_group_id = submission_group_id;
        this.grp_member_names =grp_member_names;
        this.question_id = question_id;
        this.question_title = question_title;
        this.question_marks = question_marks;
        this.qset_id = qset_id;
        this.qset_name = qset_name;
        this.question_options = question_options;
        this.question_text = question_text;
        this.question_type = question_type;

        this.prev_gds = [];
        this.grader_comment = '';
        this.marks_adjustment = 0;
        this.upload_page_no = 0;
        this.rubrics = [];
        
     
    }
}


/**
 * Model class corresponds to the Rubric entity in the course.
 * The model class properties holds the detailed information of the rubric 
 */
export class MyRubric {
    /**
     *  Model constructor receives and initializes The MyRubric model properties
     * @param id The list index from view
     * @param main_id The database ID of the rubric
     * @param text The rubric description
     * @param marks The rubric marks
     * @param is_selected The boolean flag representing whether rubric is applied or not by the grader
     */
    constructor(
        public id: number,
        public main_id: number,
        public text: string,
        public marks: number,
        public is_selected: boolean,
    ) { }
}


export class AutoGradingCluster {
  
    constructor(
        public id: number,
        public cluster_label: string,
        public auto_GDs: AutoGradingDuty[],
    ) { }
}

export class AutoRowGDs {
  
    constructor(
        public gd_0: AutoGradingDuty,
        public gd_1: AutoGradingDuty,
        public gd_2: AutoGradingDuty,
        public gd_3: AutoGradingDuty,
      
    ) { }
}

export class AutoGradingDuty {
  
    constructor(
        public id: number,
        public gd_id: number,
        public subquestion_id: number,
        public predicted_label: number,
        public predicted_char: string,
        public confidence: number,
        public image: any,
    ) { }
}



/**
 * The model holds the information of user submission marksheet
 */
export class MyMarks {
    /**
     * The array consisting the user submitted main submission file in image format
     */
    public submission_images: string[];
    /**
     * The total obtained marks in the event
     */
    public aggregate_marks: number;
    /**
     * The total marks of the event
     */
    public total_marks: number;
    /**
     *  The grade aggregation method in case the submission
     *  in the event is graded by multiple graders. For example max, min, avg
     */
    public aggregation_method: string;
    /**
     * The list of graded copy for each answered question 
     */
    public questions: MyMarksQuestion[];
  responseData: any;

    /**
     * Model constructor receives and initializes The MyRubric model properties
     * @param submission_images 
     * @param aggregate_marks 
     * @param total_marks 
     * @param aggregation_method 
     * @param questions 
     */
    constructor(
        submission_images: string[],
        aggregate_marks: number,
        total_marks: number,
        aggregation_method: string,
        questions: MyMarksQuestion[],
    ) {
        this.submission_images = submission_images;
        this.aggregate_marks = aggregate_marks;
        this.total_marks = total_marks;
        this.aggregation_method = aggregation_method;
        this.questions = questions;
    }
}

/**
 * The model holds the detailed information of grading
 *  corresponding to any question in the event. It mainly consist re-graded copy,
 * graded copies, regrade requests information, etc.
 */
export class MyMarksQuestion {
    /**
     * The list index of the question in the grade sheet
     */
    public id: number;
    /**
     * The database ID of the question in the grade sheet
     */
    public question_id: number;
    /**
     * The title of the question in the grade sheet
     */
    public question_title: string;
    /**
     * The marks of the question in the grade sheet
     */
    public question_marks: number;
    /**
     * The obtained marks of the question in the grade sheet
     */
    public graded_marks: number;
    /**
     * The question corresponding page number in the submission copy
     */
    public upload_page_no: number;
    /**
     * The database ID of the Response entity associated with the grading of the question
     */
    public response_id: number;
    /**
     * The database ID of the Subevent(GUPLOAD) entity associated with the grading of the question
     */
    public subevent_id: number;
    /**
     * The object of the MyMarksGradingDuty model class, holds the regraded copy information
     */
    public regrading_duty: MyMarksGradingDuty;
    /**
     * The array containing re-grading chat messages corresponding 
     * to re-grade requests for the question
     */
    public regrading_messages: RegradingMessage[];
    /**
     * The array holds the graded copies in case grading done by mulitple graders
     */
    public grading_duties: MyMarksGradingDuty[];
    public text: string;
    public options: string;
    public type: string;
  responseText: any;
  solutionText: string;
  optionText: string;

    /**
     * Model constructor receives and initializes The MyRubric model properties
     * @param id 
     * @param question_id 
     * @param question_title 
     * @param question_marks 
     * @param graded_marks 
     * @param upload_page_no 
     * @param response_id 
     * @param subevent_id 
     * @param regrading_duty 
     * @param regrading_messages 
     * @param grading_duties 
     */
    constructor(
        id: number,
        question_id: number,
        question_title: string,
        question_marks: number,
        graded_marks: number,
        upload_page_no: number,
        response_id: number,
        subevent_id: number,
        regrading_duty: MyMarksGradingDuty,
        regrading_messages: RegradingMessage[],
        grading_duties: MyMarksGradingDuty[],
        text: string,
        options: string,
        type: string,
    ) {
        this.id = id;
        this.question_id = question_id;
        this.question_title = question_title;
        this.question_marks = question_marks;
        this.upload_page_no = upload_page_no;
        this.grading_duties = grading_duties;
        this.response_id = response_id;
        this.subevent_id = subevent_id;
        this.graded_marks = graded_marks;
        this.regrading_duty = regrading_duty;
        this.regrading_messages = regrading_messages;
        this.text = text;
        this.options = options;
        this.type = type;
    }
}


/**
 * The model holds the information about graded copy submitted by the grader/re-grader.
 * It mainly consists graded marks, grader message, and list of applied rubrics
 */
export class MyMarksGradingDuty {
    /**
     * The list index in case submission is multiple graded copies available
     */
    public id: number;
    /**
     * The database ID of the grading duty
     */
    public main_id: number;
    /**
     * The graded marks submitted by the grader
     */
    public aggregate_marks: number;
    /**
     * The grader message submitted by the grader
     */
    public grader_comment: string;
    /**
     * The external marks adjustment if rubric is not present in some case, the value can be positive/negative
     */
    public marks_adjustment: number;
    /**
     * The list of applied rubrics by the grader
     */
    public question_rubrics: MyRubric[];
    /**
     * Model constructor receives and initializes The MyRubric model properties
     * @param id 
     * @param main_id 
     * @param aggregate_marks 
     * @param grader_comment 
     * @param marks_adjustment 
     * @param question_rubrics 
     */
    constructor(
        id: number,
        main_id: number,
        aggregate_marks: number,
        grader_comment: string,
        marks_adjustment: number,
        question_rubrics: MyRubric[],
    ) {
        this.id = id;
        this.main_id = main_id;
        this.aggregate_marks = aggregate_marks;
        this.grader_comment = grader_comment;
        this.marks_adjustment = marks_adjustment;
        this.question_rubrics = question_rubrics;
    }
}


/**
 * The model class hold the information about Grading duty - rubric link
 */
export class GDHasRubric {
    /**
     * Model constructor receives and initializes The GDHasRubric model properties
     * @param main_id The database ID of the GradingDutyHasRubric entity
     * @param gradingduty The database ID of the corresponding grading duty
     * @param rubric The database ID of the corresponding rubric
     */
    constructor(
        public main_id: number,
        public gradingduty: number,
        public rubric: number,
    ) { }
}


/**
 * The model class holds the regrading chat message information
 */
export class RegradingMessage {
    /**
     * Model constructor receives and initializes The RegradingMessage model properties
     * @param seq_id The sequence ID representing the position of message in case of multiple messages present
     * @param message The message text
     * @param sender The sender of message, for example student/grader
     */
    constructor(
        public seq_id: number,
        public message: string,
        public sender: string,
    ) { }
}
