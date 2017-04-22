import { Question, Comment, User } from './';

export interface Poll {
	id: number;
	user_id: number;
	title?: string;
	created: number;
	questions?: Array<Question>;
	comments?: Array<Comment>;
	users?: Array<User>;
}
