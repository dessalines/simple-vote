import { Component, OnInit, Input } from '@angular/core';

import {
	Poll,
	Comment,
	MessageType,
	Tools,
	User
} from '../../shared';

import { PollService, UserService } from '../../services';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

	@Input() poll: Poll;

	public comment: string;


	constructor(private pollService: PollService,
		private userService: UserService) { }

	ngOnInit() {
	}

	createComment() {
		this.pollService.send(Tools.messageWrapper(MessageType.createComment,
			{ comment: this.comment }));
		this.comment = undefined;
	}

	deleteComment(comment: Comment) {
		this.pollService.send(Tools.messageWrapper(MessageType.deleteComment,
			{ comment_id: comment.id }));
	}

	deleteVotes(user: User) {

		this.poll.questions.forEach(q => {
			q.candidates.forEach(c => {
				c.votes.forEach(v => {
					if (v.user_id === user.id) {
						this.pollService.send(Tools.messageWrapper(MessageType.deleteVote,
							{
								candidate_id: c.id,
								question_id: q.id,
								user_id: Number(user.id),
							}));
					}
				});
			});
		});

	}

	getActiveString(user: User): string {
		return user.active ? "active" : "inactive";
	}

}
