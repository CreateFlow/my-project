/**
 * Delegator - A DOM event delegation manager based on dom attribute named with
 * `node-type`, Useful for component constructor with dom event attach/detaches.
 *
 *
 * @example
 *
 * ```js
 *   n.innerHTML = '<div id="outer"><a href="#" action-type="alert" action-data="test=123">test</a><div id="inner"><span action-type="cancel">cancel</span></div></div>';
 *   var a = Delegator($('#outer'));
 *   a.on('click', 'alert', function(spec) {
 *      console.log(spec.data.test);
 *   });
 *   a.on('cancel', function(e) { // defaults delegate to click
 *      console.log(e);
 *   });
 * ```
 */

'use strict'

var $ = require('jquery');
var EventEmitter = require('../event/emitter');

var rnotwhite = (/\S+/g)
  , _seed = -1
  , _expando = (+new Date).toString(36)
  , guid = function() { return _expando + ++_seed }
  , proxy = function(fn, scope) {
      var id = fn.guid || (fn.guid = guid())
      var f = function(e) { return fn.call(scope || e.currentTarget, e) };
      f.guid = id;
      return f;
  }

// DOM delegator based on dom attribute named with `node-type`
var Delegator = function(box, opts) {
    opts = opts || {}

    if (typeof box === 'string') {
        box = $(box)[0];
    }

    var self = {}
      , eventTypes = {}
      , emitter = new EventEmitter()
      , delegateContext = opts.context

    // Delegate handler
    var handleDelegate = function(e) {
        var $el = $(e.currentTarget)
          , action
          , type
          , data
          , result
          , filter = opts.onDelegate

        // stop delegate bubbles
        if (e.isPropagationStopped()) return;

        if ( !$el.attr('disabled') && (action = $el.attr('action-type')) ) {

            data = $el.attr('action-data');

            // Provide action name and data to action handlers
            e.action = action;
            e.data = data;
            result = emitter.emit(e.type + '.' + action, e);

            // Update event object with action result value.
            e.actionValue = result;

            if (result === false) {
                e.preventDefault();
                e.stopPropagation();
            }
        }

        if (typeof filter === 'function') {
            filter(e);
        }

        return result;
    };

    /** Api for accessible to box DOM element */
    self.box = box;

    /**
     * Register event delegation.
     *
     * @method delegate
     *
     * @param {String} type (Optional) set the event name to delegate. defaults to `click` event.
     * @param {String} action The action name to identify delegate type.
     * @param {Function} fn the delegate event handler.
     *
     * @return {Delegator} The delegator instance.
     */
    self.on = function(type, action, fn) {
        // shift arguments if action argument was omitted
        // set type defaults to `click` event
        if (typeof action === 'function') {
            fn = action;
            action = type;
            type = 'click';
        }

        if (typeof fn !== 'function')
            throw Error('The delegate handler should be a valid function');

        // Handle multiple actions separated by a space
        action = ( action || '' ).match(rnotwhite) || [];
        var t = action.length;
        while (t--) {
            if (!eventTypes[type]) {
                eventTypes[type] = 1;
                $(box).on(type, '[action-type]', handleDelegate);
            }
            emitter.on(type + '.' + action[t], proxy(fn, delegateContext));
        }

        return this;
    }

    /**
     * Detach action event handler been delegated.
     *
     * @method undelegate
     *
     * @param {String} type The target event been delegated.
     * @param {String} action The target action name to detach.
     * @param {Function} fn The specific action handler to detach.
     */
    self.un = function(type, action, fn) {
        if (typeof action === 'function' || !action) {
            fn = action;
            action = type;
            type = 'click';
        }
        action = ( action || '' ).match(rnotwhite) || [];
        var t = action.length;
        while (t--) {
            emitter.un(type + '.' + action[t], fn);
        }
        return this;
    }

    /**
     * Trigger action event handler manually. The event type defaults to `click`
     *
     * @param {String} type (Optional) event type, this value to be action name
     *                  if action not provided.
     * @param {String} action The action name to trigger.
     */
    self.fire = function(type, action) {
        if (!action) {
            action = type;
            type = 'click';
        }
        emitter.emit(type + '.' + action);
    }

    self.destroy = function() {
        var $box = $(box)
        $.each(eventTypes, function(k, v) {
            delete eventTypes[k];
            $box.off(k, '[action-type]', handleDelegate);
        });
        emitter.un();
        for (var k in self) {
            delete self[k]
        }
        emitter = undefined;
        opts = undefined;
        eventTypes = $box = box = undefined;
    }

    return self;
};

module.exports = Delegator;