import { NbMenuItem } from '@nebular/theme';


/**
 * The class contains the configuration setting properties of the appliction
 */
export class AppSettings {
  /**
   * The base URL of the the application server, the property
   * used to make backend API requests
   */
    // public static API_ENDPOINT = 'http://localhost:3000';
    public static API_ENDPOINT = 'http://40.76.1.187:3000';

    /**
     * The List of grade aggregation methods provided in the application.
     *  For example MIN, MAX, AVG, etc.
    */
    public static agg_methods = [
        { value: 'MIN', text: 'Minimum' },
        { value: 'AVG', text: 'Average' },
        { value: 'MAX', text: 'Maximum' },
        { value: 'MED', text: 'Median' },
    ];

    /**
     * The list of structure objects containing boolean value 
     * and corresponding text to present in the view
     */
    public static bool_val= [
        { value: true, text: 'Yes' },
        { value: false, text: 'No' },
    ];

    /**
     * The list contains the types of subevent provided by the application.
     * Each list item hold the subevent type and corresponding text to present in the view
     */
    public static subevent_types = [
        { value: 'SUPLOAD', text: 'Submission Upload (SUPLOAD)' },
        { value: 'GUPLOAD', text: 'Grading (GUPLOAD)' },
        { value: 'RGREQ', text: 'Request Regrading (RGREQ)' },
        { value: 'RGUPLOAD', text: 'Regrading (RGUPLOAD)' },
        { value: 'QVIEW', text: 'View Questions (QVIEW)' },
        { value: 'AVIEW', text: 'View Solution (AVIEW)' },
        { value: 'SVIEW', text: 'View Submission (SVIEW)' },
        { value: 'MVIEW', text: 'View Marks (MVIEW)' },
        { value: 'RMVIEW', text: 'View Regraded Marks (RMVIEW)' },
        { value: 'GVIEW', text: 'View Grading Duties (GVIEW)' },
        { value: 'RGVIEW', text: 'View Regrading Duties (RGVIEW)' },
    ];


    /**
     * The list of submission modes provided by the application 
     * to collect the user submissions in the event.
     * Each list item hold the submission mode code and corresponding text to present in the view
     */
    public static submission_modes = [
        { value: 'OLS', text: 'Online By Student' },
        { value: 'OLI', text: 'Online By Instructor' },
        { value: 'OSS', text: 'Onsite By Student' },
    ];


    /**
     * The list of grading duty schemes provided by the application.
     * Each list item hold the grading duty scheme and corresponding text to present in the view
     */
    public static grading_duty_schemes = [
        { value: 'MQS', text: 'Multiple Question By Single Grader(Manual)' },
        { value: 'MQR$rep', text: 'Multiple Questions By Multiple Grader(Manual)' },
        { value: 'RQS', text: 'Multiple Questions By Single Grader(Random)' },
        { value: 'RQR$rep', text: 'Multiple Questions By Multiple Grader(Random)' },
        { value: 'RSS', text: 'Multiple Submissions By Single Grader(Random)' },
        { value: 'RSR$rep', text: 'Multiple Submissions By Mutiple Grader(Random)' },
    ];

    /**
     * The list of re-grading duty schemes provided by the application.
     * Each list item hold the re-grading duty scheme and corresponding text to present in the view
     */
    public static regrading_duty_schemes = [
        { value: 'SOR', text: 'Same or Random(if multiple graders for question) Grader' },
        { value: 'RAN', text: 'Random Grader from participants list' },
        { value: 'QRN', text: 'Random Grader from question specific participants list' },
    ];

    /**
     * The list of submission group schemes provided by the application.
     * Each list item hold the submission group scheme and corresponding text to present in the view
     */
    public static submission_group_scheme= [
        { value: 'IN', text: 'Individual' },
        { value: 'FG', text: 'Fixed Group Submission' },
        { value: 'OG', text: 'Open Group' },
    ];

