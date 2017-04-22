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
				this.setPoll(msg.data);
				break;
			case 'pollUsers':
				this.setPollUsers(msg.data);
				break;
			case 'pollActiveUsers':
				this.setPollActiveUsers(msg.data);
				break;
			case 'pollComments':
				this.setPollComments(msg.data);
				break;
			case 'pollQuestions':
				this.setPollQuestions(msg.data);
				break;
			case 'pollCandidates':
				this.setPollCandidates(msg.data);
				break;
			case 'pollVotes':
				this.setPollVotes(msg.data);
				break;
			default:
				alert('wrong message: ' + dataStr);
		}
	}

	setPoll(data: Poll) {
		this.poll = data;
	}

	setPollUsers(data: Array<User>) {
		this.poll.users = data;
	}

	setPollActiveUsers(data: Array<User>) {
		for (let activeUser of data) {

			// Search existing users
			if (this.poll.users) {
				let foundUser = this.poll.users.find(c => c.id === activeUser.id);
				console.log(foundUser);
				// if user already there, set to active
				if (foundUser) {
					foundUser.active = true;
				} 
				// otherwise add to 
				else {
					activeUser.active = true;
					this.poll.users.push(activeUser);
				}
			} else {
				this.poll.users = [activeUser];
			}


		}
		console.log(this.poll.users);
	}

	setPollComments(data: Array<Comment>) {
		this.poll.comments = data;

		this.setUsersForList(this.poll.comments);
	}

	setPollQuestions(data: Array<Question>) {
		this.poll.questions = data;

		this.setUsersForList(this.poll.questions);
	}

	setPollCandidates(data: Array<Candidate>) {
		for (let question of this.poll.questions) {
			question.candidates = data.filter(c => c.question_id === question.id);

			this.setUsersForList(question.candidates);
		}
	}

	setPollVotes(data: Array<Vote>) {
		for (let question of this.poll.questions) {
			for (let candidate of question.candidates) {
				candidate.votes = data.filter(c => c.candidate_id === candidate.id);

				this.setUsersForList(candidate.votes);
			}
		}
		console.log(this.poll);
	}

	setUsersForList(arr: Array<any>) {
		arr.forEach(k => k.user = this.poll.users.find(u => u.id === k.user_id));
	}

}
