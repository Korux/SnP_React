import React, {useEffect} from "react";
import {Toast} from 'react-bootstrap';
/*
Editable Textbox
props:
text : text to be displayed
placeholder : placeholder if text is not given

*/ 

export function EditableText(props){
    useEffect(() => {
        if (props.childRef && props.childRef.current && props.editing === true) {
          props.childRef.current.focus();
        }
      }, [props.editing, props.childRef]);

      
    return(
        <div>
        {props.editing ? 
            <div>
                {props.children}
            </div>
        : 
            <div>
                <span>
                {props.text || props.placeholder || "Editable content"}
                </span>
            </div>
        }
        </div>
    );
}

/*
Success Toast
*/ 

export function SuccessToast(props){
    return(
        <Toast className="successToast" onClose={props.onClose} show={props.show} delay = {2000} autohide>
            <Toast.Header>
                <strong className="mr-auto">Bootstrap</strong>
                <small>just now</small>
            </Toast.Header>
            <Toast.Body>{props.message}</Toast.Body>
        </Toast>
    );
}

/*
Error Toast
*/ 

export function ErrorToast(props){
    return(
        <Toast className="errorToast" onClose={props.onClose} show={props.show} delay = {2000} autohide>
            <Toast.Header>
                <strong className="mr-auto">Bootstrap</strong>
                <small>just now</small>
            </Toast.Header>
            <Toast.Body>{props.message}</Toast.Body>
        </Toast>
    );
}
