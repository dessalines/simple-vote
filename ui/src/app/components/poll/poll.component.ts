import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from '@angular/router';

import {
	PollService,
	UserService
} from '../../services';

@Component({
	selector: 'app-poll',
	templateUrl: './poll.component.html',
	styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit {

	private paramsSub: any;
	private pollSub: any;

	private pollId: number = null;

	constructor(private pollService: PollService,
		private userService: UserService,
		private route: ActivatedRoute,
		private router: Router) { }

	ngOnInit() {
		this.paramsSub = this.route.params.subscribe(params => {
			this.pollId = +params["pollId"];
			console.log(this.pollId);
			this.pollService.connect(this.pollId);

			this.subscribeToPoll();
		});


	}

	subscribeToPoll() {
		this.pollSub = this.pollService.ws.getDataStream().
			subscribe(res => {
				this.updatePoll(res.data);
			});
	}

	ngOnDestroy() {
		this.unloadSubscriptions();
		this.paramsSub.unsubscribe();
	}

	unloadSubscriptions() {
		this.pollService.ws.close(true);
		console.log('Destroying poll sub');
	}

	updatePoll(dataStr: string) {
		console.log(dataStr);
		let data = JSON.parse(dataStr);
		switch (data.message_type) {
			case 'poll_comments':

				break;
			default:
				alert('wrong message: ' + dataStr);
		}
	}
}
