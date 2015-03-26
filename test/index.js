'use strict';

require('should');

var OKCoin = require('../okcoin.js');

if (!process.env.OKCOIN_API_KEY) throw new Error('You must specify a OKCOIN_API_KEY environment variable to run tests');
if (!process.env.OKCOIN_API_SECRET) throw new Error('You must specify a OKCOIN_API_SECRET environment variable to run tests');

var okcoin = new OKCoin(
  process.env.OKCOIN_API_KEY,
  process.env.OKCOIN_API_SECRET
);
describe('OKCoin unit tests', function() {
  this.timeout(18000); 
  describe('okcoin.ticker', function () {
    it('should return ticker info', function (done) {
      okcoin.ticker(function (err, data) {
        if (err) return done(err);
        data.should.have.property('ticker');
        done();
      });
    });
  });
  describe('okcoin.depth', function () {
    it('should return depth', function (done) {
      okcoin.depth(function (err, data) {
        if (err) return done(err);
        data.should.have.property('asks');
        data.should.have.property('bids');
        done();
      });
    });
  });
  describe('okcoin.trades', function () {
    it('should return trades', function (done) {
      okcoin.trades(function (err, data) {
        if (err) return done(err);
        data[0].should.have.property('price');
        done();
      });
    });
  });
  describe('okcoin.userinfo', function () {
    it('should return user info', function (done) {
      okcoin.userinfo(function (err, data) {
        if (err) return done(err);
        data.should.have.property('info');
        done();
      });
    });
  });
  describe('okcoin.order_info', function () {
    it('should return order info', function (done) {
      var symbol = 'btc_cny';
      var order_id = '-1';
      okcoin.order_info(symbol, order_id, function (err, data) {
        if (err) return done(err);
        data.should.have.property('result');
        done();
      });
    });
  });
  describe('okcoin.account_records', function () {
    it('should return account record', function (done) {
      var symbol = 'btc_cny';
      var type =1;
      var current_page = 1;
      var page_length = 49;
      okcoin.account_records(symbol, type, current_page, page_length, function (err, data) {
        if (err) return done(err);
        data.should.have.property('records');
        done();
      });
    });
  });
  /*
   *
   *      WARNING : THESE TESTS WILL SELL OR BUY REAL BTC, 
   *                THOSE TESTS ARE SKIPPED BY DEFAULT
   *
   */
  describe.skip('okcoin.trade', function () {
    it('should return sell btc for CNY', function (done) {
      okcoin.trade('btc_cny','sell_market',null,0.01, function (err, data) {
        if (err) return done(err);
        data.should.have.property('order_id');
        done();
      });
    });
  });
  describe.skip('okcoin.withdraw', function () {
    it('should return a withraw_id', function (done) {
      if (!process.env.TRADE_PWD) throw new Error('You must specify a TRADE_PWD environment variable to run this test');
      var trade_pwd = process.env.TRADE_PWD;
      var withdraw_address = '18erC7jwDWnoWZBAscdEF8u3UG1z6Eem1j';
      var withdraw_amount = 0.001;
      var chargeFee = 0.000;
      okcoin.trade('btc_cny', chargeFee, trade_pwd, withdraw_address, withdraw_address, function (err, data) {
        if (err) return done(err);
        data.should.have.property('withraw_id');
        done();
      });
    });
  });
});