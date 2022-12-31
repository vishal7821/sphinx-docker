import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../../Shared/constants';
import { catchError, tap } from 'rxjs/operators';
import { Course } from '../../../auth/auth.model';

/**
 * TopicsService injectable provides function API's to perform backend API interaction for course topic management 
 */
@Injectable({ providedIn: 'root' })
export class TopicsService {

    /**
     * constructor initializes HttpClient object which used to perform backend communication
     * @param http variable of HttpClient class used to make backend API calls
     */
    constructor(private http: HttpClient) {

    }
    /**
     * List of topics present in Course
     */
    topicsList: any[] = [];

    /**
     * * this method makes an api call to backend to create new topic with provided parameters in course
     * @param topicdata Topic model object contains new topic data like topic name, description, super topic id
     * @returns an observable of http api call
     */
    createTopic(topicdata: any) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/topics/'
            , {
                name: topicdata.name,
                description: topicdata.description,
                super_topic: topicdata.super_topic,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );

    }


    /**
     * * this method makes an api call to backend to edit an existing topic with provided parameters in course
     * @param topicdata Topic model object contains topic data like topic id, name, description, super topic id
     * @returns an observable of http api call
     */
    editTopic(topicdata: any) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/topic/' + topicdata.main_id + '/'
            , {
                name: topicdata.name,
                description: topicdata.description,
                super_topic: topicdata.super_topic,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );

    }


    /**
     * this method makes an api call to backend to delete an existing topic in course
     * @param topicdata Topic model object contains topic data like topic id, name, description, super topic id
     * @returns an observable of http api call
     */
    deleteTopic(topicdata: any) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.delete<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/topic/' + topicdata.main_id + '/')
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );


    }

    /**
     * this method makes an backend api call to fetch list of existing topics in course.
     * Whenever call made to this function, function extract the list of topic information and stores in localstorage for further availibility to application 
     * @returns an observable of http api call
     */
    fetchTopics() {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/topics/')
            .pipe(catchError(errorRes => this.handleError(errorRes)),
                tap(responseData => {
                    console.log(responseData);
                    let topics: any[];
                    topics = responseData.data;

                    const extractedTopics: any[] = [];
                    for (let i = 0; i < topics.length; i++) {
                        const topic = {
                            id: i + 1,
                            main_id: topics[i].id,
                            name: topics[i].name,
                            super_topic: topics[i].super_topic,
                            description: topics[i].description,
                        };

                        extractedTopics.push(topic);
                    }
                    this.topicsList = extractedTopics;
                    console.log('extracted topics =', extractedTopics);

                    localStorage.setItem('topics', JSON.stringify(extractedTopics));

                },
                ));

    }


   /**
     * this method process the recieved error response and displays appropriate error message 
     * @param errorRes an error recieved from backend API call
     */
    handleError(errorRes: any): any {
        throw new Error('Method not implemented.');
    }

}
