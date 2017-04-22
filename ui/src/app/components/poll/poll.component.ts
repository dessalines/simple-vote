import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from '@angular/router';

import {
	PollService,
	UserService
} from '../../services';

import {
	Poll,
	Question,
	Candidate,
	Vote,
	User,
	Comment,
} from '../../shared';

@Component({
	selector: 'app-poll',
	templateUrl: './poll.component.html',
	styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit {

	private paramsSub: any;
	private pollSub: any;

	private pollId: number = null;

	private poll: Poll;

	constructor(private pollService: PollService,
		private userService: UserService,
		private route: ActivatedRoute,
		private router: Router) { }

	ngOnInit() {

	}

	// Only initialize after the user has been created
	userCreated() {
		this.init();
	}

	init() {
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
		let msg = JSON.parse(dataStr);
		console.log(msg);
		switch (msg.message_type) {
			case 'poll':
				this.getPoll(msg.data);
				break;
			case 'pollUsers':
				this.getPollUsers(msg.data);
				break;
			case 'pollComments':
				this.getPollComments(msg.data);
				break;
			case 'pollQuestions':
				this.getPollQuestions(msg.data);
				break;
			case 'pollCandidates':
				this.getPollCandidates(msg.data);
				break;
			case 'pollVotes':
				this.getPollVotes(msg.data);
				break;
			default:
				alert('wrong message: ' + dataStr);
		}
	}

	getPoll(data: Poll) {
		this.poll = data;
	}

	getPollUsers(data: Array<User>) {
		this.poll.users = data;
	}

	getPollComments(data: Array<Comment>) {
		this.poll.comments = data;
	}

	getPollQuestions(data: Array<Question>) {
		this.poll.questions = data;
	}

	getPollCandidates(data: Array<Candidate>) {
		for (let question of this.poll.questions) {
			question.candidates = data.filter(c => c.question_id === question.id);
		}
	}

	getPollVotes(data: Array<Vote>) {
		for (let question of this.poll.questions) {
			for (let candidate of question.candidates) {
				candidate.votes = data.filter(c => c.candidate_id === candidate.id);
			}
		}
	}

}
