import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
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
        this.handlePlaylistClick.bind(this);
    }

    handlePlaylistClick(i){
        this.props.playlistClick(i);
    }

    render(){
        var items = [];
        items = this.props.playlists.map((playlist,i) => {
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

                <DiscoverButton onClick={this.props.discoverClick}/>
                <AddPlaylistButton onClick={this.props.addplaylistClick}/>
                <InfiniteScroll
                pageStart={0}
                loadMore={this.props.playlistLoadMore}
                hasMore={this.props.hasMorePlaylists}
                loader={<Loading key={0}/>}
                >
                    {items} 
                </InfiniteScroll>
            </div>
        );
    }
}

export default SideMenu;