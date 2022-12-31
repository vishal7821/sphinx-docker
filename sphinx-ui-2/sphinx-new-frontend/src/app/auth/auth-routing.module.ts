import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NbAuthComponent } from '@nebular/auth';
import {LoginComponent} from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { NotFoundComponent } from './not-found/not-found.component';
export const routes: Routes = [
    {
        path: '',
        component: NbAuthComponent,
        children: [
            {
              path: 'login',
              component: LoginComponent,
            },
            {
              path: 'logout',
              component: LogoutComponent,
            },
            {
              path: 'resetpassword',
              component: ResetpasswordComponent,
            },
            {
              path: 'server-error',
              component: NotFoundComponent,
            },
            {
              path: '',
              redirectTo: 'login',
              pathMatch: 'full',
            },
          ],
    },
  // .. here goes our components routes
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {
}
