// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface User {
			id: string;
			username: string;
			email: string;
			role: 'ADMIN' | 'USER';
		}
		interface State {
			readonly user: User | null;
		}
		// interface Error {}
		interface Locals {
			user: User | null;
			authError: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
