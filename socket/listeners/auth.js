const jwt_decode = require('jwt-decode')
const userQuery = require('../../models/userModel')

const authListeners = (socket) => {
	socket.on('SERVER/SIGNIN', data => {
		let decoded = jwt_decode(data.sessionToken)
		let userTmp = null
		userQuery.findOne({username: decoded.payload.username})
			.then(user => {
				userTmp = user
				return userQuery.insertSocketOn({userid: userTmp.id, socketid: data.socketID})
			})
			.then(async () => {
				let usersConnected = await userQuery.getAllUserConnected();
				socket.emit('CLIENT/USERSCONNECTED', usersConnected)
				return userQuery.getAllMatchFromUser(userTmp.id)
			})
			.then(async rooms => {
				let roomsCompleted = {}

				for (let i = 0; i < rooms.length; i++) {
					let user2Id = (rooms[i].userone === userTmp.id) ? rooms[i].usertwo : rooms[i].userone
					let userInfo = await userQuery.getProfilePic(user2Id)

					roomsCompleted[rooms[i].id] = {}
					roomsCompleted[rooms[i].id].roomId = rooms[i].id
					roomsCompleted[rooms[i].id].user1Id = userTmp.id
					roomsCompleted[rooms[i].id].user2Id = user2Id
					roomsCompleted[rooms[i].id].firstname2 = userInfo[0].firstname
					roomsCompleted[rooms[i].id].lastname2 = userInfo[0].lastname
					roomsCompleted[rooms[i].id].username2 = userInfo[0].username
					roomsCompleted[rooms[i].id].photo2 = userInfo[0].srcimg.replace("front-end/public/", "")
					roomsCompleted[rooms[i].id].messages = await userQuery.getRoomMsg(userTmp.id, user2Id)
					socket.join(rooms[i].id)
				}
				let usersConnected = await userQuery.getAllUserConnected();
				socket.broadcast.emit('CLIENT/USERSCONNECTED', usersConnected)
				socket.emit('CLIENT/SIGNIN', {rooms: roomsCompleted})
			})
			.catch(e => {
				socket.emit('CLIENT/ERROR', {errMsg: e})
			})
	})
	socket.on('LOGOUT', socketid => {
		userQuery.deleteSocketInfo(socketid).then(async () => {
			let usersConnected = await userQuery.getAllUserConnected();
			socket.broadcast.emit('CLIENT/USERSCONNECTED', usersConnected)
			socket.emit('CLIENT/USERSCONNECTED', usersConnected)
		}).catch(e => {
			socket.emit('CLIENT/ERROR', {errMsg: e})
		})
	});
}
module.exports = authListeners;