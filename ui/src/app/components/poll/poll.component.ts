import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';

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

	private showDetails: boolean = false;

	private websocketSoftClose: boolean = false;

	@ViewChild('reconnectModal') private reconnectModal: ModalDirective;

	constructor(private pollService: PollService,
		private userService: UserService,
		private route: ActivatedRoute,
		private router: Router) { }

	ngOnInit() {

	}

	toggleDetails() {
		this.showDetails = !this.showDetails;
	}

	toggleEditing() {
		this.poll.editing = !this.poll.editing;
	}

	detailsExpander() {
		return (this.showDetails) ? '[-]' : '[+]';
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
				this.update(res.data);
			});
	}

	ngOnDestroy() {
		this.unloadSubscriptions();
		this.paramsSub.unsubscribe();
	}

	unloadSubscriptions() {
		this.websocketSoftClose = true;
		this.pollService.ws.close(true);
		console.log('Destroying poll sub');
	}

	websocketCloseWatcher() {
		this.pollService.ws.onClose(cb => {

			if (!this.websocketSoftClose) {
				console.log('ws connection closed');

				this.reconnectModal.show();
			}
		});
	}

	websocketReconnect() {
		this.pollService.connect(this.pollId);
		this.subscribeToPoll();
		this.reconnectModal.hide();
	}

	update(dataStr: string) {
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
				this.receiveUpdatePoll(msg.data);
				break;
			case MessageType.deletePoll:
				this.receiveDeletePoll();
				break;
			case MessageType.createQuestion:
				this.receiveQuestion(msg.data);
				break;
			case MessageType.deleteQuestion:
				this.receiveDeleteQuestion(msg.data);
				break;
			case MessageType.updateQuestion:
				this.receiveUpdateQuestion(msg.data);
				break;
			case MessageType.createCandidate:
				this.receiveCandidate(msg.data);
				break;
			case MessageType.deleteCandidate:
				this.receiveDeleteCandidate(msg.data);
				break;
			case MessageType.updateCandidate:
				this.receiveUpdateCandidate(msg.data);
				break;
			case MessageType.createOrUpdateVote:
				this.receiveVote(msg.data);
				break;
			case MessageType.deleteVote:
				this.receiveDeleteVote(msg.data);
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

			this.setEditableForList(question.candidates);
			Tools.setUsersForList(question.candidates, this.poll.users);
		}
	}

	setPollVotes(data: Array<Vote>) {
		for (let question of this.poll.questions) {
			for (let candidate of question.candidates) {
				candidate.votes = data.filter(c => c.candidate_id === candidate.id);

				Tools.setCandidateAvgScore(candidate);

				Tools.setUsersForList(candidate.votes, this.poll.users);
			}

			// Sort by score
			Tools.sortCandidatesByScore(question);
		}
	}

	updatePoll() {
		this.pollService.send(Tools.messageWrapper(MessageType.updatePoll,
			this.poll));
		this.poll.editing = false;
	}

	deletePoll() {
		this.pollService.send(Tools.messageWrapper(MessageType.deletePoll,
			{}));
	}

	receiveUpdatePoll(poll: Poll) {
		this.poll.title = poll.title;
		this.poll.users_can_add_questions = poll.users_can_add_questions;
	}

	receiveDeletePoll() {
		// TODO send a toast for poll deleted
		this.router.navigate(['/']);
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

	setEditable(data: any, editing: boolean = false) {
		if (data.user_id == this.userService.getUser().id) {
			data.editable = true;
			if (editing) {
				data.editing = true;
			}
		}
	}

	setEditableForList(data: Array<any>) {
		data.forEach(k => this.setEditable(k, false));
	}

	canCreateQuestion(): boolean {
		return (this.poll.users_can_add_questions) ||
			(this.poll.user_id == this.userService.getUser().id);
	}

	createQuestion() {
		this.pollService.send(Tools.messageWrapper(MessageType.createQuestion,
			{}));
	}

	receiveQuestion(question: Question) {
		Tools.setUserForObj(question, this.poll.users);
		this.setEditable(question, true);

		if (this.poll.questions === undefined) {
			this.poll.questions = [];
		}

		this.poll.questions.push(question);
	}

	receiveDeleteQuestion(data: any) {
		this.poll.questions = this.poll.questions.filter(q => q.id !== data.question_id);
	}

	receiveUpdateQuestion(question: Question) {
		Tools.setUserForObj(question, this.poll.users);
		this.setEditable(question);

		// Find the index with the matching id
		let index = this.poll.questions.findIndex(q => q.id == question.id);

		// just update the details
		let foundQuestion = this.poll.questions[index];
		foundQuestion.title = question.title;
		foundQuestion.threshold = question.threshold;
		foundQuestion.expire_time = question.expire_time;
		foundQuestion.users_can_add_candidates = question.users_can_add_candidates;

	}

	receiveCandidate(candidate: Candidate) {
		Tools.setUserForObj(candidate, this.poll.users);
		this.setEditable(candidate, true);
		let questionIndex = this.poll.questions.findIndex(q => q.id == candidate.question_id);
		if (this.poll.questions[questionIndex].candidates === undefined) {
			this.poll.questions[questionIndex].candidates = [];
		}
		this.poll.questions[questionIndex].candidates.push(candidate);
	}

	receiveDeleteCandidate(data: any) {
		let questionIndex = this.poll.questions.findIndex(q => q.id == data.question_id);
		this.poll.questions[questionIndex].candidates =
			this.poll.questions[questionIndex].candidates.filter(q => q.id !== data.candidate_id);
	}

	receiveUpdateCandidate(candidate: Candidate) {
		Tools.setUserForObj(candidate, this.poll.users);
		this.setEditable(candidate);

		// Find the index with the matching id
		let questionIndex = this.poll.questions.findIndex(q => q.id == candidate.question_id);
		let candidateIndex = this.poll.questions[questionIndex].candidates.findIndex(q => q.id == candidate.id);

		// just update the details
		let foundCandidate = this.poll.questions[questionIndex].candidates[candidateIndex];
		foundCandidate.title = candidate.title;
	}

	receiveVote(data: any) {

		let vote: Vote = data;
		Tools.setUserForObj(vote, this.poll.users);

		// Find the index
		let questionIndex = this.poll.questions.findIndex(q => q.id == data.question_id);
		let question = this.poll.questions[questionIndex];
		let candidateIndex = question.candidates.findIndex(c => c.id == data.candidate_id);
		let candidate = question.candidates[candidateIndex];
		if (candidate.votes === undefined) {
			candidate.votes = [];
		}
		let voteIndex = candidate.votes.findIndex(v => v.id == data.id);
		if (voteIndex == -1) {
			candidate.votes.push(vote);
		} else {
			candidate.votes[voteIndex] = vote;
		}

		// Set the candidate average score
		Tools.setCandidateAvgScore(candidate);

		// Sort the question by candidates
		Tools.sortCandidatesByScore(question);
	}

	receiveDeleteVote(data: any) {

		// Find the index
		let questionIndex = this.poll.questions.findIndex(q => q.id == data.question_id);
		let question = this.poll.questions[questionIndex];
		let candidateIndex = question.candidates.findIndex(c => c.id == data.candidate_id);
		let candidate = question.candidates[candidateIndex];
		let votes = candidate.votes;
		let voteIndex = votes.findIndex(v => v.id == data.id);

		votes.splice(voteIndex);
	}

}
