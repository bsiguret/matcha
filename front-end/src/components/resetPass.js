import React, { Component } from 'react';
import u from '../redux/services/user';
import { authActions } from '../redux/actions/auth';

import { Form, Loader, Label, Icon } from 'semantic-ui-react';
import { history } from '../helpers/history';

class ResetPass extends Component {
	constructor(props) {
		super(props)
		this.state = {
			npassword: '',
			cpassword: '',
			resetError: '',
			msg: '',
			loading: true
		}
		this.handleResetChange = this.handleResetChange.bind(this);
		this.handleReset = this.handleReset.bind(this);
		this.handleClose = this.handleClose.bind(this);
	}

	handleResetChange = (e, { name, value }) => this.setState({ [name]: value })

	handleReset = async () => {
		this.setState({ loading: true })
		let res = await this.props.dispatch(authActions.resetPass(this.state.npassword, this.state.cpassword, this.props.username, this.props.token)); 
		if (res) {
			if (res.status !== 200)
				this.setState({ msg: res.data.errMsg })
			else
				this.setState({ resetError: res.data.errMsg });

		}
		this.setState({ loading: false })
	}

	handleClose = () => {
		history.push('/');
	}

	componentWillMount () {
		u.verifyUserReset(this.props.username, this.props.token)
		.then(res => {
			if (res.data.errMsg === `We can help you ${this.props.username} !`)
				this.setState({ msg: res.data.errMsg })
			else
				this.setState({resetError: res.data.errMsg})
		})
		.finally(
			this.setState({loading: false})
		)
	}
  render() {
		let { loading, npassword, cpassword, resetError, msg } = this.state;
    return (
			<div>
				<div className='closebutton'>
					<Icon link  onClick={this.handleClose} name='close' />
				</div>
			{loading &&
				<Loader/>}
			{!loading && !resetError &&
			<Form onSubmit={this.handleReset}>
				{msg && <Label pointing='below'>{msg}</Label>}
				<Form.Input fluid name='npassword' value={npassword} type='password' placeholder='New Password' onChange={this.handleResetChange} />
				<Form.Input fluid name='cpassword' value={cpassword} type='password' placeholder='Confirm Password' onChange={this.handleResetChange} />
				<Form.Button fluid type='submit'>Submit</Form.Button>
			</Form>}
			{!loading && resetError &&
			<p>{resetError}</p>}
			</div>
		)
  }
}

export default ResetPass;