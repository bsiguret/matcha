import { userConstants } from '../constants';

const initialState = {
	rooms: []
}

export function roomsReducer(state = initialState, action){
  switch(action.type){
		case userConstants.INIT_ROOMS_SUCCESS:
		return Object.assign({}, {
				...state,
				rooms: action.rooms
		});
		case userConstants.ADD_MESSAGE_SUCCESS:
			return Object.assign({}, {
				...state,
				rooms: {
					...state.rooms,
					...state.rooms[action.data.roomId].messages.push(action.data.message)
				}
			});
		case userConstants.LOGOUT:
			return {rooms: {}};
    default:
      return state;
  }
}