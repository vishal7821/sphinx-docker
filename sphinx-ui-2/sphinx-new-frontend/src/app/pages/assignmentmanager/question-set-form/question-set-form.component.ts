import { Component, OnInit } from '@angular/core';
import { NbWindowRef, NbToastrService } from '@nebular/theme';
import { AssignmentManagerService } from '../assignmentmanager.service';
import { QuestionSet } from '../assignmentmanager.model';


/**
 * QuestionSetForm component provides the capabilities to add/edit QuestionSet in the Course.
 * 
 * QuestionSetForm view provides popup window form to create/edit an question set in the Course as per respective user action. 
 * 
 * QuestionSetForm component contains properties and method API's to perform frontend application logic for QuestionSet operations in the Course.
 *  method API's of component provide functionalities like  create/edit question set to course by calling necessary service API methods
 * 
 */
@Component({
  selector: 'ngx-question-set-form',
  templateUrl: './question-set-form.component.html',
  styleUrls: ['./question-set-form.component.scss'],
})
export class QuestionSetFormComponent implements OnInit {

  /**
   * Property representing Question set name in edit/create form
   */
  public name: string;
  /**
   * Property representing Question set total marks in edit/create form
   */
  public total_marks: number;
  /**
   * boolean flag used to disabled form buttons to avoid duplicate server api request
   */
  public isDisabled: boolean  = false;
  /**
   * boolean flag to identify edit action mode 
   */
  public isEdit: boolean = false;
  /**
   * Assignment list index of selected question set to edit/create
   */
  public editassignIdx: number = -1;
  /**
   * Question set list index of selected question set to edit/create
   */
  public editqsetIdx: number = -1;
  /**
   * QuestionSet model object to hold form data
   */
  public qset: QuestionSet = new QuestionSet(
    null, null, '', 0, null, null, null, null, null,

  );


  /**
   * Property to hold Main Question file in edit/create form
   */
  public question_file: Array<File> = [];
  /**
   * Property to hold Question set Supplementary file in edit/create form
   */
  public supplementary_file: Array<File> = [];
  /**
   * Property to hold Question set Solution file in edit/create form
   */
  public solution_file: Array<File> = [];

  public is_interactive: Boolean;

  /**
   * Component constructor used to initialize Form window reference, AssignmentManagerService object, nebular Toastr service object
   * @param windowRef Form window reference
   * @param assignManagerService Assignment Anager service object
   * @param toastr Nebular toastr Service object
   */
  constructor(public windowRef: NbWindowRef, public assignManagerService: AssignmentManagerService, private toastr: NbToastrService) { }

    /**
   * Component life cycle hook used to set form mode based on user selected action on Assignment manager view
   */
  ngOnInit() {
    this.editassignIdx = this.assignManagerService.assignEdit;
    this.is_interactive = this.assignManagerService.assignData.value[this.assignManagerService.assignEdit]["is_interactive"];
    if (this.windowRef.config.title === 'Edit Question Set') {
      this.isEdit = true;
      this.editqsetIdx = this.assignManagerService.qSetEdit;
      // console.log(this.editIdx);
      const assign = this.assignManagerService.assignData.value[this.editassignIdx];
      this.qset = assign.questionSets[this.editqsetIdx];
      // console.log(this.assign);
    }
  }

    /**
   * When user submits the form, view triggers the call this method which finds the form mode edit/create and call the respective method to perform action
   */
  onSubmit() {
    if (this.isEdit) {
      this.editQuestionSet();
    } else {
      this.createQuestionSet();
    }
  }

