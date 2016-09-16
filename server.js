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
var started = false;

function removeQueuer(queuePosID) {
    roboQQueuersRef.child(queuePosID).remove(onComplete)
    var onComplete = function (error) {
        if (error) {
            console.log("REMOVING FAIL")
            return false
        }
        else {
            console.log("REMOVING DONE")
            return true
        }
    };
    return onComplete
}

function refreshQueuersPositions() {
    roboQQueuersRef.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
        });
    });
}
app.get('/getTicket', function (req, res) {
    roboQQueuersRef.once("value").then(function (snapshot) {
        res.json({
            'queuePosID': roboQQueuersRef.push({
                'pos': snapshot.numChildren() + 1
            }).key
        });
    });
});
app.post('/forfeitTicket', function (req, res) {
    console.log(req.body.queuePos, req.body.hash)
    removeHash();
    queueSize--
    refreshQueuersPositions().
    res.json({
        'hash': hash
        , 'queuePos': queueSize
    });
});
app.post('/auth', function (req, res) {
    console.log(req.body)
    console.log(JSON.parse(req.body))
    queuePosID = JSON.parse(req.body).queuePosID;
    roboQQueuersRef.child(queuePosID).once('value', function (snapshot) {
        if (snapshot.val().pos == 1) {
            console.log("AAAAAAAAAA");
            var removed = removeQueuer(queuePosID);
            console.log("removed?" + removed)
            res.sendStatus(200)
        }
        else {
            res.sendStatus(303).json({
                'error': 'invalid-turn'
            })
        }
    });
});
app.listen(PORT);
console.log('Running on http://localhost:' + PORT);