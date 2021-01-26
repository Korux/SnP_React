import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Loading from './loading.js';
import Login from './login.js';
import UserInfo from './userinfo.js';
import SongModalBody from './songmodal.js';
import {Modal,Toast} from 'react-bootstrap';
import {REST_URL} from './index.js';
import style from './sidemenu.module.css';

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
        <button disabled={props.loginState !== "LoggedIn"} onClick={props.onClick}>
            Add Playlist 
        </button>
    );
}

function AddSongButton(props){
    return(
        <button disabled={props.loginState !== "LoggedIn"} onClick={props.onClick}>
            Add Song 
        </button>
    );
}

class SideMenu extends React.Component{

    constructor(props){
        super(props);
        this.state={
            addsongModalOpen : false,
            addsongStatus : "None",
            modalLoading : false
        }
        this.handlePlaylistClick.bind(this);
    }

    handlePlaylistClick(i){
        this.props.playlistClick(i);
    }

    handleAddSongClick(){
        this.setState({addsongModalOpen : true});
    }

    handleCloseModal(){
        this.setState({addsongModalOpen : false, modalLoading : false});
    }

    handleAddSongSuccess(name,artist,minutes,seconds,bpm,vocals,genres){
        this.setState({modalLoading : true});
        const params = {
            name : name,
            artist : artist,
            length : seconds + (minutes * 60),
            bpm : bpm,
            vocals : vocals,
            genres : genres
        };

        const reqOpts = {
            method : 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + this.props.jwt 
            },
            body: JSON.stringify(params),
        };

        fetch(REST_URL + "songs", reqOpts)
        .then(response => response.json())
        .then(data => {
            if(!data.id) {
                if(data.Error === "Song is already in the database") this.setState({addsongStatus : "ErrorDupe",modalLoading : false});
                else this.setState({addsongStatus : "Error",modalLoading : false});
            }else {
                this.props.onSubmit(data);
                this.setState({addsongStatus : "Success",modalLoading : false});
            }
            this.handleCloseModal();
        })
        .catch(err => console.log(err));
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
            <div className={style.container}>


                <Toast className="errorToast" onClose={() => this.setState({addsongStatus : "None"})} show={this.state.addsongStatus === "Error"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Error with song creation. Please try again later.</Toast.Body>
                </Toast>

                <Toast className="errorToast" onClose={() => this.setState({addsongStatus : "None"})} show={this.state.addsongStatus === "ErrorDupe"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>This song is already in the database.</Toast.Body>
                </Toast>

                <Toast className="successToast" onClose={() => this.setState({addsongStatus : "None"})} show={this.state.addsongStatus === "Success"} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>Song created.</Toast.Body>
                </Toast>


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
                    <Modal.Body><SongModalBody type="newsong" isLoading={this.state.modalLoading} onSubmit={this.handleAddSongSuccess.bind(this)} editing={true}/></Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                    
                </Modal>



                {this.props.loginState === "LoggedIn" && 
                <UserInfo
                jwt={this.props.jwt}
                uid={this.props.uid}
                name={this.props.name}
                email={this.props.email}
                pic={this.props.pic}
                />}

                {this.props.loginState !== "LoggedIn" && 
                <Login 
                onLogin={this.props.onLogin}
                guestClick={this.props.guestClick}
                registerClick={this.props.registerClick}
                loginClick={this.props.loginClick}
                loginError={this.props.loginError}
                loginState={this.props.loginState}
                 />}

                <DiscoverButton onClick={this.props.discoverClick}/>
                <AddSongButton onClick={this.handleAddSongClick.bind(this)} loginState={this.props.loginState}/>
                <AddPlaylistButton onClick={this.props.addplaylistClick} loginState={this.props.loginState}/>
                {this.props.loginState === "LoggedIn" &&
                <InfiniteScroll
                pageStart={0}
                loadMore={this.props.playlistLoadMore}
                hasMore={this.props.hasMorePlaylists}
                loader={<Loading key={0}/>}
                >
                    {items} 
                </InfiniteScroll>}
            </div>
        );
    }
}

export default SideMenu;