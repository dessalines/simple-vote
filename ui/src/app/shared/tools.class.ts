import { MessageType , User} from './';

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
}