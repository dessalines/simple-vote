import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {
  HomeComponent,
  PollComponent,
  NewUserModalComponent
} from './components';

import { AppRoutingModule } from './app.routing';

import { CookieModule } from 'ngx-cookie';

import { ModalModule } from 'ngx-bootstrap/modal';
import { ComponentLoader } from 'ngx-bootstrap';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PollComponent,
    NewUserModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

    AppRoutingModule,

    // 3rd party libs
    CookieModule.forRoot(),
    ModalModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