   /**
   * Method takes the form data from view, validate the questionset data and shows an error message if user input is invalid.
   * After successful validation of user input, method makes backend server request using service api method editQuestionSet.
   * Once the Question set text data updated successfully at server, method makes independent parallel server api requests to update question set files at application server
   */
  editQuestionSet() {
    // console.log('edit', this.qset);

    // console.log(this.qset.name);
    // console.log(this.qset.total_marks);


    if (!this.validateSubmittedData()) {
      return;
    }

    const assignList = this.assignManagerService.assignData.value;
    // console.log(assignList.length);
    this.assignManagerService.editQuestionSet(assignList[this.editassignIdx].main_id, this.qset).subscribe(
      resData => {
        // console.log(resData);
        const assign = assignList[this.editassignIdx];
        // this.qset.id = assign.questionSets.length+1;
        // this.qset.main_id= resData.questionset.id;


        // upload question file if provided
        if (this.question_file.length > 0) {
          this.assignManagerService.editQuestionFile(
            assignList[this.editassignIdx].main_id, this.qset.main_id, this.question_file[0]).subscribe(
            _resData => {
              this.qset.question_name = this.question_file[0].name;
              // console.log('q file updated=', resData);
            },
            error => {
              console.log(error);
              if (error.error != null && error.error.detail != null) {
                this.toastr.danger(error.error.detail, 'Error');
              } else {
                this.toastr.danger(error.error, 'Error');
              }
            },
          );
        }

        // upload question file if provided
        if (this.supplementary_file.length > 0) {
          this.assignManagerService.editSupplementaryFile(
            assignList[this.editassignIdx].main_id, this.qset.main_id, this.supplementary_file[0]).subscribe(
            _resData => {
              this.qset.supplementary_name = this.supplementary_file[0].name;
              // console.log('supp file updated=', resData);
            },
            error => {
              console.log(error);
              if (error.error != null && error.error.detail != null) {
                this.toastr.danger(error.error.detail, 'Error');
              } else {
                this.toastr.danger(error.error, 'Error');
              }
            },
          );
        }

        // upload question file if provided
        if (this.solution_file.length > 0) {
          this.assignManagerService.editSolutionFile(
            assignList[this.editassignIdx].main_id, this.qset.main_id, this.solution_file[0]).subscribe(
            _resData => {
              this.qset.solution_name = this.solution_file[0].name;
              // console.log('sol file updated=', resData);
            },
            error => {
              console.log(error);
              if (error.error != null && error.error.detail != null) {
                this.toastr.danger(error.error.detail, 'Error');
              } else {
                this.toastr.danger(error.error, 'Error');
              }
            },
          );
        }



        assign.questionSets[this.editqsetIdx] = (this.qset);
        assignList[this.editassignIdx] = assign;
        this.assignManagerService.sendAssignData(assignList);
        this.toastr.success('QuestionSet Updated successfully', 'Success');
        this.close();
      },
      error => {
        console.log(error);
        if (error.error != null && error.error.detail != null) {
          this.toastr.danger(error.error.detail, 'Error');
        } else {
          this.toastr.danger(error.error, 'Error');
        }

        return;
      },
    );

    this.close();

  }

/**
 * Method takes user submitted data of question set, validate that question set name should not be empty.
 * Validate that question set files must be an non empty pdf file object. If all validation succeeds then return true else return false by showing appropriate error message.
 */
  validateSubmittedData() {
    if (this.qset.name == null || this.qset.name === '') {
      this.toastr.danger('Please enter QuestionSet name', 'Error');
      return false;
    }

    if (this.question_file.length > 0) {
      const file: File = this.question_file[0];
      const filename = file.name;
      const ext = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
      if (ext !== 'pdf') {
        this.toastr.danger('Please upload valid file', 'Error');
        this.question_file = [];
        return false;
      }
    }
    if (this.solution_file.length > 0) {
      const file: File = this.solution_file[0];
      const filename = file.name;
      const ext = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
      if (ext !== 'pdf') {
        this.toastr.danger('Please upload valid file', 'Error');
        this.solution_file = [];
        return false;
      }
    }
    if (this.supplementary_file.length > 0) {
      const file: File = this.supplementary_file[0];
      const filename = file.name;
      const ext = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
      if (ext !== 'pdf' && ext !== 'zip') {
        this.toastr.danger('Please upload valid file', 'Error');
        this.supplementary_file = [];
        return false;
      }
    }
    return true;
  }

