import { notifActions } from "../../redux/actions/notif";

const notifListener = (dispatch, socket) => {
	socket.on('CLIENT/ADD_LIKE', function(data){
		dispatch(notifActions.addNotif(data))
	})
	socket.on('CLIENT/ADD_DISLIKE', function (data) {
		dispatch(notifActions.addNotif(data))
	});

	socket.on('CLIENT/ADD_VISIT', function (data) {
		dispatch(notifActions.addNotif(data))
	});

	socket.on('CLIENT/ADD_MATCH', function (data) {
		dispatch(notifActions.addNotif(data))
	});

	socket.on('CLIENT/ADD_UNMATCH', function (data) {
		dispatch(notifActions.addNotif(data))
	});
	socket.on('CLIENT/READ_NOTIF', function () {
		dispatch(notifActions.readNotif())
	});
	socket.on('CLIENT/ADD_NOTIF_MESSAGE', function(data){
		dispatch(notifActions.addNotif(data))
	})
};

export default notifListener;