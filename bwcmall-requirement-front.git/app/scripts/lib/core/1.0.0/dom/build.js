/**
 * DOM utility for parse node collection by html or original dom.
 *
 * @module core/dom/build
 */

'use strict';

var document = window.document;

var $ = require('jquery');

var buildDom = function(sHTML, selectorMap, flatNodeList) {
    var isHTML = ((typeof sHTML) === 'string'), container = sHTML;

    if (flatNodeList === undefined) { // Defaults to flat
        flatNodeList = true;
    }

    if (isHTML) {
        container = document.createElement('div');
        container.innerHTML = sHTML;
    }

    var domList, nodes, key;
    if (selectorMap) {
        for (key in selectorMap) {
            domList[key] = $(selectorMap[key].toString(), container);
        }
    }
    else {
        domList = {};
        nodes = $('[node-type]', container);
        for (var i = -1, len = nodes.length, el; ++i < len; ) {
            el = nodes[i];
            key = el.getAttribute('node-type');
            if (flatNodeList) {
                if (!domList[key]) {
                    domList[key] = el;
                }
            } else {
                if (!domList[key]) {
                    domList[key] = $(el);
                } else {
                    domList[key] = domList[key].add(el);
                }
            }
        }
    }

    var domBox = sHTML, el;

    if (isHTML) {
        domBox = document.createDocumentFragment();
        while (el = container.firsChild) {
            domBox.appendChild(el);
        }
    }

    return {
        'box': domBox,
        'list': domList
    };
};

module.exports = {
    /**
     * Build a html string or html elements with returns of {box, list}
     *
     * @method build
     *
     * @param {HtmlElement|String} el The container element or html string.
     * @param {Object} selectorMap (Optional) set the selectors instead of `node-type`.
     * @param {Boolean} flatNodeList (Optional) `false` to return all matched node list.
     *
     * @return {Object} build result with box and node list. {box, list}
     */
    build: buildDom,

    /**
     * Parse a HTMLElement for attributes `[node-type]` of selector mapping.
     *
     * @method parse
     *
     * @param {HtmlElement} el The container element.
     * @param {Object} selectorMap (Optional) set the selectors instead of `node-type`.
     * @param {Boolean} flatNodeList (Optional) `false` to return all matched node list.
     *
     * @return {Object} Returns a object with node mappings.
     */
    parse: function(el, selectorMap, flatNodeList) {
        if (el && el instanceof $) {
            el = el[0];
        }

        if (!el || el.nodeType !== 1) {
            throw Error('parse error, not a valid html element');
        }

        // shift arguments if selectorMap argument was omitted
        if (typeof selectorMap === 'boolean') {
            flatNodeList = selectorMap;
            selectorMap = null;
        }

        var builder = buildDom(el, selectorMap, flatNodeList);
        return builder.list;
    }
};