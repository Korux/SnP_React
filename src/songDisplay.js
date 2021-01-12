import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import {REST_URL} from './index.js';
import Loading from './loading.js';

import SongModalBody from './songModal.js';

import {Modal,Form,Button,Toast} from 'react-bootstrap';

function SearchBar(props){

    function searchSongChange(e){
        props.onChange(e);
    }

    return(
        <input
            value={props.songSearch}
            placeholder={"search song"}
            onChange={(e) => searchSongChange(e.target.value)}
        />
    );
}

function Song(props){

    return(
        <div onClick={props.onClick}>{props.name} : {props.artist}</div>
    );

}

function AddSongButton(props){
    return(
        <div onClick={props.onClick}>Add Song</div>
    );
}

class SongDisplay extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            songs : [],
            hasMoreSongs : true,
            songModalOpen : false,
            songModalIndex : 0,
            editsongStatus : "None",
            songSearch : "",
            addsongModalOpen : false,
            addsongStatus : "None",
            modalLoading : false
        };

        this.handleSongClick.bind(this);
    }

    handleSongModalSubmit(name,artist,minutes,seconds,bpm,vocals,genres){
        this.setState({modalLoading : true});
        let thisSong = this.state.songs[this.state.songModalIndex];
        let newSongs = this.state.songs.slice();

        thisSong.name = name;
        thisSong.artist = artist;
        thisSong.length = seconds + (60*minutes);
        thisSong.bpm = bpm;
        thisSong.vocals = vocals;
        thisSong.genres = genres;

        newSongs.splice(this.state.songModalIndex,1,thisSong);

        const params = {
            name : thisSong.name,
            artist : thisSong.artist,
            length : thisSong.length,
            bpm : thisSong.bpm,
            vocals : thisSong.vocals,
            genres : thisSong.genres
        };

        const reqOpts = {
            method : 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + this.props.jwt 
            },
            body: JSON.stringify(params),
        };

        fetch(REST_URL + "songs/" + thisSong.id, reqOpts)
        .then(response => response.json())
        .then(data => {
            if(!data.id) {
                this.setState({editsongStatus : "Error", modalLoading : false});
            }else {
                this.setState({editsongStatus : "Success",songs : newSongs, modalLoading : false});
            }
        })
        .catch(err => console.log(err));
    }

    handleSearchChange(e){
        this.setState({songSearch : e});
    }

    handleSongClick(i){
        this.setState({songModalOpen : true, songModalIndex : i});
    }

    handleCloseModal(){
        this.setState({songModalOpen : false, addsongModalOpen : false, modalLoading : false});
    }

    handleAddSongClick(){
        this.setState({addsongModalOpen : true});
    }

    handleAddSongSuccess(name,artist,minutes,seconds,bpm,vocals,genres){
        this.setState({modalLoading : true});
        const params = {
            name : name,
            artist : artist,
            length : seconds + (minutes * 60),
            bpm : bpm,
            vocals : vocals,
            genres : genres
        };

        const reqOpts = {
            method : 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + this.props.jwt 
            },
            body: JSON.stringify(params),
        };

        fetch(REST_URL + "songs", reqOpts)
        .then(response => response.json())
        .then(data => {
            if(!data.id) {
                this.setState({addsongStatus : "Error",modalLoading : false});
            }else {
                this.setState({addsongStatus : "Success",modalLoading : false});
                var newSongs = this.state.songs.slice();
                newSongs.splice(0,0,data);
                this.setState({songs : newSongs});
            }
            this.handleCloseModal();
        })
        .catch(err => console.log(err));
    }

    handleLoadMore(page){

        const reqOpts = {
            method : 'GET',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch(REST_URL + 'songs?page=' + page,reqOpts)
        .then(response => response.json())
        .then(data => {
            var newSongs = this.state.songs.slice();
            data.songs.forEach(song => {
                newSongs.push(song);
            });
            this.setState({songs : newSongs});
            if(!data.next){
                this.setState({hasMoreSongs : false});
            }
        })
        .catch(error => console.log(error));
    }

    render(){

        var items = [];
        items = this.state.songs.map((song,i) => {
            return(
                <Song 
                key={i}
                bpm={song.bpm}
                length={song.length}
                artist={song.artist}
                vocals={song.vocals}
                name={song.name} 
                genres={song.genres}
                onClick={() => this.handleSongClick(i)}
                />
            );
        });

        var modalContent = <div>No Song to Display</div>;
        if(!(this.state.songs.length < this.state.songModalIndex + 1)){
            let thisSong = this.state.songs[this.state.songModalIndex];
            modalContent = <SongModalBody type="song" isLoading={this.state.modalLoading} song={thisSong} onSubmit={this.handleSongModalSubmit.bind(this)} jwt={this.props.jwt}/>;
        }

        return(
            <div>

                <Toast className="errorToast" onClose={() => this.setState({addsongStatus : "None"})} show={this.state.addsongStatus === "Error"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Error with song creation. Please try again later.</Toast.Body>
                </Toast>

                <Toast className="errorToast" onClose={() => this.setState({editsongStatus : "None"})} show={this.state.editsongStatus === "Error"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Error with editing song. Please try again later.</Toast.Body>
                </Toast>


                <SearchBar
                songSearch={this.state.songSearch}
                onChange={this.handleSearchChange.bind(this)}
                />
                <Modal
                show={this.state.songModalOpen}
                onHide={this.handleCloseModal.bind(this)}
                centered={true}
                >
                    <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{modalContent}</Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>

                <Modal
                show={this.state.addsongModalOpen}
                onHide={this.handleCloseModal.bind(this)}
                backdrop="static"
                keyboard={false}
                centered={true}
                >
                    <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                    </Modal.Header>
                    <Modal.Body><SongModalBody type="newsong" isLoading={this.state.modalLoading} onSubmit={this.handleAddSongSuccess.bind(this)}/></Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                    
                </Modal>

                <InfiniteScroll
                pageStart={0}
                loadMore={this.handleLoadMore.bind(this)}
                hasMore={this.state.hasMoreSongs}
                loader={<Loading/>}
                >
                    {items} 
                </InfiniteScroll>
                {this.props.jwt !== "" && <AddSongButton onClick={this.handleAddSongClick.bind(this)}/>}
            </div>
        );
    }

}

export default SongDisplay;