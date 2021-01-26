import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import {REST_URL} from './index.js';
import Loading from './loading.js';
import SongModalBody from './songmodal.js';
import {Modal,Toast} from 'react-bootstrap';
import style from './songdisplay.module.css';

function SearchBar(props){

    function searchSongChange(e){
        props.onChange(e);
    }

    return(
        <div className={style.searchcontainer}>
            <input
                value={props.songSearch}
                placeholder={"search song"}
                onChange={(e) => searchSongChange(e.target.value)}
            />
        </div>
    );
}

function Song(props){

    return(
        <div onClick={props.onClick} className={style.songcell}>
            <div className={style.songimage}>
                <img src="https://storage.googleapis.com/snp_img/default.png" alt="default"/>
            </div>
            <div className={style.songinfo}>
                {props.name} : {props.artist}
            </div>
        </div>
    );

}

class SongDisplay extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            songModalOpen : false,
            editsongStatus : "None",
            songSearch : "",
            modalLoading : false,
            editing : false,
        };

        this.handleSongClick.bind(this);
    }

    handleSongModalSubmit(name,artist,minutes,seconds,bpm,vocals,genres){
        this.setState({modalLoading : true});

        var params = {
            length : seconds + (60*minutes),
            bpm : bpm,
            vocals : vocals,
            genres : genres
        };

        if(!(this.props.currSong.name === name && this.props.currSong.artist === artist)){
            params['name'] = name;
            params['artist'] = artist;
        }

        const reqOpts = {
            method : 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + this.props.jwt 
            },
            body: JSON.stringify(params),
        };
        fetch(REST_URL + "songs/" + this.props.currSong.id, reqOpts)
        .then(response => response.json())
        .then(data => {
            if(!data.id) {
                console.log(data);
                if(data.Error === "Song is already in the database") this.setState({editsongStatus : "ErrorDupe",modalLoading : false});
                else this.setState({editsongStatus : "Error",modalLoading : false});
            }else {
                let thisSong = this.props.currSong;

                thisSong.name = name;
                thisSong.artist = artist;
                thisSong.length = seconds + (60*minutes);
                thisSong.bpm = bpm;
                thisSong.vocals = vocals;
                thisSong.genres = genres;

                this.props.onEdit(thisSong);
                this.setState({editsongStatus : "Success", modalLoading : false, editing : false});
            }
        })
        .catch(err => console.log(err));
    }

    handleSearchChange(e){
        this.setState({songSearch : e});
    }

    handleSongClick(i){
        this.props.onClick(i);
        this.setState({songModalOpen : true});
    }

    handleAddToPlaylist(i){
        this.props.onAdd(i);
    }

    handleCloseModal(){
        this.setState({songModalOpen : false, modalLoading : false, editing : false});
    }

    handleSongCancelClick(){
        this.setState({editing : false});
    }

    handleSongEditClick(){
        this.setState({editing : true});
    }

    render(){

        var items = [];
        items = this.props.songs.map((song,i) => {
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

        var modalContent = 
        <SongModalBody 
        type="song" 
        isLoading={this.state.modalLoading} 
        song={this.props.songs[this.props.currSongIndex]} 
        onSubmit={this.handleSongModalSubmit.bind(this)} 
        jwt={this.props.jwt} 
        playlists={this.props.playlists}
        onAdd={this.handleAddToPlaylist.bind(this)}
        onEdit={this.handleSongEditClick.bind(this)}
        onCancel={this.handleSongCancelClick.bind(this)}
        editing={this.state.editing}/>
        
    

        return(
            <div className={style.container}>

                <Toast className="errorToast" onClose={() => this.setState({editsongStatus : "None"})} show={this.state.editsongStatus === "ErrorDupe"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>New song name and artist is already in the database.</Toast.Body>
                </Toast>


                <Toast className="errorToast" onClose={() => this.setState({editsongStatus : "None"})} show={this.state.editsongStatus === "Error"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Error with editing song. Please try again later.</Toast.Body>
                </Toast>

                <Toast className="errorToast" onClose={() => this.setState({editsongStatus : "None"})} show={this.state.editsongStatus === "Success"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Successfully edited song.</Toast.Body>
                </Toast>


                <SearchBar
                songSearch={this.state.songSearch}
                onChange={this.handleSearchChange.bind(this)}
                />
                <Modal
                show={this.state.songModalOpen}
                onHide={this.handleCloseModal.bind(this)}
                backdrop={this.state.editing ? 'static' : true}
                keyboard={false}
                centered={true}
                >
                    <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{modalContent}</Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>


                <InfiniteScroll
                pageStart={0}
                loadMore={this.props.songsLoadMore}
                hasMore={this.props.hasMoreSongs}
                loader={<Loading key={0}/>}
                className={style.songcontainer}
                >
                    {items} 
                </InfiniteScroll>
           
            </div>
        );
    }

}

export default SongDisplay;