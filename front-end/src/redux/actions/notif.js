import { userConstants } from "../constants";

const initNotif = (notif) => dispatch => {
	function success(notif) { return { type: userConstants.INIT_NOTIF_SUCCESS, notif } };
	dispatch(success(notif));
};

const addNotif = (notif) => dispatch => {
	function success(notif) { return { type: userConstants.ADD_NOTIF_SUCCESS, notif } };
	dispatch(success(notif));
};

const readNotif = () => dispatch => {
	function success() { return { type: userConstants.READ_NOTIF_SUCCESS } };
	dispatch(success());
};

export const notifActions = {
	addNotif,
	initNotif,
	readNotif
};