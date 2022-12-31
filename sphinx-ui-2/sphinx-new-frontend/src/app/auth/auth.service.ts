import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { AppSettings } from './../Shared/constants';
import { throwError } from 'rxjs';
import { User, Course } from './auth.model';
import { Router } from '@angular/router';
import { NbToastrService, NbComponentStatus } from '@nebular/theme';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interface to hold CSRF token information
 * @param {string} csrf_token csrf token value
 */
export interface CsrfResponseData {
    /**
     * csrf token value
     */
    csrf_token: string;
    // can add here more field to CSRF response
}

/**
 * Authentication service provides API for
 *
 * 1.CSRF Token Management
 *
 * 2.User Login, Logout
 *
 * 3.User Password reset
 *
 * 4.Fetch and store User account details
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

    /**
     * instance variable which holds CSRF token value
     */
    public csrfData: CsrfResponseData;
    /**
     * Subject variable which used to get current logged in User object
     */
    private currentUserSubject: BehaviorSubject<User>;
    /**
     * Current user observable which holds the current logged in User details, used when you want a component to reactively
     *  update when a user logs in or out
     */
    public currentUser: Observable<User>;

    /**
     * fetch and update current logged-in user data from localstorage using currentUserSubject and currentUser
     * @param http HttpClient object used to make backend API requests
     * @param router Router object used to navigate from one view to another based on user login/logout or password reset request
     * @param toastr NbToastrService object provides capability to build toast notifications
     */
    constructor(private http: HttpClient, private router: Router, private toastr: NbToastrService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    /**
     * The currentUserValue property can be used
     *  when you just want to get the current value of the logged in user but don't need to reactively update when it changes,
     *  for example in the auth.guard.ts which restricts access to routes by checking if the user is currently logged in.
     */
    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    /**
     * getCSRFToken method fetches CSRF token from backend and handles backend API response.
     *  on successful return, stores CSRF token in csrf data variable.
     *  If encounters error then navigates the user to the server-error page
     * @returns {Observable} observable of backend API request to fetch CSRF token
     */
    getCSRFToken() {

        this.http.get<CsrfResponseData>(AppSettings.API_ENDPOINT + '/auth/csrf_token/').subscribe(
            csrfData => {
                console.log(csrfData);
                this.csrfData = csrfData;
            },
            _error => {
                this.router.navigate(['/auth', 'server-error']);
            },
        );
        // AppSettings.API_ENDPOINT+'/auth/csrf_token/
        // http://localhost:8000/auth/csrf_token/
    }

    /**
     * login method makes login API post request to backend by including user-provided username and password.
     *  On successful return,
     * 
     * 1.method stores User details in local storage
     * 
     * 2.Update and share User object asynchronously across the application using the currentUserSubject
     * 
     * If the backend API call encounters an error, then call make to a handleLoginError method
     *  which handles error and shows an appropriate error message to the user.
     * @param username user provided username
     * @param password user provided password
     *  @returns {Observable} observable of backend post login request API
     */
    login(username: string, password: string) {
        return this.http.post(AppSettings.API_ENDPOINT + '/auth/login/'
            , {
                username: username,
                password: password,
            },
        )
            .pipe(catchError(errorRes => this.handleLoginError(errorRes)),
                tap(
                    resData => {
                        const user = new User(-1, username, null, null, null, null, null, null, null);
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        this.currentUserSubject.next(user);
                    },
                ));

    }


    /**
     * logout method makes logout post API request to the backend for currently logged-in user.
     *  On successful return,
     * 
     * 1.method removes User details from local storage
     * 
     * 2.Update and share User object as null asynchronously across the application
     *  using the currentUserSubject
     *  @returns {Observable} observable of backend post logout request API
     */
    logout() {
        return this.http.post(AppSettings.API_ENDPOINT + '/auth/logout/', {})
            .pipe(catchError(
                errorRes => {
                    console.log(errorRes);
                    return throwError(errorRes);
                }),
                tap(
                    resData => {
                        localStorage.removeItem('currentUser');
                        this.currentUserSubject.next(null);
                    },
                ),
            );
    }

      /**
     * Reset password method makes a post backend API request to get reset password token
     *  for user-provided username.
     * If post API request encounters an error,
     *  then an appropriate error message is shown based upon error details

     * @param username user provided username
     *  @returns {Observable} observable of backend post logout request API
     */
    resetPassword(username: string) {
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/auth/reset/password/'
            , {
                username: username,
            },
        )
            .pipe(catchError(
                errorRes => {
                    console.log(errorRes);
                    let errorMsg = 'Unknown error occured';
                    if (!!errorRes.error.username) {
                        errorMsg = 'username is incorrect';
                    }
                    return throwError(errorMsg);
                }),
            );

    }
    /**
     * confirmResetPassword method makes an put HTTP request to backend server, which resets password to provided value if no error occured.
     *
     * If user provides incorrect username or password reset token, then method returns an approprate error message.
     * @param username user provided username
     * @param password1 user provided password
     * @param password2 user provided confirmed password
     * @param resettoken user provided password reset token
     */
    confirmResetPassword(username: string, password1: string, password2: string, resettoken: string) {
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/auth/confirm/reset/password/'
            , {
                username: username,
                new_password_1: password1,
                new_password_2: password2,
                token: resettoken,
            },
        )
            .pipe(catchError(
                errorRes => {
                    console.log(errorRes);
                    let errorMsg = 'Unknown error occured';
                    if (!!errorRes.error.non_field_errors) {
                        errorMsg = 'Please enter valid username!';
                    } else if (!!errorRes.error.code && errorRes.error.code == 'NOKEY') {
                        errorMsg = 'Please enter valid reset token!';
                    }
                    return throwError(errorMsg);
                }),
            );

    }

    /**
     * This method used to fetch user account details like
     * 
     * 1.user information
     * 
     * 2.List of objects representing user associated courses,
     *  where each object contains course information, Section and role-related information
     *  of the user
     * 
     * After fetching user account details, method extracts, and stores information
     *  in local storage using User, Courses, RoleCourseMap variables.
     * RoleCourseMap contains a key-value pair of roles and a list of user
     *  associated courses having the corresponding roles.
     *  RoleCourseMap is used to render the SphinX dashboard view.

     * 
     * @returns observable of backend api request to fetch account details
     */
    setaccount() {
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/auth/account/')
            .pipe(catchError(errorRes => this.handleLoginError(errorRes)),
                tap(responseData => {
                    // console.log(responseData);
                    const user = new User(
                        responseData.id,
                        responseData.username,
                        responseData.first_name,
                        responseData.last_name,
                        responseData.email,
                        responseData.department,
                        responseData.program,
                        responseData.last_login,
                        responseData.last_login_ip ,
                    );
                    // this.user.next(user);
                    // console.log(user);
                    const roleCourseMap = new Map();
                    let courses: any[];
                    courses = responseData.courses;
                    const extractedCourses: Course[] = [];
                    for (let i = 0; i < courses.length; i++) {
                        const course = new Course(
                            courses[i].course_id,
                            courses[i].course_name,
                            courses[i].course_title,
                            courses[i].enrollment_role_id,
                            courses[i].enrollment_role_name,
                            courses[i].enrollment_sectionlist,
                            courses[i].enrollment_actionlist,
                        );

                        extractedCourses.push(course);

                        // update roleCourseMap
                        if (roleCourseMap.has(course.role_name)) {
                            const temparr: Course[] = roleCourseMap.get(course.role_name);
                            temparr.push(course);
                            roleCourseMap.set(course.role_name, temparr);
                        } else {
                            const temparr: Course[] = [];
                            temparr.push(course);
                            roleCourseMap.set(course.role_name, temparr);
                        }
                    }
                    //  this.courses.next(extractedCourses);
                    console.log(extractedCourses);
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('courses', JSON.stringify(courses));
                    localStorage.myMap = JSON.stringify(Array.from(roleCourseMap.entries()));
                    localStorage.setItem('roleCourseMap', JSON.stringify(roleCourseMap));

                },
                ));

    }


    /**
     * This method displays appropriate error message based upon error details
     * @param errorRes http error object consist of error description
     */
    private handleLoginError(errorRes: HttpErrorResponse) {
        let errorMessage = 'The server error occurred!';
        if (!errorRes.error || !errorRes.error.detail) {
            return throwError(errorMessage);
        }
        errorMessage = errorRes.error.detail;
        // switch (errorRes.error.error.message) {
        //   case 'EMAIL_EXISTS':
        //     errorMessage = 'This email exists already';
        //     break;
        //   case 'EMAIL_NOT_FOUND':
        //     errorMessage = 'This email does not exist.';
        //     break;
        //   case 'INVALID_PASSWORD':
        //     errorMessage = 'This password is not correct.';
        //     break;
        // }
        return throwError(errorMessage);
    }

    /**
     * This method
     * 
     * 1.Removes current logged-in user details from local storage
     * 
     * 2.Update and share User object as null asynchronously across
     *  the application using the currentUserSubject
     * 
     * 3.navigate user to SphinX login page

     */
    sessionExpire() {
        // slocalStorage.clear();
        // console.log(response);
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        // this.toastr.show('Session expired. Please login again!');
        this.router.navigate(['/auth', 'login']);

    }

    /**
     * shows notification message on top right corner of screen
     * @param message notification message to display
     */
    showToastr(message: string) {
        this.toastr.primary(message, 'Error');
    }



}