     /**
     * The list of question set schemes provided by the application.
     * Each list item hold the question set scheme and corresponding text to present in the view
     */
    public static question_set_scheme= [
        { value: 'OS', text: 'open question set' },
        { value: 'FS', text: 'Fixed question set' },
    ];
    // public static auditor_actions: string[] = [
    //     'View MyEvents',
    //     'View Question Files',
    //     'View Solution Files',
    //   ];

    //   public static student_actions: string[] = [
    //     'View MyEvents',
    //     'View Question Files',
    //     'View Solution Files',

    //     'View Course Details',
    //     'Join Submission Group',
    //     'Create Submission Group',
    //     'View Submissions',
    //     'Upload Submission',
    //     'Edit Submission',
    //     'View Marks',
    //     'Create Regrade Request',
    //   ];

    //   public static grader_actions: string[] = [
    //     'View MyEvents',
    //     'View Question Files',
    //     'View Solution Files',
    //   ];
    //   public static tutor_actions: string[] = [
    //     'View MyEvents',
    //     'View Question Files',
    //     'View Solution Files',
    //   ];
    //   public static cadmin_actions: string[] = [
    //     'View MyEvents',
    //     'View Question Files',
    //     'View Solution Files',
    //   ];
    //   public static instructor_actions: string[] = [
    //     'View MyEvents',
    //     'View Question Files',
    //     'View Solution Files',
    //   ];
}

export class AppRoutes {
  public static toCourse: string[] = ['/pages', 'course'];
  public static toCourseTopics: string[] = ['/pages', 'course', 'topics'];
  public static toCourseSections: string[] = ['/pages', 'course', 'roles'];
  public static toCourseRoles: string[] = ['/pages', 'course', 'sections'];
  public static toCourseRoster: string[] = ['/pages', 'course', 'roster'];
}

/**
 * The class contains the meta roles provided by the application 
 * with the corresponding allowed actions
 */
export class MetaRoles {
  /**
   * The property represents the list of allowed actions correspond to the Auditor metarole
   */
    public static auditor_actions: string[] = [
        'View MyEvents',
        'View Question Files',
        'View Solution Files',
      ];

      /**
   * The property represents the list of allowed actions correspond to the Student metarole
   */
      public static student_actions: string[] = [
        'Auditor Actions',
        'View Course Details',
        'Join Submission Group',
        'Create Submission Group',
        'View Submissions',
        'Upload Submission',
        'Edit Submission',
        'View Marks',
        'Create Regrade Request',
      ];

      /**
   * The property represents the list of allowed actions correspond to the Grader metarole
   */
      public static grader_actions: string[] = [
        'Auditor Actions',
        'View Course Details',
        'View Grading Duties',
        'Perform Grading',
        'Edit Grading',
        'View Regrading Duties',
        'Perform Regrading',
        'Edit Regrading',
        'View Submission Files',
      ];
      /**
   * The property represents the list of allowed actions correspond to the Tutor metarole
   */
      public static tutor_actions: string[] = [
        'Auditor Actions',
        'View Course Details',
        'View Course Sections',
        'View Course Enrollments',
        'View Course Roles',
        'View Course Topics',
        'View Assignment Details',
        'View Event Details',
        'Create/Update/Delete Assignments',
        'Create/Update/Delete Question sets',
        'Create/Update/Delete Questions',
      ];

      /**
   * The property represents the list of allowed actions correspond to the Course Admin metarole
   */
      public static cadmin_actions: string[] = [
        'Tutor Actions',
        'Crate/Update/Delete Course Details',
        'Crate/Update/Delete Course Section',
        'Crate/Update/Delete Course Enrollment',
        'Crate/Update/Delete Course Role',
        'Crate/Update/Delete Course Topic',
        'Crate/Update/Delete event',
        'Crate/Update/Delete Subevent',
        'Grading and Submission Management',
      ];
      /**
   * The property represents the list of allowed actions correspond to the Instructor metarole
   */
      public static instructor_actions: string[] = [
        'Course Admin Actions',
        'Perform Submission Related Actions',
        'Perform Grading Related Actions',
      ];
}

/**
 * The class represents the list of meta roles provided by the application with the
 * corresponding binary action string. The server indentify and distingush the meta roles from each
 * other using respective the binary action strings
 */
