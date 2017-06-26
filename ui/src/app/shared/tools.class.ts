import { MessageType, User, Candidate, Question } from './';

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
			c.avg_score = c.votes.map(v => v.vote).reduce((v1, v2) => v1 + v2) / c.votes.length;
		} else {
			c.avg_score = undefined;
		}
	}

	static sortCandidatesByScore(q: Question) {
		let maxVotes: number = 0;
		q.candidates.forEach(c => {
			if (c.votes && c.votes.length > maxVotes) {
				maxVotes = c.votes.length;
			}
		});

		let threshold = maxVotes * q.threshold / 100;

		q.candidates.sort((a, b) => {

			// If there is no average
			if (b.avg_score === undefined) {
				return -1;
			}
			if (a.avg_score === undefined) {
				return 1;
			}

			let aMeetsThreshold: boolean = (a.votes) ? a.votes.length > threshold : true;
			let bMeetsThreshold: boolean = (b.votes) ? b.votes.length > threshold : true;

			// The special cases for not meeting the threshold
			if (aMeetsThreshold && bMeetsThreshold) {
				let calc = (a.avg_score == b.avg_score) ? 0 : +(a.avg_score < b.avg_score) || -1;
				return calc;
			} else if (aMeetsThreshold && !bMeetsThreshold) {
				return -1;
			} else if (bMeetsThreshold && !aMeetsThreshold) {
				return 1;
			} else if (!aMeetsThreshold && !bMeetsThreshold) {
				return 0;
			}

		});
	}
}