import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { versions } from 'environments/versions';

import {
	PollService,
	UserService
} from '../../services';

import { ToasterService } from 'angular2-toaster';

import { Tools } from '../../shared';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

	public collapseNavbar: boolean = true;
	public showLoginModal: boolean = false;

	public version: string = JSON.stringify(versions, null, 2);

	constructor(public userService: UserService,
		private pollService: PollService,
		private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService) { }

	ngOnInit() {
	}

	toggleCollapseNavbar() {
		this.collapseNavbar = !this.collapseNavbar;
	}

	createPoll() {
		this.pollService.createPoll().subscribe(p => {
			let hashId = Tools.encodeHashId(p.id);
			this.router.navigate(['/poll', hashId, { editing: true }]);
		});
	}

	toggleLoginModal() {
		this.showLoginModal = true;
	}

	logout() {
		Tools.eraseCookie('jwt');
		location.reload();
	}

	hiddenEvent() {
		this.showLoginModal = false;
	}

}
