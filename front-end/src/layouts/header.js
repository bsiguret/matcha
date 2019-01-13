import React, { Component } from 'react'
import { Icon, Dropdown, Menu, Image, Label, Popup, Feed} from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { authActions } from '../redux/actions/auth';
import { socket } from '../socket/socket';
import moment from 'moment';

const notif = {
  maxHeight: '120px',
  overflow: 'auto'
}

class HeaderMenu extends Component {

	handleItemClick = (e, { name }) => this.setState({ activeItem: name })
	
	handleLogout = async () => {
		await this.props.dispatch(authActions.logoutUser());

  }

  getUnRead = (notifs) => {
    var ret = 0
    for (let index = 0; index < notifs.length; index++) {
      if (!notifs[index].isRead)
        ret++
    }
    return ret
  }

  UpdateRead = () => {
    socket.emit('SERVER/READ_NOTIF', this.props.userId);
  }

  trigger = (
    <>
    {this.props.photos && this.props.photos[0] && 
      <span>
        <Image avatar src={`/${this.props.photos[0].srcimg}`} /> {this.props.username.charAt(0).toUpperCase() + this.props.username.slice(1)}
      </span>}
    {(!this.props.photos || !this.props.photos[0]) && 
      <span>
        <Image avatar src='/images/defaultAvatar.png' /> {this.props.username.charAt(0).toUpperCase() + this.props.username.slice(1)}
      </span>}
    </>
  )

  options = [
    { key: 'user', text: 'Account', icon: 'user', as: Link, to: '/account' },
    { key: 'sign-out', text: 'Sign Out', icon: 'sign out', onClick: this.handleLogout},
  ]

	Notifications = ({notifs}) => (
		<>
			{notifs.slice(0).reverse().map((notif, key)=> (
          <Feed.Event key={key}>
            <Feed.Content>
              {notif.username1 &&
              <Feed.Summary>
                <Feed.User>{notif.username1}</Feed.User>{notif.msg}
                <Feed.Date>{moment(notif.notitime, 'DD-MM-YYYY, HH:mm:ss').fromNow()}</Feed.Date>
              </Feed.Summary>}
              {notif.username &&
              <Feed.Summary>
                <Feed.User>{notif.username}</Feed.User>{` ${notif.notitype}`}
                <Feed.Date>{moment(notif.notitime, 'YYYY-MM-DD, HH:mm:ss').fromNow()}</Feed.Date>
              </Feed.Summary>}
            </Feed.Content>
          </Feed.Event>
			))}
		</>
    );
  

  render() {
    const { notifs } = this.props
    return (
      <Menu attached>
          <Menu.Item header as={Link} to='/home' name='home'>
            <Icon name='heart' color='red' size="large"/>Matcha
          </Menu.Item>
          <Menu.Item name='notif' style={{cursor: 'pointer'}}>
            <Popup
                trigger={
                  <div>
                    <Icon name='bell' />
                    <Label
                      style={{right: '8px', position: 'absolute', top: '7px'}}
                      color='red'
                      size='tiny'
                      circular
                    >
                    {this.getUnRead(notifs)}
                    </Label>
                  </div>
                }
                content={<Feed style={notif}><this.Notifications notifs={notifs}/></Feed>}
                on='click'
                onOpen={this.UpdateRead}
                position='bottom center'
                basic
            />
          </Menu.Item>
          <Menu.Menu position='right'>
          </Menu.Menu>
          <Dropdown className='headermenu' trigger={this.trigger} options={this.options} pointing='top right' icon={null}/>
      </Menu>
    )
  }
}

const mapStateToProps = state => ({
  notifs: state.notifReducer.notif,
  userId: state.userReducer.user.id
})

export default connect(mapStateToProps)(HeaderMenu);