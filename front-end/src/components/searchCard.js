import React, { Component } from 'react';
import { Card, Image } from 'semantic-ui-react';
import moment from 'moment';

function getAge(dateString) {
	var today = new Date();
	var birthDate = new Date(dateString);
	var age = today.getFullYear() - birthDate.getFullYear();
	var m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
	}
	return age;
}

const style = { width: 240, height: 300, marginTop: '0em' };

class SearchCard extends Component {

	render () {
		const { firstname, birthdate, photos, orientation, gender } = this.props.user
		return (
		<Card style={style} fluid onClick={() => this.props.openCard(this.props.user, this.props.arrayId)}>
				<Image  src={`/${photos[0].srcimg}`} fluid />
			<Card.Content>
				<Card.Header>{firstname.charAt(0).toUpperCase() + firstname.slice(1)}, {getAge(moment(birthdate, "DD-MM-YYYY"))} years</Card.Header>
				<Card.Meta>
					<span className='sex'>{orientation}, {gender}</span>
				</Card.Meta>
			</Card.Content>
		</Card>
		)
	}
}

export default (SearchCard);