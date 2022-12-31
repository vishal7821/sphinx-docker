import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuthRoutingModule } from './auth-routing.module';
 import { NbAuthModule } from '@nebular/auth';
import {
  NbAlertModule,
  NbButtonModule,
  NbCheckboxModule,
  NbInputModule,
  NbSpinnerModule,
  // NbLayoutModule,
  NbCardModule,
  NbTabsetModule,
} from '@nebular/theme';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { LoadingSpinnerComponent } from '../Shared/loading-spinner/loading-spinner.component';
import { LogoutComponent } from './logout/logout.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { NotFoundComponent } from './not-found/not-found.component';
// import { LoginComponent } from './login/login.component';

/**
 * The feature module provides a set of functionalities like user authentication, user session management, CSRF token management.
 *  The module takes care of user authentication by mainly including login, logout, reset password capabilities.
 *  The user session management is implemented using browser local storage such that data is persisted until user clears browser cache.
 *  Authentication Module also provides the route guard that’s used to prevent an unauthenticated user from accessing restricted routes.
 *  The module containing Interceptor intercepts all the server API requests and adds necessary token headers before sending it to the application server. 
 * Module containing components, service provider, models are listed below in great detail
 * 
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NbAuthModule,
    NbSpinnerModule,
    NbTabsetModule,
    // NbLayoutModule,
    NbCardModule,
    NbAlertModule,
    NbInputModule,
    NbButtonModule,
    NbCheckboxModule,
    AuthRoutingModule,
  ],
  declarations: [
    // ... here goes our new components
    AuthComponent,
    LoginComponent,
    LoadingSpinnerComponent,
    LogoutComponent,
    ResetpasswordComponent,
    NotFoundComponent,
  ],
})
export class AuthModule { }
