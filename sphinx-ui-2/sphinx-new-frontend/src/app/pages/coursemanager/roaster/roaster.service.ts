import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../../Shared/constants';
import { catchError, tap } from 'rxjs/operators';
import { Course } from '../../../auth/auth.model';
import { Enrollment, CourseRole, Roles, Section } from '../coursemanager.model';
import { Subject, Observable } from 'rxjs';

/**
 * CourseManagerService injectable provides function API's to perform server API interaction for course roster management 
 */
@Injectable({ providedIn: 'root' })
export class RoasterService {

    /**
     * Subject variable which used to send list of enrollment to application
     */
    private enrollmentData = new Subject<Enrollment[]>();
    /**
     * constructor method used to intialize HttpClient object
     * @param http variable of HttpClient class used to make server API calls
     */
    constructor(private http: HttpClient) {

    }

    /**
     * This method receives updated enrollment list data and send the updated data to application using Subject enrollmentData 
     * @param enrollments updated enrollment list data
     */
    updateEnrollments(enrollments: Enrollment[]) {
        this.enrollmentData.next(enrollments);
    }

    /**
     * method returns an observable of enrollment data
     */
    getEnrollments(): Observable<any> {
        return this.enrollmentData.asObservable();
    }

    /**
     * addEnrollments method receives csv file and calls the server api to create new enrollments in course
     * @param file CSV file contains list of user details to be enrolled
     * @returns observable of server post API request
     */
    addEnrollments(file: File) {
        const formData = new FormData();
        formData.append('enrollment_file', file, file.name);
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/enrollments/'
            , formData,
        );


    }
    /**
     * fetchEnrollments makes an server get request to fetch all enrollments of course.
     * On receiving successful response from server, method extracts the all course enrollments by processing the server response.
     * After extraction, enrollment data saved in localstorage which makes data available to application
     * @returns observable of server get API request
     */
    fetchEnrollments() {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/enrollments/')
            .pipe(catchError(errorRes => this.handleAPIError(errorRes)),
                tap(responseData => {
                    console.log(responseData);
                    const enrollments: any[] = responseData.enrollments;

                    const extractedEnrollments: Enrollment[] = [];
                    for (let i = 0; i < enrollments.length; i++) {
                        // const role = new Roles(enrollments[i].role.id,enrollments[i].role.name);
                        // let sections:any[]=enrollments[i].sections;
                        // let exsections:Section[]=[];
                        // for(var j = 0;j<sections.length;j++){
                        //     const sec = new Section(sections[j].id,sections[j].name);
                        //     exsections.push(sec);
                        // }
                        let role: string = '';
                        let roleid: number = -1;
                        const sectionList: number[] = [];
                        let sections: string = '';
                        if (enrollments[i].role != null) {
                            role = enrollments[i].role.name;
                            roleid = enrollments[i].role.id;
                        }

                        if (enrollments[i].sections != null) {
                            for (let j = 0; j < enrollments[i].sections.length; j++) {
                                const s: Section = new Section(enrollments[i].sections[j].id, enrollments[i].sections[j].name);
                                sections = sections + ' ' + enrollments[i].sections[j].name;
                                if (j != enrollments[i].sections.length - 1)
                                    sections = sections + ',';
                                sectionList.push(enrollments[i].sections[j].id);
                            }
                        }
                        const enroll = new Enrollment(
                            i + 1,
                            enrollments[i].id,
                            enrollments[i].user.username,
                            enrollments[i].user.roll_no,
                            enrollments[i].user.first_name,
                            enrollments[i].user.last_name,
                            enrollments[i].user.email,
                            enrollments[i].department,
                            enrollments[i].program,
                            role,
                            roleid,
                            sections,
                            sectionList,
                        );

                        extractedEnrollments.push(enroll);
                    }

                    console.log('extracted data=', extractedEnrollments);

                    localStorage.setItem('enrollments', JSON.stringify(extractedEnrollments));

                },
                ));

    }

    /**
     * this method makes an api call to backend to edit the existing section with provided name in course
     * @param sectiondata structure contains new section name, existing section id
     * @returns an observable of http api call
     */
    /**
     * this method makes an server put api request to edit the existing enrollment with provided role and section list in course
     * @param enroll enrollment oject contains data to be update
     */
    putEnrollment(enroll: Enrollment) {
        const role_data: any = {
            id: enroll.roleid,
        };
        const section_data: any[] = [];
        for (let i = 0; i < enroll.sectionsList.length; i++) {
            const s: any = {
                id: enroll.sectionsList[i]
            };
            section_data.push(s);
        }
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/enrollment/' + enroll.main_id + '/'
            , {
                role: role_data,
                sections: section_data,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );

    }

    /**
     * this method makes an server api call to delete an existing enrollment with provided enrollment id in course
     * @param enrollid user enrollment ID
     */
    delEnrollment(enrollid: number) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.delete<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/enrollment/' + enrollid + '/',
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );

    }

    /**
     * this method process the recieved error response from server and displays appropriate error message 
     * @param errorRes an error recieved from backend API call
     */
    handleAPIError(errorRes: any): any {
        throw new Error('Method not implemented.');
    }
}
