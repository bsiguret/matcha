import React, { Component } from 'react';
import { TextArea, Button, Feed, Icon, Popup } from 'semantic-ui-react';
import { socket } from '../socket/socket';
import { connect } from 'react-redux';
import moment from 'moment';

class MessageWidget extends Component {
	_isMounted = false;
	constructor(props) {
		super(props)
		this.state = {
			isWrapped: true,
			textArea: '',
			isGiletJauned: false,
			roomId: '',
			isTyping: false,
		}
		this.handleChange = this.handleChange.bind(this);
		this.handleWrap = this.handleWrap.bind(this);
		this.handleMessage = this.handleMessage.bind(this);
		this.handleRoom = this.handleRoom.bind(this);
		this.handleBack = this.handleBack.bind(this);

		socket.on('CLIENT/MSG_ISTYPING', async data => {
			if (this.state.roomId === data.roomId) {
				if (this._isMounted) {
					this.setState({isTyping: true})
				}
				if(this.timeout1)
					clearTimeout(this.timeout1)
				this.timeout1 = await setTimeout(
				async () => {
				if (this._isMounted) {
					this.setState({isTyping: false})
				}
				this.timeout1 = null;
			}, 3000)
			}
		})
	}
	
	async handleChange (e, {name, value}) {
		if (!this.timeout2)
			socket.emit('SERVER/MSG_ISTYPING', {roomId: this.state.roomId})
		if(this.timeout2)
			clearTimeout(this.timeout2)
		this.timeout2 = await setTimeout(
			async () => {
			socket.emit('SERVER/MSG_ISTYPING', {roomId: this.state.roomId})
			this.timeout2 = null;
		}, 900)
		if (this._isMounted) {
			this.setState({ [name]: value });
		}
	}
	handleWrap () { this.setState({ isWrapped: !this.state.isWrapped }); }
	handleBack () { this.setState({ isGiletJauned: !this.state.isGiletJauned }); }
	handleMessage () {
		if (this.state.textArea.replace(/\s/g, '').length) {
			socket.emit('SERVER/ADD_MESSAGE', {
				roomId: this.state.roomId,
				text: this.state.textArea.trim(),
				senderid: this.props.userId,
				receiverid: (this.props.rooms[this.state.roomId].user1Id === this.props.userId ?
					this.props.rooms[this.state.roomId].user2Id : this.props.rooms[this.state.roomId].user1Id),
				isRead: 0
			});
			if (this._isMounted) {
				this.setState({ textArea: '' })
			}
		}
	}

	handleRoom (roomId) {
		if (this._isMounted) {
			this.setState({
				roomId: roomId,
				isGiletJauned: true
			})
		}
	}

	onEnterPress = (e) => {
		if(e.keyCode === 13 && e.shiftKey === false) {
			e.preventDefault();
			this.handleMessage();
		}
	}

  getUserConnected = (userid) => {
    for (let index = 0; index < this.props.userconnected.length; index++) {
      if (this.props.userconnected[index].userid === userid)
        return true
    }
    return false
	}
	
	getNbUserConnected = (rooms) => {
		let ret = 0
		Object.entries(rooms).forEach(
				([key, value]) => {
					for (let index = 0; index < this.props.userconnected.length; index++) {
						if (this.props.userconnected[index].userid === value.user2Id)
							ret++
					}
				}
		);
    return ret
  }

	scrollToBottom() {
		const scrollHeight = document.getElementsByClassName('messages-content')[0].scrollHeight;
		const height = document.getElementsByClassName('messages-content')[0].clientHeight;
		const maxScrollTop = scrollHeight - height;
		document.getElementsByClassName('messages-content')[0].scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
	}

