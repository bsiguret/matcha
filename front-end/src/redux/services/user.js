import axios from 'axios';

const getUser = async (token) => {
	let res = await axios.get(
		'/api/profile/settings',
		{ headers: {
			"Authorization": "Bearer " + token
		}}
	)
	.then((response) => {
		return (response);
	})
	.catch((error) => {
		return(error.response);
	})
	return res;
}

const getVisits = async (token) => {
	let res = await axios.get(
		'/api/profile/activity',
		{ headers: {
			"Authorization": "Bearer " + token
		}}
	)
	.then((response) => {
		return (response);
	})
	.catch((error) => {
		return(error.response);
	})
	return res;
}

const getMatch = async (token) => {
	let res = await axios.get(
		'/api/home',
		{ headers: {
			"Authorization": "Bearer " + token
		}}
	)
	.then((response) => {
		return (response);
	})
	.catch((error) => {
		return(error.response);
	})
	return res;
}

const postMatch = async (token, filter) => {
	let res = await axios.post(
		'/api/home',
		filter,
		{ headers: {
			"Authorization": "Bearer " + token
		}}
	)
	.then ((response) => {
		return (response)
	})
	.catch((error) => {
		return (error.response);
	})
	return res;
}

const getProfile = async (token, username) => {
	let res = await axios.get(
		`/api/user/${username}`,
		{ headers: {
			"Authorization": "Bearer " + token
		}}
	)
	.then((response) => {
		return (response);
	})
	.catch((error) => {
		return(error.response);
	})
	return res;
}

const like = async (token, username, love) => {
	let res = await axios.post(
		`/api/user/${username}`,
		love,
		{ headers: {
			"Authorization": "Bearer " + token
		}}
	)
	.then ((response) => {
		return (response)
	})
	.catch((error) => {
		return (error.response);
	})
	return res;
}

const block = async (username, token) => {
	let res = await axios.post(
		`/api/user/${username}/blacklist`,
		{},
		{ headers: {
			"Authorization": "Bearer " + token
		}}
	)
	.then ((response) => {
		return (response)
	})
	.catch((error) => {
		return (error.response);
	})
	return res;
}

const report = async (username, token) => {
	let res = await axios.post(
		`/api/user/${username}/fake`,
		{},
		{ headers: {
			"Authorization": "Bearer " + token
		}}
	)
	.then ((response) => {
		return (response)
	})
	.catch((error) => {
		return (error.response);
	})
	return res;
}

const verifyUser = async (username, token) => {
	let res = await axios.get(
		`/api/verifyAccount/${username}/${token}`,)
	.then((response) => {
		return (response);
	})
	.catch((error) => {
		return(error.response);
	})
	return res;
}

const verifyUserReset = async (username, token) => {
	let res = await axios.get(
		`/api/resetpass/${username}/${token}`,)
	.then((response) => {
		return (response);
	})
	.catch((error) => {
		return(error.response);
	})
	return res;
}

const signup = async (user) => {
	let res = await axios.post(
		'/api/signup',
		user
	)
	.then ((response) => {
		return (response)
	})
	.catch((error) => {
		return (error.response);
	})
	return res;
}

const edit = async (user, token) => {
	let res = await axios.post(
		'/api/profile/settings',
		user,
		{ headers: {
			"Authorization": "Bearer " + token
		}}
	)
	.then ((response) => {
		return (response)
	})
	.catch((error) => {
		return (error.response);
	})
	return res;
}

const savePhoto = async (photo, defineAs, token) => {
	let formData = new FormData();
	formData.append('photo', photo.toString())
	formData.append('defineAs', defineAs)
	
	let res = await axios.post(
		'/api/profile/photos',
		formData,
		{ headers: {
			"Authorization": "Bearer " + token,
			"Content-Type": "multipart/form-data"
		}}
	)
	.then ((response) => {
		return (response)
	})
	.catch((error) => {
		return (error.response);
	})
	return res;
}

const deletepic = async (src, token) => {
	let res = await axios.delete(
		`/api/profile/photos/${src}`,
		{ headers: {
				"Authorization": "Bearer " + token
		}}
	)
	.then ((response) => {
		return (response)
	})
	.catch((error) => {
		return (error.response);
	})
	return res;
}

export default {
	getUser,
	getProfile,
	getVisits,
	getMatch,
	postMatch,
	signup,
	like,
	block,
	report,
	edit,
	savePhoto,
	verifyUser,
	verifyUserReset,
	deletepic
}

