import axios from 'axios';
import { socket } from '../../socket/socket';

const login = async (username, password, ip, lon, lat) => {
	let response = await axios.post('/api/signin', {
			username,
			password,
			ip,
			lon,
			lat
	})
	.then((res) => {
		//login successful if jwt token in the response
		if (res.data.token) {
			//store user details and jwt token in local storage to keep user logged
			localStorage.setItem('user', JSON.stringify(res.data.token));
			socket.emit('SERVER/SIGNIN', {
				sessionToken: JSON.parse(localStorage.getItem('user')),
				socketID: socket.id
			});
		}
		return res;
	})
	.catch((error) => {
		return error.response;
	})
	return response;
}

const oauth = async (code, ip, lon, lat) => {
	let response = await axios.post('/api/oauth', {
			code,
			ip,
			lon,
			lat
	})
	.then((res) => {
		//login successful if jwt token in the response
		if (res.data.token) {
			//store user details and jwt token in local storage to keep user logged
			localStorage.setItem('user', JSON.stringify(res.data.token));
			socket.emit('SERVER/SIGNIN', {
				sessionToken: JSON.parse(localStorage.getItem('user')),
				socketID: socket.id
			});
		}
		return res;
	})
	.catch((error) => {
		return error.response;
	})
	return response;
}

const resendEmail = async (email) => {
	let response = await axios.post('/api/signin', {
		email,
	})
	.then((res) => {
		return res;
	})
	.catch((error) => {
		return error.response;
	})
	return response;
}

const resetPassEmail = async (email) => {
	let response = await axios.post('/api/resetpass', {
		email,
	})
	.then((res) => {
		return res;
	})
	.catch((error) => {
		return error.response;
	})
	return response;
}

const resetPass = async (npassword, cpassword, username, token) => {
	let response = await axios.post(`/api/resetpass/${username}/${token}`, {
			npassword: npassword,
			cpassword: cpassword
	})
	.then((res) => {
		return res;
	})
	.catch((error) => {
		return error.response;
	})
	return response;
}

const logout = () => {
	//remove user from local storage to log user out
	socket.emit('LOGOUT', socket.id);
	localStorage.removeItem('user');
	socket.close()
	socket.open()
}

export default {
	login,
	oauth,
	logout,
	resendEmail,
	resetPass,
	resetPassEmail
}