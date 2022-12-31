import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { NgForm } from '@angular/forms';


/**
 * ResetPassword component provides a tabular view which contains two forms.
 *  The password reset token request form takes username input, if the username is valid then the corresponding user receives the password reset token on registered email.
 *  The view uses external Nebular library components like tabs, alert, input fields, and loading spinner.
 * 
 * The component provides properties and APIs to request reset token and submit a password reset request to the application server.
 */
@Component({
  selector: 'resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.scss'],
})
export class ResetpasswordComponent implements OnInit {

  /**
   * The structure stores error message and error state of a user-entered username on receiving a server response
   */
  username = {
    isError: false,
    errorMsg: 'Username is required!',
  };

  /**
   * Boolean flag used to avoid same multiple password reset token request to application server
   */
  isResetLoading = false;
  /**
   * Boolean flag used to avoid same multiple password reset request to the application server
   */
  isLoading = false;
  /**
   * holds server response error message
   */
  error: string;
  /**
   * Constructor method used to inject the services Authentication service, Router, Nebular Toastr service to component
   * @param authService Authentication service object
   * @param router Angular Router object
   * @param toastr Nebular Toastr Service object
   */
  constructor(private authService: AuthService, private router: Router, private toastr: NbToastrService) { }


  /**
   * The empty component lifecycle hook, added for future use
   */
  ngOnInit() {
  }


  /**
   * The method makes a password reset token request to the application server by providing a user-provided username.
   *  If a user-provided username is incorrect, component properties username and error are set appropriately using server error response
   * @param form user-submitted form data for a password reset token
   */
  resetPassword(form: NgForm) {
    this.isResetLoading = true;
    this.username.isError = false;
    this.authService.resetPassword(form.value.username1).subscribe(
      resData => {
        this.toastr.show(resData.detail, 'Reset Token Mail');
        this.isResetLoading = false;
      },
      error => {
        console.log(error);
        this.username.errorMsg = error;
        this.username.isError = true;
        this.isResetLoading = false;
      },
    );
    //  this.isResetLoading=false;

  }

  /**
   * Validate that user-provided new password and confirm password must be identical, else display an error message.
   *  On successful validation, the method makes a server API request to reset user password using confirmResetPassword API of service.
   *  On a successful password reset, the method redirects the user to the login page by displaying success notification.
   *  If the user-provided username or password reset token is invalid, component error property set appropriately using server error response
   * @param form user-submitted form data for a password reset. Contains username, new password, confirm password and password reset token
   */
  onSubmit(form: NgForm) {
    if (form.value.password1 !== form.value.password2) {
      this.error = 'New passowrd and Confirm password must be same.';
      return;
    }
    this.isLoading = true;
    // this.updatecsrf();
    console.log(form.value);
    this.authService.confirmResetPassword(form.value.username, form.value.password1, form.value.password2, form.value.resettoken)
      .subscribe(
        response => {
          this.toastr.show('Password is updated successfully.', 'Password Reset Notification');
          this.router.navigate(['/auth', 'login']);
          console.log(response);
        },
        error => {
          this.error = error;
          console.log(error);
        });
    form.reset();

    this.isLoading = false;
  }

}
