import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import {REST_URL} from './index.js';
import Loading from './loading.js';

import {Modal,Form,Button} from 'react-bootstrap';

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

function AddSongForm(props){
    const [name,setName] = React.useState("");
    const [minutes,setMinutes] = React.useState(0);
    const [seconds,setSeconds] = React.useState(0);
    const [bpm,setBPM] = React.useState(0);
    const [vocals,setVocals] = React.useState([]);

    const [thisVocal,setThisVocal] = React.useState("");

    function validateForm(){
        return name.length > 0 && minutes > -1 && seconds > 0;
    }

    function handleSubmit(event){
        event.preventDefault();
        props.onSubmit(name,minutes,seconds,bpm,vocals);
    }

    function addVocal(){
        var newVocals = vocals.slice();
        newVocals.push(thisVocal);
        setVocals(newVocals);
    }

    return (
        <div>
            <Form onSubmit={handleSubmit}>
            <Form.Group size="lg" controlId="name">
                <Form.Label>Song Name</Form.Label>
                <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                />
            </Form.Group>
            <Form.Group size="lg" controlId="length">
                <Form.Label>Song Length</Form.Label>
                <Form.Control
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                />
                :
                <Form.Control
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                />
            </Form.Group>
            <Form.Group size="lg" controlId="vocals">
                <Form.Label>Vocals</Form.Label>
                <Form.Control
                type="text"
                value={thisVocal}
                onChange={(e) => setThisVocal(e.target.value)}
                />
                <Button type="button" onClick={addVocal} disabled={thisVocal.length === 0}>
                    Add Vocal
                </Button>
            </Form.Group>
            <Button block size="lg" type="submit" disabled={!validateForm()}>
                Create
            </Button>
            </Form>
        </div>
    );
}

function AddSong(props){
    return(
        <div onClick={props.onClick}>Add Song</div>
    );
}

class SongDisplay extends React.Component{

    constructor(props){
        super(props);
        //Modal.setAppElement('#root');
        this.state = {
            songs : [],
            hasMoreSongs : true,
            songModalOpen : false,
            songModalIndex : 0,
            songSearch : "",
            addsongModalOpen : false
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
        this.setState({songModalOpen : false, addsongModalOpen : false});
    }

    handleAfterOpenModal(){
        // Logic after modal is displayed
    }


    handleAddSongClick(){
        this.setState({addsongModalOpen : true});
    }

    handleAddSongSuccess(name,minutes,seconds,bpm,vocals){
        this.handleCloseModal();
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

        items.push(<AddSong key="r11" onClick={this.handleAddSongClick.bind(this)}/>);

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
                show={this.state.songModalOpen}
                onHide={this.handleCloseModal.bind(this)}
                >
                    <Modal.Header>
                    <Modal.Title>Modal heading</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{modalContent}</Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>

                <Modal
                show={this.state.addsongModalOpen}
                onHide={this.handleCloseModal.bind(this)}
                >
                    <AddSongForm onSubmit={this.handleAddSongSuccess.bind(this)}/>
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