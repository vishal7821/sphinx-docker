import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings, MetaRoleActions } from '../../Shared/constants';
import { catchError, tap, map } from 'rxjs/operators';
import { Course } from '../../auth/auth.model';
import { CourseDetail, CourseRole } from './coursemanager.model';

/**
 * CourseManagerService injectable provides function API's to perform backend API interaction for course details, role, section management 
 */
@Injectable({ providedIn: 'root' })
export class CourseManagerService {

    /**
     * property which hold the value of static constant property auditor of shared MetaRoleActions class
     */
    auditor: string = '';
    /**
     * property which hold the value of static constant property student of shared MetaRoleActions class
     */
    student: string = '';
    /**
     * property which hold the value of static constant property grader of shared MetaRoleActions class
     */
    grader: string = '';
    /**
     * property which hold the value of static constant property tutor of shared MetaRoleActions class
     */
    tutor: string = '';
    /**
     * property which hold the value of static constant property course_admin of shared MetaRoleActions class
     */
    course_admin: string = '';
    /**
     * property which hold the value of static constant property instructor of shared MetaRoleActions class
     */
    instructor: string = '';
    /**
     * Map which contains mapping of metarole id-name
     */
    roleNameMapping = new Map();
    /**
     * the count of allowed items on Side menu bar, used by CourseManager Component to display allowed menu action item based on assigned role to user  
     */
    allowed_mi_cnt = 0;

    /**
     * constructor initializes and assign values to class properties auditor, student, grader, tutor, course admin, instructor
     * @param http variable of HttpClient class used to make backend API calls
     */
    constructor(private http: HttpClient) {
        this.auditor = MetaRoleActions.auditor;
        this.student = MetaRoleActions.student;
        this.grader = MetaRoleActions.grader;
        this.tutor = MetaRoleActions.tutor;
        this.course_admin = MetaRoleActions.courseadmin;
        this.instructor = MetaRoleActions.instructor;

        this.roleNameMapping.set(0, 'Auditor');
        this.roleNameMapping.set(1, 'Student');
        this.roleNameMapping.set(2, 'Grader');
        this.roleNameMapping.set(3, 'Tutor');
        this.roleNameMapping.set(4, 'Course Admin');
        this.roleNameMapping.set(5, 'Instructor');

    }

    /**
     * list of multiple course section information
     */
    sectionList: any[] = [];

