import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import {
	PollService,
} from '../../services';

import * as Hashids from 'hashids';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	private hashids: any;

	constructor(private pollService: PollService,
		private route: ActivatedRoute,
		private router: Router,
		private titleService: Title) { }

	ngOnInit() {
		this.hashids = new Hashids();
		this.titleService.setTitle('SimpleVote');
	}

	createPoll() {
		this.pollService.createPoll().subscribe(p => {
			let hashId = this.hashids.encode(p.id);
			this.router.navigate(['/poll', hashId]);
		});
	}

}
