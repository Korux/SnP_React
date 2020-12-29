import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {REST_URL} from './index.js';
import Loading from './loading.js';
import LoadingOverlay from 'react-loading-overlay';

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
  
    function handleSubmit(event){
        event.preventDefault();
        props.onSubmit(email,password);
    }

    return (
      <div>
        <Form onSubmit={handleSubmit}>
          <Form.Group size="lg" controlId={"email-" + props.type}>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group size="lg" controlId={"password-" + props.type}>
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
            email : "",
            pw : "",
            loading : false,
        }

        this.handleLoginClick = this.handleLoginClick.bind(this);
        this.handleRegisterClick = this.handleRegisterClick.bind(this);
    }

    handleLoginClick(email, pw){
        this.props.loginClick();
        this.setState({
            email : email,
            pw : pw
        });
    }

    handleRegisterClick(email, pw){
        this.props.registerClick();
        this.setState({
            email : email,
            pw : pw
        });
    }

    componentDidUpdate(prevProps){
        if(this.props.loginState === "User" && prevProps.loginState !== "User"){

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
                    this.props.loginError(data);
                    this.setState({loading : false});
                }else {
                    let jwtInfo = parseJwt(data.id_token);
                    this.setState({loading : false});
                    this.props.onLogin(data.id_token,jwtInfo.sub,jwtInfo.name,jwtInfo.email,jwtInfo.picture);
                }

            })
            .catch(err => console.log(err));

        }else if(this.props.loginState === "NewUser" && prevProps.loginState !== "NewUser"){

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
                    this.props.loginError(data);
                    this.setState({loading : false});
                }else {
                    this.props.loginClick();
                }

            })
            .catch(err => console.log(err));
        }
    }

    guestRender(){
        return (
            <div>
                You are a loser
                <button onClick={this.props.guestClick}>dont be a loser</button>
            </div>
        );
    }

    logregRender(){
        return(
            <div>
                <LoadingOverlay
                active = {this.state.loading}
                spinner
                text='logging in...'>
                    <h2>Login Here</h2>
                    <InputForm onSubmit={this.handleLoginClick} buttonValue="Login" type="login"/>
                    <h2>Signup Here</h2>
                    <InputForm onSubmit={this.handleRegisterClick} buttonValue="Register" type="register"/>
                </LoadingOverlay>
            </div>
        );
    }

    render(){
        const loginState = this.props.loginState;
        if(loginState === "Guest"){
            return(<div>{this.guestRender()}</div>);
        }else if (loginState === "LogReg" || loginState === "User" || loginState === "NewUser"){
            return(<div>{this.logregRender()}</div>);
        }else{
            return(<div>Error with login</div>);
        }
    }
}

export default Login;