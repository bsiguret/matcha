import roomsListener from './rooms';
import notifListener from './notif'
import { userActions } from '../../redux/actions/user';

const defaultListener = (dispatch, socket) => {
	socket.on('connect', function () {
		let token = JSON.parse(localStorage.getItem('user'));
		if (token) {
			socket.emit('SERVER/SIGNIN', {
				sessionToken: token,
				socketID: socket.id
			});
		}
	});

	socket.on('disconnect', function () {
		socket.emit('LOGOUT', socket.id);
	});

	socket.on('CLIENT/USERSCONNECTED', (userconnected) => {
		dispatch(userActions.updateUsersConnected(userconnected))
	})
};

const initListeners = (dispatch, socket) => {
	defaultListener(dispatch, socket);
	roomsListener(dispatch, socket);
	notifListener(dispatch, socket);
};

export default initListeners;