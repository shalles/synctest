# synctest

同步多个设备之间的web页面操作

[home page](http://shalles.github.io/synctest/)

### Contribute code

作为[servermock](https://github.com/shalles/servermock/blob/master/README.md)插件使用,[安装及使用详情参见servermock](https://www.npmjs.com/package/servermock)

**主要实现原理**<br>

1. 监听页面的事件->编辑事件信息;<br>
2. 用servermock提供的websocket功能将编辑的事件信息广播到链接的其他设备的打开的页面监听client端;<br>
3. 在接收到事件信息后解析并重构事件;<br>
4. 触发该事件;<br>
5. 循环

```js
(function(window){
    /**********************初始化区**********************/
    //广播服务端由servermock实现
    websocket.onopen = function(evt) {
        initDefaultEvent();
    };
    websocket.onmessage = function(evt) {
        excuteCommand(parseCommand(evt.data));
    };
    /******************实用工具类/方法区*******************/
    function Callbacks(options) {}

    function extend(){}

    function throttlePlus(fn, delay, operatDelay) {}
    
    /******************主要实现逻辑方法区*******************/
    function parseCommand(command) {}

    function buildCommand(self, e) {}

    function sendCommand(command) {} //websocket send

    function excuteCommand(command) {}
    
    /*********************重写功能区**********************/
    function __addEventListener(type, listener, useCapture) {
        var self = this;
        
        //重写时间监听 存储时间listener 便于接收到server的广播后重构还原事件
        self[eventDomID] || (self[eventDomID] = ++eventID);

        ((eventData[eventID] || (eventData[eventID] = {}))[type] ||
            (eventData[eventID][type] = new Callbacks())).add(
            function(e) {
                // e.preventDefault();
                
                listener.call(self, e);
            }
        );
        //重写时间监听 编辑事件并发送 server端接收到后广播给其他设备上的页面监听者
        var callback = function(e) {
            try{
                (e.type === 'scroll2') ?
                    throttleScroll(this, e):
                    sendCommand(buildCommand(this, e));
            } catch(err){
                console.log(err);
            }
            listener.call(this, e);
        }

        originAddEventListener.call(self, type, callback, useCapture);
    }

    function rewriteDefaultEventListener(target, evt) {}

    function rewriteDefaultEventListenerTargetList(tgtList, evt) {}

    function rewriteDefaultEventListenerEventList(target, evtList) {}

    function rewriteDefaultEventListenerList(tgtList, evtList) {}
    
    function initDefaultEvent(){}
})(window);

```

要使用[servermock](https://www.npmjs.com/package/servermock)的websocket广播需要配置[servermock](https://www.npmjs.com/package/servermock)的插件参数

**package.json**

```json
    "servermock": {
        "type": "content",
        "websocket": {
            "open": true,
            "maxsize": 10240,
            "encoding": "utf8",
            "originReg": "",
            "sameOrigin": true,
            "broadcast": true,
            "mTm": false
        }
    },
```


#### 有两种使用方式

**`方式一`** 配置[servermock](https://github.com/shalles/servermock/blob/master/README.md)的sm.config文件，添加synctest插件参数，然后启动servermock即可；

**index.js plugin.excute的实现**

```js
plugin.excute = function (parmas){
    
    if(utils.inArray(parmas.ext, acceptExtname)){
        console.log('[synctest loading]');
        var syncCommandTop = utils.readFile(path.join(__dirname, './lib/synccomm_top.min.js'));

        syncCommandTop = utils.simpleTemplate(syncCommandTop, origin);
        parmas.cnt = parmas.cnt.replace(/<head>/, '<head>\n<meta charset="UTF-8">\n<script>' + syncCommandTop + '</script>');

        return parmas.cnt;
    }
}
```

**`方式二`** 可以看到上面index.js plugin.excute的实现只是将`synccomm_top.min.js`的代码查到页面的`<head>`元素的最顶端；也就是可以直接在非servermock启动服务下的静态页面下引入`synccomm_top.min.js`或非压缩版`synccomm_top.js`并启动servermock配置相同的server

```js
var wsServer = 'ws://{{ origin }}'
```

**如lib中的 synctest_out.min.js**
```js
/**
 * servermock synctest plugin 多平台同步测试：实现操作一个平台多个平台同步事件操作
 * version 1.0.2
 * @param  {[type]} synctest_origin server synctest监听的websocket源 默认"127.0.0.1:80"
 */
function synctest__(synctest_origin){
//压缩后的synctest.js
function(a){function h(a){... 
}
```