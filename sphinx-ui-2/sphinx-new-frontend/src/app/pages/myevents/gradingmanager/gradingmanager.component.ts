import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssignmentManagerService } from '../../assignmentmanager/assignmentmanager.service';
// import { Router } from '@angular/router';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { MyGradingDuties, GroupMember, MyGradingDuty } from '../myevents.model';
import { MyEventsService } from '../myevents.service';
import { NbToastrService } from '@nebular/theme';
import { group } from '@angular/animations';
import { PageRouterService } from '../../page-router.service';

/**
 * see the README for the component description
 */
@Component({
  selector: 'gradingmanager',
  templateUrl: './gradingmanager.component.html',
  styleUrls: ['./gradingmanager.component.scss']
})
export class GradingmanagerComponent implements OnInit, OnDestroy {

/**
 * The list of the question wise Grading duty groups
 */
  myGradingDuties: MyGradingDuties[] = [];

  loading: boolean = false;

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
  ) {
  }

  /**
   * The component lifecycle hook gets called before destroying the component. The empty function 
   * created for future use
   */
  ngOnDestroy(): void {

  }

  /**
   * The component lifecycle hook, get called on every component initialization. 
   * The method calls the fetchGradingDuties API of component 
   * to fetch the grading duties allocated to the user
   * in the user-selected GUPLOAD subevent on the myevents dashboard.
   */
  ngOnInit() {
    this.fetchGradingDuties();
  }

  /**
   * The method redirects the user to the MyEvents dashboard of the application
   */
  gotoMyEvents() {
    // this.router.navigate(['/pages', 'myevents']);
    this.pageRouter.gotoMyEvents();
  }

  /**
   * The method makes an server API request to fetch the user-allocated grading duties in the 
   * corresponding GUPLOAD subevent & event.
   * On receiving the success response from the server, the method process the response data and 
   * store the data into the component property myGradingDuties. While processing the method 
   * retrives the list of questions for which grading duties are allocted, 
   * the corresponding list of grading duties,
   *  the group member names for each grading duty, 
   * the total number of graded copies
   * , etc.
   */
  fetchGradingDuties() {

    this.loading = true;
    const eventId: string = localStorage.getItem('myGradingEventID');
    const subEventId: string = localStorage.getItem('myGradingSubEventID');
    this.myEventsService.getMyGradingDuties(+eventId, +subEventId).subscribe(
      resData => {
        console.log('grading duties are =', resData);
        const data: any[] = resData.data;

        for (let i = 0; i < data.length; i++) {
          const question_id: any = data[i].response.question.id;
          const question_title: any = data[i].response.question.title;
          const question_marks: any = data[i].response.question.marks;
          const is_autograded = data[i].response.question.is_autograded;
          // fetch submission group members
          const group_members: GroupMember[] = [];
          const group_data: any[] = data[i].response.submission_group.enrollments;
          let group_names: string = '';
          for (let j = 0; j < group_data.length; j++) {
            const grp_member: GroupMember = new GroupMember(
              group_data[j].user.roll_no,
              group_data[j].user.first_name,
              group_data[j].user.last_name,
            );
            group_names += group_data[j].user.first_name + ' ' + group_data[j].user.last_name + ', ';
            group_members.push(grp_member);
          }

          //fetch grading duty related data
          const gd: MyGradingDuty = new MyGradingDuty(
            1,
            data[i].id,
            data[i].is_completed,
            data[i].aggregate_marks,
            group_names,
            group_members,
          );

          // fetch question group,if created already , else create new question group
          let gd_grp_id: number = -1;
          for (let j = 0; j < this.myGradingDuties.length; j++) {
            if (this.myGradingDuties[j].question_id == question_id) {
              gd_grp_id = j;
              break;
            }
          }

          if (gd_grp_id == -1) {
            const my_gds: MyGradingDuties = new MyGradingDuties(
              this.myGradingDuties.length + 1,
              question_id,
              question_title,
              question_marks,
              0,
              0,
              is_autograded,
              [],
            );
            my_gds.grading_duties.push(gd);
            my_gds.tot_cnt += 1;
            if (gd.is_completed)
              my_gds.completed_cnt += 1;
            this.myGradingDuties.push(my_gds);

          } else {
            gd.id = this.myGradingDuties[gd_grp_id].grading_duties.length + 1;
            this.myGradingDuties[gd_grp_id].grading_duties.push(gd);
            this.myGradingDuties[gd_grp_id].tot_cnt += 1;
            if (gd.is_completed)
              this.myGradingDuties[gd_grp_id].completed_cnt += 1;
          }
        }
        console.log('data set success = ', this.myGradingDuties);
        this.loading = false;

      },
      error => {
        this.loading = false;
        console.log('error in fetching grading duties are =', error);
      },
    );

  }


  /**
   * The method find the first ungraded copy in the grading duty list of the question using 
   * the component API findNextUnGraded. If no such copy found, then method shows notification 
   * message for grading completion and returns. Else method stores the ungraded grading duty, 
   * corresponding grading duty list index, and the grading duty list of question in 
   * the local storage. Then redirects the user to the main grading page to perform grading
   * 
   * Current use: Once the user clicks the perform grading button, the view triggers call to 
   * performGrading method with the corresponding ID of question
   * @param qsetIdx The request corresponding ID of question
   */
  performGrading(qsetIdx: number) {
    const nextUngradedId: number = this.findNextUnGraded(qsetIdx);
    console.log(nextUngradedId);
    if (nextUngradedId == -1) {
      console.log('all are graded');
      this.toastr.primary('Grading is completed', 'Success');
      return;
    }

    localStorage.setItem('currGDs', JSON.stringify(this.myGradingDuties[qsetIdx]));
    localStorage.setItem('currGD', JSON.stringify(this.myGradingDuties[qsetIdx].grading_duties[nextUngradedId]));
    localStorage.setItem('currGDIdx', nextUngradedId.toString());
     
    let currentEvent = JSON.parse(localStorage.getItem("myGradingEvent"));
    let assignmentType = currentEvent.assignment_isInteractive;
    if ( assignmentType ) {
      this.goToInteractiveGrading();
    }
    else {
      this.goToMainGrading();
    }

    
    // localStorage.setItem('mySubmissionEvent', JSON.stringify(this.my_events[idx]));


  }

 /**
   * The method redirects the user to the Main Grading page to perform grading
   */
  goToMainGrading() {
    console.log('open main grading');
    // this.router.navigate(['/pages', 'myevents', 'gradingManager','mainGrade']);
    this.pageRouter.gotoGradingMain();
  }


  goToInteractiveGrading() {
    this.pageRouter.gotoInteractiveGradingMain();
  }

  /**
   * The method redirects the user to the Main Grading page to perform grading
   */
  goToAutoGrading() {
    console.log('redirecting to auto grading');
    // this.router.navigate(['/pages', 'myevents', 'gradingManager','mainGrade']);
    this.pageRouter.gotoAutoGrading();
  }

  onAutoGrade(qsetIdx: number) {
    let cnt = 0;
    if(this.myGradingDuties[qsetIdx].completed_cnt == this.myGradingDuties[qsetIdx].tot_cnt){
      this.toastr.primary('There are no ungraded submissions present in the question', 'Success');
      return;
    }
    localStorage.setItem('autoGradeQID', JSON.stringify(this.myGradingDuties[qsetIdx].question_id));
    this.goToAutoGrading();
  }

  /**
   * The method iterates through the list of grading duties allocated for the received question
   * and returns the index of first grading duty for which grading is not completed.
   *  If no such grading duty found, then method returns -1
   * @param qsetIdx The request corresponding list index of question
   */
  findNextUnGraded(qsetIdx: number) {

    let index: number = -1;

    if (this.myGradingDuties[qsetIdx].completed_cnt == this.myGradingDuties[qsetIdx].tot_cnt)
      return index;

    for (let i = 0; i < this.myGradingDuties[qsetIdx].grading_duties.length; i++) {
      if (this.myGradingDuties[qsetIdx].grading_duties[i].is_completed == false) {
        index = i;
        break;
      }
    }
    return index;


  }

   /**
   * The method find the grading duty corresponding to the received grading duty list index
   * of the received question. Then method stores the grading duty, 
   * corresponding grading duty list index, and the grading duty list of question in 
   * the local storage. After storing required data,
   * The method redirects the user to the main grading page to perform/view grading
   * 
   * Current use: Once the user clicks on the any submission copy link
   * on the grading manager, the view triggers call to 
   * performSelectedGrading method with the corresponding list index of the grading duty and question
   * @param qsetIdx The request corresponding list index of question
   * @param gdIdx The request corresponding list index of grading duty
   */
  performSelectedGrading(qsetIdx: number, gdIdx: number) {
    localStorage.setItem('currGDs', JSON.stringify(this.myGradingDuties[qsetIdx]));
    localStorage.setItem('currGD', JSON.stringify(this.myGradingDuties[qsetIdx].grading_duties[gdIdx]));
    localStorage.setItem('currGDIdx', gdIdx.toString());
    let currentEvent = JSON.parse(localStorage.getItem("myGradingEvent"));
    let assignmentType = currentEvent.assignment_isInteractive;
    if ( assignmentType ) {
      this.goToInteractiveGrading();
    }
    else {
      this.goToMainGrading();
    }

  }

}
