import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
import { MyEventsService } from '../myevents.service';
import { NbToastrService } from '@nebular/theme';
import { MyReGradingDuty } from '../myevents.model';
import { PageRouterService } from '../../page-router.service';
/**
 * see the README for the component description
 */
@Component({
  selector: 'regradingmanager',
  templateUrl: './regradingmanager.component.html',
  styleUrls: ['./regradingmanager.component.scss'],
})
export class RegradingmanagerComponent implements OnInit {

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
   * The list of re-grading duties allocated in the user-selected RGUPLOAD subevent
   */
  regrading_duties: MyReGradingDuty[] = [];
  /**
   * The number of closed regrading requests
   */
  completed_cnt: number = 0;
  /**
   * The total number of regrading requests
   */
  tot_cnt: number = 0;


  /**
   * The component lifecycle hook, get called on every component initialization. 
   * The method calls the fetchReGradingDuties API of component 
   * to fetch the re-grading duties allocated to the user
   * in the user-selected RGUPLOAD subevent on the myevents dashboard.
   */
  ngOnInit() {
    this.fetchReGradingDuties();
  }

   /**
   * The method makes an server API request to fetch the user-allocated re-grading duties in the 
   * corresponding RGUPLOAD subevent.
   * On receiving the success response from the server, the method process the response data and 
   * store the data into the component property myGradingDuties. Each regrading duty represents
   * the regrading request made by student. While processing the method 
   * computes the total number of closed regrading requests and update the component properties
   * completed_cnt & tot_cnt accordingly.
   */
  fetchReGradingDuties() {
    const eventId: string = localStorage.getItem('myReGradingEventID');
    const subEventId: string = localStorage.getItem('myReGradingSubEventID');
    this.myEventsService.getMyGradingDuties(+eventId, +subEventId).subscribe(
      resData => {
        console.log(resData);
        const data: any[] = resData.data;
        this.completed_cnt = 0;
        this.tot_cnt = 0;
        this.regrading_duties = [];
        for (let i = 0; i < data.length; i++) {
          const gd: MyReGradingDuty = new MyReGradingDuty(
            i + 1,
            data[i].id,
            data[i].is_completed,
            data[i].aggregate_marks,
            data[i].grp_id,
            data[i].grp_member_names,
            data[i].question_id,
            data[i].question_title,
            data[i].question_marks,
            data[i].qset_id,
            data[i].qset_name,
            data[i].question_options,
            data[i].question_text,
            data[i].question_type,

          );
          this.tot_cnt++;
          this.regrading_duties.push(gd);
          if (gd.is_completed) {
            this.completed_cnt++;
          }
        }
      },
      error => {
        console.log(error);
      },
    );
  }

  /**
   * The method find the re-grading duty corresponding to the received re-grading duty list index.
   *  Then method stores the re-grading duty, 
   * corresponding list index, and the re-grading duty list in 
   * the local storage. After storing required data,
   * The method redirects the user to the main re-grading page to review the regrade request
   * 
   * Current use: Once the user clicks on the any regrade request link
   * on the re-grading manager, the view triggers call to 
   * performSelectedReGrading method with the corresponding list index of the re-grading duty
   * @param idx The request corresponding list index of the re-grading duty
   */
  performSelectedReGrading(idx: number) {
    console.log(idx);
    localStorage.setItem('myReGDs', JSON.stringify(this.regrading_duties));
    localStorage.setItem('currReGD', JSON.stringify(this.regrading_duties[idx]));
    localStorage.setItem('currReGDIdx', idx.toString());
    localStorage.setItem('completedRegrading', this.completed_cnt.toString());
    localStorage.setItem('totalRegrading', this.tot_cnt.toString());
    this.goToMainRegrading();
  }

   /**
   * The method redirects the user to the Main Re-grading page to perform grading
   */
  goToMainRegrading() {
    console.log('open main regrading');
    // this.router.navigate(['/pages', 'myevents', 'regradingManager', 'mainRegrade']);
    this.pageRouter.gotoReGradingMain();
  }
}
