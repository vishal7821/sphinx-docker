import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CoursesComponent } from './courses/courses.component';
import { ProfilemanagerComponent } from './profilemanager/profilemanager.component';
import { InteractiveQuestionSetComponent } from "../pages/assignmentmanager/interactive-question-set/interactive-question-set.component";
import {AuthGuard} from '.././helper/auth.guard';
const routes: Routes = [{
  path: '',
  component: PagesComponent,
  canActivate: [AuthGuard],
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'courses',
      component: CoursesComponent,
    },
    {
      path: 'profile',
      component: ProfilemanagerComponent,
    },
    /*{
      path: 'course/assignment/interactive-question-set',
      component: InteractiveQuestionSetComponent
    },*/
    {
      path: 'course',
      loadChildren: () => import('./coursemanager/coursemanager.module')
        .then(m => m.CourseManagerModule),
    },
    {
      path: '',
      redirectTo: 'courses',
      pathMatch: 'full',
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
