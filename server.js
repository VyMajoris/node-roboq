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

function genAndSaveHash() {
    hash = crypto.createHash('sha1').update((new Date()).valueOf().toString() + Math.random().toString() + queueSize).digest('hex');
    roboQQueuersRef.push({'hash': hash, 'pos': queueSize})
    return hash;
}

app.get('/start', function (req, res) {
     hash = crypto.createHash('sha1').update((new Date()).valueOf().toString() + Math.random().toString() + queueSize).digest('hex');
});

app.get('/getTicket', function (req, res) {
    console.log(hash)
    res.send(hash);
    queueSize++;
    genAndSaveHash();
});

app.post('/auth', function (req, res) {
    console.log(req)
    inboundHash = req.body.hash;
    roboQRef.once('value', performAuth);
});

function performAuth(snapshot) {
    console.log('callback', snapshot.val().hash)
    if (inboundHash == snapshot.val().hash) {
        queueSize--
        console.log("AAAAAAAAAA")
    }
    else {
        console.log("bbbbbbbbb")
    }
}
app.listen(PORT);
console.log('Running on http://localhost:' + PORT);