import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Course } from '../../auth/auth.model';
import { PageRouterService } from '../page-router.service';

@Component({
  selector: 'courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
})
export class CoursesComponent implements OnInit {

  RoleCourseMap = new Map();
  username: string;

  constructor( private authService: AuthService, private pageRouter: PageRouterService ) {

    this.authService.setaccount().subscribe(resdata => {
      this.RoleCourseMap = new Map(JSON.parse(localStorage.myMap));
    });
    // console.log('role course map='+this.RoleCourseMap);
    // this.RoleCourseMap = this.authService.roleCourseMap;
  }

  ngOnInit() {
    // this.username = JSON.parse(localStorage.getItem("user")).firstname;
  }

  selectCourse(selectedCourse: Course) {
    console.log('course id=' + selectedCourse.coursename);
    localStorage.setItem('selectedCourse', JSON.stringify(selectedCourse));
    // this.router.navigate(['/pages', 'course']);
    this.pageRouter.gotoCourse();
  }


}
