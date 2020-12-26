import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Modal from 'react-modal';
import {REST_URL} from './index.js';
import style from './songDisplay.module.css';
import Loading from './loading.js';

function SearchBar(props){

    function searchSongChange(e){
        props.onChange(e);
    }

    return(
        <input
            className = {style.searchbar}
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

class SongDisplay extends React.Component{

    constructor(props){
        super(props);
        Modal.setAppElement('#root');
        this.state = {
            songs : [],
            hasMoreSongs : true,
            songModalOpen : false,
            songModalIndex : 0,
            songSearch : ""
        };

        this.handleSongClick.bind(this);
    }

    handleSearchChange(e){
        this.setState({songSearch : e});
    }

    handleSongClick(i){
        this.setState({songModalOpen : true, songModalIndex : i});
    }

    handleCloseModal(){
        this.setState({songModalOpen : false});
    }

    handleAfterOpenModal(){
        // Logic after modal is displayed
    }

    handleLoadMore(page){

        const reqOpts = {
            method : 'GET',
            headers: { 'Content-Type': 'application/json' },
        };

        this.setState({hasMoreSongs : false});

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
            modalContent = (
                <div>
                    {thisSong.name}
                    {thisSong.artist}
                    {thisSong.vocals}
                </div>
            );
        }

        return(
            <div>
                <SearchBar
                songSearch={this.state.songSearch}
                onChange={this.handleSearchChange.bind(this)}
                />
                <Modal
                isOpen={this.state.songModalOpen}
                onAfterOpen={this.handleAfterOpenModal.bind(this)}
                onRequestClose={this.handleCloseModal.bind(this)}
                contentLabel="Song"
                >
                    {modalContent}
                </Modal>
                <InfiniteScroll
                pageStart={0}
                loadMore={this.handleLoadMore.bind(this)}
                hasMore={this.state.hasMoreSongs}
                loader={<Loading/>}
                >
                    {items} 
                </InfiniteScroll>
            
            </div>
        );
    }

}

export default SongDisplay;