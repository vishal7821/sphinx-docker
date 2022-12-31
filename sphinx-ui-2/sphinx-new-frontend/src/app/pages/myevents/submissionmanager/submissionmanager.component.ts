import { Component, OnInit } from '@angular/core';
import { MyEventClass, QuestionSet, MyQuestion, GroupMember, MySubmissionGroup, SupplementaryFile, MySubEvent } from '../myevents.model';
import { MyEventsService } from '../myevents.service';
import { NbToastrService, NbIconLibraries } from '@nebular/theme';
import * as CryptoJS from 'crypto-js';
import { PageRouterService } from '../../page-router.service';
import { saveAs } from 'file-saver';
import { TreeInternalComponent } from 'ng2-tree/src/tree-internal.component';

/**
 * Go to README for the description
 */
@Component({
  selector: 'submissionmanager',
  templateUrl: './submissionmanager.component.html',
  styleUrls: ['./submissionmanager.component.scss'],
})
export class SubmissionmanagerComponent implements OnInit {

  /**
   * The array object containing user-uploaded main submission file in image format
   */
  slides: { image: string }[] = [];
  /**
   * The array object containing user-uploaded main submission file in image format
   */
  sliderImages: string[] = [];
  /**
   * The index of current page in the image carousel of the main submission file
   */
  activeSlideIndex = 0;
  /**
   * the pause time for each image slide in image carousel, set to 0 for setting slide show in off mode
   */
  myInterval = 0;
  // isFilepresent = false;
  /**
   * The array of MyQuestion model objects representing the list of questions of the question set 
   * corresponding to the submission
   */
  myQuestions: MyQuestion[] = [];
  /**
   * The array used to hold the user uploaded main submission file
   */
  public uploadedFiles: Array<File> = [];
  /**
   * The array used to hold the user uploaded supplementary submission file
   */
  public uploadedSuppFiles: Array<File> = [];
  /**
   * The boolean flag used to show/hide the question set selection form
   */
  isOpenQSetForm: boolean = false;
  /**
   * The boolean flag used to show/hide the main submission file upload form
   */
  isOpenFileForm: boolean = false;
  /**
   * The boolean flag used to show/hide the supplementary submission file upload form
   */
  isOpenSuppFileForm: boolean = false;
  /**
   * The boolean flag used representing whether main submission file is uploaded or not by the user
   */
  isMainSubmissionPresent: boolean = false;
  /**
   * The main submission file name
   */
  filename = 'Not uploaded ';
  /**
   * The boolean flag used representing whether supplementary submission file is uploaded or not by the user
   */
  isSuppSubmissionPresent: boolean = false;
  /**
   * The user-uploaded supplementary submission file
   */
  suppFile: SupplementaryFile = null;
  /**
   * The user-uploaded main submission file
   */
  mainFile: SupplementaryFile = null;
  /**
   * The boolean flag representing whether there is the SUPLOAD subevent active at the moment or not.
   * If only SVIEW subevent is active, then the flag is used to disable the user submission on the view
   */
  isSupload: boolean = false;

  mainloading: boolean = false;
  supploading: boolean = false;
  isImpersonated: boolean = false;

  /**
   *  The constructor injects the required services like myEvents Service,
   *  Nebular toastr service, and the PageRouter service
   * @param myEventsService The object of the myEvents Service
   * @param assignManagerService The object of the assignment manager service
   * @param toastr The object of the nebular toastr service
   * @param pageRouter The object of the PageRouter service
   * @param iconsLibrary The object of Nebular icons library service 
   */
  constructor(
    // private router: Router,
    private myEventsService: MyEventsService,
    private toastr: NbToastrService,
    iconsLibrary: NbIconLibraries,
    private pageRouter: PageRouterService,
  ) {
    iconsLibrary.registerFontPack('ion', { iconClassPrefix: 'ion' });

  }

  /**
   * The MyEventClass model object used to hold the event information corresponding to the submission
   */
  mySubmissionEvent: MyEventClass = null;

  /**
   * The method checks whether the received subevent is active at the moment or not,
   *  then returns true/false accordingly
   * @param subevent The subevent object
   */
  isSubeventActiveAtMoment(subevent: MySubEvent) {
    const currTime = new Date();
    if(subevent.allow_late_ending){
      if(currTime < subevent.late_end_time){
        // console.log('1111111111111');
        return true;
      }
    }else if(currTime <  new Date(Date.parse(subevent.time_range[1]))){
      // console.log('22222222222');
      return true;
    }
    // console.log('3333333333');
    return false;
  }

  /**
   * The method checks whether there is the subevent of type SUPLOAD is active at the moment or not
   * , returns true/false accordingly
   * @param subevents The list of subevents in the event
   */
  isSuploadActive(subevents: MySubEvent[]){
    for(let i = 0; i< subevents.length; i++){
      if ( subevents[i].type == 'SUPLOAD' ) {
        if(this.isSubeventActiveAtMoment(subevents[i])){
          return true;
        }
      }
    }
    return false;
  }

