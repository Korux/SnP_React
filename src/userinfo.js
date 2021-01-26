import React from 'react';

class UserInfo extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div>
               <p>you win <img src={this.props.pic} alt="PFP"></img></p>
            </div>
        );
    }
}

export default UserInfo;