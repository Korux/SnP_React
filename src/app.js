import React from 'react';

import Login from './login.js';
import SideMenu from './sidemenu.js';
import SongDisplay from './songDisplay.js';
import UserInfo from './userinfo.js';

class App extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            loginState : "Guest",
            jwt : "",
            uid : "",
            name : "",
            email : "",
            pic : ""
        };
    }
    
    handleFailedLogin(err){
        console.log(err);
        alert("a");
        this.setState({loginState : "Guest"});
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

    render(){

        return(
            <div>
                {this.state.loginState === "LoggedIn" && 
                <UserInfo
                {...this.state}
                />}

                {this.state.loginState === "LoggedIn" && 
                <SideMenu
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
                 <SongDisplay/>
            </div>
        );
    }

}

export default App;