(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var xtend = require('xtend');

module.exports = function(timeout) {
    return new Idle({ timeout: timeout });
};

// default settings
var defaults = {
    //start as soon as timer is set up
    start: true,
    // timer is enabled
    enabled: true,
    // amount of time before timer fires
    timeout: 30000,
    // what element to attach to
    element: document,
    // activity is one of these events
    events: 'mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove'
};

var Idle = function(opt) {
    var self = this;

    self.opt = xtend(defaults, opt);
    self.element = self.opt.element;

    self.state = {
        idle: self.opt.idle,
        timeout: self.opt.timeout,
        enabled: self.opt.enabled,
        idle_fn: [],
        active_fn: []
    };

    // wrapper to pass state to toggleState
    self.state.state_fn = function() {
        toggleState(self.state);
    };

    if (self.opt.start) {
        self.start();
    }
};

var proto = Idle.prototype;

proto.start = function() {
    var self = this;
    var state = self.state;
    var element = self.element;

    function handler(ev) {
        // clear any current timouet
        clearTimeout(state.timer_id);

        if (!state.enabled) {
            return;
        }

        if (state.idle) {
            toggleState(state);
        }

        state.timer_id = setTimeout(state.state_fn, state.timeout);
    }

    // to remove later
    state.handler = handler;

    var events = this.opt.events.split(' ');
    for (var i=0 ; i<events.length ; ++i) {
        var event = events[i];
        attach(element, event, handler);
    }

    state.timer_id = setTimeout(self.state.state_fn, state.timeout);
};

// 'idle' | 'active'
proto.on = function(what, fn) {

    var self = this;
    var state = self.state;

    if (what === 'idle') {
        state.idle_fn.push(fn);
    }
    else {
        state.active_fn.push(fn);
    }
};

proto.getElapsed = function() {
    return ( +new Date() ) - this.state.olddate;
};

// Stops the idle timer. This removes appropriate event handlers
// and cancels any pending timeouts.
proto.stop = function() {
    var self = this;
    var state = this.state;
    var element = self.element;

    state.enabled = false;

    //clear any pending timeouts
    clearTimeout(state.timer_id);

    // detach handlers
    var events = this.opt.events.split(' ');
    for (var i=0 ; i<events.length ; ++i) {
        var event = events[i];
        detach(element, event, state.handler);
    }
};

/// private api

// Toggles the idle state and fires an appropriate event.
// borrowed from jquery-idletimer (see readme for link)
function toggleState(state) {
    // toggle the state
    state.idle = !state.idle;

    // reset timeout
    var elapsed = ( +new Date() ) - state.olddate;
    state.olddate = +new Date();

    // handle Chrome always triggering idle after js alert or comfirm popup
    if (state.idle && (elapsed < state.timeout)) {
        state.idle = false;
        clearTimeout(state.timer_id);
        if (state.enabled) {
            state.timer_id = setTimeout(state.state_fn, state.timeout);
        }
        return;
    }

    // fire event
    var event = state.idle ? 'idle' : 'active';

    var fns = (event === 'idle') ? state.idle_fn : state.active_fn;
    for (var i=0 ; i<fns.length ; ++i) {
        fns[i]();
    }
}

// TODO (shtylman) detect at startup to avoid if during runtime?
var attach = function(element, event, fn) {
    if (element.addEventListener) {
        element.addEventListener(event, fn, false);
    }
    else if (element.attachEvent) {
        element.attachEvent('on' + event, fn);
    }
};

var detach = function(element, event, fn) {
    if (element.removeEventListener) {
        element.removeEventListener(event, fn, false);
    }
    else if (element.detachEvent) {
        element.detachEvent('on' + event, fn);
    }
};


},{"xtend":2}],2:[function(require,module,exports){
var Keys = Object.keys || objectKeys

module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        if (!isObject(source)) {
            continue
        }

        var keys = Keys(source)

        for (var j = 0; j < keys.length; j++) {
            var name = keys[j]
            target[name] = source[name]
        }
    }

    return target
}

function objectKeys(obj) {
    var keys = []
    for (var k in obj) {
        keys.push(k)
    }
    return keys
}

function isObject(obj) {
    return obj !== null && typeof obj === "object"
}

},{}],3:[function(require,module,exports){
var away = require('away');
// detect users who are idle for 10 seconds
var timer = away(10000);
timer.on('idle', function() {
    console.log('user is idle');
});
timer.on('active', function() {
    console.log('user is active');
});
},{"away":1}]},{},[3]);
