/**
 * A custom event mechanism implementation inspired by nodejs EventEmitter and
 * backbone.Events
 *
 * <code><pre>
 *  var EventEmitter = require('lib/core/1.0.0/event/emitter')
 *  var object = new EventEmitter();
 *  object.on('expand', function(){ alert('expanded'); });
 *  object.emit('expand');
 * </pre></code>
 *
 * @module core/event/emitter
 */

'use strict';

// EventEmitter
//
// -----------------
// Thanks to:
//  - https://github.com/documentcloud/backbone/blob/master/backbone.js
//  - https://github.com/joyent/node/blob/master/lib/events.js

// Regular expression used to split event strings
var eventSplitter = /\s+/;

// guid seed for callback guid generator
var guid = 0xffff;

// Support two styles of arguments provided to the event subscribers.
//
// - The NORMAL type returns the original args passed to emit.
// - The FLAT type returns two parameters: the event source object and the the array
// of args passed to emit.
var MODE_NORAML = 0x01;
var MODE_FLAT   = 0x02;

// A module that can be mixed in to *any object* in order to provide it
// with custom events. You may bind with `on` or remove with `un` callback
// functions to an event; `emit`-ing an event fires all callbacks in
// succession.
//
//     var object = new EventEmitter();
//     object.on('expand', function(){ alert('expanded'); });
//     object.emit('expand');
//
function EventEmitter() {
}

var __proto__ = EventEmitter.prototype

// Bind one or more space separated events, `events`, to a `callback`
// function. Passing `"all"` will bind the callback to all events fired.
// Provider single listener binding if the 4th argument [`single`] is true.
__proto__.addListener = function(events, callback, context, single) {
  var cache, event, list, mode = MODE_NORAML

  // Impl event listerner interface in DOM Level 2
  if (callback && typeof callback === 'object') {
      context = callback
      callback = context.handleEvent
      mode = MODE_FLAT
  }

  if (!callback) return this

  cache = this._events || (this._events = {})
  events = events.split(eventSplitter)

  while (event = events.shift()) {
    list = !single && cache[event] || (cache[event] = [])
    list.push(callback, {ctx: context, mode: mode})
  }

  return this
}

__proto__.on = __proto__.addListener

__proto__.once = function(events, callback, context) {
  var self = this
  var fired = false;
  var cb = function() {
    self.un(events, cb)
    if (!fired) {
      fired = true;
      callback.apply(context || self, arguments)
    }
  }

  // Use same guid so caller can remove using callback
  cb.guid = callback.guid || ( callback.guid = guid++ );
  return this.on(events, cb, context)
}

// Remove one or many callbacks. If `context` is null, removes all callbacks
// with that function. If `callback` is null, removes all callbacks for the
// event. If `events` is null, removes all bound callbacks for all events.
__proto__.removeListener = function(events, callback, context) {
  var cache, event, list, i

  if (callback && typeof callback === 'object') {
      context = callback
      callback = context.handleEvent
  }

  // No events, or removing *all* events.
  if (!(cache = this._events)) return this
  if (!(events || callback || context)) {
    delete this._events
    return this
  }

  events = events ? events.split(eventSplitter) : keys(cache)

  // Loop through the callback list, splicing where appropriate.
  while (event = events.shift()) {
    list = cache[event]
    if (!list) continue

    if (!(callback || context)) {
      delete cache[event]
      continue
    }

    for (i = list.length - 2; i >= 0; i -= 2) {
      if (!(callback && (list[i] !== callback && list[i].guid !== callback.guid) ||
          context && list[i + 1].ctx !== context)) {
        list.splice(i, 2)
      }
    }
  }

  return this
}

__proto__.un = __proto__.removeListener

__proto__.removeAllListeners = function(type) {
  return this.removeListener(type)
}

// Trigger one or many events, firing all bound callbacks. Callbacks are
// passed the same arguments as `emit` is, apart from the event name
// (unless you're listening on `"all"`, which will cause your callback to
// receive the true name of the event as the first argument).
__proto__.emit = function(events) {
  var cache, event, all, list, i, len, rest = [], args, returned = true;
  if (!(cache = this._events)) return this

  events = events.split(eventSplitter)

  // Fill up `rest` with the callback arguments.  Since we're only copying
  // the tail of `arguments`, a loop is much faster than Array#slice.
  for (i = 1, len = arguments.length; i < len; i++) {
    rest[i - 1] = arguments[i]
  }

  // For each event, walk through the list of callbacks twice, first to
  // emit the event, then to emit any `"all"` callbacks.
  while (event = events.shift()) {
    // Copy callback lists to prevent modification.
    if (all = cache.all) all = all.slice()
    if (list = cache[event]) list = list.slice()

    // Execute event callbacks except one named "all"
    if (event !== 'all') {
      returned = triggerEventEmitter(event, list, rest, this) && returned
    }

    // Execute "all" callbacks.
    returned = triggerEventEmitter(event, all, [event].concat(rest), this) && returned
  }

  return returned
}


// Helpers
// -------

var keys = Object.keys

if (!keys) {
  keys = function(o) {
    var result = []

    for (var name in o) {
      if (o.hasOwnProperty(name)) {
        result.push(name)
      }
    }
    return result
  }
}

var each = function(o, fn) {
    o.forEach ? o.forEach(fn) : (function(o) {
        for (var i = -1, l = o.length; ++i < l; ) fn(o[i], i)
    }(o))
};

// Mix `EventEmitter` to object instance or Class function.
EventEmitter.applyTo = function(receiver) {
  var proto = __proto__

  if (isFunction(receiver)) {
    for (var key in proto) {
      if (proto.hasOwnProperty(key)) {
        receiver.prototype[key] = proto[key]
      }
    }
    each(keys(proto), function(key) {
      receiver.prototype[key] = proto[key]
    })
  }
  else {
    for (var key in proto) {
      if (proto.hasOwnProperty(key)) {
        copyProto(key)
      }
    }
  }

  function copyProto(key, scope) {
    receiver[key] = function() {
      var v = proto[key].apply(scope || receiver, Array.prototype.slice.call(arguments))
      return v === scope ? this : v
    }
  }
}

function triggerEventEmitter(type, list, args, context) {
  var pass = true
  if (list) {
    var i = 0, l = list.length, opt, ctx, eventObj= {type: type, timeStamp: +new Date}
    for (; i < l; i += 2) {
      opt = list[i + 1]
      ctx = opt.ctx || context
      if (opt.mode === MODE_FLAT)
        pass = list[i].call(ctx, eventObj, args) !== false && pass
      else
        pass = list[i].apply(ctx, args) !== false && pass
    }
  }
  // trigger will return false if one of the callbacks return false
  return pass;
}

function isFunction(func) {
  return Object.prototype.toString.call(func) === '[object Function]'
}

module.exports = EventEmitter