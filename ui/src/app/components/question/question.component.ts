import { Component, OnInit, Input } from '@angular/core';

import { Question, Tools, MessageType, QuestionType } from '../../shared';

import { PollService, UserService } from '../../services';

@Component({
	selector: 'app-question',
	templateUrl: './question.component.html',
	styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

	@Input() question: Question;

	public showDetails: boolean = false;
	public _expireDate: string;

	constructor(private pollService: PollService,
		private userService: UserService) { }

	ngOnInit() {
	}

	toggleDetails() {
		this.showDetails = !this.showDetails;
	}

	toggleEditing() {
		this.question.editing = !this.question.editing;
	}

	detailsExpander() {
		return (this.showDetails) ? 'hide details' : 'show details';
	}

	deleteQuestion() {
		this.pollService.send(Tools.messageWrapper(MessageType.deleteQuestion,
			{ question_id: this.question.id }));
	}

	updateQuestion() {
		let question = Object.assign({}, this.question); // clone the questions
		delete question.candidates;
		this.pollService.send(Tools.messageWrapper(MessageType.updateQuestion,
			question));
		this.question.editing = false;
	}

	canCreateCandidate(): boolean {
		return (this.question.users_can_add_candidates) ||
			(this.question.user_id == this.userService.getUser().id);
	}

	createCandidate() {
		this.pollService.send(Tools.messageWrapper(MessageType.createCandidate,
			{
				question_id: this.
					question.id
			}));
	}

	isExpired(): boolean {
		if (this.question.expire_time) {
			return new Date(this.question.expire_time).getTime() < new Date().getTime();
		} else {
			return false;
		}
	}

	get expireDate(): string {
		return this._expireDate;
	}

	set expireDate(v: string) {
		this._expireDate = v;
		this.question.expire_time = v;
	}

}
