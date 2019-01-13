import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import '../stylesheets/index.scss'
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import { authActions } from '../redux/actions/auth';
import { connect } from 'react-redux';


class OAuthPage extends Component {
	_isMounted = false;
	constructor(props) {
		super(props);
		
		this.state = {
			ip: '',
			latitude: '',
			longitude: ''
		};
	}

	componentDidMount = async () => {
		this._isMounted = true;
		const params = new URLSearchParams(this.props.location.search)
		const code = params.get('code');
		const geolocation = navigator.geolocation;
    const p = new Promise((resolve, reject) => {
      if (!geolocation) {
        reject(new Error('Not Supported'));
      }
      geolocation.getCurrentPosition(
        position => {
          resolve(position);
        },
        () => {
          reject(new Error('Permission denied'));
        }
      );
    });
    p.then(location => {
			if (this._isMounted) {
				this.setState({
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
				});
			}
		})
		.catch(async e  => {
			if (this._isMounted) {
			this._isMounted = false;
			let res = await axios.get('https://api.ipify.org?format=json');
				this.setState({ ip: res.data.ip });
				await this.props.dispatch(authActions.oauth(code, this.state.ip, this.state.longitude, this.state.latitude))
			}
		})
		.then(async () => {
			if (this._isMounted) {
			this._isMounted = false;
			let res = await axios.get('https://api.ipify.org?format=json');
				this.setState({ ip: res.data.ip });
				await this.props.dispatch(authActions.oauth(code, this.state.ip, this.state.longitude, this.state.latitude))
			}
		})
		if (this._isMounted) {
		this._isMounted = false;
		let res = await axios.get('https://api.ipify.org?format=json');
			this.setState({ ip: res.data.ip });
			await this.props.dispatch(authActions.oauth(code, this.state.ip, this.state.longitude, this.state.latitude))
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

  render() {
    return (
			<div className='background-image' style={{ touchAction: 'manipulation' }}>
				<ToastContainer
					position="top-right"
					autoClose={5000}
					hideProgressBar={false}
					newestOnTop
					closeOnClick
					rtl={false}
					pauseOnVisibilityChange
					draggable
					pauseOnHover
				/>
				<div className="wrapper_index">
						<Grid container centered>
							<Grid.Row>
								<Grid.Column width={7}>
									<h1 className='title_index'>MATCHA</h1>
									<h3 className='substitle_index'>Match. Chat. Date.</h3>
								</Grid.Column>
							</Grid.Row>
						</Grid>
				</div>
			</div>
		)
  }
}

export default connect()(OAuthPage);