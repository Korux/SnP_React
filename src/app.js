import React from 'react';
import SideMenu from './sidemenu.js';
import SongDisplay from './songdisplay.js';
import PlaylistDisplay from './playlistdisplay.js';
import {ErrorToast,SuccessToast} from './utils.js';

import {REST_URL} from './index.js';

class App extends React.Component{

    constructor(props){
        super(props);
        this.state = {

            activeContainer : "SongDisplay",

            // -- LOGIN --

            loginState : "Guest",
            jwt : "",
            uid : "",
            name : "",
            email : "",
            pic : "",
            loginStatus : "None",

            // -- PLAYLIST --

            playlists : [],
            hasMorePlaylists : true,
            currPlaylist : null,
            currPlaylistIndex : 0,
            currPlaylistSongs : [],
            addplaylistStatus : "None",
            loadplaylistStatus : "None",
            deleteplaylistStatus : "None",

            // -- SONGS --
            songs : [],
            hasMoreSongs : true,
            currSong : null,
            currSongIndex : 0,
            songToPlaylistStatus : "None",
            
        };
    }


    // LOGIN RELATED HANDLERS

    handleFailedLogin(){
        this.setState({loginState : "Guest", loginStatus : "Error"});
    }

    handleGuestClick(){
        this.setState({loginState : "LogReg"});
    }

    handleLoginClick(){
        this.setState({loginState : "User"});
    }

    handleRegisterClick(){
        this.setState({loginState : "NewUser"});
    }

    handleLoginInfo(jwt,uid,name,email,pic){
        this.setState({
            jwt : jwt,
            uid : uid,
            name : name,
            email : email,
            pic : pic,
            loginState:"LoggedIn"
        });
    }

    //PLAYLIST RELATED HANDLERS

    handlePlaylistClick(i){

        let promises = [];

        this.state.playlists[i].songs.forEach((song) => {
            promises.push(this.handleLoadCurrPlaylist(song));
        });

        Promise.all(promises).then(res => {
            this.setState({currPlaylist : this.state.playlists[i], currPlaylistIndex : i, currPlaylistSongs : res, activeContainer : "PlaylistDisplay"});
        }).catch(err => {
            console.log(err);
            this.setState({loadplaylistStatus : "Error"});
        });
    }

    handleLoadCurrPlaylist(song){

        return new Promise((resolve,reject) => {
            const reqOpts = {
                method : 'GET',
            };
    
            fetch(REST_URL + "songs/" + song.id, reqOpts)
            .then(response => response.json())
            .then(data => {
                if(!data.id) {
                    reject(null);
                }else {
                    resolve(data);
                }
            })
            .catch(err => console.log(err));
        });
    }

    handlePlaylistDelete(){
        let newPlaylists = this.state.playlists.slice();
        newPlaylists.splice(this.state.currPlaylistIndex,1);
        this.setState({playlists : newPlaylists, activeContainer : "SongDisplay", deletePlaylistStatus : "Success"});
    }

    handleDiscoverClick(){
        this.setState({activeContainer : "SongDisplay"});
    }

    handlePlaylistEdit(name,desc){
        let thisPlaylist = this.state.currPlaylist;
        thisPlaylist.name = name;
        thisPlaylist.description = desc;
        let newPlaylists = this.state.playlists.slice();
        newPlaylists.splice(this.state.currPlaylistIndex,1,thisPlaylist);
        this.setState({currPlaylist : thisPlaylist, playlists : newPlaylists});
    }

    handleLoadMorePlaylists(page){
        const reqOpts = {
            method : 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + this.state.jwt 
            },
        };

