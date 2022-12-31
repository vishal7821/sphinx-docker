import { Component, OnInit, OnDestroy } from '@angular/core';
import { MENU_ITEMS } from '../pages-menu';
import { NbMenuItem } from '@nebular/theme';
import { RoleMenuItems } from '../../Shared/constants';
import { CourseManagerService } from './coursemanager.service';
import { Course } from '../../auth/auth.model';

/**
 * After user course selection from the sphinx dashboard,
 *  CoursemanagerComponent acts as middleware before displaying a Course-specific view to user.
 *  The main responsibility of middleware is filtering out action item links from the side menu.
 *  So middleware filters action item links based on the role assigned to the user in the corresponding selected course
 *  
 */
@Component({
  selector: 'coursemanager',
  templateUrl: './coursemanager.component.html',
  styleUrls: ['./coursemanager.component.scss'],
})
export class CoursemanagerComponent implements OnInit, OnDestroy {

  /**
   * The frontend permission map representing the user allowed course-specific functionalities.
   *  The map contains key-value pair where the key is action item from side menu
   *  and value is a boolean flag representing availability of the action item for the user
   */
  frontend_perm_map = new Map();

  /**
   * The component constructor initializes Course manager service object
   * @param cmService an instance variable of CourseManager Service
   */
  constructor(
    public cmService: CourseManagerService,
  ) { }

  /**
   * The component Lifecycle hook gets called every time on component initialization.
   *  This method initializes user permission map for component view, makes a call to set the
   *  user permissions and update side menu action items for the corresponding user-selected course
   */
  ngOnInit() {
    this.frontend_perm_map = new Map();
    this.setCoursePermissions();
  }


  /**
   * The component lifecycle hook gets called before destroying the component.
   *  This method makes the call to remove user assigned permissions in the component.
   *  Then method update the side-menu action items in a view for
   *  the corresponding user-selected course
   */
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.removeCourseFeatures();
  }

  /**
   * The setCoursePermissions method process the allowed action list of the selected course
   *  then sets the user permission map for frontend capabilities. The allowed action list
   *  is the binary string representing the user allowed server APIs in the corresponding course.
   *  After setting the user permission map,
   *  Method makes a call to update side menu action items in a user application view
   */
  setCoursePermissions() {
    const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
    this.frontend_perm_map.set('course_manager', false); // 2
    this.frontend_perm_map.set('assign_manager', false); // 18
    this.frontend_perm_map.set('event_manager', false); // 46
    this.frontend_perm_map.set('my_events', false); // 45
    this.frontend_perm_map.set('course_mngmt', false); // 67
    this.frontend_perm_map.set('masq_actions', false); // 80

    if (selectedCourse.actionlist.length > 80) {
      if (selectedCourse.actionlist[2] == '1') {
        this.frontend_perm_map.set('course_manager', true);
      }
      if (selectedCourse.actionlist[18] == '1') {
        this.frontend_perm_map.set('assign_manager', true);
      }
      if (selectedCourse.actionlist[46] == '1') {
        this.frontend_perm_map.set('event_manager', true);
      }
      if (selectedCourse.actionlist[45] == '1') {
        this.frontend_perm_map.set('my_events', true);
      }
      if (selectedCourse.actionlist[67] == '1') {
        this.frontend_perm_map.set('course_mngmt', true);
      }
      if (selectedCourse.actionlist[80] == '1') {
        this.frontend_perm_map.set('masq_actions', true);
      }
    }
    this.setCourseFeatures();
  }

  /**
   * removeCourseFeatures method removes
   *  the course-specific action items from the side menu and updates the user application view
   */
  removeCourseFeatures() {
    for (let i = 0; i < this.cmService.allowed_mi_cnt; i++) {
      MENU_ITEMS.pop();
    }
    this.cmService.allowed_mi_cnt = 0;
  }

  /**
   * The setCourseFeatures method adds the course-specific action items
   *  to the side menu using the user permission map, then updates the user application view
   */
  setCourseFeatures() {
    this.cmService.allowed_mi_cnt = 0;
    MENU_ITEMS.push(RoleMenuItems.cfeatures_title);
    this.cmService.allowed_mi_cnt += 1;
    if (this.frontend_perm_map.get('course_manager')) {
      MENU_ITEMS.push(RoleMenuItems.course_manager);
      this.cmService.allowed_mi_cnt += 1;
    }
    if (this.frontend_perm_map.get('assign_manager')) {
      MENU_ITEMS.push(RoleMenuItems.assign_manager);
      this.cmService.allowed_mi_cnt += 1;
    }
    if (this.frontend_perm_map.get('event_manager')) {
      MENU_ITEMS.push(RoleMenuItems.event_manager);
      this.cmService.allowed_mi_cnt += 1;
    }
    if (this.frontend_perm_map.get('my_events')) {
      MENU_ITEMS.push(RoleMenuItems.my_events);
      this.cmService.allowed_mi_cnt += 1;
    }
    if (this.frontend_perm_map.get('course_mngmt')) {
      MENU_ITEMS.push(RoleMenuItems.grade_sub_mgmnt);
      this.cmService.allowed_mi_cnt += 1;
    }
     if (this.frontend_perm_map.get('masq_actions')) {
       MENU_ITEMS.push(RoleMenuItems.masquaraded_actions);
       this.cmService.allowed_mi_cnt += 1;
    }
  }

}
