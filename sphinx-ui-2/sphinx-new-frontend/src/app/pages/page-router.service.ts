import { Injectable } from '@angular/core';
import { Router } from '@angular/router';


@Injectable({ providedIn: 'root' })
export class PageRouterService {
    gotoImpersonatedDashboard() {
        this.router.navigate(['/pages','course', 'impersonatedaction']);
    }

    constructor(
        private router: Router) {
    }

    gotoLogin() {
        this.router.navigate(['/auth', 'login']);
    }

    gotoCourse() {
        this.router.navigate(['/pages', 'course']);
    }

    gotoTopics() {
        this.router.navigate(['/pages', 'course', 'topics']);
    }
    gotoCourseRoles() {
        this.router.navigate(['/pages', 'course', 'roles']);
    }

    gotoCourseSections() {
        this.router.navigate(['/pages', 'course', 'sections']);
    }

    gotoCourseRoaster() {
        this.router.navigate(['/pages', 'course', 'roster']);
    }

    gotoAssignmentManager() {
        this.router.navigate(['/pages', 'course', 'assignment']);
    }

    gotoQuestionManager() {
        this.router.navigate(['/pages', 'course', 'assignment', 'question']);
    }

    gotoInteractiveQuestionManager() {
        this.router.navigate(['/pages','course','assignment','interactive-question-set'])
    }

    gotoRubricManager() {
        this.router.navigate(['/pages', 'course', 'assignment', 'rubrics']);
    }

    gotoEventManager() {
        this.router.navigate(['/pages', 'course', 'events']);
    }

    gotoMyEvents() {
        this.router.navigate(['/pages', 'course', 'myevents']);
    }

    gotoInteractiveSubmissionManager() {
        this.router.navigate(['/pages', 'course', 'myevents', 'interactive-submission']);
    }

    gotoSubmissionManager() {
        this.router.navigate(['/pages', 'course', 'myevents', 'submission']);
    }

    gotoGradeViewManager() {
        this.router.navigate(['/pages', 'course', 'myevents', 'gradeView']);
    }

    gotoGradeViewMain() {
        this.router.navigate(['/pages', 'course', 'myevents', 'gradeView', 'main']);
    }

    gotoGradingManager() {
        this.router.navigate(['/pages', 'course', 'myevents', 'gradingManager']);
    }

    gotoInteractiveGradingMain() {
        this.router.navigate(['/pages', 'course', 'myevents', 'gradingManager', 'mainGrade-interactive-mode']);
    }

    gotoGradingMain() {
        this.router.navigate(['/pages', 'course', 'myevents', 'gradingManager', 'mainGrade']);
    }
    gotoAutoGrading() {
        this.router.navigate(['/pages', 'course', 'myevents', 'gradingManager', 'autoGrade']);
    }

    gotoReGradingManager() {
        this.router.navigate(['/pages', 'course', 'myevents', 'regradingManager']);
    }

    gotoReGradingMain() {
        this.router.navigate(['/pages', 'course', 'myevents', 'regradingManager', 'mainRegrade']);
    }

    gotoUnauthorized() {
        this.router.navigate(['/pages', 'course', 'unauthorized']);
    }

    gotoProfileManager() {
        this.router.navigate(['/pages', 'profile']);
    }

    gotoGradeSubManagement() {
        this.router.navigate(['/pages', 'course', 'management']);
    }
    gotoAdminSubmission() {
        this.router.navigate(['/pages', 'course', 'admin','submission']);
    }
}
