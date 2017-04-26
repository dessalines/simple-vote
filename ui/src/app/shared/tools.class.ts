import { MessageType , User, Candidate, Question } from './';

export class Tools {

	static setUsersForList(arr: Array<any>, users: Array<User>) {
		arr.forEach(k => Tools.setUserForObj(k, users));
	}

	static setUserForObj(obj: any, users: Array<User>) {
		obj.user = users.find(u => u.id === obj.user_id);
	}

	static messageWrapper(type: MessageType, data: any): string {
		return "{\"message_type\":" + type + ",\"data\":" + JSON.stringify(data) + "}";
	}

	static setCandidateAvgScore(c: Candidate) {
		if (c.votes && c.votes.length) {
			c.avg_score = c.votes.map(v => v.vote).reduce((v1, v2) => v1 + v2)/c.votes.length;
		}
	}

	static sortCandidatesByScore(q: Question) {
		q.candidates.sort((a, b) => (a.avg_score > b.avg_score) ? -1 : (a.avg_score < b.avg_score) ? 1 : 0);
	}
}