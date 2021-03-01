import React from 'react'
import Loader from 'react-loader-spinner'

export default function LoaderContainer({isLoading}) {
    const style = {
        width: '100%',
        height:'100vh',
        overflow:'none',
        position:'absolute',
        top:0,
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        zIndex:1,
        background: 'rgba(0,0,0,.7)',
        visibility: `${isLoading? 'visible': 'hidden' }`,
        opacity: `${isLoading? '1' : '0'}`,
        backdropFilter: 'blur(4px)',
        transition:'1s'
    }
    return (
        <div style = {style}>
            <Loader type = 'ThreeDots' color = '#eeeeee'/>
            <h2 style = {
                {color:'#eeeeee',
                marginBottom: '1rem'}
            }
            >Converting Audio</h2>
            <p style = {
                {color:'#eeeeee',
                textAlign : 'center'}
            }>Every 1 min of audio takes approx. <strong> <em>20secs</em></strong> 
            </p>
        </div>
    )
}
