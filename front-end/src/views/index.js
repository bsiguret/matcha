import React, { Component } from 'react';
import { Grid, Segment } from 'semantic-ui-react';
import '../stylesheets/index.scss'
import SignForm from '../components/sign'
import { ToastContainer } from 'react-toastify';
import axios from 'axios';


class indexPage extends Component {
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
			let res = await axios.get('https://api.ipify.org?format=json');
			if (this._isMounted) {
				this.setState({ ip: res.data.ip });
			}
		});
		let res = await axios.get('https://api.ipify.org?format=json');
		if (this._isMounted) {
			this.setState({ ip: res.data.ip });
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
									<Segment className='o-signSegment'>
										<SignForm ip={this.state.ip} latitude={this.state.latitude} longitude={this.state.longitude} />
									</Segment>
								</Grid.Column>
							</Grid.Row>
						</Grid>
				</div>
			</div>
		)
  }
}

export default indexPage;