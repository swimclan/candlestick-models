Candlestick Models
==================

An adaptable, event-driven market candlestick modeler.  Ideal for generating candlestick models from any automated exchange that serves a websocket-based price stream.

* * *

This package generates candlestick models at any interval down to 1 second.  The api provides a set of adapters that allow the consumer to plug into any automated financial exchange that offers a price websocket.  Examples of use could be to wire up to a cryptocurrency market or a stock market exchange to generate computer-readable candlesticks that could, in turn, be used for algorithmic trading or analysis.

### List of features

*   Usage of simple string-based interval specifier (ie '1s', '2m', '4h', etc)
*   Adapters to create a plugin interface with exchange price streams
*   Simple factory function instantiation
*   A price stream simulator that can be used to test adapter
*   ES5 implementation means use in older versions of Node
*   Websocket recycle utility to refresh supplied websocket with new websocket to prevent connection failures

### Code Demo

#### Simulator Usage

```js
const { Chart, Simulator } = require('candlestick-models');

const sim = Simulator(0.08); // 0.08 represents volatility coefficient (value from 0 - 1)

// Create a map from the simulator properties to the module 
// properties
const simPropMap = new Map();
simPropMap.set('price', 'price');
simPropMap.set('size', 'size');
simPropMap.set('symbol', 'symbol');

// Instantiate a chart from the module and pass in socket, 
// interval and config object including the propMap, a filter 
// function to filter only socket messages that pertain to 
// the price changes needed for the candles and either a 
// listener event name or a listener method name
const simchart = Chart(sim, '5s', {
  propMap: simPropMap,
  filterFn(quote) { return quote.type === 'last' },
  listenerEventName: 'quote'
});

simchart.on('close', console.log);
/*
Candlestick {
  symbol: 'TEST',
  high: 23.12,
  low: 23.09,
  last: 23.12,
  color: 1,
  open: 23.10,
  close: 23.11,
  volume: 200 }
Candlestick {
  symbol: 'TEST',
  high: 23.14,
  low: 23.11,
  last: 23.14,
  color: 1,
  open: 23.11,
  close: 23.14,
  volume: 200 }
*/
```

#### Exchange Usage (Coinbase)
```js
const { Chart } = require('candlestick-models');
var CoinbasePro = require('coinbase-pro');

const coinbase_credentials = {
  key: 'fakekey123fakekey123fakekey123',
  secret: 'fakesecret123fakesecret123fakesecret123fakesecret123fakesecret123fakesecret123',
  passphrase: 'fakepassphrase123'
};

const cbp = new CoinbasePro.WebsocketClient(
  ['BTC-USD'],
  'wss://ws-feed.pro.coinbase.com',
  coinbase_credentials,
  { channels: ['matches'] }
);

// Create the propMap for coinbase's matches channel
const cbpPropMap = new Map();
cbpPropMap.set('price', 'price');
cbpPropMap.set('size', 'size');
cbpPropMap.set('symbol', 'product_id');

// Instantiate chart with socket, interval and config object
const cbpchart = Chart(cbp, '1m', {
  propMap: cbpPropMap,
  filterFn(quote) { return quote.type === 'match' },
  listenerEventName: 'message',
  errorEventName: 'error'
});

cbpchart.on('close', console.log);
cbpchart.on('error', (error) => throw new Error(error));

/*
Candlestick {
  timestamp: 'Mon Jul 29 2019 20:31:00 GMT-0500',
  symbol: 'BTC-USD',
  high: 7858,
  low: 7853.44,
  last: 7858,
  color: 1,
  open: 7854.43,
  close: 7858,
  volume: 1.2756039000000001 }
Candlestick {
  timestamp: 'Mon Jul 29 2019 20:32:00 GMT-0500',
  symbol: 'BTC-USD',
  high: 7858,
  low: 7854.24,
  last: 7858,
  color: 1,
  open: 7858,
  close: 7858,
  volume: 1.66471794 }
*/
```

#### Websocket recycling

```js
const { Chart } = require('candlestick-models');
const exchangeChart = Chart({...config})
const newWebsocket = new ExchangeWebsocket({...options});
exchangeChart.recycleWebsocket(newWebsocket); // This will replace old websocket with fresh new websocket
```

### Download & Installation

```shell 
$ npm i candlestick-models 
```

### Contributing

Send me PRs.  I like contribution.

### Authors or Acknowledgments

*   Matthew Herron

### License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT)