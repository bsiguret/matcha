const userQuery = require('../../models/userModel')
const moment = require('moment')

const actionListeners = (socket, io) => {
	socket.on('SERVER/ADD_LIKE', async obj => {
		let isblocked = await userQuery.isInBlacklist(obj.user2Id, obj.user1Id);
		if (isblocked === null) {
			userQuery.insertNotif({senderid: obj.user1Id , receiverid: obj.user2Id, notitype: "liked"})
			let socket2 = await userQuery.isUserConnected(obj.user2Id);
			if(socket2 && socket2.length > 0) {
				for (let index = 0; index < socket2.length; index++) {
					io.to(`${socket2[index].socketid}`).emit('CLIENT/ADD_LIKE', {
							msg: ' liked your profile',
							username1: obj.username,
							notitime: moment().format('DD-MM-YYYY HH:mm:ss'),
							isRead: 0
					})
				}
			}
		}
	})
	
	socket.on('SERVER/ADD_DISLIKE', async obj => {
		let isblocked = await userQuery.isInBlacklist(obj.user2Id, obj.user1Id);
		if (isblocked === null) {
			userQuery.insertNotif({senderid: obj.user1Id , receiverid: obj.user2Id, notitype: "unliked"})
			let socket2 = await userQuery.isUserConnected(obj.user2Id);
			if(socket2.length > 0) {
				for (let index = 0; index < socket2.length; index++) {
					io.to(`${socket2[index].socketid}`).emit('CLIENT/ADD_DISLIKE', {
							msg: ' disliked your profile',
							username1: obj.username,
							notitime: moment().format('DD-MM-YYYY HH:mm:ss'),
							isRead: 0
					})
				}
			}
		}
	})

	socket.on('SERVER/ADD_VISIT', async obj => {
		let isblocked = await userQuery.isInBlacklist(obj.user2Id, obj.user1Id);
		if (isblocked === null) {
			userQuery.insertNotif({senderid: obj.user1Id , receiverid: obj.user2Id, notitype: "visited"})
			let socket2 = await userQuery.isUserConnected(obj.user2Id);
			if(socket2 && socket2.length > 0) {
				for (let index = 0; index < socket2.length; index++) {
					io.to(`${socket2[index].socketid}`).emit('CLIENT/ADD_VISIT', {
							msg: ' visited your profile',
							username1: obj.username,
							notitime: moment().format('DD-MM-YYYY HH:mm:ss'),
							isRead: 0
					})
				}
			}
		}
	})
	socket.on('SERVER/READ_NOTIF', async userId => {
			userQuery.readNotif(userId)
			socket.emit('CLIENT/READ_NOTIF')
	})
}

module.exports = actionListeners;