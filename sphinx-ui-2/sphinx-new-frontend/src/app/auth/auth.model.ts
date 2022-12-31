
/**
 * Model to save user information
   * @param id user database id
     * @param username unique userid which used for login
     * @param firstname first name of user
     * @param lastname last name / surname of user
     * @param email mail-id of user
     * @param department user's associated department
     * @param program user enrolled program, for example B.Tech., M.Tech.
     * @param lastlogin time stamp of users's last login
     * @param lastloginip ip address of system from which user makes last login
 */
export class User {
    /**
     * Intitalizes User model instance variable
     * @param id user database id
     * @param username unique userid which used for login
     * @param firstname first name of user
     * @param lastname last name / surname of user
     * @param email mail-id of user
     * @param department user's associated department
     * @param program user enrolled program, for example B.Tech., M.Tech.
     * @param lastlogin time stamp of users's last login
     * @param lastloginip ip address of system from which user makes last login
     */
    constructor(
        public id: number,
        public username: string,
        public firstname: string,
        public lastname: string,
        public email: string,
        public department: string,
        public program: string,
        public lastlogin: string,
        public lastloginip: string,
    ) { }
}

/**
 * Model to save User's enrolled course related information
  * @param id user database id
     * @param username unique userid which used for login
     * @param firstname first name of user
     * @param lastname last name / surname of user
     * @param email mail-id of user
     * @param department user's associated department
     * @param program user enrolled program, for example B.Tech., M.Tech.
     * @param lastlogin time stamp of users's last login
     * @param lastloginip ip address of system from which user makes last login
 */
export class Course {
    /** Intitalizes Course model instance variable
     * @param id course database id
     * @param coursename name of course
     * @param coursetitle unique title of course e.g. CS771
     * @param role_id user's enrolled role database id
     * @param role_name user's enrolled role name
     * @param sectionlist string contains pipe separated list of sections in which user is enrolled
     * @param actionlist string consisting of permission bits of backend API's
     */
    constructor(
        public id: number,
        public coursename: string,
        public coursetitle: string,
        public role_id: number,
        public role_name: string,
        public sectionlist: string,
        public actionlist: string,

    ) { }
}
