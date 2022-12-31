import { Component, OnInit } from '@angular/core';
import { NbWindowRef, NbToastrService } from '@nebular/theme';
import { AssignmentManagerService } from '../assignmentmanager.service';
import { Assignment } from '../assignmentmanager.model';



/**
 * AssignmentForm component provides the capabilities to add/edit assignment in the Course.
 * 
 * AssignmentForm view provides popup window form to create/edit an assignment in the Course as per respective user action. 
 * 
 * AssignmentForm component contains properties and method API's to perform frontend application logic for Assignment operations in the Course.
 *  method API's of component provide functionalities like  create/edit assignment to course by calling necessary service API methods
 * 
 */
@Component({
  selector: 'ngx-assignment-form',
  templateUrl: './assignment-form.component.html',
  styleUrls: ['./assignment-form.component.scss'],
})
export class AssignmentFormComponent implements OnInit {

/**
 * Boolean flag used to set edit mode in view
 */
  public isEdit: boolean = false;
  /**
   * List index of user selected assignment to edit from list of Assignments
   */
  public editIdx: number = -1;
  /**
   * Assignment object used to hold form data
   */
  public assign: Assignment = new Assignment(null, null, null, null, [], false);
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
    if (this.windowRef.config.title === 'Edit Assignment') {
      this.isEdit = true;
      this.editIdx = this.assignManagerService.assignEdit;
      // console.log(this.editIdx);
      this.assign = this.assignManagerService.assignData.value[this.editIdx];
      // console.log(this.assign);
    }
  }


  /**
   * When user submits the form, view triggers the call this method which finds the form mode edit/create and call the respective method to perform action
   */
  onSubmit() {
    if (this.isEdit) {
      this.editAssignment();
    } else {
      this.createAssignment();
    }
  }

  /**
   * Method takes the form data from view, validate the assignment name and shows an error message if user input is invalid.
   * After suucessful validation of user input, method makes backend server request using service api method editAssignment.
   * Once the assignment data updated successfully at server, method updates the assignment data in view using service api sendAssignData
   */
  editAssignment() {
    console.log('edit', this.assign);
    if (this.assign.name == null || this.assign.name === '') {
      this.toastr.danger('Please enter Assignment name', 'Error');
      return;
    }
    this.assignManagerService.editAssignment(this.assign).subscribe(
      resData => {
        const assignList = this.assignManagerService.assignData.value;
        assignList[this.editIdx] = this.assign;
        this.assignManagerService.sendAssignData(assignList);
        this.toastr.success('Assignment details updated successfully', 'Success');
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
   * Method takes the form data from view, validate the assignment name and shows an error message if user input is invalid.
   * After suucessful validation of user input, method makes backend server request using service api method addAssignment.
   * Once the assignment data added successfully at server, method updates the assignment list in view using service api sendAssignData
   */
  createAssignment() {
    console.log(this.assign.name);
    console.log(this.assign.description);
    if (this.assign.name == null || this.assign.name == '') {
      this.toastr.danger('Please enter Assignment name', 'Error');
      return;
    }

    // let assignList = this.assignManagerService.assignData.value;
    // console.log(assignList.length);
    this.assignManagerService.addAssignment(this.assign).subscribe(
      resData => {
        console.log(resData);
        let assignList: Assignment[] = [];
        assignList = this.assignManagerService.assignData.value;
        console.log(assignList);
        this.assign.id = assignList.length + 1;
        this.assign.main_id = resData.assignment.id;
        assignList.push(this.assign);
        this.assignManagerService.sendAssignData(assignList);
        this.toastr.success('Assignment created successfully', 'Success');
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
   * Method used to close the popup window form using windowef property
   */
  close() {
    this.windowRef.close();
  }
}
