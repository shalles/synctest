(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

/**
 * 移动端测试同步命令库
 */
class Callbacks {
    constructor() {
        this.list = [];
    }
    // Add a callback or a collection of callbacks to the list
    add(fn) {
        if (typeof fn === 'function') {
            this.list.push(fn);
        }
        else if (Array.isArray(fn)) {
            for (let i = 0; i < fn.length; i++) {
                this.add(fn[i]);
            }
        }
        return this;
    }
    // Call all callbacks with the given context and arguments
    fireWith(context, args) {
        const list = this.list;
        for (let i = 0; i < list.length; i++) {
            list[i].apply(context, args);
        }
        return this;
    }
    // Call all the callbacks with the given arguments
    fire(...args) {
        return this.fireWith(this, args);
    }
}
(function (window) {
    window.__synctest = {};
    const eventData = {};
    let eventID = 0;
    const eventDomID = 'synccommand_' + new Date().getTime();
    const notSendList = [{
            ele: ['window', 'document'],
            type: ['DOMContentLoaded', 'load']
        }];
    let wsServer = 'ws://{{ origin }}';
    const websocket = new WebSocket(wsServer);
    websocket.onopen = function (evt) {
        initDefaultEvent();
        console.log('[synctest start success]');
    };
    websocket.onclose = function (evt) {
        console.log('[synctest closed please check the server or refresh this page]');
    };
    websocket.onmessage = function (evt) {
        excuteCommand(parseCommand(evt.data));
    };
    websocket.onerror = function (evt) {
        console.log('[synctest closed please check the server or refresh this page]');
    };
    function classof(o) {
        return Object.prototype.toString.call(o).slice(8, -1);
    }
    function extend(...args) {
        const iterator = {
            stack: [],
            reset() {
                this.stack = [];
            },
            watch(co, cb) {
                if (this.stack.indexOf(co) > -1)
                    return;
                this.stack.push(co);
                cb();
            }
        };
        function copy(to, from, deep) {
            for (const i in from) {
                if (Object.prototype.hasOwnProperty.call(from, i)) {
                    const fi = from[i];
                    if (!deep) {
                        if (extendTest(fi, i)) {
                            to[i] = fi;
                        }
                    }
                    else {
                        const classFI = classof(fi);
                        const isArr = classFI === 'Array';
                        const isObj = classFI === 'Object' || inArray(classFI, ['Touch', 'TouchList']);
                        if (isArr || isObj) {
                            const tiC = classof(to[i]);
                            if (isArr && tiC !== 'Array') {
                                to[i] = [];
                            }
                            else if (!isArr && tiC !== 'Object') {
                                to[i] = {};
                            }
                            iterator.watch(fi, function () {
                                copy(to[i], fi, deep);
                            });
                        }
                        else {
                            if (extendTest(fi, i)) {
                                to[i] = fi;
                            }
                        }
                    }
                }
            }
        }
        let re;
        let len = arguments.length;
        let deep = false;
        let i = 0;
        let extendTest;
        if (arguments[i] === true) {
            deep = true;
            i++;
        }
        re = arguments[i++];
        const lastArgIndex = --len;
        extendTest = (typeof arguments[lastArgIndex] === 'function') ?
            arguments[lastArgIndex] :
            function (val) { return val !== undefined; };
        for (; i < len; i++) {
            try {
                copy(re, arguments[i], deep);
            }
            catch (e) {
                console.log('extend log: ', arguments[i]);
            }
        }
        return re;
    }
    function inArray(a, arr) {
        return arr.indexOf(a) > -1;
    }
    function inList(item, list) {
        for (const i in list) {
            if (inArray(item.ele, list[i].ele) && inArray(item.type, list[i].type)) {
                return true;
            }
        }
        return false;
    }
    function selectToUnique(ele) {
        const selectList = [];
        function select(ele) {
            if (!ele) {
                return selectList;
            }
            else if (ele === window) {
                selectList.push('window');
            }
            else if (ele === window.document) {
                selectList.push('document');
            }
            else if (ele === document.body) {
                selectList.push('body');
            }
            else {
                const element = ele;
                if (element.id) {
                    selectList.push('#' + element.id);
                    return selectList;
                }
                if (element.classList && element.classList.length) {
                    selectList.push('.' + element.classList.toString().split(' ').join('.'));
                }
                else {
                    selectList.push(element.tagName);
                }
                select(element.parentElement);
            }
        }
        select(ele);
        return selectList.reverse().join('>');
    }
    function throttlePlus(fn, delay, operatDelay) {
        let timer = null;
        let start = null;
        delay = operatDelay < delay ? delay : operatDelay;
        return function () {
            const self = this;
            const cur = new Date().getTime();
            const args = arguments;
            if (timer !== null) {
                clearTimeout(timer);
            }
            if (!start) {
                start = cur;
            }
            if (operatDelay <= cur - start) {
                fn.apply(self, args);
                start = cur;
            }
            else {
                timer = window.setTimeout(function () {
                    fn.apply(self, args);
                }, delay);
            }
        };
    }
    const throttleScroll = throttlePlus(function (self, e) {
        sendCommand(buildCommand(self, e));
    }, 150, 200);
    function parseCommand(command) {
        const cmd = JSON.parse(command);
        let ele;
        let listeners;
        const selector = cmd.selector;
        if (inList({ ele: selector, type: cmd.type }, notSendList)) {
            return { event: {}, type: '', ele: null, listeners: new Callbacks() };
        }
        if (selector === 'window') {
            ele = window;
        }
        else if (selector === 'document') {
            ele = document;
        }
        else {
            ele = document.querySelector(selector);
        }
        if (!ele) {
            return { event: {}, type: '', ele: null, listeners: new Callbacks() };
        }
        try {
            const target = ele;
            listeners = eventData[target[eventDomID]] && eventData[target[eventDomID]][cmd.type]
                ? eventData[target[eventDomID]][cmd.type]
                : new Callbacks();
        }
        catch (e) {
            listeners = new Callbacks();
        }
        switch (cmd.type) {
            case 'input':
                if (ele instanceof HTMLInputElement || ele instanceof HTMLTextAreaElement) {
                    ele.value = cmd.value || '';
                }
                break;
            case 'focus':
                if (ele instanceof HTMLElement) {
                    ele.focus();
                }
                break;
            case 'scroll':
                if ('scrollTop' in ele) {
                    const scrollable = ele;
                    scrollable.scrollTop = cmd.scrollTop || 0;
                    scrollable.scrollLeft = cmd.scrollLeft || 0;
                }
                else {
                    window.scrollTo(cmd.scrollLeft || 0, cmd.scrollTop || 0);
                }
                break;
            case 'click':
                if (ele instanceof HTMLAnchorElement) {
                    if (ele.href.indexOf('javascript') === -1) {
                        location.href = ele.href;
                    }
                }
                break;
            default:
                break;
        }
        if (ele instanceof HTMLInputElement) {
            ele.value = cmd.value || '';
        }
        console.log('parse:\t', cmd);
        if (cmd.type.indexOf('touch') > -1 && cmd.event && cmd.event['changedTouches']) {
            const touchObj = cmd.event['changedTouches'];
            if (touchObj) {
                touchObj.item = function (i) {
                    return touchObj[i];
                };
                cmd.event['targetTouches'] = cmd.event['touches'] = touchObj;
            }
        }
        return {
            event: cmd.event || {},
            type: cmd.type,
            ele,
            listeners
        };
    }
    function buildCommand(self, e) {
        const ele = self;
        const selector = selectToUnique(ele);
        const command = {
            selector,
            type: e.type
        };
        switch (e.type) {
            case 'input':
                if (ele instanceof HTMLInputElement || ele instanceof HTMLTextAreaElement) {
                    command.value = ele.value;
                }
                break;
            case 'scroll':
                if ('scrollTop' in ele) {
                    const scrollable = ele;
                    command.scrollTop = scrollable.scrollTop;
                    command.scrollLeft = scrollable.scrollLeft;
                }
                else {
                    command.scrollTop = window.scrollY;
                    command.scrollLeft = window.scrollX;
                }
                break;
            default:
                break;
        }
        command.event = {};
        command.dom = [];
        function callback(val, i) {
            if ((val instanceof Node) || val === window) {
                if (!/[0-9]/.test(i)) {
                    command.dom.push({ name: i, selector: selectToUnique(e[i]) });
                }
            }
            else if (typeof val === 'function' || /[A-Z]/.test(i[0])) {
                // Skip functions and properties with uppercase first letter
            }
            else {
                command.event[i] = val;
                return true;
            }
            return false;
        }
        extend(command.event, e, callback, true);
        console.log('build:\t', e, command.event);
        console.log('build JSON:\t', JSON.stringify(command));
        return JSON.stringify(command);
    }
    function sendCommand(command) {
        if (command !== '' && websocket.readyState === 1) {
            websocket.send(command);
        }
    }
    function excuteCommand(command) {
        const { ele, listeners } = command;
        if (!ele)
            return;
        const type = '__synctest_event';
        const event = new Event(type);
        const listener = function (e) {
            extend(e, command.event);
            console.log('new event:\t', e);
            e.preventDefault();
            listeners && listeners.fire(e);
        };
        originAddEventListener.call(ele, type, listener, false);
        ele.dispatchEvent(event);
        ele.removeEventListener(type, listener);
    }
    let originAddEventListener;
    let windowOriginAddEventListener;
    let nodeOriginAddEventListener;
    if ('EventTarget' in window) {
        originAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = __addEventListener;
    }
    else {
        windowOriginAddEventListener = Window.prototype.addEventListener;
        nodeOriginAddEventListener = Node.prototype.addEventListener;
        originAddEventListener = function (type, listener, useCapture) {
            const addEvent = this instanceof Window && windowOriginAddEventListener
                ? windowOriginAddEventListener
                : nodeOriginAddEventListener;
            if (addEvent) {
                addEvent.call(this, type, listener, useCapture);
            }
        };
        if (Window.prototype.addEventListener) {
            Window.prototype.addEventListener = __addEventListener;
        }
        if (Node.prototype.addEventListener) {
            Node.prototype.addEventListener = __addEventListener;
        }
    }
    function __addEventListener(type, listener, useCapture) {
        const self = this;
        if (!self[eventDomID]) {
            self[eventDomID] = ++eventID;
        }
        const eventId = self[eventDomID];
        if (!eventData[eventId]) {
            eventData[eventId] = {};
        }
        if (!eventData[eventId][type]) {
            eventData[eventId][type] = new Callbacks();
        }
        eventData[eventId][type].add(function (e) {
            if (typeof listener === 'function') {
                listener.call(self, e);
            }
            else if (listener && typeof listener.handleEvent === 'function') {
                listener.handleEvent(e);
            }
        });
        const callback = function (e) {
            try {
                if (e.type === 'scroll2') {
                    throttleScroll(this, e);
                }
                else {
                    sendCommand(buildCommand(this, e));
                }
            }
            catch (err) {
                console.log(err);
            }
            if (typeof listener === 'function') {
                listener.call(this, e);
            }
            else if (listener && typeof listener.handleEvent === 'function') {
                listener.handleEvent(e);
            }
        };
        originAddEventListener.call(self, type, callback, useCapture);
    }
    function rewriteDefaultEventListener(target, evt) {
        target.addEventListener(evt, function (e) {
            console.log(evt, e);
        }, false);
    }
    function rewriteDefaultEventListenerTargetList(tgtList, evt) {
        for (let i = 0, len = tgtList.length; i < len; i++) {
            rewriteDefaultEventListener(tgtList[i], evt);
        }
    }
    function rewriteDefaultEventListenerEventList(target, evtList) {
        for (let i = 0, len = evtList.length; i < len; i++) {
            rewriteDefaultEventListener(target, evtList[i]);
        }
    }
    function rewriteDefaultEventListenerList(tgtList, evtList) {
        for (let i = 0, len = tgtList.length; i < len; i++) {
            rewriteDefaultEventListenerEventList(tgtList[i], evtList);
        }
    }
    function initDefaultEvent() {
        rewriteDefaultEventListenerEventList(window, ['scroll', 'resize']);
        const linkList = document.querySelectorAll('a');
        if (linkList.length) {
            rewriteDefaultEventListenerTargetList(linkList, 'click');
        }
        const inputs = document.querySelectorAll('input');
        const textarea = document.querySelectorAll('textarea');
        if (inputs.length) {
            rewriteDefaultEventListenerList(inputs, ['input', 'focus']);
        }
        if (textarea.length) {
            rewriteDefaultEventListenerList(textarea, ['input', 'focus']);
        }
    }
})(window);

/******/ 	return __webpack_exports__;
/******/ })()
;
});