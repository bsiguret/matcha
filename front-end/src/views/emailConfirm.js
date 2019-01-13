import React, { Component } from 'react';
import { Grid, Segment } from 'semantic-ui-react';
import EmailConfirm from '../components/emailConfirm';
import '../stylesheets/index.scss'

class EmailConfirmPage extends Component {

  render() {
    return (
			<div className='background-image' style={{ touchAction: 'manipulation' }}>
				<div className="wrapper_index">
					<Grid container centered>
						<Grid.Row>
							<Grid.Column width={7}>
								<h1 className='title_index'>MATCHA</h1>
								<h3 className='substitle_index'>Match. Chat. Date.</h3>
								{this.props && this.props.match.params && this.props.match.params.username && this.props.match.params.token &&
								<Segment className='o-signSegment'>
									<EmailConfirm username={this.props.match.params.username} token={this.props.match.params.token}/>
								</Segment>}
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</div>
			</div>
		)
  }
}

export default EmailConfirmPage;