  /**
   * The component lifecycle hook, get called on every component initialization. 
   * The method fetches the submission associated event information from the local storage,
   * then store it in the mySubmissionEvent property.
   * The method makes the server API request to fetch the submission related information,
   * On receiving successful response from the server,
   * 
   * 1. store the submission group details like user selected question set,
   *  user-submitted access code, and list of group members
   * 
   * 2. store the necessary flags for submission flow like submission group is created/not,
   *  access code verification required/not, the question set selection allowed/not, etc
   * 
   * 3. store the the subevent configuration for the submission like submission group scheme,
   * question set scheme, supplementary submission allowed or not, etc.
   * 
   * 4. The method fetches the user submitted pagination and main submission file from the server
   * using component API getActualQuestions
   * 
   * 5. if supplementary submission allowed, then method fetches the user-submitted 
   * supplementary submission file from the server using component API fetchSuppSubmission
   */
  ngOnInit() {
    this.suppFile = new SupplementaryFile(null, null);
    this.mySubmissionEvent = JSON.parse(localStorage.getItem('mySubmissionEvent'));
    // this.isSupload = this.isSuploadActive(this.mySubmissionEvent.subevents);
    this.isSupload = this.mySubmissionEvent.isActiveFlags.SUPLOAD;
    console.log('issupload = ',this.isSupload);
    this.mySubmissionEvent.isNACReq = false;
    this.mySubmissionEvent.isNACVerified = true;
    this.mySubmissionEvent.isSGCreated = false;
    this.mySubmissionEvent.isQsetSelected = false;
    if ( localStorage.getItem('isImpersonated') == "true") {
      this.isImpersonated = true;
      const impersonatedId  = localStorage.getItem('impersonatedUserId');
      this.myEventsService.fetchImpersonatedSubmissions(this.mySubmissionEvent, parseInt(impersonatedId)).subscribe(
        resData3 => {
          // console.log('aaaaaaaaaaaa');
          // console.log(resData3);
          
          const responseData: any = resData3;
          const groupMembers: GroupMember[] = [];
  
          for (let j = 0; j < responseData.users.length; j++) {
            const grpMember: GroupMember = new GroupMember(
              responseData.users[j].roll_no,
              responseData.users[j].first_name,
              responseData.users[j].last_name,
            );
            groupMembers.push(grpMember);
          }
  
          const sg: MySubmissionGroup = new MySubmissionGroup(
            responseData.submission_group.id,
            responseData.submission_group.choosen_question_set,
            responseData.submission_group.access_code_submitted,
            responseData.submission_group.is_late_submission,
            groupMembers,
          );
  
          this.mySubmissionEvent.color = responseData.params.COL;
          this.mySubmissionEvent.isNACReq = responseData.params.NAC;
          this.mySubmissionEvent.isNACVerified = responseData.params.NAC_flag;
          this.mySubmissionEvent.sgs = responseData.params.SGS;
          this.mySubmissionEvent.qss = responseData.params.QSS;
          this.mySubmissionEvent.submissionGroup = sg;
          this.mySubmissionEvent.del = responseData.params.DEL;
          this.mySubmissionEvent.isSupAllowed = responseData.params.SUP;
          // this.mySubmissionEvent.isSupAllowed = true;
          this.isSupload = true;
          this.mySubmissionEvent.SUT = responseData.params.SUT;
  
          if (this.mySubmissionEvent.qss == 'FS' || this.mySubmissionEvent.submissionGroup.choosenQset != null) {
            this.mySubmissionEvent.isQsetSelected = true;
          }
  
  
          if (this.mySubmissionEvent.isSupAllowed)
            this.fetchSuppSubmission();
  
          this.getActualQuestions('onload_impersonated');
          this.mySubmissionEvent.isSGCreated = true;
          console.log(this.mySubmissionEvent);
        },
        error3 => {
          console.log('fetch mySubmissions failed and error is =' + error3);
        },
      );
    }
    else {
      this.myEventsService.fetchMySubmissions(this.mySubmissionEvent).subscribe(
        resData3 => {
          // console.log('aaaaaaaaaaaa');
          // console.log(resData3);
          
          const responseData: any = resData3;
          const groupMembers: GroupMember[] = [];
  
          for (let j = 0; j < responseData.users.length; j++) {
            const grpMember: GroupMember = new GroupMember(
              responseData.users[j].roll_no,
              responseData.users[j].first_name,
              responseData.users[j].last_name,
            );
            groupMembers.push(grpMember);
          }
  
          const sg: MySubmissionGroup = new MySubmissionGroup(
            responseData.submission_group.id,
            responseData.submission_group.choosen_question_set,
            responseData.submission_group.access_code_submitted,
            responseData.submission_group.is_late_submission,
            groupMembers,
          );
  
          this.mySubmissionEvent.color = responseData.params.COL;
          this.mySubmissionEvent.isNACReq = responseData.params.NAC;
          this.mySubmissionEvent.isNACVerified = responseData.params.NAC_flag;
          this.mySubmissionEvent.sgs = responseData.params.SGS;
          this.mySubmissionEvent.qss = responseData.params.QSS;
          this.mySubmissionEvent.submissionGroup = sg;
          this.mySubmissionEvent.del = responseData.params.DEL;
          this.mySubmissionEvent.isSupAllowed = responseData.params.SUP;
          this.mySubmissionEvent.SUT = responseData.params.SUT;
  
          if (this.mySubmissionEvent.qss == 'FS' || this.mySubmissionEvent.submissionGroup.choosenQset != null) {
            this.mySubmissionEvent.isQsetSelected = true;
          }
  
  
          if (this.mySubmissionEvent.isSupAllowed)
            this.fetchSuppSubmission();
  
          this.getActualQuestions('onload');
          this.mySubmissionEvent.isSGCreated = true;
          console.log(this.mySubmissionEvent);
        },
        error3 => {
          console.log('fetch mySubmissions failed and error is =' + error3);
        },
      );
    }
  
    this.mySubmissionEvent.sgrp_form.questionSets = this.mySubmissionEvent.questionSets;

    // this.myEventsService.getAssignQuestionSets(this.mySubmissionEvent.assignment_id).subscribe(
    //   resData => {
    //     let questionsets: any = resData;
    //     questionsets = questionsets.questionsets;
    //     const extractedQsets: QuestionSet[] = [];
    //     for (let i = 0; i < questionsets.length; i++) {
    //       const qset = new QuestionSet(
    //         i + 1,
    //         questionsets[i].id,
    //         questionsets[i].name,
    //         null,
    //         null,
    //         null,
    //         null,
    //         null,
    //         null,
    //         null,
    //       );

    //       extractedQsets.push(qset);
    //     }
    //     this.mySubmissionEvent.sgrp_form.questionSets = extractedQsets;
    //   },
    //   error => {

    //   },
    // );

    // this.fetchSelectedQSet();

  }

