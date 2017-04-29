import { Component, OnInit, Input } from '@angular/core';

import {
	Poll,
	Comment,
	MessageType,
	Tools,
	User
} from '../../shared';

import { PollService } from '../../services';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

	@Input() poll: Poll;

	public comment: string;


	constructor(private pollService: PollService) { }

	ngOnInit() {
	}

	createComment() {
		this.pollService.send(Tools.messageWrapper(MessageType.createComment,
			{ comment: this.comment }));
		this.comment = undefined;
	}

	getActiveString(user: User): string {
		return user.active ? "active" : "inactive";
	}

}
