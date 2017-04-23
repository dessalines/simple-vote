import { Component, OnInit, Input } from '@angular/core';

import { Question } from '../../shared';

@Component({
	selector: 'app-question',
	templateUrl: './question.component.html',
	styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

	@Input() question: Question;

	private editing: boolean = false;
	private showDetails: boolean = false;

	constructor() { }

	ngOnInit() {
	}

	toggleDetails() {
		this.showDetails=!this.showDetails;
	}

	detailsExpander() {
		return (this.showDetails) ? '[-]' : '[+]';
	}

}
