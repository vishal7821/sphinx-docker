import { Component, OnInit } from '@angular/core';
import { User } from '../../auth/auth.model';
import { AuthService } from '../../auth/auth.service';
import { ProfilemanagerService } from './profilemanager.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'profilemanager',
  templateUrl: './profilemanager.component.html',
  styleUrls: ['./profilemanager.component.scss'],
})
export class ProfilemanagerComponent implements OnInit {

  user_data: User;
  current_password: string = '';
  new_password: string = '';
  retype_password: string = '';

  constructor(private authService: AuthService, private profileManagerService: ProfilemanagerService, private toastr: NbToastrService) { }

  ngOnInit() {
    this.authService.setaccount().subscribe(resdata => {
      this.user_data = JSON.parse(localStorage.getItem('user'));
      console.log(this.user_data);
    });

    this.current_password = '';
    this.new_password = '';
    this.retype_password = '';
  }


  onUpdate() {
    this.profileManagerService.updateProfileDetails(this.user_data).subscribe(
      resData => {
        console.log(resData);
        this.toastr.success('Profile details updated successfully', 'Success');
      },
      error => {
        console.log(error);
        if (error != null && error.error != null && error.error.email != null)
          this.toastr.danger(error.error.email, 'Error');

      },
    );
  }

  onUpdatePassword(){
    if(this.new_password != this.retype_password){
      this.toastr.danger('New password and Re-type password does not match', 'Error');
      return;
    }
    this.profileManagerService.updatePassword(this.current_password,this.new_password,this.retype_password).subscribe(
      resData=> {
        this.toastr.success('Password updated successfully', 'Success');
      },
      error => {
        console.log(error);
        if (error != null && error.error != null && error.error.detail != null)
          this.toastr.danger(error.error.detail, 'Error');

        if (error != null && error.error != null && error.error.old_password != null)
          this.toastr.danger('Please enter correct current password', 'Error');

        if (error != null && error.error != null && error.error.new_password_1 != null)
          this.toastr.danger('New Password: '+ error.error.new_password_1[0], 'Error');

        if (error != null && error.error != null && error.error.new_password_2 != null)
          this.toastr.danger('Re-type Password: '+ error.error.new_password_1[0], 'Error');
      },
    );

  }

}
