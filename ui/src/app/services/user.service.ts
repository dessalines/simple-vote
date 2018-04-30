import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { JwtHelper } from 'angular2-jwt';

import { User, Tools } from '../shared';

@Injectable()
export class UserService {

	private user: User;

	private userUrl: string = environment.endpoint + 'user';
	private jwtHelper: JwtHelper = new JwtHelper();

	constructor(private http: Http) {
		this.setUserFromCookie();
	}

	public setUserFromCookie() {
		let jwt = Tools.readCookie('jwt');
		if (jwt) {
			this.setUser(jwt);
		}
	}

	private setUser(jwt: string) {
		let dJWT = this.jwtHelper.decodeToken(jwt);
		this.user = {
			id: dJWT.user_id,
			name: dJWT.user_name,
			jwt: jwt
		};
	}

	public getUser(): User {
		return this.user;
	}

	createNewUser(nameStr: string): Observable<string> {
		let name = JSON.stringify({ name: nameStr });

		return this.http.post(this.userUrl, name)
			.map(r => r.text())
			.catch(this.handleError);
	}

	updateUser(nameStr: string): Observable<string> {
		let info = JSON.stringify({ name: nameStr, user_id: this.user.id });

		return this.http.put(this.userUrl, info)
			.map(r => r.text())
			.catch(this.handleError);
	}

	private handleError(error: any) {
		// We'd also dig deeper into the error to get a better message
		let errMsg = error._body;
		return Observable.throw(errMsg);
	}


}
