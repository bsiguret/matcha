import React, { Component } from 'react';
// import { Grid } from 'semantic-ui-react';
import { ToastContainer } from 'react-toastify';
import MessageWidget from '../components/messagewidget'

import '../stylesheets/message.scss'

class messagePage extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
		};
	}

  render() {
    return (
			<div style={{ touchAction: 'manipulation' }}>
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
				<MessageWidget />
					{/* <Grid container centered>
						<Grid.Row>
							<Grid.Column>
								
							</Grid.Column>
						</Grid.Row>
					</Grid>*/}
			</div>
		)
  }
}

export default messagePage;