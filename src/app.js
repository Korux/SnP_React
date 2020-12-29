import React from 'react';

import Login from './login.js';
import SideMenu from './sidemenu.js';
import SongDisplay from './songDisplay.js';
import PlaylistDisplay from './playlistDisplay.js';
import UserInfo from './userinfo.js';

import style from './app.module.css';

import {Toast} from 'react-bootstrap';

class App extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            loginState : "Guest",
            jwt : "",
            uid : "",
            name : "",
            email : "",
            pic : "",
            currPlaylist : null,
            activeContainer : "SongDisplay",
            showErrorToast : false
        };
    }

    handleFailedLogin(err){
        console.log(err);
        this.setState({loginState : "Guest", showErrorToast : true});
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

    handlePlaylistClick(playlist){
        this.setState({currPlaylist : playlist, activeContainer : "PlaylistDisplay"});
    }

    handleDiscoverClick(){
        this.setState({activeContainer : "SongDisplay"});
    }

    render(){

        return(
            <div>

                <Toast className={style.errorToast} onClose={() => this.setState({showErrorToast : false})} show={this.state.showErrorToast} delay = {3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Bootstrap</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>See? Just like this.</Toast.Body>
                </Toast>

                {this.state.loginState === "LoggedIn" && 
                <UserInfo
                {...this.state}
                />}

                {this.state.loginState === "LoggedIn" && 
                <SideMenu
                jwt={this.state.jwt}
                playlistClick={this.handlePlaylistClick.bind(this)}
                discoverClick={this.handleDiscoverClick.bind(this)}
                />}

                {this.state.loginState !== "LoggedIn" && 
                <Login 
                onLogin={this.handleLoginInfo.bind(this)}
                guestClick={this.handleGuestClick.bind(this)}
                registerClick={this.handleRegisterClick.bind(this)}
                loginClick={this.handleLoginClick.bind(this)}
                loginError={this.handleFailedLogin.bind(this)}
                loginState={this.state.loginState}
                 />}
                 {this.state.activeContainer === "SongDisplay" && 
                 <SongDisplay
                 jwt={this.state.jwt}
                 />}

                 {this.state.activeContainer === "PlaylistDisplay" && 
                 <PlaylistDisplay 
                 playlist={this.state.currPlaylist}
                 />}
            </div>
        );
    }

}

export default App;