import React from 'react';
import Modal from 'react-modal';
import AvatarEditor from 'react-avatar-editor';
import { Radio, Icon } from 'semantic-ui-react'
import { toast } from 'react-toastify';
// import MDSpinner from "react-md-spinner";
// import { toast } from 'react-toastify';
import Dropzone from 'react-dropzone'
import { userActions } from '../redux/actions/user';
import { connect } from 'react-redux';

const customStyles = {
	overlay : {
    zIndex            : '1',
		position          : 'fixed',
		top               : 0,
		left              : 0,
		right             : 0,
		bottom            : 0,
		backgroundColor   : 'rgba(0, 0, 0, 0.85)'
	},
	content : {
    zIndex            : '1',
		top               : '50%',
		left             	: '50%',
		right                 : 'auto',
		bottom                : 'auto',
		marginRight           : '-50%',
		transform             : 'translate(-50%, -50%)'
	}
};

const dropzoneStyle = {
  height: '125px',
  width: '125px',
	border: '1px dashed black'
}

const plusCircleStyle = {
  zIndex: '2',
  position: 'absolute'
}

class PhotoUploader extends React.Component {
  constructor() {
    super()
    this.state = {
      defineAs: false,
      scale: 1,
			modalIsOpen: false
		}
		this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleScale = this.handleScale.bind(this);
  }

	onDrop(files) {
		if (files[0].size > 1000000)
			toast.error('file size must be 1mb maximum', {position: toast.POSITION.TOP_RIGHT});
		else if (files[0].type !== 'image/jpeg' && files[0].type !== 'image/jpg' && files[0].type !== 'image/png')
			toast.error('file must be a jpg/png/jpeg', {position: toast.POSITION.TOP_RIGHT});
		else {
			this.openModal(files)
		}
  }

	openModal (files) {
		let file = URL.createObjectURL(files[0]);
			this.setState({ 
				modalIsOpen: true,
				file
			});
	}

  onCancel() {
    this.setState({
      files: []
    });
  }
  
  closeModal() {
    this.setState({ modalIsOpen: false });
	}
	
	onClickSave = async () => {
    if (this.editor) {
			try {
				const canvas = this.editor.getImage().toDataURL("image/png")//.split(',')[1];
				await this.setState({ modalIsOpen: false });
				await this.props.dispatch(userActions.savePhoto(canvas, this.state.defineAs, this.props.token));
			}
			catch {
				toast.error('file must be a valid image', {position: toast.POSITION.TOP_RIGHT});
			}
    }
  }

  handleScale = (e) => {
    const scale = parseFloat(e.target.value);
    this.setState({ scale });				  
  }

  handleToggle = () => { this.setState({ defineAs: !this.state.defineAs }) }

	setEditorRef = (editor) => this.editor = editor
	
  render() {
    return (
			<div>
				<section>
					<div className="dropzone">
						<Dropzone
							onDrop={this.onDrop.bind(this)}
              onFileDialogCancel={this.onCancel.bind(this)}
							style={dropzoneStyle}
						>
            <Icon style={plusCircleStyle} name='plus circle' color='red'/>
						</Dropzone>
					</div>
				</section>
        <Modal
						isOpen={this.state.modalIsOpen}
						onAfterOpen={this.afterOpenModal}
						onRequestClose={this.closeModal}
						style={customStyles}
						contentLabel="Modal"
						ariaHideApp={false}
					>

						<AvatarEditor
							ref={this.setEditorRef}
							image={this.state.file}
							width={250}
							height={250}
							border={50}
							color={[255, 255, 255, 0.6]} // RGB
							scale={this.state.scale}
							rotate={0}
						/>	

						<br />
						<input
							name='scale'
              type='range'
							onChange={this.handleScale}
              min='1'
              max='3'
              step='0.01'
              defaultValue='1'
						/>
						<br />
            <Radio label='Make this picture my profile picture' toggle checked={this.state.defineAs} onChange={this.handleToggle} />
            <br />
            <br />
						<button onClick={this.closeModal}>close</button>
						<button onClick={this.onClickSave}>save</button>
					</Modal>
			</div>
    );
  }
}

Modal.setAppElement('#root');

export default connect()(PhotoUploader);