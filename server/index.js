const express = require('express');

const cors = require('cors');

const uploadHandler = require('./helper/uploadHandler').uploadHandler
const uploadRouter = require('./router/upload').uploadRouter
const convertRouter = require('./router/convert').convert

/**
 * Inilization
 */
const app = express();
app.use(cors());

/**
 * Routers
 */
app.post('/upload',uploadHandler.any(), async (req,res) => {uploadRouter(req,res)} );

app.post('/convert', uploadHandler.any(), async (req,res) => {convertRouter(req,res)} );

app.listen(8000, ()=>{
  console.log('app running on port 8000')
})