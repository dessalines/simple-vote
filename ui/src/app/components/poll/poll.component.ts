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
	MessageType,
	Tools
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

	private editing: boolean = false;

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
			case MessageType.poll:
				this.setPoll(msg.data);
				break;
			case MessageType.pollUsers:
				this.setPollUsers(msg.data);
				break;
			case MessageType.pollActiveUsers:
				this.setPollActiveUsers(msg.data);
				break;
			case MessageType.pollComments:
				this.setPollComments(msg.data);
				break;
			case MessageType.pollQuestions:
				this.setPollQuestions(msg.data);
				break;
			case MessageType.pollCandidates:
				this.setPollCandidates(msg.data);
				break;
			case MessageType.pollVotes:
				this.setPollVotes(msg.data);
				break;
			case MessageType.createComment:
				this.receiveComment(msg.data);
				break;
			case MessageType.updatePoll:
				this.receivePollTitle(msg.data);
				break;
			default:
				alert('wrong message: ' + dataStr);
		}
	}

	setPoll(data: Poll) {
		this.poll = data;

		this.setEditable(this.poll);
	}

	setPollUsers(data: Array<User>) {
		this.poll.users = data;
	}

	setPollActiveUsers(data: Array<User>) {
		for (let activeUser of data) {

			// Search existing users
			if (this.poll.users) {
				let foundUser = this.poll.users.find(c => c.id === activeUser.id);
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
	}

	setPollComments(data: Array<Comment>) {
		this.poll.comments = data;
		this.scrollToBottomOfTable();


		Tools.setUsersForList(this.poll.comments, this.poll.users);
	}

	setPollQuestions(data: Array<Question>) {
		this.poll.questions = data;

		this.setEditableForList(this.poll.questions);
		Tools.setUsersForList(this.poll.questions, this.poll.users);
	}

	setPollCandidates(data: Array<Candidate>) {
		for (let question of this.poll.questions) {
			question.candidates = data.filter(c => c.question_id === question.id);

			Tools.setUsersForList(question.candidates, this.poll.users);
		}
	}

	setPollVotes(data: Array<Vote>) {
		for (let question of this.poll.questions) {
			for (let candidate of question.candidates) {
				candidate.votes = data.filter(c => c.candidate_id === candidate.id);

				Tools.setUsersForList(candidate.votes, this.poll.users);
			}
		}
	}

	updatePollTitle() {
		this.pollService.send(Tools.messageWrapper(MessageType.updatePoll,
			{ title: this.poll.title }));
		this.editing = false;
	}

	receivePollTitle(poll: Poll) {
		this.poll.title = poll.title;
	}

	receiveComment(comment: Comment) {
		Tools.setUserForObj(comment, this.poll.users);
		this.poll.comments.push(comment);
		this.scrollToBottomOfTable();
	}

	scrollToBottomOfTable() {
		setTimeout(() => {
			let objDiv = document.getElementById("table");
			objDiv.scrollTop = objDiv.scrollHeight;
		}, 50);

	}

	setEditable(data: any) {
		if (data.user_id == this.userService.getUser().id) {
			data.editable = true;
		}
	}

	setEditableForList(data: Array<any>) {
		data.forEach(k => this.setEditable(k));
	}

}
