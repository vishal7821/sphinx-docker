/**
 * Model class to hold detailed information about Assignment in the Course. Assignment information includes properties like name, database id, assignment description, list of question sets
 */
export class Assignment {
    /**
     *  Model constructor receives and initializes Assignment model properties
     * @param id list index of assignment from list of all course assignments, used by frontend API's to retrive user selected assignment
     * @param main_id An unique database id of Assignment
     * @param name Assignment name
     * @param description An small description about assignment
     * @param questionSets list of QuestionSet that belongs to Assignment
     */
    constructor(
        public id: number,
        public main_id: number,
        public name: string,
        public description: string,
        public questionSets: QuestionSet[],
        public is_interactive: Boolean
    ) {
        // console.log('in constructor',main_id);
    }
    /**
     * Model Method extend and update the Model property questionSets with provided list of question sets
     * @param qSets List of QuestionSets to be added to Model property questionSets
     */
    public setQuestionSets(qSets: any[]) {
        this.questionSets.concat(qSets);
    }
}
/**
 * Model class to hold detailed information about QuestionSet in the Assignment 
 */
export class QuestionSet {
    /**
      *  Model constructor receives and initializes QuestionSet model properties
    * @param id list index of questionset from list of all question sets within Assignment, used by frontend API's to retrive user selected QuestionSet
     * @param main_id An unique database id of QuestionSet
     * @param name QuestionSet name
     * @param total_marks Sum of all question marks within the QuestionSet
     * @param name_coords Coordinates of the user provided box for Username on main Question File
     * @param roll_coords Coordinates of the user provided box for user roll number on main Question File
     * @param question_name name of Main QuestionSet file
     * @param supplementary_name name of supplementary file of QuestionSet
     * @param solution_name name of solution file of QuestionSet
     */
    constructor(
        public id: number,
        public main_id: number,
        public name: string,
        public total_marks: number,
        public name_coords: string,
        public roll_coords: string,
        // public question_file : string,
        // public supplementary_file : string,
        // public solution_file : string,
        public question_name: string,
        public supplementary_name: string,
        public solution_name: string,

    ) {}
}

/**
 * Model class to hold detailed information about Question in the QuestionSet 
 */
export class Question {
    quetionText: string;
  questionType: string;
  solutionText: string;
    /**
    *  Model constructor receives and initializes Question model properties
    * @param id list index of question from list of all questions within QuestionSet, used by frontend API's to retrive user selected Question
     * @param main_id An unique database id of Question
     * @param title Question title i.e. Q1, Q1.1 etc
     * @param subpart_no Number representing child id within parent question, This should be a non-negative integer i.e. 0, 1, 2 etc 
     * @param type type of Question. Whether Is it MCQ, short answer, T/F etc
     * @param text The text of this question in case of live exam
     * @param filepage On which page of the question paper does this question appear
     * @param file_coords On the main QuestionSet file, on that filepage, where does this question appear 
     * @param marks Question Marks
     * @param difficulty_level difficulty level of question in range of 0-10
     * @param is_autograded Boolean Flag representing whether is this question Auto-gradable
     * @param is_actual_question Boolean Flag representing whether is this question Actual question or question used to create Tree hierarchy 
     * @param parent Parent question id of this Question
     */
    constructor(
        public id: number,
        public main_id: number,
        public title: string,
        public subpart_no: number,
        public type: string,
        public text: string,
        public filepage: number,
        public file_coords: string,
        public solution_list: string,
        public marks: number,
        public difficulty_level: number,
        public is_autograded: boolean,
        public is_actual_question: boolean,
        public parent: number,
        public options: any,

    ) {}
}

/**
 * Model class to hold detailed information about Rubric of the corresponding Question 
 */
export class Rubric {
    /**
    *  Model constructor receives and initializes Rubric model properties
    * @param id list index of Rubric from list of all question rubrics, used by frontend API's to retrive user selected Rubric
     * @param text Rubric Text description
     * @param marks Rubric marks
     * @param question Rubric corresponding question main id 
     */
    constructor(
        public id: number,
        public text: string,
        public marks: number,
        public question: number,

    ) {}
}

/**
 * Model class to hold detailed information about Topic in the Course 
 */
export class Topic {
    /**
     *  Model constructor receives and initializes Topic model properties
    * @param id list index of topic from list of all course topics, used by frontend API's to retrive user selected topics
     * @param name Topic name
     * @param super_topic Parent topic name
     * @param description short desciption of Topic
     */
    constructor(
        public id: number,
        public name: string,
        public super_topic: string,
        public description: string,

    ) {}
}
