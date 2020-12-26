import React from 'react'

class PlaylistDisplay extends React.Component{

    constructor(props){
        super(props);
    }

    render(){
        const playlist = this.props.playlist;
        return(
            <div>
                {playlist.name} : {playlist.description}
            </div>
        );
    }

}

export default PlaylistDisplay;