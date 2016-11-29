/**
 * CSS style utility for css effects enhancements
 */

'use strict';

var $ = require('jquery')
  , util = require('./util')
  , forEach = util.each
  , setImmediate = util.setImmediate
  , cssPrefix = getCssPrefix()
  , rPrefix = /\-v\-/g
  , styleEl = document.getElementsByTagName('head')[0].appendChild(createElement('style'))
  , styleSheet = styleEl.sheet || styleEl.styleSheet
  , bootCSS = {
      '.ui-animated': '-v-animation-fill-mode: both;',
      '.ui-animated.ui-speed-normal': '-v-animation-duration: 0.5s;',
      '.ui-animated.ui-speed-fast': '-v-animation-duration: 0.2s;',
      '.ui-animated.ui-speed-slow': '-v-animation-duration: 1s;'
    }
  , eAnimationEnd = {
      '-webkit-': 'webkitAnimationEnd',
      '-moz-': 'animationend',
      '-o-': 'OAnimationEnd',
      '-ms-': 'msAnimationEnd',
      '': 'animationend'
    }[cssPrefix]

function createElement(tag) {
  return $('<' + tag + '/>')[0];
}

function addStyleRule(sheet, k, v) {
  sheet.insertRule ?
    sheet.insertRule(k + ' {' + v + '}', 0) :
    sheet.addRule(k, v, 1)
}

// Helper for CSS DOM vendor detection, eg. Webkit -> WebkitTransition
function getVendorPrefix() {
  var body, i, style, transition, vendor, result = false;
  body = document.body || document.documentElement;
  style = body.style;
  transition = 'Transition';
  vendor = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
  i = 0;
  while (i < vendor.length) {
    if (style[vendor[i] + transition] !== undefined) {
      result = vendor[i];
      break;
    }
    i++;
  }
  getVendorPrefix = function() { return result };
  return result;
}

// Helper for css style prefix detection, eg. -webkit-
function getCssPrefix() {
  var vendor = getVendorPrefix();
  return vendor ? '-v-'.replace('v', vendor.toLowerCase()) : '';
}

function parseSpeed(n) {
  return typeof n == 'number' ? n : {
    fast: 200,
    normal: 500,
    slow: 1e3
  }[n] || 500
}

function effect(el, animate, speed, callback, sync) {
  function onEnd(e) {
    if (onEnd.done) return;
    onEnd.done = true;
    $el.off(eAnimationEnd, onEnd);
    clearTimeout(timer);
    $el.removeClass(classes)
    callback && callback()
  }
  var timer, classes, $el = $(el), args = arguments, sync = typeof args[args.length - 1] === 'boolean' ? args[args.length - 1] : false;
  if (typeof speed == 'function') {
    callback = speed
    speed = undefined
  }
  if (!cssPrefix) {
    setImmediate(function() { callback && callback() });
  } else {
    speed = speed || 'normal';
    animate = animate || 'shake';
    classes = [ 'ui-animated', 'ui-speed-' + speed, 'ui-ani-' + animate ].join(' ');
    $el.on(eAnimationEnd, onEnd);
    timer = setTimeout(onEnd, parseSpeed(speed) + 100);
    if (sync === true) setImmediate(function() {
      $el.addClass(classes);
    })
    else $el.addClass(classes);
  }
}

// Setup global styles on bootstrap
util.each(bootCSS, function(v, k) {
  if (v) {
    addStyleRule(styleSheet, k, v.replace(rPrefix, cssPrefix))
  }
})

exports.effect = effect;
