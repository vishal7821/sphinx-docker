import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Component provided View displays the message about server unavailability and provides the refresh link to refresh application server status
 */
@Component({
  selector: 'not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent  {

  /**
  * Constructor method used to inject angular Router service to component
   * @param router Angular Router object
   */
  constructor(private router: Router) { }


  /**
   * mathod redirect user to login page which check server status on page initialization and redirects to not found view if server is unavailable
   */
  goToHome() {
    this.router.navigate(['/auth']);
  }
}