	Messages = ({messages}) => (
		<>
			{messages.map((message, key)=> (
				<Popup
					key={key}
					trigger={
						<div className={'message new ' + (message.senderid !== this.props.userId ? 'message-other' : 'message-personal')}>
							{message.senderid !== this.props.userId &&
							<figure className='avatar'><img src={`/${this.props.rooms[this.state.roomId].photo2}`}  alt=""/></figure>}
							{message.text}
						</div>
					}
					content={moment(message.sendTime).calendar()}
					size='tiny'
					hoverable
					inverted
				/>

			))}
		</>
		);
	Rooms = ({rooms}) => (
		<>
			{Object.values(rooms).map((room, key) => (
				<div className="chat-room" key={key} onClick={() => {this.handleRoom(room.roomId)}} style={{width: '295px' ,cursor: 'pointer', marginTop: '7px', marginLeft: '7px'}}>
						<Feed>
							<Feed.Event>
								<Feed.Label>
									<img src={`/${room.photo2}`} alt=""/>
								</Feed.Label>
								<Feed.Content>
									<Feed.Summary>
										<Feed.User>
											{room.firstname2.charAt(0).toUpperCase() + room.firstname2.slice(1)} {room.lastname2.toUpperCase()}
										</Feed.User>
										{this.getUserConnected(room.user2Id) && <Icon name='circle' color='green' size='small'/>}
										{!this.getUserConnected(room.user2Id) && <Icon name='circle outline' color='red' size='small'/>}
									</Feed.Summary>
									{room.messages.slice(-1).pop() !== undefined &&
									<Feed.Meta>{room.messages.slice(-1).pop().text.substring(0, 40)}</Feed.Meta>}
								</Feed.Content>
							</Feed.Event>
						</Feed>
				</div>
			))}
		</>
	)
	
	componentDidUpdate() {
		if (document.getElementsByClassName('messages-content')[0])
			this.scrollToBottom();
	}

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	render() {
		const { textArea, isWrapped, isGiletJauned, roomId, isTyping } = this.state
		return(
			<div className="chat-container">
			{this.props.userconnected &&
				<div className={`chat` + (this.state.isWrapped ? '' : ' chat-animation')} >
					{!isWrapped && !isGiletJauned &&
					<div className="chat-title" onClick={this.handleWrap} style={{cursor: 'pointer', position: 'fixed'}}>
						<h1>Instant Messaging</h1>
						<h2>{this.getNbUserConnected(this.props.rooms)} User(s) Connected</h2>
						<figure className="avatar">
							<img src={`/${this.props.photo.srcimg}`} alt="avatar"/>
						</figure>
					</div>}
					{!isWrapped && isGiletJauned &&
					<div className="chat-title" onClick={this.scrollToBottom}>
						<h1>{this.props.rooms[roomId].firstname2} {this.props.rooms[roomId].lastname2}</h1>
						<h2>{this.props.rooms[roomId].username2}</h2>
						<figure className="avatar">
							<img src={`/${this.props.rooms[roomId].photo2}`} alt="avatar"/>
						</figure>
						<Icon name='window minimize' className='chat-minimize' onClick={this.handleWrap}/>
						<Icon name='arrow left' className='chat-arrow-left' onClick={this.handleBack}/>
					</div>}
					{isWrapped &&
					<div className="chat-wrap-title" onClick={this.handleWrap}>
						<h1>Instant Messaging</h1>
						<h2>{this.getNbUserConnected(this.props.rooms)} User(s) Connected</h2>
					</div>}
					{!isGiletJauned &&
					<div className="room">
							<this.Rooms rooms={this.props.rooms} />				
					</div>}
					{isGiletJauned &&
					<div className="messages">
						<div className="messages-content">
							<div className='messages-container'>
								<this.Messages messages={this.props.rooms[roomId].messages} />
								{isTyping &&
								<div className="message loading new message-other">
									<figure className='avatar'><img src={`/${this.props.rooms[roomId].photo2}`}  alt=""/></figure>
									<span></span>
								</div>}
							</div>
						</div>
					</div>}
					{isGiletJauned &&
					<div className="message-box">
						<TextArea
							name='textArea'
							value={textArea}
							className="message-input"
							placeholder="Type message..."
							onChange={this.handleChange}
							onKeyDown={this.onEnterPress}
						>
						</TextArea>
						<Button type="submit" onClick={this.handleMessage} className="message-submit">Send</Button>
						</div>}
				</div>}
			</div>
		)
	}
}

const mapStateToProps = state => ({
	rooms: state.roomsReducer.rooms,
	userconnected: state.userReducer.userconnected,
	userId: state.userReducer.user.id,
	photo: state.userReducer.user.photos[0]
})

export default connect(mapStateToProps)(MessageWidget);