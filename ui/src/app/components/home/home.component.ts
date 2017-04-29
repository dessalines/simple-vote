import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {
	PollService,
} from '../../services';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	constructor(private pollService: PollService,
		private route: ActivatedRoute,
		private router: Router) { }

	ngOnInit() {
	}

	createPoll() {
		this.pollService.createPoll().subscribe(p => {
			console.log(p);
			this.router.navigate(['/poll', p.id]);
		});
	}

}
