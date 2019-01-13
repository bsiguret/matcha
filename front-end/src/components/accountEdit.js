import React, { Component } from 'react';
import { Form, Segment, Label, Dimmer, Loader, Search, Icon } from 'semantic-ui-react';
import moment from 'moment';
import DatePicker from 'react-datepicker'
import { toast } from 'react-toastify';
import PhotoUploader from './photoUploader';
import PhotoDeleter from './photoDeleter';
import * as opencage from 'opencage-api-client';

import { userActions } from '../redux/actions/user';
import { authActions } from '../redux/actions/auth';

class AccountEdit extends Component {
	_isMounted = false;
	constructor(props) {
		super(props);
		this.state = {
			user: {
				bio: (this.props.user.bio ? this.props.user.bio : ''),
				birthdate: this.props.user.birthdate,
				email: this.props.user.email,
				firstname: this.props.user.firstname,
				gender: this.props.user.gender,
				lastname: this.props.user.lastname,
				address: (this.props.user.address ? this.props.user.address : ''),
				tags: (this.props.user.tags ? this.props.user.tags : []),
				orientation: this.props.user.orientation,
				password: '',
				npassword: '',
				cpassword: ''
			},
			tags2: '',
			address: '',
			full_address: '',
			ip: '',
			source: [],
			results: [],
			token: this.props.token,
			editError: '',
			loading: false
		};

		this.gender = [
			{ key: 'm', text: 'Man', value: 'Man' },
			{ key: 'f', text: 'Women', value: 'Women' },
			{ key: 'b', text: 'Other', value: 'Other'}
		];
		
		this.orientation = [
			{ key: 's', text: 'Straight', value: 'Straight' },
			{ key: 'g', text: 'Gay', value: 'Gay' },
			{ key: 'b', text: 'Bisexual', value: 'Bisexual'}
		];

		this.handleForm = this.handleForm.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleChangeTags = this.handleChangeTags.bind(this);
		this.handleDate = this.handleDate.bind(this);
		this.handleDateChangeRaw = this.handleDateChangeRaw.bind(this);
		this.handleTags = this.handleTags.bind(this);
		this.handleRemoveTag = this.handleRemoveTag.bind(this);
	}

	handleDate(date) {this.setState({ user : { ...this.state.user, birthdate: date.format('DD-MM-YYYY') } }) }

	handleDateChangeRaw = (e) => { e.preventDefault(); }

	handleChange (e, {name, value}) { this.setState({ user: {...this.state.user, [name]: value} }); }

