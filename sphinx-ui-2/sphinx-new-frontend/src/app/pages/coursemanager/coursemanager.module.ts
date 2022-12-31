import { NgModule } from '@angular/core';
import {
  NbLayoutModule, NbCardModule, NbIconModule, NbInputModule,
  NbActionsModule,
  NbButtonModule,
  NbCheckboxModule,
  NbRadioModule,
  NbSelectModule,
  NbWindowModule,
  NbListModule,
  NbAlertModule,
  NbSpinnerModule,
  NbAccordionModule,
  NbProgressBarModule,
 } from '@nebular/theme';
import { CourseManagerRoutingModule } from './coursemanager-routing.module';
import { NbMenuModule } from '@nebular/theme';
import { ThemeModule } from '../../@theme/theme.module';
import { CoursemanagerComponent } from './coursemanager.component';
import { RolesComponent } from './roles/roles.component';
import { SectionsComponent } from './sections/sections.component';
import { TopicsComponent } from './topics/topics.component';
import { RoasterComponent } from './roaster/roaster.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoasterFormComponent } from './roaster/roaster-form/roaster-form.component';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { AssignmentManagerModule } from '../assignmentmanager/assignmentmanager.module';
import { EventManagerModule } from '../eventmanager/eventmanager.module';
import { MyEventsModule } from '../myevents/myevents.module';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { GradeSubManagementModule } from '../grade-sub-management/grade-sub-management.module';
import { InteractiveQuestionSetComponent } from "../assignmentmanager/interactive-question-set/interactive-question-set.component";
import { ImpersonatedActionsComponentComponent } from './impersonated-actions-component/impersonated-actions-component.component';

/**
 * Managing course-related things is an important aspect of an online course management platform.
 *  Sphinx provides various capabilities to manage course-related things through
 *  the Course Manager Module. The capabilities provided by Sphinx are listed below
 * 
 * 1.View and edit Course information like course name, course title, course directory
 *  to store course data
 * 
 * 2.Course Section management - allows various operation on course sections like create,
 *  view, edit, delete sections
 * 
 * 3.Course Topic management - allows various operation on course topics like create,
 *  view, edit, delete topics, allows user to create tree hierarchy of topics by
 *  mentioning parent topic
 * 
 * 4.Course Role management - allows user to create new role using various combination
 *  of meta roles, where each meta role provides set of functionalities to perform over platform.
 *  The module also provides capabilities to view, edit, delete existing roles
 * 
 * 5.Course Roster - allows to enroll new users to course, also provides
 *  capabilities like view enrolled user list, change a user's enrolled section or role, delete existing enrolled users

 */
@NgModule({
  imports: [
    NbCardModule,
    NbAlertModule,
    NbIconModule,
    NbInputModule,
    ThemeModule,
    NbMenuModule,
    CourseManagerRoutingModule,
    NbLayoutModule,
    Ng2SmartTableModule,
    NbActionsModule,
    NbButtonModule,
    NbCheckboxModule,
    NbRadioModule,
    NbSelectModule,
    CommonModule,
    FormsModule,
    NbListModule,
    NbWindowModule.forChild(),
    FileUploadModule,
    AssignmentManagerModule,
    EventManagerModule,
    MyEventsModule,
    GradeSubManagementModule,
    NbSpinnerModule,
    NbAccordionModule,
    NbProgressBarModule,
  ],
  declarations: [
    CoursemanagerComponent,
    RolesComponent,
    SectionsComponent,
    TopicsComponent,
    RoasterComponent,
    RoasterFormComponent,
    UnauthorizedComponent,
    ImpersonatedActionsComponentComponent,
  ],
  entryComponents: [
    RoasterFormComponent,
    InteractiveQuestionSetComponent,
  ],
})
export class CourseManagerModule {
}
