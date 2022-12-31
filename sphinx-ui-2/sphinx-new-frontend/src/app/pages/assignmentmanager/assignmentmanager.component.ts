import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbIconLibraries, NbWindowService, NbToastrService } from '@nebular/theme';
import { AssignmentFormComponent } from './assignment-form/assignment-form.component';
import { QuestionSetFormComponent } from './question-set-form/question-set-form.component';
import { Assignment } from './assignmentmanager.model';
import { AssignmentManagerService } from './assignmentmanager.service';
import { Subscription } from 'rxjs';
import { PageRouterService } from '../page-router.service';
import { EditorComponent } from "@tinymce/tinymce-angular";

/**
 * Assignment Manager component provides the capabilities to perform all assignment and question set related operations in the Course.
 * 
 * Assignment manager view provides user interface for Assignment and QuestionSet management in the Course. 
 * View list out all the assignments in the course and provides necessary control buttons to perform assignment specific operations. Each list item contains the assignment details and action buttons like edit and delete.
 * The list of question set corresponding to each assignment is displayed nested below to respective assignment. To add the Assignment / QuestionSet view provides button control at the top of respective section.
 * By clicking on Question set name / Rubric action item user can navigate to respective Question manager / Rubric manager of corresponding Question set.
 * 
 * Assignment manager component contains properties and method API's to perform frontend application logic for Assignment and QuestionSet management in the Course.
 *  method API's of component provide functionalities like fetch assignment/question set data, add/edit/delete assignment/question set to course, navigate to rubric/ question manager by storing required details to memory.
 * 
 * The Assignment manager Service provides necessary API methods which does all server communication to perform necessary modifications for Course Assignments, Question sets at application database.  
 * 
 * 
 */
@Component({
  selector: 'assignmentmanager',
  templateUrl: './assignmentmanager.component.html',
  styleUrls: ['./assignmentmanager.component.scss'],
})
export class AssignmentmanagerComponent implements OnInit, OnDestroy {

  /**
   * List of assignment data objects
   */
  public assignments: Assignment[] = [];

  assignLoading: boolean = false;
  qsetLoading: boolean = false;
  /**
   * Subscription object used to set Course assignment data once data retrived from server
   */
  public assignSubscription: Subscription;
  // evaIcons = [];
  /**
   * Component constructor method used to intialize necessary service objects like assignManagerService, nebular iconsLibrary, nebular windowService 
   * @param iconsLibrary object of Nebular Icons Library
   * @param windowService object of Nebular Window Service
   * @param assignManagerService object of Assignment manager service
   * @param toastr object of Nebular Toastr Service
   * @param pageRouter object of PageRouterService
   */
  constructor(iconsLibrary: NbIconLibraries,
    private windowService: NbWindowService,
    public assignManagerService: AssignmentManagerService,
    private toastr: NbToastrService
    , private pageRouter: PageRouterService ) {
    // this.evaIcons = Array.from(iconsLibrary.getPack('eva').icons.keys())
    //   .filter(icon => icon.indexOf('outline') === -1);

    // iconsLibrary.registerFontPack('fa', { packClass: 'fa', iconClassPrefix: 'fa' });
    // iconsLibrary.registerFontPack('far', { packClass: 'far', iconClassPrefix: 'fa' });
    iconsLibrary.registerFontPack('ion', { iconClassPrefix: 'ion' });



    



  }
  // icons = {

  //   ionicons: [
  //     'ionic', 'arrow-right-b', 'arrow-down-b', 'arrow-left-b', 'arrow-up-c', 'arrow-right-c',
  //     'arrow-down-c', 'arrow-left-c', 'arrow-return-right', 'arrow-return-left', 'arrow-swap',
  //     'arrow-shrink', 'arrow-expand', 'arrow-move', 'arrow-resize', 'chevron-up',
  //     'chevron-right', 'chevron-down', 'chevron-left', 'navicon-round', 'navicon',
  //     'drag', 'log-in', 'log-out', 'checkmark-round', 'checkmark', 'checkmark-circled',
  //     'close-round', 'plus-round', 'minus-round', 'information', 'help',
  //     'backspace-outline', 'help-buoy', 'asterisk', 'alert', 'alert-circled',
  //     'refresh', 'loop', 'shuffle', 'home', 'search', 'flag', 'star',
  //     'heart', 'heart-broken', 'gear-a', 'gear-b', 'toggle-filled', 'toggle',
  //     'settings', 'wrench', 'hammer', 'edit', 'trash-a', 'trash-b',
  //     'document', 'document-text', 'clipboard', 'scissors', 'funnel',
  //     'bookmark', 'email', 'email-unread', 'folder', 'filing', 'archive',
  //     'reply', 'reply-all', 'forward',
  //   ],
  // };

