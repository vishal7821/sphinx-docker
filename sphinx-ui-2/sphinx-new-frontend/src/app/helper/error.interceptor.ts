import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { PageRouterService } from '../pages/page-router.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthService,private routerService: PageRouterService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const errmsg: string = 'There is no event going on at the moment that permits this action - please contact the instructor if you feel this is an error';
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401 && err.error != null && err.error == 'Requested operation requires login - please login into your account first') {
                // auto logout if 401 response returned from api
                // this.authenticationService.logout();
                console.log(err.error);
                console.log(err);
                // this.authenticationService.showToastr(err.error);
                this.authenticationService.sessionExpire();

            } else if (err.status === 401
                    && err.error.detail != null
                    && err.error.detail == errmsg) {
                this.authenticationService.showToastr(err.error.detail);
                console.log(err.error);
                this.routerService.gotoMyEvents();

            } else if( err.status ==401 ){
                console.log(err);
                this.authenticationService.showToastr(err.error);
                this.routerService.gotoUnauthorized();
            }else if (err.status === 403) {
                // auto logout if 401 response returned from api
                this.authenticationService.showToastr('CSRF token is expired, Please try again');
                this.authenticationService.logout();
                console.log(err.error);
                // this.toastr.primary(err.error);
                // location.reload(true);
                this.authenticationService.getCSRFToken();
                this.routerService.gotoLogin();

            }

            const error = err.error.message || err.statusText;
            return throwError(err);
        }))
    }
}