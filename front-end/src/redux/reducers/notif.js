import { userConstants } from '../constants';

const initialState = {
	notif: []
}

export function notifReducer(state = initialState, action){
  switch(action.type){
		case userConstants.INIT_NOTIF_SUCCESS:
		return Object.assign({}, {
				...state,
				notif: action.notif
		});
		case userConstants.ADD_NOTIF_SUCCESS:
			return {
				...state,
				notif: state.notif.concat(action.notif)
			}
		case userConstants.READ_NOTIF_SUCCESS:
			let notif = state.notif;
			notif.map((n) => {
				return (n.isRead = 1)
			})
			return {
				...state,
				notif: state.notif.splice(0, state.notif.length, ...notif)
			}
		case userConstants.LOGOUT:
			return {notif: []};
    default:
      return state;
  }
}