  /**
   * Component lifecycle hook method used to fetch existing Course Assignments on Component initialization
   * Method fetch list of question set for each assignment on successful retrival of assignment data.
   */
  ngOnInit() {
    this.assignManagerService.fetchAssignment().subscribe(
      resData => {
        console.log('assignments fetch successfully');
        // for(let i=0;i<resData.assignments.length;i++)
        // {
        this.assignManagerService.fetchQuestionset();
        const tempData = JSON.parse(localStorage.getItem('assignments'));
        this.assignManagerService.sendAssignData(tempData);
        this.assignSubscription = this.assignManagerService.getAssignData().subscribe(assignData => {
          this.assignments = assignData;
        });

        console.log('fetched data=', this.assignments);

        // }
        console.log('QSETS fetch successfully');
      },
    );

    
  }

  /**
   * Method create a popup window contains form to create new assignment
   */
  addAssignment() {
    this.windowService.open(AssignmentFormComponent, { title: `Create Assignment` });
    return true;
  }

  /**
   * Method takes user selected assignment and shows the popup window containing form to edit selected assignment data
   * @param idx list index of user selected assignment to edit from List of Assignment
   */
  editAssignment(idx: number) {
    this.assignManagerService.assignEdit = idx;
    this.windowService.open(AssignmentFormComponent, { title: `Edit Assignment` });
    return true;
  }

  /**
   * Method takes user selected assignment and makes the service api call to delete the user selected assignment data
   * @param idx list index of user selected assignment to delete from List of Assignment
   */
  deleteAssignment(idx: number) {
    this.assignLoading = true;
    const assignList = this.assignManagerService.assignData.value;
    this.assignManagerService.deleteAssignment(assignList[idx]).subscribe(
      resData => {
        assignList.splice(idx, 1);
        this.assignManagerService.sendAssignData(assignList);
        this.assignLoading = false;
        this.toastr.success('Assignment deleted successfully', 'Success');
      },
      error => {
        console.log(error);
        this.assignLoading = false;
        if (error.error != null && error.error.detail != null) {
          this.toastr.danger(error.error.detail, 'Error');
        } else {
          this.toastr.danger(error.error, 'Error');
        }
      },
    );
  }
/**
 * Whenever user clicks the add questionset button under any assignment, view triggers call to this method with respective assignment to add new question set
 * Method takes user selected assignment and create a popup window contains form to create new question set for the respective Assignment
 * @param assignId list index of user selected assignment to add a question set
 */
  addQuestionSet(assignId: number) {
    console.log('assignid=', assignId);
    this.assignManagerService.assignEdit = assignId;
    this.windowService.open(QuestionSetFormComponent, { title: `Create Question set for ` + this.assignments[assignId].name });
  }

  /**
 * Whenever user clicks the edit questionset button for any question set, view triggers call to this method with respective question set and assignment to edit the question set
 * Method takes user selected question set data and create a popup window contains form to edit the question set for the respective Assignment
 * @param assignId list index of user selected assignment to edit the question set
 * @param qsetIdx list index of user selected question set to edit
 */
  editQuestionSet(assignIdx: number, qsetIdx: number) {
    this.assignManagerService.assignEdit = assignIdx;
    this.assignManagerService.qSetEdit = qsetIdx;
    this.windowService.open(QuestionSetFormComponent, { title: `Edit Question Set` });
  }


  /**
 * Whenever user clicks the delete questionset button for any question set, view triggers call to this method with respective question set and assignment to delete the question set
 * Method takes user selected question set data and make the service API call to delete the question set for the respective Assignment
 * @param assignId list index of user selected assignment to delete the question set
 * @param qsetIdx list index of user selected question set to be deleted
 */
  deleteQuestionSet(assignIdx: number, qsetIdx: number) {
    const assignList = this.assignManagerService.assignData.value;
    const assign = assignList[assignIdx];
    this.assignLoading = true;
    this.assignManagerService.deleteQuestionSet(assign.main_id, assign.questionSets[qsetIdx]).subscribe(
      resData => {
        assign.questionSets.splice(qsetIdx, 1);
        assignList[assignIdx] = assign;
        this.assignManagerService.sendAssignData(assignList);
        this.assignLoading = false;
        this.toastr.success('Question Set deleted successfully', 'Success');
      },
      error => {
        console.log(error);
        this.assignLoading = false;
        if (error.error != null && error.error.detail != null) {
          this.toastr.danger(error.error.detail, 'Error');
        } else {
          this.toastr.danger(error.error, 'Error');
        }
      },
    );
  }

