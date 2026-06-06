
import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { defaultKeymap } from "@codemirror/commands";
import { EditorView, keymap } from "@codemirror/view";
import { json } from "@codemirror/lang-json";


export default function setupEditors(){
    const JsonRequestBody=document.querySelector('[data-json-request-body]');
    const JsonResponseBody=document.querySelector('[data-json-response-body]');

    const basicExtensions=[
        basicSetup,keymap.of(defaultKeymap),
        json(),
        EditorState.tabSize.of(2)
    ]

    const requestEditor=new EditorView({
        state:EditorState.create({
            doc:"{\n\t\n}",
            extensions:basicExtensions
        }),
        parent:JsonRequestBody
    })
    const responseEditor=new EditorView({
        state:EditorState.create({
            doc:"{}",
            extensions:[...basicExtensions,EditorView.editable.of(false)]
        }),
        parent:JsonResponseBody
    })

    function updateResponseEditor(value){
        responseEditor.dispatch({
            changes:{
                from:0,
                to:responseEditor.state.doc.length,
                insert:JSON.stringify(value,null,2)
            }
        })
    }


    return {requestEditor,updateResponseEditor}
}
