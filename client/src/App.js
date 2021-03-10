import React from 'react';
import {useState,useEffect} from 'react';
import axios from 'axios';
import ReactAudioPlayer from 'react-audio-player';
import {CSVLink} from 'react-csv';
import Loader from './components/LoaderContainer';
import './App.css';


export default function App() {
    const [files, setFiles] = useState({}); // container for selected files, later been sent to the server. {} - Obj
    const [audioObj,setAudioObj] = useState([]); // [] Array
    const [text, setText] = useState([]); // state for textarea content - [] Array
    const [res,setRes] = useState(); // for response and user edited data - [{}] Array-Objects
    const [selectedAudio, setSelectedAudio] = useState({}); // for current select audio file - {} Obj
    const [confidence,setConfidence] = useState("N/A"); // 
    const [isLoading,setIsLoading] = useState(false); // true - enable loader, vice verse

    /*Line 19 - 123 Customized Functions*/

    const checkMimeType = event =>{
        let files = event.target.files; 
        //define message container
        let err = '';

       const types = ['audio/mpeg', 'audio/wav'];

        for(let i = 0; i<files.length; i++) {

         // compare file type find doesn't matach
             if (types.every(type => files[i].type !== type)) {

             // create error message and assign to container   
             err += files[i].type+' is not a supported format\n';

           }
         };
      
       if (err !== '') { // if message not same old that mean has error 

            event.target.value = null;
            alert ('some error occurs');
            return false; 
        }
       return true;
    }

    /* get selected files and set files into states. */
    const inputOnChangeHandler = event =>{
        let files = event.target.files;

        // check MimeType before set files to states.
        if(checkMimeType(event)){

            let newAudioObjs = [];
            setFiles(files);

            // Loop through selected files and generate url accordingly
            for(let i = 0; i < files.length ;i++){
                newAudioObjs.push({
                    path: URL.createObjectURL(files[i]),
                    filename: files[i].name
                });

            setAudioObj([...audioObj, ...newAudioObjs]);
            }
        }
    }

    /* AudioList Element onClickHandler, change centent of textarea and the url of audio player according to [res] State. */
    const audioBarClickHandler = (audio) =>{
        setSelectedAudio(audio);

        /* as response from the server is randomly ordered, needed to check the filename to set data to matched audio file*/
        if(res!== undefined){
            res.forEach(data => {
                if(audio.filename === data.filename){
                    setText(data.transcription);
                    setConfidence(data.confidence);
                }
                return
            })
        return
        }
    }

    /* Controlled Textarea Component */
    const txtOnChange = event => {
        const {value} = event.target;
        setText(value);
    }
    
    /* Save changes when user unfocused on textarea */
    const txtOnBlur = () => {

        const newRes = Array.from(res);
        // find matched obj and save changes
        newRes.forEach(item => {
            if(item.filename === selectedAudio.filename){
                item.transcription = text;
            }
        })
        setRes(newRes);
    }
    
    /* Send request to back-end when user click the Transcript Btn */
    const transcriptBtnClickHandler = () =>{
        // inilize request data container
        const data = new FormData();
        // prevent sending empty data to the server
        if(Object.keys(files).length === 0 && files.constructor === Object){
            alert("No file choosen")
            return
        }
    
        // set data to the container
        files.forEach( file => {
            data.append('file',file);
        })

        // enable loader
        setIsLoading('true');

        // post request to server & set response into [res] State
        axios.post("http://localhost:8000/convert",data)
        .then(res => {
            setRes(res.data);

            // initialize content in textarea & confidence label
            res.data.forEach( item => {
                if(item.filename === selectedAudio.filename){
                    setText(item.transcription);
                    setConfidence(item.confidence);
                    return
                }
                return
            })

            setIsLoading(false);
        })
    }

    /* Clear All States when user downloads the data */
    const dlBtnOnClick = () => {
        setFiles({});
        setAudioObj([]);
        setSelectedAudio({});
        setAudioObj([]);
        setText([]);
        setConfidence('N/A');
        window.location.reload();
    }

    // set default selected file
    useEffect(()=>{
        if(audioObj.length !== 0){
            setSelectedAudio(audioObj[0])
        }
    },[audioObj])

    return (
       <>
    
        <Loader isLoading = {isLoading}></Loader>

        {/* App */}
        <div>
            {/* Header - Logo, DropBox, Transcript-Btn */}
            <header>
                <div className = "logo">
                    <h1>Speech To Text</h1>
                    <h4>University of Tasmania</h4>
                </div>
                <div className = "dropBox">
                    <label htmlFor = "file" className = "btn">Select Files</label>
                    <input type = "file" className="form-control"  id = "file" multiple onChange = {inputOnChangeHandler}/>    
                    <button type="button" className = "btn" onClick = {transcriptBtnClickHandler}>Transcript</button>      
                </div>
            </header>

            {/* Usage - hard code */}
            <div className = "usage"> 
                <p>
                    * this app only support .wav format at the moment 
                </p>
            </div>

            {/* Hero Section 

                    Left : Row --> label_selected_audio , audio_player
                           Controlled_Textarea
                           Row ---> label_confidence, btn_downloadCSV

                    Right: Audio_List

             */}
            <div className = "hero flex">

                <div className = "left col-8">

                    <div className = "audioplayer-wrap flex">
                    
                        <p className = "col-6"> 
                            Selected Audio:  { selectedAudio.filename || 'N/A'}
                        </p>
                        <ReactAudioPlayer 
                            className = "audio-player col-6"
                            src = {selectedAudio.path}
                            autoPlay = {false}
                            controls
                            />
                    </div>

                    <textarea 
                        value = {text}
                        onChange = {txtOnChange}
                        onBlur = {txtOnBlur}
                        >
                    </textarea>
                    
                    <div className = "flex left-row-3">

                        <p>Confidence: {confidence} </p>

                        <div>
                            <CSVLink 
                                data={ res === undefined ? "none" : res } 
                                onClick = {dlBtnOnClick} 
                                className = "btn btn-download"
                                >
                                Download CSV
                            </CSVLink>
                        </div>

                    </div>
                </div>
                
                <div className = "right col-4">
                        <h4>Audio File List</h4>
                        {
                            // generate aduiolist according selected files
                            audioObj.map(audio => {

                                return <div 
                                            className = "audio-element" 
                                            key={audio.path} 
                                            onClick = { () => audioBarClickHandler(audio)}
                                            > 
                                            {audio.filename} 
                                        </div>
                            })
                        }
                </div>
            </div>
        </div>
    </>
    )
}