  gotToMainView() {
    localStorage.setItem('isImpersonated', JSON.stringify(false));
    localStorage.setItem('impersonatedUserId', ''); 
    this.pageRouter.gotoImpersonatedDashboard();
  }
  /**
   * The method makes server API request to verify the user-submitted access code.
   * On receiving successful response from the server, the method sets the access code verification flag
   * and move the user-submission to the submission stage
   */
  verifyNACForm() {
    this.myEventsService.verifyMyNAC(this.mySubmissionEvent).subscribe(
      resData => {
        if (resData.is_NAC_correct) {
          this.mySubmissionEvent.isNACVerified = true;
          this.mySubmissionEvent.isSGCreated = true;
          this.toastr.success('Access code Verified successfully', 'Success');
          this.mySubmissionEvent.submissionGroup.accessCodeSubmitted = this.mySubmissionEvent.sgrp_form.accessCodeSubmitted;
        } else {
          this.toastr.danger('Please submit correct Access code', 'Error');
        }

      },
      error => {
        this.toastr.danger(error.error.detail, 'Error');
      },
    );
  }

  /**
   * The method checks the received value is the number or not,
   * then returns the boolean value accordingly
   * @param n 
   */
  isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0); }

  /**
   * The method checks the user-selected choice on the submission group form
   *  whether it is to create or join the
   * submission group, based on the choice method makes the server API request 
   * to CREATE/JOIN the submission group. On receiving the success response from the server,
   * method fetches the submission group details and group member from the server using
   * the component API fetchMySubmissionGroup
   * @param idx The dummy parameter
   */
  submitCreateJoinForm(idx: number) {
    console.log(this.mySubmissionEvent.sgrp_form);
    if (this.mySubmissionEvent.sgrp_form.choice == '0') {
      this.myEventsService.createSubmissionGroup(this.mySubmissionEvent).subscribe(
        resData => {
          console.log(resData);

          this.fetchMySubmissionGroup();
          this.toastr.success('Submission Group created successfully', 'Success');
        },
        error => {
          console.log(error);
          if (error.error != null && error.error.detail != null)
            this.toastr.danger(error.error.detail, 'Error');
          else
            this.toastr.danger(error.error, 'Error');
        },
      );
    } else {
      if (this.isNumber(this.mySubmissionEvent.sgrp_form.sGroupID) == false) {
        this.toastr.danger('Please provide valid Submission Group ID', 'Error');
        return;
      }

      this.myEventsService.joinSubmissionGroup(this.mySubmissionEvent).subscribe(
        _resData => {
          // fetch submission group details
          this.fetchMySubmissionGroup();
          this.toastr.success('Submission Group joined successfully', 'Success');
        },
        error => {
          this.toastr.danger(error.error.detail, 'Error');
          console.log(error);
        },
      );
    }

  }

  /**
   * the method make the server API request to fetch the submission group details in the received event.
   * On receiving successful response from the server, method stores the details
   *  like group database ID, selected question set, access code submitted, and the list of group members
   */
  fetchMySubmissionGroup() {
    this.myEventsService.fetchMySubmissions(this.mySubmissionEvent).subscribe(
      resData3 => {
        const responseData: any = resData3;
        const groupMembers: GroupMember[] = [];

        for (let j = 0; j < responseData.users.length; j++) {
          const grpMember: GroupMember = new GroupMember(
            responseData.users[j].roll_no,
            responseData.users[j].first_name,
            responseData.users[j].last_name,
          );
          groupMembers.push(grpMember);
        }

        const sg: MySubmissionGroup = new MySubmissionGroup(
          responseData.submission_group.id,
          responseData.submission_group.choosen_question_set,
          responseData.submission_group.access_code_submitted,
          responseData.submission_group.is_late_submission,
          groupMembers,
        );

        this.mySubmissionEvent.color = responseData.params.COL;
        this.mySubmissionEvent.isNACReq = false;
        this.mySubmissionEvent.isNACVerified = true;
        this.mySubmissionEvent.sgs = responseData.params.SGS;
        this.mySubmissionEvent.qss = responseData.params.QSS;
        this.mySubmissionEvent.submissionGroup = sg;
        this.mySubmissionEvent.del = responseData.params.DEL;

        if (this.mySubmissionEvent.qss == 'FS' || this.mySubmissionEvent.submissionGroup.choosenQset != null) {
          this.mySubmissionEvent.isQsetSelected = true;
        }
        this.fetchSelectedQSet();
        this.mySubmissionEvent.isSGCreated = true;
        this.mySubmissionEvent.sgrp_form.isOpenSGroupForm = !this.mySubmissionEvent.sgrp_form.isOpenSGroupForm;

      },
      error3 => {
        this.toastr.danger(error3.error.detail, 'Error');
        console.log('fetch mySubmissions failed  and error is =' + error3);
      },
    );
  }

