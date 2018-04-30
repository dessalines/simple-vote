import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs/Observable';

import { UserService } from '../../services';

import { Tools } from '../../shared';


@Component({
	selector: 'app-new-user-modal',
	templateUrl: './new-user-modal.component.html',
	styleUrls: ['./new-user-modal.component.scss']
})
export class NewUserModalComponent implements OnInit {

	@ViewChild('smModal') private smModal: ModalDirective;
	@Output() userCreated = new EventEmitter();	

	@Input() createNewUser: boolean = true;

	public name: string;

	constructor(private userService: UserService) { }

	ngOnInit() {
		// focus when the modal is shown
		this.smModal.onShown.subscribe(() => document.getElementById("new-user-input").focus());

		if (this.userService.getUser() == null || this.createNewUser == false) {
			setTimeout(() => this.smModal.show(),100);
		} else {
			this.userCreated.emit();
		}
	}

	onSubmit() {
		let obs: Observable<string>;
		if (this.createNewUser) {
			obs = this.userService.createNewUser(this.name);
		} else {
			obs = this.userService.updateUser(this.name);
		}
		obs.subscribe(rJWT => {
			Tools.createCookie('jwt', rJWT, 9999);
			this.userService.setUserFromCookie();
			this.smModal.hide();
			this.userCreated.emit();

			if (!this.createNewUser) {
				location.reload();
			}
		});
	}
}

