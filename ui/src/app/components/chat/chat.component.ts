import { Component, OnInit, Input } from '@angular/core';

import {
	Poll,
	Comment,
	MessageType,
	Tools
} from '../../shared';

import { PollService } from '../../services';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

	@Input() poll: Poll;

	private comment: string;


	constructor(private pollService: PollService) { }

	ngOnInit() {
	}

	createComment() {
		this.pollService.send(Tools.messageWrapper(MessageType.createComment,
			{ comment: this.comment }));
		this.comment = undefined;
	}

}
