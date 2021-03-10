const express = require('express');

const cors = require('cors');

const uploadHandler = require('./helper/uploadHandler').uploadHandler
const convertRouter = require('./router/convert').convert
const routerPaths = require('./common/constants').server.path

/**
 * Inilization
 */
const app = express();
app.use(cors());

/**
 * Routers
 */
app.post(`${routerPaths.convert}`, uploadHandler.any(), async (req,res) => {convertRouter(req,res)} );

'localhost'
'192.168.0.1:8000/route'


app.listen(8000, ()=>{
  console.log('app running on port 8000')
})