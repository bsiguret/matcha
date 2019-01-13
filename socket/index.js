const messagesListeners = require('./listeners/messages');
const authListeners = require('./listeners/auth');
const actionListeners = require('./listeners/action');
const userQuery = require('../models/userModel')

const defaultListeners = async (socket) => {


	socket.on('disconnect', () => {
		userQuery.deleteSocketInfo(socket.id).then(() => {
		}).catch(e => {
			socket.emit('CLIENT/ERROR', {errMsg: e})
		})
	});
};

const initListeners = (socket, io) => {
	defaultListeners(socket);
	messagesListeners(socket, io);
	authListeners(socket);
	actionListeners(socket, io);
};

module.exports = initListeners;