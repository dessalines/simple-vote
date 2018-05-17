import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {
	PollService,
	UserService
} from '../../services';

import { Tools } from '../../shared';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

	public collapseNavbar: boolean = true;
	public showUpdateUserComponent: boolean = false;

	constructor(public userService: UserService,
		private pollService: PollService,
		private route: ActivatedRoute,
		private router: Router) { }

	ngOnInit() {
	}

	toggleCollapseNavbar() {
		this.collapseNavbar = !this.collapseNavbar;
	}

	createPoll() {
		this.pollService.createPoll().subscribe(p => {
			let hashId = Tools.encodeHashId(p.id);
			this.router.navigate(['/poll', hashId, {editing: true}]);
		});
	}

	changeUserName() {
		this.showUpdateUserComponent = true;
	}

	logout() {
		Tools.eraseCookie('jwt');
		location.reload();
	}


}
