'use strict';
const qr = require('qr-image');
const crypto = require('crypto');
const request = require('request');
const firebase = require('firebase');
const express = require('express');
var bodyParser = require('body-parser')
var queueSize = 0
var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
const PORT = 8080;
const fireapp = firebase.initializeApp({
    apiKey: "AIzaSyALJYmRMRfMxMXYFCGT8yStxN2xzh-xoPY"
    , authDomain: "roboq-7e9fe.firebaseapp.com"
    , databaseURL: "https://roboq-7e9fe.firebaseio.com"
    , storageBucket: "roboq-7e9fe.appspot.com"
, });
var database = firebase.database();
var roboQRef = firebase.database().ref('estbXYZ/fila')
var roboQQueuersRef = firebase.database().ref('estbXYZ/queue/queuers')
var hash = "";
var inboundHash;

function genHash() {
    hash = crypto.createHash('sha1').update((new Date()).valueOf().toString() + Math.random().toString() + queueSize).digest('hex');
    return hash;
}

function saveHashQueuers() {
    roboQQueuersRef.push({
        'hash': hash
        , 'pos': queueSize
    })
}




function updateCurrentHash() {
    roboQRef.put({
        'hash': genHash()
        , 'queueSize': queueSize
    })
}


roboQRef.on("value", function(snapshot) {
  console.log("ON CHANGE",snapshot.val());
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});


function removeHash(queuePos, hash) {
    firebase.database().ref('estbXYZ/queue/queuers')
    roboQQueuersRef.remove({
        'hash': hash
        , 'pos': queueSize
    })
    return hash;
}
app.get('/start', function (req, res) {
    hash = crypto.createHash('sha1').update((new Date()).valueOf().toString() + Math.random().toString() + queueSize).digest('hex');
});
app.get('/getTicket', function (req, res) {
    queueSize++;
    
    roboQQueuersRef();
    res.json({
        'hash': hash
        , 'queuePos': queueSize
    });
});
app.post('/forfeitTicket', function (req, res) {
    console.log(req.body.queuePos, req.body.hash)
    removeHash();
    queueSize--
    res.json({
        'hash': hash
        , 'queuePos': queueSize
    });
});

app.post('/auth', function (req, res) {
    console.log(req.body)
    inboundHash = req.body.hash;
    
    roboQRef.once('value', function (snapshot) {
        console.log('snapshot - ', snapshot.val().hash)
        console.log('inboundhash - ', inboundHash)
        console.log('inboundhash 2 - ', JSON.stringify(inboundHash))
        
        
        if (inboundHash == snapshot.val().hash) {
            queueSize--
            console.log("AAAAAAAAAA")
            res.sendStatus(200)
        }
        else {
            console.log("bbbbbbbbb")
            res.sendStatus(303)
        }
    });
    
});


app.listen(PORT);
console.log('Running on http://localhost:' + PORT);