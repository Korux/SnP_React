import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import {REST_URL} from './index.js';
import Loading from './loading.js';
import LoadingOverlay from 'react-loading-overlay';

import {Modal,Form,Button,ListGroup} from 'react-bootstrap';

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
    const [artist,setArtist] = React.useState("");
    const [minutes,setMinutes] = React.useState(0);
    const [seconds,setSeconds] = React.useState(0);
    const [bpm,setBPM] = React.useState(0);
    const [vocals,setVocals] = React.useState([]);
    const [genres,setGenres] = React.useState([]);

    const [thisGenre,setThisGenre] = React.useState("");
    const [thisVocal,setThisVocal] = React.useState("");

    const [isLoading,setLoading] = React.useState(false);

    function validateForm(){
        return name.length > 0 && 
        minutes >= 0 && 
        seconds > 0 &&
        artist.length > 0 &&
        bpm > 0;
    }

    function handleSubmit(event){
        setLoading(true);
        event.preventDefault();
        props.onSubmit(name,artist,minutes,seconds,bpm,vocals,genres);
    }

    function addVocal(){
        var newVocals = vocals.slice();
        newVocals.push(thisVocal);
        setVocals(newVocals);
        setThisVocal("");
    }

    function removeVocal(i){
        var newVocals = vocals.slice();
        newVocals.splice(i,1);
        setVocals(newVocals);

    }

    function addGenre(){
        var newGenres = genres.slice();
        newGenres.push(thisGenre);
        setGenres(newGenres);
        setThisGenre("");
    }

    function removeGenre(i){
        var newGenres = genres.slice();
        newGenres.splice(i,1);
        setGenres(newGenres);
    }

    function displayVocals(){
        const vocalList = vocals.map((vocal,i) => {
            return(
                <li key={i}>{vocal}<span className="close" onClick={() => removeVocal(i)}>x</span></li>
            );
        });
        return(
            <div>
                {vocalList}
            </div>
        );
    }

    function displayGenres(){
        const genreList = genres.map((genre,i) => {
            return(
                <li key={i}>{genre}<span className="close" onClick={() => removeGenre(i)}>x</span></li>
            );
        });
        return(
            <div>
                {genreList}
            </div>
        );
    }

    function setMinutesIntOnly(i){
        var test = i.replace(/[^\d]/,'');
        if(test === '') test = 0;
        if(!Number.isNaN(parseInt(test))){
            setMinutes(parseInt(test));
        }
    }

    function setSecondsIntOnly(i){
        var test = i.replace(/[^\d]/,'');
        if(test === '') test = 0;
        if(!Number.isNaN(parseInt(test))){
            setSeconds(parseInt(test));
        }
    }

    return (
        <div>
            <LoadingOverlay
            active = {isLoading}
            spinner
            text='creating song...'
            >
                <Form onSubmit={handleSubmit}>
                <Form.Group size="lg" controlId="name">
                    <Form.Label>Song Name</Form.Label>
                    <Form.Control
                    type="text"
                    value={name}
                    autoComplete="off"
                    onChange={(e) => setName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group size="lg" controlId="artist">
                    <Form.Label>Song Artist</Form.Label>
                    <Form.Control
                    type="text"
                    value={artist}
                    autoComplete="off"
                    onChange={(e) => setArtist(e.target.value)}
                    />
                </Form.Group>
                <Form.Group size="lg" controlId="length">
                    <Form.Label>Song Length</Form.Label>
                    <Form.Control
                    type="text"
                    value={minutes}
                    autoComplete="off"
                    onChange={(e) => setMinutesIntOnly(e.target.value)}
                    />
                    :
                    <Form.Control
                    type="number"
                    value={seconds}
                    autoComplete="off"
                    onChange={(e) => setSecondsIntOnly(e.target.value)}
                    />
                </Form.Group>
                <Form.Group size="lg" controlId="bpm">
                    <Form.Label>Song BPM</Form.Label>
                    <Form.Control
                    type="number"
                    value={bpm}
                    autoComplete="off"
                    onChange={(e) => setBPM(e.target.value)}
                    />
                </Form.Group>
                <Form.Group size="lg" controlId="vocals">
                    <Form.Label>Vocals</Form.Label>
                    <Form.Row>
                        <Form.Group as={Form.Col}>
                            <Form.Control
                            type="text"
                            value={thisVocal}
                            autoComplete="off"
                            onChange={(e) => setThisVocal(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group as={Form.Col}>
                            <Button type="button" onClick={addVocal} disabled={thisVocal.length === 0}>
                                Add Vocal
                            </Button>
                        </Form.Group>
                    </Form.Row>

                    <ul>
                        {displayVocals()}
                    </ul>
                    
                </Form.Group>
                <Form.Group size="lg" controlId="genres">
                    <Form.Label>Genres</Form.Label>
                    <Form.Row>
                        <Form.Group as={Form.Col}>
                            <Form.Control
                            type="text"
                            value={thisGenre}
                            autoComplete="off"
                            onChange={(e) => setThisGenre(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group as={Form.Col}>
                            <Button type="button" onClick={addGenre} disabled={thisGenre.length === 0}>
                                Add Genre
                            </Button>
                        </Form.Group>
                    </Form.Row>
                    
                    <ul>
                        {displayGenres()}
                    </ul>
                    
                </Form.Group>
                <Button block size="lg" type="submit" disabled={!validateForm()}>
                    Create
                </Button>
                </Form>
            </LoadingOverlay>
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

    handleAddSongSuccess(name,artist,minutes,seconds,bpm,vocals,genres){
        //this.handleCloseModal();
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
                    <Modal.Body><AddSongForm onSubmit={this.handleAddSongSuccess.bind(this)}/></Modal.Body>
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
                {this.props.jwt !== "" && <AddSong onClick={this.handleAddSongClick.bind(this)}/>}
            </div>
        );
    }

}

export default SongDisplay;