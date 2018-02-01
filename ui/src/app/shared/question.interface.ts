import { Candidate, User } from './';

export interface Question {
	id: number;
	user_id: number;
	user: User;
	poll_id: number;
	title?: string;
	expire_time?: string;
	threshold: number;
	users_can_add_candidates: boolean;
	anonymous: boolean;
	question_type_id: number;
	created: number;
	candidates?: Array<Candidate>;
	editable?: boolean;
	editing?: boolean;
	readOnly?: boolean;
}
