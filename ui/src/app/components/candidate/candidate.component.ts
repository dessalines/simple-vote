import { Component, OnInit, Input } from '@angular/core';

import { Candidate, Tools, MessageType } from '../../shared';

import { PollService } from '../../services';

@Component({
	selector: 'app-candidate',
	templateUrl: './candidate.component.html',
	styleUrls: ['./candidate.component.scss']
})
export class CandidateComponent implements OnInit {

	@Input() candidate: Candidate;

	constructor(private pollService: PollService) { }

	ngOnInit() {
	}

	deleteCandidate() {
		this.pollService.send(Tools.messageWrapper(MessageType.deleteCandidate,
			{ candidate_id: this.candidate.id }));
	}

}