        fetch(REST_URL + 'playlists?page=' + page,reqOpts)
        .then(response => response.json())
        .then(data => {
            var newPlaylists = this.state.playlists.slice();
            data.playlists.forEach(playlist => {
                newPlaylists.push(playlist);
            });
            this.setState({playlists : newPlaylists});
            if(!data.next){
                this.setState({hasMorePlaylists : false});
            }
        })
        .catch(error => console.log(error));
    }

    handleAddPlaylist(){
        if(this.state.addplaylistStatus === "None"){
            this.setState({addplaylistStatus : "Working"});
        }else{
            return;
        }
        const params = {
            name : "My Playlist",
            description : "Playlist Description Here",
            public : true
        };

        const reqOpts = {
            method : 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + this.state.jwt 
            },
            body: JSON.stringify(params),
        };

        fetch(REST_URL + "playlists", reqOpts)
        .then(response => response.json())
        .then(data => {
            if(!data.id) {
                this.setState({addplaylistStatus : "Error"});
            }else {
                var newPlaylists = this.state.playlists.slice();
                newPlaylists.splice(0,0,data);
                this.setState({playlists : newPlaylists, addplaylistStatus : "None"});
                this.handlePlaylistClick(0);
            }
        })
        .catch(err => console.log(err));

    }

    // SONG RELATED HANDLERS

    handleLoadMoreSongs(page){

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

    handleSongEdit(newSong){
        let newSongs = this.state.songs.slice();
        newSongs.splice(this.state.currSongIndex,1,newSong);
        this.setState({songs : newSongs, currSong : newSong});
    }

    handleSongClick(i){
        this.setState({currSongIndex : i, currSong : this.state.songs[i]});
    }

    handleNewSongSubmit(newSong){
        let newSongs = this.state.songs.slice();
        newSongs.splice(0,0,newSong);
        this.setState({songs : newSongs});
    }

    // OTHER HANDLERS

    handleAddSongToPlaylist(i){
        let thisPlaylist = this.state.playlists[i];
        thisPlaylist.songs.push({id:this.state.currSong.id,self:REST_URL + "songs/"+this.state.currSong.id});
        thisPlaylist.numsongs = thisPlaylist.numsongs + 1;
        let newPlaylists = this.state.playlists.slice();
        newPlaylists.splice(i,1,thisPlaylist);
        this.setState({playlists : newPlaylists});
    }

    handleRemoveSongFromPlaylist(i){
        let newPlaylists = this.state.playlists.slice();
        let newPlaylist = this.state.currPlaylist;
        let newPlaylistSongs = this.state.currPlaylistSongs;

        newPlaylist.songs.splice(i,1);
        newPlaylistSongs.splice(i,1);
        newPlaylists.splice(this.state.currPlaylistIndex,1,newPlaylist);
        
        this.setState({playlists : newPlaylists, currPlaylist : newPlaylist, currPlaylistSongs : newPlaylistSongs});
    }

    render(){

        return(
            <div>

                <ErrorToast
                onClose={() => this.setState({loadplaylistStatus : "None"})}
                show={this.state.loadplaylistStatus === "Error"}
                message="Error with loading playlist. Please try again later."
                />

                <ErrorToast
                onClose={() => this.setState({loginStatus : "None"})}
                show={this.state.loginStatus === "Error"}
                message="Error with login. Check email and password and try again."
                />

                <ErrorToast
                onClose={() => this.setState({addplaylistStatus : "None"})}
                show={this.state.addplaylistStatus === "Error"}
                message="Error with playlist creation. Please try again later."
                />

                <SuccessToast
                onClose={() => this.setState({deletePlaylistStatus : "None"})}
                show={this.state.deletePlaylistStatus === "Success"}
                message="Playlist deleted."
                />

                <SideMenu
                {...this.state}
                playlistClick={this.handlePlaylistClick.bind(this)}
                addplaylistClick={this.handleAddPlaylist.bind(this)}
                discoverClick={this.handleDiscoverClick.bind(this)}
                playlistLoadMore={this.handleLoadMorePlaylists.bind(this)}

                onLogin={this.handleLoginInfo.bind(this)}
                guestClick={this.handleGuestClick.bind(this)}
                registerClick={this.handleRegisterClick.bind(this)}
                loginClick={this.handleLoginClick.bind(this)}
                loginError={this.handleFailedLogin.bind(this)}

                onSubmit={this.handleNewSongSubmit.bind(this)}
                />

                 {this.state.activeContainer === "SongDisplay" && 
                 <SongDisplay
                 jwt={this.state.jwt}
                 songs={this.state.songs}
                 hasMoreSongs={this.state.hasMoreSongs}
                 songsLoadMore={this.handleLoadMoreSongs.bind(this)}
                 currSong={this.state.currSong}
                 currSongIndex={this.state.currSongIndex}
                 onEdit={this.handleSongEdit.bind(this)}
                 onClick={this.handleSongClick.bind(this)}
                 onAdd={this.handleAddSongToPlaylist.bind(this)}
                 playlists={this.state.playlists}
                 />}

                 {this.state.activeContainer === "PlaylistDisplay" && 
                 <PlaylistDisplay 
                 jwt={this.state.jwt}
                 playlist={this.state.currPlaylist}
                 songs={this.state.currPlaylistSongs}
                 onDelete={this.handlePlaylistDelete.bind(this)}
                 onDeleteSong={this.handleRemoveSongFromPlaylist.bind(this)}
                 onEdit={this.handlePlaylistEdit.bind(this)}
                 />}
            </div>
        );
    }

}

export default App;