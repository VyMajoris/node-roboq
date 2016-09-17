'use strict';
const qr = require('qr-image');
const crypto = require('crypto');
const request = require('request');
const firebase = require('firebase');
const express = require('express');
var bodyParser = require('body-parser');
var FCM = require('./fcm-push').FCM;
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
    , collapse_key: 'your_collapse_key'
    , notification: {
        title: 'Title of your push notification'
        , body: 'Body of your push notification'
    }
    , data: { //you can send only notification or only data(or include both)
        auth_status: 'my value'
    }
};

function sendFCM(message) {
    console.log("sendFCM")
    console.log(message)
    fcm.send(message, function (err, messageId) {
        if (err) {
            console.log("Something has gone wrong!");
        }
        else {
            console.log("Sent with message ID: ", messageId);
        }
    });
}

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
app.post('/getTicket', function (req, res) {
    console.log(req.body.deviceID)
    roboQQueuersRef.once("value").then(function (snapshot) {
        res.json({
            'queuePosID': roboQQueuersRef.push({
                'pos': snapshot.numChildren() + 1
            }).key
            , 'deviceID': req.body.deviceID
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
    var queuePosID = req.body.queuePosID;
    console.log("AUTH 1 ")
    roboQQueuersRef.child(queuePosID).once('value', function (snapshot) {
        console.log("AUTH 2  ")
        if (snapshot.val().pos == 1) {
            console.log("AUTH 3 ")
            console.log("AAAAAAAAAA");
            var removed = removeQueuer(queuePosID);
            console.log("removed?" + removed)
            var message = FCMmessage;
            message.to = snapshot.deviceID
            message.data.auth_status = true
            message.notification.title = "Bem Vindo!"
            message.notification.body = "Sua senha foi aceita com sucesso!"
            sendFCM(message)
            res.status(200).send({
                'success': 'auth-done'
            });
        }
        else {
            console.log("AUTH 4 ")
            var message = FCMmessage;
            message.to = snapshot.deviceID
            message.data.auth_status = false
            message.notification.title = "Erro!"
            message.notification.body = "eeerroooo!"
            sendFCM(message)
            res.status(303).send({
                'error': 'invalid-turn'
            });
        }
    });
});
app.listen(PORT);
console.log('Running on http://localhost:' + PORT);