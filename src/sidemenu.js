import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import {REST_URL} from './index.js';
import Loading from './loading.js';

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

class SideMenu extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            playlists : [],
            hasMorePlaylists : true
        }
        this.handlePlaylistClick.bind(this);
    }

    handlePlaylistClick(i){
        this.props.playlistClick(this.state.playlists[i]);
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
        items.splice(0,0,<DiscoverButton onClick={this.props.discoverClick}/>);
        return(
            <div>
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