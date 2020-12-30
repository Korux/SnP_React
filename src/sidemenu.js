import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import {REST_URL} from './index.js';
import Loading from './loading.js';

import {Toast} from 'react-bootstrap';

function Playlist(props){
    return(
        <div onClick={props.onClick}>
            {props.name}
        </div>
    );
}

function DiscoverButton(props){
    return(
        <div onClick={props.onClick}>
            Discover Button
        </div>
    );
}

function AddPlaylistButton(props){
    return(
        <div onClick={props.onClick}>
            Add Playlist 
        </div>
    );
}

class SideMenu extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            playlists : [],
            hasMorePlaylists : true,
            addingPlaylist : false,
        }
        this.handlePlaylistClick.bind(this);
    }

    handlePlaylistClick(i){
        this.props.playlistClick(this.state.playlists[i]);
    }

    handleAddPlaylist(){
        const params = {
            name : "My Playlist " + this.state.playlists.length,
            description : "Playlist Description Here",
            public : true
        };

        const reqOpts = {
            method : 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + this.props.jwt 
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
                this.setState({playlists : newPlaylists});
                this.handlePlaylistClick(0);
            }
        })
        .catch(err => console.log(err));

    }

    handleLoadMore(page){
        const reqOpts = {
            method : 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + this.props.jwt 
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


    render(){
        var items = [];
        items = this.state.playlists.map((playlist,i) => {
            return(
                <Playlist
                key={i}
                name={playlist.name}
                onClick={() => this.handlePlaylistClick(i)}
                />
            );
        });

        return(
            <div>

                <Toast className="errorToast" onClose={() => this.setState({addplaylistStatus : "None"})} show={this.state.addplaylistStatus === "Error"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Error with playlist creation. Please try again later.</Toast.Body>
                </Toast>

                <DiscoverButton onClick={this.props.discoverClick}/>
                <AddPlaylistButton onClick={this.handleAddPlaylist.bind(this)}/>
                <InfiniteScroll
                pageStart={0}
                loadMore={this.handleLoadMore.bind(this)}
                hasMore={this.state.hasMorePlaylists}
                loader={<Loading/>}
                >
                    {items} 
                </InfiniteScroll>
            </div>
        );
    }
}

export default SideMenu;