import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import {
	PollService,
} from '../../services';

import {
	Tools
} from '../../shared';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	constructor(private pollService: PollService,
		private route: ActivatedRoute,
		private router: Router,
		private titleService: Title) { }

	ngOnInit() {
		this.titleService.setTitle('SimpleVote');
	}

	createPoll() {
		this.pollService.createPoll().subscribe(p => {
			let hashId = Tools.encodeHashId(p.id);
			this.router.navigate(['/poll', hashId, {editing: true}]);
		});
	}

}
