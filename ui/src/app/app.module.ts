import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

// 3rd party
import {
  ModalModule,
  TooltipModule,
  ButtonsModule,
  BsDatepickerModule,
  BsDropdownModule
} from 'ngx-bootstrap';

import { ToasterModule } from 'angular2-toaster';


// Project libs
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';
import {
  HomeComponent,
  PollComponent,
  NewUserModalComponent,
  NavbarComponent,
  FooterComponent,
  ChatComponent,
  QuestionComponent,
  CandidateComponent,
  LoginModalComponent
} from './components';

import {
  MarkdownPipe,
  MomentPipe
} from './pipes';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PollComponent,
    NewUserModalComponent,
    NavbarComponent,
    FooterComponent,
    MarkdownPipe,
    MomentPipe,
    ChatComponent,
    QuestionComponent,
    CandidateComponent,
    LoginModalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,

    AppRoutingModule,

    // 3rd party libs
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    ButtonsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    ToasterModule
  ],
  providers: [
    Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
