import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Http, Response } from '@angular/http';
import { environment } from '../../environments/environment';

import { User } from '../shared';

@Injectable()
export class UserService {

	private user: User;

	private newUserUrl: string = environment.endpoint + 'new_user';

	constructor() { }

}
