export interface User {
	name: string;
	id: number;
	jwt: string;
	active?: boolean;
	fullUser?: boolean;
}
