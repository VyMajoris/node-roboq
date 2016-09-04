'use strict';


const qr = require('qr-image');
const crypto = require('crypto');
const request = require('request');
const firebase = require('firebase');
const express = require('express');
var bodyParser = require('body-parser')

var app = express();
app.use(bodyParser.urlencoded({
  extended: true
})); 
app.use( bodyParser.json() );  

const PORT = 8080;

const fireapp = firebase.initializeApp({
    apiKey: "AIzaSyALJYmRMRfMxMXYFCGT8yStxN2xzh-xoPY",
    authDomain: "roboq-7e9fe.firebaseapp.com",
    databaseURL: "https://roboq-7e9fe.firebaseio.com",
    storageBucket: "roboq-7e9fe.appspot.com",
  });
 var database = firebase.database();
 var roboQRef = firebase.database().ref('estbXYZ/fila')



var inboundHash;
app.get('/start', function (req, res) {
    var hash = crypto.createHash('sha1').update((new Date()).valueOf().toString() + Math.random().toString()).digest('hex');
    roboQRef.set({
        'hash':hash
    });


  res.send( qr.imageSync(hash, { size: 10}));
});

app.post('/get', function (req, res) {
    var result = fireGet(roboQRef)
    console.log(result)
});

app.post('/auth', function (req, res) {
    console.log(req)
    inboundHash =  req.body.hash;
    roboQRef.once('value',performAuth);
});

function performAuth(snapshot){
    console.log('callback',snapshot.val().hash)
    if (inboundHash == snapshot.val().hash){
        console.log("AAAAAAAAAA")
    }else{
        console.log("bbbbbbbbb")
    }
}




app.listen(PORT);
console.log('Running on http://localhost:' + PORT);