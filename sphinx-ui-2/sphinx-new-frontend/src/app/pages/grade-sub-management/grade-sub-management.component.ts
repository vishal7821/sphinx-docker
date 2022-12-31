import { Component, OnInit } from '@angular/core';
import { GradeSubMngmtService } from './grade-sub-management.service';
import { MyEventClass } from '../myevents/myevents.model';
import { NbToastrService } from '@nebular/theme';
import { PageRouterService } from '../page-router.service';

@Component({
  selector: 'grade-sub-management',
  templateUrl: './grade-sub-management.component.html',
  styleUrls: ['./grade-sub-management.component.scss']
})
export class GradeSubManagementComponent implements OnInit {

  all_events: MyEventClass[] = [];

  constructor(
    public gradesubmngmt_service: GradeSubMngmtService,
    private toastr: NbToastrService,
    private pageRouter: PageRouterService,
  ) { }

  ngOnInit() {
    this.getAllEvents();
  }

  getAllEvents() {
    this.gradesubmngmt_service.fetchEvents().subscribe(
      resData => {
        console.log('all events fetch successfully');
        const tempData: MyEventClass[] = JSON.parse(localStorage.getItem('all_events'));
        this.all_events = tempData;
        console.log(this.all_events);
      },
      error => {
        console.log(error);
      },
    );
  }

  onGraderAssignment(eventIndex: number, subeventIndex: number) {
    // console.log(eventIndex , ' , ', this.my_events[eventIndex]);
    // console.log(subeventIndex , ' , ', this.my_events[eventIndex].subevents[subeventIndex]);
    const eventId: number = this.all_events[eventIndex].main_id;
    const subEventId: number = this.all_events[eventIndex].subevents[subeventIndex].main_id;
    this.gradesubmngmt_service.graderAssignment(eventId, subEventId).subscribe(
      resData => {
        this.toastr.success('Graders assigned successfully for subevent ' + this.all_events[eventIndex].subevents[subeventIndex].name, 'Success');
      },
      error => {
        this.toastr.danger(error.error.detail, 'Error');
      },
    );

  }

    /**
   * The method stores the event object corresponding to received ID in the local storage
   * and redirects the user to the Submission manager
   * @param idx The list index of event associated with the user's action on the view
   * 
   * Current use: Once the user clicks the submit button on myEvents dashboard,
   * the view triggers call to this method with respective event id
   */
  gotoSubmissionManager(idx: number, subeventIdx: number) {
    // console.log(this.all_events[idx] + ',' + idx);
    localStorage.setItem('AdminSubmissionEventID', JSON.stringify(this.all_events[idx].main_id));
    localStorage.setItem('AdminSubmissionSubEventID', JSON.stringify(this.all_events[idx].subevents[subeventIdx].main_id));
    // this.router.navigate(['/pages', 'myevents', 'submission']);
    this.pageRouter.gotoAdminSubmission();
  }


}
