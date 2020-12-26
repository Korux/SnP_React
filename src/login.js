import React from 'react';
import style from './login.module.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {REST_URL} from './index.js';
import Loading from './loading.js';

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

function InputForm(props){
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
  
    function validateForm() {
      return email.length > 0 && password.length > 0;
    }
  
    function handleSubmit(){
        props.onSubmit(email,password);
    }

    return (
      <div>
        <Form onSubmit={handleSubmit}>
          <Form.Group size="lg" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group size="lg" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button block size="lg" type="submit" disabled={!validateForm()}>
            {props.buttonValue}
          </Button>
        </Form>
      </div>
    );
}

class Login extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            login : "Guest",
            email : "",
            pw : "",
            loading : false,
        }

        this.handleGuestClick = this.handleGuestClick.bind(this);
        this.handleLoginClick = this.handleLoginClick.bind(this);
        this.handleRegisterClick = this.handleRegisterClick.bind(this);
    }

    handleGuestClick(){
        this.setState({login : "LogReg"});
    }

    handleLoginClick(email, pw){
        this.setState({
            login : "User",
            email : email,
            pw : pw,
        });
    }

    handleRegisterClick(email, pw){
        this.setState({
            login : "NewUser",
            email : email,
            pw : pw,
        });
    }

    componentDidUpdate(prevProps,prevState){
        if(this.state.login === "User" && prevState.login !== "User"){

            const params = {
                email : this.state.email,
                password : this.state.pw,
            };

            const reqOpts = {
                method : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            };
            
            this.setState({loading : true});

            fetch(REST_URL + "login", reqOpts)
            .then(response => response.json())
            .then(data => {
                if(!data.id_token) {
                    alert("error");
                    this.setState({login : "Guest", loading : false});
                }else {
                    let jwtInfo = parseJwt(data.id_token);
                    this.props.onLogin(data.id_token,jwtInfo.sub,jwtInfo.name,jwtInfo.email,jwtInfo.picture);
                    this.setState({loading : false});
                }

            })
            .catch(err => console.log(err));

        }else if(this.state.login === "NewUser" && prevState.login !== "NewUser"){

            const params = {
                email : this.state.email,
                password : this.state.pw,
            };

            const reqOpts = {
                method : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            };
            
            this.setState({loading : true});

            fetch(REST_URL + "signup", reqOpts)
            .then(response => response.json())
            .then(data => {
                if(!data._id) {
                    alert("error");
                    this.setState({login : "Guest", loading : false});
                }else {
                    this.setState({login : "User"});
                }

            })
            .catch(err => console.log(err));
        }
    }

    guestRender(){
        return (
            <div className={style.container}>
                You are a loser
                <button onClick={this.handleGuestClick}>dont be a loser</button>
            </div>
        );
    }

    logregRender(){
        return(
            <div>
                <h2>Login Here</h2>
                <InputForm onSubmit={this.handleLoginClick} buttonValue="Login"/>
                <h2>Signup Here</h2>
                <InputForm onSubmit={this.handleRegisterClick} buttonValue="Register"/>
            </div>
        );
    }

    userRender(){

        return(
        <div>
            {this.state.loading ? <Loading/> : <div>{this.state.error ? <p>errr</p> : <p>you win {this.props.name} and {this.props.email} and <img src={this.props.pic} alt="PFP"></img></p>} </div>}
        </div>
        );
    }

    render(){
        const loginState = this.state.login;
        if(loginState === "Guest"){
            return(<div>{this.guestRender()}</div>);
        }else if (loginState === "LogReg"){
            return(<div>{this.logregRender()}</div>);
        }else if (loginState === "User" || loginState === "NewUser"){
            return(<div>{this.userRender()}</div>);
        }else{
            return(<div>Error with login</div>);
        }
    }
}

export default Login;