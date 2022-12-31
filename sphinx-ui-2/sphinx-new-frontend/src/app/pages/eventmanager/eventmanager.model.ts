/**
 *  The model represents the Event entity in the Course.
 *  It contains the properties which holds the detailed information about the event
 */

export class EventClass {
    /**
     *  Model constructor receives and initializes EventClass model properties
     * @param id the index representing event in the list of events, it used to retrieve user selected event from view for edit/delete
     * @param main_id the database id from the Event table
     * @param name the event name
     * @param assignment_id the database id of the assignment associated with the event
     * @param assignment_name the name of the assignment associated with the event
     * @param grade_aggregation_method the grade aggregation method in case the submission
     *  in the event is graded by multiple graders. For example max, min, avg
     * @param is_external the boolean flag representing whether this event is external or not.
     *  If event is external then no need to associate it with the assignment
     * @param subevents the list of subevents corresponding to the event. 
     * Each subevent is represents using the instance of SubEvent model class
     */
    constructor(
        public id: number,
        public main_id: number,
        public name: string,
        public assignment_id: number,
        public assignment_name: string,
        public grade_aggregation_method: string,
        public is_external: boolean,
        public subevents: SubEvent[],

    ) {}
}

/**
  *  The model represents the Subevent entity corresponding to the event in the Course.
 *  It contains the properties which holds the detailed information about the subevent
 */
export class SubEvent {
    /**
     *   Model constructor receives and initializes The SubEvent model properties
     * @param id the index representing SubEvent in the list of SubEvents, it used to retrieve user selected subevent from view for edit/delete
     * @param main_id the database id from the subevent table
     * @param event_id the database id of the corresponding event from the event table
     * @param name the name of subevent
     * @param time_range time range is the list which holds the start time and end time of the subevent
     * @param type the type of subevent. for example SUPLOAD, GUPLOAD, QVIEW, SVIEW, etc
     * @param is_blocking the boolean flag representing whether is the subevent currently in blocking mode or not
     * @param allow_late_ending  the boolean flag representing whether the subevent activity has allowed late ending or not
     * @param display_end_time the end time used to show to the participant's of the subevent
     * @param late_end_time the late end time used for application logic if the property allow_late_ending set to true
     * @param display_late_end_time the late ed time used to show to 
     *  the participant's of the subevent if the property allow_late_ending set to true
     * @param time the variable holds the percentage of subevent time window passed. This variable used to show time progress bar for the subevent in the view
     * @param sbm the property represents the submission mode. If the subevent is of type SUPLOAD, then the property used to store the corresponding submission mode
     * @param sgs the property represents the submission group scheme. If the subevent is of type SUPLOAD, then the property used to store the corresponding submission group scheme
     * @param sgs_og_max the submission group size in case open group is opted as submission group scheme. Valid only if corresponding subevent type is SUPLOAD 
     * @param qss the question set scheme. Valid only if corresponding subevent type is SUPLOAD 
     * @param nac the boolean flag representing the submission access code is needed or not. Valid only if corresponding subevent type is SUPLOAD 
     * @param mus the maximum allowed size for main submission file. Valid only if corresponding subevent type is SUPLOAD 
     * @param mut the allowed file type for main submission file. Valid only if corresponding subevent type is SUPLOAD 
     * @param sup the boolean flag representing whether participant allow to make supplementar submission or not.
     * Valid only if corresponding subevent type is SUPLOAD 
     * @param sus the maximum allowed size for supplementary submission file. Valid only if corresponding subevent type is SUPLOAD 
     * @param sut the allowed file type for supplementary submission file. Valid only if corresponding subevent type is SUPLOAD 
     * @param del the delay parameter.Valid only if corresponding subevent type is SUPLOAD 
     * @param col the color should be shown as background, represented as rgb value. to be used for exam mode. Valid only if corresponding subevent type is SUPLOAD 
     * @param plist_csv_file the participant's CSV file. file holds the list of users allowing to perform the corresponding subevent activity
     * @param gen_subevent the corresponding generating subevent of the subevent. basically hold the database id from subevent table
     * @param gds the grading duty scheme. Valid only if corresponding subevent type is GUPLOAD 
     * @param participants_spec the variable represents the participant's selection mode,
     *  binary bit to represent whether participant's provided through CSV file or 
     * participant's list should be inherit from the subevents from participant's list subevents 
     * @param plist_subevents list of subevents from which participant's list can be inherited
     * @param gds_rep the repeatation factor for the corresponding grading duty scheme. Valid only if corresponding subevent type is GUPLOAD 
     * @param parent_subevent the subevent database id of corresponding parent subevent 
     * @param rds the regrading duty scheme. Valid only if corresponding subevent type is RGUPLOAD 
     */
    constructor(
        public id: number,
        public main_id: number,
        public event_id: number,
        public name: string,
        public time_range: Date[],
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

    ) {}
}
