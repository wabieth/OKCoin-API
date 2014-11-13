OKCoin-API
==========

OKCoin-API is a NodeJS wrapper over the API of OKCoin, the Chinese Bitcoin exchange

*** Warning : This project is under developement. You may encounter troubles when using this module as OKCoin API is constantly evolving and the english documentation is not always up to date 

Installation
```
npm install okcoin-api --save
```

How to use it 
```
var OKCoin = require('okcoin');
var okcoin = new OKCoin(process.env.OKCOIN_PARTNER, process.env.OKCOIN_API_SECRET);
```

Examples
```
// Get ticker information
okcoin.ticker(function (err, data) {
      if (err) return done(err);
      console.log(data);
    });

// Get market depth
okcoin.depth(function (err, data) {
      if (err) return done(err);
      console.log(data);
    });

// Get trades
okcoin.trades(function (err, data) {
      if (err) return done(err);
      console.log(data);
    });


// Get your balance
okcoin.userinfo(function (err, data) {
      if (err) return done(err);
      console.log(data);
    });
    
// Sell BTC at market price
okcoin.trade('btc_cny','sell_market',null,0.01, function (err, data) {
      if (err) return done(err);
      console.log(data);
    });
```

TODO : 

Add the methods : batch_trade, cancel_order, order_info, orders_info, orders_history

Add OKCoin.com compatibility
