import React, { Component } from 'react';
import Slider, { Range, Handle } from 'rc-slider';
import Tooltip from 'rc-tooltip';
import { Select, Input } from 'semantic-ui-react';
import 'rc-slider/assets/index.css';
import { userActions } from '../redux/actions/user';
import { toast } from 'react-toastify';
import { authActions } from '../redux/actions/auth';

const style = { marginTop: 15 };
const pstyle = { display: 'flex' }
const sstyle = { display: 'flex', marginLeft: 'auto', marginRight: '0' }

class HomeFilter extends Component {

	constructor(props) {
		super(props);
		this.state = {
			filter: {
				age: [18, 80],
				distance: 100,
				score: [0, 1000],
				sort: 'distance',
				tags: ''
			}
		};
		this.handleChangeAge = this.handleChangeAge.bind(this);
		this.handleChangeDistance = this.handleChangeDistance.bind(this);
		this.handleChangeScore = this.handleChangeScore.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	sortOptions = [
		{ key: 'age', value: 'age', text: 'age'},
		{ key: 'score', value: 'score', text: 'score' },
		{ key: 'distance', value: 'distance', text: 'distance'}
	]

	handle = (props) => {
		const { value, dragging, index,  ...restProps } = props;
		return (
			<Tooltip
				prefixCls="rc-slider-tooltip"
				overlay={value}
				visible={dragging}
				placement="top"
				key={index}
			>
				<Handle value={value} {...restProps} />
			</Tooltip>
		);
	};

	handleChangeDistance = async distance => {
		if(this.timeout)
			clearTimeout(this.timeout)
		this.timeout = await setTimeout(
			async () => {
				this.setState({ filter: { ...this.state.filter, distance: distance } });
				this.props.spinner(true)
				let res = await this.props.dispatch(userActions.postMatch(this.props.token, this.state.filter))
				if (res.status === 200)
					this.props.spinner(false)
				else if (res.data === 'Unauthorized')
					this.props.dispatch(authActions.logoutUser());
				else
					toast.error(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
				this.timeout = null;
			}, 600)
	}
	handleChangeScore = async score => {
		if(this.timeout)
			clearTimeout(this.timeout)
		this.timeout = await setTimeout(
			async () => {
			this.setState({ filter: { ...this.state.filter, score: score } });
			this.props.spinner(true)
			let res = await this.props.dispatch(userActions.postMatch(this.props.token, this.state.filter))
			if (res.status === 200)
				this.props.spinner(false)
			else if (res.data === 'Unauthorized')
				this.props.dispatch(authActions.logoutUser());
			else
				toast.error(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
			this.timeout = null;
		}, 600)
	}

	handleChangeAge = async age => {
		if(this.timeout)
			clearTimeout(this.timeout)
		this.timeout = await setTimeout(
			async () => {
				this.setState({ filter: { ...this.state.filter, age: age } });
				this.props.spinner(true)
				let res = await this.props.dispatch(userActions.postMatch(this.props.token, this.state.filter))
				if (res.status === 200)
					this.props.spinner(false)
				else if (res.data === 'Unauthorized')
					this.props.dispatch(authActions.logoutUser());
				else
					toast.error(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
				this.timeout = null;
			}, 600)
	}

	handleChange = async (e, {name, value}) => {
		if(this.timeout)
			clearTimeout(this.timeout)
		this.timeout = await setTimeout(
			async () => {
				this.setState({ filter: {...this.state.filter, [name]: value}});
				this.props.spinner(true)
				let res = await this.props.dispatch(userActions.postMatch(this.props.token, this.state.filter))
				if (res.status === 200)
					this.props.spinner(false)
				else if (res.data === 'Unauthorized')
					this.props.dispatch(authActions.logoutUser());
				else
					toast.error(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
				this.timeout = null;
			}, 600)
	}

	
  render() {
		const { filter } = this.state
    return (
			<div>
				<div style={pstyle}>
					<b>Filter</b>
					<span style={sstyle}>Sort by</span>
					<Select
						style={{ minWidth: '7em', marginLeft: 5 }}
						name='sort'
						value={filter.sort}
						options={this.sortOptions}
						placeholder='Sort'
						onChange={this.handleChange}
						/>
				</div>
				<div style={{ marginTop: 5 }}>
					<p style={pstyle}>Age<span style={sstyle}> {filter.age[0]}y - {filter.age[1]}y </span></p>
					<Range
						allowCross={false}
						handle={this.handle}
						pushable={1}
						min={18}
						max={80}
						onChange={this.handleChangeAge}
						defaultValue={filter.age}
						trackStyle={[{ backgroundColor: 'red' }]}
						handleStyle={[{borderColor: 'red' }, {borderColor: 'red' }]}
						/>
				</div>
				<div style={style}>
					<p style={pstyle}>Distance<span style={sstyle}>{filter.distance}km</span></p>
					<Slider
						handle={this.handle}
						onChange={this.handleChangeDistance}
						min={1}
						defaultValue={filter.distance}
						trackStyle={[{ backgroundColor: 'red' }]}
						handleStyle={[{ borderColor: 'red' }]}
						/>
				</div>
				<div style={style}>
					<p style={pstyle}>Score<span style={sstyle}>{filter.score[0]} - {filter.score[1]}</span></p>
					<Range
						allowCross={false}
						handle={this.handle}
						pushable={1}
						min={0}
						max={1000}
						onChange={this.handleChangeScore}
						defaultValue={filter.score}
						trackStyle={[{ backgroundColor: 'red' }]}
						handleStyle={[{borderColor: 'red' }, {borderColor: 'red' }]}
						/>
				</div>
				<div style={style}>
					<b>Tags</b>
					<div style={style}>
						<Input
							placeholder='Add some tags (ex: #green,#fit,#love)'
							fluid
							name='tags'
							onChange={this.handleChange}
						/>
					<p style={style}>{this.props.results} results</p>
					</div>
				</div>
			</div>
		)
  }
}

export default HomeFilter;