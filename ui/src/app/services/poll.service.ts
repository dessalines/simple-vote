import { Injectable } from '@angular/core';
import { WebSocketConfig } from '../shared';
import { NG2WebSocket } from './';
import { environment } from '../../environments/environment';

@Injectable()
export class PollService {

	public ws: NG2WebSocket;

	public config: WebSocketConfig;

	private pollId: number;
	private topParentId: number;

	constructor() {
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
			alert('DERP');
			console.log(e);
		}
	}

	reconnect() {
		return this.connect(this.pollId);
	}


}
