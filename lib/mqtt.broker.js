"use strict";
var Paho = require('./mqttws31.js');
var Rx = require("rxjs/Rx");
var MQTTBroker = (function () {
    function MQTTBroker(broker, port, clientid) {
        this.client = new Paho.MQTT.Client(broker, port, clientid);
    }
    MQTTBroker.prototype.connect = function (userName, password, onSuccess, onFailure) {
        var _this = this;
        if (onSuccess === void 0) { onSuccess = function () { }; }
        if (onFailure === void 0) { onFailure = function (message) { }; }
        var options = {
            userName: userName,
            password: password,
            timeout: 3,
            mqttVersion: 3,
            onSuccess: onSuccess,
            onFailure: onFailure
        };
        this.client.connect(options);
        var observable = Rx.Observable.create(function (obs) {
            _this.client.onMessageArrived = obs.next.bind(obs);
            _this.client.onConnectionLost = obs.error.bind(obs);
            return _this.client.disconnect.bind(_this.client);
        });
        return observable;
    };
    MQTTBroker.prototype.disconnect = function () {
        this.client.disconnect();
    };
    MQTTBroker.prototype.subscribe = function (channel) {
        this.client.subscribe(channel);
    };
    MQTTBroker.prototype.unsubscribe = function (channel) {
        this.client.unsubscribe(channel);
    };
    MQTTBroker.prototype.send = function (payload, channel) {
        var jsonPayload = JSON.stringify(payload);
        console.log("Building Paho.MQTT.Message ", jsonPayload);
        var message = new Paho.MQTT.Message(jsonPayload);
        console.log("Setting destinationName ", channel);
        message.destinationName = channel;
        console.log("Sending message to client ", message);
        this.client.send(message);
    };
    return MQTTBroker;
}());
exports.MQTTBroker = MQTTBroker;
//# sourceMappingURL=mqtt.broker.js.map