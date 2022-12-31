import { NgModule } from '@angular/core';
import { NbCardModule, NbTabsetModule, NbLayoutModule,
         NbActionsModule, NbIconModule , NbButtonModule,
         NbListModule, NbInputModule,NbAccordionModule,
         NbTreeGridModule,
         NbSelectModule,
         NbSpinnerModule,
         NbCheckboxModule, NbRadioModule} from '@nebular/theme';
// import { FsIconComponent } from './assignmentmanager/question//tree-grid/tree-grid.component';

import { ThemeModule } from '../../@theme/theme.module';
import { AssignmentmanagerComponent } from './assignmentmanager.component';
import { AssignmentFormComponent } from './assignment-form/assignment-form.component';
import { QuestionSetFormComponent } from './question-set-form/question-set-form.component';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import {AngularTreeGridModule} from 'angular-tree-grid';
import { QuestionComponent } from './question/question.component';
import { TreeModule } from 'ng2-tree';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { RubricComponent } from './rubric/rubric.component';
// import { AppRoutingModule } from '../../app-routing.module';
import { RouterModule } from '@angular/router';
import { ImageCropperModule } from 'ngx-image-cropper';
import { OwlModule } from 'ngx-owl-carousel';
import { InteractiveQuestionSetComponent } from './interactive-question-set/interactive-question-set.component';
import { EditorModule } from "@tinymce/tinymce-angular";
import { McqcbQuestionFormComponent } from './mcqcb-question-form/mcqcb-question-form.component';
import { McqrbQuestionFormComponent } from './mcqrb-question-form/mcqrb-question-form.component';

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
    ThemeModule,
    // NbWindowModule.forChild(),
    CarouselModule,
    NbSelectModule,
    NbCheckboxModule,
    NbRadioModule,
    NbAccordionModule,

    FileUploadModule,
    NbTreeGridModule,
    AngularTreeGridModule,
    TreeModule,
    MatSlideToggleModule,
    MatSliderModule,
    Ng2SmartTableModule,
    ImageCropperModule,
    OwlModule,
    NbSpinnerModule,
    EditorModule,
  ],
  declarations: [
    AssignmentmanagerComponent,
    AssignmentFormComponent,
    QuestionSetFormComponent,
    QuestionComponent,
    RubricComponent,
    InteractiveQuestionSetComponent,
    McqcbQuestionFormComponent,
    McqrbQuestionFormComponent,
  ],
  entryComponents: [
    AssignmentFormComponent,
    QuestionSetFormComponent,
    InteractiveQuestionSetComponent,
    McqcbQuestionFormComponent,
    McqrbQuestionFormComponent
  ],
})
export class AssignmentManagerModule { }
