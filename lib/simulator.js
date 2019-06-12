var { EventEmitter } = require('events');

function Simulator(volatility) {
  var simulator = new EventEmitter();
  var initialPrice = Math.floor(Math.random() * 10000) / 100;
  cycle(simulator, volatility, initialPrice)
  return simulator;
}

function cycle(simulator, volatility, price) {
  setTimeout(function() {
    var directionDeterminant = Math.random();
    var priceDelta = Math.floor(Math.random() * volatility * 100) / 100;
    var newPrice = price + (priceDelta * (directionDeterminant >= 0.4 ? 1 : -1));
    simulator.emit('quote', {
      price: newPrice,
      size: Math.floor(Math.random() * 500),
      symbol: 'TEST',
      type: 'last'
    });
    cycle(simulator, volatility, newPrice);
  }, Math.floor(Math.random() * 5000))
}

module.exports = Simulator;
