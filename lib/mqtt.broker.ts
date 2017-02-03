const Paho = require('./mqttws31.js');

import * as Rx from 'rxjs/Rx';

export class MQTTBroker {

    private client: any;

    constructor( broker: string, port: number, clientid: string) {
        this.client = new Paho.MQTT.Client(broker, port, clientid);
    }

    public connect( userName: string, password: string, onSuccess: () => void = () => {}, onFailure: (message: string) => void = (message) => {} ): Rx.Observable<any> {
        let options = {
            userName: userName,
            password: password,
            timeout: 3,
            mqttVersion: 3,
            onSuccess: onSuccess,
            onFailure: onFailure
        };
        this.client.connect(options);

        let observable = Rx.Observable.create(
            ( obs: Rx.Observer<any> ) => {
                this.client.onMessageArrived = obs.next.bind( obs );
                this.client.onConnectionLost = obs.error.bind( obs );
                return this.client.disconnect.bind( this.client );
            }
        );

        return observable;
    }

    public disconnect() {
        this.client.disconnect(); 
    }

    public subscribe( channel: string ) {
        this.client.subscribe( channel );
    }

    public unsubscribe( channel: string ) {
        this.client.unsubscribe( channel );
    }

    public send( payload: any, channel: string ) {
        let jsonPayload = JSON.stringify( payload );
        console.log( "Building Paho.MQTT.Message ", jsonPayload );
        let message = new Paho.MQTT.Message( jsonPayload );
        console.log( "Setting destinationName ", channel );
        message.destinationName = channel;
        console.log( "Sending message to client ", message );
        this.client.send( message );
    }
}
