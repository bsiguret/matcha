import React, { Component } from 'react';
import { Search } from 'semantic-ui-react';
import * as opencage from 'opencage-api-client';
import axios from 'axios';

class MyGeocoding extends Component {
  constructor(props) {
    super(props);
    this.state = {
			latitude: '',
			longitude: '',
			address: '',
			full_address: '',
			ip: '',
			source: [],
			results: []
    };
    this.handleAddressChange = this.handleAddressChange.bind(this);
		this.handleAutoComplete = this.handleAutoComplete.bind(this);
		this.handleResultSelect = this.handleResultSelect.bind(this);;
	}
	
	resetComponent = () => this.setState({ results: [], address: '' })

  handleAddressChange = async (e, { value }) => {
		if(this.timeout)
			clearTimeout(this.timeout)
		this.timeout = await setTimeout(
			async () => {
				this.setState({ address: value})
				if (value.length < 1) return this.resetComponent()
				if (value.length > 4 ) {
					let res = await this.handleAutoComplete(value)
					await this.setState({
						source: res.map((result, key) => ({
							key: key,
							components: result.components,
							title: result.formatted,
							geometry: result.geometry,
						})),
						results: this.state.source,
					});
				}
				this.timeout = null;
			}, 300)
	}

	handleResultSelect = (e, { result }) => {
		this.setState({ address: result.title, full_address: result })
	}
	
  handleAutoComplete (value) {
		return opencage
			.geocode({
				key: process.env.REACT_APP_API_KEY_OPENCAGE,
				q: value,
				no_annotations: 1,
				min_confidence: 8,
				language: 'fr',
				limit: '5',
				no_record: 1,
			})
			.then(response => {
				if (response.rate.remaining <= 10)
					return;
				return response.results
			})
			.catch(err => {
				return err
			});
	}
	
	// componentWillMount = async () => {
	// 	const geolocation = navigator.geolocation;
  //   const p = new Promise((resolve, reject) => {
  //     if (!geolocation) {
  //       reject(new Error('Not Supported'));
  //     }
  //     geolocation.getCurrentPosition(
  //       position => {
  //         resolve(position);
  //       },
  //       () => {
  //         reject(new Error('Permission denied'));
  //       }
  //     );
  //   });
  //   p.then(location => {
  //     this.setState({
	// 			latitude: location.coords.latitude,
	// 			longitude: location.coords.longitude,
	// 		});
	// 	})
	// 	.catch(async e  => {
	// 		let res = await axios.get('https://api.ipify.org?format=json');
	// 		this.setState({ ip: res.data.ip });
	// 	});
	// }

  render() {
		const { address, results, isLoading } = this.state;

    return (
			<Search
				placeholder='42, 96 Boulevard Bessières, 75017 Paris, France'
				fluid
				size="large"
				// value={address}
				results={results}
				onResultSelect={this.handleResultSelect}
				onSearchChange={this.handleAddressChange}
			/>
    );
  }
}
export default MyGeocoding;