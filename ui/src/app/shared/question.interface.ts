import { Candidate } from './';

export interface Question {
	id: number;
	user_id: number;
	poll_id: number;
	title?: string;
	expire_time?: number;
	threshold: number;
	users_can_add_candidates: boolean;
	created: number;
	candidates?: Array<Candidate>;
}
