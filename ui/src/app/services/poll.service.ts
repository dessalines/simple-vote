import { Injectable } from '@angular/core';
import { WebSocketConfig } from '../shared';
import { NG2WebSocket } from './ng2-websocket';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';

import { Poll } from '../shared';
import { UserService } from './user.service';

@Injectable()
export class PollService {

	private createPollUrl: string = environment.endpoint + 'create_poll';

	getOptions(): RequestOptions {
		let headers = new Headers({
			// 'Content-Type': 'application/json',
			'token': this.userService.getUser().jwt
		});
		return new RequestOptions({ headers: headers });
	}

	public ws: NG2WebSocket;
	public config: WebSocketConfig;

	private pollId: number;
	private topParentId: number;

	constructor(private http: Http,
		private userService: UserService) {
	}

	connect(pollId: number) {
		this.pollId = pollId;

		let url = environment.websocket + "?pollId=" + pollId;
		this.ws = new NG2WebSocket(url);
		this.ws.connect();

	}

	send(data) {
		try {
			this.ws.send(data);
		} catch (e) {
			console.log('aaaah I died');
			console.log(e);
		}
	}

	reconnect() {
		return this.connect(this.pollId);
	}

	createPoll(): Observable<Poll> {
		return this.http.post(this.createPollUrl, null, this.getOptions())
			.map(r => r.json())
			.catch(this.handleError);
	}

	private handleError(error: any) {
		// We'd also dig deeper into the error to get a better message
		let errMsg = error._body;
		return Observable.throw(errMsg);
	}

}
