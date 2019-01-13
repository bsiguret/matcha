import a from '../services/auth';
import { userConstants } from '../constants';
import { userActions } from './user';
import { history } from '../../helpers/history';
import { notifActions } from './notif';


const login = (username, password, ip, lon, lat) => async dispatch => {
	function request(username) { return { type: userConstants.LOGIN_REQUEST, username } };
	function success(token) { return { type: userConstants.LOGIN_SUCCESS, token } };
	dispatch(request(username));
	let res = await a.login(username, password, ip, lon, lat)
		.then(
			async res => {
				if (res.status !== 200) {
					return res.data;
				}
				else {
					dispatch(userActions.getUserData(res.data.token))
					.then(
						response => {
							if (response === 200) {
								dispatch(success(res.data.token))
								dispatch(notifActions.initNotif(res.data.notifications))
							}
							else {
								dispatch(authActions.logoutUser());
								history.push('/yourenotsupposedtobehere/500');
							}
						}
					);
					return;
				}
		});
	return res;
};

const oauth = (code, ip, lon, lat) => async dispatch => {
	function request() { return { type: userConstants.LOGIN_REQUEST, } };
	function success(token) { return { type: userConstants.LOGIN_SUCCESS, token } };
	dispatch(request());
	let res = await a.oauth(code, ip, lon, lat)
		.then(
			async res => {
				if (res.status !== 200) {
					return res.data;
				}
				else {
					dispatch(userActions.getUserData(res.data.token))
					.then(
						response => {
							if (response === 200) {
								dispatch(success(res.data.token))
								dispatch(notifActions.initNotif(res.data.notifications))
							}
							else {
								dispatch(authActions.logoutUser());
								history.push('/yourenotsupposedtobehere/500');
							}
						}
					);
					return;
				}
		});
	return res;
};

const resendEmail = (email) => async dispatch => {
	function request(email) { return { type: userConstants.RESENDEMAIL_REQUEST, email } };
	function success(email) { return { type: userConstants.RESENDEMAIL_SUCCESS, email } };
	dispatch(request(email));
	let res = await a.resendEmail(email)
		.then(
			async res => {
				if (res.status !== 200) {
					return res;
				}
				else {
					dispatch(success(email))
					return res;
				}
		});
	return res;
};

const resetPassEmail = (email) => async dispatch => {
	function request() { return { type: userConstants.RESETPASSEMAIL_REQUEST } };
	function success() { return { type: userConstants.RESETPASSEMAIL_SUCCESS } };
	dispatch(request());
	let res = await a.resetPassEmail(email)
		.then(
			async res => {
				if (res.status !== 200) {
					return res;
				}
				else {
					dispatch(success())
					return res;
				}
		});
	return res;
};

const resetPass = (npassword, cpassword, username, token) => async dispatch => {
	function request() { return { type: userConstants.RESETPASS_REQUEST } };
	function success() { return { type: userConstants.RESETPASS_SUCCESS } };
	dispatch(request());
	let res = await a.resetPass(npassword, cpassword, username, token)
		.then(
			async res => {
				if (res.status !== 200) {
					return res;
				}
				else {
					dispatch(success())
					return res;
				}
		});
	return res;
};

const logoutUser = () => {
	a.logout();
	return { type: userConstants.LOGOUT };
};

export const authActions = {
	login,
	oauth,
	resendEmail,
	resetPass,
	resetPassEmail,
	logoutUser
};