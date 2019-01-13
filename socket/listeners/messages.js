const moment = require('moment')
const userQuery = require('../../models/userModel')

const messagesListeners = (socket, io) => {
	socket.on('SERVER/MSG_ISTYPING', obj => {
		socket.to(obj.roomId).emit('CLIENT/MSG_ISTYPING', {roomId: obj.roomId})
	})

	socket.on('SERVER/ADD_MESSAGE', async obj => {
		let isblocked = await userQuery.isInBlacklist(obj.receiverid, obj.senderid);
		if (isblocked === null) {
			userQuery.insertMsg({
				text: obj.text,
				senderid: obj.senderid,
				receiverid: obj.receiverid
			}).then(async () => {
				let response = {}
				response.roomId = obj.roomId
				response.message = {}
				response.message.text = obj.text,
				response.message.senderid = obj.senderid
				response.message.receiverid = obj.receiverid
				response.message.sendTime = moment().format("YYYY-MM-DD HH:mm:ss")
				response.message.isRead = 0;
				
				await userQuery.insertNotif({senderid: obj.senderid , receiverid: obj.receiverid, notitype: "texted"})
				socket.nsp.to(obj.roomId).emit('CLIENT/ADD_MESSAGE', response);
				let socket2 = await userQuery.isUserConnected(obj.receiverid);
				if(socket2 && socket2.length > 0) {
					for (let index = 0; index < socket2.length; index++) {
						io.to(`${socket2[index].socketid}`).emit('CLIENT/ADD_NOTIF_MESSAGE', {
								msg: ' received a message',
								username1: 'You',
								notitime: moment().format('DD-MM-YYYY HH:mm:ss'),
								isRead: 0
						})
					}
				}
			}).catch(e => {
				socket.emit('CLIENT/ERROR', {errMsg: e})
			})
		}
	})
}
module.exports = messagesListeners;