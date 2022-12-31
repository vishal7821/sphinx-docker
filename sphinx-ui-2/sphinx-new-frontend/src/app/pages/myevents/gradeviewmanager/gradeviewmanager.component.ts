import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
import { MyEventsService } from '../myevents.service';
import { NbToastrService } from '@nebular/theme';
import { MyMarks, MyMarksQuestion, MyRubric, MyMarksGradingDuty, GDHasRubric, RegradingMessage } from '../myevents.model';
import { PageRouterService } from '../../page-router.service';

/**
 * see the README for the component description
 */
@Component({
  selector: 'gradeviewmanager',
  templateUrl: './gradeviewmanager.component.html',
  styleUrls: ['./gradeviewmanager.component.scss']
})
export class GradeviewmanagerComponent implements OnInit {

  /**
   * The MyMarks model object holds the information of user submission marksheet.
   *  The information contains the main submission file, the total graded marks and the list of
   * MyMarksQuestion model objects corresponding to each question in the submission
   */
  my_marks: MyMarks;

   /**
   *  The constructor injects the required services like myEvents Service,
   *  Nebular toastr service, and the PageRouter service
   * @param myEventsService The object of the myEvents Service
   * @param toastr The object of the nebular toastr service
   * @param pageRouter The object of the PageRouter services
   */
  constructor(
    // private router: Router,
    public myEventsService: MyEventsService,
    private toastr: NbToastrService,
    private pageRouter: PageRouterService,
  ) { }

  /**
   * The database ID of corresponding event
   */
  eventId: number;

  /**
   * The component lifecycle hook, get called on every component initialization. 
   * The method calls the getMyGrades API of the service to fetch the gradesheet data from the
   *  server. On receiving the success response from the server,
   * the method process the response data and set below details,
   * 
   * 1.List of answered questions in the submission using the MyMarksQuestion model objects
   * 
   * 2.For each question in the list,
   * 
   *  2.1 extract the grading duty list and store using 
   *  the MyMarksGradingDuty model and the createAndSetGD API of the component
   * 
   *  2.2 extract the list of regrade request messages and store using 
   *  the createAndSetRGDMessages API of the component
   * 
   *  2.3 compute and set the total graded marks using the 
   *  calculateAndSetMarks API of the component
   * 
   *  2.4 store the database ID of corresponding entries of the response and subevent table
   *  , used to raise the new regrade request at application server
   * 
   * The method store the above formatted data in the my_marks property of the component
   * 
   */
  ngOnInit() {

    this.eventId = + localStorage.getItem('myEventID');
    this.myEventsService.getMyGrades(this.eventId).subscribe(
      resData => {
        console.log('aaaaaaaaaaaaaaaa');
        console.log(resData);
        this.my_marks = new MyMarks(resData.submission_images,
          0,
          0,
          resData.aggregation_method,
          [],
        );

        //set questions data
        const q_data: any[] = resData.question_data;
        const question_data: MyMarksQuestion[] = [];
        const response_data = resData.reponseData;

        for (let i = 0; i < q_data.length; i++) {

          // fetch grading duty
          // 1. fetch grading duty has rubrics
          // 2. create gd and push to list question_gds
          const question_gds: MyMarksGradingDuty[] = [];
          let response_id: number = -1;
          let subevent_id: number = -1;
          for (let j = 0; j < q_data[i].grading_duties.length; j++) {

            const created_gd: any = this.createAndSetGD(
              q_data[i].rubrics,
              q_data[i].grading_duties[j].gradingduty,
              q_data[i].grading_duties[j].gradingduty_has_rubrics,
              j,
            );

            const gd: MyMarksGradingDuty = created_gd.gd;
            response_id = created_gd.response_id;
            subevent_id = created_gd.subevent_id;
            question_gds.push(gd);
          }


          // create MyMArksQuestion and push
          const my_marks_q: MyMarksQuestion = new MyMarksQuestion(
            i + 1,
            q_data[i].id,
            q_data[i].title,
            q_data[i].marks,
            0,
            q_data[i].upload_page_no,
            response_id,
            subevent_id,
            null,
            [],
            question_gds,
            q_data[i].text,
            q_data[i].options,
            q_data[i].type,
          );

          // fetch and set regrader
          let created_rgd: any = null;
          if (q_data[i].regrading_duty != null) {
            created_rgd = this.createAndSetGD(
              q_data[i].rubrics,
              q_data[i].regrading_duty.gradingduty,
              q_data[i].regrading_duty.gradingduty_has_rubrics,
              0,
            );
            my_marks_q.regrading_duty = created_rgd.gd;
            if(response_id == -1){
              response_id = created_rgd.response_id;
              subevent_id = created_rgd.subevent_id;
            }
          }
          // fetch and set Regrading messages
          my_marks_q.regrading_messages = this.createAndSetRGDMessages(q_data[i].regrading_messages);

          if ( my_marks_q.regrading_duty != null){
            my_marks_q.graded_marks = my_marks_q.regrading_duty.aggregate_marks;
          } else {
            my_marks_q.graded_marks = this.calculateAndSetMarks(my_marks_q.grading_duties,this.my_marks.aggregation_method);
          }

          question_data.push(my_marks_q);
        }
        this.my_marks.questions = question_data;
        // calculate & set final marks
        let graded_marks = 0;
        let tot_marks = 0;
        for (let l = 0; l < this.my_marks.questions.length; l++) {
          graded_marks += this.my_marks.questions[l].graded_marks;
          tot_marks += this.my_marks.questions[l].question_marks;
        }
        this.my_marks.aggregate_marks = graded_marks;
        this.my_marks.total_marks = tot_marks;
        this.my_marks.responseData = response_data;

        console.log(this.my_marks);
        localStorage.setItem('myMarks', JSON.stringify(this.my_marks));

      },
      error => {
        console.log(error);
      }
    );

  }