  /**
  * Whenever user clicks the Main Question set filename for any question set, view triggers call to this method with respective question set and assignment to download the main Question set file
  * Method takes user selected question set data and make the service API call to download the main question set file for the respective question set
  * @param assignId list index of user selected assignment to download the question set file
  * @param qsetIdx list index of user selected question set to download the corresponding main file
    */
  getQuestionFile(assignIdx: number, qsetIdx: number) {
    console.log('assignid=', assignIdx);
    console.log('qid=', qsetIdx);
    const assignList = this.assignManagerService.assignData.value;
    const assign = assignList[assignIdx];
    this.assignManagerService.fetchQuestionFile(assign.main_id, assign.questionSets[qsetIdx].main_id).subscribe(
      resData => {
        console.log(resData);
        this.downloadFile(resData.question_file, assign.questionSets[qsetIdx].question_name);
      },
      error => {
        this.toastr.danger(error.error.detail, 'Error');
        // console.log(error);
      },
    );
  }

   /**
  * Whenever user clicks the Supplementary filename for any question set, view triggers call to this method with respective question set and assignment to download the Supplementary file
  * Method takes user selected question set data and make the service API call to download the Supplementary file for the respective question set
  * @param assignId list index of user selected assignment to download the Supplementary file
  * @param qsetIdx list index of user selected question set to download the corresponding Supplementary file
  */
 getSupplementaryFile(assignIdx: number, qsetIdx: number) {
    console.log('assignid=', assignIdx);
    console.log('qid=', qsetIdx);
    const assignList = this.assignManagerService.assignData.value;
    const assign = assignList[assignIdx];
    this.assignManagerService.fetchSupplementaryFile(assign.main_id, assign.questionSets[qsetIdx].main_id).subscribe(
      resData => {
        console.log(resData);
        this.downloadFile(resData.data, assign.questionSets[qsetIdx].supplementary_name);
      },
      error => {
        this.toastr.danger(error.error.detail, 'Error');
        // console.log(error);
      },
    );
  }

   /**
  * Whenever user clicks the Solution filename for any question set, view triggers call to this method with respective question set and assignment to download the Solution file
  * Method takes user selected question set data and make the service API call to download the Solution file for the respective question set
  * @param assignId list index of user selected assignment to download the Solution file
  * @param qsetIdx list index of user selected question set to download the corresponding Solution file
  */
  getSolutionFile(assignIdx: number, qsetIdx: number) {
    console.log('assignid=', assignIdx);
    console.log('qid=', qsetIdx);
    const assignList = this.assignManagerService.assignData.value;
    const assign = assignList[assignIdx];
    this.assignManagerService.fetchSolutionFile(assign.main_id, assign.questionSets[qsetIdx].main_id).subscribe(
      resData => {
        console.log(resData);
        this.downloadFile(resData.data, assign.questionSets[qsetIdx].solution_name);
      },
      error => {
        this.toastr.danger(error.error.detail, 'Error');
        // console.log(error);
      },
    );
  }

  /**
   * Method which take filedata and filename, then download the file in users local system
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
  * Whenever user clicks the question set name link for any question set, view triggers call to this method with respective question set and assignment to navigate to Question Manager
  * Method takes user selected question set and assignment data, store it to localstorage and navigate to Question Manager View
  * @param assignId list index of user selected assignment for Question manager navigation
  * @param qsetIdx list index of user selected question set for Question manager navigation
  */
  gotoQuestionSet(assignIdx: number, qsetIdx: number) {

    const assignList = this.assignManagerService.assignData.value;
    const assign = assignList[assignIdx];
    const qset = assign.questionSets[qsetIdx];
    const is_interactive = assign.is_interactive;
    console.log('selected assign=', assign);
    console.log('selected qset=', qset);
    localStorage.setItem('selectedAssign', JSON.stringify(assign));
    localStorage.setItem('selectedQset', JSON.stringify(qset));
    // this.router.navigate(['/pages', 'assignment', 'question']);
    if ( is_interactive ) {
      this.pageRouter.gotoInteractiveQuestionManager();
    }
    else {
      this.pageRouter.gotoQuestionManager();
    }
    

  }

     /**
  * Whenever user clicks the setRubric action item for any question set, view triggers call to this method with respective question set and assignment to navigate to Rubric Manager
  * Method takes user selected question set and assignment data, store it to localstorage and navigate to Rubric Manager View
  * @param assignId list index of user selected assignment for Rubric manager navigation
  * @param qsetIdx list index of user selected question set for Rubric manager navigation
  */
  setRubrics(assignIdx: number, qsetIdx: number) {

    const assignList = this.assignManagerService.assignData.value;
    const assign = assignList[assignIdx];
    const qset = assign.questionSets[qsetIdx];
    console.log('selected assign=', assign);
    console.log('selected qset=', qset);
    localStorage.setItem('selectedAssign', JSON.stringify(assign));
    localStorage.setItem('selectedQset', JSON.stringify(qset));
    // this.router.navigate(['/pages', 'assignment', 'rubrics']);
    this.pageRouter.gotoRubricManager();

  }

  /**
   * Component life cycle hook which remove the assignment data subscription before desrying the component
   */
  ngOnDestroy() {
    if(this.assignSubscription != undefined)
      this.assignSubscription.unsubscribe();
  }
}
