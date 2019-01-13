import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Segment } from 'semantic-ui-react';
import ResetPass from '../components/resetPass';
import '../stylesheets/index.scss'

class ResetPassPage extends Component {

  render() {
    return (
			<div style={{ touchAction: 'manipulation' }}>
				<div className='background-image'>
					<div className="wrapper_index">
						<Grid container centered>
							<Grid.Row>
								<Grid.Column width={7}>
									<h1 className='title_index'>MATCHA</h1>
									<h3 className='substitle_index'>Match. Chat. Date.</h3>
									{this.props && this.props.match.params && this.props.match.params.username && this.props.match.params.token &&
									<Segment className='o-signSegment'>
										<ResetPass username={this.props.match.params.username} token={this.props.match.params.token} dispatch={this.props.dispatch} />
									</Segment>}
								</Grid.Column>
							</Grid.Row>
						</Grid>
					</div>
				</div>
			</div>
		)
  }
}

export default connect()(ResetPassPage);