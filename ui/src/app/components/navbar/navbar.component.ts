import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {
	PollService,
	UserService
} from '../../services';

import { Tools } from '../../shared';

import * as Hashids from 'hashids';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

	public collapseNavbar: boolean = true;
	public showUpdateUserComponent: boolean = false;

	private hashids: any;

	constructor(private userService: UserService,
		private pollService: PollService,
		private route: ActivatedRoute,
		private router: Router) { }

	ngOnInit() {
		this.hashids = new Hashids();
	}

	toggleCollapseNavbar() {
		this.collapseNavbar = !this.collapseNavbar;
	}

	createPoll() {
		this.pollService.createPoll().subscribe(p => {
			let hashId = this.hashids.encode(p.id);
			this.router.navigate(['/poll', hashId]);
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
