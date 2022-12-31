import { NgModule } from '@angular/core';
import { NbCardModule, NbTabsetModule, NbLayoutModule,
         NbActionsModule, NbIconModule , NbButtonModule,
         NbListModule, NbInputModule,
         NbSelectModule, NbProgressBarModule,
         NbStepperModule, NbRadioModule,
         NbAccordionModule, NbTreeGridModule,
         NbCheckboxModule, NbToastrModule,
         NbChatModule,
         NbSpinnerModule} from '@nebular/theme';
// import { FsIconComponent } from './assignmentmanager/question//tree-grid/tree-grid.component';

import { ThemeModule } from '../../@theme/theme.module';
import { FormsModule } from '@angular/forms';
// import { AppRoutingModule } from '../../app-routing.module';
import { RouterModule } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ColorPickerModule } from 'ngx-color-picker';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import {MatGridListModule} from '@angular/material/grid-list';
import { HotkeyModule } from 'angular2-hotkeys';
import { OwlModule } from 'ngx-owl-carousel';
import { GradeSubManagementComponent } from './grade-sub-management.component';
import { AdminSubmissionComponent } from './admin-submission/admin-submission.component';

@NgModule({
  imports: [
    RouterModule,
    FormsModule,
    NbListModule,
    NbInputModule,
    NbButtonModule,
    NbIconModule,
    NbActionsModule,
    NbCardModule,
    NbLayoutModule,
    NbTabsetModule,
    NbProgressBarModule,
    ThemeModule,
    MatSlideToggleModule,
    NbSelectModule,
    NbStepperModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FileUploadModule,
    NbRadioModule,
    NbAccordionModule,
    NbCheckboxModule,
    NbToastrModule,
    NbSpinnerModule,
  ],
  declarations: [
    GradeSubManagementComponent,
    AdminSubmissionComponent,
  ],
})
export class GradeSubManagementModule { }
