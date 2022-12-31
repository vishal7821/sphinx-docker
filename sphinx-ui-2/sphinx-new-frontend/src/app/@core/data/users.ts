import { Observable } from 'rxjs';

/**
 * @ignore
 */
export interface User {
  name: string;
  picture: string;
}

/**
 * @ignore
 */
export interface Contacts {
  user: User;
  type: string;
}

/**
 * @ignore
 */
export interface RecentUsers extends Contacts {
  time: number;
}

/**
 * @ignore
 */
export abstract class UserData {
  abstract getUsers(): Observable<User[]>;
  abstract getContacts(): Observable<Contacts[]>;
  abstract getRecentUsers(): Observable<RecentUsers[]>;
}
