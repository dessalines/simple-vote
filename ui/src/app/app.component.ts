import { Component, ViewContainerRef } from '@angular/core';
import {
  PollService,
  UserService
} from './services';

import {
  ToasterContainerComponent,
  ToasterService,
  ToasterConfig
} from 'angular2-toaster/angular2-toaster';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [PollService, UserService, ToasterService]
})
export class AppComponent {

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      showCloseButton: true,
      tapToDismiss: false,
      timeout: 3000,
    });


  private viewContainerRef: ViewContainerRef;

  public constructor(viewContainerRef: ViewContainerRef,
    private toasterService: ToasterService,
  ) {
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef;
  }
}
