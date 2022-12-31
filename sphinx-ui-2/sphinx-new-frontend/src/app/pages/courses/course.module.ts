import { NgModule } from '@angular/core';
import { NbCardModule, NbTabsetModule } from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { CoursesComponent } from './courses.component';

@NgModule({
  imports: [
    NbCardModule,
    NbTabsetModule,
    ThemeModule,
  ],
  declarations: [
    CoursesComponent,
  ],
})
export class CoursesModule { }
