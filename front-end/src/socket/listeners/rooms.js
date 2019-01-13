import { roomActions } from "../../redux/actions/rooms";

const roomsListener = (dispatch, socket) => {
	socket.on('CLIENT/SIGNIN', function(rooms){
		dispatch(roomActions.initRooms(rooms.rooms));
	})
	socket.on('CLIENT/ADD_MESSAGE', function (data) {
		dispatch(roomActions.addMessage(data))
	});

	socket.on('disconnect', function () {
	});
};

export default roomsListener;