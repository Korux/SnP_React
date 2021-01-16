import React from 'react';
import {Modal,Button,Toast} from 'react-bootstrap';
import {REST_URL} from './index.js';
import {EditableText} from './utils.js';

import {Form} from 'react-bootstrap';

function DeletePlaylistButton(props){

    return(
        <div>
            <button type="button" onClick={props.onClick}>Delete Playlist</button>

            <Modal
            show={props.showConfirmation}
            backdrop="static"
            keyboard={false}
            >
                <Modal.Body>
                    Delete Playlist "{props.playlist.name}"?
                </Modal.Body>
                <Modal.Footer>
                    <Button disabled={props.isDeleting} onClick={props.onCancel}>Cancel</Button>
                    <Button disabled={props.isDeleting} onClick={props.onDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
            
            
        </div>
    );
}

class PlaylistDisplay extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            playlistName : "",
            playlistDesc : "",
            deletePlaylistStatus : "None",
            showDeleteConfirm : false,
            isDeleting : false,
            editing : false,
            editPlaylistStatus : "None",
            snapshot : "",
        };

        this.nameRef = React.createRef();
        this.descRef = React.createRef();
    }

    handleDeleteButtonClick(){
        this.setState({showDeleteConfirm : true});
    }

    handlePlaylistDelete(){

        this.setState({isDeleting : true});

        const reqOpts = {
            method : 'DELETE',
            headers: { 
                'Authorization' : 'Bearer ' + this.props.jwt 
            },
        };

        fetch(REST_URL + "playlists/" + this.props.playlist.id, reqOpts)
        .then(response => {
            if(response.status === 204){
                this.props.onDelete();
            }else{
                this.setState({deletePlaylistStatus : "Error"});
            }
        })
        .catch(err => console.log(err));
    }

    handleEditClick(){
        this.setState({editing : true, playlistName : this.props.playlist.name, playlistDesc : this.props.playlist.description});
    }

    handleEditSave(){

        this.setState({editPlaylistStatus : "Working"});

        const params = {
            name : this.state.playlistName,
            description : this.state.playlistDesc
        };

        const reqOpts = {
            method : 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + this.props.jwt 
            },
            body: JSON.stringify(params),
        };

        fetch(REST_URL + "playlists/" + this.props.playlist.id, reqOpts)
        .then(response => {
            if(response.status === 200){
                this.props.onEdit(this.state.playlistName,this.state.playlistDesc);
                this.setState({editing : false, editPlaylistStatus : "None"});
            }else{
                this.setState({editPlaylistStatus : "Error"});
            }
        })
        .catch(err => console.log(err));


    }

    handleEditCancel(){
        this.setState({editing : false});
    }

    render(){
        return(

            <div>

                <Toast className="errorToast" onClose={() => this.setState({deletePlaylistStatus : "None"})} show={this.state.deletePlaylistStatus === "Error"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Error with deleting playlist. Please try again later.</Toast.Body>
                </Toast>

                <Toast className="errorToast" onClose={() => this.setState({editPlaylistStatus : "None"})} show={this.state.editPlaylistStatus === "Error"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Error with editing playlist. Please try again later.</Toast.Body>
                </Toast>


                <EditableText
                text={this.props.playlist.name} 
                placeholder="playlist name"
                childRef={this.nameRef}
                editing={this.state.editing}>
                    <Form.Control
                    type="text"
                    value={this.state.playlistName}
                    autoComplete="off"
                    onChange={(e) => this.setState({playlistName : e.target.value})}/>
                </EditableText>

                <br/>

                <EditableText
                text={this.props.playlist.description} 
                placeholder="playlist description"
                childRef={this.descRef}
                editing={this.state.editing}>
                    <Form.Control
                    type="text"
                    value={this.state.playlistDesc}
                    autoComplete="off"
                    onChange={(e) => this.setState({playlistDesc : e.target.value})}/>
                </EditableText>

                <DeletePlaylistButton 
                playlist={this.props.playlist} 
                onDelete={this.handlePlaylistDelete.bind(this)}
                onClick={this.handleDeleteButtonClick.bind(this)}
                onCancel={() => {this.setState({showDeleteConfirm : false})}}
                showConfirmation={this.state.showDeleteConfirm}
                isDeleting={this.state.isDeleting}
                />
                {!this.state.editing &&  <Button type="button" onClick={this.handleEditClick.bind(this)}>Edit</Button>}
                {this.state.editing && <Button type="button" onClick={this.handleEditCancel.bind(this)} disabled={this.state.editPlaylistStatus === "Working"}>Cancel</Button>}
                {this.state.editing && <Button type="button" onClick={this.handleEditSave.bind(this)} disabled={this.state.editPlaylistStatus === "Working"}>Save</Button>}
            </div>
        );
    }

}

export default PlaylistDisplay;