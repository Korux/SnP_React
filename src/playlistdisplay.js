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

function PlaylistSong(props){

    return(
        <div>
            {props.song.id} {props.song.name} : {props.song.artist}

            <button type="button" onClick={() => props.onClick(props.idx)}>X</button>

            <Modal
            show={props.showConfirmation && props.showConfirmIdx === props.idx}
            backdrop="static"
            keyboard={false}
            >
                <Modal.Body>
                    Delete Song "{props.song.name}"?
                </Modal.Body>
                <Modal.Footer>
                    <Button disabled={props.isDeleting} onClick={props.onCancel}>Cancel</Button>
                    <Button disabled={props.isDeleting} onClick={() => props.onDelete(props.song,props.idx)}>Delete</Button>
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
            showDeleteConfirmPlaylist : false,
            isDeletingPlaylist : false,
            editing : false,
            editPlaylistStatus : "None",
            snapshot : "",
            showDeleteConfirmSong : false,
            isDeletingSong : false,
            deleteSongStatus : "None",
            deleteSongIndex : 0,
        };

        this.nameRef = React.createRef();
        this.descRef = React.createRef();
    }

    handleSongDeleteClick(i){
        this.setState({showDeleteConfirmSong : true, deleteSongIndex : i});
    }

    handleDeleteButtonClick(){
        this.setState({showDeleteConfirmPlaylist : true});
    }

    handlePlaylistDelete(){

        this.setState({isDeletingPlaylist : true});

        const reqOpts = {
            method : 'DELETE',
            headers: { 
                'Authorization' : 'Bearer ' + this.props.jwt 
            },
        };

        fetch(REST_URL + "playlists/" + this.props.playlist.id, reqOpts)
        .then(response => {
            if(response.status === 204){
                this.setState({deletePlaylistStatus : "Success"});
                this.props.onDelete();
            }else{
                this.setState({deletePlaylistStatus : "Error", isDeletingPlaylist : false, showDeleteConfirmPlaylist : false});
            }
        })
        .catch(err => console.log(err));
    }

    handleSongDelete(song,i){

        this.setState({isDeletingSong : true});

        const reqOpts = {
            method : 'DELETE',
            headers: { 
                'Authorization' : 'Bearer ' + this.props.jwt 
            },
        };

        fetch(REST_URL + "playlists/" + this.props.playlist.id + "/songs/" + song.id, reqOpts)
        .then(response => {
            if(response.status === 204){
                this.props.onDeleteSong(i);
                this.setState({deleteSongStatus : "Success", isDeletingSong : false, showDeleteConfirmSong : false});
            }else{
                this.setState({deleteSongStatus : "Error", isDeletingSong : false, showDeleteConfirmSong : false});
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

        let playlistSongs = this.props.songs.map((song,i) => {
            return(
                <PlaylistSong 
                song={song} 
                key={i}
                idx={i}
                onDelete={this.handleSongDelete.bind(this)}
                onClick={this.handleSongDeleteClick.bind(this)}
                onCancel={() => {this.setState({showDeleteConfirmSong : false})}}
                showConfirmation={this.state.showDeleteConfirmSong}
                showConfirmIdx={this.state.deleteSongIndex}
                isDeleting={this.state.isDeletingSong}/>
            );
        });

        return(

            <div>

                <Toast className="errorToast" onClose={() => this.setState({deletePlaylistStatus : "None"})} show={this.state.deletePlaylistStatus === "Error"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Error with deleting playlist. Please try again later.</Toast.Body>
                </Toast>

                <Toast className="errorToast" onClose={() => this.setState({deletePlaylistStatus : "None"})} show={this.state.deletePlaylistStatus === "Success"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Successfully deleted playlist</Toast.Body>
                </Toast>

                <Toast className="errorToast" onClose={() => this.setState({editPlaylistStatus : "None"})} show={this.state.editPlaylistStatus === "Error"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Error with editing playlist. Please try again later.</Toast.Body>
                </Toast>

                <Toast className="errorToast" onClose={() => this.setState({deleteSongStatus : "None"})} show={this.state.deleteSongStatus === "Error"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Error removing song from playlist. Please try again later.</Toast.Body>
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
                onCancel={() => {this.setState({showDeleteConfirmPlaylist : false})}}
                showConfirmation={this.state.showDeleteConfirmPlaylist}
                isDeleting={this.state.isDeletingPlaylist}
                />
                {!this.state.editing &&  <Button type="button" onClick={this.handleEditClick.bind(this)}>Edit</Button>}
                {this.state.editing && <Button type="button" onClick={this.handleEditCancel.bind(this)} disabled={this.state.editPlaylistStatus === "Working"}>Cancel</Button>}
                {this.state.editing && <Button type="button" onClick={this.handleEditSave.bind(this)} disabled={this.state.editPlaylistStatus === "Working"}>Save</Button>}
                {playlistSongs}
            </div>
        );
    }

}

export default PlaylistDisplay;