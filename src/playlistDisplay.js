import React from 'react';
import {Modal,Button,Toast} from 'react-bootstrap';
import {REST_URL} from './index.js';

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
            deletePlaylistStatus : "None",
            showDeleteConfirm : false,
            isDeleting : false
        };
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
            if(response.status == 204){
                this.props.onDelete();
            }else{
                this.setState({deletePlaylistStatus : "Error"});
            }
        })
        .catch(err => console.log(err));
    }

    render(){
        const playlist = this.props.playlist;
        return(

            <div>

                <Toast className="errorToast" onClose={() => this.setState({deletePlaylistStatus : "None"})} show={this.state.deletePlaylistStatus === "Error"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Error with deleting playlist. Please try again later.</Toast.Body>
                </Toast>


                {playlist.name} : {playlist.description} 
                <DeletePlaylistButton 
                playlist={playlist} 
                onDelete={this.handlePlaylistDelete.bind(this)}
                onClick={this.handleDeleteButtonClick.bind(this)}
                onCancel={() => {this.setState({showDeleteConfirm : false})}}
                showConfirmation={this.state.showDeleteConfirm}
                isDeleting={this.state.isDeleting}
                />
            </div>
        );
    }

}

export default PlaylistDisplay;