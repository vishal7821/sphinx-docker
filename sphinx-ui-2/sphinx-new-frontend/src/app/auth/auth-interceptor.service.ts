import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { PageRouterService } from '../pages/page-router.service';


/**
 * An authentication interceptor intercepts API requests made by application
 *  to the backend server. Interceptor adds the CSRF token to POST / PUT / DELETE
 *  requests before they get sent to the server. It is implemented using the HttpInterceptor
 *  class provided by Angular Common module. The custom interceptor is created by the
 *  overriding intercept method of extended HttpInterceptor class. To use interceptor for
 *  every server API request,
 *  it added to the pipeline of providers section of the main app module
 */
@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
/**
   * Constructor method used to inject the services Authentication service, PageRouter Service to component
   * @param authService Authentication service object
   * @param pageRouter PageRouter Service object
   */
  constructor(private authService: AuthService, private pageRouter: PageRouterService) { }

  /**
   * method intercepts the received Http Request, adds the CSRF Token to request Headers before sending it to the application server
   * @param req HttpRequest object
   * @param next HttpRequest Handler object
   */
  intercept(req: HttpRequest<any>, next: HttpHandler) {

    if (req.method != 'GET') {
      const authReq = req.clone({
        headers: new HttpHeaders({
          'CSRF-TOKEN': this.authService.csrfData.csrf_token,
        }),
      });
        // console.log('Intercepted HTTP call', authReq);
      return next.handle(authReq).pipe(
        // catchError((err: any) => {
        //   if (err instanceof HttpErrorResponse) {
        //     if (err.status != null) {
        //       if (err.status == 403) {
        //         console.log('logout');
        //         this.authService.sessionExpire();
        //       } else if (err.error !=null && err.error == 'Unauthorized Access: Please contact Instructor') {
        //         console.log('unauthorized');
        //         this.pageRouter.gotoUnauthorized();
        //       }
        //     }
        //     //log error 
        //   }
        //   return of(err);
        // }),
      );

    }
    return next.handle(req).pipe(
      // catchError((err: any) => {
      //   if (err instanceof HttpErrorResponse) {
      //     if (err.status != null) {
      //       if (err.status == 403) {
      //         console.log('logout');
      //         this.authService.sessionExpire();
      //       } else if (err.error !=null && err.error == 'Unauthorized Access: Please contact Instructor') {
      //         console.log(err);
      //         this.pageRouter.gotoUnauthorized();
      //       }
      //     }
      //     //log error 
      //   }
      //   return of(err);
      // }),
    );


  }
}
