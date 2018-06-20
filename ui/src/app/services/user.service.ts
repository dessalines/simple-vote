import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

import { User, Tools } from '../shared';

@Injectable()
export class UserService {

	private user: User;

	private userUrl: string = environment.endpoint + 'user';
	private loginUrl: string = environment.endpoint + 'login';
	private signupUrl: string = environment.endpoint + 'signup';

	private jwtHelper: JwtHelperService = new JwtHelperService();

	private userSource = new BehaviorSubject<User>(this.user);
	public userObservable = this.userSource.asObservable();

	getOptions(): RequestOptions {
		let headers = new Headers({
			// 'Content-Type': 'application/json',
			'token': this.getUser().jwt
		});
		return new RequestOptions({ headers: headers });
	}

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
			jwt: jwt,
			fullUser: dJWT.full_user
		};
		this.sendLoginEvent();
	}

	public getUser(): User {
		return this.user;
	}

	login(usernameOrEmail: string, password: string): Observable<string> {
		let reqBody: string = JSON.stringify({ usernameOrEmail, password });
		return this.http.post(this.loginUrl, reqBody)
			.map(r => r.text())
			.catch(this.handleError);
	}

	signup(username: string, password: string, verifyPassword: string, email: string): Observable<string> {
		let options = (this.getUser()) ? this.getOptions() : null;
		let reqBody: string = JSON.stringify({ username, password, verifyPassword, email });
		return this.http.post(this.signupUrl, reqBody, options)
			.map(r => r.text())
			.catch(this.handleError);
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

	sendLoginEvent() {
		this.userSource.next(this.user);
	}

	private handleError(error: any) {
		// We'd also dig deeper into the error to get a better message
		let errMsg = error._body;
		return Observable.throw(errMsg);
	}


}
