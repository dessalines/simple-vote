import { Vote } from './';

export interface Candidate {
	id: number;
	user_id: number;
	question_id: number;
	title?: string;
	created: number;
	votes?: Array<Vote>;
}
