import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

/**
 * Logout component provides the functionality to call an server logout API, then update user state and session information according to server response
 */
@Component({
  selector: 'logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {

  /**
   * Constructor method used to inject the services Authentication service, Router, Nebular Toastr service to component
   * @param authService Authentication service object
   * @param router Angular Router object
   * @param toastr Nebular Toastr Service object
   */
  constructor(private authService: AuthService , private router: Router , private toastr: NbToastrService) {}

  /**
   * On component initialization, method calls the server logout API using Authentication Service method. On receiving a successful response from the server, method clears user state and session information from local storage and redirects the user to application login page

   */
  ngOnInit() {
    this.authService.logout().subscribe(
      response => {
        // this.authService.user.next(null);
        // this.authService.courses.next(null);
        localStorage.clear();
        // console.log(response);
        this.toastr.show('','You have successfully logged out!');
        this.router.navigate(['/auth', 'login']);

      },
      error => {
        // this.toastr.show(error);
        console.log(error);
      });

  }

}
