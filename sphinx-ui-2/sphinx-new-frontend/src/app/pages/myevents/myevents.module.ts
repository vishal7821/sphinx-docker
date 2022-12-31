import { NgModule } from '@angular/core';
import { NbCardModule, NbTabsetModule, NbLayoutModule,
         NbActionsModule, NbIconModule , NbButtonModule,
         NbListModule, NbInputModule,
         NbSelectModule, NbProgressBarModule,
         NbStepperModule, NbRadioModule,
         NbAccordionModule, NbTreeGridModule,
         NbCheckboxModule, NbToastrModule,
         NbChatModule,
         NbTooltipModule,
         NbSpinnerModule,
        } from '@nebular/theme';
// import { FsIconComponent } from './assignmentmanager/question//tree-grid/tree-grid.component';

import { ThemeModule } from '../../@theme/theme.module';
import { FormsModule } from '@angular/forms';
// import { AppRoutingModule } from '../../app-routing.module';
import { RouterModule } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ColorPickerModule } from 'ngx-color-picker';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { MyeventsComponent } from './myevents.component';
import { SubmissionmanagerComponent } from './submissionmanager/submissionmanager.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import {MatGridListModule} from '@angular/material/grid-list';
import { GradingmanagerComponent } from './gradingmanager/gradingmanager.component';
import { HotkeyModule } from 'angular2-hotkeys';
import { MaingradeComponent } from './gradingmanager/maingrade/maingrade.component';
import { InputChangeDirective } from './gradingmanager/maingrade/input-change.directive';
import { GradeviewmanagerComponent } from './gradeviewmanager/gradeviewmanager.component';
import { MaingradeviewComponent } from './gradeviewmanager/maingradeview/maingradeview.component';
import { RegradingmanagerComponent } from './regradingmanager/regradingmanager.component';
import { MainRegradeComponent } from './regradingmanager/main-regrade/main-regrade.component';
import { OwlModule } from 'ngx-owl-carousel';
import { ImageViewerModule } from 'ng2-image-viewer';
import { AutogradeComponent } from './gradingmanager/autograde/autograde.component';
import { InteractiveResponseManagerComponent } from './interactive-response-manager/interactive-response-manager.component';
import { EditorModule } from "@tinymce/tinymce-angular";
import { McqcbResponseFormComponent } from './mcqcb-response-form/mcqcb-response-form.component';
import { McqrbResponseFormComponent } from './mcqrb-response-form/mcqrb-response-form.component';
import { MaingradeInteractiveManagerComponent } from './gradingmanager/maingrade-interactive-manager/maingrade-interactive-manager.component';
import { InteractiveResponseHelpComponent } from './interactive-response-manager/interactive-response-help/interactive-response-help.component';

/**
 * go to README for the module overview
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
    NbAccordionModule,
    NbTreeGridModule,
    CarouselModule,
    MatGridListModule,
    NbCheckboxModule,
    HotkeyModule,
    NbToastrModule,
    NbChatModule,
    OwlModule,
    ImageViewerModule,
    NbTooltipModule,
    NbSpinnerModule,
    EditorModule,
  ],
  declarations: [
    MyeventsComponent,
    SubmissionmanagerComponent,
    GradingmanagerComponent,
    MaingradeComponent,
    InputChangeDirective,
    GradeviewmanagerComponent,
    MaingradeviewComponent,
    RegradingmanagerComponent,
    MainRegradeComponent,
    AutogradeComponent,
    InteractiveResponseManagerComponent,
    McqcbResponseFormComponent,
    McqrbResponseFormComponent,
    MaingradeInteractiveManagerComponent,
    InteractiveResponseHelpComponent,
  ],
  entryComponents: [
    McqcbResponseFormComponent,
    McqrbResponseFormComponent,
    InteractiveResponseHelpComponent,
  ],
})
export class MyEventsModule { }
