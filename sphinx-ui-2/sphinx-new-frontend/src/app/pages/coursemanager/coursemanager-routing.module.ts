import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';


import { CoursemanagerComponent } from './coursemanager.component';
import { RolesComponent } from './roles/roles.component';
import { SectionsComponent } from './sections/sections.component';
import { TopicsComponent } from './topics/topics.component';
import { RoasterComponent } from './roaster/roaster.component';
import { AssignmentmanagerComponent } from '../assignmentmanager/assignmentmanager.component';
import { QuestionComponent } from '../assignmentmanager/question/question.component';
import { InteractiveQuestionSetComponent } from "../assignmentmanager/interactive-question-set/interactive-question-set.component";
import { RubricComponent } from '../assignmentmanager/rubric/rubric.component';
import { EventmanagerComponent } from '../eventmanager/eventmanager.component';
import { MyeventsComponent } from '../myevents/myevents.component';
import { SubmissionmanagerComponent } from '../myevents/submissionmanager/submissionmanager.component';
import { GradeviewmanagerComponent } from '../myevents/gradeviewmanager/gradeviewmanager.component';
import { MaingradeviewComponent } from '../myevents/gradeviewmanager/maingradeview/maingradeview.component';
import { GradingmanagerComponent } from '../myevents/gradingmanager/gradingmanager.component';
import { MaingradeComponent } from '../myevents/gradingmanager/maingrade/maingrade.component';
import { RegradingmanagerComponent } from '../myevents/regradingmanager/regradingmanager.component';
import { MainRegradeComponent } from '../myevents/regradingmanager/main-regrade/main-regrade.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { GradeSubManagementComponent } from '../grade-sub-management/grade-sub-management.component';
import { AdminSubmissionComponent } from '../grade-sub-management/admin-submission/admin-submission.component';
import { AutogradeComponent } from '../myevents/gradingmanager/autograde/autograde.component';
import { InteractiveResponseManagerComponent } from "../myevents/interactive-response-manager/interactive-response-manager.component";
import { MaingradeInteractiveManagerComponent } from '../myevents/gradingmanager/maingrade-interactive-manager/maingrade-interactive-manager.component';
import { ImpersonatedActionsComponentComponent } from "./impersonated-actions-component/impersonated-actions-component.component";
const routes: Routes = [{
  path: '',
  component: CoursemanagerComponent,
  children: [
    {
      path: '',
      redirectTo: 'myevents',
      pathMatch: 'full',
    },
    {
      path: 'roles',
      component: RolesComponent,
    },
    {
      path: 'sections',
      component: SectionsComponent,
    },
    {
      path: 'topics',
      component: TopicsComponent,
    },

    {
      path: 'roster',
      component: RoasterComponent,
    },
    {
      path: 'unauthorized',
      component: UnauthorizedComponent,
    },
    {
      path: 'admin',
      children: [
        {
          path: '',
          component: GradeSubManagementComponent,
        },
        {
          path: 'submission',
          component: AdminSubmissionComponent,
        },
      ],
    },
    {
      path: 'assignment',
      children: [
            {
              path: '',
              component: AssignmentmanagerComponent,
            },
            {
              path: 'question',
              component: QuestionComponent,
            },
            {
              path: 'interactive-question-set',
              component: InteractiveQuestionSetComponent, 
            },
            {
              path: 'rubrics',
              component: RubricComponent,
            },
          ],
    },
    {
      path: 'impersonatedaction',
      component: ImpersonatedActionsComponentComponent,
    },
    {
      path: 'events',
      component: EventmanagerComponent,
    },
    {
      path: 'myevents',
      children: [
        {
          path: '',
          component: MyeventsComponent,
        },
        {
          path: 'submission',
          component: SubmissionmanagerComponent,
        },
        {
          path: 'interactive-submission',
          component: InteractiveResponseManagerComponent,
        },
        {
          path: 'gradeView',
          children: [
            {
              path: '',
              component: GradeviewmanagerComponent,
            },
            {
              path: 'main',
              component: MaingradeviewComponent,
            },
          ],
        },
        {
          path: 'gradingManager',
          children: [
            {
              path: '',
              component: GradingmanagerComponent,
            },
            {
              path: 'mainGrade',
              component: MaingradeComponent,
            },
            {
              path: 'mainGrade-interactive-mode',
              component: MaingradeInteractiveManagerComponent
            },
            {
              path: 'autoGrade',
              component: AutogradeComponent,
            },
          ],
        },
        {
          path: 'regradingManager',
          children: [
            {
              path: '',
              component: RegradingmanagerComponent,
            },
            {
              path: 'mainRegrade',
              component: MainRegradeComponent,
            },
          ],
        },
      ],
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CourseManagerRoutingModule {
}
