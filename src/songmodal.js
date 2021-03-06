import React from 'react';
import {EditableText, ErrorToast, SuccessToast} from './utils.js';

import {Form,Button, DropdownButton, Dropdown} from 'react-bootstrap';

import {REST_URL} from './index.js';

class SongModalBody extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            name : (this.props.song === undefined ? "" : this.props.song.name),
            artist : (this.props.song === undefined ? "" : this.props.song.artist),
            minutes : (this.props.song === undefined ? 0 : Math.floor(this.props.song.length/60)),
            seconds : (this.props.song === undefined ? 0 : this.props.song.length%60),
            bpm : (this.props.song === undefined ? 0 : this.props.song.bpm),
            vocals : (this.props.song === undefined ? [] : this.props.song.vocals),
            genres : (this.props.song === undefined ? [] : this.props.song.genres),
            thisGenre : "",
            thisVocal : "",
            snapshot : "",
            addtoPlaylistStatus : "None",
        };

        this.nameRef = React.createRef();
        this.artistRef = React.createRef();
        this.minutesRef = React.createRef();
        this.secondsRef = React.createRef();
        this.bpmRef = React.createRef();
        this.vocalRef = React.createRef();
        this.genreRef = React.createRef();
    }

    componentDidUpdate(prevProps){
        if(prevProps.song !== this.props.song){
            console.log("new");
        }
    }

    validateForm(){
        return this.state.name.length > 0 && 
        (this.state.minutes*60) + this.state.seconds > 0 && 
        this.state.artist.length > 0 &&
        this.state.bpm > 0;
    }

    handleSubmit(event){
        event.preventDefault();
        this.props.onSubmit(
            this.state.name,
            this.state.artist,
            this.state.minutes,
            this.state.seconds,
            this.state.bpm,
            this.state.vocals,
            this.state.genres);
        this.setState({thisGenre : "", thisVocal : ""});
    }

    handleEditClick(){
        this.setState({snapshot : this.state});
        this.props.onEdit();
    }

    handleEditCancel(){
        this.setState({
            name : this.state.snapshot.name,
            artist : this.state.snapshot.artist,
            minutes : this.state.snapshot.minutes,
            seconds : this.state.snapshot.seconds,
            bpm : this.state.snapshot.bpm,
            vocals : this.state.snapshot.vocals,
            genres : this.state.snapshot.genres,
            thisGenre : "",
            thisVocal : "",
        });
         this.setState({snapshot : ""});
         this.props.onCancel();
    }

    addVocal(){
        var newVocals = this.state.vocals.slice();
        newVocals.push(this.state.thisVocal);
        this.setState({vocals : newVocals, thisVocal : ""});
    }

    removeVocal(i){
        var newVocals = this.state.vocals.slice();
        newVocals.splice(i,1);
        this.setState({vocals : newVocals});

    }

    addGenre(){
        var newGenres = this.state.genres.slice();
        newGenres.push(this.state.thisGenre);
        this.setState({genres : newGenres, thisGenre : ""});
    }

    removeGenre(i){
        var newGenres = this.state.genres.slice();
        newGenres.splice(i,1);
        this.setState({genres : newGenres});
    }

    displayVocals(){
        const vocalList = this.state.vocals.map((vocal,i) => {
            return(
                <li key={i}>{vocal}{this.props.editing &&<span className="close" onClick={() => this.removeVocal(i)}>x</span>}</li>
            );
        });
        return(
            <div>
                {vocalList}
            </div>
        );
    }

    displayGenres(){
        const genreList = this.state.genres.map((genre,i) => {
            return(
                <li key={i}>{genre}{this.props.editing && <span className="close" onClick={() => this.removeGenre(i)}>x</span>}</li>
            );
        });
        return(
            <div>
                {genreList}
            </div>
        );
    }

    setMinutesIntOnly(i){
        var test = i.replace(/[^\d]/,'');
        if(test === '') test = 0;
        if(!Number.isNaN(parseInt(test))){
            this.setState({minutes : parseInt(test)});
        }
    }

    setSecondsIntOnly(i){
        var test = i.replace(/[^\d]/,'');
        if(test === '') test = 0;
        if(!Number.isNaN(parseInt(test))){
            this.setState({seconds : parseInt(test)});
        }
    }

    handleDDPlaylistClick(playlist,i){
        playlist.songs.forEach(song => {
            if(song.id.toString() === this.props.song.id){
                this.setState({addtoPlaylistStatus : "ErrorDupe"});
            }
        });

        const reqOpts = {
            method : 'PUT',
            headers: { 
                'Authorization' : 'Bearer ' + this.props.jwt 
            },
        };

        fetch(REST_URL + "playlists/" + playlist.id + "/songs/" + this.props.song.id, reqOpts)
        .then(response => {
            if(response.status !== 204){
                if(this.state.addtoPlaylistStatus !== "ErrorDupe") this.setState({addtoPlaylistStatus : "Error"});
            }else{
                this.setState({addtoPlaylistStatus : "Success"});
                this.props.onAdd(i);
            }
        })
        .catch(err => console.log(err));     
    }

    render(){

        let playlists=[];

        if(this.props.type === "song"){
            playlists = this.props.playlists.map((playlist,i) => {
                return(
                <Dropdown.Item
                key={i}
                onClick={() => this.handleDDPlaylistClick(playlist,i)}
                >
                    {playlist.name}
                </Dropdown.Item>
                );
            });        
        }

        return (
            <div>

                <ErrorToast
                onClose={() => this.setState({addtoPlaylistStatus : "None"})} 
                show={this.state.addtoPlaylistStatus === "ErrorDupe"} 
                message="Song is already in this playlist."
                />

                <ErrorToast
                onClose={() => this.setState({addtoPlaylistStatus : "None"})} 
                show={this.state.addtoPlaylistStatus === "Error"} 
                message="Error adding song to playlist. Please try again later."
                />

                <SuccessToast
                onClose={() => this.setState({addtoPlaylistStatus : "None"})} 
                show={this.state.addtoPlaylistStatus === "Success"} 
                message="Song added to playlist."
                />

                <Form onSubmit={this.handleSubmit.bind(this)}>


                
                <Form.Group size="lg" controlId="name">
                    <Form.Label>Song Name</Form.Label>
                    <EditableText
                    text={this.props.type === "song" && this.props.song.name}
                    placeholder="song name"
                    childRef={this.nameRef}
                    editing={this.props.editing}
                    >
                        <Form.Control
                        type="text"
                        value={this.state.name}
                        autoComplete="off"
                        onChange={(e) => this.setState({name : e.target.value})}
                        />
                    </EditableText>
                </Form.Group>


                
                
                <Form.Group size="lg" controlId="artist">
                    <Form.Label>Song Artist</Form.Label>
                    <EditableText
                    text={this.props.type === "song" && this.props.song.artist}
                    placeholder="song artist"
                    childRef={this.artistRef}
                    editing={this.props.editing}
                    >
                        <Form.Control
                        type="text"
                        value={this.state.artist}
                        autoComplete="off"
                        onChange={(e) => this.setState({artist : e.target.value})}
                        />
                    </EditableText>
                </Form.Group>




                
                <Form.Group size="lg" controlId="length">
                    <Form.Label>Song Length</Form.Label>
                    <EditableText
                    text={this.props.type === "song" && this.props.song.minutes}
                    placeholder="song minutes"
                    childRef={this.minutesRef}
                    editing={this.props.editing}
                    >
                        <Form.Control
                        type="text"
                        value={this.state.minutes}
                        autoComplete="off"
                        onChange={(e) => this.setMinutesIntOnly(e.target.value)}
                        />
                    </EditableText>
                    :
                    <EditableText
                    text={this.props.type === "song" && this.props.song.seconds}
                    placeholder="song secondss"
                    childRef={this.secondsRef}
                    editing={this.props.editing}
                    >
                        <Form.Control
                        type="number"
                        value={this.state.seconds}
                        autoComplete="off"
                        onChange={(e) => this.setSecondsIntOnly(e.target.value)}
                        />
                    </EditableText>
                </Form.Group>
                


                <Form.Group size="lg" controlId="bpm">
                    <Form.Label>Song BPM</Form.Label>
                    <EditableText
                    text={this.props.type === "song" && this.props.song.bpm}
                    placeholder="song seconds"
                    childRef={this.bpmRef}
                    editing={this.props.editing}
                    >
                        <Form.Control
                        type="number"
                        value={this.state.bpm}
                        autoComplete="off"
                        onChange={(e) => this.setState({bpm : parseInt(e.target.value)})}
                        />
                    </EditableText>
                </Form.Group>
                <Form.Group size="lg" controlId="vocals">
                    <Form.Label>Vocals</Form.Label>
                    <Form.Row>
                        {this.props.editing &&
                        <Form.Group as={Form.Col}>
                            <Form.Control
                            type="text"
                            value={this.state.thisVocal}
                            autoComplete="off"
                            onChange={(e) => this.setState({thisVocal : e.target.value})}
                            />
                        </Form.Group>}
                    
                        {this.props.editing &&
                        <Form.Group as={Form.Col}>
                            <Button type="button" onClick={this.addVocal.bind(this)} disabled={this.state.thisVocal.length === 0}>
                                Add Vocal
                            </Button>
                        </Form.Group>}
                    </Form.Row>

                    <ul>
                        {this.displayVocals()}
                    </ul>
                    
                </Form.Group>
                <Form.Group size="lg" controlId="genres">
                    <Form.Label>Genres</Form.Label>
                    <Form.Row>
                        {this.props.editing &&
                        <Form.Group as={Form.Col}>
                            <Form.Control
                            type="text"
                            value={this.state.thisGenre}
                            autoComplete="off"
                            onChange={(e) => this.setState({thisGenre : e.target.value})}
                            />
                        </Form.Group>}
                        
                        {this.props.editing &&
                        <Form.Group as={Form.Col}>
                            <Button type="button" onClick={this.addGenre.bind(this)} disabled={this.state.thisGenre.length === 0}>
                                Add Genre
                            </Button>
                        </Form.Group>}
                    </Form.Row>
                    
                    <ul>
                        {this.displayGenres()}
                    </ul>
                    
                </Form.Group>

                {this.props.type === "song" &&
                    <DropdownButton title="Add to Playlist" disabled={this.props.jwt==="" || this.props.editing}>
                        {playlists.length > 0 ? playlists : <Dropdown.ItemText>No Playlists</Dropdown.ItemText>}
                    </DropdownButton>
                }

                        

                {this.props.type === "newsong" && <Button block size="lg" type="submit" disabled={!this.validateForm() || this.props.isLoading}>
                    Create
                </Button>}
                {!this.props.editing && this.props.type === "song" && <Button onClick={this.handleEditClick.bind(this)} disabled={this.props.jwt===""}>Edit</Button>}
                {this.props.editing && this.props.type === "song" && <Button type="button" onClick={this.handleEditCancel.bind(this)} disabled={this.props.isLoading}>Cancel</Button>}
                {this.props.editing && this.props.type === "song" && <Button type="submit" disabled={this.props.isLoading}>Save</Button>}
                </Form>

            </div>
        );
    }
}

export default SongModalBody;