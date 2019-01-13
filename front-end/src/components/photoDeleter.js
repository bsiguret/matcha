import React, { Component } from 'react';
import { Image, Icon } from 'semantic-ui-react'
import { toast } from 'react-toastify';

import { userActions } from '../redux/actions/user';
import { authActions } from '../redux/actions/auth';

class PhotoDeleter extends Component {
	constructor(props){
		super(props)

		this.handleDelete = this.handleDelete.bind(this);
	}

	handleDelete = async () => {
		let res = await this.props.dispatch(userActions.deletepic(encodeURIComponent(this.props.photo.srcimg), this.props.token));
		if (res) {
			if (res.data === 'Unauthorized') {
				this.props.dispatch(authActions.logoutUser());
			}
			else if (res.status !== 200){
				toast.error(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
			}
			else {
				toast.success(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
			}			
		}
	}

  render() {
    return (
			<div>
				<Icon color='red' className='o-deletepics' name='close' onClick={this.handleDelete} />
				<Image src={`/${this.props.photo.srcimg}`} className='img-photo-deleter'/>
			</div>
		)
  }
}

export default PhotoDeleter;