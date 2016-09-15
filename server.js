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

function genHash() {
    hash = crypto.createHash('sha1').update((new Date()).valueOf().toString() + Math.random().toString() + queueSize).digest('hex');
    return hash;
}

function saveHashQueuers() {
    return roboQQueuersRef.push({
        'hash': hash
        , 'pos': queueSize
    }).key
}

function updateCurrentHash() {
    roboQRef.set({
        'hash': genHash()
        , 'queueSize': queueSize
    })
}
roboQRef.on("value", function (snapshot) {
    console.log("ON CHANGE", snapshot.val().hash);
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

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

function start() {
    if (!started) {
        started = true;
        hash = crypto.createHash('sha1').update((new Date()).valueOf().toString() + Math.random().toString() + queueSize).digest('hex');
    }
};

function refreshQueuersPositions() {
    roboQQueuersRef.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
        });
    });
}
app.get('/getTicket', function (req, res) {
    if (!started) {
        start()
    }
    queueSize++;
    res.json({
        'hash': hash
        , 'queuePos': queueSize
        , 'queuePosID': saveHashQueuers()
    });
    updateCurrentHash()
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
    queuePosID = req.body.queuePosID;
    console.log(req.body)
    inboundHash = req.body.hash;
    roboQQueuersRef.child(queuePosID).once('value', function (snapshot) {
        if (snapshot.val().pos == 1) {
            console.log('snapshot - ', snapshot.val().hash)
            console.log('inboundhash - ', inboundHash)
            console.log('inboundhash 2 - ', JSON.stringify(inboundHash))
            if (inboundHash == snapshot.val().hash) {
                queueSize--
                console.log("AAAAAAAAAA");
                var removed = removeQueuer(queuePosID);
                console.log("removed?" + removed)
                res.sendStatus(200)
            }
            else {
                console.log("bbbbbbbbb")
                res.sendStatus(303).json({
                    'error': 'invalid-hash'
                })
            }
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