import { userConstants } from "../constants";

const addMessage = (data) => dispatch => {
	function success(data) { return { type: userConstants.ADD_MESSAGE_SUCCESS, data } };
	dispatch(success(data));
};

const initRooms = (rooms) => dispatch => {
	function success(rooms) { return { type: userConstants.INIT_ROOMS_SUCCESS, rooms } };
	dispatch(success(rooms));
};

export const roomActions = {
	addMessage,
	initRooms
};