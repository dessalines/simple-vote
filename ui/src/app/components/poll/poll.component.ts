import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Title } from '@angular/platform-browser';

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
	Tools,
	DecodedHashId,
	UserListMatch
} from '../../shared';

import * as Clipboard from 'clipboard/dist/clipboard.min.js';

@Component({
	selector: 'app-poll',
	templateUrl: './poll.component.html',
	styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit {

	private paramsSub: any;
	private pollSub: any;

	private decodedPollId: DecodedHashId;

	public poll: Poll;

	public showDetails: boolean = false;
	public showHelp: boolean = false;

	private websocketSoftClose: boolean = false;
	public isLoading: boolean = false;
	private initEditing: boolean = false;

	private reconnnectTimeWaitMS: number = 10000;

	@ViewChild('reconnectModal') private reconnectModal: ModalDirective;

	constructor(private pollService: PollService,
		private userService: UserService,
		private route: ActivatedRoute,
		private router: Router,
		private titleService: Title) { }

	ngOnInit() {
		this.isLoading = true;
		new Clipboard('.clipboard-link');
		this.init();
	}

	toggleDetails() {
		this.showDetails = !this.showDetails;
	}

	toggleHelp() {
		this.showHelp = !this.showHelp;
	}

	toggleEditing() {
		this.poll.editing = !this.poll.editing;
	}

	detailsExpander() {
		return (this.showDetails) ? 'hide details' : 'show details';
	}

	init() {
		this.paramsSub = this.route.params.subscribe(params => {
			this.userService.userObservable.subscribe(user => {
				if (user) {
					this.decodedPollId = Tools.decodeHashId(params["pollId"]);
					this.pollService.connect(this.decodedPollId.id);

					this.initEditing = params["editing"];

					this.subscribeToPoll();
				}
			});
		});
	}

	subscribeToPoll() {
		this.pollSub = this.pollService.ws.getDataStream().
			subscribe(res => {
				this.update(res.data);
				this.isLoading = false;
			});
	}

	ngOnDestroy() {
		this.unloadSubscriptions();
		this.paramsSub.unsubscribe();
		clearInterval(this.websocketCloseWatcher);
	}

	unloadSubscriptions() {
		this.websocketSoftClose = true;
		this.pollService.ws.close(true);
		this.pollSub.unsubscribe();
		console.log('Destroying poll sub');
	}

	websocketCloseWatcher = setInterval(() => {
		let readyState = this.pollService.ws.getReadyState();
		if (readyState != 1) {
			this.websocketReconnect();
		}
	}, this.reconnnectTimeWaitMS);

	websocketReconnect() {
		this.pollService.connect(this.decodedPollId.id);
		this.subscribeToPoll();
		this.reconnectModal.hide();
		console.log('Reconnecting to websocket');
	}

	update(dataStr: string) {
		let msg = JSON.parse(dataStr);

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
			case MessageType.deleteComment:
				this.receiveDeleteComment(msg.data);
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
			case MessageType.Ping:
				this.sendPong();
				break;
			default:
				alert('wrong message: ' + dataStr);
		}
	}

	setPoll(data: Poll) {
		this.poll = data;
		this.updatePageTitle();

		this.poll.readOnly = this.decodedPollId.readOnly;
		this.setEditable(this.poll);

		if (this.poll.editable && this.initEditing) {
			this.poll.editing = true;
		}
	}

	setPollUsers(data: Array<User>) {
		this.poll.users = data;
		Tools.setUserForObj(this.poll, this.poll.users);
	}

	setPollActiveUsers(data: Array<User>) {

		// first set all users to inactive
		for (let user of this.poll.users) {
			user.active = false;
		}


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

		// Sort by active on top
		this.poll.users.sort((a, b) => (a.active === b.active) ? 0 : a.active ? -1 : 1);
	}

	setPollComments(data: Array<Comment>) {
		this.poll.comments = data;
		this.scrollToBottomOfTable();

		this.setEditableForList(this.poll.comments);
		Tools.setUsersForList(this.poll.comments, this.poll.users);
	}

	setPollQuestions(data: Array<Question>) {
		this.poll.questions = data;

		this.setEditableForList(this.poll.questions);
		this.setReadOnlyForList(this.poll.questions);
		Tools.setUsersForList(this.poll.questions, this.poll.users);
	}

	setPollCandidates(data: Array<Candidate>) {
		for (let question of this.poll.questions) {
			question.candidates = data.filter(c => c.question_id === question.id);

			this.setEditableForList(question.candidates);
			this.setReadOnlyForList(question.candidates);
			Tools.setUsersForList(question.candidates, this.poll.users);
		}
	}

	setPollVotes(data: Array<Vote>) {
		for (let question of this.poll.questions) {
			for (let candidate of question.candidates) {
				candidate.votes = data.filter(c => c.candidate_id === candidate.id);

				Tools.setCandidateAvgScore(candidate);

				this.setEditableForList(candidate.votes);
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

		// Removing editing from the window location hash
		window.history.pushState('', 'title', window.location.hash.split(";")[0]);
	}

	deletePoll() {
		this.pollService.send(Tools.messageWrapper(MessageType.deletePoll,
			{}));
	}

	receiveUpdatePoll(poll: Poll) {
		this.poll.title = poll.title;
		this.updatePageTitle();
		this.poll.users_can_add_questions = poll.users_can_add_questions;
		this.poll.predefined_user_list = poll.predefined_user_list;
	}

	receiveDeletePoll() {
		this.router.navigate(['/']);
	}

	receiveComment(comment: Comment) {
		this.setEditable(comment);
		Tools.setUserForObj(comment, this.poll.users);
		this.poll.comments.push(comment);
		this.scrollToBottomOfTable();
	}

	scrollToBottomOfTable() {
		setTimeout(() => {
			let objDiv = document.getElementById("table");
			if (objDiv) {
				objDiv.scrollTop = objDiv.scrollHeight;
			}
		}, 50);

	}

	setEditable(data: any, editing: boolean = false) {
		if (data.user_id == this.userService.getUser().id || this.poll.user_id == this.userService.getUser().id) {
			data.editable = true;
			if (data.user_id == this.userService.getUser().id && editing) {
				data.editing = true;
			}
		}
	}

	setEditableForList(data: Array<any>) {
		data.forEach(k => this.setEditable(k, false));
	}

	setReadOnlyForList(data: Array<any>) {
		data.forEach(k => k.readOnly = this.poll.readOnly);
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
		foundQuestion.anonymous = question.anonymous;
		foundQuestion.question_type_id = question.question_type_id;
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
		this.setEditable(vote);
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
		let voteIndex = votes.findIndex(v => v.user_id == data.user_id);

		// Remove the vote
		votes.splice(voteIndex, 1);

		// Set the candidate average score
		Tools.setCandidateAvgScore(candidate);

		// Sort the question by candidates
		Tools.sortCandidatesByScore(question);
	}

	receiveDeleteComment(data: any) {
		let commentIndex = this.poll.comments.findIndex(c => c.id == data.comment_id);
		this.poll.comments.splice(commentIndex, 1);
	}

	sendPong() {
		console.debug("Received ping, sending pong");
		this.pollService.send(Tools.messageWrapper(MessageType.Pong,
			{}));
	}

	exportPoll() {
		let pollJson: string = JSON.stringify(this.poll, null, 2);

		var pom = document.createElement('a');
		pom.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(pollJson));
		pom.setAttribute('download', 'poll.json');

		if (document.createEvent) {
			var event = document.createEvent('MouseEvents');
			event.initEvent('click', true, true);
			pom.dispatchEvent(event);
		}
		else {
			pom.click();
		}
	}

	updatePageTitle() {
		let title = (this.poll.title != null) ? this.poll.title : 'Unnamed Poll';
		this.titleService.setTitle(title + ' - SimpleVote');
	}

	getShareLink(readOnly: boolean = false) {
		if (!readOnly || this.poll.readOnly) {
			return window.location.href;
		} else {
			return window.location.origin + "/#/poll/" +
				Tools.hashIdReadOnlyPrefix +
				window.location.hash.split("/")[2];
		}
	}

	userListMatches(): Array<UserListMatch> {

		let ulms = [];
		let participation = 0;
		for (let userSearchString of this.poll.predefined_user_list.split(",")) {
			let ulm: UserListMatch = {
				text: userSearchString
			};
			let index = this.poll.users.findIndex(u => u.name.toLowerCase().includes(ulm.text.toLowerCase()));
			if (index != -1) {
				ulm.user = this.poll.users[index];
				participation++;
			}
			ulms.push(ulm);
		}
		this.poll.userListMatches = ulms;
		this.poll.participationCount = participation;
		this.poll.participationPct = participation / ulms.length * 100;
		return ulms;
	}



}