  /**
   * Method takes the form data from view, validate the questionset data and shows an error message if user input is invalid.
   * After successful validation of user input, method makes backend server request using service api method addQuestionSet.
   * Once the Question set text data updated successfully at server, method makes an call to uploadQuestionFile method which add question set files at application server
   */
  createQuestionSet() {

    // console.log(this.question_file[0].name);
    // console.log(this.supplementary_file[0].name);
    // console.log(this.solution_file[0].name);
    // console.log(this.qset.name);
    // console.log(this.qset.total_marks);


    if (!this.validateSubmittedData()) {
      return;
      
    }
    this.isDisabled = true;
    const assignList = this.assignManagerService.assignData.value;
    // console.log(assignList.length);
    this.assignManagerService.addQuestionSet(assignList[this.editassignIdx].main_id, this.qset).subscribe(
      resData => {
        // console.log(resData);
        const assign = assignList[this.editassignIdx];
        this.qset.id = assign.questionSets.length + 1;
        this.qset.main_id = resData.questionset.id;


        // upload question file if provided
        this.uploadQuestionFile();

        assign.questionSets.push(this.qset);
        assignList[this.editassignIdx] = assign;
        this.assignManagerService.sendAssignData(assignList);
        // this.toastr.success('QuestionSet created successfully', 'Success');
        // this.close();
      },
      error => {
        console.log(error);
        this.isDisabled = false;
        if (error.error != null && error.error.detail != null) {
          this.toastr.danger(error.error.detail, 'Error');
        } else {
          this.toastr.danger(error.error, 'Error');
        }

        return;
      },
    );

    // this.close();
  }


  /**
   * Method takes main question set file and makes an server api request using service api editQuestionFile to upload file at server.
   * After receiving server response , method upload the supplementary file by calling an uploadSupplFile method 
   */
  uploadQuestionFile(){
    const assignList = this.assignManagerService.assignData.value;
    if (this.question_file.length > 0) {
      this.assignManagerService.editQuestionFile(
        assignList[this.editassignIdx].main_id, this.qset.main_id, this.question_file[0]).subscribe(
        _resData => {
          this.qset.question_name = this.question_file[0].name;
          // console.log('q file updated=', resData);
          this.uploadSupplFile();
        },
        error => {
          console.log(error);
          if (error.error != null && error.error.detail != null) {
            this.toastr.danger(error.error.detail, 'Error');
          } else {
            this.toastr.danger(error.error, 'Error');
          }
          this.uploadSupplFile();
        },
      );
    }else{
      this.uploadSupplFile();
    }
  }

  /**
   * Method takes supplementary file of question set and makes an server api request using service api editSupplementaryFile to upload file at server.
   * After receiving server response , method upload the solution file by calling an uploadSolFile method 
   */
  uploadSupplFile(){
    const assignList = this.assignManagerService.assignData.value;
    if (this.supplementary_file.length > 0) {
      this.assignManagerService.editSupplementaryFile(
        assignList[this.editassignIdx].main_id, this.qset.main_id, this.supplementary_file[0]).subscribe(
        _resData => {
          this.qset.supplementary_name = this.supplementary_file[0].name;
          // console.log('supp file updated=', resData);
          this.uploadSolFile();
        },
        error => {
          console.log(error);
          if (error.error != null && error.error.detail != null) {
            this.toastr.danger(error.error.detail, 'Error');
          } else {
            this.toastr.danger(error.error, 'Error');
          }
          this.uploadSolFile();
        },
      );
    }else{
      this.uploadSolFile();
    }

  }


    /**
   * Method takes solution file of question set and makes an server api request using service api editSolutionFile to upload file at server
   */
  uploadSolFile(){
    const assignList = this.assignManagerService.assignData.value;
     // upload question file if provided
     if (this.solution_file.length > 0) {
      this.assignManagerService.editSolutionFile(
        assignList[this.editassignIdx].main_id, this.qset.main_id, this.solution_file[0]).subscribe(
        _resData => {
          this.qset.solution_name = this.solution_file[0].name;
          // console.log('sol file updated=', resData);
          this.close();
          this.isDisabled = false;
          this.toastr.success('QuestionSet created successfully', 'Success');
        },
        error => {
          console.log(error);
          this.isDisabled = false;
          this.close();
          this.toastr.success('QuestionSet created, But error while uploading files', 'Success');
          if (error.error != null && error.error.detail != null) {
            this.toastr.danger(error.error.detail, 'Error');
          } else {
            this.toastr.danger(error.error, 'Error');
          }
        },
      );
    }else{
      this.isDisabled = false;
      this.close();
      this.toastr.success('QuestionSet created successfully', 'Success');
    }
    
  }

  /**
   * Method used to close the popup window form using windowef property
   */
  close() {
    this.windowRef.close();
  }
}