export class MetaRoleActions {
   /**
   * The property represents the binary action string correspond to the Auditor metarole
   */
    public static auditor: string = '0000000000000000000000000000000000000000000001000000001100000000000000000000000000000';
    /**
   * The property represents the binary action string correspond to the Student metarole
   */
    public static student: string =  '1000000000000000000010000000000000000000000001000000001111111111111000000001100100000';
    /**
   * The property represents the binary action string correspond to the Grader metarole
   */
    public static grader: string = '1000000000000000000000000000000000000000000001000000001100000000000011111110000000000';
    /**
   * The property represents the binary action string correspond to the Tutor metarole
   */
    public static tutor: string = '1010001000100010001111111111111111111111111111100000001100000000000000000000000000000';
    /**
   * The property represents the binary action string correspond to the Course Admin metarole
   */
    public static courseadmin: string = '1111111111111111111111111111111111111111111111111111111100000000000100000000011000000';
    /**
   * The property represents the binary action string correspond to the Instructor metarole
   */
    public static instructor: string = '111111111111111111111111111111111111111111111111111111110000000000010000000001101111111';
}


/**
 * The class represents the side bar menu items of the application
 */
export class RoleMenuItems {
  /**
   * The Course Feature menu item, used to group together the course specific provided features
   */
  public static cfeatures_title: NbMenuItem =
    {
    title: 'COURSE FEATURES',
    group: true,
  };

  /**
   * The Course manager menu item. Contains the child sections and correspnding navigation URL
   * in the application
   */
  public static course_manager: NbMenuItem =
  {
    title: 'Course Settings',
    icon: 'settings',
    children: [
      {
        title: 'Roles',
        link: '/pages/course/roles',
        icon: 'funnel',
      },
      {
        title: 'Sections',
        link: '/pages/course/sections',
        icon: 'folder',
      },
      {
        title: 'Topics',
        link: '/pages/course/topics',
        icon: 'link',
      },
      {
        title: 'Roster',
        icon: 'people',
        link: '/pages/course/roster',

      },
    ],
  };

   /**
   * The Assignment Manager manager menu item. Provides the configuration settings correspond to the menu item,
   * like title, menu icon, and the navigation link to the Assignment Manager
   */
  public static assign_manager: NbMenuItem =
  {
    title: 'Assignment Manager',
    icon: 'clipboard',
    link: '/pages/course/assignment',
    home: true,
  };

   /**
   * The Event Manager menu item. Provides the configuration settings correspond to the menu item,
   * like title, menu icon, and the navigation link to the Event Manager
   */
  public static event_manager: NbMenuItem =
  {
    title: 'Event Manager',
    icon: 'list',
    link: '/pages/course/events',
    home: true,
  };

   /**
   * The My Events manager menu item. Provides the configuration settings correspond to the menu item,
   * like title, menu icon, and the navigation link to the MyEvents Manager dashboard
   */
  public static my_events: NbMenuItem =
  {
    title: 'My Events',
    icon: 'keypad',
    link: '/pages/course/myevents',
    home: true,
  };

    /**
   * The Grading and Submission manager menu item. Provides the configuration settings correspond to the menu item,
   * like title, menu icon, and the navigation link to the Grading and Submission Manager
   */
  public static grade_sub_mgmnt: NbMenuItem =
  {
    title: 'Course Management',
    icon: 'options',
    link: '/pages/course/admin',
    home: true,
  };

     /**
   * The My Masquaraded actions menu item. Provides the configuration settings correspond to the menu item,
   * like title, menu icon, and the navigation link to the Masquaraded Actions dashboard
   */
  public static masquaraded_actions: NbMenuItem =
  {
    title: 'Impersonated Actions',
    icon: 'lock',
    link: '/pages/course/impersonatedaction',
    home: true,
  };

     /**
   * The logout menu item. Provides the configuration settings correspond to the menu item,
   * like title, menu icon, and the navigation link to the logout component
   */
  public static logout: NbMenuItem =
  {
    title: 'Logout',
    link: '/auth/logout',
    icon: 'log-out',
  };



}
