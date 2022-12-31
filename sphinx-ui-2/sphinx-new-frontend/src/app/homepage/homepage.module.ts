import { NgModule } from '@angular/core';
import { HomepageComponent } from './homepage.component';
import { NbSidebarModule, NbLayoutModule, NbButtonModule } from '@nebular/theme';


@NgModule({
  imports: [
    NbLayoutModule,
    NbSidebarModule, // NbSidebarModule.forRoot(), //if this is your app.module
    NbButtonModule,
  ],
  declarations: [
    HomepageComponent,
  ],
})
export class HomePageModule { }
