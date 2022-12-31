import { Component, OnInit } from '@angular/core';
import { CourseManagerService } from '../coursemanager.service';
import { MetaRoles } from '../../../Shared/constants';
import { CourseRole } from '../coursemanager.model';
import { NbIconLibraries, NbToastrService } from '@nebular/theme';


/**
 * The RoleComponent provides the capabilities to perform all Role management operations
 *  in the user-selected Course.
 * 
 * In application backend, the corresponding allowed actions for the role are stored and
 *  used as an action list. The action list is the string consisting of 0’s and 1’s for each
 *  server API. As the user does not understand the binary string of action list,
 *  The Role Component takes care of string processing and provides user understandable
 *  application meta roles. The Component provides method APIs to perform functionalities
 *  on user actions like Add/Edit/Fetch/Delete course roles. The APIs mainly manipulates user
 *  actions, processes the corresponding role data, extracts the action string and makes
 *  calls to the application server using course manager service
 * 
 * The RoleComponent view lists out all existing roles in the course.
 *  The view provides two forms to perform add/edit role actions using an application
 *  provided meta roles. The role edit form initially in a hidden state, will be toggled
 *  once the user clicks on the edit button of any role. The view also lists out all meta
 *  roles and there respective allowed capabilities in detail.
 */
@Component({
  selector: 'roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {

  /**
   * list of action capabiltites allowed to auditor meta role
   */
  auditor_actions: string[] = MetaRoles.auditor_actions;
  /**
   * list of action capabiltites allowed to student meta role
   */
  student_actions: string[] = MetaRoles.student_actions;
  /**
   * list of action capabiltites allowed to grader meta role
   */
  grader_actions: string[] = MetaRoles.grader_actions;
  /**
   * list of action capabiltites allowed to tutor meta role
   */
  tutor_actions: string[] = MetaRoles.tutor_actions;
  /**
   * list of action capabiltites allowed to cadmin meta role
   */
  cadmin_actions: string[] = MetaRoles.cadmin_actions;
  /**
   * list of action capabiltites allowed to instructor meta role
   */
  instructor_actions: string[] = MetaRoles.instructor_actions;

  /**
   * list of meta roles contain id and name for each metarole, used as metarole dropdown data in edit/add role form
   */
  role_actions: any[] = [
    { id: '0', text: 'Auditor' },
    { id: '1', text: 'Student' },
    { id: '2', text: 'Grader' },
    { id: '3', text: 'Tutor' },
    { id: '4', text: 'Course Admin' },
    { id: '5', text: 'Instructor' },
  ];

  /**
   * CourseRole object used for two way data binding in the view form of add new role
   */
  new_role: CourseRole = new CourseRole(-1, -1, '', [], []);

  /**
   * CourseRole object used for two way data binding in the view form of edit an existing role
   */
  edit_role: CourseRole = new CourseRole(-1, -1, '', [], []);

  /**
   * CourseRole list object contains all existing Course Role
   */
  course_roles: CourseRole[] = [];
  /**
   * Boolean flg used to toggle role edit form in view
   */
  isEditForm: boolean = false;

  /**
   * The constructor initializes the required service objects of Course Manager Service,
   *  Toastr Service, and Nebular icon library. As the Icon library does not contain the
   *  ion icon pack in the default configuration, the constructor additionally registers
   *  the ion icon pack.

   * @param cmService CourseManager Service object 
   * @param iconsLibrary Nebular iconsLibrary object 
   * @param toastr Nebular Tostr Service object
   */
  constructor(private cmService: CourseManagerService,
    iconsLibrary: NbIconLibraries,
    private toastr: NbToastrService) {
    iconsLibrary.registerFontPack('ion', { iconClassPrefix: 'ion' });
  }

  /**
   * The component lifecycle hook method used to fetch list of Course Roles on Component initialization
   */
  ngOnInit() {
    this.new_role = new CourseRole(-1, -1, '', [], []);
    this.edit_role = new CourseRole(-1, -1, '', [], []);
    this.fetchRoles();
  }

  /**
   * The method fetches existing Course Role data using service API fetchCourseRoles.
   *  On successful retrieval of data, the method sets component property course_roles
   */
  fetchRoles() {
    this.cmService.fetchCourseRoles().subscribe(
      resData => {
        this.course_roles = resData;
        console.log(resData);
      },
      error => {
        console.log(error);
      },
    );
  }

  /**
   * Once the user clicks Add new role button, view triggers the call to addRole method
   *  of the component. The method takes the data values of the form using component property
   *  new_role. Service API createRole does not understand the term of meta roles and requires
   *  an action list of a new role as a binary bit string. So addRole method extract and
   *  process the list of user-selected meta roles for a new role. Then the method generates
   *  the appropriate action string for the corresponding new role. After generating an action
   *  string of the new role, the method sends a server request to add a new role using Service
   *  API createRole. On receiving a successful response from Server, method updates the list
   *  of course roles in the view

   */
  addRole() {
    console.log(this.new_role);
    const selected_mroles: string[] = [];

    for (let i = 0; i < this.new_role.actions.length; i++) {
      if (this.new_role.actions[i] == '0') {
        selected_mroles.push(this.cmService.auditor);
      } else if (this.new_role.actions[i] == '1') {
        selected_mroles.push(this.cmService.student);
      } else if (this.new_role.actions[i] == '2') {
        selected_mroles.push(this.cmService.grader);
      } else if (this.new_role.actions[i] == '3') {
        selected_mroles.push(this.cmService.tutor);
      } else if (this.new_role.actions[i] == '4') {
        selected_mroles.push(this.cmService.course_admin);
      } else if (this.new_role.actions[i] == '5') {
        selected_mroles.push(this.cmService.instructor);
      }
    }
    let action: string = new Array(this.cmService.auditor.length + 1).join('0');

    for (let i = 0; i < action.length; i++) {
      for (let j = 0; j < selected_mroles.length; j++) {
        if (selected_mroles[j][i] == '1') {
          action = this.replaceAt(action, i, '1');
        }
      }
    }
    // console.log(action);

    this.cmService.createRole(this.new_role.name, action).subscribe(
      resData => {
        this.fetchRoles();
        this.toastr.success('New Course Role added successfully', 'Success');
      },
      error => {
        console.log(error);
        if (error.error != null && error.error.detail != null) {
          this.toastr.danger(error.error.detail, 'Error');
        } else if (error.error != null && error.error.name != null) {
          this.toastr.danger(error.error.name, 'Role Name Error');
        } else {
          this.toastr.danger(error.error, 'Error');
        }
      },
    );

  }
  /**
   * The method replaces the substring of main string object by other string from the given index position
   * @param str Main string to be updated
   * @param index start index from which substring to be replaced
   * @param replacement new substring which should be replaced in main string
   * @returns updated main string
   */
  replaceAt(str: String, index, replacement: string) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
  }

  /**
   * The method makes a server request to delete a user-selected role using a service API
   *  method deleteRole. On receiving a successful response from the server, method refresh
   *  course role list in role view using  property course_roles
   * @param roleIdx the list index of user-selected role from existing course roles 
   */
  onDeleteRole(roleIdx: number) {
    this.cmService.deleteRole(this.course_roles[roleIdx].main_id).subscribe(
      resData => {
        this.fetchRoles();
        this.toastr.success('Role deleted successfully', 'Success');
      },
      error => {
        console.log(error);
        if (error.error != null && error.error.detail != null) {
          this.toastr.danger(error.error.detail, 'Error');
        } else if (error.error != null && error.error.name != null) {
          this.toastr.danger(error.error.name, 'Role Name Error');
        } else {
          this.toastr.danger(error.error, 'Error');
        }
      },
    );
  }

  /**
   * The method displays the edit form and load the user-selected role data to edit
   * @param roleIdx the index of user selected role from list of existing course roles 
   */
  onEditRole(roleIdx: number) {
    this.toggleEditForm();
    this.edit_role = this.course_roles[roleIdx];

  }

  /**
   * method toggles the role edit form in view by inverting value of component property isEditForm
   */
  toggleEditForm() {
    this.isEditForm = !this.isEditForm;
  }

  /**
   * Once the user clicks the submit button on edit role form, view triggers call
   *  to onEditSubmit method of the component. onEditSubmit method takes the data
   *  values of the form using component property edit_role. The application server
   *  does not understand the term of meta roles and requires an updated action list as
   *  a binary bit string. So the method process the list of user-selected meta roles
   *  then generates the appropriate binary bit string for the role. After generating
   *  an action list, the method makes the server API call to update the selected role
   *  using the service method editRole.
   *  On receiving a successful server response, method updates the course role view
   */
  onEditSubmit() {
    console.log(this.edit_role);
    const selected_mroles: string[] = [];

    for (let i = 0; i < this.edit_role.actions.length; i++) {
      if (this.edit_role.actions[i] == '0') {
        selected_mroles.push(this.cmService.auditor);
      } else if (this.edit_role.actions[i] == '1') {
        selected_mroles.push(this.cmService.student);
      } else if (this.edit_role.actions[i] == '2') {
        selected_mroles.push(this.cmService.grader);
      } else if (this.edit_role.actions[i] == '3') {
        selected_mroles.push(this.cmService.tutor);
      } else if (this.edit_role.actions[i] == '4') {
        selected_mroles.push(this.cmService.course_admin);
      } else if (this.edit_role.actions[i] == '5') {
        selected_mroles.push(this.cmService.instructor);
      }
    }
    let action: string = new Array(this.cmService.auditor.length + 1).join('0');

    for (let i = 0; i < action.length; i++) {
      for (let j = 0; j < selected_mroles.length; j++) {
        if (selected_mroles[j][i] == '1') {
          action = this.replaceAt(action, i, '1');
        }
      }
    }
    // console.log(action);

    this.cmService.editRole(this.edit_role, action).subscribe(
      resData => {
        this.fetchRoles();
        this.edit_role = new CourseRole(-1, -1, '', [], []);
        this.toastr.success('Course Role updated successfully', 'Success');
        this.toggleEditForm();
      },
      error => {
        console.log(error);
        if (error.error != null && error.error.detail != null) {
          this.toastr.danger(error.error.detail, 'Error');
        } else if (error.error != null && error.error.name != null) {
          this.toastr.danger(error.error.name, 'Role Name Error');
        } else {
          this.toastr.danger(error.error, 'Error');
        }
      },
    );

  }

}