  /**
   * The method calculates the total aggregated graded marks of the question 
   * using the received grading duties(multiple entries present in case question is
   * graded by multiple graders). The total marks are aggregated
   * using the recieved grade aggregation method, in case question is graded by multiple graders
   * @param question_gds The list of grading duties corresponding to the question
   * @param aggregation_method The grade aggregation method. For example MIN, MAX, AVG
   */
  calculateAndSetMarks(question_gds: any[], aggregation_method: string) {
    // calculate question marks based on aggregation method
    let marks = Number.MAX_VALUE;
    let return_val: number = 0;
    switch (aggregation_method) {
      case 'MIN':
        console.log('MIN');
        marks = Number.MAX_VALUE;
        for (let l = 0; l < question_gds.length; l++) {
          if (marks > question_gds[l].aggregate_marks) {
            marks = question_gds[l].aggregate_marks;
          }
        }
        return_val = marks;
        break;
      case 'MAX':
        console.log('MAX');
        marks = Number.NEGATIVE_INFINITY;
        for (let l = 0; l < question_gds.length; l++) {
          if (question_gds[l].aggregate_marks == null) {
            question_gds[l].aggregate_marks = 0;
          }
      
          if (marks < question_gds[l].aggregate_marks) {
            marks = question_gds[l].aggregate_marks;
          }
        }
        return_val = marks;
        break;
      case 'AVG':
        console.log('AVG');
        marks = 0;
        for (let l = 0; l < question_gds.length; l++) {
          marks += question_gds[l].aggregate_marks;
        }
        return_val = marks / question_gds.length;
        break;
    }
    return return_val;
  }
/**
 * The method process and format the recieved grading duty data and 
 * store it into the MyMarksGradingDuty model object. The method sets the
 * rubrics applied by the grader using the received parameters q_rubric_data and the gdhr_data.
 * It return the structure containing the MyMarksGradingDuty model object, and the 
 * database ID of associate Response and Subevent table entry
 * @param q_rubric_data The list of rubrics corresponding to the question
 * @param gd_data The grading duty data
 * @param gdhr_data the grading duty has rubrics data, The list containing 
 * multiple entries the grading duty id and the applied rubric id
 * @param currGD The list index of grading duty
 */
  createAndSetGD(q_rubric_data: any[], gd_data: any, gdhr_data: any[], currGD: number) {
    const gd_question_rubrics: MyRubric[] = [];
    for (let l = 0; l < q_rubric_data.length; l++) {
      const r: MyRubric = new MyRubric(
        l + 1,
        q_rubric_data[l].id,
        q_rubric_data[l].text,
        q_rubric_data[l].marks,
        false,
      );
      const data_rubrics: any[] = gdhr_data;
      for (let k = 0; k < data_rubrics.length; k++) {
        if (r.main_id == (+data_rubrics[k].rubric)) {
          r.is_selected = true;
          break;
        }
      }
      gd_question_rubrics.push(r);
    }

    const data_gd: any = gd_data;
    const response_id = data_gd.response;
    const subevent_id = data_gd.subevent;
    const gd: MyMarksGradingDuty = new MyMarksGradingDuty(
      currGD + 1,
      data_gd.id,
      data_gd.aggregate_marks,
      data_gd.grader_comment,
      data_gd.marks_adjustment,
      gd_question_rubrics,
    );
    if(data_gd.grader_comment == undefined)
      data_gd.grader_comment = '';
    return { 'gd': gd, 'response_id': response_id, 'subevent_id': subevent_id };
  }

  /**
   * The method receive the list of messages of regrading requests
   * and format it into the list of the RegradingMessage model objects.
   * Where each RegradingMessage object contains the message sequence index, message text,
   * and the sender of the message
   * @param regrading_messages The list of regrading request messages of the question
   */
  createAndSetRGDMessages(regrading_messages: any[]) {

    const fetched_messages: RegradingMessage[] = [];
    for (let i = 0; i < regrading_messages.length; i++) {
      const msg: RegradingMessage = new RegradingMessage(
        regrading_messages[i].seq_id,
        regrading_messages[i].message,
        regrading_messages[i].sender,
      );
      fetched_messages.push(msg);
    }
    return fetched_messages;

  }


  /**
   * The method stores the gradesheet data and the list index of user-selected question
   * in the local storage and redirects the user to the main grade view page
   * 
   * Current Use: Once the user clicks the question title link, the view triggers call to the
   *  viewMainGrading API with the corresponding list index of the question
   * @param questionIdx The list index of the user-selected question
   */
  viewMainGrading(questionIdx: number) {
    // console.log(questionIdx);
    localStorage.setItem('myMarks', JSON.stringify(this.my_marks));
    localStorage.setItem('currQuestionIdx', questionIdx.toString());
    this.goToViewMainGrading();

  }

   /**
   * The method redirects the user to the Main grade view page to view the graded copy
   */
  goToViewMainGrading() {
    // console.log('open main grading view');
    // this.router.navigate(['/pages', 'myevents', 'gradeView', 'main']);
    this.pageRouter.gotoGradeViewMain();
  }

}
