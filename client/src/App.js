import React from 'react'
import {useState,useEffect} from 'react'
import axios from 'axios'
import ReactAudioPlayer from 'react-audio-player'
import {CSVLink} from 'react-csv'
import './App.css'

export default function App() {
    const [files, setFiles] = useState({})
    const [audioObj,setAudioObj] = useState([])
    const [text, setText] = useState([])
    const [res,setRes] = useState()
    const [selectedAudio, setSelectedAudio] = useState({})
    const [confidence,setConfidence] = useState("N/A")

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
            console.log(err)
             return false; 
        }
       return true;
    }

    const onChangeHandler = event =>{
        let files = event.target.files
        if(checkMimeType(event)){
            let newArray = []
            setFiles(files)
            for(let i = 0; i < files.length ;i++){
                newArray.push({
                    path: URL.createObjectURL(files[i]),
                    filename: files[i].name
                })
                setAudioObj([...audioObj, ...newArray])
            }
        }
    }

    const handleAudioClick = (audio) =>{
        setSelectedAudio(audio)
        console.log(audio)
        if(res!== undefined){
            res.forEach(data => {
                if(audio.filename === data.filename){
                    setText(data.transcription)
                    setConfidence(data.confidence)
                }
                return
            })
        }
    }
    
    const onClickHandler = () =>{
        const data = new FormData()
        if(!files){
            alert("No file choosen")
            return
        }
        for(let i = 0 ; i < files.length ; i++){
            data.append('file',files[i])
        }
        axios.post("http://localhost:8000/upload",data)
        .then( res => {
            /**
             * TODO: Use Switch to structure the code
             *       获取视频文件名
             */
            //if the file upload successful, then request the convert route
            if(res.status === 200){
                axios.post("http://localhost:8000/convert")
                .then(res => {
                    setRes(res.data)
                    res.data.forEach( item => {
                        if(item.filename === selectedAudio.filename){
                            setText(item.transcription)
                            setConfidence(item.confidence)
                            return
                        }
                        return
                    })
                    // const newData = res.data.map((item, index)=> {
                    //     return {...item, ...audioObj[index]}
                    // })
                    // setData(newData)
                })
            }
            else{
                alert(`Error Code with ${res.status}`)
            }
        })
    }

    useEffect(()=>{
        if(audioObj.length !== 0){
            setSelectedAudio(audioObj[0])
        }
    },[audioObj])

    return (
        <div>
            <header>
                <div className = "logo">
                    <h1>Speech To Text</h1>
                    <h4>University of Tasmania</h4>
                </div>
                <div className = "dropBox">
                    <label htmlFor = "file" className = "btn">Upload Files</label>
                    <input type = "file" className="form-control"  id = "file" multiple onChange = {onChangeHandler}/>    
                    <button type="button" className = "btn" onClick = {onClickHandler}>Transcript</button>      
                </div>
            </header>
            <div className = "progressBar"> 

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
                            <CSVLink data={ res === undefined ? "none" : res } className = "btn btn-download">Download CSV</CSVLink>
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
    )

}
