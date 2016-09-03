'use strict';

const express = require('express');
const qr = require('qr-image');
const crypto = require('crypto');
  var text = 'I love cupcakes'
  var key = 'abcdeg'
  var hash
 
// Constants
const PORT = 8080;

// App
const app = express();
app.get('/', function (req, res) {
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    hash = crypto.createHash('sha1').update(current_date + random).digest('hex');
 console.log(hash)
 

  res.send( qr.imageSync(hash, { type: 'svg', size: 10}));
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);