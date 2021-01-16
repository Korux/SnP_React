import React, {useEffect} from "react";

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