	handleForm = async () => {
		this.setState({ loading: true });
		let res = await this.props.dispatch(userActions.edit(this.state.user, this.state.token));
		if (res) {
			if (res.data === 'Unauthorized') {
				this.props.dispatch(authActions.logoutUser());
			}
			if (res.status !== 200)
				this.setState({ editError: res.data, loading: false, password: '', npassword: '', cpassword: '' });
			else {
				if (this._isMounted) {
					this.setState({
						editError: '',
						loading: false,
						user: {
							...this.state.user,
							password: '',
							npassword: '',
							cpassword: ''
						}
					});
				}
				toast.success(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
			}			
		}
	}

	handleTags () {
		if (this.state.tags2.match(/^[^\W_]{1,42}$/) && this.state.tags2.length < 20) {
			this.setState({
				...this.state.user.tags.push('#' + this.state.tags2),
				tags2: '',
				editError: {errMsg: {...this.state.editError.errMsg, tags: ''}}
			})
		}
		else {
			this.setState({ editError: {errMsg: {...this.state.editError.errMsg, tags: `Invalid Tag: ${this.state.tags2.substring(0, 50 - 3)}`}} })
		}
	}

	handleRemoveTag (name) {
		this.setState({
			...this.state.user.tags.pop(name)
		})
	}

	handleChangeTags (e, {name, value}) {
		this.setState({ [name]: value });
	}

	onEnterPress = (e) => {
		if(e.keyCode === 13 && e.shiftKey === false) {
			e.preventDefault();
			this.handleTags();
		}
	}

	resetComponent = () => this.setState({ results: [], address: '' })

	handleAddressChange = async (e, { value }) => {
		if(this.timeout)
			clearTimeout(this.timeout)
		this.timeout = await setTimeout(
			async () => {
				this.setState({ user: {...this.state.user, address: value}})
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

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	render () {
		let {bio, birthdate, email, firstname, lastname, tags, password, npassword, cpassword, address } = this.state.user
		let { editError, loading, results, tags2 } = this.state

		const Tags = ({tags}) => (
			<>
				{tags.map((tags, key)=> (
					<Label key={key}>
						{tags}
						<Icon name='delete' onClick={() => {this.handleRemoveTag(tags)}}/>
					</Label>
				))}
			</>
			);
		return (
			<Segment>
				{loading &&
					<Dimmer active>
						<Loader>Loading ...</Loader>
					</Dimmer>
				}
				<div className="o-photoupload" style={{marginTop: '15px'}}>
					{!this.props.photos[0] &&
					<PhotoUploader token={this.state.token} />}
					{this.props.photos[0] &&
					<PhotoDeleter photo={this.props.photos[0]} token={this.state.token} dispatch={this.props.dispatch} />}
					{!this.props.photos[1] &&
					<PhotoUploader token={this.state.token} />}
					{this.props.photos[1] &&
					<PhotoDeleter photo={this.props.photos[1]} token={this.state.token} dispatch={this.props.dispatch} />}
					{!this.props.photos[2] &&
					<PhotoUploader token={this.state.token} />}
					{this.props.photos[2] &&
					<PhotoDeleter photo={this.props.photos[2]} token={this.state.token} dispatch={this.props.dispatch} />}
				</div>
				<div className="o-photoupload">
					{!this.props.photos[3] &&
					<PhotoUploader token={this.state.token} />}
					{this.props.photos[3] &&
					<PhotoDeleter photo={this.props.photos[3]} token={this.state.token} dispatch={this.props.dispatch} />}
					{!this.props.photos[4] &&
					<PhotoUploader token={this.state.token} />}
					{this.props.photos[4] &&
					<PhotoDeleter photo={this.props.photos[4]} token={this.state.token} dispatch={this.props.dispatch} />}
					</div>
				<Form onSubmit={this.handleForm} style={{marginTop: '15px'}}>
					{editError.errMsg && editError.errMsg.firstname && <Label color='red' pointing='below'>{editError.errMsg.firstname}</Label>}
					<Form.Input fluid name='firstname' value={firstname} placeholder='Firstname' onChange={this.handleChange} />
					{editError.errMsg && editError.errMsg.lastname && <Label color='red' pointing='below'>{editError.errMsg.lastname}</Label>}
					<Form.Input fluid name='lastname' value={lastname} placeholder='Lastname' onChange={this.handleChange} />
					{editError.errMsg && editError.errMsg.email && <Label color='red' pointing='below'>{editError.errMsg.email}</Label>}
					<Form.Input fluid name='email' value={email} type='email' placeholder='Email' onChange={this.handleChange}/>
					{editError.errMsg && editError.errMsg.gender && <Label color='red' pointing='below'>{editError.errMsg.gender}</Label>}
					<Form.Select name='gender' value={this.state.user.gender} options={this.gender} placeholder='Gender' onChange={this.handleChange} />
					{editError.errMsg && editError.errMsg.orientation && <Label color='red'>{editError.errMsg.orientation}</Label>}
					<Form.Select name='orientation' value={this.state.user.orientation} options={this.orientation} placeholder='Orientation' onChange={this.handleChange} />
					<Search
						//'42, 96 Boulevard Bessières, 75017 Paris, France'
						placeholder={address}
						fluid
						input={{ fluid: true }}
						// value={address}
						results={results}
						onResultSelect={this.handleResultSelect}
						onSearchChange={this.handleAddressChange}
						style={{marginBottom: '15px'}}
					/>
					{editError.errMsg && editError.errMsg.birthdate && <Label color='red' pointing='below'>{editError.errMsg.birthdate}</Label>}
					<Form.Input fluid>
						<DatePicker
							onChangeRaw={this.handleDateChangeRaw}
							dateFormat="DD-MM-YYYY"
							showMonthDropdown
							showYearDropdown
							scrollableMonthDropdown
							scrollableYearDropdown
							yearDropdownItemNumber={100}
							selected={moment(birthdate, "DD-MM-YYYY")}
							onChange={this.handleDate}
						/>
					</Form.Input>
					{editError.errMsg && editError.errMsg.bio && <Label color='red' pointing='below'>{editError.errMsg.bio}</Label>}
					<Form.TextArea name='bio' value={bio} placeholder='Tell us more about you...' onChange={this.handleChange}/>
					{tags.length > 0 &&
					<Tags tags={tags} />}
					{editError.errMsg && editError.errMsg.tags && <Label color='red' pointing='below'>{editError.errMsg.tags}</Label>}
					<Form.Input name='tags2' value={tags2} placeholder='New Tag, length max: 20, i.e: matcha' onKeyDown={this.onEnterPress} onChange={this.handleChangeTags} style={{marginTop: '10px'}}/>	
					{!this.props.user.id42 &&
					<div style={{marginBottom: '15px'}}>
						{editError.errMsg && editError.errMsg.npassword && <Label color='red' pointing='below'>{editError.errMsg.npassword}</Label>}
						<Form.Input fluid name='npassword' value={npassword} type='password' placeholder='New password' onChange={this.handleChange} />
							<Form.Input fluid name='cpassword' value={cpassword} type='password' placeholder='Confirm new password' onChange={this.handleChange} />
						{editError.errMsg && editError.errMsg.password && <Label color='red' pointing='below'>{editError.errMsg.password}</Label>}
						<Form.Input fluid name='password' value={password} type='password' placeholder='Password' onChange={this.handleChange} />
					</div>}
					<Form.Button fluid type='submit'>Submit</Form.Button>
				</Form>
			</Segment>
		)
	}
}

export default AccountEdit;