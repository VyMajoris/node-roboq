'use strict';
const qr = require('qr-image');
const crypto = require('crypto');
const request = require('request');
const firebase = require('firebase');
const express = require('express');
var bodyParser = require('body-parser');
var FCM = require('fcm').FCM;
var fcm = new FCM("AIzaSyAbgxF3VkF8DM_oYKxsEDAwZ2nw8ZreNLk");
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
var FCMmessage = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to: 'registration_token'
    , notification: {
        title: 'Title of your push notification'
        , body: 'Body of your push notification'
    }
    , data: { //you can send only notification or only data(or include both)
        auth_status: 'my value'
    }
};

function sendFCM(mDeviceID, mAuth_status, mTitle, mBody) {
    console.log("sendFCM")
    console.log(message)
    var message = {
        to: mDeviceID
        , data: {
            auth_status: mAuth_status
        }
        , notification: {
            title: mTitle
            , body: mBody
        }
    }
    fcm.send(message, function (err, messageId) {
        if (err) {
            console.log("Something has gone wrong!");
        }
        else {
            console.log("Sent with message ID: ", messageId);
        }
    });
}

function removeQueuer(deviceID) {
    roboQQueuersRef.child(deviceID).remove(onComplete)
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
app.post('/getTicket', function (req, res) {
    console.log(req.body.deviceID)
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
    var deviceID = req.body.deviceID;
    roboQQueuersRef.child(deviceID).once('value', function (snapshot) {
        if (snapshot.val() != null) {
            if (snapshot.val().pos == 1) {
                console.log("AUTH 3 ")
                removeQueuer(deviceID);
                sendFCM(deviceID, true, "Bem vindo", "Sua senha foi aceita")
                res.status(200).send({
                    'success': 'auth-done'
                });
            }
            else {
                console.log("AUTH 4 ")
                sendFCM(deviceID, false, "Erro!", "Ainda não chegoua  sua vez!")
                res.status(303).send({
                    'error': 'invalid-turn'
                });
            }
        }
        else {
            console.log("AUTH 5 ")
            sendFCM(deviceID, false, "Erro!", "Você não está nesta fila!")
            res.status(303).send({
                'error': 'invalid-queue'
            });
        }
    });
});
app.listen(PORT);
console.log('Running on http://localhost:' + PORT);