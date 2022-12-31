import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
// import { NbLoginComponent } from '@nebular/auth';

/**
 * The login component provides the view and component APIs to perform user login functionality. 
 * The login view uses external Nebular library components like NbAlert, NbInput, and NbButton.
 *  The view contains forgot password link which redirects user to reset password page.
 * 
 * The login component contains properties and method APIs to perform frontend application logic for Users login to the application. component API's provides functionalities which mainly includes fetching CSRF token on view initialization, User login to the application server, Store user account details on successful login.
 */
@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  /**
   * Boolean flag used to disable login button till server respond back to user's login request
   */
  isLoading = false;
  /**
   * Error message representing server error response
   */
  error: string;


  constructor(private authService: AuthService, private router: Router) { }

/**
 * As valid CSRF token required to send with every login server request, Component life cycle hook used to fetch CSRF token on login view initialization
 */
  ngOnInit() {
    this.updatecsrf();
  }

  /**
   * Method fetch CSRF token from the server using getCSRFToken API of authentication service and store in service property for further availability to the interceptor
   */
  updatecsrf() {
    this.authService.getCSRFToken();
  }


  /**
   * The method takes login form data and makes a server API call to log in the user to the application server. On successful login, method redirects user to application dashboard
   * @param form Login form data contains username, password
   */
  onSubmit(form: NgForm) {
    this.isLoading = true;
    // this.updatecsrf();
    console.log(form.value);
    this.authService.login(form.value.username, form.value.password)
      .subscribe(
        response => {
          // this.setAccount();
          console.log(response);
          this.router.navigate(['/pages']);
          this.isLoading = false;
        },
        error => {
          
          this.error = error;
          console.log(error);
          this.isLoading = false;
        });
    form.reset();

    
  }

  /**
   * The method makes a service call to fetch and store user account details to local storage
   */
  setAccount() {
    this.authService.setaccount().subscribe(resdata => {
    });

  }

  /**
   * method redirects user to reset password page
   */
  forgotPassword() {
    this.router.navigate(['/auth', 'resetpassword']);
  }
}
