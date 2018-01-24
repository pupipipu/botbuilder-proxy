# Bot Builder Node SDK with proxy

This is a modified version of BotBuilder Node JS SDK v3.13.1 with added proxy setting and log functions.

### To add the proxy settings on ChatConnector init
```javascript
// Create bot and add dialogs
var connector = new builder.ChatConnector({
    appId: "YourAppId",
    appPassword: "YourAppSecret",
	//proxy settings
	proxy:<your_proxy_url>
});
```

### To add logging function function on get state data and save state data
Pass a function which will accept an object with below schema
```javascript
{
  operationName: <'StateAPIGetData' | 'StateAPISaveData' | 'StateAPISaveDataGZip' | 'StateAPIInitialize'>,
  requestTime: <request_sent_timestamp>,
  responseTime: <response_received_timestamp>,
  apiEndpoint: <accountName/$tableName>,
  errorMessage: <error_message>
}
```

In your botbuilder connector initialization pass the function as one of the property(optional)
```javascript
var func = function(logObject){
  //do your logging operation here based on the above schema
};

// Create bot and add dialogs
var connector = new builder.ChatConnector({
    appId: "YourAppId",
    appPassword: "YourAppSecret",
	//proxy settings
	proxy:<your_proxy_url>,
  logFunc:func
});
```

Original BotBuilder SDK
https://github.com/Microsoft/BotBuilder
