'use strict';

var request  = require('requestretry');
var md5 = require('MD5');

/**
 * OKCoin connects to the OKCoin.cn API
 * @param {String} api_key    
 * @param {String} secret API Secret
 */
function OKCoin(api_key, secret) {
  var self = this;

  var config = {
    url: 'https://www.okcoin.cn/api',
    version: 'v1',
    api_key: api_key,
    secret: secret,
    timeoutMS: 18000
  };

  /**
  * Public methods supported
  */
  function ticker(callback) {
    var path  = '/' + config.version + '/ticker.do';
    return publicMethod(path, callback);
  }
  
  function depth(callback) {
    var path  = '/' + config.version + '/depth.do';
    return publicMethod(path, callback);
  }
  
  function trades(callback) {
    var path  = '/' + config.version + '/trades.do';
    return publicMethod(path, callback);
  }
   
  /**
  * Private methods supported
  * For information on the parameters, check OKCoin website https://www.okcoin.cn/about/rest_api.do
  */
  function userinfo(callback) {
    var path  = '/' + config.version + '/userinfo.do';
    var params = {};
    return privateMethod(path, params, callback);
  }

  function order_info(symbol, order_id, callback) {
    var path  = '/' + config.version + '/order_info.do';
    var params = {};
    params.symbol =  symbol;
    params.order_id = order_id;
    return privateMethod(path, params, callback);
  }
  
  function cancel_order (symbol, order_id, callback) {
    var path  = '/' + config.version + '/cancel_order.do';
    var params = {};
    params.symbol =  symbol;
    params.order_id = order_id;
    return privateMethod(path, params, callback);
  }
  
  function trade(symbol, type, price, amount, callback) {
    var path  = '/' + config.version + '/trade.do';
    var params = {};
    if (amount) params.amount =  amount;
    if (price) params.price = price;
    params.symbol = symbol;
    params.type = type;
    return privateMethod(path, params, callback);
  }
  
  function withdraw(symbol, chargefee, trade_pwd, withdraw_address, withdraw_amount, callback) {
    var path  = '/' + config.version + '/withdraw.do';
    var params = {};
    params.chargefee = chargefee;
    params.symbol = symbol;
    params.trade_pwd = trade_pwd;
    params.withdraw_address = withdraw_address;
    params.withdraw_amount = withdraw_amount;
    return privateMethod(path, params, callback);
  }

  function account_records(symbol, type, current_page, page_length, callback) {
    var path  = '/' + config.version + '/account_records.do';
    var params = {};
    params.symbol = symbol;
    params.type = type;
    params.current_page = current_page;
    params.page_length = page_length;
    return privateMethod(path, params, callback);
  }
  

  /**
   * This method makes a public API request.
   * @param  {String}   path   The path to the API method 
   * @param  {Function} callback A callback function to be executed when the request is complete
   * @return {Object}            The request object
   */
  function publicMethod(path, callback) {
    var params = null;
    var url    = config.url + path;
    return okcoinRequest(url, 'GET', params, callback);
  }

  /**
   * This method makes a private API request.
   * @param  {String}   path   The path to the API method 
   * @param  {Object}   params   Arguments to pass to the api call
   * @param  {Function} callback A callback function to be executed when the request is complete
   * @return {Object}            The request object
   */
  function privateMethod(path, params, callback) {
    var url    = config.url + path;
    params.api_key = config.api_key;
    params.sign  = getMessageSignature(params);
    return okcoinRequest(url, 'POST', params, callback);
  }

  /**
   * This method returns a signature for a request as a md5-encoded uppercase string
   * @param  {Object}  params   The object to encode
   * @return {String}           The request signature
   */
  function getMessageSignature(params) {
    var sign = md5(stringifyToOKCoinFormat(params) + '&secret_key='+ config.secret).toUpperCase();
    return sign;
  }
  
  /**
   * This method returns the parameters as an alphabetically sorted string
   * @param  {Object}  params   The object to encode
   * @return {String}           The request signature
   */
  function stringifyToOKCoinFormat(obj) {
    var arr = [],
        i,
        formattedObject = '';

    for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            arr.push(i);
        }
    }
    arr.sort();
    for (i = 0; i < arr.length; i++) {
        if (i != 0) {
        formattedObject += '&';
        }
        formattedObject += arr[i] + '=' + obj[arr[i]];
    }
    return formattedObject;
}

  /**
   * This method sends the actual HTTP request
   * @param  {String}   url      The URL to make the request
   * @param  {String}   requestType   POST or GET
   * @param  {Object}   params   POST body
   * @param  {Function} callback A callback function to call when the request is complete
   * @return {Object}            The request object
   */
  function okcoinRequest(url, requestType, params, callback) {

    var options = {
      url: url,
      method: requestType,
      form: params,
			timeout: config.timeoutMS,
      maxAttempts: 3,
      retryDelay: 1000,  // (default) wait for 5s before trying again
      retryStrategy: request.RetryStrategies.HTTPOrNetworkError // (default) retry on 5xx or network errors
    };
    
    var req = request(options, function(error, response, body) {
      if(typeof callback === 'function') {
        var data;
        if(error) {
          callback.call(self, new Error('Error in server response: ' + JSON.stringify(error)), null);
          return;
        }
        try {
          data = JSON.parse(body);         
        }
        catch(e) {
          callback.call(self, new Error('Could not understand response from server: ' + body), null);
          return;
        }
        if(data.error_code) {         
          callback.call(self, error_code_meaning(data.error_code), null);
        }
        else {
          callback.call(self, null, data);
        }
      }
    });

    return req;
  }
  
  /**
   * This method return the OKCoin error information
   * @param  {Integer}  error_code   OKCoin error code
   * @return {String}                Error
   */
  function error_code_meaning(error_code) {
        var codes = {     10000 : 'Required parameter can not be null',
                          10001 : 'Requests are too frequent',
                          10002 : 'System Error',
                          10003 : 'Restricted list request, please try again later',
                          10004 : 'IP restriction',
                          10005 : 'Key does not exist',
                          10006 : 'User does not exist',
                          10007 : 'Signatures do not match',
                          10008 : 'Illegal parameter',
                          10009 : 'Order does not exist',
                          10010 : 'Insufficient balance',
                          10011 : 'Order is less than minimum trade amount',
                          10012 : 'Unsupported symbol (not btc_cny or ltc_cny)',
                          10013 : 'This interface only accepts https requests',
                          10014 : 'Order price must be between 0 and 1,000,000',
                          10015 : 'Order price differs from current market price too much',
                          10016 : 'Insufficient coins balance',
                          10017 : 'API authorization error',
                          10026 : 'Loan (including reserved loan) and margin cannot be withdrawn',
                          10027 : 'Cannot withdraw within 24 hrs of authentication information modification',
                          10028 : 'Withdrawal amount exceeds daily limit',
                          10029 : 'Account has unpaid loan, please cancel/pay off the loan before withdraw',
                          10031 : 'Deposits can only be withdrawn after 6 confirmations',
                          10032 : 'Please enabled phone/google authenticator',
                          10033 : 'Fee higher than maximum network transaction fee',
                          10034 : 'Fee lower than minimum network transaction fee',
                          10035 : 'Insufficient BTC/LTC',
                          10036 : 'Withdrawal amount too low',
                          10037 : 'Trade password not set',
                          10040 : 'Withdrawal cancellation fails',
                          10041 : 'Withdrawal address not approved',
                          10042 : 'Admin password error',
                          10100 : 'User account frozen',
                          10216 : 'Non-available API',
                            503 : 'Too many requests (Http)'};
        if (!codes[error_code]) {
            return 'OKCoin error code :' + error_code +' is not yet supported by the API';
            }
        return( codes[error_code] );
  }
  
  
  self.ticker = ticker;
  self.trades = trades;
  self.depth = depth;
  self.userinfo = userinfo;
  self.trade = trade;
  self.order_info = order_info;
  self.withdraw = withdraw;
  self.account_records = account_records;
}

module.exports = OKCoin;
