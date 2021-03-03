import React from 'react';
import {useState,useEffect} from 'react';
import axios from 'axios';
import ReactAudioPlayer from 'react-audio-player';
import {CSVLink} from 'react-csv';
import Loader from './components/LoaderContainer';
import * as constants from './common/constants'
import './App.css';


export default function App() {
    const [files, setFiles] = useState({});
    const [audioObj,setAudioObj] = useState([]);
    const [text, setText] = useState([]);
    const [res,setRes] = useState();
    const [selectedAudio, setSelectedAudio] = useState({});
    const [confidence,setConfidence] = useState("N/A");
    const [isLoading,setIsLoading] = useState(false);

    const checkMimeType = event =>{
        let files = event.target.files 
        //define message container
        let err = ''
        // list allow mime type
       const types = ['audio/mpeg', 'audio/wav']
        // loop access array
        for(let x = 0; x<files.length; x++) {
         // compare file type find doesn't matach
             if (types.every(type => files[x].type !== type)) {
             // create error message and assign to container   
             err += files[x].type+' is not a supported format\n';
           }
         };
      
       if (err !== '') { // if message not same old that mean has error 
            event.target.value = null // discard selected file
            alert ('some error occurs')
             return false; 
        }
       return true;
    }

    const onChangeHandler = event =>{
        let files = event.target.files;

        if(checkMimeType(event)){

            let newAudioObjs = [];
            setFiles(files);

            for(let i = 0; i < files.length ;i++){
                newAudioObjs.push({
                    path: URL.createObjectURL(files[i]),
                    filename: files[i].name
                })

            setAudioObj([...audioObj, ...newAudioObjs])
            }
        }
    }

    const handleAudioClick = (audio) =>{
        setSelectedAudio(audio);

        if(res!== undefined){
            res.forEach(data => {
                if(audio.filename === data.filename){
                    setText(data.transcription);
                    setConfidence(data.confidence);
                }
                return
            })
        }
    }
    
    const onClickHandler = () =>{

        const data = new FormData();
        if(Object.keys(files).length === 0 && files.constructor === Object){
            alert("No file choosen")
            return
        }

        for(let i = 0 ; i < files.length ; i++){
            data.append('file',files[i])
        }

        setIsLoading('true')
        axios.post("http://3.24.137.31/convert",data)
        .then(res => {
            console.log(res.data)
            setRes(res.data);

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


    useEffect(()=>{
        if(audioObj.length !== 0){
            setSelectedAudio(audioObj[0])
        }
    },[audioObj])

    return (
       <>
        <Loader isLoading = {isLoading}></Loader>

        <div>
            <header>
                <div className = "logo">
                    <h1>Speech To Text</h1>
                    <h4>University of Tasmania</h4>
                </div>
                <div className = "dropBox">
                    <label htmlFor = "file" className = "btn">Select Files</label>
                    <input type = "file" className="form-control"  id = "file" multiple onChange = {onChangeHandler}/>    
                    <button type="button" className = "btn" onClick = {onClickHandler}>Transcript</button>      
                </div>
            </header>
            <div className = "usage"> 
                <p>
                    * this app only support .wav format at the moment 
                </p>
            </div>
            <div className = "hero flex">
                <div className = "left col-8">
                    <div className = "audioplayer-wrap flex">
                        <p className = "col-6">Selected Audio:  { selectedAudio.filename || 'N/A'}</p>
                        <ReactAudioPlayer 
                            className = "audio-player col-6"
                            src = {selectedAudio.path}
                            autoPlay = {false}
                            controls
                            />
                    </div>
                    <textarea 
                        value = {text}
                        onChange = { e => {
                            const {value} = e.target
                            setText(value)
                        }}
                        onBlur = {()=>{
                            const newRes = Array.from(res)
                            newRes.forEach(item => {
                                if(item.filename === selectedAudio.filename){
                                    item.transcription = text
                                }
                            })
                            setRes(newRes)
                        }}
                        >
                    </textarea>
                    <div className = "flex left-row-3">
                        <p>Confidence: {confidence} </p>
                        <div>
                            <CSVLink data={ res === undefined ? "none" : res } onClick = {()=>{
                                setFiles({})
                                setAudioObj([])
                                setSelectedAudio({})
                                setAudioObj([])
                                setText([])
                                setConfidence('N/A')
                                window.location.reload()
                            }} className = "btn btn-download">Download CSV</CSVLink>
                        </div>
                    </div>
                </div>
                <div className = "right col-4">
                        <h4>Audio File List</h4>
                        {
                            audioObj.map(audio => {
                                return <div className = "audio-element" 
                                            key={audio.path} 
                                            onClick = { () => handleAudioClick(audio)}> {audio.filename} </div>
                            })
                        }
                </div>
            </div>
        </div>
    </>
    )

}
