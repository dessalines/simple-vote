import { User } from './';

export interface Comment {
	id: number;
	user_id: number;
	user: User;
	poll_id: number;
	comment: string;
	created: number;
	editable?: boolean;
}
