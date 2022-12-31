import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { CourseManagerService } from '../coursemanager.service';
import { NbToastrService } from '@nebular/theme';
// import { RoasterFormComponent } from './roaster-form/roaster-form.component';
import { RoasterService } from './roaster.service';
import { Enrollment, CourseRole } from '../coursemanager.model';


/**
 * The Roster Component provides all necessary capabilities to perform Course Roster management
 * 
 * Roster View mainly contains file dropzone at the top of the page and after that course
 *  enrollment view is displayed. Roster View provides the way to add new enrollments to
 *  the course using the CSV file. To upload a file, The component uses the ngx-file-upload
 *  library.
 * 
 * Roster Component contains the necessary properties and API methods to perform all
 *  roster management operations like view/add/edit/delete course enrollments.
 *  On Edit mode, The component gives way to edit user assigned role and section.
 *  The API methods mainly handle the user-triggered events, process the corresponding
 *  enrollment data and make calls to appropriate methods of roster manager service.
 * 
 * The Roster manager Service provides the necessary API methods which do all server
 * communication to perform necessary modifications for Course Enrollments at the
 * application database.
 */
@Component({
  selector: 'roaster',
  templateUrl: './roaster.component.html',
  styleUrls: ['./roaster.component.scss'],
})
export class RoasterComponent implements OnInit {

  /**
   * boolean flag used to show loading icon in view
   */
  isLoading = false;
  /**
   * list contains all existing Course Enrollments
   */
  enrollments: Enrollment[] = [];
  /**
   * list contains all existing Course Roles
   */
  course_roles: CourseRole[] = [];
  /**
   * list contains all existing Course Sections
   */
  course_sections: any[] = [];
  /**
   * boolean flag used to disable action button to prevent multiple duplicate operation requests.
   */
  isDisabled: boolean = false;
  /**
   * constructor method used to intialize service objects of CourseManagerService, RoasterService, Nebular toastr Service
   * @param cmService CourseManagerService object
   * @param roasterService RoasterService object
   * @param toastr  object of Nebular toastr Service 
   */
  constructor(private cmService: CourseManagerService, private roasterService: RoasterService, private toastr: NbToastrService,
  ) {
  }
  /**
   * The component lifecycle hook method used to fetch Course Enrollments, Roles, Sections data from server
   */
  ngOnInit() {
    this.fetchEnrollments();
    this.fetchRoles();
    this.fetchSections();
  }

  
  /**
   * method fetches existing course enrollment data from the server using service API
   *  fetchEnrollments. On receiving a successful response from the server, method loads 
   * enrollment data from local storage to the component property enrollments

   */
  fetchEnrollments() {
    this.roasterService.fetchEnrollments().subscribe(resData => {
      const data = JSON.parse(localStorage.getItem('enrollments') || '[]');
      // console.log('this.Enrollments=', data);
      this.enrollments = data;
    });
  }


  /**
   * Method fetches existing course role data using service API fetchCourseRoles. On receiving
   *  a successful response from the server, the method sets component property course_roles
   */
  fetchRoles() {
    this.cmService.fetchCourseRoles().subscribe(
      resData => {
        this.course_roles = resData;
      },
      error => {
        console.log(error);
      },
    );
  }


  /**
   * fetchSections Method fetch existing Course Section data using service api fetchSections. On successful retrival of data, method sets component property course_sections
   */
  fetchSections() {
    this.cmService.fetchSections().subscribe(resData => {
      const data = JSON.parse(localStorage.getItem('sections') || '[]');
      // console.log('this.Enrollments=', data);
      this.course_sections = data;
    });
  }

  /**
   * list variable used to bind user input CSV file from dropzone
   */
  public uploadedFiles: Array<File> = [];