/**
 * The method downloads the user-submitted supplementary file into the local system,
 * it internally uses the component API downloadSuppFile to download the file
 */
  getSupplFile() {
    this.downloadSuppFile(this.suppFile.file, this.suppFile.name);
    // this.saveToFileSystem(this.suppFile, 'application/octet-stream');
  }

  /**
 * The method downloads the user-submitted main submission file into the local system,
 * it internally uses the component API downloadFile to download the file
 */
  getMainSubmFile() {
    console.log('downloading main file');
    this.downloadFile(this.mainFile.file, this.mainFile.name);

  }
  
  /**
 * The method downloads the received pdf file into the local system
 * @param file the file Object to be downloaded
 * @param filename the name to be used for file object
 */
  downloadFile(file: any, filename: any) {
    const linkSource = 'data:application/pdf;base64,' + file;
    const link = document.createElement('a');
    link.href = linkSource;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
    this.toastr.success('File downloaded successfully', 'Success');
  }

  /**
 * The method downloads the received zip file into the local system
 * @param file the file Object to be downloaded
 * @param filename the name to be used for file object
 */
  downloadSuppFile(file: any, filename: any) {
    const linkSource = 'data:application/zip;base64,' + file;
    const link = document.createElement('a');
    link.href = linkSource;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
    this.toastr.success('File downloaded successfully', 'Success');
  }

/**
 * The method append the page image to the array of the main submission file pages
 * @param imageval The page image to be append
 */
  addSlide(imageval: string): void {
    this.slides.push({
      image: imageval,
    });

    this.sliderImages.push(imageval);
  }
/**
 * The nebular card configuration property
 */
  winmode: boolean = false;

  /**
 * The method delete the page image at the given index from
 *  the array of the main submission file pages 
 * @param index the array index of the image to be deleted
 */
  removeSlide(index?: number): void {
    const toRemove = index ? index : this.activeSlideIndex;
    this.slides.splice(toRemove, 1);
  }

  /**
   * The method makes the server API request to update the pre-submission details like 
   * submission corresponding question set and access code.
   * On receving success response from the server, the method reset the question pagination panel data
   * using the questions of the updated question set
   */
  submitPreSubmissionForm() {
    console.log(this.mySubmissionEvent.sgrp_form);
    this.myEventsService.updateMyPreSubmission(this.mySubmissionEvent).subscribe(
      resData => {
        if (this.mySubmissionEvent.isQsetSelected == false && this.mySubmissionEvent.sgrp_form.selectedQSet != null) {
          this.mySubmissionEvent.isQsetSelected = true;
          this.mySubmissionEvent.submissionGroup.choosenQset = (this.mySubmissionEvent.sgrp_form.selectedQSet).toString();
          this.getActualQuestions('init');
        }
        if (this.mySubmissionEvent.isNACReq && !this.mySubmissionEvent.isNACVerified
          && this.mySubmissionEvent.sgrp_form.accessCodeSubmitted != null) {
          this.mySubmissionEvent.isNACVerified = true;
          this.mySubmissionEvent.submissionGroup.accessCodeSubmitted = this.mySubmissionEvent.sgrp_form.accessCodeSubmitted;
        }
        this.toastr.success('PreSubmission completed successfully, Please Upload File', 'Success');
      },
      error => {
        console.log(error);
        this.toastr.danger(error.error.detail, 'Error');
      },
    );
  }

  /**
   * The method redirects the user to the MyEvents Dashboard of the application
   */
  gotoMyEvents() {
    // this.router.navigate(['/pages', 'myevents']);
    localStorage.setItem('isImpersonated', JSON.stringify(false));
    localStorage.setItem('impersonatedUserId', ''); 
    this.pageRouter.gotoMyEvents();
  }

