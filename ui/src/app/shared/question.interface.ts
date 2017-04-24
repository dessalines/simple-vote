import { Candidate, User } from './';

export interface Question {
	id: number;
	user_id: number;
	user: User;
	poll_id: number;
	title?: string;
	expire_time?: number;
	threshold: number;
	users_can_add_candidates: boolean;
	created: number;
	candidates?: Array<Candidate>;
	editable?: boolean;
	editing?: boolean;
}
