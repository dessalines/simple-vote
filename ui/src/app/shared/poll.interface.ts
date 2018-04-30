import { Question, Comment, User } from './';

export interface Poll {
	id: number;
	user_id: number;
	user?: User;
	title?: string;
	users_can_add_questions?: boolean;
	created: number;
	questions?: Array<Question>;
	comments?: Array<Comment>;
	users?: Array<User>;
	editable?: boolean;
	editing?: boolean;
	readOnly?: boolean;
}
