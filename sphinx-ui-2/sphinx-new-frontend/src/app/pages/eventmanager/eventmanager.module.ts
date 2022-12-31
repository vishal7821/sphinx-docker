import { NgModule } from '@angular/core';
import { NbCardModule, NbTabsetModule, NbLayoutModule,
         NbActionsModule, NbIconModule , NbButtonModule,
         NbListModule, NbInputModule,
         NbSelectModule, NbProgressBarModule, NbStepperModule, NbRadioModule, NbSpinnerModule} from '@nebular/theme';
// import { FsIconComponent } from './assignmentmanager/question//tree-grid/tree-grid.component';

import { ThemeModule } from '../../@theme/theme.module';
import { FormsModule } from '@angular/forms';
// import { AppRoutingModule } from '../../app-routing.module';
import { RouterModule } from '@angular/router';
import { EventmanagerComponent } from './eventmanager.component';
import { MatSlideToggleModule } from '@angular/material';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ColorPickerModule } from 'ngx-color-picker';
import { FileUploadModule } from '@iplab/ngx-file-upload';


/**
 * Please see the README for the description
 * 
 */
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
    // NbWindowModule.forChild(),
    NbSelectModule,
    NbStepperModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ColorPickerModule,
    FileUploadModule,
    NbRadioModule,
    NbSpinnerModule,
  ],
  declarations: [
    EventmanagerComponent,
  ],
})
export class EventManagerModule { }
