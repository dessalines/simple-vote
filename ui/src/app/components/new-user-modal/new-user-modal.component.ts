import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { UserService } from '../../services';


@Component({
	selector: 'app-new-user-modal',
	templateUrl: './new-user-modal.component.html',
	styleUrls: ['./new-user-modal.component.scss']
})
export class NewUserModalComponent implements OnInit {

	@ViewChild('smModal') private smModal: ModalDirective;
	@Output() userCreated = new EventEmitter();	

	private name: string;

	constructor(private userService: UserService,
		private cookieService: CookieService) { }

	ngOnInit() {
		if (this.userService.getUser() == null) {
			setTimeout(() => this.smModal.show(),100);
		} else {
			this.userCreated.emit();
		}
	}

	onSubmit() {
		console.log('submitting');

		this.userService.createNewUser(this.name).subscribe(rJWT => {
			this.cookieService.put('jwt', rJWT);
			this.userService.setUserFromCookie();
			this.smModal.hide();
			this.userCreated.emit();
		});
	}
}

