import u from '../services/user';
import { userConstants } from '../constants';

const getUserData = (token) => async dispatch => {
	function request(user) { return { type: userConstants.GETUSER_REQUEST, user} };
	function success(user) { return { type: userConstants.GETUSER_SUCCESS, user} };

	dispatch(request(token));
	let res = await u.getUser(token)
		.then(
			res => {
				if (res.status === 200) {
					dispatch(success(res.data));
					return res.status;
				}
				else
					return res;
			}
		);
	return res;
}

const getVisits = (token) => async dispatch => {
	function request() { return { type: userConstants.GETVISITS_REQUEST } };
	function success(visits) { return { type: userConstants.GETVISITS_SUCCESS, visits} };

	dispatch(request());
	let res = await u.getVisits(token)
		.then(
			res => {
				if (res.status === 200) {
					dispatch(success(res.data));
					return res.status;
				}
				else
					return res.status;
			}
		);
	return res;
}

const getProfile = (token, username) => async dispatch => {
	function request(username) { return { type: userConstants.GETPROFILE_REQUEST, username } };
	function success(profile) { return { type: userConstants.GETPROFILE_SUCCESS, profile} };

	dispatch(request(username));
	let res = await u.getProfile(token, username)
		.then(
			res => {
				if (res.status === 200) {
					dispatch(success(res.data));
					return res;
				}
				else
					return res;
			}
		);
	return res;
}

const getMatch = (token) => async dispatch => {
	function request() { return { type: userConstants.GETMATCH_REQUEST } };
	function success(match) { return { type: userConstants.GETMATCH_SUCCESS, match} };

	dispatch(request());
	let res = await u.getMatch(token)
		.then(
			res => {
				if (res.status === 200) {
					dispatch(success(res.data));
					return res;
				}
				else
					return res;
			}
		);
	return res;
}

const postMatch = (token, filter) => async dispatch => {
	function request() { return { type: userConstants.GETMATCH_REQUEST } };
	function success(match) { return { type: userConstants.GETMATCH_SUCCESS, match} };

	dispatch(request());
	let res = await u.postMatch(token, filter)
		.then(
			res => {
				if (res.status === 200) {
					dispatch(success(res.data));
					return res;
				}
				else
					return res;
			}
		);
	return res;
}

const like = (token, username, love, arrayId) => async dispatch => {
	function request() { return { type: userConstants.LIKE_REQUEST } };
	function success(didLike, score) { return { type: userConstants.LIKE_SUCCESS, didLike, score} };
	function matchSuccess(didLike, score) { return { type: userConstants.LIKEMATCH_SUCCESS, didLike, score, arrayId} };

	dispatch(request());
	let res = await u.like(token, username, love)
		.then(
			res => {
				if (res.status === 200) {
					if (arrayId)
						dispatch(matchSuccess(res.data.didLike, res.data.score, arrayId));
					else
						dispatch(success(res.data.didLike, res.data.score));
					return res;
				}
				else
					return res;
			}
		);
	return res;
}

const signup = (user) => async dispatch => {
	function request(user) { return { type: userConstants.SIGNUP_REQUEST, user} };
	function success(user) { return { type: userConstants.SIGNUP_SUCCESS, user} };

	dispatch(request(user.username));
	let res = await u.signup(user)
		.then(
			res => {
				if (res.status !== 200) {
					return res.data;
				}
				else
					dispatch(success(res.data));
					return;
			}
		);
	return res;
}

const block = (username, token) => async dispatch => {
	function request() { return { type: userConstants.BLOCK_REQUEST} };
	function success(blocked) { return { type: userConstants.BLOCK_SUCCESS, blocked} };

	dispatch(request());
	let res = await u.block(username, token)
		.then(
			res => {
				if (res.status !== 200) {
					return res;
				}
				else
					dispatch(success(res.data.blocked));
					return res;
			}
		);
	return res;
}

const report = (username, token) => async dispatch => {
	function request() { return { type: userConstants.REPORT_REQUEST} };
	function success() { return { type: userConstants.REPORT_SUCCESS} };

	dispatch(request());
	let res = await u.report(username, token)
		.then(
			res => {
				if (res.status !== 200) {
					return res;
				}
				else
					dispatch(success());
					return res;
			}
		);
	return res;
}

const edit = (user, token) => async dispatch => {
	function request(user) { return { type: userConstants.UPDATE_REQUEST, user} };
	function success(user) { return { type: userConstants.UPDATE_SUCCESS, user} };
	dispatch(request(user));
	let res = await u.edit(user, token)
	.then(
		res => {
			if (res.status !== 200) {
				return res;
			}
			else {
				dispatch(success(res.data.newInfo));
				return res;
			}
		}
	);
return res;
}

const savePhoto = (photo, defineAs, token) => async dispatch => {
	function request() { return { type: userConstants.UPDATEPHOTO_REQUEST} };
	function success(photos) { return { type: userConstants.UPDATEPHOTO_SUCCESS, photos} };
	dispatch(request());
	let res = await u.savePhoto(photo, defineAs, token)
	.then(
		res => {
			if (res.status !== 200) {
				return res;
			}
			else {
				dispatch(success(res.data.photos));
				return res;
			}
		}
	);
return res;
}

const deletepic = (src, token) => async dispatch => {
	function request() { return { type: userConstants.DELETEPHOTO_REQUEST} };
	function success(photos) { return { type: userConstants.DELETEPHOTO_SUCCESS, photos} };

	dispatch(request());
	let res = await u.deletepic(src, token)
		.then(
			res => {
				if (res.status !== 200) {
					return res;
				}
				else
					dispatch(success(res.data.photos));
					return res;
			}
		);
	return res;
}

const updateUsersConnected = (userconnected) => dispatch => {
	function success(userconnected) { return { type: userConstants.UPDATE_USERSCONNECTED_SUCCESS, userconnected } };
	dispatch(success(userconnected));
};

export const userActions = {
	getUserData,
	getProfile,
	getMatch,
	postMatch,
	getVisits,
	like,
	block,
	report,
	signup,
	edit,
	savePhoto,
	deletepic,
	updateUsersConnected
};