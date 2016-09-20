'use strict';
const qr = require('qr-image');
const crypto = require('crypto');
const request = require('request');
const firebase = require('firebase');
const express = require('express');
var bodyParser = require('body-parser');
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

function sendFCM(mDeviceID, mAuth_status, mTitle, mBody) {
    var options = {
        method: 'POST'
        , url: 'https://fcm.googleapis.com/fcm/send'
        , headers: {
            authorization: 'key=AIzaSyAbgxF3VkF8DM_oYKxsEDAwZ2nw8ZreNLk'
            , 'content-type': 'application/json'
        }
        , body: {
            to: mDeviceID
            , data: {
                auth_status: mAuth_status
            }
            , notification: {
                title: mTitle
                , body: mBody
            }
        }
        , json: true
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log("ERROR FCM >>>")
        console.log(error);
    });
}

function removeQueuer(deviceID) {
    roboQQueuersRef.child(deviceID).once('value', function (snapshot) {
        snapshot.ref.remove().then(function () {
            var pos = snapshot.val().pos;
            roboQQueuersRef.once("value").then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var childPos = childSnapshot.val().pos
                    if (childPos > pos) {
                        childSnapshot.ref.set({
                            'pos': childPos - 1
                        })
                    }
                });
            });
        }).catch(function (error) {
            console.log("Remove failed: " + error.message)
        });
    })
}

function refreshQueuersPositions() {
    roboQQueuersRef.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {});
    });
}
app.post('/getTicket', function (req, res) {
    roboQQueuersRef.once("value").then(function (snapshot) {
        roboQQueuersRef.child(req.body.deviceID).set({
            'pos': snapshot.numChildren() + 1
        })
        res.status(200).send({
            'success': 'ticket-taken'
        })
    });
});
app.post('/forfeitTicket', function (req, res) {
    removeQueuer(req.body.deviceID);
    res.status(200).send({
        'success': 'ticket-forfeited'
    })
});
app.post('/auth', function (req, res) {
    var deviceID = req.body.deviceID;
    roboQQueuersRef.child(deviceID).once('value', function (snapshot) {
        if (snapshot.val() != null) {
            if (snapshot.val().pos == 1) {
                removeQueuer(deviceID);
                sendFCM(deviceID, true, "Bem vindo", "Sua senha foi aceita")
                res.status(200).send({
                    'success': 'auth-done'
                });
            }
            else {
                sendFCM(deviceID, false, "Erro!", "Ainda não chegou a sua vez!")
                res.status(303).send({
                    'error': 'invalid-turn'
                });
            }
        }
        else {
            sendFCM(deviceID, false, "Erro!", "Você não está nesta fila!")
            res.status(303).send({
                'error': 'invalid-queue'
            });
        }
    });
});
app.listen(PORT);
console.log('Running on http://localhost:' + PORT);