import React, { Component } from 'react';
import SearchCard from './searchCard';

class HomeMatchs extends Component {

	render () {
		const { matchs } = this.props;
		const Matchs = ({matchs}) => (
			<>
				{matchs.map((match, key) => (
					<SearchCard user={match} key={key} arrayId={key} openCard={this.props.openCard}/>
				))}
			</>
			);

		return (
				<Matchs matchs={matchs} />
		)
	}
}

export default HomeMatchs;