/**
 * Model to hold course section information
 */
export class Section {
    /**
     * Model constructor receives and initializes Section model properties
     * @param id section ID
     * @param name section name
     */
    constructor(
        public id: number,
        public name: string,
    ) { }
}

/**
 * Model class to hold detailed information about Course
 */
export class CourseDetail {
    /**
     * Model constructor receives and initializes CourseDetail model properties
     * @param name name of the course e.g. Introduction to machine lerning
     * @param title an unique title of course e.g. CS771
     * @param description small description about course
     * @param semester semester in which course is to be taught
     * @param year year in which course is to be taught
     * @param department course corresponding department 
     * @param is_active boolean flag representing whether course is currently active or suspended
     * @param course_dir The path of directory on server where all course data expected to be stored
     */
    constructor(
        public name: string,
        public title: string,
        public description: string,
        public semester: string,
        public year: number,
        public department: string,
        public is_active: string,
        public course_dir: string,
    ) { }
}
/**Model class to hold detailed information about Role, model used to list roles in dropdown on view form while editing/creating new role
 */
export class Roles {
    /**
     * Model constructor receives and initializes Role model properties
     * @param id role id
     * @param name name representing role
     */
    constructor(
        public id: number,
        public name: string,
    ) { }
}
/**
 * Model class to hold detailed information about Role exist in Course, 
 */
export class CourseRole {
    /**
     * Model constructor receives and initializes CourseRole model properties
     * @param id course role id
     * @param main_id the database id of course role
     * @param name an unique name representing course role
     * @param actions list of metarole id's corresponding to the course role
     * @param str_actions list of metarole names corresponding to the course role
     */
    constructor(
        public id: number,
        public main_id: number,
        public name: string,
        public actions: string[],
        public str_actions: string[],
    ) { }
}


/**
 * Model class to hold detailed information about User enrollment in Course 
 */
export class Enrollment {
    /**
     *  Model constructor receives and initializes CourseRole model properties
     * @param id enrollment id
     * @param main_id the database id of user enrollment
     * @param username username of enrollment associated user
     * @param roll_no roll number of enrollment associated user
     * @param first_name first name of enrollment associated user
     * @param last_name last name of enrollment associated user
     * @param email email of enrollment associated user
     * @param department enrollment associated department name 
     * @param program the program in which user enrolled
     * @param role the name of role assigned to enrollment associated user in the corresponding course
     * @param roleid the database id of role assigned to enrollment associated user in the corresponding course
     * @param sections the string representing pipe seperated list of sections corresponding to enrollment
     * @param sectionsList the list of sections corresponding to enrollment
     */
    constructor(
        public id: number,
        public main_id: number,
        public username: string,
        public roll_no: string,
        public first_name: string,
        public last_name: string,
        public email: string,
        public department: string,
        public program: string,
        public role: string,
        public roleid: number,
        public sections: string,
        public sectionsList: number[],
        // public sections: Section[]
    ) { }
}
