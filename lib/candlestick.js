function Candlestick(price, symbol) {
  var priceFloat = Number(price);
  this.timestamp = new Date();
  this.symbol = symbol;
  this.high = priceFloat;
  this.low = priceFloat;
  this.last = priceFloat;
  this.color = 0; // no color
  this.open = priceFloat;
  this.close = null;
  this.volume = 0;
  return this;
}

Candlestick.prototype.update = function(price, size) {
  var priceFloat = Number(price);
  var sizeFloat = Number(size);
  this.last = priceFloat;

  // update volume
  this.volume += sizeFloat;
  
  // update high and low
  if (priceFloat > this.high) {
    this.high = priceFloat;
  } else if (priceFloat < this.low) {
    this.low = priceFloat;
  }

  // update color
  if (priceFloat >= this.open) {
    this.color = 1; // green
  } else {
    this.color = -1; // red
  }
}

Candlestick.prototype.finalize = function() {
  this.close = this.last;
}

module.exports = Candlestick;