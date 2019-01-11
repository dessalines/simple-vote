import { MessageType, User, Candidate, Question, DecodedHashId } from './';

import {default as Hashids} from 'hashids';

export class Tools {

	static hashIdReadOnlyPrefix: string = "vgnzu";

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
			c.meetsThreshold = true;
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

			a.meetsThreshold = (a.votes) ? a.votes.length > threshold : true;
			b.meetsThreshold = (b.votes) ? b.votes.length > threshold : true;

			if (a.meetsThreshold && b.meetsThreshold) {
				// approval goes by count if the votes are the same
				if (a.avg_score == b.avg_score) {
					if (a.votes.length == b.votes.length) {
						return 0;
					} else if (a.votes.length > b.votes.length) {
						return -1;
					} else {
						return 1;
					}
				}
				else if (a.avg_score > b.avg_score) {
					return -1;
				} else {
					return 1;
				}
			}
			// The special cases for not meeting the threshold
			else if (a.meetsThreshold && !b.meetsThreshold) {
				return -1;
			} else if (b.meetsThreshold && !a.meetsThreshold) {
				return 1;
			} else if (!a.meetsThreshold && !b.meetsThreshold) {
				return 0;
			}

		});
	}


	static decodeHashId(hashId: string): DecodedHashId {
		let hashids = new Hashids("");
		if (hashId.startsWith(this.hashIdReadOnlyPrefix)) {
			return {
				id: hashids.decode(hashId.split(this.hashIdReadOnlyPrefix)[1])[0],
				readOnly: true
			}
		} else {
			return {
				id: hashids.decode(hashId)[0],
				readOnly: false
			}
		}
	}

	static encodeHashId(id: number, readOnly: boolean = false): string {
		let hashids = new Hashids("");

		if (!readOnly) {
			return hashids.encode(id);
		} else {
			return this.hashIdReadOnlyPrefix + hashids.encode(id);
		}

	}

	static createCookie(name, value, days) {
		var expires = "";
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + value + expires + "; path=/";
	}

	static readCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	}

	static eraseCookie(name) {
		this.createCookie(name, "", -1);
	}
}