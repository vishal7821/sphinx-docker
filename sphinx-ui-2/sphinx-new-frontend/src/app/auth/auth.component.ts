import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Component act as middleware before loading the authentication page components like login, logout and reset password. The middleware fetches CSRF token from server and makes it available for further authentication requests. Component Provides APIs for CSRF token management
 */
@Component({
  selector: 'auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {

  /**
   * Initializes authentication service variable
   * @param authService instance variable of Authentication Service
   */
  constructor(private authService: AuthService) { }

  /**
   * fetch and update current CSRF token on component initialization
   */
  ngOnInit() {
    this.updatecsrf();
  }

  /**
   * fetch CSRF token from Backend using Authentication service
   *  and save token in variable csrfData such that it can be used for POST, PUT, DELETE API requests
   */
  updatecsrf() {
    this.authService.getCSRFToken();
  }

}
