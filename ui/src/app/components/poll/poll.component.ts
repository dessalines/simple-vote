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

enum MessageType {
	poll, pollComments, pollUsers, pollActiveUsers, pollQuestions, pollCandidates, pollVotes,
	createComment, deleteComment
}

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

	private comment: string;



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
		this.scrollToBottomOfTable();


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
		arr.forEach(k => this.setUserForObj(k));
	}

	setUserForObj(obj: any) {
		obj.user = this.poll.users.find(u => u.id === obj.user_id);
	}

	messageWrapper(type: MessageType, data: any): string {
		return "{\"message_type\":" + type + ",\"data\":" + JSON.stringify(data) + "}";
	}

	createComment() {
		this.pollService.send(this.messageWrapper(MessageType.createComment,
			{ comment: this.comment }));
		this.comment = undefined;
	}

	receiveComment(comment: Comment) {
		this.setUserForObj(comment);
		this.poll.comments.push(comment);
		this.scrollToBottomOfTable();
	}

	scrollToBottomOfTable() {
		setTimeout(() => {
			let objDiv = document.getElementById("table");
			objDiv.scrollTop = objDiv.scrollHeight;
		}, 50);

	}





}
