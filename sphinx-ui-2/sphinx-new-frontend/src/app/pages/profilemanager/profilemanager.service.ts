import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../Shared/constants';
import { User } from '../../auth/auth.model';

@Injectable({ providedIn: 'root' })
export class ProfilemanagerService {


    constructor(private http: HttpClient) {
    }


    public updateProfileDetails(userData: User) {

        return this.http.put<any>(AppSettings.API_ENDPOINT + '/auth/account/'
            , {
                id: userData.id,
                first_name: userData.firstname,
                last_name: userData.lastname,
                email: userData.email,
                department: userData.department,
                program: userData.program,
            },
        );
    }

    public updatePassword(cur_pwd: string, new_pwd: string, confirm_pwd: string) {

        return this.http.post<any>(AppSettings.API_ENDPOINT + '/auth/password/change/'
            , {
                old_password: cur_pwd,
                new_password_1: new_pwd,
                new_password_2: confirm_pwd,
            },
        );
    }
}
