import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Websocket from './websocket/Websocket';
import ClipStore from '../stores/ClipStore';
import SceneStore from '../stores/SceneStore';
import PlaylistStore from '../stores/PlaylistStore';
import StateManager from '../util/StateManager';
import UIStore from '../stores/UIStore';

@observer
class WebsocketController extends React.Component {

  // Handles managing state.  instantiated when we get a websocket reference
  stateManager;

  constructor(...args) {
    super(...args);

    // Bind event handlers to the correct value of 'this'
    this.handleWebsocketOpen = this.handleWebsocketOpen.bind(this);
    this.handleWebsocketMessage = this.handleWebsocketMessage.bind(this);
    this.handleWebsocketClose = this.handleWebsocketClose.bind(this);
    this.handleWebsocketError = this.handleWebsocketError.bind(this);
    this.handleWebsocketRef = this.handleWebsocketRef.bind(this);
  }

  handleWebsocketOpen() {
    // debugger;
    console.log('got ws open');
    this.props.websocketIndicatorModel.setConnected(true);

    this.stateManager.loadInitialState();
  }

  handleWebsocketMessage(messageJson) {
    // Ignore these until I can figure out where the hell they are coming from
    // eslint-disable-next-line no-proto
    // if (messageJson.__proto__.toString() === '[object Blob]') {
    //   return;
    // }

    // console.log("got ws message");

    const message = JSON.parse(messageJson);

    if (!message.action || !message.data) {
      throw 'Error: JSON object from websocket must have \'action\' and \'data\' fields, and \'action\' must be a string';
    }

    const { action, data } = message;

    if (action === 'logMessage') {
      this.handleLogMessageAction(data);
    } else if (action === 'sendInitialState') {
      this.stateManager.handleSendInitialStateAction(data);
    } else if (action === 'stateUpdate') {
      this.stateManager.handleStateUpdatedAction(data);
    } else {
      throw `Error: Unimplemented action type: ${ action }`;
    }
  }

  handleWebsocketClose() {
    console.log('got ws close');
    this.props.websocketIndicatorModel.setConnected(false);

    // this.shouldRequestInitialState = true;
  }

  // Action: string
  // data: object
  sendMessage(action, data = {}) {
    console.log(`Sending websocket message. action: ${ action }`);

    const message = JSON.stringify({ action, data });

    try {
      this.ws.sendMessage(message);
    } catch (e) {
      console.log('Error: Cannot send websocket message');
      console.log(e);
    }
  }

  handleWebsocketError(a1, a2, a3) {
    debugger;
  }

  handleWebsocketRef(ws) {
    this.ws = ws;
    this.stateManager = StateManager.get();
    // Kinda a hack
    this.stateManager.setWebsocketController(this);
    // Set onerror handler because the dumb library doesn't let us do that...
    this.ws.onerror = this.handleWebsocketError;
  }

  render() {
    const serverAddr = UIStore.get().getValue('settingsPanel', 'serverAddr');
    const wsUrl = `ws://${ serverAddr }:8883`;

    console.log(`WebsocketController: Rendering Websocket element with url: ${ wsUrl }`);

    return (
      <Websocket url={ wsUrl }
                 onOpen={ this.handleWebsocketOpen }
                 onMessage={ this.handleWebsocketMessage }
                 onClose={ this.handleWebsocketClose }
                 onError={ this.handleWebsocketError }
                 ref={ this.handleWebsocketRef }
                 reconnectInterval={ 1000 }
                 debug
                 reconnect />
    );
  }

  handleLogMessageAction(data) {
    console.log(`WEBSOCKET LOGMESSAGE: ${ data }`);
  }

}

WebsocketController.propTypes = {
  websocketIndicatorModel: PropTypes.object.isRequired,
};

export default WebsocketController;
