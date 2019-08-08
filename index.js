var get = require('lodash/get');
var IntervalClock = require('interval-clock');
var { EventEmitter } = require('events');
var Candlestick = require('./lib/candlestick');
var Simulator = require('./lib/simulator');
var TRADE_PROPS = require('./lib/constants').TRADE_PROPS;

/**
 * A factory function that returns an instance of an EventEmitter that will send chart candlestick models
 * @public
 * @param {object} websocket - An instance of a websocket connection (authenticated is applicable)
 * @param {string} timeframe - A timeframe specifier (ie 10s 1m 6h, etc)
 * @param {object} config - An object with option properties to configure the connection to the upstream exchange
 * @param {Map<string, string>} config.propMap - A map of source properties to path strings that reference incoming message properties
 * @param {function} config.filterFn - A function that takes the incoming message object and returns true for objects to be processed
 * @param {string} config.listenerMethodName - A name of the `on` method that is used to trigger event handlers from the source websocket
 * @param {string} config.listenerEventName - A name of the event fired for each quote from the source socket
 * @fires Candlestick#change
 * @fires Candlestick#open
 * @fires Candlestick#close
 * @returns {EventEmitter} - An EventEmitter that emits candlesticks on open, close and change
 */
function Chart(websocket, timeframe, config) {
  var propMap = get(config, 'propMap', null);
  var filterFn = get(config, 'filterFn', null);
  var messageFn = get(config, 'messageFn', null);
  var listenerMethodName = get(config, 'listenerMethodName', null);
  var listenerEventName = get(config, 'listenerEventName', null);
  var errorMethodName = get(config, 'errorMethodName', null);
  var errorEventName = get(config, 'errorEventName', null);
  var chart = new EventEmitter();
  var clock = IntervalClock(timeframe);
  var currentCandle;

  function messageHandler(message) {
    messageFn && messageFn(message);
    if (!filterFn(message)) {
      return;
    }
    returnMessage = transformIncomingMessage(propMap, message);
    if (currentCandle) {
      currentCandle.update(returnMessage.price, returnMessage.size);
    } else {
      currentCandle = new Candlestick(returnMessage.price, returnMessage.symbol);
    }
    chart.emit('change', currentCandle);
  }

  function errorHandler(error) {
    chart.emit('error', typeof error === 'object' ? error : { error: error })
  }

  function clockHandler() {
    if (!currentCandle) {
      return;
    }
    currentCandle.finalize();
    chart.emit('close', currentCandle);
    currentCandle = new Candlestick(currentCandle.last, currentCandle.symbol);
    chart.emit('open', currentCandle);
  }

  if (propMap == null) {
    throw new Error('FATAL: Must specifiy a property map for incoming socket messages');
  }

  clock.on('tick', clockHandler);
  
  if (listenerMethodName) {
    websocket[listenerMethodName].call(this, messageHandler);
  } else if (listenerEventName) {
    websocket.on(listenerEventName, messageHandler);
  } else {
    throw new Error('FATAL: Must specify either a listenerMethodName or listenerEventName')
  }

  if (errorMethodName) {
    websocket[errorMethodName].call(this, errorHandler);
  } else if (errorEventName) {
    websocket.on(errorEventName, errorHandler);
  }

  chart.recycleWebsocket = function(newWebsocket) {
    errorEventName && websocket.off(errorEventName, errorHandler);
    listenerEventName && websocket.off(listenerEventName, messageHandler)
    errorEventName && (websocket[errorMethodName] = null);
    listenerMethodName && (websocket[listenerMethodName] = null);
    websocket = newWebsocket;
    errorEventName && websocket.on(errorEventName, errorHandler);
    listenerEventName && websocket.on(listenerEventName, messageHandler)
    errorEventName && (websocket[errorMethodName] = errorHandler);
    listenerMethodName && (websocket[listenerMethodName] = messageHandler);
  }
  return chart;

}

function transformIncomingMessage(propMap, message) {
  var outMessage = {};
  propMap.forEach(function(val, key) {
    if (TRADE_PROPS.indexOf(key) !== -1) {
      outMessage[key] = get(message, val, null);
    }
  });
  return outMessage;
}

module.exports = { Chart: Chart, Simulator: Simulator };