import React, { Component } from 'react';
import { Feed } from 'semantic-ui-react';
import moment from 'moment';

class AccountVisits extends Component {

	render () {
		const { visits } = this.props;
		const Visits = ({visits}) => (
			<>
				{visits.map((visitor, key) => (
					<Feed.Event key={key}>
						{visitor.srcimg === "No profile photo" &&
						<Feed.Label>
							<img src='/images/defaultAvatar.png' alt={visitor.username + ' profile picture'}/>
						</Feed.Label>}
						{visitor.srcimg !== "No profile photo" &&
						<Feed.Label>
						<img src={visitor.srcimg} alt={visitor.username  + ' profile picture'}/>
						</Feed.Label>}
						<Feed.Content>
							{visitor.love &&
							<Feed.Summary>
							<a href={`/user/${visitor.username}`}>{visitor.username}</a> liked your profile
							</Feed.Summary>}
							{!visitor.love &&
							<Feed.Summary>
							<a href={`/user/${visitor.username}`}>{visitor.username}</a> visited your profile
							</Feed.Summary>}
							<Feed.Date>{moment(visitor.time, 'DD-MM-YYYY, h:mm:ss').fromNow()}</Feed.Date>
						</Feed.Content>
					</Feed.Event>
				))}
			</>
			);

		return (
			<Feed>
				<Visits visits={visits} />
			</Feed>
		)
	}
}

export default AccountVisits;