  /**
   * The method sets the component property uploadedFiles to an empty list
   */
  public clear(): void {
    this.uploadedFiles = [];
  }

/**
 * The AddEnrollments method takes user input CSV file from view using property uploadedFiles,
 *  validates the file and shows an appropriate error message if an error occurs.
 *  If the input file is valid, the method calls the service method to add enrollments
 *  to the course database. On receiving a success response from the server,
 *  the method updates the course enrollment list in the view.
 */
  AddEnrollments() {

    console.log('file array len=', this.uploadedFiles.length);
    if (this.uploadedFiles.length == 0) {
      this.toastr.danger('Please upload valid CSV file', 'Error');
      return;
    }
    if (this.uploadedFiles.length > 1) {
      this.toastr.danger('Upload only one CSV file', 'Error');
      return;
    }
    const file: File = this.uploadedFiles[0];
    const filename = file.name;
    const ext = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
    if (ext != 'csv') {
      this.toastr.danger('Please upload valid file', 'Error');
      this.uploadedFiles = [];
      return;
    }

    this.isLoading = true;
    this.roasterService.addEnrollments(this.uploadedFiles[0]).subscribe(
      resData => {
        console.log('enrollment added =>', resData);
        this.fetchEnrollments();
        this.toastr.success('Enrollments added successfully', 'Success');
      },
      error => {
        console.log('aaaaaaaaaaaaaaaaa');
        // this.toastr.danger(error.error.detail,'Error');
        console.log('error =>', error);
        this.uploadedFiles = [];
      },
    );
    this.isLoading = false;
  }

  /**
   * Enrollment object used to bind enrollment edit form data
   */
  edit_enroll: Enrollment = null;
  /**
   * boolean flag used to toggle eonrollment edit form
   */
  openEditForm: boolean = false;
  
 /**
   * method toggles the enrollment edit form in view by inverting value of component property openEditForm
   */
  toggleEditEnrollForm() {
    this.openEditForm = !this.openEditForm;
  }

  /**
   * the method receives the list index of user-selected enrollment
   *  from the course enrollment list. method fetches course role and section data
   *  to show in edit form dropdowns,
   *  Then method shows the edit form with selected enrollment data
   * @param enrollIdx the list index of user-selected role
   */
  onEditEnroll(enrollIdx: number) {
    this.fetchRoles();
    this.fetchSections();
    this.edit_enroll = this.enrollments[enrollIdx];
    this.toggleEditEnrollForm();
  }

    /**
   * The roaster view triggers call to the onEditSubmit method,
   *  once the user clicks edit for some enrollment. the method makes a call to
   *  update selected enrollment using Service API putEnrollment. On receiving a successful
   *  response from the server,
   *  the method updates the list of existing course enrollments in the view
   */
  onEditSubmit() {
    this.roasterService.putEnrollment(this.edit_enroll).subscribe(
      resData => {
        this.fetchEnrollments();
        this.toggleEditEnrollForm();
        this.toastr.success('Enrollment updated successfully', 'Success');
      },
      error => {
        console.log(error);
      },
    );
    console.log(this.edit_enroll);
  }
  /**
   * the method hides the enrollment edit form using component provided method toggleEditEnrollForm
   */
  onEditCancel() {
    this.toggleEditEnrollForm();

  }

  /**
  * The roaster view triggers call to the onDeleteEnroll method, 
  * once the user clicks delete for some enrollment. The method makes a call to
  *  service API delEnrollment which deletes selected enrollment from the server.
  *  On receiving a successful response from Server, the method updates the user list in the view
   * @param enrollIdx the list index of user selected enrollment
   */
  onDeleteEnroll(enrollIdx: number){
    this.roasterService.delEnrollment(this.enrollments[enrollIdx].main_id).subscribe(
      resData => {
        this.toastr.success('Enrollment deleted successfully', 'Success');
        this.fetchEnrollments();
      },
      error => {
        console.log(error);
        this.toastr.danger(error.error, 'Error');

      },
    );
  }

}

// id , username , roll_no , first_name, last_name, email, department, program, courses(list) , role, sections
