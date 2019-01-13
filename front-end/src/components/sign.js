import React, { Component } from 'react';
import { Icon, Form, Divider, Button, Label, Loader, Dimmer, Image } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { authActions } from '../redux/actions/auth';
import { userActions } from '../redux/actions/user';
import { toast } from 'react-toastify';

class SignForm extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			user: {
				firstname: '',
				lastname: '',
				gender: '',
				username: '',
				email: '',
				password: '',
				cpassword: ''
			},
			username: '',
			password: '',
			email: '',
			loginError: '',
			signupError: '',
			loading: false,
			dividerSign: true,
			resetPass: false,
			formSignup: false,
			formLogin: false,
			resendConfirm: false
		};

		this.handleSignup = this.handleSignup.bind(this);
		this.handleLogin = this.handleLogin.bind(this);
		this.handleReset= this.handleReset.bind(this);
		this.handleSignChange = this.handleSignChange.bind(this);
		this.handleLoginChange = this.handleLoginChange.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.onLoginClick = this.onLoginClick.bind(this);
		this.onResetClick = this.onResetClick.bind(this);
		this.onSignupClick = this.onSignupClick.bind(this);
	}
	handleClose () { this.setState({ dividerSign: true, formLogin: false, formSignup: false, resetPass: false, resendConfirm: false }); }

	onLoginClick () { this.setState({ dividerSign: false, formLogin: true, formSignup: false, resetPass: false, resendConfirm: false }); }

	onSignupClick () { this.setState({ dividerSign: false, formLogin: false, formSignup: true, resetPass: false, resendConfirm: false }); }

	onResetClick () { this.setState({ dividerSign: false, formLogin: false, formSignup: false, resetPass: true, resendConfirm: false }); }

	handleSignChange = (e, { name, value }) => this.setState({ user: {...this.state.user, [name]: value }})
	handleLoginChange = (e, { name, value }) => this.setState({ [name]: value })
	

	handleSignup = async () => {
		this.setState({ loading: true })
		let res = await this.props.dispatch(userActions.signup(this.state.user))
		if (res) {
			this.setState({ signupError: res, loading: false });
		}
		else {
			this.setState({ signupError: '', loading: false });
			this.handleClose();
			toast.success('An email confirmation has been sent', {position: toast.POSITION.TOP_RIGHT});
		}
	}

	handleLogin = async () => {
		this.setState({ loading: true })
		let res = await this.props.dispatch(
			authActions.login(
				this.state.username,
				this.state.password,
				this.props.ip,
				this.props.longitude,
				this.props.latitude
			)
		); 
		if (res) {
			if(res.errMsg === 'Account not verified')
				this.setState({ loginError: res, loading: false, resendConfirm: true, formLogin: false });
			else if (res.errMsg === 'No user found')
				this.setState({ loginError: res, loading: false });
			else 
				this.setState({ loginError: res, loading: false });
			toast.error(this.state.loginError.errMsg, {position: toast.POSITION.TOP_RIGHT});
		}
	}

	handleReset = async () => {
		this.setState({ loading: true })
		let res = await this.props.dispatch(authActions.resetPassEmail(this.state.email));
		if (res) {
			if (res.status !== 200) {
				this.setState({ loading: false });
				toast.error(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
			}
			else {
				this.setState({ loading: false, resendConfirm: false, formLogin: true });
				this.handleClose();
				toast.success(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
			}
		}
	}

	handleEmail = async () => {
		this.setState({ loading: true })
		let res = await this.props.dispatch(authActions.resendEmail(this.state.email));
		if (res) {
			if (res.status !== 200) {
				this.setState({ loading: false });
				toast.error(res.data.errMsg.email, {position: toast.POSITION.TOP_RIGHT});
			}
			else {
				this.setState({ loading: false, resendConfirm: false, formLogin: true });
				this.handleClose();
				toast.success(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
			}
		}
	}

  render() {
		let { user, dividerSign, formLogin, formSignup, signupError, loading, username, password, email, resendConfirm, resetPass } = this.state;
    return (
			<div>
				{loading &&
				<Dimmer active>
					<Loader>Loading ...</Loader>
				</Dimmer>
				}
				{formSignup && <div className="signupForm">
					<div className='closebutton'>
						<Icon link onClick={this.handleClose} name='close' />
					</div>
					<Form onSubmit={this.handleSignup}>
						{signupError.errMsg && signupError.errMsg.firstname && <Label color='red' pointing='below'>{signupError.errMsg.firstname}</Label>}
						<Form.Input fluid name='firstname' value={user.firstname} placeholder='First name' onChange={this.handleSignChange} />
						{signupError.errMsg && signupError.errMsg.lastname && <Label color='red' pointing='below'>{signupError.errMsg.lastname}</Label>}
						<Form.Input fluid name='lastname' value={user.lastname} placeholder='Last name' onChange={this.handleSignChange} />
						{signupError.errMsg && signupError.errMsg.username && <Label color='red' pointing='below'>{signupError.errMsg.username}</Label>}
						<Form.Input fluid name='username' value={user.username} placeholder='Username' onChange={this.handleSignChange} />
						{signupError.errMsg && signupError.errMsg.email && <Label color='red' pointing='below'>{signupError.errMsg.email}</Label>}
						<Form.Input fluid name='email' value={user.email} type='email' placeholder='matcha@love.com' onChange={this.handleSignChange}/>
						{signupError.errMsg && signupError.errMsg.password && <Label color='red' pointing='below'>{signupError.errMsg.password}</Label>}
						<Form.Group widths='equal'>
							<Form.Input fluid name='password' value={user.password} type='password' placeholder='Password' onChange={this.handleSignChange} />
							<Form.Input fluid name='cpassword' value={user.cpassword} type='password' placeholder='Confirm password' onChange={this.handleSignChange} />
						</Form.Group>
						<Form.Button fluid type='submit'>Submit</Form.Button>
					</Form>
				</div>}
				{formLogin && <div className='loginForm'>
					<div className='closebutton'>
						<Icon link onClick={this.handleClose} name='close' />
					</div>
					<Form onSubmit={this.handleLogin}>
						<Form.Input fluid name='username' value={username} placeholder='Username' onChange={this.handleLoginChange} />
						<Form.Input fluid name='password' value={password} type='password' placeholder='Password' onChange={this.handleLoginChange} />
						<Form.Button fluid type='submit'>Submit</Form.Button>
					</Form>
					<Button className='o-resetbutton' fluid onClick={this.onResetClick}>Reset Password</Button>
				</div>}
				{resetPass && <div className='resetPass'>
					<div className='closebutton'>
							<Icon link onClick={this.handleClose} name='close' />
					</div>
					<Form onSubmit={this.handleReset}>
						<Form.Input fluid name='email' value={email} placeholder='Email' onChange={this.handleLoginChange} />
						<Form.Button fluid type='submit'>Reset Password</Form.Button>
					</Form>
				</div>}
				{resendConfirm && <div className='resendConfirm'>
					<div className='closebutton'>
							<Icon link onClick={this.handleClose} name='close' />
					</div>
					<Form onSubmit={this.handleEmail}>
						<Form.Input fluid name='email' value={email} placeholder='Email' onChange={this.handleLoginChange} />
						<Form.Button fluid type='submit'>Resend email verification</Form.Button>
					</Form>
				</div>}
				{dividerSign && <div className='dividerSign'>
					<Button primary fluid style={{backgroundColor : '#DC0000'}} onClick={this.onLoginClick}>Login</Button>
					<Divider horizontal >Or</Divider>
					<Button secondary fluid onClick={this.onSignupClick}>Sign Up Now</Button>
					<Divider horizontal >Or</Divider>
					<Button fluid color='black'
					onClick={() => window.location = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Foauth%2F&response_type=code`}
					>
					<Image spaced='right' src='/images/42.png' width='40px'/>
					Connect</Button>
				</div>}
			</div>
		)
  }
}

export default connect()(SignForm);