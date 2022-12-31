import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../Shared/constants';
import { catchError, tap, concatMap, map } from 'rxjs/operators';
import { Course } from '../../auth/auth.model';
import { Observable, from, BehaviorSubject, Subject } from 'rxjs';
import { Assignment, QuestionSet, Question, Rubric, Topic } from './assignmentmanager.model';
import { TreeModel } from 'ng2-tree';

/**
 * AssignmentManagerService injectable provides necessary function API's to perform server API interaction for course Assignment management 
 */
@Injectable({ providedIn: 'root' })
export class AssignmentManagerService {


    /**
     * BehaviorSubject object used to multicast the List of Course Assignments to application
     */
    public assignData = new BehaviorSubject<Assignment[]>([]);
    /**
     * List index of user selected assignment to edit from view
     */
    public assignEdit: number;
    /**
     * List index of user selected question set to edit from view
     */
    public qSetEdit: number;

    
    public optionData = new Subject();

    public optionDataMCQRB = new Subject();

    
    /**
     * The method receives option data object for the MCQCB question and multicast it to application using property optionData
     * @param optionObject Object of option data for the MCQCB question to be multicast
     */
    communicateOptionData(optionObject) {
        this.optionData.next(optionObject);
    }

    /**
     * The method receives option data object for the MCQRB question and multicast it to application using property optionDataMCQRB
     * @param optionObjectMCQRB Object of option data for the MCQRB question to be multicast
     */
    communicateOptionDataMCQRB(optionObjectMCQRB) {
        this.optionDataMCQRB.next(optionObjectMCQRB);
    }

    /**
     * An injectable constructor used to initialize to HttpClient object
     * @param http an HttpClient object
     */
    constructor(private http: HttpClient) {
    }

    /**
     * sendAssignData method receives List of Assignment model objects and multicast it to application using property assignData
     * @param data List of Assignment model objects to be multicast
     */
    sendAssignData(data: Assignment[]) {
        this.assignData.next(data);
    }

    /**
     * getAssignData method used to get assignData Subject as observable to subscribe the Subject
     * @returns An Observable of class property assignData Subject 
     */
    getAssignData(): Observable<Assignment[]> {
        return this.assignData.asObservable();
    }


   /**
     * fetchAssignment method makes an server get api request to fetch list of existing assignments in course.
     * Whenever call made to this function, function extract the list of assignment information and stores in localstorage for further availibility to application 
     * @returns an observable of http api call
     */
    fetchAssignment() {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/assignments/')
            .pipe(catchError(errorRes => this.handleAPIError(errorRes)),
                tap(responseData => {
                    // console.log(responseData);
                    let assignments: any[];
                    assignments = responseData.assignments;

                    const extractedAssigns: Assignment[] = [];
                    for (let i = 0; i < assignments.length; i++) {
                        const assign = new Assignment(
                            i + 1,
                            assignments[i].id,
                            assignments[i].name,
                            assignments[i].comments,
                            [],
                            assignments[i].is_interactive
                        );
                        // console.log('assign fetch id=',assign.main_id);
                        extractedAssigns.push(assign);
                        // this.assignmentData.push(assign);
                        // console.log('assignaa fetch id=',this.assignmentData[i].main_id);
                    }
                    // this.assignmentData=extractedAssigns;
                    // console.log('extracted data=',extractedAssigns);
                    // this.sendAssignData(extractedAssigns);

                    localStorage.setItem('assignments', JSON.stringify(extractedAssigns));

                },
                ));
    }
       /**
     * this method process the recieved error response and displays appropriate error message 
     * @param errorRes an error recieved from backend API call
     */
    handleAPIError(errorRes: any): any {
        throw new Error('Method not implemented.');
    }

    /**
     * addAssignment method makes the server api request to add a new assignment to course with provided assignment data
     * @param data Assignment data to be created 
     * @returns an observable of http api call
     */
    addAssignment(data: Assignment) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/assignments/'
            , {
                name: data.name,
                comments: data.description,
                is_interactive: data.is_interactive,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }

