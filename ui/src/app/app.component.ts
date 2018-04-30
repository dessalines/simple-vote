import { Component } from '@angular/core';
import {
	PollService,
	UserService
} from './services';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
providers: [PollService, UserService]
})
export class AppComponent {

}
