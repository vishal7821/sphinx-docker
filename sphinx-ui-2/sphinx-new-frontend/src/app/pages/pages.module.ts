import { NgModule } from '@angular/core';
import {  NbLayoutModule, NbWindowModule, NbCardModule, NbInputModule, NbButtonModule, NbTabsetModule, NbIconModule } from '@nebular/theme';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagesRoutingModule } from './pages-routing.module';
import { NbMenuModule } from '@nebular/theme';
import { ThemeModule } from '../@theme/theme.module';
import { CoursesModule } from './courses/course.module';
import { CourseManagerModule } from './coursemanager/coursemanager.module';
import { AssignmentManagerModule } from './assignmentmanager/assignmentmanager.module';
import { EventManagerModule } from './eventmanager/eventmanager.module';
import { MyEventsModule } from './myevents/myevents.module';
import { ProfilemanagerComponent } from './profilemanager/profilemanager.component';
import { FormsModule } from '@angular/forms';
import { GradeSubManagementComponent } from './grade-sub-management/grade-sub-management.component';


@NgModule({
  imports: [
    ThemeModule,
    NbMenuModule,
    PagesRoutingModule,
    NbLayoutModule,
    DashboardModule,
    CoursesModule,
    CourseManagerModule,
    AssignmentManagerModule,
    EventManagerModule,
    MyEventsModule,
    NbCardModule,
    FormsModule,
    NbInputModule,
    NbButtonModule,
    NbTabsetModule,
    NbIconModule,
    NbWindowModule.forRoot(),
  ],
  declarations: [
    PagesComponent,
    ProfilemanagerComponent,
  ],
})
export class PagesModule {
}