/**
 * The method checks whether user uploaded main submission file or not.
 * If the file is not uploaded then method shows the appropriate error message and returns.
 * The method checks whether user provides the pagination for all the questions or not.
 * If the pagination is missing for any question then method shows the appropriate error message and returns.
 * Else it shows the success notification and redirects user to the MyEvents dashboard
 */
  onFinalSubmit() {
    if (this.isMainSubmissionPresent) {
      for (let i = 0; i < this.myQuestions.length; i++) {
        if (this.myQuestions[i].selectedPage == null) {
          this.toastr.danger('Please select start page for all questions', 'Warning');
          return;
        }
      }
      this.toastr.success('Event submission completed successfully', 'Success');
      if ( this.isImpersonated ) {
        this.pageRouter.gotoImpersonatedDashboard(); 
        localStorage.setItem('isImpersonated', JSON.stringify(false));
        localStorage.setItem('impersonatedUserId', ''); 
      }
      else {
        this.pageRouter.gotoMyEvents();
      }
    } else {
      this.toastr.danger('Please upload main submission file', 'Error');
      return;
    }
  }

  /**
   * The method sets the component property myQuestions for the pagination 
   * using the user-selected question set for the submission.
   * The method is used in two circumstances, the data load at the component initialization
   *  and another is once user update the question set corresponding to the submission.
   * On data load mode, the method calls the component API fetchMainSubmission to
   * fetch the main submission file and the pagination data from the server.
   * On second mode, the method initializes pagination for the updated question list in the view
   * using the component API initPagination
   * @param flag the string flag representing the usage mode of API, for example 
   * data load mode(onload) or the question set update mode(init)
   */
  getActualQuestions(flag: string) {

    console.log(this.mySubmissionEvent);
    if (this.mySubmissionEvent.submissionGroup.choosenQset == null) {
      this.fetchMainSubmission(false);
      return false;
    }

    this.myQuestions = null;
    for(let i=0;i<this.mySubmissionEvent.questionSets.length;i++){
      if( +this.mySubmissionEvent.submissionGroup.choosenQset == this.mySubmissionEvent.questionSets[i].main_id ){
        this.myQuestions = this.mySubmissionEvent.questionSets[i].questions;
      }
    }
    if(this.myQuestions == null ){
      this.fetchMainSubmission(false);
    }else{
      if (flag == 'onload') {
        this.fetchMainSubmission(true);

      } else if (flag == 'init') {
        this.initPagination(this.slides.length);
      }
      else if ( flag == 'onload_impersonated' ) {
        this.fetchMainSubmissionImpersonated();
      }
      return true;
    }

    // this.myEventsService.fetchMyQuestions(this.mySubmissionEvent).subscribe(
    //   resData => {
    //     // console.log('resData');
    //     const extractedMyQuestions: MyQuestion[] = [];
    //     const questions: any[] = resData.questions;
    //     let j = 1;
    //     for (let i = 0; i < questions.length; i++) {
    //       if (questions[i].is_actual_question) {
    //         const question = new MyQuestion(j,
    //           questions[i].id,
    //           questions[i].title,
    //           questions[i].text,
    //           questions[i].marks,
    //           0,
    //           []);
    //         extractedMyQuestions.push(question);
    //         j++;
    //       }
    //     }

    //     this.myQuestions = extractedMyQuestions;
    //     if (flag == 'onload') {
    //       this.fetchMainSubmission(true);

    //     } else if (flag == 'init') {
    //       this.initPagination(this.slides.length);
    //     }
    //     return true;
    //   },
    //   error => {
    //     console.log('errror' + error);
    //     this.fetchMainSubmission(false);
    //     return false;
    //   },
    // );
  }

  /**
   * The method make server API request to update the user-selected question set for the submission.
   * On receiving success response from the server, the method update the pagination panel view
   * with the updated question set data by calling the component API getActualQuestions(in 
   * init flag mode)
   */
  submitQSetForm() {
    // call update qset api
    this.myEventsService.updateMyPreSubmission(this.mySubmissionEvent).subscribe(
      resData => {
        // update mysubmissionevent choosen qset fields
        this.mySubmissionEvent.submissionGroup.choosenQset = (this.mySubmissionEvent.sgrp_form.selectedQSet).toString();
        // fetch actuall questions of updated qset
        this.getActualQuestions('init');

        this.toastr.success('QuestionSet updated successfully.', 'Success');
        // console.log('qset form submitted successfully');
        this.toggleQSetForm();
      },
      error => {
        console.log(error);
        this.toastr.danger(error.error.detail, 'Error');
      },
    );

  }

  /**
   * The method computes the file sha1 hash using component API hashFile.
   * Then method calls the service API uploadMainSubmission to upload the file at the application server.
   * On receiving success response from the server,
   * 
   * 1. Update the main submission file data used by file view panel
   * 
   * 2. Delete the pagination corresponding to old submission file( if uploaded any)
   * 
   * 3. Inititalize the pagination panel using component API initPagination
   * 
   * 4. Display the success notitfication and 
   * hide the main submission file upload form using component API toggleFileForm
   */
  submitFileForm() {
    console.log('file array len=', this.uploadedFiles.length);
    if (this.uploadedFiles.length == 0) {
      this.toastr.danger('Please upload valid submission file', 'Error');
      return;
    }
    if (this.uploadedFiles.length > 1) {
      this.toastr.danger('Upload only one submission file', 'Error');
      return;
    }
    this.mainloading = true;
    const file: File = this.uploadedFiles[0];
    const filename = file.name;

    const reader = new FileReader();

    let hash1: string = '';
    this.hashFile(file, (hashedFile, hash) => {
      console.log('hash: ', hash);
      hash1 = hash;
      if ( localStorage.getItem('isImpersonated') == "true") {
        this.isSupload = true;
        const impersonatedId  = localStorage.getItem('impersonatedUserId');
        this.myEventsService.uploadImpersonatedMainSubmission(this.mySubmissionEvent, file, hash1, parseInt(impersonatedId)).subscribe(
          resData => {
            console.log('file updated successfully =' + resData);
            // update images to show
            
            this.slides = [];
            this.sliderImages = [];
            const file_images: any = resData.file_images;
            for (const key of Object.keys(file_images)) {
              this.addSlide(file_images[key]);
            }
            if(this.mainFile != null){
              this.deleteOldPagination();
            }
            this.mainFile = new SupplementaryFile(file.name, file);
            this.filename = file.name;
            this.mainloading = false;
            this.isMainSubmissionPresent = true;
            this.toggleFileForm();
            this.initPagination(this.slides.length);
            this.toastr.success('File uploaded successfully.', 'Success');
  
          },
          error => {
            console.log('error' + error);
            this.mainloading = false;
            this.toastr.danger(error.error.detail, 'File upload Error');
          },
        );
      }
      else {
        this.myEventsService.uploadMainSubmission(this.mySubmissionEvent, file, hash1).subscribe(
          resData => {
            console.log('file updated successfully =' + resData);
            // update images to show
            this.slides = [];
            this.sliderImages = [];
            const file_images: any = resData.file_images;
            for (const key of Object.keys(file_images)) {
              this.addSlide(file_images[key]);
            }
            if(this.mainFile != null){
              this.deleteOldPagination();
            }
            this.mainFile = new SupplementaryFile(file.name, file);
            this.filename = file.name;
            this.mainloading = false;
            this.isMainSubmissionPresent = true;
            this.toggleFileForm();
            this.initPagination(this.slides.length);
            this.toastr.success('File uploaded successfully.', 'Success');
  
          },
          error => {
            console.log('error' + error);
            this.mainloading = false;
            this.toastr.danger(error.error.detail, 'File upload Error');
          },
        );
      }
    });

    // call api
    // set update images
    // set filename
    // fire paginate as 0 for all actual questions
    // set page 0 for all actual questions
    console.log('file form submitted successfully');
  }

    /**
   * The method computes the file sha1 hash using component API hashFile.
   * Then method calls the service API uploadSuppSubmission to upload the file at the application server.
   * On receiving success response from the server,
   * 
   * 1. update the component properties isSuppSubmissionPresent and suppFile
   * 
   * 2. Display the success notitfication and 
   * hide the supplementary submission file upload form using component API toggleSuppFileForm
   */
  submitSuppFileForm() {
    this.supploading = true;
    console.log('file array len=', this.uploadedSuppFiles.length);
    if (this.uploadedSuppFiles.length == 0) {
      this.toastr.danger('Please upload valid suppl. submission file', 'Error');
      return;
    }
    if (this.uploadedSuppFiles.length > 1) {
      this.toastr.danger('Upload only one suppl. submission file', 'Error');
      return;
    }
    const file: File = this.uploadedSuppFiles[0];


    let hash1: string = '';
    this.hashFile(file, (hashedFile, hash) => {
      console.log('hash: ', hash);
      hash1 = hash;

      this.myEventsService.uploadSuppSubmission(this.mySubmissionEvent, file, hash1).subscribe(
        resData => {
          console.log('supp file updated successfully =' + resData);
          this.suppFile = new SupplementaryFile(file.name, file);
          this.supploading = false;
          this.isSuppSubmissionPresent = true;
          this.toggleSuppFileForm();
          this.toastr.success('Suppl. File uploaded successfully.', 'Success');

        },
        error => {
          this.supploading = false;
          console.log('error' + error);
          this.toastr.danger(error.error.detail, 'File upload Error');
        },
      );
    });

    console.log('supp file form submitted successfully');
  }

  /**
   * The method computes the hash of the received file using the SHA1 API of CryptoJS library
   * and returns the computed hash
   * @param fileToHandle The file to be processed for the hash computation
   * @param callback The function callback to return the hash
   */
  hashFile(fileToHandle, callback) {
    const reader = new FileReader();
    reader.onloadend = (function () {
      return function (e) {
        const file_wordArr = CryptoJS.lib.WordArray.create(this.result);
        const hash = CryptoJS.SHA1(file_wordArr).toString();
        console.log('hash result in fileReader: ', hash);
        callback(fileToHandle, hash);
      };
    })();
    reader.onerror = function (e) {
      console.error(e);
    };

    reader.readAsArrayBuffer(fileToHandle);
  }

  /**
   * The method toggle the question set form using the component property isOpenQSetForm
   */
  toggleQSetForm() {
    this.isOpenQSetForm = !this.isOpenQSetForm;
  }

  /**
   * The method toggle the main submission file form using the component property isOpenFileForm
   */
  toggleFileForm() {
    this.isOpenFileForm = !this.isOpenFileForm;
  }

  /**
   * The method toggle the supplementary submission file form using the component property 
   * isOpenSuppFileForm
   */
  toggleSuppFileForm() {
    this.isOpenSuppFileForm = !this.isOpenSuppFileForm;
  }

  fetchMainSubmissionImpersonated() {
    let isQsetPresent = true;
    this.isSupload = true;
    const impersonatedId  = localStorage.getItem('impersonatedUserId');
    this.myEventsService.getImpersonatedMainSubmission(this.mySubmissionEvent.main_id,parseInt(impersonatedId)).subscribe(
      resData => {
        console.log('submission present = ' + resData);
        console.log(resData);
        this.mainFile = new SupplementaryFile(resData.data.original_file_name, resData.data.upload_file);
        this.slides = [];
        this.sliderImages = [];
        const file_images: any = resData.data.file_images;
        let size = 0;
        for (const key of Object.keys(file_images)) {
          this.addSlide(file_images[key]);
          size++;
        }
        this.filename = resData.data.original_file_name;
        this.isMainSubmissionPresent = true;
        if (isQsetPresent) {
          this.fetchImpersonatedPagination(this.slides.length);
        }
      },
      error => {
        this.isMainSubmissionPresent = false;
        this.isOpenFileForm = true;
      },
    );

  } 
  /**
   * The method makes the server API request to fetch
   *  the main submission file uploaded by the user.
   * On receiving success response from the server,
   * method sets the pages array for the file view panel and fetch the pagination data using 
   * component APIfetchPagination(if isQsetPresent is true)
   * @param isQsetPresent The flag representing whether the submission associated
   *  question set is selected/not
   */
  fetchMainSubmission(isQsetPresent: boolean) {

    this.myEventsService.getMyMainSubmission(this.mySubmissionEvent.main_id).subscribe(
      resData => {
        console.log('submission present = ' + resData);
        console.log(resData);
        this.mainFile = new SupplementaryFile(resData.data.original_file_name, resData.data.upload_file);
        this.slides = [];
        this.sliderImages = [];
        const file_images: any = resData.data.file_images;
        let size = 0;
        for (const key of Object.keys(file_images)) {
          this.addSlide(file_images[key]);
          size++;
        }
        this.filename = resData.data.original_file_name;
        this.isMainSubmissionPresent = true;
        if (isQsetPresent) {
          this.fetchPagination(this.slides.length);
        }
      },
      error => {
        this.isMainSubmissionPresent = false;
        this.isOpenFileForm = true;
      },
    );

  }

   /**
   * The method makes the server API request to fetch the supplementary
   *  submission file uploaded by the user.
   * On receiving success response from the server,
   * method sets the component properties suppFile and isSuppSubmissionPresent
   */
  fetchSuppSubmission() {

    this.myEventsService.getMySupplSubmission(this.mySubmissionEvent.main_id).subscribe(
      resData => {
        console.log('supp submission present = ' + resData);
        this.isSuppSubmissionPresent = true;
        this.suppFile = new SupplementaryFile(resData.data.original_file_name, resData.data.upload_file);
      },
      error => {
      },
    );

  }

  /**
   * The method make server API request to fetch the pagination data of the submission,
   * On receiving success response from the server,
   * method sets the component properties and the dropdown data for the pagination panel view
   * @param totalPages Total number of pages in the main submission file
   */
  fetchPagination(totalPages: number) {

    // fetch all pagination and set
    this.myEventsService.getResponsePagination(this.mySubmissionEvent).subscribe(
      resData => {
        // const data: Map<string, number> = new Map<string, number>(resData.data);
        const data: any[] = resData.data;
        console.log('pagination data =', data);
        console.log('pagination questions =', this.myQuestions);

        for (let j = 0; j < data.length; j++) {
          for (let i = 0; i < this.myQuestions.length; i++) {
            if (data[j].question_id == this.myQuestions[i].main_id.toString()) {
              this.myQuestions[i].selectedPage = data[j].page_no;
            }
          }
        }

      },
      error => {

      },
    );

    this.setPagesArray(totalPages);
  }


  fetchImpersonatedPagination(totalPages: number) {
    this.isSupload = true;
    const impersonatedId  = localStorage.getItem('impersonatedUserId');
    this.myEventsService.getImpersonatedResponsePagination(this.mySubmissionEvent,parseInt(impersonatedId)).subscribe(
      resData => {
        // const data: Map<string, number> = new Map<string, number>(resData.data);
        const data: any[] = resData.data;
        console.log('pagination data =', data);
        console.log('pagination questions =', this.myQuestions);

        for (let j = 0; j < data.length; j++) {
          for (let i = 0; i < this.myQuestions.length; i++) {
            if (data[j].question_id == this.myQuestions[i].main_id.toString()) {
              this.myQuestions[i].selectedPage = data[j].page_no;
            }
          }
        }

      },
      error => {

      },
    );

    this.setPagesArray(totalPages);
  }


    /**
   * The method initialize the pagination data to zero for all the questions in the submission
   * and sets the dropdown data for the pagination panel view
   * @param totalPages Total number of pages in the main submission file
   */
  initPagination(totalPages: number) {

    // set pagination as 0 for all questions
    for (let i = 0; i < this.myQuestions.length; i++) {
      this.myQuestions[i].selectedPage = null;
      // this.setQuestionPagination(this.myQuestions[i]);
    }

    this.setPagesArray(totalPages);
  }

  /**
   * The method sets the dropdown data as the sequence of integers from 1 to len
   * for the pagination panel view
   * @param len Total number of pages in the main submission file
   */
  setPagesArray(len: number) {
    const arr: number[] = [];
    for (let i = 0; i < len; i++)arr.push(i);

    for (let i = 0; i < this.myQuestions.length; i++) {
      this.myQuestions[i].pageArray = arr;
    }
    console.log(this.myQuestions);
  }

  /**
   * The method make the server API request to set the question - page number link
   * for the submission at the application server
   * @param question the request corresponding question
   */
  setQuestionPagination(question: MyQuestion) {
   
    this.myEventsService.setResponsePagination(this.mySubmissionEvent.main_id, question.main_id, question.selectedPage).subscribe(
      resData => {
        console.log('pagination set =', resData);
      },
      error => {
        console.log('pagination error =', error);
      },
    );
  }

  /**
   * The method make the multiple server API requests to delete all
   *  the existing question - page number links
   * for the submission at the application server
   */
  deleteOldPagination() {

    for (let i = 0; i < this.myQuestions.length; i++) {
      if (this.myQuestions[i].selectedPage != null) {
        this.myEventsService.delResponsePagination(this.mySubmissionEvent.main_id,
          this.myQuestions[i].main_id, this.myQuestions[i].selectedPage).subscribe(
            resData => {
              console.log('pagination deleted =', resData);
            },
            error => {
              console.log('pagination error =', error);
            },
          );
      }
    }
  }

    /**
   * The method make the server API request to set the question - page number link
   * for the submission at the application server
   * @param question the request corresponding question list index
   */
  pageSelectionUpdate(qid: number) {
    console.log('page selected = ', qid);
    
    const question: MyQuestion = this.myQuestions[qid];
   
    console.log('page no=', question.selectedPage);

    if ( localStorage.getItem('isImpersonated') == "true") {
      this.isSupload = true;
      const impersonatedId  = localStorage.getItem('impersonatedUserId');
      this.myEventsService.setImpersonatedResponsePagination(this.mySubmissionEvent.main_id, question.main_id, question.selectedPage, parseInt(impersonatedId)).subscribe(
        resData => {
          this.toastr.success('Start page updated successfully.', 'Success', { limit: 3});
          console.log('pagination set =', resData);
        },
        error => {
          console.log('pagination error =', error);
          this.toastr.danger(error.error.detail, 'Page Selection Error');
        },
      );
    }
    else {
      this.myEventsService.setResponsePagination(this.mySubmissionEvent.main_id, question.main_id, question.selectedPage).subscribe(
        resData => {
          this.toastr.success('Start page updated successfully.', 'Success', { limit: 3});
          console.log('pagination set =', resData);
        },
        error => {
          console.log('pagination error =', error);
          this.toastr.danger(error.error.detail, 'Page Selection Error');
        },
      );
    }

    
  }

  /**
   * The method make the server API request to fetch the question set associated
   *  to the submission from the application server.
   * On receiving success response from the server, the method fetch the
   * list of questions corresponds to the question set using component API getActualQuestions
   * with the onload flag
  
   */
  fetchSelectedQSet() {
    this.myEventsService.fetchMySubmissions(this.mySubmissionEvent).subscribe(
      resData3 => {
        const responseData: any = resData3;
        this.mySubmissionEvent.submissionGroup.choosenQset = responseData.submission_group.choosen_question_set;
        this.getActualQuestions('onload');
      },
      error3 => {
        console.log('fetch Submission info failed and error is =' + error3);
      },
    );

  }

  // saveToFileSystem(data: any, fileType: string) {
  //   // const contentDispositionHeader: string = response.headers.get('Content-Disposition');
  //   // const parts: string[] = contentDispositionHeader.split(';');
  //   const filename = data.name;
  //   // const chunk = data.main_file.read(fileType.minimumBytes);
  //   // console.log(fileType(chunk));
  //   const blob = new Blob([data], { type: fileType });
  //   saveAs(blob, filename);
  // }

}