    /**
     * this method makes an api call to backend to create new section with provided name in course
     * @param sectiondata structure contains new section name
     * @returns an observable of http api call
     */
    createSection(sectiondata: any) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/sections/'
            , {
                name: sectiondata.name,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );

    }

    /**
     * this method makes an api call to backend to edit the existing section with provided name in course
     * @param sectiondata structure contains new section name, existing section id
     * @returns an observable of http api call
     */
    editSection(sectiondata: any) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/section/' + sectiondata.main_id + '/'
            , {
                name: sectiondata.name,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );

    }


    /**
     * this method makes an backend api call to delete an existing section with provided section id in course
     * @param sectiondata structure contains existing section id
     * @returns an observable of http api call
     */
    deleteSection(sectiondata: any) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.delete<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/section/' + sectiondata.main_id + '/')
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );


    }

       /**
     * this method makes an backend api call to fetch list of existing sections in course.
     * Whenever call made to this function, function extract the list of section information and stores in localstorage for further availibility to application 
     * @returns an observable of http api call
     */
    fetchSections() {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/sections/')
            .pipe(catchError(errorRes => this.handleAPIError(errorRes)),
                tap(responseData => {
                    console.log(responseData);
                    let sections: any[];
                    sections = responseData.data;

                    const extractedSections: any[] = [];
                    for (let i = 0; i < sections.length; i++) {
                        const section = {
                            id: i + 1,
                            main_id: sections[i].id,
                            name: sections[i].name,
                        };

                        extractedSections.push(section);
                    }
                    this.sectionList = extractedSections;
                    console.log('extracted data=', extractedSections);

                    localStorage.setItem('sections', JSON.stringify(extractedSections));

                },
                ));

    }

    /**
     * this method makes an backend api call to fetch course details.
     * Whenever call made to this function, function extract the course details from api response and stores in localstorage for further availibility to application 
     * @returns an observable of http api call
     */
    fetchCourseDetails() {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/')
            .pipe(catchError(errorRes => this.handleAPIError(errorRes)),
                tap(responseData => {
                    console.log(responseData);
                    const coursedetail: CourseDetail = {
                        name: responseData.name,
                        title: responseData.title,
                        description: responseData.description,
                        semester: responseData.semester,
                        year: responseData.year,
                        department: responseData.department,
                        is_active: '' + responseData.is_active,
                        course_dir: '',
                    };
                    console.log('extracted data=', coursedetail);

                    localStorage.setItem('courseDetail', JSON.stringify(coursedetail));

                },
                ));

    }

    /**
     * this method makes an backend api call to edit the course details.
     * @param coursedetail CourseDetail model contains course information to be updated
     * @returns an observable of http api call
     */
    editCourseDetails(coursedetail: CourseDetail) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/'
            , {
                name: coursedetail.name,
                title: coursedetail.title,
                description: coursedetail.description,
                semester: coursedetail.semester,
                year: coursedetail.year,
                department: coursedetail.department,
                is_active: JSON.parse(coursedetail.is_active),
                image_directory: coursedetail.course_dir,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );

    }

    /**
     * this method makes an backend api call to fetch list of roles in course.
     * after receiving response from backend, method extract each role information and stores in localstorage for further availability to application.
     * During information extraction, method process the action bit string of role and stores the metaroles associated with role.
     * @returns an observable of http api call
     */
    fetchCourseRoles() {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/roles/')
            .pipe(catchError(errorRes => this.handleAPIError(errorRes)),
                map(responseData => {
                    console.log(responseData);
                    // return responseData[0];
                    const roleData: CourseRole[] = [];

                    for (let i = 0; i < responseData.length; i++) {
                        const r: CourseRole = new CourseRole(i + 1, responseData[i].id, responseData[i].name, [], []);
                        const r_flags: boolean[] = [true, true, true, true, true, true];
                        const alist: string = responseData[i].action_list;
                        const allowed_mroles1: string[] = [];
                        const allowed_mroles2: string[] = [];
                        for (let j = 0; j < alist.length && j < this.auditor.length; j++) {

                            if (this.auditor[j] == '1' && this.auditor[j] != alist[j])
                                r_flags[0] = false;
                            if (this.student[j] == '1' && this.student[j] != alist[j])
                                r_flags[1] = false;
                            if (this.grader[j] == '1' && this.grader[j] != alist[j])
                                r_flags[2] = false;
                            if (this.tutor[j] == '1' && this.tutor[j] != alist[j])
                                r_flags[3] = false;
                            if (this.course_admin[j] == '1' && this.course_admin[j] != alist[j])
                                r_flags[4] = false;
                            if (this.instructor[j] == '1' && this.instructor[j] != alist[j])
                                r_flags[5] = false;
                        }
                        for (let k = 0; k < r_flags.length; k++) {
                            if (r_flags[k]) {
                                allowed_mroles1.push(k.toString());
                                allowed_mroles2.push(this.roleNameMapping.get(k));
                            }
                        }
                        if (allowed_mroles1.length > 1) {
                            allowed_mroles1.shift();
                            allowed_mroles2.shift();
                        }
                        r.actions = allowed_mroles1;
                        r.str_actions = allowed_mroles2;
                        roleData.push(r);
                    }
                    return roleData;
                },
                ));
    }

    /**
     * this method makes an backend api call to create new role in course.
     * @param name name of new role
     * @param action_list action bit string of new role
     * @returns an observable of http api call 
     */
    createRole(name: string, action_list: string) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/roles/'
            , {
                name: name,
                action_list: action_list,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );

    }

     /**
     * this method makes an backend api call to edit an existing role in course.
     * @param role existing CourseRole object to be edited
     * @param action action bit string to be updated
     * @returns an observable of http api call 
     */
    editRole(role: CourseRole, action: string) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/role/' + role.main_id + '/'
            , {
                name: role.name,
                action_list: action,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );

    }


     /**
     * this method makes an backend api call to delete an existing role in course.
     * @param roleId existing CourseRole object ID to be deleted
     * @returns an observable of http api call 
     */
    deleteRole(roleId: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.delete<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/role/' + roleId + '/'
        );

    }

    /**
     * this method process the recieved error response and displays appropriate error message 
     * @param errorRes an error recieved from backend API call
     */
    handleAPIError(errorRes: any): any {
        throw new Error('Method not implemented.');
    }

}
