# Bot Builder Node SDK with proxy

This is a modified version of BotBuilder Node JS SDK v3.13.1 with added proxy settings.

To add the proxy settings on ChatConnector init
```javascript
// Create bot and add dialogs
var connector = new builder.ChatConnector({
    appId: "YourAppId",
    appPassword: "YourAppSecret",
	//proxy settings
	proxy:<your_proxy_url>
});
```

Original BotBuilder SDK
https://github.com/Microsoft/BotBuilder
