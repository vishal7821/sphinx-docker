
import { BrowserModule , HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import { GestureConfig } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { OwlModule } from 'ngx-owl-carousel';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import {
  NbChatModule,
  NbDatepickerModule,
  NbDialogModule,
  NbMenuModule,
  NbSidebarModule,
  NbToastrModule,
  // NbLayoutModule,
  // NbWindowModule,
} from '@nebular/theme';
// import { HomePageModule } from './homepage/homepage.module';
import { AuthModule } from './auth/auth.module';
import { AuthInterceptorService } from './auth/auth-interceptor.service';
// import { CarouselModule } from 'ngx-bootstrap/carousel';

// import { LoadingSpinnerComponent } from './Shared/loading-spinner/loading-spinner.component';
import 'hammerjs';
// import {  OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import {HotkeyModule} from 'angular2-hotkeys';
import { ErrorInterceptor } from './helper/error.interceptor';
 


@NgModule({
  declarations: [AppComponent ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    OwlModule,
    BrowserAnimationsModule,
    HttpClientModule,
    // HomePageModule,
    AuthModule,
    ThemeModule.forRoot(),

    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    // NbWindowModule.forRoot(),
    NbToastrModule.forRoot(),
    NbChatModule.forRoot({
      messageGoogleMapKey: 'AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY',
    }),
    // NbLayoutModule,
    CoreModule.forRoot(),
    HotkeyModule.forRoot(),
    // CarouselModule.forRoot(),
    EditorModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig },
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
