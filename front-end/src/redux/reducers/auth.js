import { userConstants } from '../constants';

let user = JSON.parse(localStorage.getItem('user'));
const initialState = user ? { isAuth: true, user } : { isAuth: false };

export function authReducer(state = initialState, action) {
	switch (action.type) {
		case userConstants.LOGIN_REQUEST:
		return {
			user: action.username
		}
		case userConstants.LOGIN_SUCCESS:
			return {
				isAuth: true,
				user: action.token
			};
		case userConstants.RESENDEMAIL_REQUEST:
			return {
				user: action.email
			};
		case userConstants.RESENDEMAIL_SUCCESS:
			return {
				user: action.email
			};
		case userConstants.RESETPASS_REQUEST:
			return {
				user: {
					...action.user,
					...action.username
				}
			};
		case userConstants.RESETPASS_SUCCESS:
			return {
				...action.user,
				...action.username
			};
		case userConstants.LOGOUT:
			return {isAuth: false};
		default:
			return state;
	}
}