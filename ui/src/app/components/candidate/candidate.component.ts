import { Component, OnInit, Input } from '@angular/core';

import { Candidate, Tools, MessageType, Vote } from '../../shared';

import { PollService, UserService } from '../../services';

@Component({
	selector: 'app-candidate',
	templateUrl: './candidate.component.html',
	styleUrls: ['./candidate.component.scss']
})
export class CandidateComponent implements OnInit {

	@Input() candidate: Candidate;

	constructor(private pollService: PollService,
		private userService: UserService) { }

	ngOnInit() {}

	ngOnChanges(changes: any) {
	}

	toggleEditing() {
		this.candidate.editing = !this.candidate.editing;
	}

	deleteCandidate() {
		this.pollService.send(Tools.messageWrapper(MessageType.deleteCandidate,
			{
				question_id: this.candidate.question_id,
				candidate_id: this.candidate.id
			}));
	}

	updateCandidate() {
		this.pollService.send(Tools.messageWrapper(MessageType.updateCandidate,
			this.candidate));
		this.candidate.editing = false;
	}

	findMyVote(): number {
		if (this.candidate.votes) {
			let foundVote = this.candidate.votes.find(v => v.user_id == this.userService.getUser().id);
			if (foundVote) {
				return foundVote.vote;
			}
		} else {
			return 50;
		}

	}

	createOrUpdateVote(val: number) {
		this.pollService.send(Tools.messageWrapper(MessageType.createOrUpdateVote,
			{
				candidate_id: this.candidate.id,
				question_id: this.candidate.question_id,
				user_id: this.candidate.user_id,
				vote: Number(val) // cast vote to a number
			}));
	}

	deleteVote() {
		this.pollService.send(Tools.messageWrapper(MessageType.deleteVote,
			{
				candidate_id: this.candidate.id,
				question_id: this.candidate.question_id,
				user_id: this.candidate.user_id,
			}));
	}



}