    /**
     * editAssignment method makes the server api request to backend to edit the existing assignment with new provided assignment details 
     * @param data Assignment model object contains new assignment name, description, existing assignment id
     * @returns an observable of http api call
     */
    editAssignment(data: Assignment) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/assignment/' + data.main_id + '/'
            , {
                name: data.name,
                comments: data.description,
                is_interactive: data.is_interactive,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }


    /**
     * this method makes the server api request to delete an existing assignment with provided assignment id in course
     * @param data Assignment model object contains assignment id to be deleted
     * @returns an observable of http api call
     */
    deleteAssignment(data: Assignment) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.delete<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/assignment/' + data.main_id + '/')
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }

/**
 * this method makes the server api request to fetch all question sets corresponds to an assignment with provided assignment id in course
 * @param idx unique Assignment ID from database 
 * @param courseid Course ID from database 
 */
    getSingleQuestionSet(idx: number, courseid: number) {

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + courseid + '/assignment/' + idx + '/question_sets/');
    }

    /**
     * fetchQuestionset method makes multiple server api get requests to fetch all question sets corresponds to all assignments in course.
     * Method collects server responses of all get api requests, format the response data into list of Question set model objects then save the data into localstorage for further availibility to application 
     * method uses RxJS operator concatMap to make multiple server requests syncronously
     */
    fetchQuestionset() {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const assigndt: Assignment[] = JSON.parse(localStorage.getItem('assignments'));
        // console.log('in fetch q sets=',assigndt);

        const arr: any[] = [];

        for (let i = 0; i < assigndt.length; i++) {
            arr.push(this.getSingleQuestionSet(assigndt[i].main_id, selectedCourse.id));
        }
        // let qsets: any[]=[];
        let index = 0;
        from(arr)
            .pipe(
                concatMap(x => x),
            )
            .subscribe(
                x => {

                    // console.log(x);
                    let questionsets: any = x;
                    questionsets = questionsets.questionsets;
                    const extractedQsets: QuestionSet[] = [];
                    for (let i = 0; i < questionsets.length; i++) {
                        const qset = new QuestionSet(
                            i + 1,
                            questionsets[i].id,
                            questionsets[i].name,
                            questionsets[i].total_marks,
                            questionsets[i].name_coords,
                            questionsets[i].roll_coords,
                            // null,
                            // null,
                            // null,
                            questionsets[i].original_question_file_name,
                            questionsets[i].original_supplementary_file_name,
                            questionsets[i].original_solution_file_name,
                        );

                        extractedQsets.push(qset);
                    }
                    assigndt[index].questionSets = extractedQsets;
                    // console.log('extractedQsets data=',extractedQsets);
                    // assigndt[i].setQuestionSets(x);
                    index++;
                    // console.log('all q sets=',x);
                    // qsets.push(x);

                    if (index == assigndt.length) {
                        // console.log('extractedQsets assign data=',assigndt);
                        this.sendAssignData(assigndt);
                        localStorage.setItem('assignments', JSON.stringify(assigndt));
                    }
                },
            );


        // map.unsubscribe();



    }

    /**
     * addQuestionSet method makes the server api request to add a new question set correspond to given assignment with provided question set data
     * @param data Question Set object data to be created 
     * @param assign_id corresponding Assignment ID in which question set to be created 
     * @returns an observable of http api call
     */
    addQuestionSet(assign_id: number, data: QuestionSet) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + assign_id + '/question_sets/'
            , {
                name: data.name,
                total_marks: data.total_marks,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }

     /**
     * editQuestionSet method makes the server api request to edit the existing question set correspond to given assignment with provided question set data
     * @param data Question Set object data to be updated 
     * @param assign_id question set corresponding Assignment ID
     * @returns an observable of http api call
     */
    editQuestionSet(assign_id: number, data: QuestionSet) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + assign_id + '/question_set/' + data.main_id + '/'
            , {
                name: data.name,
                total_marks: data.total_marks,
                name_coords: data.name_coords,
                roll_coords: data.roll_coords,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }

     /**
     * deleteQuestionSet method makes the server api request to delete the existing question set correspond to given assignment with provided question set ID
     * @param data Question Set object data to be deleted 
     * @param assign_id question set corresponding Assignment ID
     * @returns an observable of http api call
     */
    deleteQuestionSet(assign_id: number, data: QuestionSet) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.delete<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + assign_id + '/question_set/' + data.main_id + '/')
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }

     /**
     * fetchQuestionFile method makes the server api request to fetch the main Question Set file of provided question set correspond to given assignment in Course
     * @param qset_id requested file corresponding Question set ID 
     * @param assign_id question set corresponding Assignment ID
     * @returns an observable of http api call
     */
    fetchQuestionFile(assign_id: number, qset_id: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + assign_id + '/question_set/' + qset_id + '/question_file/');

    }

    /**
     * fetchSupplementaryFile method makes the server api request to fetch the Supplementary Question Set file of provided question set correspond to given assignment in Course
     * @param qset_id requested file corresponding Question set ID 
     * @param assign_id question set corresponding Assignment ID
     * @returns an observable of http api call
     */
    fetchSupplementaryFile(assign_id: number, qset_id: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + assign_id + '/question_set/' + qset_id + '/supplementary_file/');

    }

    
    /**
     * fetchSolutionFile method makes the server api request to fetch the Solution file of provided question set correspond to given assignment in Course
     * @param qset_id requested file corresponding Question set ID 
     * @param assign_id question set corresponding Assignment ID
     * @returns an observable of http api call
     */
    fetchSolutionFile(assign_id: number, qset_id: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + assign_id + '/question_set/' + qset_id + '/solution_file/');

    }

    /**
     * editQuestionFile method makes the server api request to update the main Question Set file of provided question set correspond to given assignment in Course
     * @param qset_id  file corresponding Question set ID 
     * @param assign_id question set corresponding Assignment ID
     * @param file file to be updated as new Question set file
     * @returns an observable of http api call
     */
    editQuestionFile(assign_id: number, qset_id: number, file: File) {
        const formData = new FormData();
        formData.append('question_file_path', file, file.name);

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + assign_id + '/question_set/' + qset_id + '/question_file/'
            , formData,
        );

    }

    /**
     * editSupplementaryFile method makes the server api request to update the Supplementary file of provided question set correspond to given assignment in Course
     * @param qset_id  file corresponding Question set ID 
     * @param assign_id question set corresponding Assignment ID
     * @param file file to be updated as new Supplementary file
     * @returns an observable of http api call
     */
    editSupplementaryFile(assign_id: number, qset_id: number, file: File) {
        const formData = new FormData();
        formData.append('supplementary_file_path', file, file.name);

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + assign_id + '/question_set/' + qset_id + '/supplementary_file/'
            , formData,
        );

    }

      /**
     * editSolutionFile method makes the server api request to update the Solution file of provided question set correspond to given assignment in Course
     * @param qset_id  file corresponding Question set ID 
     * @param assign_id question set corresponding Assignment ID
     * @param file file to be updated as new Solution file
     * @returns an observable of http api call
     */
    editSolutionFile(assign_id: number, qset_id: number, file: File) {
        const formData = new FormData();
        formData.append('solution_file_path', file, file.name);

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + assign_id + '/question_set/' + qset_id + '/solution_file/'
            , formData,
        );

    }

    /**
     * fetchQuestionSetImages method makes the server api get request to fetch Question set file as array of jpeg images.
     * Method pass the user selected assignment id and question set id as a api request parameters necessary to the server in order to entertain the request
     * @returns an observable of http api call
     */
    fetchQuestionSetImages() {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const selectedAssign: Assignment = JSON.parse(localStorage.getItem('selectedAssign'));
        const selectedQset: QuestionSet = JSON.parse(localStorage.getItem('selectedQset'));

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + selectedAssign.main_id + '/question_set/' + selectedQset.main_id + '/question_file/images/');

    }


    /**
     * Main responsibilty of method is to 
     * 
     * 1.Fetch the all questions data from server database for user selected assignment, question set
     * 
     * 2.Process the server response and set the list of questions as Question Tree Model
     * 
     * So method makes the server api get request to fetch all question data corespond to requested question set.
     * After receiving success response from server, method process the received list of questions and form the tree of Questions using parent property of question.
     * On successful Tree formation, TreeModel is saved in localstorage which makes Tree data available to Question View
     * @returns an observable of http api call
     */
    fetchQuestions() {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const selectedAssign: Assignment = JSON.parse(localStorage.getItem('selectedAssign'));
        const selectedQset: QuestionSet = JSON.parse(localStorage.getItem('selectedQset'));

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + selectedAssign.main_id + '/question_set/' + selectedQset.main_id + '/questions/')
            .pipe(catchError(errorRes => this.handleAPIError(errorRes)),
                tap(responseData => {
                    console.log(responseData);
                    let questions: any[];
                    questions = responseData.questions;
                    const QMap = new Map();
                    // const extractedQuestions: TreeModel[] = [];
                    const rootQuestion: TreeModel = {
                        id: 0,
                        value: 'root',
                        children: [],
                    };
                    // extractedQuestions.push(q);
                    for (let i = 0; i < questions.length; i++) {
                        const que: TreeModel = {
                            id: i + 1,
                            value: questions[i].title,
                            main_id: questions[i].id,
                            title: questions[i].title,
                            subpart_no: questions[i].subpart_no,
                            type: (questions[i].type),
                            text: questions[i].text,
                            filepage: questions[i].file_page,
                            file_coords: questions[i].file_coords,
                            marks: questions[i].marks,
                            solution_list: questions[i].solution_list,
                            difficulty_level: questions[i].difficulty_level,
                            is_autograded: questions[i].is_autograded,
                            is_actual_question: questions[i].is_actual_question,
                            parent: questions[i].parent,
                            topics: [],
                            children: [],
                            options: questions[i].options,
                        };
                        const q_topics: any[] = [];
                        for (let j = 0; j < questions[i].topics.length; j++) {
                            q_topics.push(questions[i].topics[j]);
                        }
                        que.topics = q_topics;
                        QMap.set(que.main_id, que);
                        // console.log('assign fetch id=',assign.main_id);
                        // this.assignmentData.push(assign);
                        // console.log('assignaa fetch id=',this.assignmentData[i].main_id);
                    }

                    for (const [key, value] of QMap) {
                        // console.log(key, value);
                        if (value.parent != null) {
                            const q: TreeModel = QMap.get(value.parent);
                            if (q.children == null) {
                                q.children = [];
                            }
                            q.children.push(value);
                        }
                    }
                    for (const [key, value] of QMap) {
                        // console.log(key, value);
                        if (value.parent == null) {
                            rootQuestion.children.push(value);
                        }
                    }
                    console.log('extracted question data=', rootQuestion);
                    localStorage.setItem('questions', JSON.stringify(rootQuestion));
                },
                ));

    }

    /**
     * 
     * 
     * The method makes the server api get request to fetch Question details of the selected question
     * from the application database.
     * Method pass the user selected course id, assignment id, question set id and question id as a api request parameters necessary to the server in order to entertain the request
     * @param questionIdParam question Id whose details to be fetched from database
     * @returns an observable of http api call
     */
    fetchSingleQuestionData(questionIdParam) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const selectedAssign: Assignment = JSON.parse(localStorage.getItem('selectedAssign'));
        const selectedQset: QuestionSet = JSON.parse(localStorage.getItem('selectedQset')); 
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
        '/assignment/' + selectedAssign.main_id + '/question_set/' + selectedQset.main_id + '/interactivequestion/' + questionIdParam).pipe(catchError(errorRes => this.handleAPIError(errorRes)),
        tap(responseData => {
            let questions: any[];
            questions = responseData.questions;
            localStorage.setItem('selectedQuestion', JSON.stringify(questions));
        }));
    }
    

    /**
     * addQuestion method makes the server api request to add a new question to given question set with provided question data
     * @param data Question structure contains the new Question properties
     * @returns an observable of http api call
     */
    addQuestion(data: any) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const selectedAssign: Assignment = JSON.parse(localStorage.getItem('selectedAssign'));
        const selectedQset: QuestionSet = JSON.parse(localStorage.getItem('selectedQset'));
        console.log('received data=', data);
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + selectedAssign.main_id + '/question_set/' + selectedQset.main_id + '/questions/'
            , {
                title: data.title,
                subpart_no: data.subpart_no,
                parent: data.parent,
                is_actual_question: data.is_actual_question,
                file_page: data.filepage,
                difficulty_level: 0,
                type: data.type,
                text: data.text,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }

    /**
     * editQuestion method makes the server api request to edit an existing question of given question set with provided question data
     * @param data Question structure contains the updated Question properties
     * @returns an observable of http api call
     */
    editQuestion(data: any, question_id: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const selectedAssign: Assignment = JSON.parse(localStorage.getItem('selectedAssign'));
        const selectedQset: QuestionSet = JSON.parse(localStorage.getItem('selectedQset'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + selectedAssign.main_id + '/question_set/' + selectedQset.main_id + '/question/' + question_id + '/'
            , data,
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }


    /**
     * deleteQuestion method makes the server api request to delete the requested question of given question set in Course Assignment
     * @param question_id unique database id of user requested question     
     * @returns an observable of http api call
     */
    deleteQuestion(question_id: any) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const selectedAssign: Assignment = JSON.parse(localStorage.getItem('selectedAssign'));
        const selectedQset: QuestionSet = JSON.parse(localStorage.getItem('selectedQset'));
        return this.http.delete<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + selectedAssign.main_id + '/question_set/' + selectedQset.main_id + '/question/' + question_id + '/')
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }

    // Rubric related functions
     /**
     * Main responsibilty of method is to 
     * 
     * 1.Fetch the all questions data from server database for user selected assignment, question set
     * 
     * 2.Process the server response and store the list of questions in localstorage for data availabilty to Rubric Page Component
     * 
     * So method makes the server api get request to fetch all question data corespond to requested question set.
     * After receiving success response from server, method process the received list of questions and form the list of Question model object.
     * On successful data extraction, Data list is saved in localstorage which makes Question data available to Rubric View
     * @returns an observable of http api call
     */
    fetchActualQuestions() {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const selectedAssign: Assignment = JSON.parse(localStorage.getItem('selectedAssign'));
        const selectedQset: QuestionSet = JSON.parse(localStorage.getItem('selectedQset'));

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + selectedAssign.main_id + '/question_set/' + selectedQset.main_id + '/questions/')
            .pipe(catchError(errorRes => this.handleAPIError(errorRes)),
                tap(responseData => {
                    console.log(responseData);
                    let questions: any[];
                    questions = responseData.questions;
                    const extractedQuestions: Question[] = [];
                    // extractedQuestions.push(q);
                    for (let i = 0; i < questions.length; i++) {
                        if (questions[i].is_actual_question) {
                            const ques = new Question(
                                i + 1,
                                questions[i].id,
                                questions[i].title,
                                questions[i].subpart_no,
                                questions[i].type,
                                questions[i].text,
                                questions[i].file_page,
                                questions[i].file_coords,
                                questions[i].solution_list,
                                questions[i].marks,
                                questions[i].difficulty_level,
                                questions[i].is_autograded,
                                questions[i].is_actual_question,
                                questions[i].parent,
                                questions[i].options,
                            );
                            extractedQuestions.push(ques);
                        }
                    }

                    console.log('extracted actual question data=', extractedQuestions);
                    localStorage.setItem('actual_questions', JSON.stringify(extractedQuestions));
                },
                ));

    }


   /**
     * fetchRubrics method makes an server api get request to fetch list of existing rubrics for provided question ID.
     * Whenever call made to this function, function extract the list of rubric information and stores in localstorage for further availibility to application view
     * @returns an observable of http api call
     */
    fetchRubrics(question_id: number) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const selectedAssign: Assignment = JSON.parse(localStorage.getItem('selectedAssign'));
        const selectedQset: QuestionSet = JSON.parse(localStorage.getItem('selectedQset'));

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + selectedAssign.main_id + '/question_set/' + selectedQset.main_id + '/question/' +
            question_id + '/rubrics/')
            .pipe(catchError(errorRes => this.handleAPIError(errorRes)),
                tap(responseData => {
                    // console.log(responseData);
                    let rubrics: any[];
                    rubrics = responseData.data.rubrics;
                    const extractedRubrics: Rubric[] = [];
                    // extractedQuestions.push(q);
                    for (let i = 0; i < rubrics.length; i++) {
                        const r = new Rubric(
                            rubrics[i].id,
                            rubrics[i].text,
                            rubrics[i].marks,
                            rubrics[i].question,
                        );
                        extractedRubrics.push(r);
                    }

                    console.log('extracted actual question data=', extractedRubrics);
                    localStorage.setItem('rubrics', JSON.stringify(extractedRubrics));
                },
                ));
    }

    /**
     * createRubric method makes the server api request to add a new rubric to course database for provided question
     * @param rubric Rubric data object to be created
     * @param question_id Question to which new rubric should be added
     * @returns an observable of http api call
     */
    createRubric(rubric: any, question_id: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const selectedAssign: Assignment = JSON.parse(localStorage.getItem('selectedAssign'));
        const selectedQset: QuestionSet = JSON.parse(localStorage.getItem('selectedQset'));

        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + selectedAssign.main_id + '/question_set/' + selectedQset.main_id + '/question/' +
            question_id + '/rubrics/'
            , {
                text: rubric.text,
                marks: rubric.marks,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );

    }

    /**
     * editRubric method makes the server api request to edit the existing rubric of provided question
     * @param rubric Rubric data object to be updated
     * @returns an observable of http api call
     */
    editRubric(rubric: Rubric) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const selectedAssign: Assignment = JSON.parse(localStorage.getItem('selectedAssign'));
        const selectedQset: QuestionSet = JSON.parse(localStorage.getItem('selectedQset'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + selectedAssign.main_id + '/question_set/' + selectedQset.main_id + '/question/' +
            rubric.question + '/rubric/' + rubric.id + '/'
            , {
                text: rubric.text,
                marks: rubric.marks,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );

    }

     /**
     * deleteRubric method makes the server api request to delete the existing rubric of provided question
     * @param rubric Rubric data object to be updated
     * @returns an observable of http api call
     */
    deleteRubric(rubric: Rubric) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const selectedAssign: Assignment = JSON.parse(localStorage.getItem('selectedAssign'));
        const selectedQset: QuestionSet = JSON.parse(localStorage.getItem('selectedQset'));
        return this.http.delete<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + selectedAssign.main_id + '/question_set/' + selectedQset.main_id + '/question/' +
            rubric.question + '/rubric/' + rubric.id + '/')
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );


    }

    /**
     * method takes the file object and downloads the same with provided filename in user local machine
     * @param file file to be download
     * @param filename filename to be assigned for downloaded file
     */
    downloadFile(file: any, filename: any) {
        const linkSource = 'data:application/pdf;base64,' + file;
        const link = document.createElement('a');
        link.href = linkSource;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(link.href);
    }

    /**
     * this method makes an backend api call to fetch list of existing topics in course.
     * Whenever call made to this function, function extract the list of topic information and stores in localstorage for further availibility to application 
     * @returns an observable of http api call
     */
    fetchTopics() {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/topics/')
            .pipe(catchError(errorRes => this.handleAPIError(errorRes)),
                map(responseData => {
                    // console.log(responseData);
                    let topics: any[];
                    topics = responseData.data;

                    const extractedTopics: Topic[] = [];
                    for (let i = 0; i < topics.length; i++) {
                        const topic = new Topic(topics[i].id, topics[i].name, topics[i].super_topic, topics[i].description);

                        extractedTopics.push(topic);
                    }
                    // console.log('extracted topics =', extractedTopics);
                    return extractedTopics;
                },
                ));

    }



}
