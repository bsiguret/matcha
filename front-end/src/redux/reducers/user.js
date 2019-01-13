import { userConstants } from '../constants';


export function userReducer(state={user: {isVerified: 0, isCompleted: 0}}, action) {
	switch(action.type) {
		case userConstants.GETUSER_REQUEST:
			return Object.assign({}, state, {
				...state,
			});
		case userConstants.GETUSER_SUCCESS:
			return Object.assign({}, state, {
				...state,
				user: {
					...state.user,
					...action.user
				}
			});
		case userConstants.GETPROFILE_REQUEST:
		return Object.assign({}, state, {
			...state,
			profile: action.username
		});
		case userConstants.GETPROFILE_SUCCESS:
			return Object.assign({}, state, {
				...state,
				profile: action.profile,
			});
		case userConstants.LIKE_REQUEST:
		return Object.assign({}, state, {
			...state,
		});
		case userConstants.LIKE_SUCCESS:
			return Object.assign({}, state, {
				profile: {
					...state.profile,
					didLike: action.didLike,
					score: action.score
				}
			});
		case userConstants.LIKEMATCH_SUCCESS:
			let newState = Object.assign({}, {
				...state,
				matchs: {
					...state.matchs,
					[action.arrayId]: {
						...state.matchs[action.arrayId],
						didLike: action.didLike,
						score: action.score
					}
				}
			});
			newState.matchs = Object.keys(newState.matchs).map(function(key) {
				return newState.matchs[key];
			});
			return newState;
		case userConstants.BLOCK_REQUEST:
			return Object.assign({}, state, {
				...state,
			});
		case userConstants.BLOCK_SUCCESS:
			return Object.assign({}, state, {
				profile: {
					...state.profile,
					blocked: action.blocked
				}
			});
		case userConstants.REPORT_REQUEST:
			return Object.assign({}, state, {
				...state,
			});
		case userConstants.REPORT_SUCCESS:
			return Object.assign({}, state, {
				...state
			});
		case userConstants.GETVISITS_REQUEST:
			return Object.assign({}, state, {
				...state,
				visits: {}
			});
		case userConstants.GETVISITS_SUCCESS:
			return Object.assign({}, state, {
				...state,
				visits: action.visits
			});
		case userConstants.GETMATCH_REQUEST:
			return Object.assign({}, state, {
				...state,
				matchs: {}
			});
		case userConstants.GETMATCH_SUCCESS:
			return Object.assign({}, state, {
				...state,
				matchs: action.match
			});
		case userConstants.SIGNUP_REQUEST:
			return Object.assign({}, state, {
				...state,
				user: action.user
			});
		case userConstants.SIGNUP_SUCCESS:
			return Object.assign({}, state, {
				...state,
				user: action.user
			});
		case userConstants.UPDATE_REQUEST:
		return Object.assign({}, state, {
			...state
		});
		case userConstants.UPDATE_SUCCESS:
		return Object.assign({}, state, {
			...state,
			user: {
				...state.user,
				...action.user
			}
		});
		case userConstants.UPDATEPHOTO_REQUEST:
		return Object.assign({}, state, {
			...state
		});
		case userConstants.UPDATEPHOTO_SUCCESS:
		return Object.assign({}, state, {
			...state,
			user: {
				...state.user,
				photos: [...action.photos]
			}
		});
		case userConstants.DELETEPHOTO_REQUEST:
		return Object.assign({}, state, {
			...state
		});
		case userConstants.DELETEPHOTO_SUCCESS:
		return Object.assign({}, state, {
			...state,
			user: {
				...state.user,
				photos: [...action.photos]
			}
		});
		case userConstants.UPDATE_USERSCONNECTED_SUCCESS:
		return Object.assign({}, state, {
			...state,
			userconnected: action.userconnected
		});
		case userConstants.LOGOUT:
			return {user: {}};
		default:
			return state;
	}
}