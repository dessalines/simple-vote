import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

// 3rd party
import { ModalModule, TooltipModule, ButtonsModule } from 'ngx-bootstrap';

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
  CandidateComponent
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
    CandidateComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

    AppRoutingModule,

    // 3rd party libs
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    ButtonsModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
