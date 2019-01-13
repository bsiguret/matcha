import React, { Component } from 'react';
import u from '../redux/services/user';

class EmailConfirm extends Component {
	constructor(props) {
		super(props)
		this.state = {
			verifyError: '',
			loading: true
		}
	}

	componentWillMount () {
		u.verifyUser(this.props.username, this.props.token)
		.then(res => {
			this.setState({verifyError: res.data.errMsg})
		})
		.finally(
			this.setState({loading: false})
		)
	}
  render() {
    return (
			<div>
				<h2>Email verification: {this.state.verifyError}</h2>
			</div>
		)
  }
}

export default EmailConfirm;