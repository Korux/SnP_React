import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import Login from './login.js';
import App from './app.js';

export const REST_URL = "https://final-dot-cs493-291619.wl.r.appspot.com/";

function Index(props){
    const [jwt,setJWT] = React.useState("");
    const [uid,setUID] = React.useState("");
    const [name,setName] = React.useState("");
    const [email,setEmail] = React.useState("");
    const [pic,setPic] = React.useState("");

    function handleLoginInfo(jwt,uid,name,email,pic){
        setJWT(jwt);
        setUID(uid);
        setName(name);
        setEmail(email);
        setPic(pic);
    }

    return(
        <div>
            <Login onLogin={handleLoginInfo} jwt={jwt} uid={uid} name={name} email={email} pic={pic}/>
            <App/>
        </div>
    );
}

ReactDOM.render(<Index/>,document.getElementById("root"));
