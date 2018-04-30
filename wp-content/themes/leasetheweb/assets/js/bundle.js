(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * css-vars-ponyfill
 * v1.2.2
 * https://github.com/jhildenbiddle/css-vars-ponyfill
 * (c) 2018 John Hildenbiddle <http://hildenbiddle.com>
 * MIT license
 */
(function(global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global.cssVars = factory();
})(this, function() {
    "use strict";
    /*!
 * get-css-data
 * v1.1.1
 * https://github.com/jhildenbiddle/get-css-data
 * (c) 2018 John Hildenbiddle <http://hildenbiddle.com>
 * MIT license
 */    function getUrls(urls) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var settings = {
            mimeType: options.mimeType || null,
            onComplete: options.onComplete || Function.prototype,
            onError: options.onError || Function.prototype,
            onSuccess: options.onSuccess || Function.prototype
        };
        var urlArray = Array.isArray(urls) ? urls : [ urls ];
        var urlQueue = Array.apply(null, Array(urlArray.length)).map(function(x) {
            return null;
        });
        function onError(xhr, urlIndex) {
            settings.onError(xhr, urlArray[urlIndex], urlIndex);
        }
        function onSuccess(responseText, urlIndex) {
            urlQueue[urlIndex] = responseText;
            settings.onSuccess(responseText, urlArray[urlIndex], urlIndex);
            if (urlQueue.indexOf(null) === -1) {
                settings.onComplete(urlQueue);
            }
        }
        urlArray.forEach(function(url, i) {
            var parser = document.createElement("a");
            parser.setAttribute("href", url);
            parser.href = parser.href;
            var isCrossDomain = parser.host !== location.host;
            var isSameProtocol = parser.protocol === location.protocol;
            if (isCrossDomain && typeof XDomainRequest !== "undefined") {
                if (isSameProtocol) {
                    var xdr = new XDomainRequest();
                    xdr.open("GET", url);
                    xdr.timeout = 0;
                    xdr.onprogress = Function.prototype;
                    xdr.ontimeout = Function.prototype;
                    xdr.onload = function() {
                        onSuccess(xdr.responseText, i);
                    };
                    xdr.onerror = function(err) {
                        onError(xdr, i);
                    };
                    setTimeout(function() {
                        xdr.send();
                    }, 0);
                } else {
                    console.log("Internet Explorer 9 Cross-Origin (CORS) requests must use the same protocol");
                    onError(null, i);
                }
            } else {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                if (settings.mimeType && xhr.overrideMimeType) {
                    xhr.overrideMimeType(settings.mimeType);
                }
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            onSuccess(xhr.responseText, i);
                        } else {
                            onError(xhr, i);
                        }
                    }
                };
                xhr.send();
            }
        });
    }
    /**
 * Gets CSS data from <style> and <link> nodes (including @imports), then
 * returns data in order processed by DOM. Allows specifying nodes to
 * include/exclude and filtering CSS data using RegEx.
 *
 * @preserve
 * @param {object} [options={}] - The options object
 * @param {string} options.include - CSS selector matching <link> and <style>
 * nodes to include
 * @param {string} options.exclude - CSS selector matching <link> and <style>
 * nodes to exclude
 * @param {object} options.filter - Regular expression used to filter node CSS
 * data. Each block of CSS data is tested against the filter, and only matching
 * data is included.
 * @param {function} options.onComplete - Callback after all nodes have been
 * processed. Passes 1) concatenated CSS text, 2) an array of CSS text in DOM
 * order, and 3) an array of nodes in DOM order as arguments.
 * @param {function} options.onError - Callback on each error. Passes 1) the XHR
 * object for inspection, 2) soure node reference, and 3) the source URL that
 * failed (either a <link> href or an @import) as arguments
 * @param {function} options.onSuccess - Callback on each CSS node read. Passes
 * 1) CSS text, 2) source node reference, and 3) the source URL (either a <link>
 *    href or an import) as arguments.
 * @example
 *
 *   getCssData({
 *     include: 'style,link[rel="stylesheet"]', // default
 *     exclude: '[href="skip.css"]',
 *     filter : /red/,
 *     onComplete(cssText, cssArray) {
 *       // ...
 *     },
 *     onError(xhr, node, url) {
 *       // ...
 *     },
 *     onSuccess(cssText, node, url) {
 *       // ...
 *     }
 *   });
 */    function getCssData(options) {
        var regex = {
            cssComments: /\/\*[\s\S]+?\*\//g,
            cssImports: /(?:@import\s*)(?:url\(\s*)?(?:['"])([^'"]*)(?:['"])(?:\s*\))?(?:[^;]*;)/g
        };
        var settings = {
            include: options.include || 'style,link[rel="stylesheet"]',
            exclude: options.exclude || null,
            filter: options.filter || null,
            onComplete: options.onComplete || Function.prototype,
            onError: options.onError || Function.prototype,
            onSuccess: options.onSuccess || Function.prototype
        };
        var sourceNodes = Array.apply(null, document.querySelectorAll(settings.include)).filter(function(node) {
            return !matchesSelector(node, settings.exclude);
        });
        var cssArray = Array.apply(null, Array(sourceNodes.length)).map(function(x) {
            return null;
        });
        function handleComplete() {
            var isComplete = cssArray.indexOf(null) === -1;
            if (isComplete) {
                var cssText = cssArray.join("");
                settings.onComplete(cssText, cssArray, sourceNodes);
            }
        }
        function handleError(xhr, node, url, cssIndex) {
            var cssText = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";
            cssArray[cssIndex] = cssText;
            settings.onError(xhr, node, url);
            handleComplete();
        }
        function handleSuccess(cssText, cssIndex, node, sourceUrl, importUrl) {
            if (!settings.filter || settings.filter.test(cssText)) {
                var returnVal = settings.onSuccess(cssText, node, importUrl || sourceUrl);
                cssText = returnVal === false ? "" : returnVal || cssText;
                var importRules = cssText.replace(regex.cssComments, "").match(regex.cssImports);
                if (importRules) {
                    var importUrls = importRules.map(function(decl) {
                        return decl.replace(regex.cssImports, "$1");
                    });
                    importUrls = importUrls.map(function(url) {
                        return getFullUrl(url, sourceUrl);
                    });
                    getUrls(importUrls, {
                        onError: function onError(xhr, url, urlIndex) {
                            handleError(xhr, node, url, cssIndex, cssText);
                        },
                        onSuccess: function onSuccess(importText, url, urlIndex) {
                            var importDecl = importRules[urlIndex];
                            var importUrl = importUrls[urlIndex];
                            var newCssText = cssText.replace(importDecl, importText);
                            handleSuccess(newCssText, cssIndex, node, url, importUrl);
                        }
                    });
                } else {
                    cssArray[cssIndex] = cssText;
                    handleComplete();
                }
            } else {
                cssArray[cssIndex] = "";
                handleComplete();
            }
        }
        if (sourceNodes.length) {
            sourceNodes.forEach(function(node, i) {
                var linkHref = node.getAttribute("href");
                var linkRel = node.getAttribute("rel");
                var isLink = node.nodeName === "LINK" && linkHref && linkRel && linkRel.toLowerCase() === "stylesheet";
                var isStyle = node.nodeName === "STYLE";
                if (isLink) {
                    getUrls(linkHref, {
                        mimeType: "text/css",
                        onError: function onError(xhr, url, urlIndex) {
                            handleError(xhr, node, url, i);
                        },
                        onSuccess: function onSuccess(cssText, url, urlIndex) {
                            var sourceUrl = getFullUrl(linkHref, location.href);
                            handleSuccess(cssText, i, node, sourceUrl);
                        }
                    });
                } else if (isStyle) {
                    handleSuccess(node.textContent, i, node, location.href);
                } else {
                    cssArray[i] = "";
                    handleComplete();
                }
            });
        } else {
            settings.onComplete("", []);
        }
    }
    function getFullUrl(url) {
        var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : location.href;
        var d = document.implementation.createHTMLDocument("");
        var b = d.createElement("base");
        var a = d.createElement("a");
        d.head.appendChild(b);
        d.body.appendChild(a);
        b.href = base;
        a.href = url;
        return a.href;
    }
    function matchesSelector(elm, selector) {
        var matches = elm.matches || elm.matchesSelector || elm.webkitMatchesSelector || elm.mozMatchesSelector || elm.msMatchesSelector || elm.oMatchesSelector;
        return matches.call(elm, selector);
    }
    function mergeDeep() {
        var isObject = function isObject(obj) {
            return obj instanceof Object && obj.constructor === Object;
        };
        for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
            objects[_key] = arguments[_key];
        }
        return objects.reduce(function(prev, obj) {
            Object.keys(obj).forEach(function(key) {
                var pVal = prev[key];
                var oVal = obj[key];
                if (isObject(pVal) && isObject(oVal)) {
                    prev[key] = mergeDeep(pVal, oVal);
                } else {
                    prev[key] = oVal;
                }
            });
            return prev;
        }, {});
    }
    var balancedMatch = balanced;
    function balanced(a, b, str) {
        if (a instanceof RegExp) a = maybeMatch(a, str);
        if (b instanceof RegExp) b = maybeMatch(b, str);
        var r = range(a, b, str);
        return r && {
            start: r[0],
            end: r[1],
            pre: str.slice(0, r[0]),
            body: str.slice(r[0] + a.length, r[1]),
            post: str.slice(r[1] + b.length)
        };
    }
    function maybeMatch(reg, str) {
        var m = str.match(reg);
        return m ? m[0] : null;
    }
    balanced.range = range;
    function range(a, b, str) {
        var begs, beg, left, right, result;
        var ai = str.indexOf(a);
        var bi = str.indexOf(b, ai + 1);
        var i = ai;
        if (ai >= 0 && bi > 0) {
            begs = [];
            left = str.length;
            while (i >= 0 && !result) {
                if (i == ai) {
                    begs.push(i);
                    ai = str.indexOf(a, i + 1);
                } else if (begs.length == 1) {
                    result = [ begs.pop(), bi ];
                } else {
                    beg = begs.pop();
                    if (beg < left) {
                        left = beg;
                        right = bi;
                    }
                    bi = str.indexOf(b, i + 1);
                }
                i = ai < bi && ai >= 0 ? ai : bi;
            }
            if (begs.length) {
                result = [ left, right ];
            }
        }
        return result;
    }
    function cssParse(css) {
        var errors = [];
        function error(msg) {
            throw new Error("CSS parse error: " + msg);
        }
        function match(re) {
            var m = re.exec(css);
            if (m) {
                css = css.slice(m[0].length);
                return m;
            }
        }
        function whitespace() {
            match(/^\s*/);
        }
        function open() {
            return match(/^{\s*/);
        }
        function close() {
            return match(/^}/);
        }
        function comment() {
            whitespace();
            if (css[0] !== "/" || css[1] !== "*") {
                return;
            }
            var i = 2;
            while (css[i] && (css[i] !== "*" || css[i + 1] !== "/")) {
                i++;
            }
            if (!css[i]) {
                return error("end of comment is missing");
            }
            var str = css.slice(2, i);
            css = css.slice(i + 2);
            return {
                type: "comment",
                comment: str
            };
        }
        function comments() {
            var cmnts = [];
            var c = void 0;
            while (c = comment()) {
                cmnts.push(c);
            }
            return cmnts;
        }
        function selector() {
            whitespace();
            while (css[0] === "}") {
                error("extra closing bracket");
            }
            var m = match(/^(("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^{])+)/);
            if (m) {
                return m[0].trim().replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m) {
                    return m.replace(/,/g, "‌");
                }).split(/\s*(?![^(]*\)),\s*/).map(function(s) {
                    return s.replace(/\u200C/g, ",");
                });
            }
        }
        function declaration() {
            match(/^([;\s]*)+/);
            var comment_regexp = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
            var prop = match(/^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
            if (!prop) {
                return;
            }
            prop = prop[0].trim();
            if (!match(/^:\s*/)) {
                return error("property missing ':'");
            }
            var val = match(/^((?:\/\*.*?\*\/|'(?:\\'|.)*?'|"(?:\\"|.)*?"|\((\s*'(?:\\'|.)*?'|"(?:\\"|.)*?"|[^)]*?)\s*\)|[^};])+)/);
            var ret = {
                type: "declaration",
                property: prop.replace(comment_regexp, ""),
                value: val ? val[0].replace(comment_regexp, "").trim() : ""
            };
            match(/^[;\s]*/);
            return ret;
        }
        function declarations() {
            if (!open()) {
                return error("missing '{'");
            }
            var d = void 0, decls = comments();
            while (d = declaration()) {
                decls.push(d);
                decls = decls.concat(comments());
            }
            if (!close()) {
                return error("missing '}'");
            }
            return decls;
        }
        function keyframe() {
            whitespace();
            var vals = [];
            var m = void 0;
            while (m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
                vals.push(m[1]);
                match(/^,\s*/);
            }
            if (vals.length) {
                return {
                    type: "keyframe",
                    values: vals,
                    declarations: declarations()
                };
            }
        }
        function at_keyframes() {
            var m = match(/^@([-\w]+)?keyframes\s*/);
            if (!m) {
                return;
            }
            var vendor = m[1];
            m = match(/^([-\w]+)\s*/);
            if (!m) {
                return error("@keyframes missing name");
            }
            var name = m[1];
            if (!open()) {
                return error("@keyframes missing '{'");
            }
            var frame = void 0, frames = comments();
            while (frame = keyframe()) {
                frames.push(frame);
                frames = frames.concat(comments());
            }
            if (!close()) {
                return error("@keyframes missing '}'");
            }
            return {
                type: "keyframes",
                name: name,
                vendor: vendor,
                keyframes: frames
            };
        }
        function at_page() {
            var m = match(/^@page */);
            if (m) {
                var sel = selector() || [];
                return {
                    type: "page",
                    selectors: sel,
                    declarations: declarations()
                };
            }
        }
        function at_fontface() {
            var m = match(/^@font-face\s*/);
            if (m) {
                return {
                    type: "font-face",
                    declarations: declarations()
                };
            }
        }
        function at_supports() {
            var m = match(/^@supports *([^{]+)/);
            if (m) {
                return {
                    type: "supports",
                    supports: m[1].trim(),
                    rules: rules()
                };
            }
        }
        function at_host() {
            var m = match(/^@host\s*/);
            if (m) {
                return {
                    type: "host",
                    rules: rules()
                };
            }
        }
        function at_media() {
            var m = match(/^@media *([^{]+)/);
            if (m) {
                return {
                    type: "media",
                    media: m[1].trim(),
                    rules: rules()
                };
            }
        }
        function at_custom_m() {
            var m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
            if (m) {
                return {
                    type: "custom-media",
                    name: m[1].trim(),
                    media: m[2].trim()
                };
            }
        }
        function at_document() {
            var m = match(/^@([-\w]+)?document *([^{]+)/);
            if (m) {
                return {
                    type: "document",
                    document: m[2].trim(),
                    vendor: m[1] ? m[1].trim() : null,
                    rules: rules()
                };
            }
        }
        function at_x() {
            var m = match(/^@(import|charset|namespace)\s*([^;]+);/);
            if (m) {
                return {
                    type: m[1],
                    name: m[2].trim()
                };
            }
        }
        function at_rule() {
            whitespace();
            if (css[0] === "@") {
                return at_keyframes() || at_supports() || at_host() || at_media() || at_custom_m() || at_page() || at_document() || at_fontface() || at_x();
            }
        }
        function rule() {
            var sel = selector() || [];
            if (!sel.length) {
                error("selector missing");
            }
            var decls = declarations();
            return {
                type: "rule",
                selectors: sel,
                declarations: decls
            };
        }
        function rules(core) {
            if (!core && !open()) {
                return error("missing '{'");
            }
            var node = void 0, rules = comments();
            while (css.length && (core || css[0] !== "}") && (node = at_rule() || rule())) {
                rules.push(node);
                rules = rules.concat(comments());
            }
            if (!core && !close()) {
                return error("missing '}'");
            }
            return rules;
        }
        return {
            type: "stylesheet",
            stylesheet: {
                rules: rules(true),
                errors: errors
            }
        };
    }
    function stringifyCss(tree) {
        var delim = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        var cb = arguments[2];
        var renderMethods = {
            charset: function charset(node) {
                return "@charset " + node.name + ";";
            },
            comment: function comment(node) {
                return "";
            },
            "custom-media": function customMedia(node) {
                return "@custom-media " + node.name + " " + node.media + ";";
            },
            declaration: function declaration(node) {
                return node.property + ":" + node.value + ";";
            },
            document: function document(node) {
                return "@" + (node.vendor || "") + "document " + node.document + "{" + visit(node.rules) + "}";
            },
            "font-face": function fontFace(node) {
                return "@font-face" + "{" + visit(node.declarations) + "}";
            },
            host: function host(node) {
                return "@host" + "{" + visit(node.rules) + "}";
            },
            import: function _import(node) {
                return "@import " + node.name + ";";
            },
            keyframe: function keyframe(node) {
                return node.values.join(",") + "{" + visit(node.declarations) + "}";
            },
            keyframes: function keyframes(node) {
                return "@" + (node.vendor || "") + "keyframes " + node.name + "{" + visit(node.keyframes) + "}";
            },
            media: function media(node) {
                return "@media " + node.media + "{" + visit(node.rules) + "}";
            },
            namespace: function namespace(node) {
                return "@namespace " + node.name + ";";
            },
            page: function page(node) {
                return "@page " + (node.selectors.length ? node.selectors.join(", ") : "") + "{" + visit(node.declarations) + "}";
            },
            rule: function rule(node) {
                var decls = node.declarations;
                if (decls.length) {
                    return node.selectors.join(",") + "{" + visit(decls) + "}";
                }
            },
            supports: function supports(node) {
                return "@supports " + node.supports + "{" + visit(node.rules) + "}";
            }
        };
        function visit(nodes) {
            var buf = "";
            for (var i = 0; i < nodes.length; i++) {
                var n = nodes[i];
                if (cb) {
                    cb(n);
                }
                var txt = renderMethods[n.type](n);
                if (txt) {
                    buf += txt;
                    if (txt.length && n.selectors) {
                        buf += delim;
                    }
                }
            }
            return buf;
        }
        return visit(tree.stylesheet.rules);
    }
    function walkCss(node, fn) {
        node.rules.forEach(function(rule) {
            if (rule.rules) {
                walkCss(rule, fn);
                return;
            }
            if (rule.keyframes) {
                rule.keyframes.forEach(function(keyframe) {
                    if (keyframe.type === "keyframe") {
                        fn(keyframe.declarations, rule);
                    }
                });
                return;
            }
            if (!rule.declarations) {
                return;
            }
            fn(rule.declarations, node);
        });
    }
    var persistStore = {};
    var VAR_PROP_IDENTIFIER = "--";
    var VAR_FUNC_IDENTIFIER = "var";
    function transformVars(cssText) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var defaults = {
            onlyVars: true,
            persist: false,
            preserve: false,
            variables: {},
            onWarning: function onWarning() {}
        };
        var map = {};
        var settings = mergeDeep(defaults, options);
        var varSource = settings.persist ? persistStore : settings.variables;
        var cssTree = cssParse(cssText);
        if (settings.onlyVars) {
            cssTree.stylesheet.rules = filterVars(cssTree.stylesheet.rules);
        }
        cssTree.stylesheet.rules.forEach(function(rule) {
            var varNameIndices = [];
            if (rule.type !== "rule") {
                return;
            }
            if (rule.selectors.length !== 1 || rule.selectors[0] !== ":root") {
                return;
            }
            rule.declarations.forEach(function(decl, i) {
                var prop = decl.property;
                var value = decl.value;
                if (prop && prop.indexOf(VAR_PROP_IDENTIFIER) === 0) {
                    map[prop] = value;
                    varNameIndices.push(i);
                }
            });
            if (!settings.preserve) {
                for (var i = varNameIndices.length - 1; i >= 0; i--) {
                    rule.declarations.splice(varNameIndices[i], 1);
                }
            }
        });
        Object.keys(settings.variables).forEach(function(key) {
            var prop = "--" + key.replace(/^-+/, "");
            var value = settings.variables[key];
            if (key !== prop) {
                settings.variables[prop] = value;
                delete settings.variables[key];
            }
            if (settings.persist) {
                persistStore[prop] = value;
            }
        });
        if (Object.keys(varSource).length) {
            var newRule = {
                declarations: [],
                selectors: [ ":root" ],
                type: "rule"
            };
            Object.keys(varSource).forEach(function(key) {
                map[key] = varSource[key];
                newRule.declarations.push({
                    type: "declaration",
                    property: key,
                    value: varSource[key]
                });
                if (settings.persist) {
                    persistStore[key] = varSource[key];
                }
            });
            if (settings.preserve) {
                cssTree.stylesheet.rules.push(newRule);
            }
        }
        walkCss(cssTree.stylesheet, function(declarations, node) {
            var decl = void 0;
            var resolvedValue = void 0;
            var value = void 0;
            for (var i = 0; i < declarations.length; i++) {
                decl = declarations[i];
                value = decl.value;
                if (decl.type !== "declaration") {
                    continue;
                }
                if (!value || value.indexOf(VAR_FUNC_IDENTIFIER + "(") === -1) {
                    continue;
                }
                resolvedValue = resolveValue(value, map, settings);
                if (resolvedValue !== "undefined") {
                    if (!settings.preserve) {
                        decl.value = resolvedValue;
                    } else {
                        declarations.splice(i, 0, {
                            type: decl.type,
                            property: decl.property,
                            value: resolvedValue
                        });
                        i++;
                    }
                }
            }
        });
        return stringifyCss(cssTree);
    }
    function filterVars(rules) {
        return rules.filter(function(rule) {
            if (rule.declarations) {
                var declArray = rule.declarations.filter(function(d) {
                    var hasVarProp = d.property && d.property.indexOf(VAR_PROP_IDENTIFIER) === 0;
                    var hasVarVal = d.value && d.value.indexOf(VAR_FUNC_IDENTIFIER + "(") > -1;
                    return hasVarProp || hasVarVal;
                });
                if (rule.type !== "font-face") {
                    rule.declarations = declArray;
                }
                return Boolean(declArray.length);
            } else if (rule.keyframes) {
                return Boolean(rule.keyframes.filter(function(k) {
                    return Boolean(k.declarations.filter(function(d) {
                        var hasVarProp = d.property && d.property.indexOf(VAR_PROP_IDENTIFIER) === 0;
                        var hasVarVal = d.value && d.value.indexOf(VAR_FUNC_IDENTIFIER + "(") > -1;
                        return hasVarProp || hasVarVal;
                    }).length);
                }).length);
            } else if (rule.rules) {
                rule.rules = filterVars(rule.rules).filter(function(r) {
                    return r.declarations && r.declarations.length;
                });
                return Boolean(rule.rules.length);
            }
            return true;
        });
    }
    function resolveValue(value, map, settings) {
        var RE_VAR = /([\w-]+)(?:\s*,\s*)?(.*)?/;
        var balancedParens = balancedMatch("(", ")", value);
        var varStartIndex = value.indexOf("var(");
        var varRef = balancedMatch("(", ")", value.substring(varStartIndex)).body;
        var warningIntro = "CSS transform warning:";
        if (!balancedParens) {
            settings.onWarning(warningIntro + ' missing closing ")" in the value "' + value + '"');
        }
        if (varRef === "") {
            settings.onWarning(warningIntro + " var() must contain a non-whitespace string");
        }
        var varFunc = VAR_FUNC_IDENTIFIER + "(" + varRef + ")";
        var varResult = varRef.replace(RE_VAR, function(_, name, fallback) {
            var replacement = map[name];
            if (!replacement && !fallback) {
                settings.onWarning(warningIntro + ' variable "' + name + '" is undefined');
            }
            if (!replacement && fallback) {
                return fallback;
            }
            return replacement;
        });
        value = value.split(varFunc).join(varResult);
        if (value.indexOf(VAR_FUNC_IDENTIFIER + "(") !== -1) {
            value = resolveValue(value, map, settings);
        }
        return value;
    }
    var name = "css-vars-ponyfill";
    var defaults = {
        include: "style,link[rel=stylesheet]",
        exclude: "",
        onlyLegacy: true,
        onlyVars: true,
        preserve: false,
        silent: false,
        updateDOM: true,
        variables: {},
        onSuccess: function onSuccess() {},
        onError: function onError() {},
        onWarning: function onWarning() {},
        onComplete: function onComplete() {}
    };
    var reCssVars = /(?:(?::root\s*{\s*[^;]*;*\s*)|(?:var\(\s*))(--[^:)]+)(?:\s*[:)])/;
    /**
 * Description
 *
 * @preserve
 * @param {object}   [options] Options object
 * @param {string}   [options.include="style,link[rel=stylesheet]"] CSS selector
 *                   matching <link re="stylesheet"> and <style> nodes to
 *                   process
 * @param {string}   [options.exclude=""] CSS selector matching <link
 *                   rel="stylehseet"> and <style> nodes to exclude from those
 *                   matches by options.include
 * @param {boolean}  [options.onlyLegacy=true] Determines if the ponyfill will
 *                   only generate legacy-compatible CSS in browsers that lack
 *                   native support (i.e., legacy browsers)
 * @param {boolean}  [options.onlyVars=true] Determines if CSS rulesets and
 *                   declarations without a custom property value should be
 *                   removed from the ponyfill-generated CSS
 * @param {boolean}  [options.preserve=false] Determines if the original CSS
 *                   custom property declaration will be retained in the
 *                   ponyfill-generated CSS.
 * @param {boolean}  [options.silent=false] Determines if warning and error
 *                   messages will be displayed on the console
 * @param {boolean}  [options.updateDOM=true] Determines if the ponyfill will
 *                   update the DOM after processing CSS custom properties
 * @param {object}   [options.variables={}] A map of custom property name/value
 *                   pairs. Property names can omit or include the leading
 *                   double-hyphen (—), and values specified will override
 *                   previous values.
 * @param {function} [options.onSuccess] Callback after all CSS has been
 *                   processed and legacy-compatible CSS has been generated, but
 *                   before the legacy CSS has been appended to the DOM. Allows
 *                   modifying the CSS data by returning any string value (or
 *                   false to skip) before options.onComplete is triggered.
 *                   Passes 1) a CSS string with CSS variable values resolved as
 *                   an argument.
 * @param {function} [options.onError] Callback after a CSS parsing error has
 *                   occurred or an XHR request has failed. Passes 1) an error
 *                   message, and 2) source node reference, 3) xhr, and 4 url as
 *                   arguments.
 * @param {function} [options.onWarning] Callback after each CSS parsing warning
 *                   has occurred. Passes 1) a warning message as an argument.
 * @param {function} [options.onComplete] Callback after all CSS has been
 *                   processed, legacy-compatible CSS has been generated, and
 *                   (optionally) the DOM has been updated. Passes 1) a CSS
 *                   string with CSS variable values resolved, and 2) a
 *                   reference to the appended <style> node.
 *
 * @example
 *
 *   cssVars({
 *     include   : 'style,link[rel="stylesheet"]', // default
 *     exclude   : '',
 *     onlyLegacy: true,  // default
 *     onlyVars  : true,  // default
 *     preserve  : false, // default
 *     silent    : false, // default
 *     updateDOM : true,  // default
 *     variables : {
 *       // ...
 *     },
 *     onError(message, node) {
 *       // ...
 *     },
 *     onWarning(message) {
 *       // ...
 *     },
 *     onSuccess(cssText) {
 *       // ...
 *     },
 *     onComplete(cssText, styleNode) {
 *       // ...
 *     }
 *   });
 */    function cssVars() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var settings = mergeDeep(defaults, options);
        function handleError(message, sourceNode, xhr, url) {
            if (!settings.silent) {
                console.error(message + "\n", sourceNode);
            }
            settings.onError(message, sourceNode, xhr, url);
        }
        function handleWarning(message) {
            if (!settings.silent) {
                console.warn(message);
            }
            settings.onWarning(message);
        }
        if (document.readyState !== "loading") {
            var hasNativeSupport = window.CSS && window.CSS.supports && window.CSS.supports("(--a: 0)");
            if (!hasNativeSupport || !settings.onlyLegacy) {
                var styleNodeId = name;
                getCssData({
                    include: settings.include,
                    exclude: "#" + styleNodeId + (settings.exclude ? "," + settings.exclude : ""),
                    filter: settings.onlyVars ? reCssVars : null,
                    onComplete: function onComplete(cssText, cssArray, nodeArray) {
                        var styleNode = null;
                        try {
                            cssText = transformVars(cssText, {
                                onlyVars: settings.onlyVars,
                                persist: settings.updateDOM,
                                preserve: settings.preserve,
                                variables: settings.variables,
                                onWarning: handleWarning
                            });
                            var returnVal = settings.onSuccess(cssText);
                            cssText = returnVal === false ? "" : returnVal || cssText;
                            if (settings.updateDOM) {
                                var insertBeforeNode = document.querySelector("head link[rel=stylesheet],head style, head :last-child");
                                styleNode = document.querySelector("#" + styleNodeId) || document.createElement("style");
                                styleNode.setAttribute("id", styleNodeId);
                                if (styleNode.textContent !== cssText) {
                                    styleNode.textContent = cssText;
                                }
                                document.head.insertBefore(styleNode, insertBeforeNode);
                            }
                        } catch (err) {
                            var errorThrown = false;
                            cssArray.forEach(function(cssText, i) {
                                try {
                                    cssText = transformVars(cssText, settings);
                                } catch (err) {
                                    var errorNode = nodeArray[i - 0];
                                    errorThrown = true;
                                    handleError(err.message, errorNode);
                                }
                            });
                            if (!errorThrown) {
                                handleError(err.message || err);
                            }
                        }
                        settings.onComplete(cssText, styleNode);
                    },
                    onError: function onError(xhr, node, url) {
                        var errorMsg = 'CSS XHR error: "' + xhr.responseURL + '" ' + xhr.status + (xhr.statusText ? " (" + xhr.statusText + ")" : "");
                        handleError(errorMsg, node, xhr, url);
                    }
                });
            } else if (hasNativeSupport && settings.updateDOM) {
                Object.keys(settings.variables).forEach(function(key) {
                    var prop = "--" + key.replace(/^-+/, "");
                    var value = settings.variables[key];
                    document.documentElement.style.setProperty(prop, value);
                });
            }
        } else {
            document.addEventListener("DOMContentLoaded", function init(evt) {
                cssVars(options);
                document.removeEventListener("DOMContentLoaded", init);
            });
        }
    }
    return cssVars;
});


},{}],2:[function(require,module,exports){
'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.3.1';

  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
                                  * Stores initialized plugins.
                                  */
    _plugins: {},

    /**
                   * Stores generated unique ids for plugin instances
                   */
    _uuids: [],

    /**
                 * Returns a boolean for RTL support
                 */
    rtl: function rtl() {
      return $('html').attr('dir') === 'rtl';
    },
    /**
        * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
        * @param {Object} plugin - The constructor of the plugin.
        */
    plugin: function plugin(_plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(_plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = _plugin;
    },
    /**
        * @function
        * Populates the _uuids array with pointers to each individual plugin instance.
        * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
        * Also fires the initialization event for each plugin, consolidating repetitive code.
        * @param {Object} plugin - an instance of a plugin, usually `this` in context.
        * @param {String} name - the name of the plugin, passed as a camelCased string.
        * @fires Plugin#init
        */
    registerPlugin: function registerPlugin(plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {plugin.$element.attr('data-' + pluginName, plugin.uuid);}
      if (!plugin.$element.data('zfPlugin')) {plugin.$element.data('zfPlugin', plugin);}
      /**
                                                                                          * Fires when the plugin has initialized.
                                                                                          * @event Plugin#init
                                                                                          */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
        * @function
        * Removes the plugins uuid from the _uuids array.
        * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
        * Also fires the destroyed event for the plugin, consolidating repetitive code.
        * @param {Object} plugin - an instance of a plugin, usually `this` in context.
        * @fires Plugin#destroyed
        */
    unregisterPlugin: function unregisterPlugin(plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
                                                                               * Fires when the plugin has been destroyed.
                                                                               * @event Plugin#destroyed
                                                                               */.
      trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
        * @function
        * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
        * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
        * @default If no argument is passed, reflow all currently active plugins.
        */
    reInit: function reInit(plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins === 'undefined' ? 'undefined' : _typeof(plugins),
          _this = this,
          fns = {
            'object': function object(plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function string() {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function undefined() {
              this['object'](Object.keys(_this._plugins));
            } };

          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
        * returns a random base-36 uid with namespacing
        * @function
        * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
        * @param {String} namespace - name of plugin to be incorporated in uid, optional.
        * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
        * @returns {String} - unique id
        */
    GetYoDigits: function GetYoDigits(length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
    },
    /**
        * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
        * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
        * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
        */
    reflow: function reflow(elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      $.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = $(this),
          opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {return el.trim();});
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function transitionend($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend' };

      var elem = document.createElement('div'),
      end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    } };


  Foundation.util = {
    /**
                       * Function for applying a debounce effect to a function call.
                       * @function
                       * @param {Function} func - Function to be called at end of timeout.
                       * @param {Number} delay - Time in ms to delay the call of `func`.
                       * @returns function
                       */
    throttle: function throttle(func, delay) {
      var timer = null;

      return function () {
        var context = this,args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    } };


  // TODO: consider not making this a jQuery function
  // TODO: need way to reflow vs. re-initialize
  /**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
  var foundation = function foundation(method) {
    var type = typeof method === 'undefined' ? 'undefined' : _typeof(method),
    $meta = $('meta.foundation-mq'),
    $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {//needs to initialize the Foundation object, or an individual plugin.
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {//an individual method to invoke on a plugin or group of plugins
      var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
      var plugClass = this.data('zfPlugin'); //determine the class of plugin

      if (plugClass !== undefined && plugClass[method] !== undefined) {//make sure both the class and method exist
        if (this.length === 1) {//if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {//otherwise loop through the jQuery collection and invoke the method on each
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {//error for no class or no method
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {//error for invalid argument type
      throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now)
    window.Date.now = Date.now = function () {return new Date().getTime();};

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] ||
      window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) ||
    !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {callback(lastTime = nextTime);},
        nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
       * Polyfill for performance.now, required by rAF
       */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function now() {return Date.now() - this.start;} };

    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function fNOP() {},
      fBound = function fBound() {
        return fToBind.apply(this instanceof fNOP ?
        this :
        oThis,
        aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else
    if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else
    {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if ('true' === str) return true;else
    if ('false' === str) return false;else
    if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

}(jQuery);

},{}],3:[function(require,module,exports){
'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

!function ($) {

  /**
                * Drilldown module.
                * @module foundation.drilldown
                * @requires foundation.util.keyboard
                * @requires foundation.util.motion
                * @requires foundation.util.nest
                */var

  Drilldown = function () {
    /**
                            * Creates a new instance of a drilldown menu.
                            * @class
                            * @param {jQuery} element - jQuery object to make into an accordion menu.
                            * @param {Object} options - Overrides to the default plugin settings.
                            */
    function Drilldown(element, options) {_classCallCheck(this, Drilldown);
      this.$element = element;
      this.options = $.extend({}, Drilldown.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'drilldown');

      this._init();

      Foundation.registerPlugin(this, 'Drilldown');
      Foundation.Keyboard.register('Drilldown', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close',
        'TAB': 'down',
        'SHIFT_TAB': 'up' });

    }

    /**
       * Initializes the drilldown by creating jQuery collections of elements
       * @private
       */_createClass(Drilldown, [{ key: '_init', value: function _init()
      {
        this.$submenuAnchors = this.$element.find('li.is-drilldown-submenu-parent').children('a');
        this.$submenus = this.$submenuAnchors.parent('li').children('[data-submenu]');
        this.$menuItems = this.$element.find('li').not('.js-drilldown-back').attr('role', 'menuitem').find('a');
        this.$element.attr('data-mutate', this.$element.attr('data-drilldown') || Foundation.GetYoDigits(6, 'drilldown'));

        this._prepareMenu();
        this._registerEvents();

        this._keyboardEvents();
      }

      /**
         * prepares drilldown menu by setting attributes to links and elements
         * sets a min height to prevent content jumping
         * wraps the element if not already wrapped
         * @private
         * @function
         */ }, { key: '_prepareMenu', value: function _prepareMenu()
      {
        var _this = this;
        // if(!this.options.holdOpen){
        //   this._menuLinkEvents();
        // }
        this.$submenuAnchors.each(function () {
          var $link = $(this);
          var $sub = $link.parent();
          if (_this.options.parentLink) {
            $link.clone().prependTo($sub.children('[data-submenu]')).wrap('<li class="is-submenu-parent-item is-submenu-item is-drilldown-submenu-item" role="menu-item"></li>');
          }
          $link.data('savedHref', $link.attr('href')).removeAttr('href').attr('tabindex', 0);
          $link.children('[data-submenu]').
          attr({
            'aria-hidden': true,
            'tabindex': 0,
            'role': 'menu' });

          _this._events($link);
        });
        this.$submenus.each(function () {
          var $menu = $(this),
          $back = $menu.find('.js-drilldown-back');
          if (!$back.length) {
            switch (_this.options.backButtonPosition) {
              case "bottom":
                $menu.append(_this.options.backButton);
                break;
              case "top":
                $menu.prepend(_this.options.backButton);
                break;
              default:
                console.error("Unsupported backButtonPosition value '" + _this.options.backButtonPosition + "'");}

          }
          _this._back($menu);
        });

        this.$submenus.addClass('invisible');
        if (!this.options.autoHeight) {
          this.$submenus.addClass('drilldown-submenu-cover-previous');
        }

        // create a wrapper on element if it doesn't exist.
        if (!this.$element.parent().hasClass('is-drilldown')) {
          this.$wrapper = $(this.options.wrapper).addClass('is-drilldown');
          if (this.options.animateHeight) this.$wrapper.addClass('animate-height');
          this.$element.wrap(this.$wrapper);
        }
        // set wrapper
        this.$wrapper = this.$element.parent();
        this.$wrapper.css(this._getMaxDims());
      } }, { key: '_resize', value: function _resize()

      {
        this.$wrapper.css({ 'max-width': 'none', 'min-height': 'none' });
        // _getMaxDims has side effects (boo) but calling it should update all other necessary heights & widths
        this.$wrapper.css(this._getMaxDims());
      }

      /**
         * Adds event handlers to elements in the menu.
         * @function
         * @private
         * @param {jQuery} $elem - the current menu item to add handlers to.
         */ }, { key: '_events', value: function _events(
      $elem) {
        var _this = this;

        $elem.off('click.zf.drilldown').
        on('click.zf.drilldown', function (e) {
          if ($(e.target).parentsUntil('ul', 'li').hasClass('is-drilldown-submenu-parent')) {
            e.stopImmediatePropagation();
            e.preventDefault();
          }

          // if(e.target !== e.currentTarget.firstElementChild){
          //   return false;
          // }
          _this._show($elem.parent('li'));

          if (_this.options.closeOnClick) {
            var $body = $('body');
            $body.off('.zf.drilldown').on('click.zf.drilldown', function (e) {
              if (e.target === _this.$element[0] || $.contains(_this.$element[0], e.target)) {return;}
              e.preventDefault();
              _this._hideAll();
              $body.off('.zf.drilldown');
            });
          }
        });
        this.$element.on('mutateme.zf.trigger', this._resize.bind(this));
      }

      /**
         * Adds event handlers to the menu element.
         * @function
         * @private
         */ }, { key: '_registerEvents', value: function _registerEvents()
      {
        if (this.options.scrollTop) {
          this._bindHandler = this._scrollTop.bind(this);
          this.$element.on('open.zf.drilldown hide.zf.drilldown closed.zf.drilldown', this._bindHandler);
        }
      }

      /**
         * Scroll to Top of Element or data-scroll-top-element
         * @function
         * @fires Drilldown#scrollme
         */ }, { key: '_scrollTop', value: function _scrollTop()
      {
        var _this = this;
        var $scrollTopElement = _this.options.scrollTopElement != '' ? $(_this.options.scrollTopElement) : _this.$element,
        scrollPos = parseInt($scrollTopElement.offset().top + _this.options.scrollTopOffset);
        $('html, body').stop(true).animate({ scrollTop: scrollPos }, _this.options.animationDuration, _this.options.animationEasing, function () {
          /**
                                                                                                                                                    * Fires after the menu has scrolled
                                                                                                                                                    * @event Drilldown#scrollme
                                                                                                                                                    */
          if (this === $('html')[0]) _this.$element.trigger('scrollme.zf.drilldown');
        });
      }

      /**
         * Adds keydown event listener to `li`'s in the menu.
         * @private
         */ }, { key: '_keyboardEvents', value: function _keyboardEvents()
      {
        var _this = this;

        this.$menuItems.add(this.$element.find('.js-drilldown-back > a, .is-submenu-parent-item > a')).on('keydown.zf.drilldown', function (e) {
          var $element = $(this),
          $elements = $element.parent('li').parent('ul').children('li').children('a'),
          $prevElement,
          $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(Math.max(0, i - 1));
              $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              return;
            }
          });

          Foundation.Keyboard.handleKey(e, 'Drilldown', {
            next: function next() {
              if ($element.is(_this.$submenuAnchors)) {
                _this._show($element.parent('li'));
                $element.parent('li').one(Foundation.transitionend($element), function () {
                  $element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
                });
                return true;
              }
            },
            previous: function previous() {
              _this._hide($element.parent('li').parent('ul'));
              $element.parent('li').parent('ul').one(Foundation.transitionend($element), function () {
                setTimeout(function () {
                  $element.parent('li').parent('ul').parent('li').children('a').first().focus();
                }, 1);
              });
              return true;
            },
            up: function up() {
              $prevElement.focus();
              // Don't tap focus on first element in root ul
              return !$element.is(_this.$element.find('> li:first-child > a'));
            },
            down: function down() {
              $nextElement.focus();
              // Don't tap focus on last element in root ul
              return !$element.is(_this.$element.find('> li:last-child > a'));
            },
            close: function close() {
              // Don't close on element in root ul
              if (!$element.is(_this.$element.find('> li > a'))) {
                _this._hide($element.parent().parent());
                $element.parent().parent().siblings('a').focus();
              }
            },
            open: function open() {
              if (!$element.is(_this.$menuItems)) {// not menu item means back button
                _this._hide($element.parent('li').parent('ul'));
                $element.parent('li').parent('ul').one(Foundation.transitionend($element), function () {
                  setTimeout(function () {
                    $element.parent('li').parent('ul').parent('li').children('a').first().focus();
                  }, 1);
                });
                return true;
              } else if ($element.is(_this.$submenuAnchors)) {
                _this._show($element.parent('li'));
                $element.parent('li').one(Foundation.transitionend($element), function () {
                  $element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
                });
                return true;
              }
            },
            handled: function handled(preventDefault) {
              if (preventDefault) {
                e.preventDefault();
              }
              e.stopImmediatePropagation();
            } });

        }); // end keyboardAccess
      }

      /**
         * Closes all open elements, and returns to root menu.
         * @function
         * @fires Drilldown#closed
         */ }, { key: '_hideAll', value: function _hideAll()
      {
        var $elem = this.$element.find('.is-drilldown-submenu.is-active').addClass('is-closing');
        if (this.options.autoHeight) this.$wrapper.css({ height: $elem.parent().closest('ul').data('calcHeight') });
        $elem.one(Foundation.transitionend($elem), function (e) {
          $elem.removeClass('is-active is-closing');
        });
        /**
             * Fires when the menu is fully closed.
             * @event Drilldown#closed
             */
        this.$element.trigger('closed.zf.drilldown');
      }

      /**
         * Adds event listener for each `back` button, and closes open menus.
         * @function
         * @fires Drilldown#back
         * @param {jQuery} $elem - the current sub-menu to add `back` event.
         */ }, { key: '_back', value: function _back(
      $elem) {
        var _this = this;
        $elem.off('click.zf.drilldown');
        $elem.children('.js-drilldown-back').
        on('click.zf.drilldown', function (e) {
          e.stopImmediatePropagation();
          // console.log('mouseup on back');
          _this._hide($elem);

          // If there is a parent submenu, call show
          var parentSubMenu = $elem.parent('li').parent('ul').parent('li');
          if (parentSubMenu.length) {
            _this._show(parentSubMenu);
          }
        });
      }

      /**
         * Adds event listener to menu items w/o submenus to close open menus on click.
         * @function
         * @private
         */ }, { key: '_menuLinkEvents', value: function _menuLinkEvents()
      {
        var _this = this;
        this.$menuItems.not('.is-drilldown-submenu-parent').
        off('click.zf.drilldown').
        on('click.zf.drilldown', function (e) {
          // e.stopImmediatePropagation();
          setTimeout(function () {
            _this._hideAll();
          }, 0);
        });
      }

      /**
         * Opens a submenu.
         * @function
         * @fires Drilldown#open
         * @param {jQuery} $elem - the current element with a submenu to open, i.e. the `li` tag.
         */ }, { key: '_show', value: function _show(
      $elem) {
        if (this.options.autoHeight) this.$wrapper.css({ height: $elem.children('[data-submenu]').data('calcHeight') });
        $elem.attr('aria-expanded', true);
        $elem.children('[data-submenu]').addClass('is-active').removeClass('invisible').attr('aria-hidden', false);
        /**
                                                                                                                     * Fires when the submenu has opened.
                                                                                                                     * @event Drilldown#open
                                                                                                                     */
        this.$element.trigger('open.zf.drilldown', [$elem]);
      } }, { key: '_hide',

      /**
                            * Hides a submenu
                            * @function
                            * @fires Drilldown#hide
                            * @param {jQuery} $elem - the current sub-menu to hide, i.e. the `ul` tag.
                            */value: function _hide(
      $elem) {
        if (this.options.autoHeight) this.$wrapper.css({ height: $elem.parent().closest('ul').data('calcHeight') });
        var _this = this;
        $elem.parent('li').attr('aria-expanded', false);
        $elem.attr('aria-hidden', true).addClass('is-closing');
        $elem.addClass('is-closing').
        one(Foundation.transitionend($elem), function () {
          $elem.removeClass('is-active is-closing');
          $elem.blur().addClass('invisible');
        });
        /**
             * Fires when the submenu has closed.
             * @event Drilldown#hide
             */
        $elem.trigger('hide.zf.drilldown', [$elem]);
      }

      /**
         * Iterates through the nested menus to calculate the min-height, and max-width for the menu.
         * Prevents content jumping.
         * @function
         * @private
         */ }, { key: '_getMaxDims', value: function _getMaxDims()
      {
        var maxHeight = 0,result = {},_this = this;
        this.$submenus.add(this.$element).each(function () {
          var numOfElems = $(this).children('li').length;
          var height = Foundation.Box.GetDimensions(this).height;
          maxHeight = height > maxHeight ? height : maxHeight;
          if (_this.options.autoHeight) {
            $(this).data('calcHeight', height);
            if (!$(this).hasClass('is-drilldown-submenu')) result['height'] = height;
          }
        });

        if (!this.options.autoHeight) result['min-height'] = maxHeight + 'px';

        result['max-width'] = this.$element[0].getBoundingClientRect().width + 'px';

        return result;
      }

      /**
         * Destroys the Drilldown Menu
         * @function
         */ }, { key: 'destroy', value: function destroy()
      {
        if (this.options.scrollTop) this.$element.off('.zf.drilldown', this._bindHandler);
        this._hideAll();
        this.$element.off('mutateme.zf.trigger');
        Foundation.Nest.Burn(this.$element, 'drilldown');
        this.$element.unwrap().
        find('.js-drilldown-back, .is-submenu-parent-item').remove().
        end().find('.is-active, .is-closing, .is-drilldown-submenu').removeClass('is-active is-closing is-drilldown-submenu').
        end().find('[data-submenu]').removeAttr('aria-hidden tabindex role');
        this.$submenuAnchors.each(function () {
          $(this).off('.zf.drilldown');
        });

        this.$submenus.removeClass('drilldown-submenu-cover-previous');

        this.$element.find('a').each(function () {
          var $link = $(this);
          $link.removeAttr('tabindex');
          if ($link.data('savedHref')) {
            $link.attr('href', $link.data('savedHref')).removeData('savedHref');
          } else {return;}
        });
        Foundation.unregisterPlugin(this);
      } }]);return Drilldown;}();


  Drilldown.defaults = {
    /**
                          * Markup used for JS generated back button. Prepended  or appended (see backButtonPosition) to submenu lists and deleted on `destroy` method, 'js-drilldown-back' class required. Remove the backslash (`\`) if copy and pasting.
                          * @option
                          * @type {string}
                          * @default '<li class="js-drilldown-back"><a tabindex="0">Back</a></li>'
                          */
    backButton: '<li class="js-drilldown-back"><a tabindex="0">Back</a></li>',
    /**
                                                                                * Position the back button either at the top or bottom of drilldown submenus. Can be `'left'` or `'bottom'`.
                                                                                * @option
                                                                                * @type {string}
                                                                                * @default top
                                                                                */
    backButtonPosition: 'top',
    /**
                                * Markup used to wrap drilldown menu. Use a class name for independent styling; the JS applied class: `is-drilldown` is required. Remove the backslash (`\`) if copy and pasting.
                                * @option
                                * @type {string}
                                * @default '<div></div>'
                                */
    wrapper: '<div></div>',
    /**
                             * Adds the parent link to the submenu.
                             * @option
                             * @type {boolean}
                             * @default false
                             */
    parentLink: false,
    /**
                        * Allow the menu to return to root list on body click.
                        * @option
                        * @type {boolean}
                        * @default false
                        */
    closeOnClick: false,
    /**
                          * Allow the menu to auto adjust height.
                          * @option
                          * @type {boolean}
                          * @default false
                          */
    autoHeight: false,
    /**
                        * Animate the auto adjust height.
                        * @option
                        * @type {boolean}
                        * @default false
                        */
    animateHeight: false,
    /**
                           * Scroll to the top of the menu after opening a submenu or navigating back using the menu back button
                           * @option
                           * @type {boolean}
                           * @default false
                           */
    scrollTop: false,
    /**
                       * String jquery selector (for example 'body') of element to take offset().top from, if empty string the drilldown menu offset().top is taken
                       * @option
                       * @type {string}
                       * @default ''
                       */
    scrollTopElement: '',
    /**
                           * ScrollTop offset
                           * @option
                           * @type {number}
                           * @default 0
                           */
    scrollTopOffset: 0,
    /**
                         * Scroll animation duration
                         * @option
                         * @type {number}
                         * @default 500
                         */
    animationDuration: 500,
    /**
                             * Scroll animation easing. Can be `'swing'` or `'linear'`.
                             * @option
                             * @type {string}
                             * @see {@link https://api.jquery.com/animate|JQuery animate}
                             * @default 'swing'
                             */
    animationEasing: 'swing'
    // holdOpen: false
  };

  // Window exports
  Foundation.plugin(Drilldown, 'Drilldown');

}(jQuery);

},{}],4:[function(require,module,exports){
'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

!function ($) {

  /**
                * DropdownMenu module.
                * @module foundation.dropdown-menu
                * @requires foundation.util.keyboard
                * @requires foundation.util.box
                * @requires foundation.util.nest
                */var

  DropdownMenu = function () {
    /**
                               * Creates a new instance of DropdownMenu.
                               * @class
                               * @fires DropdownMenu#init
                               * @param {jQuery} element - jQuery object to make into a dropdown menu.
                               * @param {Object} options - Overrides to the default plugin settings.
                               */
    function DropdownMenu(element, options) {_classCallCheck(this, DropdownMenu);
      this.$element = element;
      this.options = $.extend({}, DropdownMenu.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'dropdown');
      this._init();

      Foundation.registerPlugin(this, 'DropdownMenu');
      Foundation.Keyboard.register('DropdownMenu', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close' });

    }

    /**
       * Initializes the plugin, and calls _prepareMenu
       * @private
       * @function
       */_createClass(DropdownMenu, [{ key: '_init', value: function _init()
      {
        var subs = this.$element.find('li.is-dropdown-submenu-parent');
        this.$element.children('.is-dropdown-submenu-parent').children('.is-dropdown-submenu').addClass('first-sub');

        this.$menuItems = this.$element.find('[role="menuitem"]');
        this.$tabs = this.$element.children('[role="menuitem"]');
        this.$tabs.find('ul.is-dropdown-submenu').addClass(this.options.verticalClass);

        if (this.$element.hasClass(this.options.rightClass) || this.options.alignment === 'right' || Foundation.rtl() || this.$element.parents('.top-bar-right').is('*')) {
          this.options.alignment = 'right';
          subs.addClass('opens-left');
        } else {
          subs.addClass('opens-right');
        }
        this.changed = false;
        this._events();
      } }, { key: '_isVertical', value: function _isVertical()

      {
        return this.$tabs.css('display') === 'block';
      }

      /**
         * Adds event listeners to elements within the menu
         * @private
         * @function
         */ }, { key: '_events', value: function _events()
      {
        var _this = this,
        hasTouch = 'ontouchstart' in window || typeof window.ontouchstart !== 'undefined',
        parClass = 'is-dropdown-submenu-parent';

        // used for onClick and in the keyboard handlers
        var handleClickFn = function handleClickFn(e) {
          var $elem = $(e.target).parentsUntil('ul', '.' + parClass),
          hasSub = $elem.hasClass(parClass),
          hasClicked = $elem.attr('data-is-click') === 'true',
          $sub = $elem.children('.is-dropdown-submenu');

          if (hasSub) {
            if (hasClicked) {
              if (!_this.options.closeOnClick || !_this.options.clickOpen && !hasTouch || _this.options.forceFollow && hasTouch) {return;} else
              {
                e.stopImmediatePropagation();
                e.preventDefault();
                _this._hide($elem);
              }
            } else {
              e.preventDefault();
              e.stopImmediatePropagation();
              _this._show($sub);
              $elem.add($elem.parentsUntil(_this.$element, '.' + parClass)).attr('data-is-click', true);
            }
          }
        };

        if (this.options.clickOpen || hasTouch) {
          this.$menuItems.on('click.zf.dropdownmenu touchstart.zf.dropdownmenu', handleClickFn);
        }

        // Handle Leaf element Clicks
        if (_this.options.closeOnClickInside) {
          this.$menuItems.on('click.zf.dropdownmenu', function (e) {
            var $elem = $(this),
            hasSub = $elem.hasClass(parClass);
            if (!hasSub) {
              _this._hide();
            }
          });
        }

        if (!this.options.disableHover) {
          this.$menuItems.on('mouseenter.zf.dropdownmenu', function (e) {
            var $elem = $(this),
            hasSub = $elem.hasClass(parClass);

            if (hasSub) {
              clearTimeout($elem.data('_delay'));
              $elem.data('_delay', setTimeout(function () {
                _this._show($elem.children('.is-dropdown-submenu'));
              }, _this.options.hoverDelay));
            }
          }).on('mouseleave.zf.dropdownmenu', function (e) {
            var $elem = $(this),
            hasSub = $elem.hasClass(parClass);
            if (hasSub && _this.options.autoclose) {
              if ($elem.attr('data-is-click') === 'true' && _this.options.clickOpen) {return false;}

              clearTimeout($elem.data('_delay'));
              $elem.data('_delay', setTimeout(function () {
                _this._hide($elem);
              }, _this.options.closingTime));
            }
          });
        }
        this.$menuItems.on('keydown.zf.dropdownmenu', function (e) {
          var $element = $(e.target).parentsUntil('ul', '[role="menuitem"]'),
          isTab = _this.$tabs.index($element) > -1,
          $elements = isTab ? _this.$tabs : $element.siblings('li').add($element),
          $prevElement,
          $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(i - 1);
              $nextElement = $elements.eq(i + 1);
              return;
            }
          });

          var nextSibling = function nextSibling() {
            if (!$element.is(':last-child')) {
              $nextElement.children('a:first').focus();
              e.preventDefault();
            }
          },prevSibling = function prevSibling() {
            $prevElement.children('a:first').focus();
            e.preventDefault();
          },openSub = function openSub() {
            var $sub = $element.children('ul.is-dropdown-submenu');
            if ($sub.length) {
              _this._show($sub);
              $element.find('li > a:first').focus();
              e.preventDefault();
            } else {return;}
          },closeSub = function closeSub() {
            //if ($element.is(':first-child')) {
            var close = $element.parent('ul').parent('li');
            close.children('a:first').focus();
            _this._hide(close);
            e.preventDefault();
            //}
          };
          var functions = {
            open: openSub,
            close: function close() {
              _this._hide(_this.$element);
              _this.$menuItems.find('a:first').focus(); // focus to first element
              e.preventDefault();
            },
            handled: function handled() {
              e.stopImmediatePropagation();
            } };


          if (isTab) {
            if (_this._isVertical()) {// vertical menu
              if (Foundation.rtl()) {// right aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: closeSub,
                  previous: openSub });

              } else {// left aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: openSub,
                  previous: closeSub });

              }
            } else {// horizontal menu
              if (Foundation.rtl()) {// right aligned
                $.extend(functions, {
                  next: prevSibling,
                  previous: nextSibling,
                  down: openSub,
                  up: closeSub });

              } else {// left aligned
                $.extend(functions, {
                  next: nextSibling,
                  previous: prevSibling,
                  down: openSub,
                  up: closeSub });

              }
            }
          } else {// not tabs -> one sub
            if (Foundation.rtl()) {// right aligned
              $.extend(functions, {
                next: closeSub,
                previous: openSub,
                down: nextSibling,
                up: prevSibling });

            } else {// left aligned
              $.extend(functions, {
                next: openSub,
                previous: closeSub,
                down: nextSibling,
                up: prevSibling });

            }
          }
          Foundation.Keyboard.handleKey(e, 'DropdownMenu', functions);

        });
      }

      /**
         * Adds an event handler to the body to close any dropdowns on a click.
         * @function
         * @private
         */ }, { key: '_addBodyHandler', value: function _addBodyHandler()
      {
        var $body = $(document.body),
        _this = this;
        $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu').
        on('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu', function (e) {
          var $link = _this.$element.find(e.target);
          if ($link.length) {return;}

          _this._hide();
          $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu');
        });
      }

      /**
         * Opens a dropdown pane, and checks for collisions first.
         * @param {jQuery} $sub - ul element that is a submenu to show
         * @function
         * @private
         * @fires DropdownMenu#show
         */ }, { key: '_show', value: function _show(
      $sub) {
        var idx = this.$tabs.index(this.$tabs.filter(function (i, el) {
          return $(el).find($sub).length > 0;
        }));
        var $sibs = $sub.parent('li.is-dropdown-submenu-parent').siblings('li.is-dropdown-submenu-parent');
        this._hide($sibs, idx);
        $sub.css('visibility', 'hidden').addClass('js-dropdown-active').
        parent('li.is-dropdown-submenu-parent').addClass('is-active');
        var clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
        if (!clear) {
          var oldClass = this.options.alignment === 'left' ? '-right' : '-left',
          $parentLi = $sub.parent('.is-dropdown-submenu-parent');
          $parentLi.removeClass('opens' + oldClass).addClass('opens-' + this.options.alignment);
          clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
          if (!clear) {
            $parentLi.removeClass('opens-' + this.options.alignment).addClass('opens-inner');
          }
          this.changed = true;
        }
        $sub.css('visibility', '');
        if (this.options.closeOnClick) {this._addBodyHandler();}
        /**
                                                                  * Fires when the new dropdown pane is visible.
                                                                  * @event DropdownMenu#show
                                                                  */
        this.$element.trigger('show.zf.dropdownmenu', [$sub]);
      }

      /**
         * Hides a single, currently open dropdown pane, if passed a parameter, otherwise, hides everything.
         * @function
         * @param {jQuery} $elem - element with a submenu to hide
         * @param {Number} idx - index of the $tabs collection to hide
         * @private
         */ }, { key: '_hide', value: function _hide(
      $elem, idx) {
        var $toClose;
        if ($elem && $elem.length) {
          $toClose = $elem;
        } else if (idx !== undefined) {
          $toClose = this.$tabs.not(function (i, el) {
            return i === idx;
          });
        } else
        {
          $toClose = this.$element;
        }
        var somethingToClose = $toClose.hasClass('is-active') || $toClose.find('.is-active').length > 0;

        if (somethingToClose) {
          $toClose.find('li.is-active').add($toClose).attr({
            'data-is-click': false }).
          removeClass('is-active');

          $toClose.find('ul.js-dropdown-active').removeClass('js-dropdown-active');

          if (this.changed || $toClose.find('opens-inner').length) {
            var oldClass = this.options.alignment === 'left' ? 'right' : 'left';
            $toClose.find('li.is-dropdown-submenu-parent').add($toClose).
            removeClass('opens-inner opens-' + this.options.alignment).
            addClass('opens-' + oldClass);
            this.changed = false;
          }
          /**
             * Fires when the open menus are closed.
             * @event DropdownMenu#hide
             */
          this.$element.trigger('hide.zf.dropdownmenu', [$toClose]);
        }
      }

      /**
         * Destroys the plugin.
         * @function
         */ }, { key: 'destroy', value: function destroy()
      {
        this.$menuItems.off('.zf.dropdownmenu').removeAttr('data-is-click').
        removeClass('is-right-arrow is-left-arrow is-down-arrow opens-right opens-left opens-inner');
        $(document.body).off('.zf.dropdownmenu');
        Foundation.Nest.Burn(this.$element, 'dropdown');
        Foundation.unregisterPlugin(this);
      } }]);return DropdownMenu;}();


  /**
                                      * Default settings for plugin
                                      */
  DropdownMenu.defaults = {
    /**
                             * Disallows hover events from opening submenus
                             * @option
                             * @type {boolean}
                             * @default false
                             */
    disableHover: false,
    /**
                          * Allow a submenu to automatically close on a mouseleave event, if not clicked open.
                          * @option
                          * @type {boolean}
                          * @default true
                          */
    autoclose: true,
    /**
                      * Amount of time to delay opening a submenu on hover event.
                      * @option
                      * @type {number}
                      * @default 50
                      */
    hoverDelay: 50,
    /**
                     * Allow a submenu to open/remain open on parent click event. Allows cursor to move away from menu.
                     * @option
                     * @type {boolean}
                     * @default false
                     */
    clickOpen: false,
    /**
                       * Amount of time to delay closing a submenu on a mouseleave event.
                       * @option
                       * @type {number}
                       * @default 500
                       */

    closingTime: 500,
    /**
                       * Position of the menu relative to what direction the submenus should open. Handled by JS. Can be `'left'` or `'right'`.
                       * @option
                       * @type {string}
                       * @default 'left'
                       */
    alignment: 'left',
    /**
                        * Allow clicks on the body to close any open submenus.
                        * @option
                        * @type {boolean}
                        * @default true
                        */
    closeOnClick: true,
    /**
                         * Allow clicks on leaf anchor links to close any open submenus.
                         * @option
                         * @type {boolean}
                         * @default true
                         */
    closeOnClickInside: true,
    /**
                               * Class applied to vertical oriented menus, Foundation default is `vertical`. Update this if using your own class.
                               * @option
                               * @type {string}
                               * @default 'vertical'
                               */
    verticalClass: 'vertical',
    /**
                                * Class applied to right-side oriented menus, Foundation default is `align-right`. Update this if using your own class.
                                * @option
                                * @type {string}
                                * @default 'align-right'
                                */
    rightClass: 'align-right',
    /**
                                * Boolean to force overide the clicking of links to perform default action, on second touch event for mobile.
                                * @option
                                * @type {boolean}
                                * @default true
                                */
    forceFollow: true };


  // Window exports
  Foundation.plugin(DropdownMenu, 'DropdownMenu');

}(jQuery);

},{}],5:[function(require,module,exports){
'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

!function ($) {

  /**
                * OffCanvas module.
                * @module foundation.offcanvas
                * @requires foundation.util.keyboard
                * @requires foundation.util.mediaQuery
                * @requires foundation.util.triggers
                * @requires foundation.util.motion
                */var

  OffCanvas = function () {
    /**
                            * Creates a new instance of an off-canvas wrapper.
                            * @class
                            * @fires OffCanvas#init
                            * @param {Object} element - jQuery object to initialize.
                            * @param {Object} options - Overrides to the default plugin settings.
                            */
    function OffCanvas(element, options) {_classCallCheck(this, OffCanvas);
      this.$element = element;
      this.options = $.extend({}, OffCanvas.defaults, this.$element.data(), options);
      this.$lastTrigger = $();
      this.$triggers = $();

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'OffCanvas');
      Foundation.Keyboard.register('OffCanvas', {
        'ESCAPE': 'close' });


    }

    /**
       * Initializes the off-canvas wrapper by adding the exit overlay (if needed).
       * @function
       * @private
       */_createClass(OffCanvas, [{ key: '_init', value: function _init()
      {
        var id = this.$element.attr('id');

        this.$element.attr('aria-hidden', 'true');

        this.$element.addClass('is-transition-' + this.options.transition);

        // Find triggers that affect this element and add aria-expanded to them
        this.$triggers = $(document).
        find('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').
        attr('aria-expanded', 'false').
        attr('aria-controls', id);

        // Add an overlay over the content if necessary
        if (this.options.contentOverlay === true) {
          var overlay = document.createElement('div');
          var overlayPosition = $(this.$element).css("position") === 'fixed' ? 'is-overlay-fixed' : 'is-overlay-absolute';
          overlay.setAttribute('class', 'js-off-canvas-overlay ' + overlayPosition);
          this.$overlay = $(overlay);
          if (overlayPosition === 'is-overlay-fixed') {
            $('body').append(this.$overlay);
          } else {
            this.$element.siblings('[data-off-canvas-content]').append(this.$overlay);
          }
        }

        this.options.isRevealed = this.options.isRevealed || new RegExp(this.options.revealClass, 'g').test(this.$element[0].className);

        if (this.options.isRevealed === true) {
          this.options.revealOn = this.options.revealOn || this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
          this._setMQChecker();
        }
        if (!this.options.transitionTime === true) {
          this.options.transitionTime = parseFloat(window.getComputedStyle($('[data-off-canvas]')[0]).transitionDuration) * 1000;
        }
      }

      /**
         * Adds event handlers to the off-canvas wrapper and the exit overlay.
         * @function
         * @private
         */ }, { key: '_events', value: function _events()
      {
        this.$element.off('.zf.trigger .zf.offcanvas').on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'keydown.zf.offcanvas': this._handleKeyboard.bind(this) });


        if (this.options.closeOnClick === true) {
          var $target = this.options.contentOverlay ? this.$overlay : $('[data-off-canvas-content]');
          $target.on({ 'click.zf.offcanvas': this.close.bind(this) });
        }
      }

      /**
         * Applies event listener for elements that will reveal at certain breakpoints.
         * @private
         */ }, { key: '_setMQChecker', value: function _setMQChecker()
      {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          } else {
            _this.reveal(false);
          }
        }).one('load.zf.offcanvas', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          }
        });
      }

      /**
         * Handles the revealing/hiding the off-canvas at breakpoints, not the same as open.
         * @param {Boolean} isRevealed - true if element should be revealed.
         * @function
         */ }, { key: 'reveal', value: function reveal(
      isRevealed) {
        var $closer = this.$element.find('[data-close]');
        if (isRevealed) {
          this.close();
          this.isRevealed = true;
          this.$element.attr('aria-hidden', 'false');
          this.$element.off('open.zf.trigger toggle.zf.trigger');
          if ($closer.length) {$closer.hide();}
        } else {
          this.isRevealed = false;
          this.$element.attr('aria-hidden', 'true');
          this.$element.on({
            'open.zf.trigger': this.open.bind(this),
            'toggle.zf.trigger': this.toggle.bind(this) });

          if ($closer.length) {
            $closer.show();
          }
        }
      }

      /**
         * Stops scrolling of the body when offcanvas is open on mobile Safari and other troublesome browsers.
         * @private
         */ }, { key: '_stopScrolling', value: function _stopScrolling(
      event) {
        return false;
      }

      // Taken and adapted from http://stackoverflow.com/questions/16889447/prevent-full-page-scrolling-ios
      // Only really works for y, not sure how to extend to x or if we need to.
    }, { key: '_recordScrollable', value: function _recordScrollable(event) {
        var elem = this; // called from event handler context with this as elem

        // If the element is scrollable (content overflows), then...
        if (elem.scrollHeight !== elem.clientHeight) {
          // If we're at the top, scroll down one pixel to allow scrolling up
          if (elem.scrollTop === 0) {
            elem.scrollTop = 1;
          }
          // If we're at the bottom, scroll up one pixel to allow scrolling down
          if (elem.scrollTop === elem.scrollHeight - elem.clientHeight) {
            elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1;
          }
        }
        elem.allowUp = elem.scrollTop > 0;
        elem.allowDown = elem.scrollTop < elem.scrollHeight - elem.clientHeight;
        elem.lastY = event.originalEvent.pageY;
      } }, { key: '_stopScrollPropagation', value: function _stopScrollPropagation(

      event) {
        var elem = this; // called from event handler context with this as elem
        var up = event.pageY < elem.lastY;
        var down = !up;
        elem.lastY = event.pageY;

        if (up && elem.allowUp || down && elem.allowDown) {
          event.stopPropagation();
        } else {
          event.preventDefault();
        }
      }

      /**
         * Opens the off-canvas menu.
         * @function
         * @param {Object} event - Event object passed from listener.
         * @param {jQuery} trigger - element that triggered the off-canvas to open.
         * @fires OffCanvas#opened
         */ }, { key: 'open', value: function open(
      event, trigger) {
        if (this.$element.hasClass('is-open') || this.isRevealed) {return;}
        var _this = this;

        if (trigger) {
          this.$lastTrigger = trigger;
        }

        if (this.options.forceTo === 'top') {
          window.scrollTo(0, 0);
        } else if (this.options.forceTo === 'bottom') {
          window.scrollTo(0, document.body.scrollHeight);
        }

        /**
           * Fires when the off-canvas menu opens.
           * @event OffCanvas#opened
           */
        _this.$element.addClass('is-open');

        this.$triggers.attr('aria-expanded', 'true');
        this.$element.attr('aria-hidden', 'false').
        trigger('opened.zf.offcanvas');

        // If `contentScroll` is set to false, add class and disable scrolling on touch devices.
        if (this.options.contentScroll === false) {
          $('body').addClass('is-off-canvas-open').on('touchmove', this._stopScrolling);
          this.$element.on('touchstart', this._recordScrollable);
          this.$element.on('touchmove', this._stopScrollPropagation);
        }

        if (this.options.contentOverlay === true) {
          this.$overlay.addClass('is-visible');
        }

        if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
          this.$overlay.addClass('is-closable');
        }

        if (this.options.autoFocus === true) {
          this.$element.one(Foundation.transitionend(this.$element), function () {
            _this.$element.find('a, button').eq(0).focus();
          });
        }

        if (this.options.trapFocus === true) {
          this.$element.siblings('[data-off-canvas-content]').attr('tabindex', '-1');
          Foundation.Keyboard.trapFocus(this.$element);
        }
      }

      /**
         * Closes the off-canvas menu.
         * @function
         * @param {Function} cb - optional cb to fire after closure.
         * @fires OffCanvas#closed
         */ }, { key: 'close', value: function close(
      cb) {
        if (!this.$element.hasClass('is-open') || this.isRevealed) {return;}

        var _this = this;

        _this.$element.removeClass('is-open');

        this.$element.attr('aria-hidden', 'true')
        /**
                                                   * Fires when the off-canvas menu opens.
                                                   * @event OffCanvas#closed
                                                   */.
        trigger('closed.zf.offcanvas');

        // If `contentScroll` is set to false, remove class and re-enable scrolling on touch devices.
        if (this.options.contentScroll === false) {
          $('body').removeClass('is-off-canvas-open').off('touchmove', this._stopScrolling);
          this.$element.off('touchstart', this._recordScrollable);
          this.$element.off('touchmove', this._stopScrollPropagation);
        }

        if (this.options.contentOverlay === true) {
          this.$overlay.removeClass('is-visible');
        }

        if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
          this.$overlay.removeClass('is-closable');
        }

        this.$triggers.attr('aria-expanded', 'false');

        if (this.options.trapFocus === true) {
          this.$element.siblings('[data-off-canvas-content]').removeAttr('tabindex');
          Foundation.Keyboard.releaseFocus(this.$element);
        }
      }

      /**
         * Toggles the off-canvas menu open or closed.
         * @function
         * @param {Object} event - Event object passed from listener.
         * @param {jQuery} trigger - element that triggered the off-canvas to open.
         */ }, { key: 'toggle', value: function toggle(
      event, trigger) {
        if (this.$element.hasClass('is-open')) {
          this.close(event, trigger);
        } else
        {
          this.open(event, trigger);
        }
      }

      /**
         * Handles keyboard input when detected. When the escape key is pressed, the off-canvas menu closes, and focus is restored to the element that opened the menu.
         * @function
         * @private
         */ }, { key: '_handleKeyboard', value: function _handleKeyboard(
      e) {var _this2 = this;
        Foundation.Keyboard.handleKey(e, 'OffCanvas', {
          close: function close() {
            _this2.close();
            _this2.$lastTrigger.focus();
            return true;
          },
          handled: function handled() {
            e.stopPropagation();
            e.preventDefault();
          } });

      }

      /**
         * Destroys the offcanvas plugin.
         * @function
         */ }, { key: 'destroy', value: function destroy()
      {
        this.close();
        this.$element.off('.zf.trigger .zf.offcanvas');
        this.$overlay.off('.zf.offcanvas');

        Foundation.unregisterPlugin(this);
      } }]);return OffCanvas;}();


  OffCanvas.defaults = {
    /**
                          * Allow the user to click outside of the menu to close it.
                          * @option
                          * @type {boolean}
                          * @default true
                          */
    closeOnClick: true,

    /**
                         * Adds an overlay on top of `[data-off-canvas-content]`.
                         * @option
                         * @type {boolean}
                         * @default true
                         */
    contentOverlay: true,

    /**
                           * Enable/disable scrolling of the main content when an off canvas panel is open.
                           * @option
                           * @type {boolean}
                           * @default true
                           */
    contentScroll: true,

    /**
                          * Amount of time in ms the open and close transition requires. If none selected, pulls from body style.
                          * @option
                          * @type {number}
                          * @default 0
                          */
    transitionTime: 0,

    /**
                        * Type of transition for the offcanvas menu. Options are 'push', 'detached' or 'slide'.
                        * @option
                        * @type {string}
                        * @default push
                        */
    transition: 'push',

    /**
                         * Force the page to scroll to top or bottom on open.
                         * @option
                         * @type {?string}
                         * @default null
                         */
    forceTo: null,

    /**
                    * Allow the offcanvas to remain open for certain breakpoints.
                    * @option
                    * @type {boolean}
                    * @default false
                    */
    isRevealed: false,

    /**
                        * Breakpoint at which to reveal. JS will use a RegExp to target standard classes, if changing classnames, pass your class with the `revealClass` option.
                        * @option
                        * @type {?string}
                        * @default null
                        */
    revealOn: null,

    /**
                     * Force focus to the offcanvas on open. If true, will focus the opening trigger on close.
                     * @option
                     * @type {boolean}
                     * @default true
                     */
    autoFocus: true,

    /**
                      * Class used to force an offcanvas to remain open. Foundation defaults for this are `reveal-for-large` & `reveal-for-medium`.
                      * @option
                      * @type {string}
                      * @default reveal-for-
                      * @todo improve the regex testing for this.
                      */
    revealClass: 'reveal-for-',

    /**
                                 * Triggers optional focus trapping when opening an offcanvas. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
                                 * @option
                                 * @type {boolean}
                                 * @default false
                                 */
    trapFocus: false


    // Window exports
  };Foundation.plugin(OffCanvas, 'OffCanvas');

}(jQuery);

},{}],6:[function(require,module,exports){
'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

!function ($) {

  /**
                * ResponsiveMenu module.
                * @module foundation.responsiveMenu
                * @requires foundation.util.triggers
                * @requires foundation.util.mediaQuery
                */var

  ResponsiveMenu = function () {
    /**
                                 * Creates a new instance of a responsive menu.
                                 * @class
                                 * @fires ResponsiveMenu#init
                                 * @param {jQuery} element - jQuery object to make into a dropdown menu.
                                 * @param {Object} options - Overrides to the default plugin settings.
                                 */
    function ResponsiveMenu(element, options) {_classCallCheck(this, ResponsiveMenu);
      this.$element = $(element);
      this.rules = this.$element.data('responsive-menu');
      this.currentMq = null;
      this.currentPlugin = null;

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'ResponsiveMenu');
    }

    /**
       * Initializes the Menu by parsing the classes from the 'data-ResponsiveMenu' attribute on the element.
       * @function
       * @private
       */_createClass(ResponsiveMenu, [{ key: '_init', value: function _init()
      {
        // The first time an Interchange plugin is initialized, this.rules is converted from a string of "classes" to an object of rules
        if (typeof this.rules === 'string') {
          var rulesTree = {};

          // Parse rules from "classes" pulled from data attribute
          var rules = this.rules.split(' ');

          // Iterate through every rule found
          for (var i = 0; i < rules.length; i++) {
            var rule = rules[i].split('-');
            var ruleSize = rule.length > 1 ? rule[0] : 'small';
            var rulePlugin = rule.length > 1 ? rule[1] : rule[0];

            if (MenuPlugins[rulePlugin] !== null) {
              rulesTree[ruleSize] = MenuPlugins[rulePlugin];
            }
          }

          this.rules = rulesTree;
        }

        if (!$.isEmptyObject(this.rules)) {
          this._checkMediaQueries();
        }
        // Add data-mutate since children may need it.
        this.$element.attr('data-mutate', this.$element.attr('data-mutate') || Foundation.GetYoDigits(6, 'responsive-menu'));
      }

      /**
         * Initializes events for the Menu.
         * @function
         * @private
         */ }, { key: '_events', value: function _events()
      {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          _this._checkMediaQueries();
        });
        // $(window).on('resize.zf.ResponsiveMenu', function() {
        //   _this._checkMediaQueries();
        // });
      }

      /**
         * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
         * @function
         * @private
         */ }, { key: '_checkMediaQueries', value: function _checkMediaQueries()
      {
        var matchedMq,_this = this;
        // Iterate through each rule and find the last matching rule
        $.each(this.rules, function (key) {
          if (Foundation.MediaQuery.atLeast(key)) {
            matchedMq = key;
          }
        });

        // No match? No dice
        if (!matchedMq) return;

        // Plugin already initialized? We good
        if (this.currentPlugin instanceof this.rules[matchedMq].plugin) return;

        // Remove existing plugin-specific CSS classes
        $.each(MenuPlugins, function (key, value) {
          _this.$element.removeClass(value.cssClass);
        });

        // Add the CSS class for the new plugin
        this.$element.addClass(this.rules[matchedMq].cssClass);

        // Create an instance of the new plugin
        if (this.currentPlugin) this.currentPlugin.destroy();
        this.currentPlugin = new this.rules[matchedMq].plugin(this.$element, {});
      }

      /**
         * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
         * @function
         */ }, { key: 'destroy', value: function destroy()
      {
        this.currentPlugin.destroy();
        $(window).off('.zf.ResponsiveMenu');
        Foundation.unregisterPlugin(this);
      } }]);return ResponsiveMenu;}();


  ResponsiveMenu.defaults = {};

  // The plugin matches the plugin classes with these plugin instances.
  var MenuPlugins = {
    dropdown: {
      cssClass: 'dropdown',
      plugin: Foundation._plugins['dropdown-menu'] || null },

    drilldown: {
      cssClass: 'drilldown',
      plugin: Foundation._plugins['drilldown'] || null },

    accordion: {
      cssClass: 'accordion-menu',
      plugin: Foundation._plugins['accordion-menu'] || null } };



  // Window exports
  Foundation.plugin(ResponsiveMenu, 'ResponsiveMenu');

}(jQuery);

},{}],7:[function(require,module,exports){
'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets


    /**
                            * Compares the dimensions of an element to a container and determines collision events with container.
                            * @function
                            * @param {jQuery} element - jQuery object to test for collisions.
                            * @param {jQuery} parent - jQuery object to use as bounding container.
                            * @param {Boolean} lrOnly - set to true to check left and right values only.
                            * @param {Boolean} tbOnly - set to true to check top and bottom values only.
                            * @default if no parent object passed, detects collisions with `window`.
                            * @returns {Boolean} - true if collision free, false if a collision in any direction.
                            */ };
  function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
    top,bottom,left,right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width + parDims.offset.left;
    } else
    {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
      * Uses native methods to return an object of dimension values.
      * @function
      * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
      * @returns {Object} - nested object of integer pixel values
      * TODO - if element is window, return only those values.
      */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
    parRect = elem.parentNode.getBoundingClientRect(),
    winRect = document.body.getBoundingClientRect(),
    winY = window.pageYOffset,
    winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX },

      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX } },


      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX } } };



  }

  /**
     * Returns an object of top and left integer pixel values for dynamically rendered elements,
     * such as: Tooltip, Reveal, and Dropdown
     * @function
     * @param {jQuery} element - jQuery object for the element being positioned.
     * @param {jQuery} anchor - jQuery object for the element's anchor point.
     * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
     * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
     * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
     * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
     * TODO alter/rewrite to work with `em` values as well/instead of pixels
     */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
    $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset) };

        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top };

        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top };

        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset) };

        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset };

        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2 };

        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2 };

        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2 };

        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset };

      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top };

        break;
      case 'left bottom':
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset };

        break;
      case 'right bottom':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset };

        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left + hOffset,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset };}


  }

}(jQuery);

},{}],8:[function(require,module,exports){
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN' };


  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
                                  * Parses the (keyboard) event and returns a String that represents its key
                                  * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
                                  * @param {Event} event - the event generated by the event handler
                                  * @return String key - String that represents the key pressed
                                  */
    parseKey: function parseKey(event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();

      // Remove un-printable characters, e.g. for `fromCharCode` calls for CTRL only events
      key = key.replace(/\W+/, '');

      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;

      // Remove trailing underscore, in case only modifiers were used (e.g. only `CTRL_ALT`)
      key = key.replace(/_$/, '');

      return key;
    },

    /**
        * Handles the given (keyboard) event
        * @param {Event} event - the event generated by the event handler
        * @param {String} component - Foundation component's name, e.g. Slider or Reveal
        * @param {Objects} functions - collection of functions that are to be executed
        */
    handleKey: function handleKey(event, component, functions) {
      var commandList = commands[component],
      keyCode = this.parseKey(event),
      cmds,
      command,
      fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {// this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {// merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
        if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else

        cmds = $.extend({}, commandList.rtl, commandList.ltr);
      }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {// execute function  if exists
        var returnValue = fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {// execute function when event was handled
          functions.handled(returnValue);
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {// execute function when event was not handled
          functions.unhandled();
        }
      }
    },

    /**
        * Finds all focusable elements within the given `$element`
        * @param {jQuery} $element - jQuery object to search within
        * @return {jQuery} $focusable - all focusable elements within `$element`
        */
    findFocusable: function findFocusable($element) {
      if (!$element) {return false;}
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {return false;} //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },

    /**
        * Returns the component name name
        * @param {Object} component - Foundation component, e.g. Slider or Reveal
        * @return String componentName
        */

    register: function register(componentName, cmds) {
      commands[componentName] = cmds;
    },

    /**
        * Traps the focus in the given element.
        * @param  {jQuery} $element  jQuery object to trap the foucs into.
        */
    trapFocus: function trapFocus($element) {
      var $focusable = Foundation.Keyboard.findFocusable($element),
      $firstFocusable = $focusable.eq(0),
      $lastFocusable = $focusable.eq(-1);

      $element.on('keydown.zf.trapfocus', function (event) {
        if (event.target === $lastFocusable[0] && Foundation.Keyboard.parseKey(event) === 'TAB') {
          event.preventDefault();
          $firstFocusable.focus();
        } else
        if (event.target === $firstFocusable[0] && Foundation.Keyboard.parseKey(event) === 'SHIFT_TAB') {
          event.preventDefault();
          $lastFocusable.focus();
        }
      });
    },
    /**
        * Releases the trapped focus from the given element.
        * @param  {jQuery} $element  jQuery object to release the focus for.
        */
    releaseFocus: function releaseFocus($element) {
      $element.off('keydown.zf.trapfocus');
    } };


  /*
          * Constants for easier comparing.
          * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
          */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {k[kcs[kc]] = kcs[kc];}
    return k;
  }

  Foundation.Keyboard = Keyboard;

}(jQuery);

},{}],9:[function(require,module,exports){
'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' +
    'only screen and (min--moz-device-pixel-ratio: 2),' +
    'only screen and (-o-min-device-pixel-ratio: 2/1),' +
    'only screen and (min-device-pixel-ratio: 2),' +
    'only screen and (min-resolution: 192dpi),' +
    'only screen and (min-resolution: 2dppx)' };


  var MediaQuery = {
    queries: [],

    current: '',

    /**
                  * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
                  * @function
                  * @private
                  */
    _init: function _init() {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        if (namedQueries.hasOwnProperty(key)) {
          self.queries.push({
            name: key,
            value: 'only screen and (min-width: ' + namedQueries[key] + ')' });

        }
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },

    /**
        * Checks if the screen is at least as wide as a breakpoint.
        * @function
        * @param {String} size - Name of the breakpoint to check.
        * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
        */
    atLeast: function atLeast(size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },

    /**
        * Checks if the screen matches to a breakpoint.
        * @function
        * @param {String} size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
        * @returns {Boolean} `true` if the breakpoint matches, `false` if it does not.
        */
    is: function is(size) {
      size = size.trim().split(' ');
      if (size.length > 1 && size[1] === 'only') {
        if (size[0] === this._getCurrentSize()) return true;
      } else {
        return this.atLeast(size[0]);
      }
      return false;
    },

    /**
        * Gets the media query of a breakpoint.
        * @function
        * @param {String} size - Name of the breakpoint to get.
        * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
        */
    get: function get(size) {
      for (var i in this.queries) {
        if (this.queries.hasOwnProperty(i)) {
          var query = this.queries[i];
          if (size === query.name) return query.value;
        }
      }

      return null;
    },

    /**
        * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
        * @function
        * @private
        * @returns {String} Name of the current breakpoint.
        */
    _getCurrentSize: function _getCurrentSize() {
      var matched;

      for (var i = 0; i < this.queries.length; i++) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if ((typeof matched === 'undefined' ? 'undefined' : _typeof(matched)) === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },

    /**
        * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
        * @function
        * @private
        */
    _watcher: function _watcher() {var _this = this;
      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize(),currentSize = _this.current;

        if (newSize !== currentSize) {
          // Change the current media query
          _this.current = newSize;

          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
        }
      });
    } };


  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
      script = document.getElementsByTagName('script')[0],
      info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script && script.parentNode && script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function matchMedium(media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        } };

    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all' };

    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;

}(jQuery);

},{}],10:[function(require,module,exports){
'use strict';

!function ($) {

  /**
                * Motion module.
                * @module foundation.motion
                */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function animateIn(element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function animateOut(element, animation, cb) {
      animate(false, element, animation, cb);
    } };


  function Move(duration, elem, fn) {
    var anim,prog,start = null;
    // console.log('called');

    if (duration === 0) {
      fn.apply(elem);
      elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      return;
    }

    function move(ts) {
      if (!start) start = ts;
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {anim = window.requestAnimationFrame(move, elem);} else
      {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
     * Animates an element in or out using a CSS transition class.
     * @function
     * @private
     * @param {Boolean} isIn - Defines if the animation is in or out.
     * @param {Object} element - jQuery or HTML object to animate.
     * @param {String} animation - CSS class to use.
     * @param {Function} cb - Callback to run when animation is finished.
     */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.
    addClass(animation).
    css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.
      css('transition', '').
      addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;

}(jQuery);

},{}],11:[function(require,module,exports){
'use strict';

!function ($) {

  var Nest = {
    Feather: function Feather(menu) {var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zf';
      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
      subMenuClass = 'is-' + type + '-submenu',
      subItemClass = subMenuClass + '-item',
      hasSubClass = 'is-' + type + '-submenu-parent';

      items.each(function () {
        var $item = $(this),
        $sub = $item.children('ul');

        if ($sub.length) {
          $item.
          addClass(hasSubClass).
          attr({
            'aria-haspopup': true,
            'aria-label': $item.children('a:first').text() });

          // Note:  Drilldowns behave differently in how they hide, and so need
          // additional attributes.  We should look if this possibly over-generalized
          // utility (Nest) is appropriate when we rework menus in 6.4
          if (type === 'drilldown') {
            $item.attr({ 'aria-expanded': false });
          }

          $sub.
          addClass('submenu ' + subMenuClass).
          attr({
            'data-submenu': '',
            'role': 'menu' });

          if (type === 'drilldown') {
            $sub.attr({ 'aria-hidden': true });
          }
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },

    Burn: function Burn(menu, type) {
      var //items = menu.find('li'),
      subMenuClass = 'is-' + type + '-submenu',
      subItemClass = subMenuClass + '-item',
      hasSubClass = 'is-' + type + '-submenu-parent';

      menu.
      find('>li, .menu, .menu > li').
      removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').
      removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    } };


  Foundation.Nest = Nest;

}(jQuery);

},{}],12:[function(require,module,exports){
'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
    duration = options.duration, //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
    remain = -1,
    start,
    timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        if (cb && typeof cb === 'function') {cb();}
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
     * Runs a callback function when images are fully loaded.
     * @param {Object} images - Image(s) to check if loaded.
     * @param {Func} callback - Function to execute when image is fully loaded.
     */
  function onImagesLoaded(images, callback) {
    var self = this,
    unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      // Check if image is loaded
      if (this.complete || this.readyState === 4 || this.readyState === 'complete') {
        singleImageLoaded();
      }
      // Force load the image
      else {
          // fix for IE. See https://css-tricks.com/snippets/jquery/fixing-load-in-ie-for-cached-images/
          var src = $(this).attr('src');
          $(this).attr('src', src + (src.indexOf('?') >= 0 ? '&' : '?') + new Date().getTime());
          $(this).one('load', function () {
            singleImageLoaded();
          });
        }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;

}(jQuery);

},{}],13:[function(require,module,exports){
'use strict'; //**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function ($) {

	$.spotSwipe = {
		version: '1.0.0',
		enabled: 'ontouchstart' in document.documentElement,
		preventDefault: false,
		moveThreshold: 75,
		timeThreshold: 200 };


	var startPosX,
	startPosY,
	startTime,
	elapsedTime,
	isMoving = false;

	function onTouchEnd() {
		//  alert(this);
		this.removeEventListener('touchmove', onTouchMove);
		this.removeEventListener('touchend', onTouchEnd);
		isMoving = false;
	}

	function onTouchMove(e) {
		if ($.spotSwipe.preventDefault) {e.preventDefault();}
		if (isMoving) {
			var x = e.touches[0].pageX;
			var y = e.touches[0].pageY;
			var dx = startPosX - x;
			var dy = startPosY - y;
			var dir;
			elapsedTime = new Date().getTime() - startTime;
			if (Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
				dir = dx > 0 ? 'left' : 'right';
			}
			// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
			//   dir = dy > 0 ? 'down' : 'up';
			// }
			if (dir) {
				e.preventDefault();
				onTouchEnd.call(this);
				$(this).trigger('swipe', dir).trigger('swipe' + dir);
			}
		}
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startPosX = e.touches[0].pageX;
			startPosY = e.touches[0].pageY;
			isMoving = true;
			startTime = new Date().getTime();
			this.addEventListener('touchmove', onTouchMove, false);
			this.addEventListener('touchend', onTouchEnd, false);
		}
	}

	function init() {
		this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
	}

	function teardown() {
		this.removeEventListener('touchstart', onTouchStart);
	}

	$.event.special.swipe = { setup: init };

	$.each(['left', 'up', 'down', 'right'], function () {
		$.event.special['swipe' + this] = { setup: function setup() {
				$(this).on('swipe', $.noop);
			} };
	});
})(jQuery);
/****************************************************
             * Method for adding psuedo drag events to elements *
             ***************************************************/
!function ($) {
	$.fn.addTouch = function () {
		this.each(function (i, el) {
			$(el).bind('touchstart touchmove touchend touchcancel', function () {
				//we pass the original event object because the jQuery event
				//object is normalized to w3c specs and does not provide the TouchList
				handleTouch(event);
			});
		});

		var handleTouch = function handleTouch(event) {
			var touches = event.changedTouches,
			first = touches[0],
			eventTypes = {
				touchstart: 'mousedown',
				touchmove: 'mousemove',
				touchend: 'mouseup' },

			type = eventTypes[event.type],
			simulatedEvent;


			if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
				simulatedEvent = new window.MouseEvent(type, {
					'bubbles': true,
					'cancelable': true,
					'screenX': first.screenX,
					'screenY': first.screenY,
					'clientX': first.clientX,
					'clientY': first.clientY });

			} else {
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
			}
			first.target.dispatchEvent(simulatedEvent);
		};
	};
}(jQuery);


//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/

},{}],14:[function(require,module,exports){
'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function triggers(el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else
    {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    var id = $(this).data('toggle');
    if (id) {
      triggers($(this), 'toggle');
    } else {
      $(this).trigger('toggle.zf.trigger');
    }
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
      * Fires once after all other scripts have loaded
      * @function
      * @private
      */
  $(window).on('load', function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    mutateListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
    plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if ((typeof pluginName === 'undefined' ? 'undefined' : _typeof(pluginName)) === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = void 0,
    $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').
      on('resize.zf.trigger', function (e) {
        if (timer) {clearTimeout(timer);}

        timer = setTimeout(function () {

          if (!MutationObserver) {//fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = void 0,
    $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').
      on('scroll.zf.trigger', function (e) {
        if (timer) {clearTimeout(timer);}

        timer = setTimeout(function () {

          if (!MutationObserver) {//fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function mutateListener(debounce) {
    var $nodes = $('[data-mutate]');
    if ($nodes.length && MutationObserver) {
      //trigger all listening elements and signal a mutate event
      //no IE 9 or 10
      $nodes.each(function () {
        $(this).triggerHandler('mutateme.zf.trigger');
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {return false;}
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function listeningElementsMutation(mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);

      //trigger the event handler for the element depending on type
      switch (mutationRecordsList[0].type) {

        case "attributes":
          if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          }
          if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('resizeme.zf.trigger', [$target]);
          }
          if (mutationRecordsList[0].attributeName === "style") {
            $target.closest("[data-mutate]").attr("data-events", "mutate");
            $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          }
          break;

        case "childList":
          $target.closest("[data-mutate]").attr("data-events", "mutate");
          $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;

}(jQuery);

// function domMutationObserver(debounce) {
//   // !!! This is coming soon and needs more work; not active  !!! //
//   var timer,
//   nodes = document.querySelectorAll('[data-mutate]');
//   //
//   if (nodes.length) {
//     // var MutationObserver = (function () {
//     //   var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
//     //   for (var i=0; i < prefixes.length; i++) {
//     //     if (prefixes[i] + 'MutationObserver' in window) {
//     //       return window[prefixes[i] + 'MutationObserver'];
//     //     }
//     //   }
//     //   return false;
//     // }());
//
//
//     //for the body, we need to listen for all changes effecting the style and class attributes
//     var bodyObserver = new MutationObserver(bodyMutation);
//     bodyObserver.observe(document.body, { attributes: true, childList: true, characterData: false, subtree:true, attributeFilter:["style", "class"]});
//
//
//     //body callback
//     function bodyMutation(mutate) {
//       //trigger all listening elements and signal a mutation event
//       if (timer) { clearTimeout(timer); }
//
//       timer = setTimeout(function() {
//         bodyObserver.disconnect();
//         $('[data-mutate]').attr('data-events',"mutate");
//       }, debounce || 150);
//     }
//   }
// }

},{}],15:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';

// Foundation Core
require('foundation-sites/js/foundation.core.js');

require('foundation-sites/js/foundation.util.box.js');
require('foundation-sites/js/foundation.util.keyboard.js');
require('foundation-sites/js/foundation.util.mediaQuery.js');
require('foundation-sites/js/foundation.util.motion.js');
require('foundation-sites/js/foundation.util.nest.js');
require('foundation-sites/js/foundation.util.timerAndImageLoader.js');
require('foundation-sites/js/foundation.util.touch.js');
require('foundation-sites/js/foundation.util.triggers.js');

require('foundation-sites/js/foundation.drilldown.js');
require('foundation-sites/js/foundation.dropdownMenu.js');
require('foundation-sites/js/foundation.responsiveMenu.js');
require('foundation-sites/js/foundation.offcanvas.js');

var _cssVarsPonyfill = require('css-vars-ponyfill');var _cssVarsPonyfill2 = _interopRequireDefault(_cssVarsPonyfill);

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);
var _socialShare = require('modules/socialShare.js');var _socialShare2 = _interopRequireDefault(_socialShare);
var _carousel = require('modules/carousel.js');var _carousel2 = _interopRequireDefault(_carousel);
var _accordion = require('modules/accordion.js');var _accordion2 = _interopRequireDefault(_accordion);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

(0, _cssVarsPonyfill2.default)({
  onComplete: function onComplete() {
    (0, _jquery2.default)('#css-vars-ponyfill').appendTo('head');
  } }); // Foundation Plugins. Add or remove as needed for your site
// Foundation Utilities

(function ($) {
  // Initialize Foundation
  $(document).foundation();

  // Initialize social share functionality
  // Replace the empty string parameter with your Facebook ID
  (0, _socialShare2.default)('');

  // Initialize carousels
  (0, _carousel2.default)();

  // Initialize accordions
  (0, _accordion2.default)();

  // Initialize Plugins
  $('.magnific-trigger').magnificPopup({
    type: 'inline' });


  $('.meerkat-cta').meerkat({
    background: 'rgb(21, 76, 102) repeat-x left top',
    height: '120px',
    width: '100%',
    position: 'bottom',
    close: '.close-meerkat',
    dontShowAgain: '.dont-show',
    animationIn: 'fade',
    animationSpeed: 500,
    opacity: 0.9 });

})(_jquery2.default);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"css-vars-ponyfill":1,"foundation-sites/js/foundation.core.js":2,"foundation-sites/js/foundation.drilldown.js":3,"foundation-sites/js/foundation.dropdownMenu.js":4,"foundation-sites/js/foundation.offcanvas.js":5,"foundation-sites/js/foundation.responsiveMenu.js":6,"foundation-sites/js/foundation.util.box.js":7,"foundation-sites/js/foundation.util.keyboard.js":8,"foundation-sites/js/foundation.util.mediaQuery.js":9,"foundation-sites/js/foundation.util.motion.js":10,"foundation-sites/js/foundation.util.nest.js":11,"foundation-sites/js/foundation.util.timerAndImageLoader.js":12,"foundation-sites/js/foundation.util.touch.js":13,"foundation-sites/js/foundation.util.triggers.js":14,"modules/accordion.js":16,"modules/carousel.js":17,"modules/socialShare.js":18}],16:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var accordion = function accordion() {
  var $toggleButton = (0, _jquery2.default)('[data-accordion-toggle]');

  /**
                                                                         * Removes accordion container height declaration
                                                                         */
  function prepToggleContainer() {
    $toggleButton.each(function (e) {
      var $this = (0, _jquery2.default)(this); // eslint-disable-line no-invalid-this
      var $toggleContent = $this.closest('.accordion-list__item').
      find($toggleButton.data('accordion-toggle'));
      var isHidden = $toggleContent.attr('aria-hidden') === 'false' ?
      false : true;
      $toggleContent.attr('aria-hidden', false);
      $toggleContent.css('height', '');
      $toggleContent.css('height', $toggleContent.height());
      $toggleContent.attr('aria-hidden', isHidden);
    });
  }

  /**
     * Toggles accordion container
     */
  function toggle() {
    var toggleSection = function toggleSection(e) {
      var $this = (0, _jquery2.default)(e.currentTarget);
      console.log($this); // eslint-disable-line no-console
      $this.toggleClass('accordion-active');
      var $currentToggleContainer = $this.closest('.accordion-list__item').
      find($this.data('accordion-toggle'));
      var isHidden = $currentToggleContainer.
      attr('aria-hidden') === 'false' ? false : true;
      $currentToggleContainer.attr('aria-hidden', !isHidden);
    };

    $toggleButton.on('click', toggleSection);
  }

  (0, _jquery2.default)(document).ready(function () {
    prepToggleContainer();
    toggle();
  });

  (0, _jquery2.default)(window).on('resize', function () {
    prepToggleContainer();
  });
};exports.default =

accordion;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],17:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);
require('vendor/jquery.slick.js');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var carousel = function carousel() {
  (0, _jquery2.default)('.js-carousel').slick({
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
    focusOnSelect: false,
    infinite: true,
    responsive: [
    {
      breakpoint: 800,
      settings: {
        arrows: false,
        slidesToShow: 1 } }] });




};exports.default =

carousel;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"vendor/jquery.slick.js":19}],18:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var socialShare = function socialShare(fbId) {
  var $body = (0, _jquery2.default)('body');

  // Facebook sharing with the SDK
  _jquery2.default.getScript('//connect.facebook.net/en_US/sdk.js').done(function () {
    $body.on('click.sharer-fb', '.sharer-fb', function (e) {
      var $link = (0, _jquery2.default)(e.currentTarget);
      var options = {
        method: 'feed',
        display: 'popup' };

      var newUrl = $link.data('redirect-to') ?
      $link.data('redirect-to') : null;

      e.preventDefault();

      window.FB.init({
        appId: fbId,
        xfbml: false,
        version: 'v2.0',
        status: false,
        cookie: true });


      if ($link.data('title')) {
        options.name = $link.data('title');
      }

      if ($link.data('url')) {
        options.link = $link.data('url');
      }

      if ($link.data('picture')) {
        options.picture = $link.data('picture');
      }

      if ($link.data('description')) {
        options.description = $link.data('description');
      }

      window.FB.ui(options, function (response) {
        if (newUrl) {
          window.location.href = newUrl;
        }
      });
    });
  });

  // Twitter sharing
  $body.on('click.sharer-tw', '.sharer-tw', function (e) {
    var $link = (0, _jquery2.default)(e.currentTarget);
    var url = $link.data('url');
    var text = $link.data('description');
    var via = $link.data('source');
    var twitterURL = 'https://twitter.com/share?url=' + encodeURIComponent(url);

    e.preventDefault();

    if (text) {
      twitterURL += '&text=' + encodeURIComponent(text);
    }
    if (via) {
      twitterURL += '&via=' + encodeURIComponent(via);
    }
    window.open(twitterURL, 'tweet',
    'width=500,height=384,menubar=no,status=no,toolbar=no');
  });

  // LinkedIn sharing
  $body.on('click.sharer-li', '.sharer-li', function (e) {
    var $link = (0, _jquery2.default)(e.target);
    var url = $link.data('url');
    var title = $link.data('title');
    var summary = $link.data('description');
    var source = $link.data('source');
    var linkedinURL = 'https://www.linkedin.com/shareArticle?mini=true&url=' +
    encodeURIComponent(url);

    e.preventDefault();

    if (title) {
      linkedinURL += '&title=' + encodeURIComponent(title);
    } else {
      linkedinURL += '&title=';
    }

    if (summary) {
      linkedinURL += '&summary=' +
      encodeURIComponent(summary.substring(0, 256));
    }

    if (source) {
      linkedinURL += '&source=' + encodeURIComponent(source);
    }

    window.open(linkedinURL, 'linkedin',
    'width=520,height=570,menubar=no,status=no,toolbar=no');
  });
};exports.default =

socialShare;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],19:[function(require,module,exports){
(function (global){
'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;}; /*
                                                                                                                                                                                                                                                                                            _ _      _       _
                                                                                                                                                                                                                                                                                        ___| (_) ___| | __  (_)___
                                                                                                                                                                                                                                                                                       / __| | |/ __| |/ /  | / __|
                                                                                                                                                                                                                                                                                       \__ \ | | (__|   < _ | \__ \
                                                                                                                                                                                                                                                                                       |___/_|_|\___|_|\_(_)/ |___/
                                                                                                                                                                                                                                                                                                          |__/
                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                        Version: 1.5.0
                                                                                                                                                                                                                                                                                         Author: Ken Wheeler
                                                                                                                                                                                                                                                                                        Website: http://kenwheeler.github.io
                                                                                                                                                                                                                                                                                           Docs: http://kenwheeler.github.io/slick
                                                                                                                                                                                                                                                                                           Repo: http://github.com/kenwheeler/slick
                                                                                                                                                                                                                                                                                         Issues: http://github.com/kenwheeler/slick/issues
                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                        */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory((typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null));
    } else {
        factory(jQuery);
    }

})(function ($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = function () {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this,
            dataSettings,responsiveSettings,breakpoint;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="previous">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="next">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function customPaging(slider, i) {
                    return '<button type="button" data-role="none">' + (i + 1) + '</button>';
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true };


            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false };


            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.hidden = 'hidden';
            _.paused = false;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, dataSettings, settings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;
            responsiveSettings = _.options.responsive || null;

            if (responsiveSettings && responsiveSettings.length > -1) {
                _.respondTo = _.options.respondTo || 'window';
                for (breakpoint in responsiveSettings) {
                    if (responsiveSettings.hasOwnProperty(breakpoint)) {
                        _.breakpoints.push(responsiveSettings[
                        breakpoint].breakpoint);
                        _.breakpointSettings[responsiveSettings[
                        breakpoint].breakpoint] =
                        responsiveSettings[breakpoint].settings;
                    }
                }
                _.breakpoints.sort(function (a, b) {
                    if (_.options.mobileFirst === true) {
                        return a - b;
                    } else {
                        return b - a;
                    }
                });
            }

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.msHidden !== 'undefined') {
                _.hidden = 'msHidden';
                _.visibilityChange = 'msvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;

            _.init();

            _.checkResponsive(true);

        }

        return Slick;

    }();

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {

        var _ = this;

        if (typeof index === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || index >= _.slideCount) {
            return false;
        }

        _.unload();

        if (typeof index === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function () {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight },
            _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function (targetLeft, callback) {

        var animProps = {},
        _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft },
                _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft },
                _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -_.currentLeft;
                }
                $({
                    animStart: _.currentLeft }).
                animate({
                    animStart: targetLeft },
                {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function step(now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                            now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                            now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function complete() {
                        if (callback) {
                            callback.call();
                        }
                    } });


            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function () {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.asNavFor = function (index) {
        var _ = this,
        asNavFor = _.options.asNavFor !== null ? $(_.options.asNavFor).slick('getSlick') : null;
        if (asNavFor !== null) asNavFor.slideHandler(index, true);
    };

    Slick.prototype.applyTransition = function (slide) {

        var _ = this,
        transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function () {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

        if (_.slideCount > _.options.slidesToShow && _.paused !== true) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator,
            _.options.autoplaySpeed);
        }

    };

    Slick.prototype.autoPlayClear = function () {

        var _ = this;
        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function () {

        var _ = this;

        if (_.options.infinite === false) {

            if (_.direction === 1) {

                if (_.currentSlide + 1 === _.slideCount -
                1) {
                    _.direction = 0;
                }

                _.slideHandler(_.currentSlide + _.options.slidesToScroll);

            } else {

                if (_.currentSlide - 1 === 0) {

                    _.direction = 1;

                }

                _.slideHandler(_.currentSlide - _.options.slidesToScroll);

            }

        } else {

            _.slideHandler(_.currentSlide + _.options.slidesToScroll);

        }

    };

    Slick.prototype.buildArrows = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow = $(_.options.prevArrow);
            _.$nextArrow = $(_.options.nextArrow);

            if (_.htmlExpr.test(_.options.prevArrow)) {
                _.$prevArrow.appendTo(_.options.appendArrows);
            }

            if (_.htmlExpr.test(_.options.nextArrow)) {
                _.$nextArrow.appendTo(_.options.appendArrows);
            }

            if (_.options.infinite !== true) {
                _.$prevArrow.addClass('slick-disabled');
            }

        }

    };

    Slick.prototype.buildDots = function () {

        var _ = this,
        i,dotString;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            dotString = '<ul class="' + _.options.dotsClass + '">';

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dotString += '<li>' + _.options.customPaging.call(this, _, i) + '</li>';
            }

            dotString += '</ul>';

            _.$dots = $(dotString).appendTo(
            _.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');

        }

    };

    Slick.prototype.buildOut = function () {

        var _ = this;

        _.$slides = _.$slider.children(
        ':not(.slick-cloned)').addClass(
        'slick-slide');
        _.slideCount = _.$slides.length;

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.$slider.addClass('slick-slider');

        _.$slideTrack = _.slideCount === 0 ?
        $('<div class="slick-track"/>').appendTo(_.$slider) :
        _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
        '<div aria-live="polite" class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();

        if (_.options.accessibility === true) {
            _.$list.prop('tabIndex', 0);
        }

        _.setSlideClasses(typeof this.currentSlide === 'number' ? this.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function () {

        var _ = this,a,b,c,newSlides,numOfSlides,originalSlides,slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if (_.options.rows > 1) {
            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
            originalSlides.length / slidesPerSection);


            for (a = 0; a < numOfSlides; a++) {
                var slide = document.createElement('div');
                for (b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for (c = 0; c < _.options.slidesPerRow; c++) {
                        var target = a * slidesPerSection + (b * _.options.slidesPerRow + c);
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            };
            _.$slider.html(newSlides);
            _.$slider.children().children().children().
            width(100 / _.options.slidesPerRow + "%").
            css({ 'display': 'inline-block' });
        };

    };

    Slick.prototype.checkResponsive = function (initial) {

        var _ = this,
        breakpoint,targetBreakpoint,respondToWidth;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();
        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if (_.originalSettings.responsive && _.originalSettings.
        responsive.length > -1 && _.originalSettings.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint) {
                        _.activeBreakpoint =
                        targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick();
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                            targetBreakpoint]);
                            if (initial === true)
                            _.currentSlide = _.options.initialSlide;
                            _.refresh();
                        }
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick();
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                        _.breakpointSettings[
                        targetBreakpoint]);
                        if (initial === true)
                        _.currentSlide = _.options.initialSlide;
                        _.refresh();
                    }
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true)
                    _.currentSlide = _.options.initialSlide;
                    _.refresh();
                }
            }

        }

    };

    Slick.prototype.changeSlide = function (event, dontAnimate) {

        var _ = this,
        $target = $(event.target),
        indexOffset,slideOffset,unevenOffset;

        // If target is a link, prevent default action.
        $target.is('a') && event.preventDefault();

        unevenOffset = _.slideCount % _.options.slidesToScroll !== 0;
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                event.data.index || $(event.target).parent().index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                break;

            default:
                return;}


    };

    Slick.prototype.checkNavigable = function (index) {

        var _ = this,
        navigables,prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function () {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).off('click.slick', _.changeSlide);
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.options.autoplay === true) {
            $('li', _.$dots).
            off('mouseenter.slick', _.setPaused.bind(_, true)).
            off('mouseleave.slick', _.setPaused.bind(_, false));
        }

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        if (_.options.autoplay === true) {
            $(document).off(_.visibilityChange, _.visibility);
        }

        _.$list.off('mouseenter.slick', _.setPaused.bind(_, true));
        _.$list.off('mouseleave.slick', _.setPaused.bind(_, false));

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).off('ready.slick.slick-' + _.instanceUid, _.setPosition);
    };

    Slick.prototype.cleanUpRows = function () {

        var _ = this,originalSlides;

        if (_.options.rows > 1) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.html(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function (event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function () {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow && _typeof(_.options.prevArrow) !== 'object') {
            _.$prevArrow.remove();
        }
        if (_.$nextArrow && _typeof(_.options.nextArrow) !== 'object') {
            _.$nextArrow.remove();
        }

        if (_.$slides) {
            _.$slides.removeClass('slick-slide slick-active slick-center slick-visible').
            attr('aria-hidden', 'true').
            removeAttr('data-slick-index').
            css({
                position: '',
                left: '',
                top: '',
                zIndex: '',
                opacity: '',
                width: '' });


            _.$slider.html(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');

    };

    Slick.prototype.disableTransition = function (slide) {

        var _ = this,
        transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function (slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: 1000 });


            _.$slides.eq(slideIndex).animate({
                opacity: 1 },
            _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: 1000 });


            if (callback) {
                setTimeout(function () {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {

        var _ = this;

        if (filter !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function () {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            pagerQty = Math.ceil(_.slideCount / _.options.slidesToScroll);
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToShow;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function (slideIndex) {

        var _ = this,
        targetLeft,
        verticalHeight,
        verticalOffset = 0,
        targetSlide;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight();

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
                verticalOffset = verticalHeight * _.options.slidesToShow * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth * -1;
                        verticalOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight * -1;
                    } else {
                        _.slideOffset = _.slideCount % _.options.slidesToScroll * _.slideWidth * -1;
                        verticalOffset = _.slideCount % _.options.slidesToScroll * verticalHeight * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * _.slideWidth;
                verticalOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = slideIndex * _.slideWidth * -1 + _.slideOffset;
        } else {
            targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;

            if (_.options.centerMode === true) {
                if (_.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function () {

        var _ = this,
        breakPoint = 0,
        counter = 0,
        indexes = [],
        max;

        if (_.options.infinite === false) {
            max = _.slideCount - _.options.slidesToShow + 1;
            if (_.options.centerMode === true) max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function () {

        return this;

    };

    Slick.prototype.getSlideCount = function () {

        var _ = this,
        slidesTraversed,swipedSlide,centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function (index, slide) {
                if (slide.offsetLeft - centerOffset + $(slide).outerWidth() / 2 > _.swipeLeft * -1) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide) } },

        dontAnimate);

    };

    Slick.prototype.init = function () {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');
            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
        }

        _.$slider.trigger('init', [_]);

    };

    Slick.prototype.initArrowEvents = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.on('click.slick', {
                message: 'previous' },
            _.changeSlide);
            _.$nextArrow.on('click.slick', {
                message: 'next' },
            _.changeSlide);
        }

    };

    Slick.prototype.initDotEvents = function () {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index' },
            _.changeSlide);
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.options.autoplay === true) {
            $('li', _.$dots).
            on('mouseenter.slick', _.setPaused.bind(_, true)).
            on('mouseleave.slick', _.setPaused.bind(_, false));
        }

    };

    Slick.prototype.initializeEvents = function () {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start' },
        _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move' },
        _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end' },
        _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end' },
        _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        if (_.options.autoplay === true) {
            $(document).on(_.visibilityChange, _.visibility.bind(_));
        }

        _.$list.on('mouseenter.slick', _.setPaused.bind(_, true));
        _.$list.on('mouseleave.slick', _.setPaused.bind(_, false));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange.bind(_));

        $(window).on('resize.slick.slick-' + _.instanceUid, _.resize.bind(_));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.initUI = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

        if (_.options.autoplay === true) {

            _.autoPlay();

        }

    };

    Slick.prototype.keyHandler = function (event) {

        var _ = this;

        if (event.keyCode === 37 && _.options.accessibility === true) {
            _.changeSlide({
                data: {
                    message: 'previous' } });


        } else if (event.keyCode === 39 && _.options.accessibility === true) {
            _.changeSlide({
                data: {
                    message: 'next' } });


        }

    };

    Slick.prototype.lazyLoad = function () {

        var _ = this,
        loadRange,cloneRange,rangeStart,rangeEnd;

        function loadImages(imagesScope) {
            $('img[data-lazy]', imagesScope).each(function () {
                var image = $(this),
                imageSource = $(this).attr('data-lazy'),
                imageToLoad = document.createElement('img');

                imageToLoad.onload = function () {
                    image.animate({
                        opacity: 1 },
                    200);
                };
                imageToLoad.src = imageSource;

                image.
                css({
                    opacity: 0 }).

                attr('src', imageSource).
                removeAttr('data-lazy').
                removeClass('slick-loading');
            });
        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = rangeStart + _.options.slidesToShow;
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }

    };

    Slick.prototype.loadSlider = function () {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1 });


        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next' } });



    };

    Slick.prototype.orientationChange = function () {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function () {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function () {

        var _ = this;

        _.paused = false;
        _.autoPlay();

    };

    Slick.prototype.postSlide = function (index) {

        var _ = this;

        _.$slider.trigger('afterChange', [_, index]);

        _.animating = false;

        _.setPosition();

        _.swipeLeft = null;

        if (_.options.autoplay === true && _.paused === false) {
            _.autoPlay();
        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous' } });



    };

    Slick.prototype.preventDefault = function (e) {
        e.preventDefault();
    };

    Slick.prototype.progressiveLazyLoad = function () {

        var _ = this,
        imgCount,targetImage;

        imgCount = $('img[data-lazy]', _.$slider).length;

        if (imgCount > 0) {
            targetImage = $('img[data-lazy]', _.$slider).first();
            targetImage.attr('src', targetImage.attr('data-lazy')).removeClass('slick-loading').load(function () {
                targetImage.removeAttr('data-lazy');
                _.progressiveLazyLoad();

                if (_.options.adaptiveHeight === true) {
                    _.setPosition();
                }
            }).
            error(function () {
                targetImage.removeAttr('data-lazy');
                _.progressiveLazyLoad();
            });
        }

    };

    Slick.prototype.refresh = function () {

        var _ = this,
        currentSlide = _.currentSlide;

        _.destroy();

        $.extend(_, _.initials);

        _.init();

        _.changeSlide({
            data: {
                message: 'index',
                index: currentSlide } },

        false);

    };

    Slick.prototype.reinit = function () {

        var _ = this;

        _.$slides = _.$slideTrack.children(_.options.slide).addClass(
        'slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.setProps();

        _.setupInfinite();

        _.buildArrows();

        _.updateArrows();

        _.initArrowEvents();

        _.buildDots();

        _.updateDots();

        _.initDotEvents();

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(0);

        _.setPosition();

        _.$slider.trigger('reInit', [_]);

    };

    Slick.prototype.resize = function () {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function () {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                _.setPosition();
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {

        var _ = this;

        if (typeof index === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function (position) {

        var _ = this,
        positionProps = {},
        x,y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function () {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: '0px ' + _.options.centerPadding });

            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: _.options.centerPadding + ' 0px' });

            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil(_.slideWidth * _.$slideTrack.children('.slick-slide').length));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function () {

        var _ = this,
        targetLeft;

        _.$slides.each(function (index, element) {
            targetLeft = _.slideWidth * index * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: 800,
                    opacity: 0 });

            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: 800,
                    opacity: 0 });

            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: 900,
            opacity: 1 });


    };

    Slick.prototype.setHeight = function () {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption = Slick.prototype.slickSetOption = function (option, value, refresh) {

        var _ = this;
        _.options[option] = value;

        if (refresh === true) {
            _.unload();
            _.reinit();
        }

    };

    Slick.prototype.setPosition = function () {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function () {

        var _ = this,
        bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
        bodyStyle.MozTransition !== undefined ||
        bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.animType !== null && _.animType !== false;

    };


    Slick.prototype.setSlideClasses = function (index) {

        var _ = this,
        centerOffset,allSlides,indexOffset,remainder;

        _.$slider.find('.slick-slide').removeClass('slick-active').attr('aria-hidden', 'true').removeClass('slick-center');
        allSlides = _.$slider.find('.slick-slide');

        if (_.options.centerMode === true) {

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {
                    _.$slides.slice(index - centerOffset, index + centerOffset + 1).addClass('slick-active').attr('aria-hidden', 'false');
                } else {
                    indexOffset = _.options.slidesToShow + index;
                    allSlides.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).addClass('slick-active').attr('aria-hidden', 'false');
                }

                if (index === 0) {
                    allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
                } else if (index === _.slideCount - 1) {
                    allSlides.eq(_.options.slidesToShow).addClass('slick-center');
                }

            }

            _.$slides.eq(index).addClass('slick-center');

        } else {

            if (index >= 0 && index <= _.slideCount - _.options.slidesToShow) {
                _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
            } else if (allSlides.length <= _.options.slidesToShow) {
                allSlides.addClass('slick-active').attr('aria-hidden', 'false');
            } else {
                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;
                if (_.options.slidesToShow == _.options.slidesToScroll && _.slideCount - index < _.options.slidesToShow) {
                    allSlides.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder).addClass('slick-active').attr('aria-hidden', 'false');
                } else {
                    allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
                }
            }

        }

        if (_.options.lazyLoad === 'ondemand') {
            _.lazyLoad();
        }

    };

    Slick.prototype.setupInfinite = function () {

        var _ = this,
        i,slideIndex,infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > _.slideCount -
                infiniteCount; i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '').
                    attr('data-slick-index', slideIndex - _.slideCount).
                    prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '').
                    attr('data-slick-index', slideIndex + _.slideCount).
                    appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.setPaused = function (paused) {

        var _ = this;

        if (_.options.autoplay === true && _.options.pauseOnHover === true) {
            _.paused = paused;
            _.autoPlayClear();
        }
    };

    Slick.prototype.selectHandler = function (event) {

        var _ = this;

        var targetElement = $(event.target).is('.slick-slide') ?
        $(event.target) :
        $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {
            _.$slider.find('.slick-slide').removeClass('slick-active').attr('aria-hidden', 'true');
            _.$slides.eq(index).addClass('slick-active').attr("aria-hidden", "false");
            if (_.options.centerMode === true) {
                _.$slider.find('.slick-slide').removeClass('slick-center');
                _.$slides.eq(index).addClass('slick-center');
            }
            _.asNavFor(index);
            return;
        }
        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function (index, sync, dontAnimate) {

        var targetSlide,animSlide,oldSlide,slideLeft,targetLeft = null,
        _ = this;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > _.slideCount - _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if (_.options.autoplay === true) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - _.slideCount % _.options.slidesToScroll;
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger("beforeChange", [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {
                _.fadeSlide(animSlide, function () {
                    _.postSlide(animSlide);
                });
            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true) {
            _.animateSlide(targetLeft, function () {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function () {

        var xDist,yDist,r,swipeAngle,_ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if (swipeAngle <= 45 && swipeAngle >= 0) {
            return _.options.rtl === false ? 'left' : 'right';
        }
        if (swipeAngle <= 360 && swipeAngle >= 315) {
            return _.options.rtl === false ? 'left' : 'right';
        }
        if (swipeAngle >= 135 && swipeAngle <= 225) {
            return _.options.rtl === false ? 'right' : 'left';
        }
        if (_.options.verticalSwiping === true) {
            if (swipeAngle >= 35 && swipeAngle <= 135) {
                return 'left';
            } else {
                return 'right';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function (event) {

        var _ = this,
        slideCount;

        _.dragging = false;

        _.shouldClick = _.touchObject.swipeLength > 10 ? false : true;

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.edgeHit === true) {
            _.$slider.trigger("edge", [_, _.swipeDirection()]);
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {

            switch (_.swipeDirection()) {
                case 'left':
                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount();
                    _.slideHandler(slideCount);
                    _.currentDirection = 0;
                    _.touchObject = {};
                    _.$slider.trigger("swipe", [_, "left"]);
                    break;

                case 'right':
                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount();
                    _.slideHandler(slideCount);
                    _.currentDirection = 1;
                    _.touchObject = {};
                    _.$slider.trigger("swipe", [_, "right"]);
                    break;}

        } else {
            if (_.touchObject.startX !== _.touchObject.curX) {
                _.slideHandler(_.currentSlide);
                _.touchObject = {};
            }
        }

    };

    Slick.prototype.swipeHandler = function (event) {

        var _ = this;

        if (_.options.swipe === false || 'ontouchend' in document && _.options.swipe === false) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
        event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options.
        touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options.
            touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;}



    };

    Slick.prototype.swipeMove = function (event) {

        var _ = this,
        edgeWasHit = false,
        curLeft,swipeDirection,swipeLength,positionOffset,touches;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
        Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));
        }

        swipeDirection = _.swipeDirection();

        if (swipeDirection === 'vertical') {
            return;
        }

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if (_.currentSlide === 0 && swipeDirection === "right" || _.currentSlide >= _.getDotCount() && swipeDirection === "left") {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + swipeLength * (_.$list.height() / _.listWidth) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function (event) {

        var _ = this,
        touches;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function () {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow && _typeof(_.options.prevArrow) !== 'object') {
            _.$prevArrow.remove();
        }
        if (_.$nextArrow && _typeof(_.options.nextArrow) !== 'object') {
            _.$nextArrow.remove();
        }
        _.$slides.removeClass('slick-slide slick-active slick-visible').attr("aria-hidden", "true").css('width', '');

    };

    Slick.prototype.unslick = function () {

        var _ = this;
        _.destroy();

    };

    Slick.prototype.updateArrows = function () {

        var _ = this,
        centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if (_.options.arrows === true && _.options.infinite !==
        true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.removeClass('slick-disabled');
            _.$nextArrow.removeClass('slick-disabled');
            if (_.currentSlide === 0) {
                _.$prevArrow.addClass('slick-disabled');
                _.$nextArrow.removeClass('slick-disabled');
            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {
                _.$nextArrow.addClass('slick-disabled');
                _.$prevArrow.removeClass('slick-disabled');
            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {
                _.$nextArrow.addClass('slick-disabled');
                _.$prevArrow.removeClass('slick-disabled');
            }
        }

    };

    Slick.prototype.updateDots = function () {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots.find('li').removeClass('slick-active').attr("aria-hidden", "true");
            _.$dots.find('li').eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass('slick-active').attr("aria-hidden", "false");

        }

    };

    Slick.prototype.visibility = function () {

        var _ = this;

        if (document[_.hidden]) {
            _.paused = true;
            _.autoPlayClear();
        } else {
            _.paused = false;
            _.autoPlay();
        }

    };

    $.fn.slick = function () {
        var _ = this,
        opt = arguments[0],
        args = Array.prototype.slice.call(arguments, 1),
        l = _.length,
        i = 0,
        ret;
        for (i; i < l; i++) {
            if ((typeof opt === 'undefined' ? 'undefined' : _typeof(opt)) == 'object' || typeof opt == 'undefined')
            _[i].slick = new Slick(_[i], opt);else

            ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[15])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3NzLXZhcnMtcG9ueWZpbGwvZGlzdC9jc3MtdmFycy1wb255ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9mb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24uY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9mb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24uZHJpbGxkb3duLmpzIiwibm9kZV9tb2R1bGVzL2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi5kcm9wZG93bk1lbnUuanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLm9mZmNhbnZhcy5qcyIsIm5vZGVfbW9kdWxlcy9mb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24ucmVzcG9uc2l2ZU1lbnUuanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwibm9kZV9tb2R1bGVzL2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwibm9kZV9tb2R1bGVzL2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwibm9kZV9tb2R1bGVzL2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsIm5vZGVfbW9kdWxlcy9mb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsIm5vZGVfbW9kdWxlcy9mb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL21vZHVsZXMvYWNjb3JkaW9uLmpzIiwic3JjL2pzL21vZHVsZXMvY2Fyb3VzZWwuanMiLCJzcmMvanMvbW9kdWxlcy9zb2NpYWxTaGFyZS5qcyIsInNyYy9qcy92ZW5kb3IvanF1ZXJ5LnNsaWNrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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Q0FBYixDQURKOztBQUdJLGtCQUFNLEVBQUUsQ0FBRixFQUFLLEtBQUwsQ0FBVyxHQUFYLEVBQWdCLEtBQWhCLENBQXNCLEVBQUUsQ0FBRixFQUFLLEtBQTNCLEVBQWtDLElBQWxDLENBQU47QUFDSixnQkFBSSxPQUFPLEdBQVAsSUFBYyxXQUFsQixFQUErQixPQUFPLEdBQVA7QUFDbEM7QUFDRCxlQUFPLENBQVA7QUFDSCxLQWZEOztBQWlCSCxDQS91RUEsQ0FBRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIGNzcy12YXJzLXBvbnlmaWxsXG4gKiB2MS4yLjJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qaGlsZGVuYmlkZGxlL2Nzcy12YXJzLXBvbnlmaWxsXG4gKiAoYykgMjAxOCBKb2huIEhpbGRlbmJpZGRsZSA8aHR0cDovL2hpbGRlbmJpZGRsZS5jb20+XG4gKiBNSVQgbGljZW5zZVxuICovXG4oZnVuY3Rpb24oZ2xvYmFsLCBmYWN0b3J5KSB7XG4gICAgdHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDogdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOiBnbG9iYWwuY3NzVmFycyA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIC8qIVxuICogZ2V0LWNzcy1kYXRhXG4gKiB2MS4xLjFcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qaGlsZGVuYmlkZGxlL2dldC1jc3MtZGF0YVxuICogKGMpIDIwMTggSm9obiBIaWxkZW5iaWRkbGUgPGh0dHA6Ly9oaWxkZW5iaWRkbGUuY29tPlxuICogTUlUIGxpY2Vuc2VcbiAqLyAgICBmdW5jdGlvbiBnZXRVcmxzKHVybHMpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICBtaW1lVHlwZTogb3B0aW9ucy5taW1lVHlwZSB8fCBudWxsLFxuICAgICAgICAgICAgb25Db21wbGV0ZTogb3B0aW9ucy5vbkNvbXBsZXRlIHx8IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICAgICAgICAgIG9uRXJyb3I6IG9wdGlvbnMub25FcnJvciB8fCBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgICAgICAgICBvblN1Y2Nlc3M6IG9wdGlvbnMub25TdWNjZXNzIHx8IEZ1bmN0aW9uLnByb3RvdHlwZVxuICAgICAgICB9O1xuICAgICAgICB2YXIgdXJsQXJyYXkgPSBBcnJheS5pc0FycmF5KHVybHMpID8gdXJscyA6IFsgdXJscyBdO1xuICAgICAgICB2YXIgdXJsUXVldWUgPSBBcnJheS5hcHBseShudWxsLCBBcnJheSh1cmxBcnJheS5sZW5ndGgpKS5tYXAoZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgICBmdW5jdGlvbiBvbkVycm9yKHhociwgdXJsSW5kZXgpIHtcbiAgICAgICAgICAgIHNldHRpbmdzLm9uRXJyb3IoeGhyLCB1cmxBcnJheVt1cmxJbmRleF0sIHVybEluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3MocmVzcG9uc2VUZXh0LCB1cmxJbmRleCkge1xuICAgICAgICAgICAgdXJsUXVldWVbdXJsSW5kZXhdID0gcmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgc2V0dGluZ3Mub25TdWNjZXNzKHJlc3BvbnNlVGV4dCwgdXJsQXJyYXlbdXJsSW5kZXhdLCB1cmxJbmRleCk7XG4gICAgICAgICAgICBpZiAodXJsUXVldWUuaW5kZXhPZihudWxsKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5vbkNvbXBsZXRlKHVybFF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB1cmxBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHVybCwgaSkge1xuICAgICAgICAgICAgdmFyIHBhcnNlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICAgICAgcGFyc2VyLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgdXJsKTtcbiAgICAgICAgICAgIHBhcnNlci5ocmVmID0gcGFyc2VyLmhyZWY7XG4gICAgICAgICAgICB2YXIgaXNDcm9zc0RvbWFpbiA9IHBhcnNlci5ob3N0ICE9PSBsb2NhdGlvbi5ob3N0O1xuICAgICAgICAgICAgdmFyIGlzU2FtZVByb3RvY29sID0gcGFyc2VyLnByb3RvY29sID09PSBsb2NhdGlvbi5wcm90b2NvbDtcbiAgICAgICAgICAgIGlmIChpc0Nyb3NzRG9tYWluICYmIHR5cGVvZiBYRG9tYWluUmVxdWVzdCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIGlmIChpc1NhbWVQcm90b2NvbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgeGRyID0gbmV3IFhEb21haW5SZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIHhkci5vcGVuKFwiR0VUXCIsIHVybCk7XG4gICAgICAgICAgICAgICAgICAgIHhkci50aW1lb3V0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgeGRyLm9ucHJvZ3Jlc3MgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4gICAgICAgICAgICAgICAgICAgIHhkci5vbnRpbWVvdXQgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4gICAgICAgICAgICAgICAgICAgIHhkci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3VjY2Vzcyh4ZHIucmVzcG9uc2VUZXh0LCBpKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgeGRyLm9uZXJyb3IgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoeGRyLCBpKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhkci5zZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSW50ZXJuZXQgRXhwbG9yZXIgOSBDcm9zcy1PcmlnaW4gKENPUlMpIHJlcXVlc3RzIG11c3QgdXNlIHRoZSBzYW1lIHByb3RvY29sXCIpO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKG51bGwsIGkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIHhoci5vcGVuKFwiR0VUXCIsIHVybCk7XG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLm1pbWVUeXBlICYmIHhoci5vdmVycmlkZU1pbWVUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIHhoci5vdmVycmlkZU1pbWVUeXBlKHNldHRpbmdzLm1pbWVUeXBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3MoeGhyLnJlc3BvbnNlVGV4dCwgaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoeGhyLCBpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgeGhyLnNlbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICogR2V0cyBDU1MgZGF0YSBmcm9tIDxzdHlsZT4gYW5kIDxsaW5rPiBub2RlcyAoaW5jbHVkaW5nIEBpbXBvcnRzKSwgdGhlblxuICogcmV0dXJucyBkYXRhIGluIG9yZGVyIHByb2Nlc3NlZCBieSBET00uIEFsbG93cyBzcGVjaWZ5aW5nIG5vZGVzIHRvXG4gKiBpbmNsdWRlL2V4Y2x1ZGUgYW5kIGZpbHRlcmluZyBDU1MgZGF0YSB1c2luZyBSZWdFeC5cbiAqXG4gKiBAcHJlc2VydmVcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucz17fV0gLSBUaGUgb3B0aW9ucyBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmluY2x1ZGUgLSBDU1Mgc2VsZWN0b3IgbWF0Y2hpbmcgPGxpbms+IGFuZCA8c3R5bGU+XG4gKiBub2RlcyB0byBpbmNsdWRlXG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5leGNsdWRlIC0gQ1NTIHNlbGVjdG9yIG1hdGNoaW5nIDxsaW5rPiBhbmQgPHN0eWxlPlxuICogbm9kZXMgdG8gZXhjbHVkZVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuZmlsdGVyIC0gUmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gZmlsdGVyIG5vZGUgQ1NTXG4gKiBkYXRhLiBFYWNoIGJsb2NrIG9mIENTUyBkYXRhIGlzIHRlc3RlZCBhZ2FpbnN0IHRoZSBmaWx0ZXIsIGFuZCBvbmx5IG1hdGNoaW5nXG4gKiBkYXRhIGlzIGluY2x1ZGVkLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gb3B0aW9ucy5vbkNvbXBsZXRlIC0gQ2FsbGJhY2sgYWZ0ZXIgYWxsIG5vZGVzIGhhdmUgYmVlblxuICogcHJvY2Vzc2VkLiBQYXNzZXMgMSkgY29uY2F0ZW5hdGVkIENTUyB0ZXh0LCAyKSBhbiBhcnJheSBvZiBDU1MgdGV4dCBpbiBET01cbiAqIG9yZGVyLCBhbmQgMykgYW4gYXJyYXkgb2Ygbm9kZXMgaW4gRE9NIG9yZGVyIGFzIGFyZ3VtZW50cy5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdGlvbnMub25FcnJvciAtIENhbGxiYWNrIG9uIGVhY2ggZXJyb3IuIFBhc3NlcyAxKSB0aGUgWEhSXG4gKiBvYmplY3QgZm9yIGluc3BlY3Rpb24sIDIpIHNvdXJlIG5vZGUgcmVmZXJlbmNlLCBhbmQgMykgdGhlIHNvdXJjZSBVUkwgdGhhdFxuICogZmFpbGVkIChlaXRoZXIgYSA8bGluaz4gaHJlZiBvciBhbiBAaW1wb3J0KSBhcyBhcmd1bWVudHNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdGlvbnMub25TdWNjZXNzIC0gQ2FsbGJhY2sgb24gZWFjaCBDU1Mgbm9kZSByZWFkLiBQYXNzZXNcbiAqIDEpIENTUyB0ZXh0LCAyKSBzb3VyY2Ugbm9kZSByZWZlcmVuY2UsIGFuZCAzKSB0aGUgc291cmNlIFVSTCAoZWl0aGVyIGEgPGxpbms+XG4gKiAgICBocmVmIG9yIGFuIGltcG9ydCkgYXMgYXJndW1lbnRzLlxuICogQGV4YW1wbGVcbiAqXG4gKiAgIGdldENzc0RhdGEoe1xuICogICAgIGluY2x1ZGU6ICdzdHlsZSxsaW5rW3JlbD1cInN0eWxlc2hlZXRcIl0nLCAvLyBkZWZhdWx0XG4gKiAgICAgZXhjbHVkZTogJ1tocmVmPVwic2tpcC5jc3NcIl0nLFxuICogICAgIGZpbHRlciA6IC9yZWQvLFxuICogICAgIG9uQ29tcGxldGUoY3NzVGV4dCwgY3NzQXJyYXkpIHtcbiAqICAgICAgIC8vIC4uLlxuICogICAgIH0sXG4gKiAgICAgb25FcnJvcih4aHIsIG5vZGUsIHVybCkge1xuICogICAgICAgLy8gLi4uXG4gKiAgICAgfSxcbiAqICAgICBvblN1Y2Nlc3MoY3NzVGV4dCwgbm9kZSwgdXJsKSB7XG4gKiAgICAgICAvLyAuLi5cbiAqICAgICB9XG4gKiAgIH0pO1xuICovICAgIGZ1bmN0aW9uIGdldENzc0RhdGEob3B0aW9ucykge1xuICAgICAgICB2YXIgcmVnZXggPSB7XG4gICAgICAgICAgICBjc3NDb21tZW50czogL1xcL1xcKltcXHNcXFNdKz9cXCpcXC8vZyxcbiAgICAgICAgICAgIGNzc0ltcG9ydHM6IC8oPzpAaW1wb3J0XFxzKikoPzp1cmxcXChcXHMqKT8oPzpbJ1wiXSkoW14nXCJdKikoPzpbJ1wiXSkoPzpcXHMqXFwpKT8oPzpbXjtdKjspL2dcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgaW5jbHVkZTogb3B0aW9ucy5pbmNsdWRlIHx8ICdzdHlsZSxsaW5rW3JlbD1cInN0eWxlc2hlZXRcIl0nLFxuICAgICAgICAgICAgZXhjbHVkZTogb3B0aW9ucy5leGNsdWRlIHx8IG51bGwsXG4gICAgICAgICAgICBmaWx0ZXI6IG9wdGlvbnMuZmlsdGVyIHx8IG51bGwsXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiBvcHRpb25zLm9uQ29tcGxldGUgfHwgRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgICAgICAgICAgb25FcnJvcjogb3B0aW9ucy5vbkVycm9yIHx8IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICAgICAgICAgIG9uU3VjY2Vzczogb3B0aW9ucy5vblN1Y2Nlc3MgfHwgRnVuY3Rpb24ucHJvdG90eXBlXG4gICAgICAgIH07XG4gICAgICAgIHZhciBzb3VyY2VOb2RlcyA9IEFycmF5LmFwcGx5KG51bGwsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2V0dGluZ3MuaW5jbHVkZSkpLmZpbHRlcihmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gIW1hdGNoZXNTZWxlY3Rvcihub2RlLCBzZXR0aW5ncy5leGNsdWRlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBjc3NBcnJheSA9IEFycmF5LmFwcGx5KG51bGwsIEFycmF5KHNvdXJjZU5vZGVzLmxlbmd0aCkpLm1hcChmdW5jdGlvbih4KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUNvbXBsZXRlKCkge1xuICAgICAgICAgICAgdmFyIGlzQ29tcGxldGUgPSBjc3NBcnJheS5pbmRleE9mKG51bGwpID09PSAtMTtcbiAgICAgICAgICAgIGlmIChpc0NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNzc1RleHQgPSBjc3NBcnJheS5qb2luKFwiXCIpO1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLm9uQ29tcGxldGUoY3NzVGV4dCwgY3NzQXJyYXksIHNvdXJjZU5vZGVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcih4aHIsIG5vZGUsIHVybCwgY3NzSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjc3NUZXh0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiBcIlwiO1xuICAgICAgICAgICAgY3NzQXJyYXlbY3NzSW5kZXhdID0gY3NzVGV4dDtcbiAgICAgICAgICAgIHNldHRpbmdzLm9uRXJyb3IoeGhyLCBub2RlLCB1cmwpO1xuICAgICAgICAgICAgaGFuZGxlQ29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVTdWNjZXNzKGNzc1RleHQsIGNzc0luZGV4LCBub2RlLCBzb3VyY2VVcmwsIGltcG9ydFVybCkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5ncy5maWx0ZXIgfHwgc2V0dGluZ3MuZmlsdGVyLnRlc3QoY3NzVGV4dCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmV0dXJuVmFsID0gc2V0dGluZ3Mub25TdWNjZXNzKGNzc1RleHQsIG5vZGUsIGltcG9ydFVybCB8fCBzb3VyY2VVcmwpO1xuICAgICAgICAgICAgICAgIGNzc1RleHQgPSByZXR1cm5WYWwgPT09IGZhbHNlID8gXCJcIiA6IHJldHVyblZhbCB8fCBjc3NUZXh0O1xuICAgICAgICAgICAgICAgIHZhciBpbXBvcnRSdWxlcyA9IGNzc1RleHQucmVwbGFjZShyZWdleC5jc3NDb21tZW50cywgXCJcIikubWF0Y2gocmVnZXguY3NzSW1wb3J0cyk7XG4gICAgICAgICAgICAgICAgaWYgKGltcG9ydFJ1bGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbXBvcnRVcmxzID0gaW1wb3J0UnVsZXMubWFwKGZ1bmN0aW9uKGRlY2wpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWNsLnJlcGxhY2UocmVnZXguY3NzSW1wb3J0cywgXCIkMVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGltcG9ydFVybHMgPSBpbXBvcnRVcmxzLm1hcChmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXRGdWxsVXJsKHVybCwgc291cmNlVXJsKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGdldFVybHMoaW1wb3J0VXJscywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcjogZnVuY3Rpb24gb25FcnJvcih4aHIsIHVybCwgdXJsSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVFcnJvcih4aHIsIG5vZGUsIHVybCwgY3NzSW5kZXgsIGNzc1RleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzczogZnVuY3Rpb24gb25TdWNjZXNzKGltcG9ydFRleHQsIHVybCwgdXJsSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW1wb3J0RGVjbCA9IGltcG9ydFJ1bGVzW3VybEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW1wb3J0VXJsID0gaW1wb3J0VXJsc1t1cmxJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0Nzc1RleHQgPSBjc3NUZXh0LnJlcGxhY2UoaW1wb3J0RGVjbCwgaW1wb3J0VGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlU3VjY2VzcyhuZXdDc3NUZXh0LCBjc3NJbmRleCwgbm9kZSwgdXJsLCBpbXBvcnRVcmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjc3NBcnJheVtjc3NJbmRleF0gPSBjc3NUZXh0O1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVDb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3NzQXJyYXlbY3NzSW5kZXhdID0gXCJcIjtcbiAgICAgICAgICAgICAgICBoYW5kbGVDb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzb3VyY2VOb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNvdXJjZU5vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSwgaSkge1xuICAgICAgICAgICAgICAgIHZhciBsaW5rSHJlZiA9IG5vZGUuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKTtcbiAgICAgICAgICAgICAgICB2YXIgbGlua1JlbCA9IG5vZGUuZ2V0QXR0cmlidXRlKFwicmVsXCIpO1xuICAgICAgICAgICAgICAgIHZhciBpc0xpbmsgPSBub2RlLm5vZGVOYW1lID09PSBcIkxJTktcIiAmJiBsaW5rSHJlZiAmJiBsaW5rUmVsICYmIGxpbmtSZWwudG9Mb3dlckNhc2UoKSA9PT0gXCJzdHlsZXNoZWV0XCI7XG4gICAgICAgICAgICAgICAgdmFyIGlzU3R5bGUgPSBub2RlLm5vZGVOYW1lID09PSBcIlNUWUxFXCI7XG4gICAgICAgICAgICAgICAgaWYgKGlzTGluaykge1xuICAgICAgICAgICAgICAgICAgICBnZXRVcmxzKGxpbmtIcmVmLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaW1lVHlwZTogXCJ0ZXh0L2Nzc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcjogZnVuY3Rpb24gb25FcnJvcih4aHIsIHVybCwgdXJsSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVFcnJvcih4aHIsIG5vZGUsIHVybCwgaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzOiBmdW5jdGlvbiBvblN1Y2Nlc3MoY3NzVGV4dCwgdXJsLCB1cmxJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzb3VyY2VVcmwgPSBnZXRGdWxsVXJsKGxpbmtIcmVmLCBsb2NhdGlvbi5ocmVmKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVTdWNjZXNzKGNzc1RleHQsIGksIG5vZGUsIHNvdXJjZVVybCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNTdHlsZSkge1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVTdWNjZXNzKG5vZGUudGV4dENvbnRlbnQsIGksIG5vZGUsIGxvY2F0aW9uLmhyZWYpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNzc0FycmF5W2ldID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlQ29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldHRpbmdzLm9uQ29tcGxldGUoXCJcIiwgW10pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldEZ1bGxVcmwodXJsKSB7XG4gICAgICAgIHZhciBiYXNlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBsb2NhdGlvbi5ocmVmO1xuICAgICAgICB2YXIgZCA9IGRvY3VtZW50LmltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudChcIlwiKTtcbiAgICAgICAgdmFyIGIgPSBkLmNyZWF0ZUVsZW1lbnQoXCJiYXNlXCIpO1xuICAgICAgICB2YXIgYSA9IGQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgIGQuaGVhZC5hcHBlbmRDaGlsZChiKTtcbiAgICAgICAgZC5ib2R5LmFwcGVuZENoaWxkKGEpO1xuICAgICAgICBiLmhyZWYgPSBiYXNlO1xuICAgICAgICBhLmhyZWYgPSB1cmw7XG4gICAgICAgIHJldHVybiBhLmhyZWY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1hdGNoZXNTZWxlY3RvcihlbG0sIHNlbGVjdG9yKSB7XG4gICAgICAgIHZhciBtYXRjaGVzID0gZWxtLm1hdGNoZXMgfHwgZWxtLm1hdGNoZXNTZWxlY3RvciB8fCBlbG0ud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8IGVsbS5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgZWxtLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IGVsbS5vTWF0Y2hlc1NlbGVjdG9yO1xuICAgICAgICByZXR1cm4gbWF0Y2hlcy5jYWxsKGVsbSwgc2VsZWN0b3IpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBtZXJnZURlZXAoKSB7XG4gICAgICAgIHZhciBpc09iamVjdCA9IGZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICAgICAgICAgICAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIE9iamVjdCAmJiBvYmouY29uc3RydWN0b3IgPT09IE9iamVjdDtcbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIG9iamVjdHMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgICAgIG9iamVjdHNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iamVjdHMucmVkdWNlKGZ1bmN0aW9uKHByZXYsIG9iaikge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgICAgIHZhciBwVmFsID0gcHJldltrZXldO1xuICAgICAgICAgICAgICAgIHZhciBvVmFsID0gb2JqW2tleV07XG4gICAgICAgICAgICAgICAgaWYgKGlzT2JqZWN0KHBWYWwpICYmIGlzT2JqZWN0KG9WYWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZba2V5XSA9IG1lcmdlRGVlcChwVmFsLCBvVmFsKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwcmV2W2tleV0gPSBvVmFsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHByZXY7XG4gICAgICAgIH0sIHt9KTtcbiAgICB9XG4gICAgdmFyIGJhbGFuY2VkTWF0Y2ggPSBiYWxhbmNlZDtcbiAgICBmdW5jdGlvbiBiYWxhbmNlZChhLCBiLCBzdHIpIHtcbiAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBSZWdFeHApIGEgPSBtYXliZU1hdGNoKGEsIHN0cik7XG4gICAgICAgIGlmIChiIGluc3RhbmNlb2YgUmVnRXhwKSBiID0gbWF5YmVNYXRjaChiLCBzdHIpO1xuICAgICAgICB2YXIgciA9IHJhbmdlKGEsIGIsIHN0cik7XG4gICAgICAgIHJldHVybiByICYmIHtcbiAgICAgICAgICAgIHN0YXJ0OiByWzBdLFxuICAgICAgICAgICAgZW5kOiByWzFdLFxuICAgICAgICAgICAgcHJlOiBzdHIuc2xpY2UoMCwgclswXSksXG4gICAgICAgICAgICBib2R5OiBzdHIuc2xpY2UoclswXSArIGEubGVuZ3RoLCByWzFdKSxcbiAgICAgICAgICAgIHBvc3Q6IHN0ci5zbGljZShyWzFdICsgYi5sZW5ndGgpXG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1heWJlTWF0Y2gocmVnLCBzdHIpIHtcbiAgICAgICAgdmFyIG0gPSBzdHIubWF0Y2gocmVnKTtcbiAgICAgICAgcmV0dXJuIG0gPyBtWzBdIDogbnVsbDtcbiAgICB9XG4gICAgYmFsYW5jZWQucmFuZ2UgPSByYW5nZTtcbiAgICBmdW5jdGlvbiByYW5nZShhLCBiLCBzdHIpIHtcbiAgICAgICAgdmFyIGJlZ3MsIGJlZywgbGVmdCwgcmlnaHQsIHJlc3VsdDtcbiAgICAgICAgdmFyIGFpID0gc3RyLmluZGV4T2YoYSk7XG4gICAgICAgIHZhciBiaSA9IHN0ci5pbmRleE9mKGIsIGFpICsgMSk7XG4gICAgICAgIHZhciBpID0gYWk7XG4gICAgICAgIGlmIChhaSA+PSAwICYmIGJpID4gMCkge1xuICAgICAgICAgICAgYmVncyA9IFtdO1xuICAgICAgICAgICAgbGVmdCA9IHN0ci5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAoaSA+PSAwICYmICFyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PSBhaSkge1xuICAgICAgICAgICAgICAgICAgICBiZWdzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgICAgIGFpID0gc3RyLmluZGV4T2YoYSwgaSArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmVncy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBbIGJlZ3MucG9wKCksIGJpIF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmVnID0gYmVncy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJlZyA8IGxlZnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSBiZWc7XG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodCA9IGJpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJpID0gc3RyLmluZGV4T2YoYiwgaSArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpID0gYWkgPCBiaSAmJiBhaSA+PSAwID8gYWkgOiBiaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiZWdzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IFsgbGVmdCwgcmlnaHQgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBjc3NQYXJzZShjc3MpIHtcbiAgICAgICAgdmFyIGVycm9ycyA9IFtdO1xuICAgICAgICBmdW5jdGlvbiBlcnJvcihtc2cpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNTUyBwYXJzZSBlcnJvcjogXCIgKyBtc2cpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG1hdGNoKHJlKSB7XG4gICAgICAgICAgICB2YXIgbSA9IHJlLmV4ZWMoY3NzKTtcbiAgICAgICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgICAgICAgY3NzID0gY3NzLnNsaWNlKG1bMF0ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB3aGl0ZXNwYWNlKCkge1xuICAgICAgICAgICAgbWF0Y2goL15cXHMqLyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaCgvXntcXHMqLyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2goL159Lyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gY29tbWVudCgpIHtcbiAgICAgICAgICAgIHdoaXRlc3BhY2UoKTtcbiAgICAgICAgICAgIGlmIChjc3NbMF0gIT09IFwiL1wiIHx8IGNzc1sxXSAhPT0gXCIqXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaSA9IDI7XG4gICAgICAgICAgICB3aGlsZSAoY3NzW2ldICYmIChjc3NbaV0gIT09IFwiKlwiIHx8IGNzc1tpICsgMV0gIT09IFwiL1wiKSkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghY3NzW2ldKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yKFwiZW5kIG9mIGNvbW1lbnQgaXMgbWlzc2luZ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzdHIgPSBjc3Muc2xpY2UoMiwgaSk7XG4gICAgICAgICAgICBjc3MgPSBjc3Muc2xpY2UoaSArIDIpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImNvbW1lbnRcIixcbiAgICAgICAgICAgICAgICBjb21tZW50OiBzdHJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gY29tbWVudHMoKSB7XG4gICAgICAgICAgICB2YXIgY21udHMgPSBbXTtcbiAgICAgICAgICAgIHZhciBjID0gdm9pZCAwO1xuICAgICAgICAgICAgd2hpbGUgKGMgPSBjb21tZW50KCkpIHtcbiAgICAgICAgICAgICAgICBjbW50cy5wdXNoKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNtbnRzO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHNlbGVjdG9yKCkge1xuICAgICAgICAgICAgd2hpdGVzcGFjZSgpO1xuICAgICAgICAgICAgd2hpbGUgKGNzc1swXSA9PT0gXCJ9XCIpIHtcbiAgICAgICAgICAgICAgICBlcnJvcihcImV4dHJhIGNsb3NpbmcgYnJhY2tldFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtID0gbWF0Y2goL14oKFwiKD86XFxcXFwifFteXCJdKSpcInwnKD86XFxcXCd8W14nXSkqJ3xbXntdKSspLyk7XG4gICAgICAgICAgICBpZiAobSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtWzBdLnRyaW0oKS5yZXBsYWNlKC9cXC9cXCooW14qXXxbXFxyXFxuXXwoXFwqKyhbXiovXXxbXFxyXFxuXSkpKSpcXCpcXC8rL2csIFwiXCIpLnJlcGxhY2UoL1wiKD86XFxcXFwifFteXCJdKSpcInwnKD86XFxcXCd8W14nXSkqJy9nLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtLnJlcGxhY2UoLywvZywgXCLigIxcIik7XG4gICAgICAgICAgICAgICAgfSkuc3BsaXQoL1xccyooPyFbXihdKlxcKSksXFxzKi8pLm1hcChmdW5jdGlvbihzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzLnJlcGxhY2UoL1xcdTIwMEMvZywgXCIsXCIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGRlY2xhcmF0aW9uKCkge1xuICAgICAgICAgICAgbWF0Y2goL14oWztcXHNdKikrLyk7XG4gICAgICAgICAgICB2YXIgY29tbWVudF9yZWdleHAgPSAvXFwvXFwqW14qXSpcXCorKFteLypdW14qXSpcXCorKSpcXC8vZztcbiAgICAgICAgICAgIHZhciBwcm9wID0gbWF0Y2goL14oXFwqP1stIy8qXFxcXFxcd10rKFxcW1swLTlhLXpfLV0rXFxdKT8pXFxzKi8pO1xuICAgICAgICAgICAgaWYgKCFwcm9wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJvcCA9IHByb3BbMF0udHJpbSgpO1xuICAgICAgICAgICAgaWYgKCFtYXRjaCgvXjpcXHMqLykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3IoXCJwcm9wZXJ0eSBtaXNzaW5nICc6J1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2YWwgPSBtYXRjaCgvXigoPzpcXC9cXCouKj9cXCpcXC98Jyg/OlxcXFwnfC4pKj8nfFwiKD86XFxcXFwifC4pKj9cInxcXCgoXFxzKicoPzpcXFxcJ3wuKSo/J3xcIig/OlxcXFxcInwuKSo/XCJ8W14pXSo/KVxccypcXCl8W159O10pKykvKTtcbiAgICAgICAgICAgIHZhciByZXQgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJkZWNsYXJhdGlvblwiLFxuICAgICAgICAgICAgICAgIHByb3BlcnR5OiBwcm9wLnJlcGxhY2UoY29tbWVudF9yZWdleHAsIFwiXCIpLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWwgPyB2YWxbMF0ucmVwbGFjZShjb21tZW50X3JlZ2V4cCwgXCJcIikudHJpbSgpIDogXCJcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG1hdGNoKC9eWztcXHNdKi8pO1xuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBkZWNsYXJhdGlvbnMoKSB7XG4gICAgICAgICAgICBpZiAoIW9wZW4oKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcihcIm1pc3NpbmcgJ3snXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGQgPSB2b2lkIDAsIGRlY2xzID0gY29tbWVudHMoKTtcbiAgICAgICAgICAgIHdoaWxlIChkID0gZGVjbGFyYXRpb24oKSkge1xuICAgICAgICAgICAgICAgIGRlY2xzLnB1c2goZCk7XG4gICAgICAgICAgICAgICAgZGVjbHMgPSBkZWNscy5jb25jYXQoY29tbWVudHMoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWNsb3NlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3IoXCJtaXNzaW5nICd9J1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkZWNscztcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBrZXlmcmFtZSgpIHtcbiAgICAgICAgICAgIHdoaXRlc3BhY2UoKTtcbiAgICAgICAgICAgIHZhciB2YWxzID0gW107XG4gICAgICAgICAgICB2YXIgbSA9IHZvaWQgMDtcbiAgICAgICAgICAgIHdoaWxlIChtID0gbWF0Y2goL14oKFxcZCtcXC5cXGQrfFxcLlxcZCt8XFxkKyklP3xbYS16XSspXFxzKi8pKSB7XG4gICAgICAgICAgICAgICAgdmFscy5wdXNoKG1bMV0pO1xuICAgICAgICAgICAgICAgIG1hdGNoKC9eLFxccyovKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2YWxzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwia2V5ZnJhbWVcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiB2YWxzLFxuICAgICAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbnM6IGRlY2xhcmF0aW9ucygpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBhdF9rZXlmcmFtZXMoKSB7XG4gICAgICAgICAgICB2YXIgbSA9IG1hdGNoKC9eQChbLVxcd10rKT9rZXlmcmFtZXNcXHMqLyk7XG4gICAgICAgICAgICBpZiAoIW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdmVuZG9yID0gbVsxXTtcbiAgICAgICAgICAgIG0gPSBtYXRjaCgvXihbLVxcd10rKVxccyovKTtcbiAgICAgICAgICAgIGlmICghbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcihcIkBrZXlmcmFtZXMgbWlzc2luZyBuYW1lXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG5hbWUgPSBtWzFdO1xuICAgICAgICAgICAgaWYgKCFvcGVuKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3IoXCJAa2V5ZnJhbWVzIG1pc3NpbmcgJ3snXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGZyYW1lID0gdm9pZCAwLCBmcmFtZXMgPSBjb21tZW50cygpO1xuICAgICAgICAgICAgd2hpbGUgKGZyYW1lID0ga2V5ZnJhbWUoKSkge1xuICAgICAgICAgICAgICAgIGZyYW1lcy5wdXNoKGZyYW1lKTtcbiAgICAgICAgICAgICAgICBmcmFtZXMgPSBmcmFtZXMuY29uY2F0KGNvbW1lbnRzKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjbG9zZSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yKFwiQGtleWZyYW1lcyBtaXNzaW5nICd9J1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJrZXlmcmFtZXNcIixcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgIHZlbmRvcjogdmVuZG9yLFxuICAgICAgICAgICAgICAgIGtleWZyYW1lczogZnJhbWVzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGF0X3BhZ2UoKSB7XG4gICAgICAgICAgICB2YXIgbSA9IG1hdGNoKC9eQHBhZ2UgKi8pO1xuICAgICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VsID0gc2VsZWN0b3IoKSB8fCBbXTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInBhZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3JzOiBzZWwsXG4gICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uczogZGVjbGFyYXRpb25zKClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGF0X2ZvbnRmYWNlKCkge1xuICAgICAgICAgICAgdmFyIG0gPSBtYXRjaCgvXkBmb250LWZhY2VcXHMqLyk7XG4gICAgICAgICAgICBpZiAobSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiZm9udC1mYWNlXCIsXG4gICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uczogZGVjbGFyYXRpb25zKClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGF0X3N1cHBvcnRzKCkge1xuICAgICAgICAgICAgdmFyIG0gPSBtYXRjaCgvXkBzdXBwb3J0cyAqKFtee10rKS8pO1xuICAgICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInN1cHBvcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIHN1cHBvcnRzOiBtWzFdLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgcnVsZXM6IHJ1bGVzKClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGF0X2hvc3QoKSB7XG4gICAgICAgICAgICB2YXIgbSA9IG1hdGNoKC9eQGhvc3RcXHMqLyk7XG4gICAgICAgICAgICBpZiAobSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiaG9zdFwiLFxuICAgICAgICAgICAgICAgICAgICBydWxlczogcnVsZXMoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gYXRfbWVkaWEoKSB7XG4gICAgICAgICAgICB2YXIgbSA9IG1hdGNoKC9eQG1lZGlhICooW157XSspLyk7XG4gICAgICAgICAgICBpZiAobSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwibWVkaWFcIixcbiAgICAgICAgICAgICAgICAgICAgbWVkaWE6IG1bMV0udHJpbSgpLFxuICAgICAgICAgICAgICAgICAgICBydWxlczogcnVsZXMoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gYXRfY3VzdG9tX20oKSB7XG4gICAgICAgICAgICB2YXIgbSA9IG1hdGNoKC9eQGN1c3RvbS1tZWRpYVxccysoLS1bXlxcc10rKVxccyooW157O10rKTsvKTtcbiAgICAgICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJjdXN0b20tbWVkaWFcIixcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbVsxXS50cmltKCksXG4gICAgICAgICAgICAgICAgICAgIG1lZGlhOiBtWzJdLnRyaW0oKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gYXRfZG9jdW1lbnQoKSB7XG4gICAgICAgICAgICB2YXIgbSA9IG1hdGNoKC9eQChbLVxcd10rKT9kb2N1bWVudCAqKFtee10rKS8pO1xuICAgICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImRvY3VtZW50XCIsXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50OiBtWzJdLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgdmVuZG9yOiBtWzFdID8gbVsxXS50cmltKCkgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBydWxlczogcnVsZXMoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gYXRfeCgpIHtcbiAgICAgICAgICAgIHZhciBtID0gbWF0Y2goL15AKGltcG9ydHxjaGFyc2V0fG5hbWVzcGFjZSlcXHMqKFteO10rKTsvKTtcbiAgICAgICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogbVsxXSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbVsyXS50cmltKClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGF0X3J1bGUoKSB7XG4gICAgICAgICAgICB3aGl0ZXNwYWNlKCk7XG4gICAgICAgICAgICBpZiAoY3NzWzBdID09PSBcIkBcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhdF9rZXlmcmFtZXMoKSB8fCBhdF9zdXBwb3J0cygpIHx8IGF0X2hvc3QoKSB8fCBhdF9tZWRpYSgpIHx8IGF0X2N1c3RvbV9tKCkgfHwgYXRfcGFnZSgpIHx8IGF0X2RvY3VtZW50KCkgfHwgYXRfZm9udGZhY2UoKSB8fCBhdF94KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gcnVsZSgpIHtcbiAgICAgICAgICAgIHZhciBzZWwgPSBzZWxlY3RvcigpIHx8IFtdO1xuICAgICAgICAgICAgaWYgKCFzZWwubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IoXCJzZWxlY3RvciBtaXNzaW5nXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRlY2xzID0gZGVjbGFyYXRpb25zKCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwicnVsZVwiLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yczogc2VsLFxuICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uczogZGVjbHNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gcnVsZXMoY29yZSkge1xuICAgICAgICAgICAgaWYgKCFjb3JlICYmICFvcGVuKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3IoXCJtaXNzaW5nICd7J1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBub2RlID0gdm9pZCAwLCBydWxlcyA9IGNvbW1lbnRzKCk7XG4gICAgICAgICAgICB3aGlsZSAoY3NzLmxlbmd0aCAmJiAoY29yZSB8fCBjc3NbMF0gIT09IFwifVwiKSAmJiAobm9kZSA9IGF0X3J1bGUoKSB8fCBydWxlKCkpKSB7XG4gICAgICAgICAgICAgICAgcnVsZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICBydWxlcyA9IHJ1bGVzLmNvbmNhdChjb21tZW50cygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghY29yZSAmJiAhY2xvc2UoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcihcIm1pc3NpbmcgJ30nXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJ1bGVzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiBcInN0eWxlc2hlZXRcIixcbiAgICAgICAgICAgIHN0eWxlc2hlZXQ6IHtcbiAgICAgICAgICAgICAgICBydWxlczogcnVsZXModHJ1ZSksXG4gICAgICAgICAgICAgICAgZXJyb3JzOiBlcnJvcnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc3RyaW5naWZ5Q3NzKHRyZWUpIHtcbiAgICAgICAgdmFyIGRlbGltID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBcIlwiO1xuICAgICAgICB2YXIgY2IgPSBhcmd1bWVudHNbMl07XG4gICAgICAgIHZhciByZW5kZXJNZXRob2RzID0ge1xuICAgICAgICAgICAgY2hhcnNldDogZnVuY3Rpb24gY2hhcnNldChub2RlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiQGNoYXJzZXQgXCIgKyBub2RlLm5hbWUgKyBcIjtcIjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb21tZW50OiBmdW5jdGlvbiBjb21tZW50KG5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImN1c3RvbS1tZWRpYVwiOiBmdW5jdGlvbiBjdXN0b21NZWRpYShub2RlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiQGN1c3RvbS1tZWRpYSBcIiArIG5vZGUubmFtZSArIFwiIFwiICsgbm9kZS5tZWRpYSArIFwiO1wiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlY2xhcmF0aW9uOiBmdW5jdGlvbiBkZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUucHJvcGVydHkgKyBcIjpcIiArIG5vZGUudmFsdWUgKyBcIjtcIjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkb2N1bWVudDogZnVuY3Rpb24gZG9jdW1lbnQobm9kZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIkBcIiArIChub2RlLnZlbmRvciB8fCBcIlwiKSArIFwiZG9jdW1lbnQgXCIgKyBub2RlLmRvY3VtZW50ICsgXCJ7XCIgKyB2aXNpdChub2RlLnJ1bGVzKSArIFwifVwiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZm9udC1mYWNlXCI6IGZ1bmN0aW9uIGZvbnRGYWNlKG5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJAZm9udC1mYWNlXCIgKyBcIntcIiArIHZpc2l0KG5vZGUuZGVjbGFyYXRpb25zKSArIFwifVwiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhvc3Q6IGZ1bmN0aW9uIGhvc3Qobm9kZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIkBob3N0XCIgKyBcIntcIiArIHZpc2l0KG5vZGUucnVsZXMpICsgXCJ9XCI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW1wb3J0OiBmdW5jdGlvbiBfaW1wb3J0KG5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJAaW1wb3J0IFwiICsgbm9kZS5uYW1lICsgXCI7XCI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAga2V5ZnJhbWU6IGZ1bmN0aW9uIGtleWZyYW1lKG5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS52YWx1ZXMuam9pbihcIixcIikgKyBcIntcIiArIHZpc2l0KG5vZGUuZGVjbGFyYXRpb25zKSArIFwifVwiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtleWZyYW1lczogZnVuY3Rpb24ga2V5ZnJhbWVzKG5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJAXCIgKyAobm9kZS52ZW5kb3IgfHwgXCJcIikgKyBcImtleWZyYW1lcyBcIiArIG5vZGUubmFtZSArIFwie1wiICsgdmlzaXQobm9kZS5rZXlmcmFtZXMpICsgXCJ9XCI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWVkaWE6IGZ1bmN0aW9uIG1lZGlhKG5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJAbWVkaWEgXCIgKyBub2RlLm1lZGlhICsgXCJ7XCIgKyB2aXNpdChub2RlLnJ1bGVzKSArIFwifVwiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5hbWVzcGFjZTogZnVuY3Rpb24gbmFtZXNwYWNlKG5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJAbmFtZXNwYWNlIFwiICsgbm9kZS5uYW1lICsgXCI7XCI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGFnZTogZnVuY3Rpb24gcGFnZShub2RlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiQHBhZ2UgXCIgKyAobm9kZS5zZWxlY3RvcnMubGVuZ3RoID8gbm9kZS5zZWxlY3RvcnMuam9pbihcIiwgXCIpIDogXCJcIikgKyBcIntcIiArIHZpc2l0KG5vZGUuZGVjbGFyYXRpb25zKSArIFwifVwiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJ1bGU6IGZ1bmN0aW9uIHJ1bGUobm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBkZWNscyA9IG5vZGUuZGVjbGFyYXRpb25zO1xuICAgICAgICAgICAgICAgIGlmIChkZWNscy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuc2VsZWN0b3JzLmpvaW4oXCIsXCIpICsgXCJ7XCIgKyB2aXNpdChkZWNscykgKyBcIn1cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VwcG9ydHM6IGZ1bmN0aW9uIHN1cHBvcnRzKG5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJAc3VwcG9ydHMgXCIgKyBub2RlLnN1cHBvcnRzICsgXCJ7XCIgKyB2aXNpdChub2RlLnJ1bGVzKSArIFwifVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBmdW5jdGlvbiB2aXNpdChub2Rlcykge1xuICAgICAgICAgICAgdmFyIGJ1ZiA9IFwiXCI7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG4gPSBub2Rlc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgICAgICAgICAgY2Iobik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciB0eHQgPSByZW5kZXJNZXRob2RzW24udHlwZV0obik7XG4gICAgICAgICAgICAgICAgaWYgKHR4dCkge1xuICAgICAgICAgICAgICAgICAgICBidWYgKz0gdHh0O1xuICAgICAgICAgICAgICAgICAgICBpZiAodHh0Lmxlbmd0aCAmJiBuLnNlbGVjdG9ycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmICs9IGRlbGltO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJ1ZjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlzaXQodHJlZS5zdHlsZXNoZWV0LnJ1bGVzKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gd2Fsa0Nzcyhub2RlLCBmbikge1xuICAgICAgICBub2RlLnJ1bGVzLmZvckVhY2goZnVuY3Rpb24ocnVsZSkge1xuICAgICAgICAgICAgaWYgKHJ1bGUucnVsZXMpIHtcbiAgICAgICAgICAgICAgICB3YWxrQ3NzKHJ1bGUsIGZuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocnVsZS5rZXlmcmFtZXMpIHtcbiAgICAgICAgICAgICAgICBydWxlLmtleWZyYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKGtleWZyYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXlmcmFtZS50eXBlID09PSBcImtleWZyYW1lXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZuKGtleWZyYW1lLmRlY2xhcmF0aW9ucywgcnVsZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXJ1bGUuZGVjbGFyYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm4ocnVsZS5kZWNsYXJhdGlvbnMsIG5vZGUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgdmFyIHBlcnNpc3RTdG9yZSA9IHt9O1xuICAgIHZhciBWQVJfUFJPUF9JREVOVElGSUVSID0gXCItLVwiO1xuICAgIHZhciBWQVJfRlVOQ19JREVOVElGSUVSID0gXCJ2YXJcIjtcbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1WYXJzKGNzc1RleHQpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICAgICAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICBvbmx5VmFyczogdHJ1ZSxcbiAgICAgICAgICAgIHBlcnNpc3Q6IGZhbHNlLFxuICAgICAgICAgICAgcHJlc2VydmU6IGZhbHNlLFxuICAgICAgICAgICAgdmFyaWFibGVzOiB7fSxcbiAgICAgICAgICAgIG9uV2FybmluZzogZnVuY3Rpb24gb25XYXJuaW5nKCkge31cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG1hcCA9IHt9O1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSBtZXJnZURlZXAoZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgICB2YXIgdmFyU291cmNlID0gc2V0dGluZ3MucGVyc2lzdCA/IHBlcnNpc3RTdG9yZSA6IHNldHRpbmdzLnZhcmlhYmxlcztcbiAgICAgICAgdmFyIGNzc1RyZWUgPSBjc3NQYXJzZShjc3NUZXh0KTtcbiAgICAgICAgaWYgKHNldHRpbmdzLm9ubHlWYXJzKSB7XG4gICAgICAgICAgICBjc3NUcmVlLnN0eWxlc2hlZXQucnVsZXMgPSBmaWx0ZXJWYXJzKGNzc1RyZWUuc3R5bGVzaGVldC5ydWxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgY3NzVHJlZS5zdHlsZXNoZWV0LnJ1bGVzLmZvckVhY2goZnVuY3Rpb24ocnVsZSkge1xuICAgICAgICAgICAgdmFyIHZhck5hbWVJbmRpY2VzID0gW107XG4gICAgICAgICAgICBpZiAocnVsZS50eXBlICE9PSBcInJ1bGVcIikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChydWxlLnNlbGVjdG9ycy5sZW5ndGggIT09IDEgfHwgcnVsZS5zZWxlY3RvcnNbMF0gIT09IFwiOnJvb3RcIikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJ1bGUuZGVjbGFyYXRpb25zLmZvckVhY2goZnVuY3Rpb24oZGVjbCwgaSkge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wID0gZGVjbC5wcm9wZXJ0eTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBkZWNsLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmIChwcm9wICYmIHByb3AuaW5kZXhPZihWQVJfUFJPUF9JREVOVElGSUVSKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBtYXBbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyTmFtZUluZGljZXMucHVzaChpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ3MucHJlc2VydmUpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gdmFyTmFtZUluZGljZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5kZWNsYXJhdGlvbnMuc3BsaWNlKHZhck5hbWVJbmRpY2VzW2ldLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3Qua2V5cyhzZXR0aW5ncy52YXJpYWJsZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICB2YXIgcHJvcCA9IFwiLS1cIiArIGtleS5yZXBsYWNlKC9eLSsvLCBcIlwiKTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNldHRpbmdzLnZhcmlhYmxlc1trZXldO1xuICAgICAgICAgICAgaWYgKGtleSAhPT0gcHJvcCkge1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLnZhcmlhYmxlc1twcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBzZXR0aW5ncy52YXJpYWJsZXNba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5wZXJzaXN0KSB7XG4gICAgICAgICAgICAgICAgcGVyc2lzdFN0b3JlW3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoT2JqZWN0LmtleXModmFyU291cmNlKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBuZXdSdWxlID0ge1xuICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uczogW10sXG4gICAgICAgICAgICAgICAgc2VsZWN0b3JzOiBbIFwiOnJvb3RcIiBdLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwicnVsZVwiXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgT2JqZWN0LmtleXModmFyU291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgICAgIG1hcFtrZXldID0gdmFyU291cmNlW2tleV07XG4gICAgICAgICAgICAgICAgbmV3UnVsZS5kZWNsYXJhdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiZGVjbGFyYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhclNvdXJjZVtrZXldXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnBlcnNpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcGVyc2lzdFN0b3JlW2tleV0gPSB2YXJTb3VyY2Vba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5wcmVzZXJ2ZSkge1xuICAgICAgICAgICAgICAgIGNzc1RyZWUuc3R5bGVzaGVldC5ydWxlcy5wdXNoKG5ld1J1bGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHdhbGtDc3MoY3NzVHJlZS5zdHlsZXNoZWV0LCBmdW5jdGlvbihkZWNsYXJhdGlvbnMsIG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBkZWNsID0gdm9pZCAwO1xuICAgICAgICAgICAgdmFyIHJlc29sdmVkVmFsdWUgPSB2b2lkIDA7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2b2lkIDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRlY2xhcmF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGRlY2wgPSBkZWNsYXJhdGlvbnNbaV07XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBkZWNsLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmIChkZWNsLnR5cGUgIT09IFwiZGVjbGFyYXRpb25cIikge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSB8fCB2YWx1ZS5pbmRleE9mKFZBUl9GVU5DX0lERU5USUZJRVIgKyBcIihcIikgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlZFZhbHVlID0gcmVzb2x2ZVZhbHVlKHZhbHVlLCBtYXAsIHNldHRpbmdzKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzb2x2ZWRWYWx1ZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXNldHRpbmdzLnByZXNlcnZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gcmVzb2x2ZWRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9ucy5zcGxpY2UoaSwgMCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGRlY2wudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogZGVjbC5wcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmVzb2x2ZWRWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3RyaW5naWZ5Q3NzKGNzc1RyZWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmaWx0ZXJWYXJzKHJ1bGVzKSB7XG4gICAgICAgIHJldHVybiBydWxlcy5maWx0ZXIoZnVuY3Rpb24ocnVsZSkge1xuICAgICAgICAgICAgaWYgKHJ1bGUuZGVjbGFyYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlY2xBcnJheSA9IHJ1bGUuZGVjbGFyYXRpb25zLmZpbHRlcihmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoYXNWYXJQcm9wID0gZC5wcm9wZXJ0eSAmJiBkLnByb3BlcnR5LmluZGV4T2YoVkFSX1BST1BfSURFTlRJRklFUikgPT09IDA7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoYXNWYXJWYWwgPSBkLnZhbHVlICYmIGQudmFsdWUuaW5kZXhPZihWQVJfRlVOQ19JREVOVElGSUVSICsgXCIoXCIpID4gLTE7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoYXNWYXJQcm9wIHx8IGhhc1ZhclZhbDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAocnVsZS50eXBlICE9PSBcImZvbnQtZmFjZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bGUuZGVjbGFyYXRpb25zID0gZGVjbEFycmF5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gQm9vbGVhbihkZWNsQXJyYXkubGVuZ3RoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5rZXlmcmFtZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQm9vbGVhbihydWxlLmtleWZyYW1lcy5maWx0ZXIoZnVuY3Rpb24oaykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQm9vbGVhbihrLmRlY2xhcmF0aW9ucy5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhhc1ZhclByb3AgPSBkLnByb3BlcnR5ICYmIGQucHJvcGVydHkuaW5kZXhPZihWQVJfUFJPUF9JREVOVElGSUVSKSA9PT0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoYXNWYXJWYWwgPSBkLnZhbHVlICYmIGQudmFsdWUuaW5kZXhPZihWQVJfRlVOQ19JREVOVElGSUVSICsgXCIoXCIpID4gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGFzVmFyUHJvcCB8fCBoYXNWYXJWYWw7XG4gICAgICAgICAgICAgICAgICAgIH0pLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgfSkubGVuZ3RoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5ydWxlcykge1xuICAgICAgICAgICAgICAgIHJ1bGUucnVsZXMgPSBmaWx0ZXJWYXJzKHJ1bGUucnVsZXMpLmZpbHRlcihmdW5jdGlvbihyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByLmRlY2xhcmF0aW9ucyAmJiByLmRlY2xhcmF0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4ocnVsZS5ydWxlcy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXNvbHZlVmFsdWUodmFsdWUsIG1hcCwgc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIFJFX1ZBUiA9IC8oW1xcdy1dKykoPzpcXHMqLFxccyopPyguKik/LztcbiAgICAgICAgdmFyIGJhbGFuY2VkUGFyZW5zID0gYmFsYW5jZWRNYXRjaChcIihcIiwgXCIpXCIsIHZhbHVlKTtcbiAgICAgICAgdmFyIHZhclN0YXJ0SW5kZXggPSB2YWx1ZS5pbmRleE9mKFwidmFyKFwiKTtcbiAgICAgICAgdmFyIHZhclJlZiA9IGJhbGFuY2VkTWF0Y2goXCIoXCIsIFwiKVwiLCB2YWx1ZS5zdWJzdHJpbmcodmFyU3RhcnRJbmRleCkpLmJvZHk7XG4gICAgICAgIHZhciB3YXJuaW5nSW50cm8gPSBcIkNTUyB0cmFuc2Zvcm0gd2FybmluZzpcIjtcbiAgICAgICAgaWYgKCFiYWxhbmNlZFBhcmVucykge1xuICAgICAgICAgICAgc2V0dGluZ3Mub25XYXJuaW5nKHdhcm5pbmdJbnRybyArICcgbWlzc2luZyBjbG9zaW5nIFwiKVwiIGluIHRoZSB2YWx1ZSBcIicgKyB2YWx1ZSArICdcIicpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YXJSZWYgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIHNldHRpbmdzLm9uV2FybmluZyh3YXJuaW5nSW50cm8gKyBcIiB2YXIoKSBtdXN0IGNvbnRhaW4gYSBub24td2hpdGVzcGFjZSBzdHJpbmdcIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHZhckZ1bmMgPSBWQVJfRlVOQ19JREVOVElGSUVSICsgXCIoXCIgKyB2YXJSZWYgKyBcIilcIjtcbiAgICAgICAgdmFyIHZhclJlc3VsdCA9IHZhclJlZi5yZXBsYWNlKFJFX1ZBUiwgZnVuY3Rpb24oXywgbmFtZSwgZmFsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciByZXBsYWNlbWVudCA9IG1hcFtuYW1lXTtcbiAgICAgICAgICAgIGlmICghcmVwbGFjZW1lbnQgJiYgIWZhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3Mub25XYXJuaW5nKHdhcm5pbmdJbnRybyArICcgdmFyaWFibGUgXCInICsgbmFtZSArICdcIiBpcyB1bmRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcmVwbGFjZW1lbnQgJiYgZmFsbGJhY2spIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsbGJhY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVwbGFjZW1lbnQ7XG4gICAgICAgIH0pO1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnNwbGl0KHZhckZ1bmMpLmpvaW4odmFyUmVzdWx0KTtcbiAgICAgICAgaWYgKHZhbHVlLmluZGV4T2YoVkFSX0ZVTkNfSURFTlRJRklFUiArIFwiKFwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcmVzb2x2ZVZhbHVlKHZhbHVlLCBtYXAsIHNldHRpbmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHZhciBuYW1lID0gXCJjc3MtdmFycy1wb255ZmlsbFwiO1xuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgICAgaW5jbHVkZTogXCJzdHlsZSxsaW5rW3JlbD1zdHlsZXNoZWV0XVwiLFxuICAgICAgICBleGNsdWRlOiBcIlwiLFxuICAgICAgICBvbmx5TGVnYWN5OiB0cnVlLFxuICAgICAgICBvbmx5VmFyczogdHJ1ZSxcbiAgICAgICAgcHJlc2VydmU6IGZhbHNlLFxuICAgICAgICBzaWxlbnQ6IGZhbHNlLFxuICAgICAgICB1cGRhdGVET006IHRydWUsXG4gICAgICAgIHZhcmlhYmxlczoge30sXG4gICAgICAgIG9uU3VjY2VzczogZnVuY3Rpb24gb25TdWNjZXNzKCkge30sXG4gICAgICAgIG9uRXJyb3I6IGZ1bmN0aW9uIG9uRXJyb3IoKSB7fSxcbiAgICAgICAgb25XYXJuaW5nOiBmdW5jdGlvbiBvbldhcm5pbmcoKSB7fSxcbiAgICAgICAgb25Db21wbGV0ZTogZnVuY3Rpb24gb25Db21wbGV0ZSgpIHt9XG4gICAgfTtcbiAgICB2YXIgcmVDc3NWYXJzID0gLyg/Oig/Ojpyb290XFxzKntcXHMqW147XSo7KlxccyopfCg/OnZhclxcKFxccyopKSgtLVteOildKykoPzpcXHMqWzopXSkvO1xuICAgIC8qKlxuICogRGVzY3JpcHRpb25cbiAqXG4gKiBAcHJlc2VydmVcbiAqIEBwYXJhbSB7b2JqZWN0fSAgIFtvcHRpb25zXSBPcHRpb25zIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9ICAgW29wdGlvbnMuaW5jbHVkZT1cInN0eWxlLGxpbmtbcmVsPXN0eWxlc2hlZXRdXCJdIENTUyBzZWxlY3RvclxuICogICAgICAgICAgICAgICAgICAgbWF0Y2hpbmcgPGxpbmsgcmU9XCJzdHlsZXNoZWV0XCI+IGFuZCA8c3R5bGU+IG5vZGVzIHRvXG4gKiAgICAgICAgICAgICAgICAgICBwcm9jZXNzXG4gKiBAcGFyYW0ge3N0cmluZ30gICBbb3B0aW9ucy5leGNsdWRlPVwiXCJdIENTUyBzZWxlY3RvciBtYXRjaGluZyA8bGlua1xuICogICAgICAgICAgICAgICAgICAgcmVsPVwic3R5bGVoc2VldFwiPiBhbmQgPHN0eWxlPiBub2RlcyB0byBleGNsdWRlIGZyb20gdGhvc2VcbiAqICAgICAgICAgICAgICAgICAgIG1hdGNoZXMgYnkgb3B0aW9ucy5pbmNsdWRlXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICBbb3B0aW9ucy5vbmx5TGVnYWN5PXRydWVdIERldGVybWluZXMgaWYgdGhlIHBvbnlmaWxsIHdpbGxcbiAqICAgICAgICAgICAgICAgICAgIG9ubHkgZ2VuZXJhdGUgbGVnYWN5LWNvbXBhdGlibGUgQ1NTIGluIGJyb3dzZXJzIHRoYXQgbGFja1xuICogICAgICAgICAgICAgICAgICAgbmF0aXZlIHN1cHBvcnQgKGkuZS4sIGxlZ2FjeSBicm93c2VycylcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gIFtvcHRpb25zLm9ubHlWYXJzPXRydWVdIERldGVybWluZXMgaWYgQ1NTIHJ1bGVzZXRzIGFuZFxuICogICAgICAgICAgICAgICAgICAgZGVjbGFyYXRpb25zIHdpdGhvdXQgYSBjdXN0b20gcHJvcGVydHkgdmFsdWUgc2hvdWxkIGJlXG4gKiAgICAgICAgICAgICAgICAgICByZW1vdmVkIGZyb20gdGhlIHBvbnlmaWxsLWdlbmVyYXRlZCBDU1NcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gIFtvcHRpb25zLnByZXNlcnZlPWZhbHNlXSBEZXRlcm1pbmVzIGlmIHRoZSBvcmlnaW5hbCBDU1NcbiAqICAgICAgICAgICAgICAgICAgIGN1c3RvbSBwcm9wZXJ0eSBkZWNsYXJhdGlvbiB3aWxsIGJlIHJldGFpbmVkIGluIHRoZVxuICogICAgICAgICAgICAgICAgICAgcG9ueWZpbGwtZ2VuZXJhdGVkIENTUy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gIFtvcHRpb25zLnNpbGVudD1mYWxzZV0gRGV0ZXJtaW5lcyBpZiB3YXJuaW5nIGFuZCBlcnJvclxuICogICAgICAgICAgICAgICAgICAgbWVzc2FnZXMgd2lsbCBiZSBkaXNwbGF5ZWQgb24gdGhlIGNvbnNvbGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gIFtvcHRpb25zLnVwZGF0ZURPTT10cnVlXSBEZXRlcm1pbmVzIGlmIHRoZSBwb255ZmlsbCB3aWxsXG4gKiAgICAgICAgICAgICAgICAgICB1cGRhdGUgdGhlIERPTSBhZnRlciBwcm9jZXNzaW5nIENTUyBjdXN0b20gcHJvcGVydGllc1xuICogQHBhcmFtIHtvYmplY3R9ICAgW29wdGlvbnMudmFyaWFibGVzPXt9XSBBIG1hcCBvZiBjdXN0b20gcHJvcGVydHkgbmFtZS92YWx1ZVxuICogICAgICAgICAgICAgICAgICAgcGFpcnMuIFByb3BlcnR5IG5hbWVzIGNhbiBvbWl0IG9yIGluY2x1ZGUgdGhlIGxlYWRpbmdcbiAqICAgICAgICAgICAgICAgICAgIGRvdWJsZS1oeXBoZW4gKOKAlCksIGFuZCB2YWx1ZXMgc3BlY2lmaWVkIHdpbGwgb3ZlcnJpZGVcbiAqICAgICAgICAgICAgICAgICAgIHByZXZpb3VzIHZhbHVlcy5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IFtvcHRpb25zLm9uU3VjY2Vzc10gQ2FsbGJhY2sgYWZ0ZXIgYWxsIENTUyBoYXMgYmVlblxuICogICAgICAgICAgICAgICAgICAgcHJvY2Vzc2VkIGFuZCBsZWdhY3ktY29tcGF0aWJsZSBDU1MgaGFzIGJlZW4gZ2VuZXJhdGVkLCBidXRcbiAqICAgICAgICAgICAgICAgICAgIGJlZm9yZSB0aGUgbGVnYWN5IENTUyBoYXMgYmVlbiBhcHBlbmRlZCB0byB0aGUgRE9NLiBBbGxvd3NcbiAqICAgICAgICAgICAgICAgICAgIG1vZGlmeWluZyB0aGUgQ1NTIGRhdGEgYnkgcmV0dXJuaW5nIGFueSBzdHJpbmcgdmFsdWUgKG9yXG4gKiAgICAgICAgICAgICAgICAgICBmYWxzZSB0byBza2lwKSBiZWZvcmUgb3B0aW9ucy5vbkNvbXBsZXRlIGlzIHRyaWdnZXJlZC5cbiAqICAgICAgICAgICAgICAgICAgIFBhc3NlcyAxKSBhIENTUyBzdHJpbmcgd2l0aCBDU1MgdmFyaWFibGUgdmFsdWVzIHJlc29sdmVkIGFzXG4gKiAgICAgICAgICAgICAgICAgICBhbiBhcmd1bWVudC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IFtvcHRpb25zLm9uRXJyb3JdIENhbGxiYWNrIGFmdGVyIGEgQ1NTIHBhcnNpbmcgZXJyb3IgaGFzXG4gKiAgICAgICAgICAgICAgICAgICBvY2N1cnJlZCBvciBhbiBYSFIgcmVxdWVzdCBoYXMgZmFpbGVkLiBQYXNzZXMgMSkgYW4gZXJyb3JcbiAqICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UsIGFuZCAyKSBzb3VyY2Ugbm9kZSByZWZlcmVuY2UsIDMpIHhociwgYW5kIDQgdXJsIGFzXG4gKiAgICAgICAgICAgICAgICAgICBhcmd1bWVudHMuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBbb3B0aW9ucy5vbldhcm5pbmddIENhbGxiYWNrIGFmdGVyIGVhY2ggQ1NTIHBhcnNpbmcgd2FybmluZ1xuICogICAgICAgICAgICAgICAgICAgaGFzIG9jY3VycmVkLiBQYXNzZXMgMSkgYSB3YXJuaW5nIG1lc3NhZ2UgYXMgYW4gYXJndW1lbnQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBbb3B0aW9ucy5vbkNvbXBsZXRlXSBDYWxsYmFjayBhZnRlciBhbGwgQ1NTIGhhcyBiZWVuXG4gKiAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWQsIGxlZ2FjeS1jb21wYXRpYmxlIENTUyBoYXMgYmVlbiBnZW5lcmF0ZWQsIGFuZFxuICogICAgICAgICAgICAgICAgICAgKG9wdGlvbmFsbHkpIHRoZSBET00gaGFzIGJlZW4gdXBkYXRlZC4gUGFzc2VzIDEpIGEgQ1NTXG4gKiAgICAgICAgICAgICAgICAgICBzdHJpbmcgd2l0aCBDU1MgdmFyaWFibGUgdmFsdWVzIHJlc29sdmVkLCBhbmQgMikgYVxuICogICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlIHRvIHRoZSBhcHBlbmRlZCA8c3R5bGU+IG5vZGUuXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiAgIGNzc1ZhcnMoe1xuICogICAgIGluY2x1ZGUgICA6ICdzdHlsZSxsaW5rW3JlbD1cInN0eWxlc2hlZXRcIl0nLCAvLyBkZWZhdWx0XG4gKiAgICAgZXhjbHVkZSAgIDogJycsXG4gKiAgICAgb25seUxlZ2FjeTogdHJ1ZSwgIC8vIGRlZmF1bHRcbiAqICAgICBvbmx5VmFycyAgOiB0cnVlLCAgLy8gZGVmYXVsdFxuICogICAgIHByZXNlcnZlICA6IGZhbHNlLCAvLyBkZWZhdWx0XG4gKiAgICAgc2lsZW50ICAgIDogZmFsc2UsIC8vIGRlZmF1bHRcbiAqICAgICB1cGRhdGVET00gOiB0cnVlLCAgLy8gZGVmYXVsdFxuICogICAgIHZhcmlhYmxlcyA6IHtcbiAqICAgICAgIC8vIC4uLlxuICogICAgIH0sXG4gKiAgICAgb25FcnJvcihtZXNzYWdlLCBub2RlKSB7XG4gKiAgICAgICAvLyAuLi5cbiAqICAgICB9LFxuICogICAgIG9uV2FybmluZyhtZXNzYWdlKSB7XG4gKiAgICAgICAvLyAuLi5cbiAqICAgICB9LFxuICogICAgIG9uU3VjY2Vzcyhjc3NUZXh0KSB7XG4gKiAgICAgICAvLyAuLi5cbiAqICAgICB9LFxuICogICAgIG9uQ29tcGxldGUoY3NzVGV4dCwgc3R5bGVOb2RlKSB7XG4gKiAgICAgICAvLyAuLi5cbiAqICAgICB9XG4gKiAgIH0pO1xuICovICAgIGZ1bmN0aW9uIGNzc1ZhcnMoKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAgICAgdmFyIHNldHRpbmdzID0gbWVyZ2VEZWVwKGRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IobWVzc2FnZSwgc291cmNlTm9kZSwgeGhyLCB1cmwpIHtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ3Muc2lsZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlICsgXCJcXG5cIiwgc291cmNlTm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXR0aW5ncy5vbkVycm9yKG1lc3NhZ2UsIHNvdXJjZU5vZGUsIHhociwgdXJsKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVXYXJuaW5nKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ3Muc2lsZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0dGluZ3Mub25XYXJuaW5nKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIikge1xuICAgICAgICAgICAgdmFyIGhhc05hdGl2ZVN1cHBvcnQgPSB3aW5kb3cuQ1NTICYmIHdpbmRvdy5DU1Muc3VwcG9ydHMgJiYgd2luZG93LkNTUy5zdXBwb3J0cyhcIigtLWE6IDApXCIpO1xuICAgICAgICAgICAgaWYgKCFoYXNOYXRpdmVTdXBwb3J0IHx8ICFzZXR0aW5ncy5vbmx5TGVnYWN5KSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0eWxlTm9kZUlkID0gbmFtZTtcbiAgICAgICAgICAgICAgICBnZXRDc3NEYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZTogc2V0dGluZ3MuaW5jbHVkZSxcbiAgICAgICAgICAgICAgICAgICAgZXhjbHVkZTogXCIjXCIgKyBzdHlsZU5vZGVJZCArIChzZXR0aW5ncy5leGNsdWRlID8gXCIsXCIgKyBzZXR0aW5ncy5leGNsdWRlIDogXCJcIiksXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcjogc2V0dGluZ3Mub25seVZhcnMgPyByZUNzc1ZhcnMgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlOiBmdW5jdGlvbiBvbkNvbXBsZXRlKGNzc1RleHQsIGNzc0FycmF5LCBub2RlQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdHlsZU5vZGUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NUZXh0ID0gdHJhbnNmb3JtVmFycyhjc3NUZXh0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ubHlWYXJzOiBzZXR0aW5ncy5vbmx5VmFycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyc2lzdDogc2V0dGluZ3MudXBkYXRlRE9NLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVzZXJ2ZTogc2V0dGluZ3MucHJlc2VydmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlczogc2V0dGluZ3MudmFyaWFibGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbldhcm5pbmc6IGhhbmRsZVdhcm5pbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmV0dXJuVmFsID0gc2V0dGluZ3Mub25TdWNjZXNzKGNzc1RleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc1RleHQgPSByZXR1cm5WYWwgPT09IGZhbHNlID8gXCJcIiA6IHJldHVyblZhbCB8fCBjc3NUZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy51cGRhdGVET00pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluc2VydEJlZm9yZU5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaGVhZCBsaW5rW3JlbD1zdHlsZXNoZWV0XSxoZWFkIHN0eWxlLCBoZWFkIDpsYXN0LWNoaWxkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZU5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgc3R5bGVOb2RlSWQpIHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVOb2RlLnNldEF0dHJpYnV0ZShcImlkXCIsIHN0eWxlTm9kZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0eWxlTm9kZS50ZXh0Q29udGVudCAhPT0gY3NzVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVOb2RlLnRleHRDb250ZW50ID0gY3NzVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmluc2VydEJlZm9yZShzdHlsZU5vZGUsIGluc2VydEJlZm9yZU5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnJvclRocm93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0FycmF5LmZvckVhY2goZnVuY3Rpb24oY3NzVGV4dCwgaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzVGV4dCA9IHRyYW5zZm9ybVZhcnMoY3NzVGV4dCwgc2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnJvck5vZGUgPSBub2RlQXJyYXlbaSAtIDBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUaHJvd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlRXJyb3IoZXJyLm1lc3NhZ2UsIGVycm9yTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVycm9yVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZUVycm9yKGVyci5tZXNzYWdlIHx8IGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3Mub25Db21wbGV0ZShjc3NUZXh0LCBzdHlsZU5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yOiBmdW5jdGlvbiBvbkVycm9yKHhociwgbm9kZSwgdXJsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyb3JNc2cgPSAnQ1NTIFhIUiBlcnJvcjogXCInICsgeGhyLnJlc3BvbnNlVVJMICsgJ1wiICcgKyB4aHIuc3RhdHVzICsgKHhoci5zdGF0dXNUZXh0ID8gXCIgKFwiICsgeGhyLnN0YXR1c1RleHQgKyBcIilcIiA6IFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlRXJyb3IoZXJyb3JNc2csIG5vZGUsIHhociwgdXJsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNOYXRpdmVTdXBwb3J0ICYmIHNldHRpbmdzLnVwZGF0ZURPTSkge1xuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHNldHRpbmdzLnZhcmlhYmxlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSBcIi0tXCIgKyBrZXkucmVwbGFjZSgvXi0rLywgXCJcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNldHRpbmdzLnZhcmlhYmxlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkocHJvcCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24gaW5pdChldnQpIHtcbiAgICAgICAgICAgICAgICBjc3NWYXJzKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGluaXQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNzc1ZhcnM7XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNzcy12YXJzLXBvbnlmaWxsLmpzLm1hcFxuIiwiIWZ1bmN0aW9uKCQpIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBGT1VOREFUSU9OX1ZFUlNJT04gPSAnNi4zLjEnO1xuXG4vLyBHbG9iYWwgRm91bmRhdGlvbiBvYmplY3Rcbi8vIFRoaXMgaXMgYXR0YWNoZWQgdG8gdGhlIHdpbmRvdywgb3IgdXNlZCBhcyBhIG1vZHVsZSBmb3IgQU1EL0Jyb3dzZXJpZnlcbnZhciBGb3VuZGF0aW9uID0ge1xuICB2ZXJzaW9uOiBGT1VOREFUSU9OX1ZFUlNJT04sXG5cbiAgLyoqXG4gICAqIFN0b3JlcyBpbml0aWFsaXplZCBwbHVnaW5zLlxuICAgKi9cbiAgX3BsdWdpbnM6IHt9LFxuXG4gIC8qKlxuICAgKiBTdG9yZXMgZ2VuZXJhdGVkIHVuaXF1ZSBpZHMgZm9yIHBsdWdpbiBpbnN0YW5jZXNcbiAgICovXG4gIF91dWlkczogW10sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBib29sZWFuIGZvciBSVEwgc3VwcG9ydFxuICAgKi9cbiAgcnRsOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiAkKCdodG1sJykuYXR0cignZGlyJykgPT09ICdydGwnO1xuICB9LFxuICAvKipcbiAgICogRGVmaW5lcyBhIEZvdW5kYXRpb24gcGx1Z2luLCBhZGRpbmcgaXQgdG8gdGhlIGBGb3VuZGF0aW9uYCBuYW1lc3BhY2UgYW5kIHRoZSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZSB3aGVuIHJlZmxvd2luZy5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgcGx1Z2luLlxuICAgKi9cbiAgcGx1Z2luOiBmdW5jdGlvbihwbHVnaW4sIG5hbWUpIHtcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIGFkZGluZyB0byBnbG9iYWwgRm91bmRhdGlvbiBvYmplY3RcbiAgICAvLyBFeGFtcGxlczogRm91bmRhdGlvbi5SZXZlYWwsIEZvdW5kYXRpb24uT2ZmQ2FudmFzXG4gICAgdmFyIGNsYXNzTmFtZSA9IChuYW1lIHx8IGZ1bmN0aW9uTmFtZShwbHVnaW4pKTtcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIHN0b3JpbmcgdGhlIHBsdWdpbiwgYWxzbyB1c2VkIHRvIGNyZWF0ZSB0aGUgaWRlbnRpZnlpbmcgZGF0YSBhdHRyaWJ1dGUgZm9yIHRoZSBwbHVnaW5cbiAgICAvLyBFeGFtcGxlczogZGF0YS1yZXZlYWwsIGRhdGEtb2ZmLWNhbnZhc1xuICAgIHZhciBhdHRyTmFtZSAgPSBoeXBoZW5hdGUoY2xhc3NOYW1lKTtcblxuICAgIC8vIEFkZCB0byB0aGUgRm91bmRhdGlvbiBvYmplY3QgYW5kIHRoZSBwbHVnaW5zIGxpc3QgKGZvciByZWZsb3dpbmcpXG4gICAgdGhpcy5fcGx1Z2luc1thdHRyTmFtZV0gPSB0aGlzW2NsYXNzTmFtZV0gPSBwbHVnaW47XG4gIH0sXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogUG9wdWxhdGVzIHRoZSBfdXVpZHMgYXJyYXkgd2l0aCBwb2ludGVycyB0byBlYWNoIGluZGl2aWR1YWwgcGx1Z2luIGluc3RhbmNlLlxuICAgKiBBZGRzIHRoZSBgemZQbHVnaW5gIGRhdGEtYXR0cmlidXRlIHRvIHByb2dyYW1tYXRpY2FsbHkgY3JlYXRlZCBwbHVnaW5zIHRvIGFsbG93IHVzZSBvZiAkKHNlbGVjdG9yKS5mb3VuZGF0aW9uKG1ldGhvZCkgY2FsbHMuXG4gICAqIEFsc28gZmlyZXMgdGhlIGluaXRpYWxpemF0aW9uIGV2ZW50IGZvciBlYWNoIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSB0aGUgbmFtZSBvZiB0aGUgcGx1Z2luLCBwYXNzZWQgYXMgYSBjYW1lbENhc2VkIHN0cmluZy5cbiAgICogQGZpcmVzIFBsdWdpbiNpbml0XG4gICAqL1xuICByZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKXtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IG5hbWUgPyBoeXBoZW5hdGUobmFtZSkgOiBmdW5jdGlvbk5hbWUocGx1Z2luLmNvbnN0cnVjdG9yKS50b0xvd2VyQ2FzZSgpO1xuICAgIHBsdWdpbi51dWlkID0gdGhpcy5HZXRZb0RpZ2l0cyg2LCBwbHVnaW5OYW1lKTtcblxuICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuYXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkpeyBwbHVnaW4uJGVsZW1lbnQuYXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCwgcGx1Z2luLnV1aWQpOyB9XG4gICAgaWYoIXBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpKXsgcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJywgcGx1Z2luKTsgfVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgaW5pdGlhbGl6ZWQuXG4gICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNpbml0XG4gICAgICAgICAgICovXG4gICAgcGx1Z2luLiRlbGVtZW50LnRyaWdnZXIoYGluaXQuemYuJHtwbHVnaW5OYW1lfWApO1xuXG4gICAgdGhpcy5fdXVpZHMucHVzaChwbHVnaW4udXVpZCk7XG5cbiAgICByZXR1cm47XG4gIH0sXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogUmVtb3ZlcyB0aGUgcGx1Z2lucyB1dWlkIGZyb20gdGhlIF91dWlkcyBhcnJheS5cbiAgICogUmVtb3ZlcyB0aGUgemZQbHVnaW4gZGF0YSBhdHRyaWJ1dGUsIGFzIHdlbGwgYXMgdGhlIGRhdGEtcGx1Z2luLW5hbWUgYXR0cmlidXRlLlxuICAgKiBBbHNvIGZpcmVzIHRoZSBkZXN0cm95ZWQgZXZlbnQgZm9yIHRoZSBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAqIEBmaXJlcyBQbHVnaW4jZGVzdHJveWVkXG4gICAqL1xuICB1bnJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4pe1xuICAgIHZhciBwbHVnaW5OYW1lID0gaHlwaGVuYXRlKGZ1bmN0aW9uTmFtZShwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKS5jb25zdHJ1Y3RvcikpO1xuXG4gICAgdGhpcy5fdXVpZHMuc3BsaWNlKHRoaXMuX3V1aWRzLmluZGV4T2YocGx1Z2luLnV1aWQpLCAxKTtcbiAgICBwbHVnaW4uJGVsZW1lbnQucmVtb3ZlQXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkucmVtb3ZlRGF0YSgnemZQbHVnaW4nKVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNkZXN0cm95ZWRcbiAgICAgICAgICAgKi9cbiAgICAgICAgICAudHJpZ2dlcihgZGVzdHJveWVkLnpmLiR7cGx1Z2luTmFtZX1gKTtcbiAgICBmb3IodmFyIHByb3AgaW4gcGx1Z2luKXtcbiAgICAgIHBsdWdpbltwcm9wXSA9IG51bGw7Ly9jbGVhbiB1cCBzY3JpcHQgdG8gcHJlcCBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuICAgIH1cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBDYXVzZXMgb25lIG9yIG1vcmUgYWN0aXZlIHBsdWdpbnMgdG8gcmUtaW5pdGlhbGl6ZSwgcmVzZXR0aW5nIGV2ZW50IGxpc3RlbmVycywgcmVjYWxjdWxhdGluZyBwb3NpdGlvbnMsIGV0Yy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBsdWdpbnMgLSBvcHRpb25hbCBzdHJpbmcgb2YgYW4gaW5kaXZpZHVhbCBwbHVnaW4ga2V5LCBhdHRhaW5lZCBieSBjYWxsaW5nIGAkKGVsZW1lbnQpLmRhdGEoJ3BsdWdpbk5hbWUnKWAsIG9yIHN0cmluZyBvZiBhIHBsdWdpbiBjbGFzcyBpLmUuIGAnZHJvcGRvd24nYFxuICAgKiBAZGVmYXVsdCBJZiBubyBhcmd1bWVudCBpcyBwYXNzZWQsIHJlZmxvdyBhbGwgY3VycmVudGx5IGFjdGl2ZSBwbHVnaW5zLlxuICAgKi9cbiAgIHJlSW5pdDogZnVuY3Rpb24ocGx1Z2lucyl7XG4gICAgIHZhciBpc0pRID0gcGx1Z2lucyBpbnN0YW5jZW9mICQ7XG4gICAgIHRyeXtcbiAgICAgICBpZihpc0pRKXtcbiAgICAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3pmUGx1Z2luJykuX2luaXQoKTtcbiAgICAgICAgIH0pO1xuICAgICAgIH1lbHNle1xuICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgcGx1Z2lucyxcbiAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgIGZucyA9IHtcbiAgICAgICAgICAgJ29iamVjdCc6IGZ1bmN0aW9uKHBsZ3Mpe1xuICAgICAgICAgICAgIHBsZ3MuZm9yRWFjaChmdW5jdGlvbihwKXtcbiAgICAgICAgICAgICAgIHAgPSBoeXBoZW5hdGUocCk7XG4gICAgICAgICAgICAgICAkKCdbZGF0YS0nKyBwICsnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgICAgfSk7XG4gICAgICAgICAgIH0sXG4gICAgICAgICAgICdzdHJpbmcnOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgIHBsdWdpbnMgPSBoeXBoZW5hdGUocGx1Z2lucyk7XG4gICAgICAgICAgICAgJCgnW2RhdGEtJysgcGx1Z2lucyArJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICAndW5kZWZpbmVkJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICB0aGlzWydvYmplY3QnXShPYmplY3Qua2V5cyhfdGhpcy5fcGx1Z2lucykpO1xuICAgICAgICAgICB9XG4gICAgICAgICB9O1xuICAgICAgICAgZm5zW3R5cGVdKHBsdWdpbnMpO1xuICAgICAgIH1cbiAgICAgfWNhdGNoKGVycil7XG4gICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICB9ZmluYWxseXtcbiAgICAgICByZXR1cm4gcGx1Z2lucztcbiAgICAgfVxuICAgfSxcblxuICAvKipcbiAgICogcmV0dXJucyBhIHJhbmRvbSBiYXNlLTM2IHVpZCB3aXRoIG5hbWVzcGFjaW5nXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIC0gbnVtYmVyIG9mIHJhbmRvbSBiYXNlLTM2IGRpZ2l0cyBkZXNpcmVkLiBJbmNyZWFzZSBmb3IgbW9yZSByYW5kb20gc3RyaW5ncy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSAtIG5hbWUgb2YgcGx1Z2luIHRvIGJlIGluY29ycG9yYXRlZCBpbiB1aWQsIG9wdGlvbmFsLlxuICAgKiBAZGVmYXVsdCB7U3RyaW5nfSAnJyAtIGlmIG5vIHBsdWdpbiBuYW1lIGlzIHByb3ZpZGVkLCBub3RoaW5nIGlzIGFwcGVuZGVkIHRvIHRoZSB1aWQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IC0gdW5pcXVlIGlkXG4gICAqL1xuICBHZXRZb0RpZ2l0czogZnVuY3Rpb24obGVuZ3RoLCBuYW1lc3BhY2Upe1xuICAgIGxlbmd0aCA9IGxlbmd0aCB8fCA2O1xuICAgIHJldHVybiBNYXRoLnJvdW5kKChNYXRoLnBvdygzNiwgbGVuZ3RoICsgMSkgLSBNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMzYsIGxlbmd0aCkpKS50b1N0cmluZygzNikuc2xpY2UoMSkgKyAobmFtZXNwYWNlID8gYC0ke25hbWVzcGFjZX1gIDogJycpO1xuICB9LFxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBwbHVnaW5zIG9uIGFueSBlbGVtZW50cyB3aXRoaW4gYGVsZW1gIChhbmQgYGVsZW1gIGl0c2VsZikgdGhhdCBhcmVuJ3QgYWxyZWFkeSBpbml0aWFsaXplZC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQgdG8gY2hlY2sgaW5zaWRlLiBBbHNvIGNoZWNrcyB0aGUgZWxlbWVudCBpdHNlbGYsIHVubGVzcyBpdCdzIHRoZSBgZG9jdW1lbnRgIG9iamVjdC5cbiAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHBsdWdpbnMgLSBBIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplLiBMZWF2ZSB0aGlzIG91dCB0byBpbml0aWFsaXplIGV2ZXJ5dGhpbmcuXG4gICAqL1xuICByZWZsb3c6IGZ1bmN0aW9uKGVsZW0sIHBsdWdpbnMpIHtcblxuICAgIC8vIElmIHBsdWdpbnMgaXMgdW5kZWZpbmVkLCBqdXN0IGdyYWIgZXZlcnl0aGluZ1xuICAgIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBsdWdpbnMgPSBPYmplY3Qua2V5cyh0aGlzLl9wbHVnaW5zKTtcbiAgICB9XG4gICAgLy8gSWYgcGx1Z2lucyBpcyBhIHN0cmluZywgY29udmVydCBpdCB0byBhbiBhcnJheSB3aXRoIG9uZSBpdGVtXG4gICAgZWxzZSBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwbHVnaW5zID0gW3BsdWdpbnNdO1xuICAgIH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBwbHVnaW5cbiAgICAkLmVhY2gocGx1Z2lucywgZnVuY3Rpb24oaSwgbmFtZSkge1xuICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHBsdWdpblxuICAgICAgdmFyIHBsdWdpbiA9IF90aGlzLl9wbHVnaW5zW25hbWVdO1xuXG4gICAgICAvLyBMb2NhbGl6ZSB0aGUgc2VhcmNoIHRvIGFsbCBlbGVtZW50cyBpbnNpZGUgZWxlbSwgYXMgd2VsbCBhcyBlbGVtIGl0c2VsZiwgdW5sZXNzIGVsZW0gPT09IGRvY3VtZW50XG4gICAgICB2YXIgJGVsZW0gPSAkKGVsZW0pLmZpbmQoJ1tkYXRhLScrbmFtZSsnXScpLmFkZEJhY2soJ1tkYXRhLScrbmFtZSsnXScpO1xuXG4gICAgICAvLyBGb3IgZWFjaCBwbHVnaW4gZm91bmQsIGluaXRpYWxpemUgaXRcbiAgICAgICRlbGVtLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkZWwgPSAkKHRoaXMpLFxuICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICAvLyBEb24ndCBkb3VibGUtZGlwIG9uIHBsdWdpbnNcbiAgICAgICAgaWYgKCRlbC5kYXRhKCd6ZlBsdWdpbicpKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiVHJpZWQgdG8gaW5pdGlhbGl6ZSBcIituYW1lK1wiIG9uIGFuIGVsZW1lbnQgdGhhdCBhbHJlYWR5IGhhcyBhIEZvdW5kYXRpb24gcGx1Z2luLlwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZigkZWwuYXR0cignZGF0YS1vcHRpb25zJykpe1xuICAgICAgICAgIHZhciB0aGluZyA9ICRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKS5zcGxpdCgnOycpLmZvckVhY2goZnVuY3Rpb24oZSwgaSl7XG4gICAgICAgICAgICB2YXIgb3B0ID0gZS5zcGxpdCgnOicpLm1hcChmdW5jdGlvbihlbCl7IHJldHVybiBlbC50cmltKCk7IH0pO1xuICAgICAgICAgICAgaWYob3B0WzBdKSBvcHRzW29wdFswXV0gPSBwYXJzZVZhbHVlKG9wdFsxXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5e1xuICAgICAgICAgICRlbC5kYXRhKCd6ZlBsdWdpbicsIG5ldyBwbHVnaW4oJCh0aGlzKSwgb3B0cykpO1xuICAgICAgICB9Y2F0Y2goZXIpe1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXIpO1xuICAgICAgICB9ZmluYWxseXtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuICBnZXRGbk5hbWU6IGZ1bmN0aW9uTmFtZSxcbiAgdHJhbnNpdGlvbmVuZDogZnVuY3Rpb24oJGVsZW0pe1xuICAgIHZhciB0cmFuc2l0aW9ucyA9IHtcbiAgICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICdPVHJhbnNpdGlvbic6ICdvdHJhbnNpdGlvbmVuZCdcbiAgICB9O1xuICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgIGVuZDtcblxuICAgIGZvciAodmFyIHQgaW4gdHJhbnNpdGlvbnMpe1xuICAgICAgaWYgKHR5cGVvZiBlbGVtLnN0eWxlW3RdICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGVuZCA9IHRyYW5zaXRpb25zW3RdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZihlbmQpe1xuICAgICAgcmV0dXJuIGVuZDtcbiAgICB9ZWxzZXtcbiAgICAgIGVuZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgJGVsZW0udHJpZ2dlckhhbmRsZXIoJ3RyYW5zaXRpb25lbmQnLCBbJGVsZW1dKTtcbiAgICAgIH0sIDEpO1xuICAgICAgcmV0dXJuICd0cmFuc2l0aW9uZW5kJztcbiAgICB9XG4gIH1cbn07XG5cbkZvdW5kYXRpb24udXRpbCA9IHtcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGZvciBhcHBseWluZyBhIGRlYm91bmNlIGVmZmVjdCB0byBhIGZ1bmN0aW9uIGNhbGwuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIC0gRnVuY3Rpb24gdG8gYmUgY2FsbGVkIGF0IGVuZCBvZiB0aW1lb3V0LlxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsYXkgLSBUaW1lIGluIG1zIHRvIGRlbGF5IHRoZSBjYWxsIG9mIGBmdW5jYC5cbiAgICogQHJldHVybnMgZnVuY3Rpb25cbiAgICovXG4gIHRocm90dGxlOiBmdW5jdGlvbiAoZnVuYywgZGVsYXkpIHtcbiAgICB2YXIgdGltZXIgPSBudWxsO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgaWYgKHRpbWVyID09PSBudWxsKSB7XG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICB0aW1lciA9IG51bGw7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuXG4vLyBUT0RPOiBjb25zaWRlciBub3QgbWFraW5nIHRoaXMgYSBqUXVlcnkgZnVuY3Rpb25cbi8vIFRPRE86IG5lZWQgd2F5IHRvIHJlZmxvdyB2cy4gcmUtaW5pdGlhbGl6ZVxuLyoqXG4gKiBUaGUgRm91bmRhdGlvbiBqUXVlcnkgbWV0aG9kLlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IG1ldGhvZCAtIEFuIGFjdGlvbiB0byBwZXJmb3JtIG9uIHRoZSBjdXJyZW50IGpRdWVyeSBvYmplY3QuXG4gKi9cbnZhciBmb3VuZGF0aW9uID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIG1ldGhvZCxcbiAgICAgICRtZXRhID0gJCgnbWV0YS5mb3VuZGF0aW9uLW1xJyksXG4gICAgICAkbm9KUyA9ICQoJy5uby1qcycpO1xuXG4gIGlmKCEkbWV0YS5sZW5ndGgpe1xuICAgICQoJzxtZXRhIGNsYXNzPVwiZm91bmRhdGlvbi1tcVwiPicpLmFwcGVuZFRvKGRvY3VtZW50LmhlYWQpO1xuICB9XG4gIGlmKCRub0pTLmxlbmd0aCl7XG4gICAgJG5vSlMucmVtb3ZlQ2xhc3MoJ25vLWpzJyk7XG4gIH1cblxuICBpZih0eXBlID09PSAndW5kZWZpbmVkJyl7Ly9uZWVkcyB0byBpbml0aWFsaXplIHRoZSBGb3VuZGF0aW9uIG9iamVjdCwgb3IgYW4gaW5kaXZpZHVhbCBwbHVnaW4uXG4gICAgRm91bmRhdGlvbi5NZWRpYVF1ZXJ5Ll9pbml0KCk7XG4gICAgRm91bmRhdGlvbi5yZWZsb3codGhpcyk7XG4gIH1lbHNlIGlmKHR5cGUgPT09ICdzdHJpbmcnKXsvL2FuIGluZGl2aWR1YWwgbWV0aG9kIHRvIGludm9rZSBvbiBhIHBsdWdpbiBvciBncm91cCBvZiBwbHVnaW5zXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpOy8vY29sbGVjdCBhbGwgdGhlIGFyZ3VtZW50cywgaWYgbmVjZXNzYXJ5XG4gICAgdmFyIHBsdWdDbGFzcyA9IHRoaXMuZGF0YSgnemZQbHVnaW4nKTsvL2RldGVybWluZSB0aGUgY2xhc3Mgb2YgcGx1Z2luXG5cbiAgICBpZihwbHVnQ2xhc3MgIT09IHVuZGVmaW5lZCAmJiBwbHVnQ2xhc3NbbWV0aG9kXSAhPT0gdW5kZWZpbmVkKXsvL21ha2Ugc3VyZSBib3RoIHRoZSBjbGFzcyBhbmQgbWV0aG9kIGV4aXN0XG4gICAgICBpZih0aGlzLmxlbmd0aCA9PT0gMSl7Ly9pZiB0aGVyZSdzIG9ubHkgb25lLCBjYWxsIGl0IGRpcmVjdGx5LlxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KHBsdWdDbGFzcywgYXJncyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGVsKXsvL290aGVyd2lzZSBsb29wIHRocm91Z2ggdGhlIGpRdWVyeSBjb2xsZWN0aW9uIGFuZCBpbnZva2UgdGhlIG1ldGhvZCBvbiBlYWNoXG4gICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkoJChlbCkuZGF0YSgnemZQbHVnaW4nKSwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1lbHNley8vZXJyb3IgZm9yIG5vIGNsYXNzIG9yIG5vIG1ldGhvZFxuICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiV2UncmUgc29ycnksICdcIiArIG1ldGhvZCArIFwiJyBpcyBub3QgYW4gYXZhaWxhYmxlIG1ldGhvZCBmb3IgXCIgKyAocGx1Z0NsYXNzID8gZnVuY3Rpb25OYW1lKHBsdWdDbGFzcykgOiAndGhpcyBlbGVtZW50JykgKyAnLicpO1xuICAgIH1cbiAgfWVsc2V7Ly9lcnJvciBmb3IgaW52YWxpZCBhcmd1bWVudCB0eXBlXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgV2UncmUgc29ycnksICR7dHlwZX0gaXMgbm90IGEgdmFsaWQgcGFyYW1ldGVyLiBZb3UgbXVzdCB1c2UgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBtZXRob2QgeW91IHdpc2ggdG8gaW52b2tlLmApO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxud2luZG93LkZvdW5kYXRpb24gPSBGb3VuZGF0aW9uO1xuJC5mbi5mb3VuZGF0aW9uID0gZm91bmRhdGlvbjtcblxuLy8gUG9seWZpbGwgZm9yIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuKGZ1bmN0aW9uKCkge1xuICBpZiAoIURhdGUubm93IHx8ICF3aW5kb3cuRGF0ZS5ub3cpXG4gICAgd2luZG93LkRhdGUubm93ID0gRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xuXG4gIHZhciB2ZW5kb3JzID0gWyd3ZWJraXQnLCAnbW96J107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsraSkge1xuICAgICAgdmFyIHZwID0gdmVuZG9yc1tpXTtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnArJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKHdpbmRvd1t2cCsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZwKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXSk7XG4gIH1cbiAgaWYgKC9pUChhZHxob25lfG9kKS4qT1MgNi8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICB8fCAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAhd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIHZhciBuZXh0VGltZSA9IE1hdGgubWF4KGxhc3RUaW1lICsgMTYsIG5vdyk7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhsYXN0VGltZSA9IG5leHRUaW1lKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRpbWUgLSBub3cpO1xuICAgIH07XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gY2xlYXJUaW1lb3V0O1xuICB9XG4gIC8qKlxuICAgKiBQb2x5ZmlsbCBmb3IgcGVyZm9ybWFuY2Uubm93LCByZXF1aXJlZCBieSByQUZcbiAgICovXG4gIGlmKCF3aW5kb3cucGVyZm9ybWFuY2UgfHwgIXdpbmRvdy5wZXJmb3JtYW5jZS5ub3cpe1xuICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHtcbiAgICAgIHN0YXJ0OiBEYXRlLm5vdygpLFxuICAgICAgbm93OiBmdW5jdGlvbigpeyByZXR1cm4gRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnQ7IH1cbiAgICB9O1xuICB9XG59KSgpO1xuaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xuICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKG9UaGlzKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcbiAgICAgIC8vIGludGVybmFsIElzQ2FsbGFibGUgZnVuY3Rpb25cbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XG4gICAgfVxuXG4gICAgdmFyIGFBcmdzICAgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICBmVG9CaW5kID0gdGhpcyxcbiAgICAgICAgZk5PUCAgICA9IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIGZCb3VuZCAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUFxuICAgICAgICAgICAgICAgICA/IHRoaXNcbiAgICAgICAgICAgICAgICAgOiBvVGhpcyxcbiAgICAgICAgICAgICAgICAgYUFyZ3MuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgICAgfTtcblxuICAgIGlmICh0aGlzLnByb3RvdHlwZSkge1xuICAgICAgLy8gbmF0aXZlIGZ1bmN0aW9ucyBkb24ndCBoYXZlIGEgcHJvdG90eXBlXG4gICAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xuICAgIH1cbiAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcblxuICAgIHJldHVybiBmQm91bmQ7XG4gIH07XG59XG4vLyBQb2x5ZmlsbCB0byBnZXQgdGhlIG5hbWUgb2YgYSBmdW5jdGlvbiBpbiBJRTlcbmZ1bmN0aW9uIGZ1bmN0aW9uTmFtZShmbikge1xuICBpZiAoRnVuY3Rpb24ucHJvdG90eXBlLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKFteKF17MSx9KVxcKC87XG4gICAgdmFyIHJlc3VsdHMgPSAoZnVuY05hbWVSZWdleCkuZXhlYygoZm4pLnRvU3RyaW5nKCkpO1xuICAgIHJldHVybiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpID8gcmVzdWx0c1sxXS50cmltKCkgOiBcIlwiO1xuICB9XG4gIGVsc2UgaWYgKGZuLnByb3RvdHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGZuLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGZuLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG59XG5mdW5jdGlvbiBwYXJzZVZhbHVlKHN0cil7XG4gIGlmICgndHJ1ZScgPT09IHN0cikgcmV0dXJuIHRydWU7XG4gIGVsc2UgaWYgKCdmYWxzZScgPT09IHN0cikgcmV0dXJuIGZhbHNlO1xuICBlbHNlIGlmICghaXNOYU4oc3RyICogMSkpIHJldHVybiBwYXJzZUZsb2F0KHN0cik7XG4gIHJldHVybiBzdHI7XG59XG4vLyBDb252ZXJ0IFBhc2NhbENhc2UgdG8ga2ViYWItY2FzZVxuLy8gVGhhbmsgeW91OiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS84OTU1NTgwXG5mdW5jdGlvbiBoeXBoZW5hdGUoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbn1cblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIERyaWxsZG93biBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uZHJpbGxkb3duXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5uZXN0XG4gKi9cblxuY2xhc3MgRHJpbGxkb3duIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSBkcmlsbGRvd24gbWVudS5cbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYW4gYWNjb3JkaW9uIG1lbnUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgRHJpbGxkb3duLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICBGb3VuZGF0aW9uLk5lc3QuRmVhdGhlcih0aGlzLiRlbGVtZW50LCAnZHJpbGxkb3duJyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdEcmlsbGRvd24nKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdEcmlsbGRvd24nLCB7XG4gICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAndXAnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnZG93bicsXG4gICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cycsXG4gICAgICAnRVNDQVBFJzogJ2Nsb3NlJyxcbiAgICAgICdUQUInOiAnZG93bicsXG4gICAgICAnU0hJRlRfVEFCJzogJ3VwJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBkcmlsbGRvd24gYnkgY3JlYXRpbmcgalF1ZXJ5IGNvbGxlY3Rpb25zIG9mIGVsZW1lbnRzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLiRzdWJtZW51QW5jaG9ycyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGkuaXMtZHJpbGxkb3duLXN1Ym1lbnUtcGFyZW50JykuY2hpbGRyZW4oJ2EnKTtcbiAgICB0aGlzLiRzdWJtZW51cyA9IHRoaXMuJHN1Ym1lbnVBbmNob3JzLnBhcmVudCgnbGknKS5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKTtcbiAgICB0aGlzLiRtZW51SXRlbXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2xpJykubm90KCcuanMtZHJpbGxkb3duLWJhY2snKS5hdHRyKCdyb2xlJywgJ21lbnVpdGVtJykuZmluZCgnYScpO1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YS1tdXRhdGUnLCAodGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLWRyaWxsZG93bicpIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ2RyaWxsZG93bicpKSk7XG5cbiAgICB0aGlzLl9wcmVwYXJlTWVudSgpO1xuICAgIHRoaXMuX3JlZ2lzdGVyRXZlbnRzKCk7XG5cbiAgICB0aGlzLl9rZXlib2FyZEV2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIHByZXBhcmVzIGRyaWxsZG93biBtZW51IGJ5IHNldHRpbmcgYXR0cmlidXRlcyB0byBsaW5rcyBhbmQgZWxlbWVudHNcbiAgICogc2V0cyBhIG1pbiBoZWlnaHQgdG8gcHJldmVudCBjb250ZW50IGp1bXBpbmdcbiAgICogd3JhcHMgdGhlIGVsZW1lbnQgaWYgbm90IGFscmVhZHkgd3JhcHBlZFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9wcmVwYXJlTWVudSgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIC8vIGlmKCF0aGlzLm9wdGlvbnMuaG9sZE9wZW4pe1xuICAgIC8vICAgdGhpcy5fbWVudUxpbmtFdmVudHMoKTtcbiAgICAvLyB9XG4gICAgdGhpcy4kc3VibWVudUFuY2hvcnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyICRsaW5rID0gJCh0aGlzKTtcbiAgICAgIHZhciAkc3ViID0gJGxpbmsucGFyZW50KCk7XG4gICAgICBpZihfdGhpcy5vcHRpb25zLnBhcmVudExpbmspe1xuICAgICAgICAkbGluay5jbG9uZSgpLnByZXBlbmRUbygkc3ViLmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XScpKS53cmFwKCc8bGkgY2xhc3M9XCJpcy1zdWJtZW51LXBhcmVudC1pdGVtIGlzLXN1Ym1lbnUtaXRlbSBpcy1kcmlsbGRvd24tc3VibWVudS1pdGVtXCIgcm9sZT1cIm1lbnUtaXRlbVwiPjwvbGk+Jyk7XG4gICAgICB9XG4gICAgICAkbGluay5kYXRhKCdzYXZlZEhyZWYnLCAkbGluay5hdHRyKCdocmVmJykpLnJlbW92ZUF0dHIoJ2hyZWYnKS5hdHRyKCd0YWJpbmRleCcsIDApO1xuICAgICAgJGxpbmsuY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJylcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiB0cnVlLFxuICAgICAgICAgICAgJ3RhYmluZGV4JzogMCxcbiAgICAgICAgICAgICdyb2xlJzogJ21lbnUnXG4gICAgICAgICAgfSk7XG4gICAgICBfdGhpcy5fZXZlbnRzKCRsaW5rKTtcbiAgICB9KTtcbiAgICB0aGlzLiRzdWJtZW51cy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJG1lbnUgPSAkKHRoaXMpLFxuICAgICAgICAgICRiYWNrID0gJG1lbnUuZmluZCgnLmpzLWRyaWxsZG93bi1iYWNrJyk7XG4gICAgICBpZighJGJhY2subGVuZ3RoKXtcbiAgICAgICAgc3dpdGNoIChfdGhpcy5vcHRpb25zLmJhY2tCdXR0b25Qb3NpdGlvbikge1xuICAgICAgICAgIGNhc2UgXCJib3R0b21cIjpcbiAgICAgICAgICAgICRtZW51LmFwcGVuZChfdGhpcy5vcHRpb25zLmJhY2tCdXR0b24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcInRvcFwiOlxuICAgICAgICAgICAgJG1lbnUucHJlcGVuZChfdGhpcy5vcHRpb25zLmJhY2tCdXR0b24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbnN1cHBvcnRlZCBiYWNrQnV0dG9uUG9zaXRpb24gdmFsdWUgJ1wiICsgX3RoaXMub3B0aW9ucy5iYWNrQnV0dG9uUG9zaXRpb24gKyBcIidcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIF90aGlzLl9iYWNrKCRtZW51KTtcbiAgICB9KTtcblxuICAgIHRoaXMuJHN1Ym1lbnVzLmFkZENsYXNzKCdpbnZpc2libGUnKTtcbiAgICBpZighdGhpcy5vcHRpb25zLmF1dG9IZWlnaHQpIHtcbiAgICAgIHRoaXMuJHN1Ym1lbnVzLmFkZENsYXNzKCdkcmlsbGRvd24tc3VibWVudS1jb3Zlci1wcmV2aW91cycpO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBhIHdyYXBwZXIgb24gZWxlbWVudCBpZiBpdCBkb2Vzbid0IGV4aXN0LlxuICAgIGlmKCF0aGlzLiRlbGVtZW50LnBhcmVudCgpLmhhc0NsYXNzKCdpcy1kcmlsbGRvd24nKSl7XG4gICAgICB0aGlzLiR3cmFwcGVyID0gJCh0aGlzLm9wdGlvbnMud3JhcHBlcikuYWRkQ2xhc3MoJ2lzLWRyaWxsZG93bicpO1xuICAgICAgaWYodGhpcy5vcHRpb25zLmFuaW1hdGVIZWlnaHQpIHRoaXMuJHdyYXBwZXIuYWRkQ2xhc3MoJ2FuaW1hdGUtaGVpZ2h0Jyk7XG4gICAgICB0aGlzLiRlbGVtZW50LndyYXAodGhpcy4kd3JhcHBlcik7XG4gICAgfVxuICAgIC8vIHNldCB3cmFwcGVyXG4gICAgdGhpcy4kd3JhcHBlciA9IHRoaXMuJGVsZW1lbnQucGFyZW50KCk7XG4gICAgdGhpcy4kd3JhcHBlci5jc3ModGhpcy5fZ2V0TWF4RGltcygpKTtcbiAgfVxuXG4gIF9yZXNpemUoKSB7XG4gICAgdGhpcy4kd3JhcHBlci5jc3MoeydtYXgtd2lkdGgnOiAnbm9uZScsICdtaW4taGVpZ2h0JzogJ25vbmUnfSk7XG4gICAgLy8gX2dldE1heERpbXMgaGFzIHNpZGUgZWZmZWN0cyAoYm9vKSBidXQgY2FsbGluZyBpdCBzaG91bGQgdXBkYXRlIGFsbCBvdGhlciBuZWNlc3NhcnkgaGVpZ2h0cyAmIHdpZHRoc1xuICAgIHRoaXMuJHdyYXBwZXIuY3NzKHRoaXMuX2dldE1heERpbXMoKSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyB0byBlbGVtZW50cyBpbiB0aGUgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIHRoZSBjdXJyZW50IG1lbnUgaXRlbSB0byBhZGQgaGFuZGxlcnMgdG8uXG4gICAqL1xuICBfZXZlbnRzKCRlbGVtKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICRlbGVtLm9mZignY2xpY2suemYuZHJpbGxkb3duJylcbiAgICAub24oJ2NsaWNrLnpmLmRyaWxsZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgaWYoJChlLnRhcmdldCkucGFyZW50c1VudGlsKCd1bCcsICdsaScpLmhhc0NsYXNzKCdpcy1kcmlsbGRvd24tc3VibWVudS1wYXJlbnQnKSl7XG4gICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYoZS50YXJnZXQgIT09IGUuY3VycmVudFRhcmdldC5maXJzdEVsZW1lbnRDaGlsZCl7XG4gICAgICAvLyAgIHJldHVybiBmYWxzZTtcbiAgICAgIC8vIH1cbiAgICAgIF90aGlzLl9zaG93KCRlbGVtLnBhcmVudCgnbGknKSk7XG5cbiAgICAgIGlmKF90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKXtcbiAgICAgICAgdmFyICRib2R5ID0gJCgnYm9keScpO1xuICAgICAgICAkYm9keS5vZmYoJy56Zi5kcmlsbGRvd24nKS5vbignY2xpY2suemYuZHJpbGxkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgaWYgKGUudGFyZ2V0ID09PSBfdGhpcy4kZWxlbWVudFswXSB8fCAkLmNvbnRhaW5zKF90aGlzLiRlbGVtZW50WzBdLCBlLnRhcmdldCkpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIF90aGlzLl9oaWRlQWxsKCk7XG4gICAgICAgICAgJGJvZHkub2ZmKCcuemYuZHJpbGxkb3duJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXHQgIHRoaXMuJGVsZW1lbnQub24oJ211dGF0ZW1lLnpmLnRyaWdnZXInLCB0aGlzLl9yZXNpemUuYmluZCh0aGlzKSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyB0byB0aGUgbWVudSBlbGVtZW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9yZWdpc3RlckV2ZW50cygpIHtcbiAgICBpZih0aGlzLm9wdGlvbnMuc2Nyb2xsVG9wKXtcbiAgICAgIHRoaXMuX2JpbmRIYW5kbGVyID0gdGhpcy5fc2Nyb2xsVG9wLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdvcGVuLnpmLmRyaWxsZG93biBoaWRlLnpmLmRyaWxsZG93biBjbG9zZWQuemYuZHJpbGxkb3duJyx0aGlzLl9iaW5kSGFuZGxlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjcm9sbCB0byBUb3Agb2YgRWxlbWVudCBvciBkYXRhLXNjcm9sbC10b3AtZWxlbWVudFxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIERyaWxsZG93biNzY3JvbGxtZVxuICAgKi9cbiAgX3Njcm9sbFRvcCgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciAkc2Nyb2xsVG9wRWxlbWVudCA9IF90aGlzLm9wdGlvbnMuc2Nyb2xsVG9wRWxlbWVudCE9Jyc/JChfdGhpcy5vcHRpb25zLnNjcm9sbFRvcEVsZW1lbnQpOl90aGlzLiRlbGVtZW50LFxuICAgICAgICBzY3JvbGxQb3MgPSBwYXJzZUludCgkc2Nyb2xsVG9wRWxlbWVudC5vZmZzZXQoKS50b3ArX3RoaXMub3B0aW9ucy5zY3JvbGxUb3BPZmZzZXQpO1xuICAgICQoJ2h0bWwsIGJvZHknKS5zdG9wKHRydWUpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IHNjcm9sbFBvcyB9LCBfdGhpcy5vcHRpb25zLmFuaW1hdGlvbkR1cmF0aW9uLCBfdGhpcy5vcHRpb25zLmFuaW1hdGlvbkVhc2luZyxmdW5jdGlvbigpe1xuICAgICAgLyoqXG4gICAgICAgICogRmlyZXMgYWZ0ZXIgdGhlIG1lbnUgaGFzIHNjcm9sbGVkXG4gICAgICAgICogQGV2ZW50IERyaWxsZG93biNzY3JvbGxtZVxuICAgICAgICAqL1xuICAgICAgaWYodGhpcz09PSQoJ2h0bWwnKVswXSlfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzY3JvbGxtZS56Zi5kcmlsbGRvd24nKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGtleWRvd24gZXZlbnQgbGlzdGVuZXIgdG8gYGxpYCdzIGluIHRoZSBtZW51LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2tleWJvYXJkRXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiRtZW51SXRlbXMuYWRkKHRoaXMuJGVsZW1lbnQuZmluZCgnLmpzLWRyaWxsZG93bi1iYWNrID4gYSwgLmlzLXN1Ym1lbnUtcGFyZW50LWl0ZW0gPiBhJykpLm9uKCdrZXlkb3duLnpmLmRyaWxsZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgICAkZWxlbWVudHMgPSAkZWxlbWVudC5wYXJlbnQoJ2xpJykucGFyZW50KCd1bCcpLmNoaWxkcmVuKCdsaScpLmNoaWxkcmVuKCdhJyksXG4gICAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAgICRuZXh0RWxlbWVudDtcblxuICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICBpZiAoJCh0aGlzKS5pcygkZWxlbWVudCkpIHtcbiAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5tYXgoMCwgaS0xKSk7XG4gICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKE1hdGgubWluKGkrMSwgJGVsZW1lbnRzLmxlbmd0aC0xKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0RyaWxsZG93bicsIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCRlbGVtZW50LmlzKF90aGlzLiRzdWJtZW51QW5jaG9ycykpIHtcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtZW50LnBhcmVudCgnbGknKSk7XG4gICAgICAgICAgICAkZWxlbWVudC5wYXJlbnQoJ2xpJykub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5maW5kKCd1bCBsaSBhJykuZmlsdGVyKF90aGlzLiRtZW51SXRlbXMpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKSk7XG4gICAgICAgICAgJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKS5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKCRlbGVtZW50KSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpLmNoaWxkcmVuKCdhJykuZmlyc3QoKS5mb2N1cygpO1xuICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkcHJldkVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICAvLyBEb24ndCB0YXAgZm9jdXMgb24gZmlyc3QgZWxlbWVudCBpbiByb290IHVsXG4gICAgICAgICAgcmV0dXJuICEkZWxlbWVudC5pcyhfdGhpcy4kZWxlbWVudC5maW5kKCc+IGxpOmZpcnN0LWNoaWxkID4gYScpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJG5leHRFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgLy8gRG9uJ3QgdGFwIGZvY3VzIG9uIGxhc3QgZWxlbWVudCBpbiByb290IHVsXG4gICAgICAgICAgcmV0dXJuICEkZWxlbWVudC5pcyhfdGhpcy4kZWxlbWVudC5maW5kKCc+IGxpOmxhc3QtY2hpbGQgPiBhJykpO1xuICAgICAgICB9LFxuICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgLy8gRG9uJ3QgY2xvc2Ugb24gZWxlbWVudCBpbiByb290IHVsXG4gICAgICAgICAgaWYgKCEkZWxlbWVudC5pcyhfdGhpcy4kZWxlbWVudC5maW5kKCc+IGxpID4gYScpKSkge1xuICAgICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW1lbnQucGFyZW50KCkucGFyZW50KCkpO1xuICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50KCkucGFyZW50KCkuc2libGluZ3MoJ2EnKS5mb2N1cygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCEkZWxlbWVudC5pcyhfdGhpcy4kbWVudUl0ZW1zKSkgeyAvLyBub3QgbWVudSBpdGVtIG1lYW5zIGJhY2sgYnV0dG9uXG4gICAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbWVudC5wYXJlbnQoJ2xpJykucGFyZW50KCd1bCcpKTtcbiAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKS5wYXJlbnQoJ2xpJykuY2hpbGRyZW4oJ2EnKS5maXJzdCgpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIH0sIDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCRlbGVtZW50LmlzKF90aGlzLiRzdWJtZW51QW5jaG9ycykpIHtcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtZW50LnBhcmVudCgnbGknKSk7XG4gICAgICAgICAgICAkZWxlbWVudC5wYXJlbnQoJ2xpJykub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5maW5kKCd1bCBsaSBhJykuZmlsdGVyKF90aGlzLiRtZW51SXRlbXMpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbihwcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgIGlmIChwcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTsgLy8gZW5kIGtleWJvYXJkQWNjZXNzXG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIGFsbCBvcGVuIGVsZW1lbnRzLCBhbmQgcmV0dXJucyB0byByb290IG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgRHJpbGxkb3duI2Nsb3NlZFxuICAgKi9cbiAgX2hpZGVBbGwoKSB7XG4gICAgdmFyICRlbGVtID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXMtZHJpbGxkb3duLXN1Ym1lbnUuaXMtYWN0aXZlJykuYWRkQ2xhc3MoJ2lzLWNsb3NpbmcnKTtcbiAgICBpZih0aGlzLm9wdGlvbnMuYXV0b0hlaWdodCkgdGhpcy4kd3JhcHBlci5jc3Moe2hlaWdodDokZWxlbS5wYXJlbnQoKS5jbG9zZXN0KCd1bCcpLmRhdGEoJ2NhbGNIZWlnaHQnKX0pO1xuICAgICRlbGVtLm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoJGVsZW0pLCBmdW5jdGlvbihlKXtcbiAgICAgICRlbGVtLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtY2xvc2luZycpO1xuICAgIH0pO1xuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgbWVudSBpcyBmdWxseSBjbG9zZWQuXG4gICAgICAgICAqIEBldmVudCBEcmlsbGRvd24jY2xvc2VkXG4gICAgICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2xvc2VkLnpmLmRyaWxsZG93bicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgbGlzdGVuZXIgZm9yIGVhY2ggYGJhY2tgIGJ1dHRvbiwgYW5kIGNsb3NlcyBvcGVuIG1lbnVzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIERyaWxsZG93biNiYWNrXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIHRoZSBjdXJyZW50IHN1Yi1tZW51IHRvIGFkZCBgYmFja2AgZXZlbnQuXG4gICAqL1xuICBfYmFjaygkZWxlbSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgJGVsZW0ub2ZmKCdjbGljay56Zi5kcmlsbGRvd24nKTtcbiAgICAkZWxlbS5jaGlsZHJlbignLmpzLWRyaWxsZG93bi1iYWNrJylcbiAgICAgIC5vbignY2xpY2suemYuZHJpbGxkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3VzZXVwIG9uIGJhY2snKTtcbiAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW0pO1xuXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgcGFyZW50IHN1Ym1lbnUsIGNhbGwgc2hvd1xuICAgICAgICBsZXQgcGFyZW50U3ViTWVudSA9ICRlbGVtLnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpO1xuICAgICAgICBpZiAocGFyZW50U3ViTWVudS5sZW5ndGgpIHtcbiAgICAgICAgICBfdGhpcy5fc2hvdyhwYXJlbnRTdWJNZW51KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBsaXN0ZW5lciB0byBtZW51IGl0ZW1zIHcvbyBzdWJtZW51cyB0byBjbG9zZSBvcGVuIG1lbnVzIG9uIGNsaWNrLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9tZW51TGlua0V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuJG1lbnVJdGVtcy5ub3QoJy5pcy1kcmlsbGRvd24tc3VibWVudS1wYXJlbnQnKVxuICAgICAgICAub2ZmKCdjbGljay56Zi5kcmlsbGRvd24nKVxuICAgICAgICAub24oJ2NsaWNrLnpmLmRyaWxsZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIC8vIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgX3RoaXMuX2hpZGVBbGwoKTtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIGEgc3VibWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBmaXJlcyBEcmlsbGRvd24jb3BlblxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW0gLSB0aGUgY3VycmVudCBlbGVtZW50IHdpdGggYSBzdWJtZW51IHRvIG9wZW4sIGkuZS4gdGhlIGBsaWAgdGFnLlxuICAgKi9cbiAgX3Nob3coJGVsZW0pIHtcbiAgICBpZih0aGlzLm9wdGlvbnMuYXV0b0hlaWdodCkgdGhpcy4kd3JhcHBlci5jc3Moe2hlaWdodDokZWxlbS5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKS5kYXRhKCdjYWxjSGVpZ2h0Jyl9KTtcbiAgICAkZWxlbS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSk7XG4gICAgJGVsZW0uY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJykuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdpbnZpc2libGUnKS5hdHRyKCdhcmlhLWhpZGRlbicsIGZhbHNlKTtcbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBzdWJtZW51IGhhcyBvcGVuZWQuXG4gICAgICogQGV2ZW50IERyaWxsZG93biNvcGVuXG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdvcGVuLnpmLmRyaWxsZG93bicsIFskZWxlbV0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIaWRlcyBhIHN1Ym1lbnVcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBmaXJlcyBEcmlsbGRvd24jaGlkZVxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW0gLSB0aGUgY3VycmVudCBzdWItbWVudSB0byBoaWRlLCBpLmUuIHRoZSBgdWxgIHRhZy5cbiAgICovXG4gIF9oaWRlKCRlbGVtKSB7XG4gICAgaWYodGhpcy5vcHRpb25zLmF1dG9IZWlnaHQpIHRoaXMuJHdyYXBwZXIuY3NzKHtoZWlnaHQ6JGVsZW0ucGFyZW50KCkuY2xvc2VzdCgndWwnKS5kYXRhKCdjYWxjSGVpZ2h0Jyl9KTtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICRlbGVtLnBhcmVudCgnbGknKS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpO1xuICAgICRlbGVtLmF0dHIoJ2FyaWEtaGlkZGVuJywgdHJ1ZSkuYWRkQ2xhc3MoJ2lzLWNsb3NpbmcnKVxuICAgICRlbGVtLmFkZENsYXNzKCdpcy1jbG9zaW5nJylcbiAgICAgICAgIC5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKCRlbGVtKSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgJGVsZW0ucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1jbG9zaW5nJyk7XG4gICAgICAgICAgICRlbGVtLmJsdXIoKS5hZGRDbGFzcygnaW52aXNpYmxlJyk7XG4gICAgICAgICB9KTtcbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBzdWJtZW51IGhhcyBjbG9zZWQuXG4gICAgICogQGV2ZW50IERyaWxsZG93biNoaWRlXG4gICAgICovXG4gICAgJGVsZW0udHJpZ2dlcignaGlkZS56Zi5kcmlsbGRvd24nLCBbJGVsZW1dKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlcyB0aHJvdWdoIHRoZSBuZXN0ZWQgbWVudXMgdG8gY2FsY3VsYXRlIHRoZSBtaW4taGVpZ2h0LCBhbmQgbWF4LXdpZHRoIGZvciB0aGUgbWVudS5cbiAgICogUHJldmVudHMgY29udGVudCBqdW1waW5nLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9nZXRNYXhEaW1zKCkge1xuICAgIHZhciAgbWF4SGVpZ2h0ID0gMCwgcmVzdWx0ID0ge30sIF90aGlzID0gdGhpcztcbiAgICB0aGlzLiRzdWJtZW51cy5hZGQodGhpcy4kZWxlbWVudCkuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyIG51bU9mRWxlbXMgPSAkKHRoaXMpLmNoaWxkcmVuKCdsaScpLmxlbmd0aDtcbiAgICAgIHZhciBoZWlnaHQgPSBGb3VuZGF0aW9uLkJveC5HZXREaW1lbnNpb25zKHRoaXMpLmhlaWdodDtcbiAgICAgIG1heEhlaWdodCA9IGhlaWdodCA+IG1heEhlaWdodCA/IGhlaWdodCA6IG1heEhlaWdodDtcbiAgICAgIGlmKF90aGlzLm9wdGlvbnMuYXV0b0hlaWdodCkge1xuICAgICAgICAkKHRoaXMpLmRhdGEoJ2NhbGNIZWlnaHQnLGhlaWdodCk7XG4gICAgICAgIGlmICghJCh0aGlzKS5oYXNDbGFzcygnaXMtZHJpbGxkb3duLXN1Ym1lbnUnKSkgcmVzdWx0WydoZWlnaHQnXSA9IGhlaWdodDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmKCF0aGlzLm9wdGlvbnMuYXV0b0hlaWdodCkgcmVzdWx0WydtaW4taGVpZ2h0J10gPSBgJHttYXhIZWlnaHR9cHhgO1xuXG4gICAgcmVzdWx0WydtYXgtd2lkdGgnXSA9IGAke3RoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGh9cHhgO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgRHJpbGxkb3duIE1lbnVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIGlmKHRoaXMub3B0aW9ucy5zY3JvbGxUb3ApIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYuZHJpbGxkb3duJyx0aGlzLl9iaW5kSGFuZGxlcik7XG4gICAgdGhpcy5faGlkZUFsbCgpO1xuXHQgIHRoaXMuJGVsZW1lbnQub2ZmKCdtdXRhdGVtZS56Zi50cmlnZ2VyJyk7XG4gICAgRm91bmRhdGlvbi5OZXN0LkJ1cm4odGhpcy4kZWxlbWVudCwgJ2RyaWxsZG93bicpO1xuICAgIHRoaXMuJGVsZW1lbnQudW53cmFwKClcbiAgICAgICAgICAgICAgICAgLmZpbmQoJy5qcy1kcmlsbGRvd24tYmFjaywgLmlzLXN1Ym1lbnUtcGFyZW50LWl0ZW0nKS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAuZW5kKCkuZmluZCgnLmlzLWFjdGl2ZSwgLmlzLWNsb3NpbmcsIC5pcy1kcmlsbGRvd24tc3VibWVudScpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtY2xvc2luZyBpcy1kcmlsbGRvd24tc3VibWVudScpXG4gICAgICAgICAgICAgICAgIC5lbmQoKS5maW5kKCdbZGF0YS1zdWJtZW51XScpLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIHRhYmluZGV4IHJvbGUnKTtcbiAgICB0aGlzLiRzdWJtZW51QW5jaG9ycy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzKS5vZmYoJy56Zi5kcmlsbGRvd24nKTtcbiAgICB9KTtcblxuICAgIHRoaXMuJHN1Ym1lbnVzLnJlbW92ZUNsYXNzKCdkcmlsbGRvd24tc3VibWVudS1jb3Zlci1wcmV2aW91cycpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdhJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyICRsaW5rID0gJCh0aGlzKTtcbiAgICAgICRsaW5rLnJlbW92ZUF0dHIoJ3RhYmluZGV4Jyk7XG4gICAgICBpZigkbGluay5kYXRhKCdzYXZlZEhyZWYnKSl7XG4gICAgICAgICRsaW5rLmF0dHIoJ2hyZWYnLCAkbGluay5kYXRhKCdzYXZlZEhyZWYnKSkucmVtb3ZlRGF0YSgnc2F2ZWRIcmVmJyk7XG4gICAgICB9ZWxzZXsgcmV0dXJuOyB9XG4gICAgfSk7XG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9O1xufVxuXG5EcmlsbGRvd24uZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBNYXJrdXAgdXNlZCBmb3IgSlMgZ2VuZXJhdGVkIGJhY2sgYnV0dG9uLiBQcmVwZW5kZWQgIG9yIGFwcGVuZGVkIChzZWUgYmFja0J1dHRvblBvc2l0aW9uKSB0byBzdWJtZW51IGxpc3RzIGFuZCBkZWxldGVkIG9uIGBkZXN0cm95YCBtZXRob2QsICdqcy1kcmlsbGRvd24tYmFjaycgY2xhc3MgcmVxdWlyZWQuIFJlbW92ZSB0aGUgYmFja3NsYXNoIChgXFxgKSBpZiBjb3B5IGFuZCBwYXN0aW5nLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICc8bGkgY2xhc3M9XCJqcy1kcmlsbGRvd24tYmFja1wiPjxhIHRhYmluZGV4PVwiMFwiPkJhY2s8L2E+PC9saT4nXG4gICAqL1xuICBiYWNrQnV0dG9uOiAnPGxpIGNsYXNzPVwianMtZHJpbGxkb3duLWJhY2tcIj48YSB0YWJpbmRleD1cIjBcIj5CYWNrPC9hPjwvbGk+JyxcbiAgLyoqXG4gICAqIFBvc2l0aW9uIHRoZSBiYWNrIGJ1dHRvbiBlaXRoZXIgYXQgdGhlIHRvcCBvciBib3R0b20gb2YgZHJpbGxkb3duIHN1Ym1lbnVzLiBDYW4gYmUgYCdsZWZ0J2Agb3IgYCdib3R0b20nYC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCB0b3BcbiAgICovXG4gIGJhY2tCdXR0b25Qb3NpdGlvbjogJ3RvcCcsXG4gIC8qKlxuICAgKiBNYXJrdXAgdXNlZCB0byB3cmFwIGRyaWxsZG93biBtZW51LiBVc2UgYSBjbGFzcyBuYW1lIGZvciBpbmRlcGVuZGVudCBzdHlsaW5nOyB0aGUgSlMgYXBwbGllZCBjbGFzczogYGlzLWRyaWxsZG93bmAgaXMgcmVxdWlyZWQuIFJlbW92ZSB0aGUgYmFja3NsYXNoIChgXFxgKSBpZiBjb3B5IGFuZCBwYXN0aW5nLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICc8ZGl2PjwvZGl2PidcbiAgICovXG4gIHdyYXBwZXI6ICc8ZGl2PjwvZGl2PicsXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBwYXJlbnQgbGluayB0byB0aGUgc3VibWVudS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHBhcmVudExpbms6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3cgdGhlIG1lbnUgdG8gcmV0dXJuIHRvIHJvb3QgbGlzdCBvbiBib2R5IGNsaWNrLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgY2xvc2VPbkNsaWNrOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93IHRoZSBtZW51IHRvIGF1dG8gYWRqdXN0IGhlaWdodC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGF1dG9IZWlnaHQ6IGZhbHNlLFxuICAvKipcbiAgICogQW5pbWF0ZSB0aGUgYXV0byBhZGp1c3QgaGVpZ2h0LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYW5pbWF0ZUhlaWdodDogZmFsc2UsXG4gIC8qKlxuICAgKiBTY3JvbGwgdG8gdGhlIHRvcCBvZiB0aGUgbWVudSBhZnRlciBvcGVuaW5nIGEgc3VibWVudSBvciBuYXZpZ2F0aW5nIGJhY2sgdXNpbmcgdGhlIG1lbnUgYmFjayBidXR0b25cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHNjcm9sbFRvcDogZmFsc2UsXG4gIC8qKlxuICAgKiBTdHJpbmcganF1ZXJ5IHNlbGVjdG9yIChmb3IgZXhhbXBsZSAnYm9keScpIG9mIGVsZW1lbnQgdG8gdGFrZSBvZmZzZXQoKS50b3AgZnJvbSwgaWYgZW1wdHkgc3RyaW5nIHRoZSBkcmlsbGRvd24gbWVudSBvZmZzZXQoKS50b3AgaXMgdGFrZW5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAnJ1xuICAgKi9cbiAgc2Nyb2xsVG9wRWxlbWVudDogJycsXG4gIC8qKlxuICAgKiBTY3JvbGxUb3Agb2Zmc2V0XG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgMFxuICAgKi9cbiAgc2Nyb2xsVG9wT2Zmc2V0OiAwLFxuICAvKipcbiAgICogU2Nyb2xsIGFuaW1hdGlvbiBkdXJhdGlvblxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDUwMFxuICAgKi9cbiAgYW5pbWF0aW9uRHVyYXRpb246IDUwMCxcbiAgLyoqXG4gICAqIFNjcm9sbCBhbmltYXRpb24gZWFzaW5nLiBDYW4gYmUgYCdzd2luZydgIG9yIGAnbGluZWFyJ2AuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9hbmltYXRlfEpRdWVyeSBhbmltYXRlfVxuICAgKiBAZGVmYXVsdCAnc3dpbmcnXG4gICAqL1xuICBhbmltYXRpb25FYXNpbmc6ICdzd2luZydcbiAgLy8gaG9sZE9wZW46IGZhbHNlXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oRHJpbGxkb3duLCAnRHJpbGxkb3duJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBEcm9wZG93bk1lbnUgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmRyb3Bkb3duLW1lbnVcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuYm94XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm5lc3RcbiAqL1xuXG5jbGFzcyBEcm9wZG93bk1lbnUge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEcm9wZG93bk1lbnUuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgRHJvcGRvd25NZW51I2luaXRcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGRyb3Bkb3duIG1lbnUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgRHJvcGRvd25NZW51LmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICBGb3VuZGF0aW9uLk5lc3QuRmVhdGhlcih0aGlzLiRlbGVtZW50LCAnZHJvcGRvd24nKTtcbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdEcm9wZG93bk1lbnUnKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdEcm9wZG93bk1lbnUnLCB7XG4gICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAndXAnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnZG93bicsXG4gICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cycsXG4gICAgICAnRVNDQVBFJzogJ2Nsb3NlJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4sIGFuZCBjYWxscyBfcHJlcGFyZU1lbnVcbiAgICogQHByaXZhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgc3VicyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKS5hZGRDbGFzcygnZmlyc3Qtc3ViJyk7XG5cbiAgICB0aGlzLiRtZW51SXRlbXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tyb2xlPVwibWVudWl0ZW1cIl0nKTtcbiAgICB0aGlzLiR0YWJzID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignW3JvbGU9XCJtZW51aXRlbVwiXScpO1xuICAgIHRoaXMuJHRhYnMuZmluZCgndWwuaXMtZHJvcGRvd24tc3VibWVudScpLmFkZENsYXNzKHRoaXMub3B0aW9ucy52ZXJ0aWNhbENsYXNzKTtcblxuICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKHRoaXMub3B0aW9ucy5yaWdodENsYXNzKSB8fCB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAncmlnaHQnIHx8IEZvdW5kYXRpb24ucnRsKCkgfHwgdGhpcy4kZWxlbWVudC5wYXJlbnRzKCcudG9wLWJhci1yaWdodCcpLmlzKCcqJykpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPSAncmlnaHQnO1xuICAgICAgc3Vicy5hZGRDbGFzcygnb3BlbnMtbGVmdCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWJzLmFkZENsYXNzKCdvcGVucy1yaWdodCcpO1xuICAgIH1cbiAgICB0aGlzLmNoYW5nZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfTtcblxuICBfaXNWZXJ0aWNhbCgpIHtcbiAgICByZXR1cm4gdGhpcy4kdGFicy5jc3MoJ2Rpc3BsYXknKSA9PT0gJ2Jsb2NrJztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byBlbGVtZW50cyB3aXRoaW4gdGhlIG1lbnVcbiAgICogQHByaXZhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgIGhhc1RvdWNoID0gJ29udG91Y2hzdGFydCcgaW4gd2luZG93IHx8ICh0eXBlb2Ygd2luZG93Lm9udG91Y2hzdGFydCAhPT0gJ3VuZGVmaW5lZCcpLFxuICAgICAgICBwYXJDbGFzcyA9ICdpcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCc7XG5cbiAgICAvLyB1c2VkIGZvciBvbkNsaWNrIGFuZCBpbiB0aGUga2V5Ym9hcmQgaGFuZGxlcnNcbiAgICB2YXIgaGFuZGxlQ2xpY2tGbiA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciAkZWxlbSA9ICQoZS50YXJnZXQpLnBhcmVudHNVbnRpbCgndWwnLCBgLiR7cGFyQ2xhc3N9YCksXG4gICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpLFxuICAgICAgICAgIGhhc0NsaWNrZWQgPSAkZWxlbS5hdHRyKCdkYXRhLWlzLWNsaWNrJykgPT09ICd0cnVlJyxcbiAgICAgICAgICAkc3ViID0gJGVsZW0uY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51Jyk7XG5cbiAgICAgIGlmIChoYXNTdWIpIHtcbiAgICAgICAgaWYgKGhhc0NsaWNrZWQpIHtcbiAgICAgICAgICBpZiAoIV90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrIHx8ICghX3RoaXMub3B0aW9ucy5jbGlja09wZW4gJiYgIWhhc1RvdWNoKSB8fCAoX3RoaXMub3B0aW9ucy5mb3JjZUZvbGxvdyAmJiBoYXNUb3VjaCkpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBfdGhpcy5fc2hvdygkc3ViKTtcbiAgICAgICAgICAkZWxlbS5hZGQoJGVsZW0ucGFyZW50c1VudGlsKF90aGlzLiRlbGVtZW50LCBgLiR7cGFyQ2xhc3N9YCkpLmF0dHIoJ2RhdGEtaXMtY2xpY2snLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsaWNrT3BlbiB8fCBoYXNUb3VjaCkge1xuICAgICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdjbGljay56Zi5kcm9wZG93bm1lbnUgdG91Y2hzdGFydC56Zi5kcm9wZG93bm1lbnUnLCBoYW5kbGVDbGlja0ZuKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgTGVhZiBlbGVtZW50IENsaWNrc1xuICAgIGlmKF90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrSW5zaWRlKXtcbiAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignY2xpY2suemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpO1xuICAgICAgICBpZighaGFzU3ViKXtcbiAgICAgICAgICBfdGhpcy5faGlkZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXNhYmxlSG92ZXIpIHtcbiAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignbW91c2VlbnRlci56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyk7XG5cbiAgICAgICAgaWYgKGhhc1N1Yikge1xuICAgICAgICAgIGNsZWFyVGltZW91dCgkZWxlbS5kYXRhKCdfZGVsYXknKSk7XG4gICAgICAgICAgJGVsZW0uZGF0YSgnX2RlbGF5Jywgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtLmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudScpKTtcbiAgICAgICAgICB9LCBfdGhpcy5vcHRpb25zLmhvdmVyRGVsYXkpKTtcbiAgICAgICAgfVxuICAgICAgfSkub24oJ21vdXNlbGVhdmUuemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpO1xuICAgICAgICBpZiAoaGFzU3ViICYmIF90aGlzLm9wdGlvbnMuYXV0b2Nsb3NlKSB7XG4gICAgICAgICAgaWYgKCRlbGVtLmF0dHIoJ2RhdGEtaXMtY2xpY2snKSA9PT0gJ3RydWUnICYmIF90aGlzLm9wdGlvbnMuY2xpY2tPcGVuKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgICAgICAgY2xlYXJUaW1lb3V0KCRlbGVtLmRhdGEoJ19kZWxheScpKTtcbiAgICAgICAgICAkZWxlbS5kYXRhKCdfZGVsYXknLCBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW0pO1xuICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuY2xvc2luZ1RpbWUpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuJG1lbnVJdGVtcy5vbigna2V5ZG93bi56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKGUudGFyZ2V0KS5wYXJlbnRzVW50aWwoJ3VsJywgJ1tyb2xlPVwibWVudWl0ZW1cIl0nKSxcbiAgICAgICAgICBpc1RhYiA9IF90aGlzLiR0YWJzLmluZGV4KCRlbGVtZW50KSA+IC0xLFxuICAgICAgICAgICRlbGVtZW50cyA9IGlzVGFiID8gX3RoaXMuJHRhYnMgOiAkZWxlbWVudC5zaWJsaW5ncygnbGknKS5hZGQoJGVsZW1lbnQpLFxuICAgICAgICAgICRwcmV2RWxlbWVudCxcbiAgICAgICAgICAkbmV4dEVsZW1lbnQ7XG5cbiAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgaWYgKCQodGhpcykuaXMoJGVsZW1lbnQpKSB7XG4gICAgICAgICAgJHByZXZFbGVtZW50ID0gJGVsZW1lbnRzLmVxKGktMSk7XG4gICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKGkrMSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdmFyIG5leHRTaWJsaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghJGVsZW1lbnQuaXMoJzpsYXN0LWNoaWxkJykpIHtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQuY2hpbGRyZW4oJ2E6Zmlyc3QnKS5mb2N1cygpO1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfSwgcHJldlNpYmxpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJHByZXZFbGVtZW50LmNoaWxkcmVuKCdhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSwgb3BlblN1YiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJHN1YiA9ICRlbGVtZW50LmNoaWxkcmVuKCd1bC5pcy1kcm9wZG93bi1zdWJtZW51Jyk7XG4gICAgICAgIGlmICgkc3ViLmxlbmd0aCkge1xuICAgICAgICAgIF90aGlzLl9zaG93KCRzdWIpO1xuICAgICAgICAgICRlbGVtZW50LmZpbmQoJ2xpID4gYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2UgeyByZXR1cm47IH1cbiAgICAgIH0sIGNsb3NlU3ViID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vaWYgKCRlbGVtZW50LmlzKCc6Zmlyc3QtY2hpbGQnKSkge1xuICAgICAgICB2YXIgY2xvc2UgPSAkZWxlbWVudC5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpO1xuICAgICAgICBjbG9zZS5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgIF90aGlzLl9oaWRlKGNsb3NlKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvL31cbiAgICAgIH07XG4gICAgICB2YXIgZnVuY3Rpb25zID0ge1xuICAgICAgICBvcGVuOiBvcGVuU3ViLFxuICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMuX2hpZGUoX3RoaXMuJGVsZW1lbnQpO1xuICAgICAgICAgIF90aGlzLiRtZW51SXRlbXMuZmluZCgnYTpmaXJzdCcpLmZvY3VzKCk7IC8vIGZvY3VzIHRvIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChpc1RhYikge1xuICAgICAgICBpZiAoX3RoaXMuX2lzVmVydGljYWwoKSkgeyAvLyB2ZXJ0aWNhbCBtZW51XG4gICAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIHsgLy8gcmlnaHQgYWxpZ25lZFxuICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICB1cDogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgIG5leHQ6IGNsb3NlU3ViLFxuICAgICAgICAgICAgICBwcmV2aW91czogb3BlblN1YlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHsgLy8gbGVmdCBhbGlnbmVkXG4gICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgIHVwOiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgbmV4dDogb3BlblN1YixcbiAgICAgICAgICAgICAgcHJldmlvdXM6IGNsb3NlU3ViXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IC8vIGhvcml6b250YWwgbWVudVxuICAgICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSB7IC8vIHJpZ2h0IGFsaWduZWRcbiAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICBuZXh0OiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgcHJldmlvdXM6IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICBkb3duOiBvcGVuU3ViLFxuICAgICAgICAgICAgICB1cDogY2xvc2VTdWJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7IC8vIGxlZnQgYWxpZ25lZFxuICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgIG5leHQ6IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICBwcmV2aW91czogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgIGRvd246IG9wZW5TdWIsXG4gICAgICAgICAgICAgIHVwOiBjbG9zZVN1YlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAvLyBub3QgdGFicyAtPiBvbmUgc3ViXG4gICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSB7IC8vIHJpZ2h0IGFsaWduZWRcbiAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgIG5leHQ6IGNsb3NlU3ViLFxuICAgICAgICAgICAgcHJldmlvdXM6IG9wZW5TdWIsXG4gICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgIHVwOiBwcmV2U2libGluZ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgeyAvLyBsZWZ0IGFsaWduZWRcbiAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgIG5leHQ6IG9wZW5TdWIsXG4gICAgICAgICAgICBwcmV2aW91czogY2xvc2VTdWIsXG4gICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgIHVwOiBwcmV2U2libGluZ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnRHJvcGRvd25NZW51JywgZnVuY3Rpb25zKTtcblxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gZXZlbnQgaGFuZGxlciB0byB0aGUgYm9keSB0byBjbG9zZSBhbnkgZHJvcGRvd25zIG9uIGEgY2xpY2suXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2FkZEJvZHlIYW5kbGVyKCkge1xuICAgIHZhciAkYm9keSA9ICQoZG9jdW1lbnQuYm9keSksXG4gICAgICAgIF90aGlzID0gdGhpcztcbiAgICAkYm9keS5vZmYoJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScpXG4gICAgICAgICAub24oJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgdmFyICRsaW5rID0gX3RoaXMuJGVsZW1lbnQuZmluZChlLnRhcmdldCk7XG4gICAgICAgICAgIGlmICgkbGluay5sZW5ndGgpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICAgX3RoaXMuX2hpZGUoKTtcbiAgICAgICAgICAgJGJvZHkub2ZmKCdtb3VzZXVwLnpmLmRyb3Bkb3dubWVudSB0b3VjaGVuZC56Zi5kcm9wZG93bm1lbnUnKTtcbiAgICAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIGEgZHJvcGRvd24gcGFuZSwgYW5kIGNoZWNrcyBmb3IgY29sbGlzaW9ucyBmaXJzdC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICRzdWIgLSB1bCBlbGVtZW50IHRoYXQgaXMgYSBzdWJtZW51IHRvIHNob3dcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBmaXJlcyBEcm9wZG93bk1lbnUjc2hvd1xuICAgKi9cbiAgX3Nob3coJHN1Yikge1xuICAgIHZhciBpZHggPSB0aGlzLiR0YWJzLmluZGV4KHRoaXMuJHRhYnMuZmlsdGVyKGZ1bmN0aW9uKGksIGVsKSB7XG4gICAgICByZXR1cm4gJChlbCkuZmluZCgkc3ViKS5sZW5ndGggPiAwO1xuICAgIH0pKTtcbiAgICB2YXIgJHNpYnMgPSAkc3ViLnBhcmVudCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5zaWJsaW5ncygnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICB0aGlzLl9oaWRlKCRzaWJzLCBpZHgpO1xuICAgICRzdWIuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpLmFkZENsYXNzKCdqcy1kcm9wZG93bi1hY3RpdmUnKVxuICAgICAgICAucGFyZW50KCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICB2YXIgY2xlYXIgPSBGb3VuZGF0aW9uLkJveC5JbU5vdFRvdWNoaW5nWW91KCRzdWIsIG51bGwsIHRydWUpO1xuICAgIGlmICghY2xlYXIpIHtcbiAgICAgIHZhciBvbGRDbGFzcyA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdsZWZ0JyA/ICctcmlnaHQnIDogJy1sZWZ0JyxcbiAgICAgICAgICAkcGFyZW50TGkgPSAkc3ViLnBhcmVudCgnLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50Jyk7XG4gICAgICAkcGFyZW50TGkucmVtb3ZlQ2xhc3MoYG9wZW5zJHtvbGRDbGFzc31gKS5hZGRDbGFzcyhgb3BlbnMtJHt0aGlzLm9wdGlvbnMuYWxpZ25tZW50fWApO1xuICAgICAgY2xlYXIgPSBGb3VuZGF0aW9uLkJveC5JbU5vdFRvdWNoaW5nWW91KCRzdWIsIG51bGwsIHRydWUpO1xuICAgICAgaWYgKCFjbGVhcikge1xuICAgICAgICAkcGFyZW50TGkucmVtb3ZlQ2xhc3MoYG9wZW5zLSR7dGhpcy5vcHRpb25zLmFsaWdubWVudH1gKS5hZGRDbGFzcygnb3BlbnMtaW5uZXInKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgICRzdWIuY3NzKCd2aXNpYmlsaXR5JywgJycpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKSB7IHRoaXMuX2FkZEJvZHlIYW5kbGVyKCk7IH1cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBuZXcgZHJvcGRvd24gcGFuZSBpcyB2aXNpYmxlLlxuICAgICAqIEBldmVudCBEcm9wZG93bk1lbnUjc2hvd1xuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2hvdy56Zi5kcm9wZG93bm1lbnUnLCBbJHN1Yl0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGVzIGEgc2luZ2xlLCBjdXJyZW50bHkgb3BlbiBkcm9wZG93biBwYW5lLCBpZiBwYXNzZWQgYSBwYXJhbWV0ZXIsIG90aGVyd2lzZSwgaGlkZXMgZXZlcnl0aGluZy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIGVsZW1lbnQgd2l0aCBhIHN1Ym1lbnUgdG8gaGlkZVxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gaW5kZXggb2YgdGhlICR0YWJzIGNvbGxlY3Rpb24gdG8gaGlkZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2hpZGUoJGVsZW0sIGlkeCkge1xuICAgIHZhciAkdG9DbG9zZTtcbiAgICBpZiAoJGVsZW0gJiYgJGVsZW0ubGVuZ3RoKSB7XG4gICAgICAkdG9DbG9zZSA9ICRlbGVtO1xuICAgIH0gZWxzZSBpZiAoaWR4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICR0b0Nsb3NlID0gdGhpcy4kdGFicy5ub3QoZnVuY3Rpb24oaSwgZWwpIHtcbiAgICAgICAgcmV0dXJuIGkgPT09IGlkeDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICR0b0Nsb3NlID0gdGhpcy4kZWxlbWVudDtcbiAgICB9XG4gICAgdmFyIHNvbWV0aGluZ1RvQ2xvc2UgPSAkdG9DbG9zZS5oYXNDbGFzcygnaXMtYWN0aXZlJykgfHwgJHRvQ2xvc2UuZmluZCgnLmlzLWFjdGl2ZScpLmxlbmd0aCA+IDA7XG5cbiAgICBpZiAoc29tZXRoaW5nVG9DbG9zZSkge1xuICAgICAgJHRvQ2xvc2UuZmluZCgnbGkuaXMtYWN0aXZlJykuYWRkKCR0b0Nsb3NlKS5hdHRyKHtcbiAgICAgICAgJ2RhdGEtaXMtY2xpY2snOiBmYWxzZVxuICAgICAgfSkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgICAkdG9DbG9zZS5maW5kKCd1bC5qcy1kcm9wZG93bi1hY3RpdmUnKS5yZW1vdmVDbGFzcygnanMtZHJvcGRvd24tYWN0aXZlJyk7XG5cbiAgICAgIGlmICh0aGlzLmNoYW5nZWQgfHwgJHRvQ2xvc2UuZmluZCgnb3BlbnMtaW5uZXInKS5sZW5ndGgpIHtcbiAgICAgICAgdmFyIG9sZENsYXNzID0gdGhpcy5vcHRpb25zLmFsaWdubWVudCA9PT0gJ2xlZnQnID8gJ3JpZ2h0JyA6ICdsZWZ0JztcbiAgICAgICAgJHRvQ2xvc2UuZmluZCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5hZGQoJHRvQ2xvc2UpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKGBvcGVucy1pbm5lciBvcGVucy0ke3RoaXMub3B0aW9ucy5hbGlnbm1lbnR9YClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoYG9wZW5zLSR7b2xkQ2xhc3N9YCk7XG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBGaXJlcyB3aGVuIHRoZSBvcGVuIG1lbnVzIGFyZSBjbG9zZWQuXG4gICAgICAgKiBAZXZlbnQgRHJvcGRvd25NZW51I2hpZGVcbiAgICAgICAqL1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdoaWRlLnpmLmRyb3Bkb3dubWVudScsIFskdG9DbG9zZV0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgcGx1Z2luLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kbWVudUl0ZW1zLm9mZignLnpmLmRyb3Bkb3dubWVudScpLnJlbW92ZUF0dHIoJ2RhdGEtaXMtY2xpY2snKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2lzLXJpZ2h0LWFycm93IGlzLWxlZnQtYXJyb3cgaXMtZG93bi1hcnJvdyBvcGVucy1yaWdodCBvcGVucy1sZWZ0IG9wZW5zLWlubmVyJyk7XG4gICAgJChkb2N1bWVudC5ib2R5KS5vZmYoJy56Zi5kcm9wZG93bm1lbnUnKTtcbiAgICBGb3VuZGF0aW9uLk5lc3QuQnVybih0aGlzLiRlbGVtZW50LCAnZHJvcGRvd24nKTtcbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cbiAqL1xuRHJvcGRvd25NZW51LmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogRGlzYWxsb3dzIGhvdmVyIGV2ZW50cyBmcm9tIG9wZW5pbmcgc3VibWVudXNcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRpc2FibGVIb3ZlcjogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvdyBhIHN1Ym1lbnUgdG8gYXV0b21hdGljYWxseSBjbG9zZSBvbiBhIG1vdXNlbGVhdmUgZXZlbnQsIGlmIG5vdCBjbGlja2VkIG9wZW4uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGF1dG9jbG9zZTogdHJ1ZSxcbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIHRvIGRlbGF5IG9wZW5pbmcgYSBzdWJtZW51IG9uIGhvdmVyIGV2ZW50LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDUwXG4gICAqL1xuICBob3ZlckRlbGF5OiA1MCxcbiAgLyoqXG4gICAqIEFsbG93IGEgc3VibWVudSB0byBvcGVuL3JlbWFpbiBvcGVuIG9uIHBhcmVudCBjbGljayBldmVudC4gQWxsb3dzIGN1cnNvciB0byBtb3ZlIGF3YXkgZnJvbSBtZW51LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgY2xpY2tPcGVuOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIHRvIGRlbGF5IGNsb3NpbmcgYSBzdWJtZW51IG9uIGEgbW91c2VsZWF2ZSBldmVudC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCA1MDBcbiAgICovXG5cbiAgY2xvc2luZ1RpbWU6IDUwMCxcbiAgLyoqXG4gICAqIFBvc2l0aW9uIG9mIHRoZSBtZW51IHJlbGF0aXZlIHRvIHdoYXQgZGlyZWN0aW9uIHRoZSBzdWJtZW51cyBzaG91bGQgb3Blbi4gSGFuZGxlZCBieSBKUy4gQ2FuIGJlIGAnbGVmdCdgIG9yIGAncmlnaHQnYC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAnbGVmdCdcbiAgICovXG4gIGFsaWdubWVudDogJ2xlZnQnLFxuICAvKipcbiAgICogQWxsb3cgY2xpY2tzIG9uIHRoZSBib2R5IHRvIGNsb3NlIGFueSBvcGVuIHN1Ym1lbnVzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2s6IHRydWUsXG4gIC8qKlxuICAgKiBBbGxvdyBjbGlja3Mgb24gbGVhZiBhbmNob3IgbGlua3MgdG8gY2xvc2UgYW55IG9wZW4gc3VibWVudXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNsb3NlT25DbGlja0luc2lkZTogdHJ1ZSxcbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdmVydGljYWwgb3JpZW50ZWQgbWVudXMsIEZvdW5kYXRpb24gZGVmYXVsdCBpcyBgdmVydGljYWxgLiBVcGRhdGUgdGhpcyBpZiB1c2luZyB5b3VyIG93biBjbGFzcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAndmVydGljYWwnXG4gICAqL1xuICB2ZXJ0aWNhbENsYXNzOiAndmVydGljYWwnLFxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byByaWdodC1zaWRlIG9yaWVudGVkIG1lbnVzLCBGb3VuZGF0aW9uIGRlZmF1bHQgaXMgYGFsaWduLXJpZ2h0YC4gVXBkYXRlIHRoaXMgaWYgdXNpbmcgeW91ciBvd24gY2xhc3MuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ2FsaWduLXJpZ2h0J1xuICAgKi9cbiAgcmlnaHRDbGFzczogJ2FsaWduLXJpZ2h0JyxcbiAgLyoqXG4gICAqIEJvb2xlYW4gdG8gZm9yY2Ugb3ZlcmlkZSB0aGUgY2xpY2tpbmcgb2YgbGlua3MgdG8gcGVyZm9ybSBkZWZhdWx0IGFjdGlvbiwgb24gc2Vjb25kIHRvdWNoIGV2ZW50IGZvciBtb2JpbGUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGZvcmNlRm9sbG93OiB0cnVlXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oRHJvcGRvd25NZW51LCAnRHJvcGRvd25NZW51Jyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBPZmZDYW52YXMgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLm9mZmNhbnZhc1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICovXG5cbmNsYXNzIE9mZkNhbnZhcyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGFuIG9mZi1jYW52YXMgd3JhcHBlci5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjaW5pdFxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gaW5pdGlhbGl6ZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBPZmZDYW52YXMuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcbiAgICB0aGlzLiRsYXN0VHJpZ2dlciA9ICQoKTtcbiAgICB0aGlzLiR0cmlnZ2VycyA9ICQoKTtcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ09mZkNhbnZhcycpXG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignT2ZmQ2FudmFzJywge1xuICAgICAgJ0VTQ0FQRSc6ICdjbG9zZSdcbiAgICB9KTtcblxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBvZmYtY2FudmFzIHdyYXBwZXIgYnkgYWRkaW5nIHRoZSBleGl0IG92ZXJsYXkgKGlmIG5lZWRlZCkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIGlkID0gdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKGBpcy10cmFuc2l0aW9uLSR7dGhpcy5vcHRpb25zLnRyYW5zaXRpb259YCk7XG5cbiAgICAvLyBGaW5kIHRyaWdnZXJzIHRoYXQgYWZmZWN0IHRoaXMgZWxlbWVudCBhbmQgYWRkIGFyaWEtZXhwYW5kZWQgdG8gdGhlbVxuICAgIHRoaXMuJHRyaWdnZXJzID0gJChkb2N1bWVudClcbiAgICAgIC5maW5kKCdbZGF0YS1vcGVuPVwiJytpZCsnXCJdLCBbZGF0YS1jbG9zZT1cIicraWQrJ1wiXSwgW2RhdGEtdG9nZ2xlPVwiJytpZCsnXCJdJylcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJylcbiAgICAgIC5hdHRyKCdhcmlhLWNvbnRyb2xzJywgaWQpO1xuXG4gICAgLy8gQWRkIGFuIG92ZXJsYXkgb3ZlciB0aGUgY29udGVudCBpZiBuZWNlc3NhcnlcbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdmFyIG92ZXJsYXlQb3NpdGlvbiA9ICQodGhpcy4kZWxlbWVudCkuY3NzKFwicG9zaXRpb25cIikgPT09ICdmaXhlZCcgPyAnaXMtb3ZlcmxheS1maXhlZCcgOiAnaXMtb3ZlcmxheS1hYnNvbHV0ZSc7XG4gICAgICBvdmVybGF5LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnanMtb2ZmLWNhbnZhcy1vdmVybGF5ICcgKyBvdmVybGF5UG9zaXRpb24pO1xuICAgICAgdGhpcy4kb3ZlcmxheSA9ICQob3ZlcmxheSk7XG4gICAgICBpZihvdmVybGF5UG9zaXRpb24gPT09ICdpcy1vdmVybGF5LWZpeGVkJykge1xuICAgICAgICAkKCdib2R5JykuYXBwZW5kKHRoaXMuJG92ZXJsYXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLmFwcGVuZCh0aGlzLiRvdmVybGF5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCA9IHRoaXMub3B0aW9ucy5pc1JldmVhbGVkIHx8IG5ldyBSZWdFeHAodGhpcy5vcHRpb25zLnJldmVhbENsYXNzLCAnZycpLnRlc3QodGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5pc1JldmVhbGVkID09PSB0cnVlKSB7XG4gICAgICB0aGlzLm9wdGlvbnMucmV2ZWFsT24gPSB0aGlzLm9wdGlvbnMucmV2ZWFsT24gfHwgdGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUubWF0Y2goLyhyZXZlYWwtZm9yLW1lZGl1bXxyZXZlYWwtZm9yLWxhcmdlKS9nKVswXS5zcGxpdCgnLScpWzJdO1xuICAgICAgdGhpcy5fc2V0TVFDaGVja2VyKCk7XG4gICAgfVxuICAgIGlmICghdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lID09PSB0cnVlKSB7XG4gICAgICB0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUgPSBwYXJzZUZsb2F0KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKCQoJ1tkYXRhLW9mZi1jYW52YXNdJylbMF0pLnRyYW5zaXRpb25EdXJhdGlvbikgKiAxMDAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBvZmYtY2FudmFzIHdyYXBwZXIgYW5kIHRoZSBleGl0IG92ZXJsYXkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpLm9uKHtcbiAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICAgICdjbG9zZS56Zi50cmlnZ2VyJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpLFxuICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKSxcbiAgICAgICdrZXlkb3duLnpmLm9mZmNhbnZhcyc6IHRoaXMuX2hhbmRsZUtleWJvYXJkLmJpbmQodGhpcylcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlKSB7XG4gICAgICB2YXIgJHRhcmdldCA9IHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA/IHRoaXMuJG92ZXJsYXkgOiAkKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJyk7XG4gICAgICAkdGFyZ2V0Lm9uKHsnY2xpY2suemYub2ZmY2FudmFzJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgZXZlbnQgbGlzdGVuZXIgZm9yIGVsZW1lbnRzIHRoYXQgd2lsbCByZXZlYWwgYXQgY2VydGFpbiBicmVha3BvaW50cy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRNUUNoZWNrZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoX3RoaXMub3B0aW9ucy5yZXZlYWxPbikpIHtcbiAgICAgICAgX3RoaXMucmV2ZWFsKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3RoaXMucmV2ZWFsKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KS5vbmUoJ2xvYWQuemYub2ZmY2FudmFzJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoX3RoaXMub3B0aW9ucy5yZXZlYWxPbikpIHtcbiAgICAgICAgX3RoaXMucmV2ZWFsKHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIHJldmVhbGluZy9oaWRpbmcgdGhlIG9mZi1jYW52YXMgYXQgYnJlYWtwb2ludHMsIG5vdCB0aGUgc2FtZSBhcyBvcGVuLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzUmV2ZWFsZWQgLSB0cnVlIGlmIGVsZW1lbnQgc2hvdWxkIGJlIHJldmVhbGVkLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHJldmVhbChpc1JldmVhbGVkKSB7XG4gICAgdmFyICRjbG9zZXIgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWNsb3NlXScpO1xuICAgIGlmIChpc1JldmVhbGVkKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB0aGlzLmlzUmV2ZWFsZWQgPSB0cnVlO1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ29wZW4uemYudHJpZ2dlciB0b2dnbGUuemYudHJpZ2dlcicpO1xuICAgICAgaWYgKCRjbG9zZXIubGVuZ3RoKSB7ICRjbG9zZXIuaGlkZSgpOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaXNSZXZlYWxlZCA9IGZhbHNlO1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKHtcbiAgICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpXG4gICAgICB9KTtcbiAgICAgIGlmICgkY2xvc2VyLmxlbmd0aCkge1xuICAgICAgICAkY2xvc2VyLnNob3coKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgc2Nyb2xsaW5nIG9mIHRoZSBib2R5IHdoZW4gb2ZmY2FudmFzIGlzIG9wZW4gb24gbW9iaWxlIFNhZmFyaSBhbmQgb3RoZXIgdHJvdWJsZXNvbWUgYnJvd3NlcnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc3RvcFNjcm9sbGluZyhldmVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRha2VuIGFuZCBhZGFwdGVkIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjg4OTQ0Ny9wcmV2ZW50LWZ1bGwtcGFnZS1zY3JvbGxpbmctaW9zXG4gIC8vIE9ubHkgcmVhbGx5IHdvcmtzIGZvciB5LCBub3Qgc3VyZSBob3cgdG8gZXh0ZW5kIHRvIHggb3IgaWYgd2UgbmVlZCB0by5cbiAgX3JlY29yZFNjcm9sbGFibGUoZXZlbnQpIHtcbiAgICBsZXQgZWxlbSA9IHRoaXM7IC8vIGNhbGxlZCBmcm9tIGV2ZW50IGhhbmRsZXIgY29udGV4dCB3aXRoIHRoaXMgYXMgZWxlbVxuXG4gICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIHNjcm9sbGFibGUgKGNvbnRlbnQgb3ZlcmZsb3dzKSwgdGhlbi4uLlxuICAgIGlmIChlbGVtLnNjcm9sbEhlaWdodCAhPT0gZWxlbS5jbGllbnRIZWlnaHQpIHtcbiAgICAgIC8vIElmIHdlJ3JlIGF0IHRoZSB0b3AsIHNjcm9sbCBkb3duIG9uZSBwaXhlbCB0byBhbGxvdyBzY3JvbGxpbmcgdXBcbiAgICAgIGlmIChlbGVtLnNjcm9sbFRvcCA9PT0gMCkge1xuICAgICAgICBlbGVtLnNjcm9sbFRvcCA9IDE7XG4gICAgICB9XG4gICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgYm90dG9tLCBzY3JvbGwgdXAgb25lIHBpeGVsIHRvIGFsbG93IHNjcm9sbGluZyBkb3duXG4gICAgICBpZiAoZWxlbS5zY3JvbGxUb3AgPT09IGVsZW0uc2Nyb2xsSGVpZ2h0IC0gZWxlbS5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgZWxlbS5zY3JvbGxUb3AgPSBlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0IC0gMTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxlbS5hbGxvd1VwID0gZWxlbS5zY3JvbGxUb3AgPiAwO1xuICAgIGVsZW0uYWxsb3dEb3duID0gZWxlbS5zY3JvbGxUb3AgPCAoZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodCk7XG4gICAgZWxlbS5sYXN0WSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQucGFnZVk7XG4gIH1cblxuICBfc3RvcFNjcm9sbFByb3BhZ2F0aW9uKGV2ZW50KSB7XG4gICAgbGV0IGVsZW0gPSB0aGlzOyAvLyBjYWxsZWQgZnJvbSBldmVudCBoYW5kbGVyIGNvbnRleHQgd2l0aCB0aGlzIGFzIGVsZW1cbiAgICBsZXQgdXAgPSBldmVudC5wYWdlWSA8IGVsZW0ubGFzdFk7XG4gICAgbGV0IGRvd24gPSAhdXA7XG4gICAgZWxlbS5sYXN0WSA9IGV2ZW50LnBhZ2VZO1xuXG4gICAgaWYoKHVwICYmIGVsZW0uYWxsb3dVcCkgfHwgKGRvd24gJiYgZWxlbS5hbGxvd0Rvd24pKSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjb3BlbmVkXG4gICAqL1xuICBvcGVuKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICB0aGlzLiRsYXN0VHJpZ2dlciA9IHRyaWdnZXI7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvID09PSAndG9wJykge1xuICAgICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG8gPT09ICdib3R0b20nKSB7XG4gICAgICB3aW5kb3cuc2Nyb2xsVG8oMCxkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW5zLlxuICAgICAqIEBldmVudCBPZmZDYW52YXMjb3BlbmVkXG4gICAgICovXG4gICAgX3RoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2lzLW9wZW4nKVxuXG4gICAgdGhpcy4kdHJpZ2dlcnMuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpXG4gICAgICAgIC50cmlnZ2VyKCdvcGVuZWQuemYub2ZmY2FudmFzJyk7XG5cbiAgICAvLyBJZiBgY29udGVudFNjcm9sbGAgaXMgc2V0IHRvIGZhbHNlLCBhZGQgY2xhc3MgYW5kIGRpc2FibGUgc2Nyb2xsaW5nIG9uIHRvdWNoIGRldmljZXMuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50U2Nyb2xsID09PSBmYWxzZSkge1xuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdpcy1vZmYtY2FudmFzLW9wZW4nKS5vbigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbGluZyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCd0b3VjaHN0YXJ0JywgdGhpcy5fcmVjb3JkU2Nyb2xsYWJsZSk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkuYWRkQ2xhc3MoJ2lzLXZpc2libGUnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSAmJiB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkuYWRkQ2xhc3MoJ2lzLWNsb3NhYmxlJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvRm9jdXMgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCh0aGlzLiRlbGVtZW50KSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLiRlbGVtZW50LmZpbmQoJ2EsIGJ1dHRvbicpLmVxKDApLmZvY3VzKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLmF0dHIoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnRyYXBGb2N1cyh0aGlzLiRlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSBvZmYtY2FudmFzIG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIG9wdGlvbmFsIGNiIHRvIGZpcmUgYWZ0ZXIgY2xvc3VyZS5cbiAgICogQGZpcmVzIE9mZkNhbnZhcyNjbG9zZWRcbiAgICovXG4gIGNsb3NlKGNiKSB7XG4gICAgaWYgKCF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykgfHwgdGhpcy5pc1JldmVhbGVkKSB7IHJldHVybjsgfVxuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIF90aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxuICAgICAgLyoqXG4gICAgICAgKiBGaXJlcyB3aGVuIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbnMuXG4gICAgICAgKiBAZXZlbnQgT2ZmQ2FudmFzI2Nsb3NlZFxuICAgICAgICovXG4gICAgICAgIC50cmlnZ2VyKCdjbG9zZWQuemYub2ZmY2FudmFzJyk7XG5cbiAgICAvLyBJZiBgY29udGVudFNjcm9sbGAgaXMgc2V0IHRvIGZhbHNlLCByZW1vdmUgY2xhc3MgYW5kIHJlLWVuYWJsZSBzY3JvbGxpbmcgb24gdG91Y2ggZGV2aWNlcy5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRTY3JvbGwgPT09IGZhbHNlKSB7XG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2lzLW9mZi1jYW52YXMtb3BlbicpLm9mZigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbGluZyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZigndG91Y2hzdGFydCcsIHRoaXMuX3JlY29yZFNjcm9sbGFibGUpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxQcm9wYWdhdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5yZW1vdmVDbGFzcygnaXMtdmlzaWJsZScpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlICYmIHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5yZW1vdmVDbGFzcygnaXMtY2xvc2FibGUnKTtcbiAgICB9XG5cbiAgICB0aGlzLiR0cmlnZ2Vycy5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLnJlbW92ZUF0dHIoJ3RhYmluZGV4Jyk7XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlbGVhc2VGb2N1cyh0aGlzLiRlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW4gb3IgY2xvc2VkLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gRXZlbnQgb2JqZWN0IHBhc3NlZCBmcm9tIGxpc3RlbmVyLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gdHJpZ2dlciAtIGVsZW1lbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIG9mZi1jYW52YXMgdG8gb3Blbi5cbiAgICovXG4gIHRvZ2dsZShldmVudCwgdHJpZ2dlcikge1xuICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykpIHtcbiAgICAgIHRoaXMuY2xvc2UoZXZlbnQsIHRyaWdnZXIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMub3BlbihldmVudCwgdHJpZ2dlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMga2V5Ym9hcmQgaW5wdXQgd2hlbiBkZXRlY3RlZC4gV2hlbiB0aGUgZXNjYXBlIGtleSBpcyBwcmVzc2VkLCB0aGUgb2ZmLWNhbnZhcyBtZW51IGNsb3NlcywgYW5kIGZvY3VzIGlzIHJlc3RvcmVkIHRvIHRoZSBlbGVtZW50IHRoYXQgb3BlbmVkIHRoZSBtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9oYW5kbGVLZXlib2FyZChlKSB7XG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ09mZkNhbnZhcycsIHtcbiAgICAgIGNsb3NlOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgdGhpcy4kbGFzdFRyaWdnZXIuZm9jdXMoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgICAgaGFuZGxlZDogKCkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIG9mZmNhbnZhcyBwbHVnaW4uXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi50cmlnZ2VyIC56Zi5vZmZjYW52YXMnKTtcbiAgICB0aGlzLiRvdmVybGF5Lm9mZignLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbk9mZkNhbnZhcy5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFsbG93IHRoZSB1c2VyIHRvIGNsaWNrIG91dHNpZGUgb2YgdGhlIG1lbnUgdG8gY2xvc2UgaXQuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNsb3NlT25DbGljazogdHJ1ZSxcblxuICAvKipcbiAgICogQWRkcyBhbiBvdmVybGF5IG9uIHRvcCBvZiBgW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XWAuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNvbnRlbnRPdmVybGF5OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBFbmFibGUvZGlzYWJsZSBzY3JvbGxpbmcgb2YgdGhlIG1haW4gY29udGVudCB3aGVuIGFuIG9mZiBjYW52YXMgcGFuZWwgaXMgb3Blbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgY29udGVudFNjcm9sbDogdHJ1ZSxcblxuICAvKipcbiAgICogQW1vdW50IG9mIHRpbWUgaW4gbXMgdGhlIG9wZW4gYW5kIGNsb3NlIHRyYW5zaXRpb24gcmVxdWlyZXMuIElmIG5vbmUgc2VsZWN0ZWQsIHB1bGxzIGZyb20gYm9keSBzdHlsZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAwXG4gICAqL1xuICB0cmFuc2l0aW9uVGltZTogMCxcblxuICAvKipcbiAgICogVHlwZSBvZiB0cmFuc2l0aW9uIGZvciB0aGUgb2ZmY2FudmFzIG1lbnUuIE9wdGlvbnMgYXJlICdwdXNoJywgJ2RldGFjaGVkJyBvciAnc2xpZGUnLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0IHB1c2hcbiAgICovXG4gIHRyYW5zaXRpb246ICdwdXNoJyxcblxuICAvKipcbiAgICogRm9yY2UgdGhlIHBhZ2UgdG8gc2Nyb2xsIHRvIHRvcCBvciBib3R0b20gb24gb3Blbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7P3N0cmluZ31cbiAgICogQGRlZmF1bHQgbnVsbFxuICAgKi9cbiAgZm9yY2VUbzogbnVsbCxcblxuICAvKipcbiAgICogQWxsb3cgdGhlIG9mZmNhbnZhcyB0byByZW1haW4gb3BlbiBmb3IgY2VydGFpbiBicmVha3BvaW50cy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGlzUmV2ZWFsZWQ6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBCcmVha3BvaW50IGF0IHdoaWNoIHRvIHJldmVhbC4gSlMgd2lsbCB1c2UgYSBSZWdFeHAgdG8gdGFyZ2V0IHN0YW5kYXJkIGNsYXNzZXMsIGlmIGNoYW5naW5nIGNsYXNzbmFtZXMsIHBhc3MgeW91ciBjbGFzcyB3aXRoIHRoZSBgcmV2ZWFsQ2xhc3NgIG9wdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7P3N0cmluZ31cbiAgICogQGRlZmF1bHQgbnVsbFxuICAgKi9cbiAgcmV2ZWFsT246IG51bGwsXG5cbiAgLyoqXG4gICAqIEZvcmNlIGZvY3VzIHRvIHRoZSBvZmZjYW52YXMgb24gb3Blbi4gSWYgdHJ1ZSwgd2lsbCBmb2N1cyB0aGUgb3BlbmluZyB0cmlnZ2VyIG9uIGNsb3NlLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBhdXRvRm9jdXM6IHRydWUsXG5cbiAgLyoqXG4gICAqIENsYXNzIHVzZWQgdG8gZm9yY2UgYW4gb2ZmY2FudmFzIHRvIHJlbWFpbiBvcGVuLiBGb3VuZGF0aW9uIGRlZmF1bHRzIGZvciB0aGlzIGFyZSBgcmV2ZWFsLWZvci1sYXJnZWAgJiBgcmV2ZWFsLWZvci1tZWRpdW1gLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0IHJldmVhbC1mb3ItXG4gICAqIEB0b2RvIGltcHJvdmUgdGhlIHJlZ2V4IHRlc3RpbmcgZm9yIHRoaXMuXG4gICAqL1xuICByZXZlYWxDbGFzczogJ3JldmVhbC1mb3ItJyxcblxuICAvKipcbiAgICogVHJpZ2dlcnMgb3B0aW9uYWwgZm9jdXMgdHJhcHBpbmcgd2hlbiBvcGVuaW5nIGFuIG9mZmNhbnZhcy4gU2V0cyB0YWJpbmRleCBvZiBbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdIHRvIC0xIGZvciBhY2Nlc3NpYmlsaXR5IHB1cnBvc2VzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgdHJhcEZvY3VzOiBmYWxzZVxufVxuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oT2ZmQ2FudmFzLCAnT2ZmQ2FudmFzJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBSZXNwb25zaXZlTWVudSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ucmVzcG9uc2l2ZU1lbnVcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICovXG5cbmNsYXNzIFJlc3BvbnNpdmVNZW51IHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSByZXNwb25zaXZlIG1lbnUuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgUmVzcG9uc2l2ZU1lbnUjaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgZHJvcGRvd24gbWVudS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgIHRoaXMucnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ3Jlc3BvbnNpdmUtbWVudScpO1xuICAgIHRoaXMuY3VycmVudE1xID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRQbHVnaW4gPSBudWxsO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnUmVzcG9uc2l2ZU1lbnUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgTWVudSBieSBwYXJzaW5nIHRoZSBjbGFzc2VzIGZyb20gdGhlICdkYXRhLVJlc3BvbnNpdmVNZW51JyBhdHRyaWJ1dGUgb24gdGhlIGVsZW1lbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgLy8gVGhlIGZpcnN0IHRpbWUgYW4gSW50ZXJjaGFuZ2UgcGx1Z2luIGlzIGluaXRpYWxpemVkLCB0aGlzLnJ1bGVzIGlzIGNvbnZlcnRlZCBmcm9tIGEgc3RyaW5nIG9mIFwiY2xhc3Nlc1wiIHRvIGFuIG9iamVjdCBvZiBydWxlc1xuICAgIGlmICh0eXBlb2YgdGhpcy5ydWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGxldCBydWxlc1RyZWUgPSB7fTtcblxuICAgICAgLy8gUGFyc2UgcnVsZXMgZnJvbSBcImNsYXNzZXNcIiBwdWxsZWQgZnJvbSBkYXRhIGF0dHJpYnV0ZVxuICAgICAgbGV0IHJ1bGVzID0gdGhpcy5ydWxlcy5zcGxpdCgnICcpO1xuXG4gICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZXZlcnkgcnVsZSBmb3VuZFxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcnVsZSA9IHJ1bGVzW2ldLnNwbGl0KCctJyk7XG4gICAgICAgIGxldCBydWxlU2l6ZSA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMF0gOiAnc21hbGwnO1xuICAgICAgICBsZXQgcnVsZVBsdWdpbiA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMV0gOiBydWxlWzBdO1xuXG4gICAgICAgIGlmIChNZW51UGx1Z2luc1tydWxlUGx1Z2luXSAhPT0gbnVsbCkge1xuICAgICAgICAgIHJ1bGVzVHJlZVtydWxlU2l6ZV0gPSBNZW51UGx1Z2luc1tydWxlUGx1Z2luXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnJ1bGVzID0gcnVsZXNUcmVlO1xuICAgIH1cblxuICAgIGlmICghJC5pc0VtcHR5T2JqZWN0KHRoaXMucnVsZXMpKSB7XG4gICAgICB0aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgIH1cbiAgICAvLyBBZGQgZGF0YS1tdXRhdGUgc2luY2UgY2hpbGRyZW4gbWF5IG5lZWQgaXQuXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLW11dGF0ZScsICh0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGEtbXV0YXRlJykgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAncmVzcG9uc2l2ZS1tZW51JykpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIHRoZSBNZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5fY2hlY2tNZWRpYVF1ZXJpZXMoKTtcbiAgICB9KTtcbiAgICAvLyAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5SZXNwb25zaXZlTWVudScsIGZ1bmN0aW9uKCkge1xuICAgIC8vICAgX3RoaXMuX2NoZWNrTWVkaWFRdWVyaWVzKCk7XG4gICAgLy8gfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBjdXJyZW50IHNjcmVlbiB3aWR0aCBhZ2FpbnN0IGF2YWlsYWJsZSBtZWRpYSBxdWVyaWVzLiBJZiB0aGUgbWVkaWEgcXVlcnkgaGFzIGNoYW5nZWQsIGFuZCB0aGUgcGx1Z2luIG5lZWRlZCBoYXMgY2hhbmdlZCwgdGhlIHBsdWdpbnMgd2lsbCBzd2FwIG91dC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfY2hlY2tNZWRpYVF1ZXJpZXMoKSB7XG4gICAgdmFyIG1hdGNoZWRNcSwgX3RoaXMgPSB0aGlzO1xuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHJ1bGUgYW5kIGZpbmQgdGhlIGxhc3QgbWF0Y2hpbmcgcnVsZVxuICAgICQuZWFjaCh0aGlzLnJ1bGVzLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChrZXkpKSB7XG4gICAgICAgIG1hdGNoZWRNcSA9IGtleTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE5vIG1hdGNoPyBObyBkaWNlXG4gICAgaWYgKCFtYXRjaGVkTXEpIHJldHVybjtcblxuICAgIC8vIFBsdWdpbiBhbHJlYWR5IGluaXRpYWxpemVkPyBXZSBnb29kXG4gICAgaWYgKHRoaXMuY3VycmVudFBsdWdpbiBpbnN0YW5jZW9mIHRoaXMucnVsZXNbbWF0Y2hlZE1xXS5wbHVnaW4pIHJldHVybjtcblxuICAgIC8vIFJlbW92ZSBleGlzdGluZyBwbHVnaW4tc3BlY2lmaWMgQ1NTIGNsYXNzZXNcbiAgICAkLmVhY2goTWVudVBsdWdpbnMsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIF90aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHZhbHVlLmNzc0NsYXNzKTtcbiAgICB9KTtcblxuICAgIC8vIEFkZCB0aGUgQ1NTIGNsYXNzIGZvciB0aGUgbmV3IHBsdWdpblxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5ydWxlc1ttYXRjaGVkTXFdLmNzc0NsYXNzKTtcblxuICAgIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgbmV3IHBsdWdpblxuICAgIGlmICh0aGlzLmN1cnJlbnRQbHVnaW4pIHRoaXMuY3VycmVudFBsdWdpbi5kZXN0cm95KCk7XG4gICAgdGhpcy5jdXJyZW50UGx1Z2luID0gbmV3IHRoaXMucnVsZXNbbWF0Y2hlZE1xXS5wbHVnaW4odGhpcy4kZWxlbWVudCwge30pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBpbnN0YW5jZSBvZiB0aGUgY3VycmVudCBwbHVnaW4gb24gdGhpcyBlbGVtZW50LCBhcyB3ZWxsIGFzIHRoZSB3aW5kb3cgcmVzaXplIGhhbmRsZXIgdGhhdCBzd2l0Y2hlcyB0aGUgcGx1Z2lucyBvdXQuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmN1cnJlbnRQbHVnaW4uZGVzdHJveSgpO1xuICAgICQod2luZG93KS5vZmYoJy56Zi5SZXNwb25zaXZlTWVudScpO1xuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5SZXNwb25zaXZlTWVudS5kZWZhdWx0cyA9IHt9O1xuXG4vLyBUaGUgcGx1Z2luIG1hdGNoZXMgdGhlIHBsdWdpbiBjbGFzc2VzIHdpdGggdGhlc2UgcGx1Z2luIGluc3RhbmNlcy5cbnZhciBNZW51UGx1Z2lucyA9IHtcbiAgZHJvcGRvd246IHtcbiAgICBjc3NDbGFzczogJ2Ryb3Bkb3duJyxcbiAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2Ryb3Bkb3duLW1lbnUnXSB8fCBudWxsXG4gIH0sXG4gZHJpbGxkb3duOiB7XG4gICAgY3NzQ2xhc3M6ICdkcmlsbGRvd24nLFxuICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snZHJpbGxkb3duJ10gfHwgbnVsbFxuICB9LFxuICBhY2NvcmRpb246IHtcbiAgICBjc3NDbGFzczogJ2FjY29yZGlvbi1tZW51JyxcbiAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2FjY29yZGlvbi1tZW51J10gfHwgbnVsbFxuICB9XG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oUmVzcG9uc2l2ZU1lbnUsICdSZXNwb25zaXZlTWVudScpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbkZvdW5kYXRpb24uQm94ID0ge1xuICBJbU5vdFRvdWNoaW5nWW91OiBJbU5vdFRvdWNoaW5nWW91LFxuICBHZXREaW1lbnNpb25zOiBHZXREaW1lbnNpb25zLFxuICBHZXRPZmZzZXRzOiBHZXRPZmZzZXRzXG59XG5cbi8qKlxuICogQ29tcGFyZXMgdGhlIGRpbWVuc2lvbnMgb2YgYW4gZWxlbWVudCB0byBhIGNvbnRhaW5lciBhbmQgZGV0ZXJtaW5lcyBjb2xsaXNpb24gZXZlbnRzIHdpdGggY29udGFpbmVyLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gdGVzdCBmb3IgY29sbGlzaW9ucy5cbiAqIEBwYXJhbSB7alF1ZXJ5fSBwYXJlbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHVzZSBhcyBib3VuZGluZyBjb250YWluZXIuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGxyT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIGxlZnQgYW5kIHJpZ2h0IHZhbHVlcyBvbmx5LlxuICogQHBhcmFtIHtCb29sZWFufSB0Yk9ubHkgLSBzZXQgdG8gdHJ1ZSB0byBjaGVjayB0b3AgYW5kIGJvdHRvbSB2YWx1ZXMgb25seS5cbiAqIEBkZWZhdWx0IGlmIG5vIHBhcmVudCBvYmplY3QgcGFzc2VkLCBkZXRlY3RzIGNvbGxpc2lvbnMgd2l0aCBgd2luZG93YC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSAtIHRydWUgaWYgY29sbGlzaW9uIGZyZWUsIGZhbHNlIGlmIGEgY29sbGlzaW9uIGluIGFueSBkaXJlY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIEltTm90VG91Y2hpbmdZb3UoZWxlbWVudCwgcGFyZW50LCBsck9ubHksIHRiT25seSkge1xuICB2YXIgZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICB0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHQ7XG5cbiAgaWYgKHBhcmVudCkge1xuICAgIHZhciBwYXJEaW1zID0gR2V0RGltZW5zaW9ucyhwYXJlbnQpO1xuXG4gICAgYm90dG9tID0gKGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0IDw9IHBhckRpbXMuaGVpZ2h0ICsgcGFyRGltcy5vZmZzZXQudG9wKTtcbiAgICB0b3AgICAgPSAoZWxlRGltcy5vZmZzZXQudG9wID49IHBhckRpbXMub2Zmc2V0LnRvcCk7XG4gICAgbGVmdCAgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgPj0gcGFyRGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IHBhckRpbXMud2lkdGggKyBwYXJEaW1zLm9mZnNldC5sZWZ0KTtcbiAgfVxuICBlbHNlIHtcbiAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCArIGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wKTtcbiAgICB0b3AgICAgPSAoZWxlRGltcy5vZmZzZXQudG9wID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wKTtcbiAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQpO1xuICAgIHJpZ2h0ICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBlbGVEaW1zLndpbmRvd0RpbXMud2lkdGgpO1xuICB9XG5cbiAgdmFyIGFsbERpcnMgPSBbYm90dG9tLCB0b3AsIGxlZnQsIHJpZ2h0XTtcblxuICBpZiAobHJPbmx5KSB7XG4gICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0ID09PSB0cnVlO1xuICB9XG5cbiAgaWYgKHRiT25seSkge1xuICAgIHJldHVybiB0b3AgPT09IGJvdHRvbSA9PT0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBhbGxEaXJzLmluZGV4T2YoZmFsc2UpID09PSAtMTtcbn07XG5cbi8qKlxuICogVXNlcyBuYXRpdmUgbWV0aG9kcyB0byByZXR1cm4gYW4gb2JqZWN0IG9mIGRpbWVuc2lvbiB2YWx1ZXMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5IHx8IEhUTUx9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IG9yIERPTSBlbGVtZW50IGZvciB3aGljaCB0byBnZXQgdGhlIGRpbWVuc2lvbnMuIENhbiBiZSBhbnkgZWxlbWVudCBvdGhlciB0aGF0IGRvY3VtZW50IG9yIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IC0gbmVzdGVkIG9iamVjdCBvZiBpbnRlZ2VyIHBpeGVsIHZhbHVlc1xuICogVE9ETyAtIGlmIGVsZW1lbnQgaXMgd2luZG93LCByZXR1cm4gb25seSB0aG9zZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIEdldERpbWVuc2lvbnMoZWxlbSwgdGVzdCl7XG4gIGVsZW0gPSBlbGVtLmxlbmd0aCA/IGVsZW1bMF0gOiBlbGVtO1xuXG4gIGlmIChlbGVtID09PSB3aW5kb3cgfHwgZWxlbSA9PT0gZG9jdW1lbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJJ20gc29ycnksIERhdmUuIEknbSBhZnJhaWQgSSBjYW4ndCBkbyB0aGF0LlwiKTtcbiAgfVxuXG4gIHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHBhclJlY3QgPSBlbGVtLnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICB3aW5SZWN0ID0gZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG4gICAgICB3aW5YID0gd2luZG93LnBhZ2VYT2Zmc2V0O1xuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHJlY3Qud2lkdGgsXG4gICAgaGVpZ2h0OiByZWN0LmhlaWdodCxcbiAgICBvZmZzZXQ6IHtcbiAgICAgIHRvcDogcmVjdC50b3AgKyB3aW5ZLFxuICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgd2luWFxuICAgIH0sXG4gICAgcGFyZW50RGltczoge1xuICAgICAgd2lkdGg6IHBhclJlY3Qud2lkdGgsXG4gICAgICBoZWlnaHQ6IHBhclJlY3QuaGVpZ2h0LFxuICAgICAgb2Zmc2V0OiB7XG4gICAgICAgIHRvcDogcGFyUmVjdC50b3AgKyB3aW5ZLFxuICAgICAgICBsZWZ0OiBwYXJSZWN0LmxlZnQgKyB3aW5YXG4gICAgICB9XG4gICAgfSxcbiAgICB3aW5kb3dEaW1zOiB7XG4gICAgICB3aWR0aDogd2luUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogd2luUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiB3aW5ZLFxuICAgICAgICBsZWZ0OiB3aW5YXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3Qgb2YgdG9wIGFuZCBsZWZ0IGludGVnZXIgcGl4ZWwgdmFsdWVzIGZvciBkeW5hbWljYWxseSByZW5kZXJlZCBlbGVtZW50cyxcbiAqIHN1Y2ggYXM6IFRvb2x0aXAsIFJldmVhbCwgYW5kIERyb3Bkb3duXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQgYmVpbmcgcG9zaXRpb25lZC5cbiAqIEBwYXJhbSB7alF1ZXJ5fSBhbmNob3IgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCdzIGFuY2hvciBwb2ludC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBwb3NpdGlvbiAtIGEgc3RyaW5nIHJlbGF0aW5nIHRvIHRoZSBkZXNpcmVkIHBvc2l0aW9uIG9mIHRoZSBlbGVtZW50LCByZWxhdGl2ZSB0byBpdCdzIGFuY2hvclxuICogQHBhcmFtIHtOdW1iZXJ9IHZPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgdmVydGljYWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBoT2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIGhvcml6b250YWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNPdmVyZmxvdyAtIGlmIGEgY29sbGlzaW9uIGV2ZW50IGlzIGRldGVjdGVkLCBzZXRzIHRvIHRydWUgdG8gZGVmYXVsdCB0aGUgZWxlbWVudCB0byBmdWxsIHdpZHRoIC0gYW55IGRlc2lyZWQgb2Zmc2V0LlxuICogVE9ETyBhbHRlci9yZXdyaXRlIHRvIHdvcmsgd2l0aCBgZW1gIHZhbHVlcyBhcyB3ZWxsL2luc3RlYWQgb2YgcGl4ZWxzXG4gKi9cbmZ1bmN0aW9uIEdldE9mZnNldHMoZWxlbWVudCwgYW5jaG9yLCBwb3NpdGlvbiwgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdykge1xuICB2YXIgJGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgJGFuY2hvckRpbXMgPSBhbmNob3IgPyBHZXREaW1lbnNpb25zKGFuY2hvcikgOiBudWxsO1xuXG4gIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICBjYXNlICd0b3AnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0LFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciB0b3AnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgKCRhbmNob3JEaW1zLndpZHRoIC8gMikpIC0gKCRlbGVEaW1zLndpZHRoIC8gMiksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiBpc092ZXJmbG93ID8gaE9mZnNldCA6ICgoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciBsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgcmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgKyAxLFxuICAgICAgICB0b3A6ICgkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgKCRhbmNob3JEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0ICsgKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAoJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgKCRlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZXZlYWwnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLSAkZWxlRGltcy53aWR0aCkgLyAyLFxuICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCArIHZPZmZzZXRcbiAgICAgIH1cbiAgICBjYXNlICdyZXZlYWwgZnVsbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0LFxuICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCBib3R0b20nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH07XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyaWdodCBib3R0b20nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgLSAkZWxlRGltcy53aWR0aCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH1cbiAgfVxufVxuXG59KGpRdWVyeSk7XG4iLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqIFRoaXMgdXRpbCB3YXMgY3JlYXRlZCBieSBNYXJpdXMgT2xiZXJ0eiAqXG4gKiBQbGVhc2UgdGhhbmsgTWFyaXVzIG9uIEdpdEh1YiAvb3dsYmVydHogKlxuICogb3IgdGhlIHdlYiBodHRwOi8vd3d3Lm1hcml1c29sYmVydHouZGUvICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4ndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IGtleUNvZGVzID0ge1xuICA5OiAnVEFCJyxcbiAgMTM6ICdFTlRFUicsXG4gIDI3OiAnRVNDQVBFJyxcbiAgMzI6ICdTUEFDRScsXG4gIDM3OiAnQVJST1dfTEVGVCcsXG4gIDM4OiAnQVJST1dfVVAnLFxuICAzOTogJ0FSUk9XX1JJR0hUJyxcbiAgNDA6ICdBUlJPV19ET1dOJ1xufVxuXG52YXIgY29tbWFuZHMgPSB7fVxuXG52YXIgS2V5Ym9hcmQgPSB7XG4gIGtleXM6IGdldEtleUNvZGVzKGtleUNvZGVzKSxcblxuICAvKipcbiAgICogUGFyc2VzIHRoZSAoa2V5Ym9hcmQpIGV2ZW50IGFuZCByZXR1cm5zIGEgU3RyaW5nIHRoYXQgcmVwcmVzZW50cyBpdHMga2V5XG4gICAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHJldHVybiBTdHJpbmcga2V5IC0gU3RyaW5nIHRoYXQgcmVwcmVzZW50cyB0aGUga2V5IHByZXNzZWRcbiAgICovXG4gIHBhcnNlS2V5KGV2ZW50KSB7XG4gICAgdmFyIGtleSA9IGtleUNvZGVzW2V2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGVdIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQud2hpY2gpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAvLyBSZW1vdmUgdW4tcHJpbnRhYmxlIGNoYXJhY3RlcnMsIGUuZy4gZm9yIGBmcm9tQ2hhckNvZGVgIGNhbGxzIGZvciBDVFJMIG9ubHkgZXZlbnRzXG4gICAga2V5ID0ga2V5LnJlcGxhY2UoL1xcVysvLCAnJyk7XG5cbiAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIGtleSA9IGBTSElGVF8ke2tleX1gO1xuICAgIGlmIChldmVudC5jdHJsS2V5KSBrZXkgPSBgQ1RSTF8ke2tleX1gO1xuICAgIGlmIChldmVudC5hbHRLZXkpIGtleSA9IGBBTFRfJHtrZXl9YDtcblxuICAgIC8vIFJlbW92ZSB0cmFpbGluZyB1bmRlcnNjb3JlLCBpbiBjYXNlIG9ubHkgbW9kaWZpZXJzIHdlcmUgdXNlZCAoZS5nLiBvbmx5IGBDVFJMX0FMVGApXG4gICAga2V5ID0ga2V5LnJlcGxhY2UoL18kLywgJycpO1xuXG4gICAgcmV0dXJuIGtleTtcbiAgfSxcblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgZ2l2ZW4gKGtleWJvYXJkKSBldmVudFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50J3MgbmFtZSwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEBwYXJhbSB7T2JqZWN0c30gZnVuY3Rpb25zIC0gY29sbGVjdGlvbiBvZiBmdW5jdGlvbnMgdGhhdCBhcmUgdG8gYmUgZXhlY3V0ZWRcbiAgICovXG4gIGhhbmRsZUtleShldmVudCwgY29tcG9uZW50LCBmdW5jdGlvbnMpIHtcbiAgICB2YXIgY29tbWFuZExpc3QgPSBjb21tYW5kc1tjb21wb25lbnRdLFxuICAgICAga2V5Q29kZSA9IHRoaXMucGFyc2VLZXkoZXZlbnQpLFxuICAgICAgY21kcyxcbiAgICAgIGNvbW1hbmQsXG4gICAgICBmbjtcblxuICAgIGlmICghY29tbWFuZExpc3QpIHJldHVybiBjb25zb2xlLndhcm4oJ0NvbXBvbmVudCBub3QgZGVmaW5lZCEnKTtcblxuICAgIGlmICh0eXBlb2YgY29tbWFuZExpc3QubHRyID09PSAndW5kZWZpbmVkJykgeyAvLyB0aGlzIGNvbXBvbmVudCBkb2VzIG5vdCBkaWZmZXJlbnRpYXRlIGJldHdlZW4gbHRyIGFuZCBydGxcbiAgICAgICAgY21kcyA9IGNvbW1hbmRMaXN0OyAvLyB1c2UgcGxhaW4gbGlzdFxuICAgIH0gZWxzZSB7IC8vIG1lcmdlIGx0ciBhbmQgcnRsOiBpZiBkb2N1bWVudCBpcyBydGwsIHJ0bCBvdmVyd3JpdGVzIGx0ciBhbmQgdmljZSB2ZXJzYVxuICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5sdHIsIGNvbW1hbmRMaXN0LnJ0bCk7XG5cbiAgICAgICAgZWxzZSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0LnJ0bCwgY29tbWFuZExpc3QubHRyKTtcbiAgICB9XG4gICAgY29tbWFuZCA9IGNtZHNba2V5Q29kZV07XG5cbiAgICBmbiA9IGZ1bmN0aW9uc1tjb21tYW5kXTtcbiAgICBpZiAoZm4gJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gIGlmIGV4aXN0c1xuICAgICAgdmFyIHJldHVyblZhbHVlID0gZm4uYXBwbHkoKTtcbiAgICAgIGlmIChmdW5jdGlvbnMuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLmhhbmRsZWQocmV0dXJuVmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZnVuY3Rpb25zLnVuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLnVuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIG5vdCBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLnVuaGFuZGxlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRmluZHMgYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gdGhlIGdpdmVuIGAkZWxlbWVudGBcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBzZWFyY2ggd2l0aGluXG4gICAqIEByZXR1cm4ge2pRdWVyeX0gJGZvY3VzYWJsZSAtIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIGAkZWxlbWVudGBcbiAgICovXG4gIGZpbmRGb2N1c2FibGUoJGVsZW1lbnQpIHtcbiAgICBpZighJGVsZW1lbnQpIHtyZXR1cm4gZmFsc2U7IH1cbiAgICByZXR1cm4gJGVsZW1lbnQuZmluZCgnYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzZWxlY3Q6bm90KFtkaXNhYmxlZF0pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSksIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlmcmFtZSwgb2JqZWN0LCBlbWJlZCwgKlt0YWJpbmRleF0sICpbY29udGVudGVkaXRhYmxlXScpLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgIGlmICghJCh0aGlzKS5pcygnOnZpc2libGUnKSB8fCAkKHRoaXMpLmF0dHIoJ3RhYmluZGV4JykgPCAwKSB7IHJldHVybiBmYWxzZTsgfSAvL29ubHkgaGF2ZSB2aXNpYmxlIGVsZW1lbnRzIGFuZCB0aG9zZSB0aGF0IGhhdmUgYSB0YWJpbmRleCBncmVhdGVyIG9yIGVxdWFsIDBcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgbmFtZSBuYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEByZXR1cm4gU3RyaW5nIGNvbXBvbmVudE5hbWVcbiAgICovXG5cbiAgcmVnaXN0ZXIoY29tcG9uZW50TmFtZSwgY21kcykge1xuICAgIGNvbW1hbmRzW2NvbXBvbmVudE5hbWVdID0gY21kcztcbiAgfSwgIFxuXG4gIC8qKlxuICAgKiBUcmFwcyB0aGUgZm9jdXMgaW4gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2pRdWVyeX0gJGVsZW1lbnQgIGpRdWVyeSBvYmplY3QgdG8gdHJhcCB0aGUgZm91Y3MgaW50by5cbiAgICovXG4gIHRyYXBGb2N1cygkZWxlbWVudCkge1xuICAgIHZhciAkZm9jdXNhYmxlID0gRm91bmRhdGlvbi5LZXlib2FyZC5maW5kRm9jdXNhYmxlKCRlbGVtZW50KSxcbiAgICAgICAgJGZpcnN0Rm9jdXNhYmxlID0gJGZvY3VzYWJsZS5lcSgwKSxcbiAgICAgICAgJGxhc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKC0xKTtcblxuICAgICRlbGVtZW50Lm9uKCdrZXlkb3duLnpmLnRyYXBmb2N1cycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSAkbGFzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1RBQicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJGZpcnN0Rm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChldmVudC50YXJnZXQgPT09ICRmaXJzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1NISUZUX1RBQicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJGxhc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgLyoqXG4gICAqIFJlbGVhc2VzIHRoZSB0cmFwcGVkIGZvY3VzIGZyb20gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2pRdWVyeX0gJGVsZW1lbnQgIGpRdWVyeSBvYmplY3QgdG8gcmVsZWFzZSB0aGUgZm9jdXMgZm9yLlxuICAgKi9cbiAgcmVsZWFzZUZvY3VzKCRlbGVtZW50KSB7XG4gICAgJGVsZW1lbnQub2ZmKCdrZXlkb3duLnpmLnRyYXBmb2N1cycpO1xuICB9XG59XG5cbi8qXG4gKiBDb25zdGFudHMgZm9yIGVhc2llciBjb21wYXJpbmcuXG4gKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAqL1xuZnVuY3Rpb24gZ2V0S2V5Q29kZXMoa2NzKSB7XG4gIHZhciBrID0ge307XG4gIGZvciAodmFyIGtjIGluIGtjcykga1trY3Nba2NdXSA9IGtjc1trY107XG4gIHJldHVybiBrO1xufVxuXG5Gb3VuZGF0aW9uLktleWJvYXJkID0gS2V5Ym9hcmQ7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLy8gRGVmYXVsdCBzZXQgb2YgbWVkaWEgcXVlcmllc1xuY29uc3QgZGVmYXVsdFF1ZXJpZXMgPSB7XG4gICdkZWZhdWx0JyA6ICdvbmx5IHNjcmVlbicsXG4gIGxhbmRzY2FwZSA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcbiAgcG9ydHJhaXQgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcbiAgcmV0aW5hIDogJ29ubHkgc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKC1vLW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIvMSksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDJkcHB4KSdcbn07XG5cbnZhciBNZWRpYVF1ZXJ5ID0ge1xuICBxdWVyaWVzOiBbXSxcblxuICBjdXJyZW50OiAnJyxcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1lZGlhIHF1ZXJ5IGhlbHBlciwgYnkgZXh0cmFjdGluZyB0aGUgYnJlYWtwb2ludCBsaXN0IGZyb20gdGhlIENTUyBhbmQgYWN0aXZhdGluZyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZXh0cmFjdGVkU3R5bGVzID0gJCgnLmZvdW5kYXRpb24tbXEnKS5jc3MoJ2ZvbnQtZmFtaWx5Jyk7XG4gICAgdmFyIG5hbWVkUXVlcmllcztcblxuICAgIG5hbWVkUXVlcmllcyA9IHBhcnNlU3R5bGVUb09iamVjdChleHRyYWN0ZWRTdHlsZXMpO1xuXG4gICAgZm9yICh2YXIga2V5IGluIG5hbWVkUXVlcmllcykge1xuICAgICAgaWYobmFtZWRRdWVyaWVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgc2VsZi5xdWVyaWVzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICB2YWx1ZTogYG9ubHkgc2NyZWVuIGFuZCAobWluLXdpZHRoOiAke25hbWVkUXVlcmllc1trZXldfSlgXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY3VycmVudCA9IHRoaXMuX2dldEN1cnJlbnRTaXplKCk7XG5cbiAgICB0aGlzLl93YXRjaGVyKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQncyBzbWFsbGVyLlxuICAgKi9cbiAgYXRMZWFzdChzaXplKSB7XG4gICAgdmFyIHF1ZXJ5ID0gdGhpcy5nZXQoc2l6ZSk7XG5cbiAgICBpZiAocXVlcnkpIHtcbiAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSkubWF0Y2hlcztcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIG1hdGNoZXMgdG8gYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLCBlaXRoZXIgJ3NtYWxsIG9ubHknIG9yICdzbWFsbCcuIE9taXR0aW5nICdvbmx5JyBmYWxscyBiYWNrIHRvIHVzaW5nIGF0TGVhc3QoKSBtZXRob2QuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCBkb2VzIG5vdC5cbiAgICovXG4gIGlzKHNpemUpIHtcbiAgICBzaXplID0gc2l6ZS50cmltKCkuc3BsaXQoJyAnKTtcbiAgICBpZihzaXplLmxlbmd0aCA+IDEgJiYgc2l6ZVsxXSA9PT0gJ29ubHknKSB7XG4gICAgICBpZihzaXplWzBdID09PSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuYXRMZWFzdChzaXplWzBdKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZWRpYSBxdWVyeSBvZiBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gZ2V0LlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9IC0gVGhlIG1lZGlhIHF1ZXJ5IG9mIHRoZSBicmVha3BvaW50LCBvciBgbnVsbGAgaWYgdGhlIGJyZWFrcG9pbnQgZG9lc24ndCBleGlzdC5cbiAgICovXG4gIGdldChzaXplKSB7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnF1ZXJpZXMpIHtcbiAgICAgIGlmKHRoaXMucXVlcmllcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICAgIGlmIChzaXplID09PSBxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGN1cnJlbnQgYnJlYWtwb2ludCBuYW1lIGJ5IHRlc3RpbmcgZXZlcnkgYnJlYWtwb2ludCBhbmQgcmV0dXJuaW5nIHRoZSBsYXN0IG9uZSB0byBtYXRjaCAodGhlIGJpZ2dlc3Qgb25lKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IE5hbWUgb2YgdGhlIGN1cnJlbnQgYnJlYWtwb2ludC5cbiAgICovXG4gIF9nZXRDdXJyZW50U2l6ZSgpIHtcbiAgICB2YXIgbWF0Y2hlZDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG5cbiAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShxdWVyeS52YWx1ZSkubWF0Y2hlcykge1xuICAgICAgICBtYXRjaGVkID0gcXVlcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtYXRjaGVkID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIG1hdGNoZWQubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1hdGNoZWQ7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZXMgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlciwgd2hpY2ggZmlyZXMgYW4gZXZlbnQgb24gdGhlIHdpbmRvdyB3aGVuZXZlciB0aGUgYnJlYWtwb2ludCBjaGFuZ2VzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF93YXRjaGVyKCkge1xuICAgICQod2luZG93KS5vbigncmVzaXplLnpmLm1lZGlhcXVlcnknLCAoKSA9PiB7XG4gICAgICB2YXIgbmV3U2l6ZSA9IHRoaXMuX2dldEN1cnJlbnRTaXplKCksIGN1cnJlbnRTaXplID0gdGhpcy5jdXJyZW50O1xuXG4gICAgICBpZiAobmV3U2l6ZSAhPT0gY3VycmVudFNpemUpIHtcbiAgICAgICAgLy8gQ2hhbmdlIHRoZSBjdXJyZW50IG1lZGlhIHF1ZXJ5XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5ld1NpemU7XG5cbiAgICAgICAgLy8gQnJvYWRjYXN0IHRoZSBtZWRpYSBxdWVyeSBjaGFuZ2Ugb24gdGhlIHdpbmRvd1xuICAgICAgICAkKHdpbmRvdykudHJpZ2dlcignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgW25ld1NpemUsIGN1cnJlbnRTaXplXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbkZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbi8vIG1hdGNoTWVkaWEoKSBwb2x5ZmlsbCAtIFRlc3QgYSBDU1MgbWVkaWEgdHlwZS9xdWVyeSBpbiBKUy5cbi8vIEF1dGhvcnMgJiBjb3B5cmlnaHQgKGMpIDIwMTI6IFNjb3R0IEplaGwsIFBhdWwgSXJpc2gsIE5pY2hvbGFzIFpha2FzLCBEYXZpZCBLbmlnaHQuIER1YWwgTUlUL0JTRCBsaWNlbnNlXG53aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgbWF0Y2hNZWRpdW0gYXBpIHN1Y2ggYXMgSUUgOSBhbmQgd2Via2l0XG4gIHZhciBzdHlsZU1lZGlhID0gKHdpbmRvdy5zdHlsZU1lZGlhIHx8IHdpbmRvdy5tZWRpYSk7XG5cbiAgLy8gRm9yIHRob3NlIHRoYXQgZG9uJ3Qgc3VwcG9ydCBtYXRjaE1lZGl1bVxuICBpZiAoIXN0eWxlTWVkaWEpIHtcbiAgICB2YXIgc3R5bGUgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgc2NyaXB0ICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXG4gICAgaW5mbyAgICAgICAgPSBudWxsO1xuXG4gICAgc3R5bGUudHlwZSAgPSAndGV4dC9jc3MnO1xuICAgIHN0eWxlLmlkICAgID0gJ21hdGNobWVkaWFqcy10ZXN0JztcblxuICAgIHNjcmlwdCAmJiBzY3JpcHQucGFyZW50Tm9kZSAmJiBzY3JpcHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3R5bGUsIHNjcmlwdCk7XG5cbiAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgIGluZm8gPSAoJ2dldENvbXB1dGVkU3R5bGUnIGluIHdpbmRvdykgJiYgd2luZG93LmdldENvbXB1dGVkU3R5bGUoc3R5bGUsIG51bGwpIHx8IHN0eWxlLmN1cnJlbnRTdHlsZTtcblxuICAgIHN0eWxlTWVkaWEgPSB7XG4gICAgICBtYXRjaE1lZGl1bShtZWRpYSkge1xuICAgICAgICB2YXIgdGV4dCA9IGBAbWVkaWEgJHttZWRpYX17ICNtYXRjaG1lZGlhanMtdGVzdCB7IHdpZHRoOiAxcHg7IH0gfWA7XG5cbiAgICAgICAgLy8gJ3N0eWxlLnN0eWxlU2hlZXQnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3N0eWxlLnRleHRDb250ZW50JyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gdGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUZXN0IGlmIG1lZGlhIHF1ZXJ5IGlzIHRydWUgb3IgZmFsc2VcbiAgICAgICAgcmV0dXJuIGluZm8ud2lkdGggPT09ICcxcHgnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihtZWRpYSkge1xuICAgIHJldHVybiB7XG4gICAgICBtYXRjaGVzOiBzdHlsZU1lZGlhLm1hdGNoTWVkaXVtKG1lZGlhIHx8ICdhbGwnKSxcbiAgICAgIG1lZGlhOiBtZWRpYSB8fCAnYWxsJ1xuICAgIH07XG4gIH1cbn0oKSk7XG5cbi8vIFRoYW5rIHlvdTogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9xdWVyeS1zdHJpbmdcbmZ1bmN0aW9uIHBhcnNlU3R5bGVUb09iamVjdChzdHIpIHtcbiAgdmFyIHN0eWxlT2JqZWN0ID0ge307XG5cbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3RyID0gc3RyLnRyaW0oKS5zbGljZSgxLCAtMSk7IC8vIGJyb3dzZXJzIHJlLXF1b3RlIHN0cmluZyBzdHlsZSB2YWx1ZXNcblxuICBpZiAoIXN0cikge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0eWxlT2JqZWN0ID0gc3RyLnNwbGl0KCcmJykucmVkdWNlKGZ1bmN0aW9uKHJldCwgcGFyYW0pIHtcbiAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcbiAgICB2YXIgdmFsID0gcGFydHNbMV07XG4gICAga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cbiAgICAvLyBtaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuICAgIC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICB2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcblxuICAgIGlmICghcmV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldFtrZXldID0gdmFsO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHtcbiAgICAgIHJldFtrZXldLnB1c2godmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0W2tleV0gPSBbcmV0W2tleV0sIHZhbF07XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH0sIHt9KTtcblxuICByZXR1cm4gc3R5bGVPYmplY3Q7XG59XG5cbkZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBNb3Rpb24gbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLm1vdGlvblxuICovXG5cbmNvbnN0IGluaXRDbGFzc2VzICAgPSBbJ211aS1lbnRlcicsICdtdWktbGVhdmUnXTtcbmNvbnN0IGFjdGl2ZUNsYXNzZXMgPSBbJ211aS1lbnRlci1hY3RpdmUnLCAnbXVpLWxlYXZlLWFjdGl2ZSddO1xuXG5jb25zdCBNb3Rpb24gPSB7XG4gIGFuaW1hdGVJbjogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGFuaW1hdGUodHJ1ZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gIH0sXG5cbiAgYW5pbWF0ZU91dDogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGFuaW1hdGUoZmFsc2UsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIE1vdmUoZHVyYXRpb24sIGVsZW0sIGZuKXtcbiAgdmFyIGFuaW0sIHByb2csIHN0YXJ0ID0gbnVsbDtcbiAgLy8gY29uc29sZS5sb2coJ2NhbGxlZCcpO1xuXG4gIGlmIChkdXJhdGlvbiA9PT0gMCkge1xuICAgIGZuLmFwcGx5KGVsZW0pO1xuICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1vdmUodHMpe1xuICAgIGlmKCFzdGFydCkgc3RhcnQgPSB0cztcbiAgICAvLyBjb25zb2xlLmxvZyhzdGFydCwgdHMpO1xuICAgIHByb2cgPSB0cyAtIHN0YXJ0O1xuICAgIGZuLmFwcGx5KGVsZW0pO1xuXG4gICAgaWYocHJvZyA8IGR1cmF0aW9uKXsgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSwgZWxlbSk7IH1cbiAgICBlbHNle1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW0pO1xuICAgICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgfVxuICB9XG4gIGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUpO1xufVxuXG4vKipcbiAqIEFuaW1hdGVzIGFuIGVsZW1lbnQgaW4gb3Igb3V0IHVzaW5nIGEgQ1NTIHRyYW5zaXRpb24gY2xhc3MuXG4gKiBAZnVuY3Rpb25cbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzSW4gLSBEZWZpbmVzIGlmIHRoZSBhbmltYXRpb24gaXMgaW4gb3Igb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb3IgSFRNTCBvYmplY3QgdG8gYW5pbWF0ZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBhbmltYXRpb24gLSBDU1MgY2xhc3MgdG8gdXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBDYWxsYmFjayB0byBydW4gd2hlbiBhbmltYXRpb24gaXMgZmluaXNoZWQuXG4gKi9cbmZ1bmN0aW9uIGFuaW1hdGUoaXNJbiwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICBlbGVtZW50ID0gJChlbGVtZW50KS5lcSgwKTtcblxuICBpZiAoIWVsZW1lbnQubGVuZ3RoKSByZXR1cm47XG5cbiAgdmFyIGluaXRDbGFzcyA9IGlzSW4gPyBpbml0Q2xhc3Nlc1swXSA6IGluaXRDbGFzc2VzWzFdO1xuICB2YXIgYWN0aXZlQ2xhc3MgPSBpc0luID8gYWN0aXZlQ2xhc3Nlc1swXSA6IGFjdGl2ZUNsYXNzZXNbMV07XG5cbiAgLy8gU2V0IHVwIHRoZSBhbmltYXRpb25cbiAgcmVzZXQoKTtcblxuICBlbGVtZW50XG4gICAgLmFkZENsYXNzKGFuaW1hdGlvbilcbiAgICAuY3NzKCd0cmFuc2l0aW9uJywgJ25vbmUnKTtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGVsZW1lbnQuYWRkQ2xhc3MoaW5pdENsYXNzKTtcbiAgICBpZiAoaXNJbikgZWxlbWVudC5zaG93KCk7XG4gIH0pO1xuXG4gIC8vIFN0YXJ0IHRoZSBhbmltYXRpb25cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBlbGVtZW50WzBdLm9mZnNldFdpZHRoO1xuICAgIGVsZW1lbnRcbiAgICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnJylcbiAgICAgIC5hZGRDbGFzcyhhY3RpdmVDbGFzcyk7XG4gIH0pO1xuXG4gIC8vIENsZWFuIHVwIHRoZSBhbmltYXRpb24gd2hlbiBpdCBmaW5pc2hlc1xuICBlbGVtZW50Lm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoZWxlbWVudCksIGZpbmlzaCk7XG5cbiAgLy8gSGlkZXMgdGhlIGVsZW1lbnQgKGZvciBvdXQgYW5pbWF0aW9ucyksIHJlc2V0cyB0aGUgZWxlbWVudCwgYW5kIHJ1bnMgYSBjYWxsYmFja1xuICBmdW5jdGlvbiBmaW5pc2goKSB7XG4gICAgaWYgKCFpc0luKSBlbGVtZW50LmhpZGUoKTtcbiAgICByZXNldCgpO1xuICAgIGlmIChjYikgY2IuYXBwbHkoZWxlbWVudCk7XG4gIH1cblxuICAvLyBSZXNldHMgdHJhbnNpdGlvbnMgYW5kIHJlbW92ZXMgbW90aW9uLXNwZWNpZmljIGNsYXNzZXNcbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgZWxlbWVudFswXS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAwO1xuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoYCR7aW5pdENsYXNzfSAke2FjdGl2ZUNsYXNzfSAke2FuaW1hdGlvbn1gKTtcbiAgfVxufVxuXG5Gb3VuZGF0aW9uLk1vdmUgPSBNb3ZlO1xuRm91bmRhdGlvbi5Nb3Rpb24gPSBNb3Rpb247XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3QgTmVzdCA9IHtcbiAgRmVhdGhlcihtZW51LCB0eXBlID0gJ3pmJykge1xuICAgIG1lbnUuYXR0cigncm9sZScsICdtZW51YmFyJyk7XG5cbiAgICB2YXIgaXRlbXMgPSBtZW51LmZpbmQoJ2xpJykuYXR0cih7J3JvbGUnOiAnbWVudWl0ZW0nfSksXG4gICAgICAgIHN1Yk1lbnVDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnVgLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBgJHtzdWJNZW51Q2xhc3N9LWl0ZW1gLFxuICAgICAgICBoYXNTdWJDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnUtcGFyZW50YDtcblxuICAgIGl0ZW1zLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcblxuICAgICAgaWYgKCRzdWIubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtXG4gICAgICAgICAgLmFkZENsYXNzKGhhc1N1YkNsYXNzKVxuICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICdhcmlhLWhhc3BvcHVwJzogdHJ1ZSxcbiAgICAgICAgICAgICdhcmlhLWxhYmVsJzogJGl0ZW0uY2hpbGRyZW4oJ2E6Zmlyc3QnKS50ZXh0KClcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBOb3RlOiAgRHJpbGxkb3ducyBiZWhhdmUgZGlmZmVyZW50bHkgaW4gaG93IHRoZXkgaGlkZSwgYW5kIHNvIG5lZWRcbiAgICAgICAgICAvLyBhZGRpdGlvbmFsIGF0dHJpYnV0ZXMuICBXZSBzaG91bGQgbG9vayBpZiB0aGlzIHBvc3NpYmx5IG92ZXItZ2VuZXJhbGl6ZWRcbiAgICAgICAgICAvLyB1dGlsaXR5IChOZXN0KSBpcyBhcHByb3ByaWF0ZSB3aGVuIHdlIHJld29yayBtZW51cyBpbiA2LjRcbiAgICAgICAgICBpZih0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICAgJGl0ZW0uYXR0cih7J2FyaWEtZXhwYW5kZWQnOiBmYWxzZX0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAkc3ViXG4gICAgICAgICAgLmFkZENsYXNzKGBzdWJtZW51ICR7c3ViTWVudUNsYXNzfWApXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2RhdGEtc3VibWVudSc6ICcnLFxuICAgICAgICAgICAgJ3JvbGUnOiAnbWVudSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgaWYodHlwZSA9PT0gJ2RyaWxsZG93bicpIHtcbiAgICAgICAgICAkc3ViLmF0dHIoeydhcmlhLWhpZGRlbic6IHRydWV9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCkge1xuICAgICAgICAkaXRlbS5hZGRDbGFzcyhgaXMtc3VibWVudS1pdGVtICR7c3ViSXRlbUNsYXNzfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIEJ1cm4obWVudSwgdHlwZSkge1xuICAgIHZhciAvL2l0ZW1zID0gbWVudS5maW5kKCdsaScpLFxuICAgICAgICBzdWJNZW51Q2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51YCxcbiAgICAgICAgc3ViSXRlbUNsYXNzID0gYCR7c3ViTWVudUNsYXNzfS1pdGVtYCxcbiAgICAgICAgaGFzU3ViQ2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51LXBhcmVudGA7XG5cbiAgICBtZW51XG4gICAgICAuZmluZCgnPmxpLCAubWVudSwgLm1lbnUgPiBsaScpXG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7c3ViTWVudUNsYXNzfSAke3N1Ykl0ZW1DbGFzc30gJHtoYXNTdWJDbGFzc30gaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUgaXMtYWN0aXZlYClcbiAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyggICAgICBtZW51LmZpbmQoJy4nICsgc3ViTWVudUNsYXNzICsgJywgLicgKyBzdWJJdGVtQ2xhc3MgKyAnLCAuaGFzLXN1Ym1lbnUsIC5pcy1zdWJtZW51LWl0ZW0sIC5zdWJtZW51LCBbZGF0YS1zdWJtZW51XScpXG4gICAgLy8gICAgICAgICAgIC5yZW1vdmVDbGFzcyhzdWJNZW51Q2xhc3MgKyAnICcgKyBzdWJJdGVtQ2xhc3MgKyAnIGhhcy1zdWJtZW51IGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51JylcbiAgICAvLyAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpKTtcbiAgICAvLyBpdGVtcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgLy8gICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgIC8vICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcbiAgICAvLyAgIGlmKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpe1xuICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaXMtc3VibWVudS1pdGVtICcgKyBzdWJJdGVtQ2xhc3MpO1xuICAgIC8vICAgfVxuICAgIC8vICAgaWYoJHN1Yi5sZW5ndGgpe1xuICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaGFzLXN1Ym1lbnUnKTtcbiAgICAvLyAgICAgJHN1Yi5yZW1vdmVDbGFzcygnc3VibWVudSAnICsgc3ViTWVudUNsYXNzKS5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9KTtcbiAgfVxufVxuXG5Gb3VuZGF0aW9uLk5lc3QgPSBOZXN0O1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmZ1bmN0aW9uIFRpbWVyKGVsZW0sIG9wdGlvbnMsIGNiKSB7XG4gIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICBkdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24sLy9vcHRpb25zIGlzIGFuIG9iamVjdCBmb3IgZWFzaWx5IGFkZGluZyBmZWF0dXJlcyBsYXRlci5cbiAgICAgIG5hbWVTcGFjZSA9IE9iamVjdC5rZXlzKGVsZW0uZGF0YSgpKVswXSB8fCAndGltZXInLFxuICAgICAgcmVtYWluID0gLTEsXG4gICAgICBzdGFydCxcbiAgICAgIHRpbWVyO1xuXG4gIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcblxuICB0aGlzLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICByZW1haW4gPSAtMTtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgfVxuXG4gIHRoaXMuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG4gICAgLy8gaWYoIWVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICByZW1haW4gPSByZW1haW4gPD0gMCA/IGR1cmF0aW9uIDogcmVtYWluO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgZmFsc2UpO1xuICAgIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIGlmKG9wdGlvbnMuaW5maW5pdGUpe1xuICAgICAgICBfdGhpcy5yZXN0YXJ0KCk7Ly9yZXJ1biB0aGUgdGltZXIuXG4gICAgICB9XG4gICAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7IGNiKCk7IH1cbiAgICB9LCByZW1haW4pO1xuICAgIGVsZW0udHJpZ2dlcihgdGltZXJzdGFydC56Zi4ke25hbWVTcGFjZX1gKTtcbiAgfVxuXG4gIHRoaXMucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcbiAgICAvL2lmKGVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIHRydWUpO1xuICAgIHZhciBlbmQgPSBEYXRlLm5vdygpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiAtIChlbmQgLSBzdGFydCk7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnBhdXNlZC56Zi4ke25hbWVTcGFjZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJ1bnMgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGltYWdlcyBhcmUgZnVsbHkgbG9hZGVkLlxuICogQHBhcmFtIHtPYmplY3R9IGltYWdlcyAtIEltYWdlKHMpIHRvIGNoZWNrIGlmIGxvYWRlZC5cbiAqIEBwYXJhbSB7RnVuY30gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gaW1hZ2UgaXMgZnVsbHkgbG9hZGVkLlxuICovXG5mdW5jdGlvbiBvbkltYWdlc0xvYWRlZChpbWFnZXMsIGNhbGxiYWNrKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdW5sb2FkZWQgPSBpbWFnZXMubGVuZ3RoO1xuXG4gIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cblxuICBpbWFnZXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAvLyBDaGVjayBpZiBpbWFnZSBpcyBsb2FkZWRcbiAgICBpZiAodGhpcy5jb21wbGV0ZSB8fCAodGhpcy5yZWFkeVN0YXRlID09PSA0KSB8fCAodGhpcy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSkge1xuICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICB9XG4gICAgLy8gRm9yY2UgbG9hZCB0aGUgaW1hZ2VcbiAgICBlbHNlIHtcbiAgICAgIC8vIGZpeCBmb3IgSUUuIFNlZSBodHRwczovL2Nzcy10cmlja3MuY29tL3NuaXBwZXRzL2pxdWVyeS9maXhpbmctbG9hZC1pbi1pZS1mb3ItY2FjaGVkLWltYWdlcy9cbiAgICAgIHZhciBzcmMgPSAkKHRoaXMpLmF0dHIoJ3NyYycpO1xuICAgICAgJCh0aGlzKS5hdHRyKCdzcmMnLCBzcmMgKyAoc3JjLmluZGV4T2YoJz8nKSA+PSAwID8gJyYnIDogJz8nKSArIChuZXcgRGF0ZSgpLmdldFRpbWUoKSkpO1xuICAgICAgJCh0aGlzKS5vbmUoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2luZ2xlSW1hZ2VMb2FkZWQoKSB7XG4gICAgdW5sb2FkZWQtLTtcbiAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG59XG5cbkZvdW5kYXRpb24uVGltZXIgPSBUaW1lcjtcbkZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQgPSBvbkltYWdlc0xvYWRlZDtcblxufShqUXVlcnkpO1xuIiwiLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKldvcmsgaW5zcGlyZWQgYnkgbXVsdGlwbGUganF1ZXJ5IHN3aXBlIHBsdWdpbnMqKlxuLy8qKkRvbmUgYnkgWW9oYWkgQXJhcmF0ICoqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKGZ1bmN0aW9uKCQpIHtcblxuICAkLnNwb3RTd2lwZSA9IHtcbiAgICB2ZXJzaW9uOiAnMS4wLjAnLFxuICAgIGVuYWJsZWQ6ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcbiAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2UsXG4gICAgbW92ZVRocmVzaG9sZDogNzUsXG4gICAgdGltZVRocmVzaG9sZDogMjAwXG4gIH07XG5cbiAgdmFyICAgc3RhcnRQb3NYLFxuICAgICAgICBzdGFydFBvc1ksXG4gICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgZWxhcHNlZFRpbWUsXG4gICAgICAgIGlzTW92aW5nID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gb25Ub3VjaEVuZCgpIHtcbiAgICAvLyAgYWxlcnQodGhpcyk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQpO1xuICAgIGlzTW92aW5nID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBvblRvdWNoTW92ZShlKSB7XG4gICAgaWYgKCQuc3BvdFN3aXBlLnByZXZlbnREZWZhdWx0KSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICAgIGlmKGlzTW92aW5nKSB7XG4gICAgICB2YXIgeCA9IGUudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgIHZhciB5ID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgdmFyIGR4ID0gc3RhcnRQb3NYIC0geDtcbiAgICAgIHZhciBkeSA9IHN0YXJ0UG9zWSAtIHk7XG4gICAgICB2YXIgZGlyO1xuICAgICAgZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0VGltZTtcbiAgICAgIGlmKE1hdGguYWJzKGR4KSA+PSAkLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkICYmIGVsYXBzZWRUaW1lIDw9ICQuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQpIHtcbiAgICAgICAgZGlyID0gZHggPiAwID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICAgIH1cbiAgICAgIC8vIGVsc2UgaWYoTWF0aC5hYnMoZHkpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgLy8gICBkaXIgPSBkeSA+IDAgPyAnZG93bicgOiAndXAnO1xuICAgICAgLy8gfVxuICAgICAgaWYoZGlyKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb25Ub3VjaEVuZC5jYWxsKHRoaXMpO1xuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoJ3N3aXBlJywgZGlyKS50cmlnZ2VyKGBzd2lwZSR7ZGlyfWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hTdGFydChlKSB7XG4gICAgaWYgKGUudG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgc3RhcnRQb3NYID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgc3RhcnRQb3NZID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgaXNNb3ZpbmcgPSB0cnVlO1xuICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyICYmIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCwgZmFsc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGVhcmRvd24oKSB7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0KTtcbiAgfVxuXG4gICQuZXZlbnQuc3BlY2lhbC5zd2lwZSA9IHsgc2V0dXA6IGluaXQgfTtcblxuICAkLmVhY2goWydsZWZ0JywgJ3VwJywgJ2Rvd24nLCAncmlnaHQnXSwgZnVuY3Rpb24gKCkge1xuICAgICQuZXZlbnQuc3BlY2lhbFtgc3dpcGUke3RoaXN9YF0gPSB7IHNldHVwOiBmdW5jdGlvbigpe1xuICAgICAgJCh0aGlzKS5vbignc3dpcGUnLCAkLm5vb3ApO1xuICAgIH0gfTtcbiAgfSk7XG59KShqUXVlcnkpO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1ldGhvZCBmb3IgYWRkaW5nIHBzdWVkbyBkcmFnIGV2ZW50cyB0byBlbGVtZW50cyAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuIWZ1bmN0aW9uKCQpe1xuICAkLmZuLmFkZFRvdWNoID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSxlbCl7XG4gICAgICAkKGVsKS5iaW5kKCd0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCB0b3VjaGNhbmNlbCcsZnVuY3Rpb24oKXtcbiAgICAgICAgLy93ZSBwYXNzIHRoZSBvcmlnaW5hbCBldmVudCBvYmplY3QgYmVjYXVzZSB0aGUgalF1ZXJ5IGV2ZW50XG4gICAgICAgIC8vb2JqZWN0IGlzIG5vcm1hbGl6ZWQgdG8gdzNjIHNwZWNzIGFuZCBkb2VzIG5vdCBwcm92aWRlIHRoZSBUb3VjaExpc3RcbiAgICAgICAgaGFuZGxlVG91Y2goZXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgaGFuZGxlVG91Y2ggPSBmdW5jdGlvbihldmVudCl7XG4gICAgICB2YXIgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxuICAgICAgICAgIGZpcnN0ID0gdG91Y2hlc1swXSxcbiAgICAgICAgICBldmVudFR5cGVzID0ge1xuICAgICAgICAgICAgdG91Y2hzdGFydDogJ21vdXNlZG93bicsXG4gICAgICAgICAgICB0b3VjaG1vdmU6ICdtb3VzZW1vdmUnLFxuICAgICAgICAgICAgdG91Y2hlbmQ6ICdtb3VzZXVwJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdHlwZSA9IGV2ZW50VHlwZXNbZXZlbnQudHlwZV0sXG4gICAgICAgICAgc2ltdWxhdGVkRXZlbnRcbiAgICAgICAgO1xuXG4gICAgICBpZignTW91c2VFdmVudCcgaW4gd2luZG93ICYmIHR5cGVvZiB3aW5kb3cuTW91c2VFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzaW11bGF0ZWRFdmVudCA9IG5ldyB3aW5kb3cuTW91c2VFdmVudCh0eXBlLCB7XG4gICAgICAgICAgJ2J1YmJsZXMnOiB0cnVlLFxuICAgICAgICAgICdjYW5jZWxhYmxlJzogdHJ1ZSxcbiAgICAgICAgICAnc2NyZWVuWCc6IGZpcnN0LnNjcmVlblgsXG4gICAgICAgICAgJ3NjcmVlblknOiBmaXJzdC5zY3JlZW5ZLFxuICAgICAgICAgICdjbGllbnRYJzogZmlyc3QuY2xpZW50WCxcbiAgICAgICAgICAnY2xpZW50WSc6IGZpcnN0LmNsaWVudFlcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaW11bGF0ZWRFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50Jyk7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50LmluaXRNb3VzZUV2ZW50KHR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgMSwgZmlyc3Quc2NyZWVuWCwgZmlyc3Quc2NyZWVuWSwgZmlyc3QuY2xpZW50WCwgZmlyc3QuY2xpZW50WSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIDAvKmxlZnQqLywgbnVsbCk7XG4gICAgICB9XG4gICAgICBmaXJzdC50YXJnZXQuZGlzcGF0Y2hFdmVudChzaW11bGF0ZWRFdmVudCk7XG4gICAgfTtcbiAgfTtcbn0oalF1ZXJ5KTtcblxuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKipGcm9tIHRoZSBqUXVlcnkgTW9iaWxlIExpYnJhcnkqKlxuLy8qKm5lZWQgdG8gcmVjcmVhdGUgZnVuY3Rpb25hbGl0eSoqXG4vLyoqYW5kIHRyeSB0byBpbXByb3ZlIGlmIHBvc3NpYmxlKipcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4vKiBSZW1vdmluZyB0aGUgalF1ZXJ5IGZ1bmN0aW9uICoqKipcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4oZnVuY3Rpb24oICQsIHdpbmRvdywgdW5kZWZpbmVkICkge1xuXG5cdHZhciAkZG9jdW1lbnQgPSAkKCBkb2N1bWVudCApLFxuXHRcdC8vIHN1cHBvcnRUb3VjaCA9ICQubW9iaWxlLnN1cHBvcnQudG91Y2gsXG5cdFx0dG91Y2hTdGFydEV2ZW50ID0gJ3RvdWNoc3RhcnQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoc3RhcnRcIiA6IFwibW91c2Vkb3duXCIsXG5cdFx0dG91Y2hTdG9wRXZlbnQgPSAndG91Y2hlbmQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoZW5kXCIgOiBcIm1vdXNldXBcIixcblx0XHR0b3VjaE1vdmVFdmVudCA9ICd0b3VjaG1vdmUnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNobW92ZVwiIDogXCJtb3VzZW1vdmVcIjtcblxuXHQvLyBzZXR1cCBuZXcgZXZlbnQgc2hvcnRjdXRzXG5cdCQuZWFjaCggKCBcInRvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIFwiICtcblx0XHRcInN3aXBlIHN3aXBlbGVmdCBzd2lwZXJpZ2h0XCIgKS5zcGxpdCggXCIgXCIgKSwgZnVuY3Rpb24oIGksIG5hbWUgKSB7XG5cblx0XHQkLmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggZm4gKSB7XG5cdFx0XHRyZXR1cm4gZm4gPyB0aGlzLmJpbmQoIG5hbWUsIGZuICkgOiB0aGlzLnRyaWdnZXIoIG5hbWUgKTtcblx0XHR9O1xuXG5cdFx0Ly8galF1ZXJ5IDwgMS44XG5cdFx0aWYgKCAkLmF0dHJGbiApIHtcblx0XHRcdCQuYXR0ckZuWyBuYW1lIF0gPSB0cnVlO1xuXHRcdH1cblx0fSk7XG5cblx0ZnVuY3Rpb24gdHJpZ2dlckN1c3RvbUV2ZW50KCBvYmosIGV2ZW50VHlwZSwgZXZlbnQsIGJ1YmJsZSApIHtcblx0XHR2YXIgb3JpZ2luYWxUeXBlID0gZXZlbnQudHlwZTtcblx0XHRldmVudC50eXBlID0gZXZlbnRUeXBlO1xuXHRcdGlmICggYnViYmxlICkge1xuXHRcdFx0JC5ldmVudC50cmlnZ2VyKCBldmVudCwgdW5kZWZpbmVkLCBvYmogKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JC5ldmVudC5kaXNwYXRjaC5jYWxsKCBvYmosIGV2ZW50ICk7XG5cdFx0fVxuXHRcdGV2ZW50LnR5cGUgPSBvcmlnaW5hbFR5cGU7XG5cdH1cblxuXHQvLyBhbHNvIGhhbmRsZXMgdGFwaG9sZFxuXG5cdC8vIEFsc28gaGFuZGxlcyBzd2lwZWxlZnQsIHN3aXBlcmlnaHRcblx0JC5ldmVudC5zcGVjaWFsLnN3aXBlID0ge1xuXG5cdFx0Ly8gTW9yZSB0aGFuIHRoaXMgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQsIGFuZCB3ZSB3aWxsIHN1cHByZXNzIHNjcm9sbGluZy5cblx0XHRzY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkOiAzMCxcblxuXHRcdC8vIE1vcmUgdGltZSB0aGFuIHRoaXMsIGFuZCBpdCBpc24ndCBhIHN3aXBlLlxuXHRcdGR1cmF0aW9uVGhyZXNob2xkOiAxMDAwLFxuXG5cdFx0Ly8gU3dpcGUgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBtb3JlIHRoYW4gdGhpcy5cblx0XHRob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQ6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDIgPyAxNSA6IDMwLFxuXG5cdFx0Ly8gU3dpcGUgdmVydGljYWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbGVzcyB0aGFuIHRoaXMuXG5cdFx0dmVydGljYWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHRnZXRMb2NhdGlvbjogZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRcdHZhciB3aW5QYWdlWCA9IHdpbmRvdy5wYWdlWE9mZnNldCxcblx0XHRcdFx0d2luUGFnZVkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG5cdFx0XHRcdHggPSBldmVudC5jbGllbnRYLFxuXHRcdFx0XHR5ID0gZXZlbnQuY2xpZW50WTtcblxuXHRcdFx0aWYgKCBldmVudC5wYWdlWSA9PT0gMCAmJiBNYXRoLmZsb29yKCB5ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWSApIHx8XG5cdFx0XHRcdGV2ZW50LnBhZ2VYID09PSAwICYmIE1hdGguZmxvb3IoIHggKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gaU9TNCBjbGllbnRYL2NsaWVudFkgaGF2ZSB0aGUgdmFsdWUgdGhhdCBzaG91bGQgaGF2ZSBiZWVuXG5cdFx0XHRcdC8vIGluIHBhZ2VYL3BhZ2VZLiBXaGlsZSBwYWdlWC9wYWdlLyBoYXZlIHRoZSB2YWx1ZSAwXG5cdFx0XHRcdHggPSB4IC0gd2luUGFnZVg7XG5cdFx0XHRcdHkgPSB5IC0gd2luUGFnZVk7XG5cdFx0XHR9IGVsc2UgaWYgKCB5IDwgKCBldmVudC5wYWdlWSAtIHdpblBhZ2VZKSB8fCB4IDwgKCBldmVudC5wYWdlWCAtIHdpblBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gU29tZSBBbmRyb2lkIGJyb3dzZXJzIGhhdmUgdG90YWxseSBib2d1cyB2YWx1ZXMgZm9yIGNsaWVudFgvWVxuXHRcdFx0XHQvLyB3aGVuIHNjcm9sbGluZy96b29taW5nIGEgcGFnZS4gRGV0ZWN0YWJsZSBzaW5jZSBjbGllbnRYL2NsaWVudFlcblx0XHRcdFx0Ly8gc2hvdWxkIG5ldmVyIGJlIHNtYWxsZXIgdGhhbiBwYWdlWC9wYWdlWSBtaW51cyBwYWdlIHNjcm9sbFxuXHRcdFx0XHR4ID0gZXZlbnQucGFnZVggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IGV2ZW50LnBhZ2VZIC0gd2luUGFnZVk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHg6IHgsXG5cdFx0XHRcdHk6IHlcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA/XG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcblx0XHRcdFx0bG9jYXRpb24gPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZ2V0TG9jYXRpb24oIGRhdGEgKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRjb29yZHM6IFsgbG9jYXRpb24ueCwgbG9jYXRpb24ueSBdLFxuXHRcdFx0XHRcdFx0b3JpZ2luOiAkKCBldmVudC50YXJnZXQgKVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF1cblx0XHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRoYW5kbGVTd2lwZTogZnVuY3Rpb24oIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICkge1xuXHRcdFx0aWYgKCBzdG9wLnRpbWUgLSBzdGFydC50aW1lIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLmR1cmF0aW9uVGhyZXNob2xkICYmXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMSBdIC0gc3RvcC5jb29yZHNbIDEgXSApIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLnZlcnRpY2FsRGlzdGFuY2VUaHJlc2hvbGQgKSB7XG5cdFx0XHRcdHZhciBkaXJlY3Rpb24gPSBzdGFydC5jb29yZHNbMF0gPiBzdG9wLmNvb3Jkc1sgMCBdID8gXCJzd2lwZWxlZnRcIiA6IFwic3dpcGVyaWdodFwiO1xuXG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgXCJzd2lwZVwiLCAkLkV2ZW50KCBcInN3aXBlXCIsIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0pLCB0cnVlICk7XG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgZGlyZWN0aW9uLCQuRXZlbnQoIGRpcmVjdGlvbiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSApLCB0cnVlICk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0fSxcblxuXHRcdC8vIFRoaXMgc2VydmVzIGFzIGEgZmxhZyB0byBlbnN1cmUgdGhhdCBhdCBtb3N0IG9uZSBzd2lwZSBldmVudCBldmVudCBpc1xuXHRcdC8vIGluIHdvcmsgYXQgYW55IGdpdmVuIHRpbWVcblx0XHRldmVudEluUHJvZ3Jlc3M6IGZhbHNlLFxuXG5cdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cyxcblx0XHRcdFx0dGhpc09iamVjdCA9IHRoaXMsXG5cdFx0XHRcdCR0aGlzID0gJCggdGhpc09iamVjdCApLFxuXHRcdFx0XHRjb250ZXh0ID0ge307XG5cblx0XHRcdC8vIFJldHJpZXZlIHRoZSBldmVudHMgZGF0YSBmb3IgdGhpcyBlbGVtZW50IGFuZCBhZGQgdGhlIHN3aXBlIGNvbnRleHRcblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggIWV2ZW50cyApIHtcblx0XHRcdFx0ZXZlbnRzID0geyBsZW5ndGg6IDAgfTtcblx0XHRcdFx0JC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiwgZXZlbnRzICk7XG5cdFx0XHR9XG5cdFx0XHRldmVudHMubGVuZ3RoKys7XG5cdFx0XHRldmVudHMuc3dpcGUgPSBjb250ZXh0O1xuXG5cdFx0XHRjb250ZXh0LnN0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0XHRcdC8vIEJhaWwgaWYgd2UncmUgYWxyZWFkeSB3b3JraW5nIG9uIGEgc3dpcGUgZXZlbnRcblx0XHRcdFx0aWYgKCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gdHJ1ZTtcblxuXHRcdFx0XHR2YXIgc3RvcCxcblx0XHRcdFx0XHRzdGFydCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdGFydCggZXZlbnQgKSxcblx0XHRcdFx0XHRvcmlnVGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdFx0XHRcdGVtaXR0ZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0aWYgKCAhc3RhcnQgfHwgZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c3RvcCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdG9wKCBldmVudCApO1xuXHRcdFx0XHRcdGlmICggIWVtaXR0ZWQgKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhhbmRsZVN3aXBlKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApO1xuXHRcdFx0XHRcdFx0aWYgKCBlbWl0dGVkICkge1xuXG5cdFx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIHByZXZlbnQgc2Nyb2xsaW5nXG5cdFx0XHRcdFx0aWYgKCBNYXRoLmFicyggc3RhcnQuY29vcmRzWyAwIF0gLSBzdG9wLmNvb3Jkc1sgMCBdICkgPiAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc2Nyb2xsU3VwcmVzc2lvblRocmVzaG9sZCApIHtcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGNvbnRleHQuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZW1pdHRlZCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHRcdFx0Y29udGV4dC5tb3ZlID0gbnVsbDtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQkZG9jdW1lbnQub24oIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKVxuXHRcdFx0XHRcdC5vbmUoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdH07XG5cdFx0XHQkdGhpcy5vbiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0fSxcblxuXHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBldmVudHMsIGNvbnRleHQ7XG5cblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggZXZlbnRzICkge1xuXHRcdFx0XHRjb250ZXh0ID0gZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRkZWxldGUgZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRldmVudHMubGVuZ3RoLS07XG5cdFx0XHRcdGlmICggZXZlbnRzLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdFx0XHQkLnJlbW92ZURhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBjb250ZXh0ICkge1xuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RhcnQgKSB7XG5cdFx0XHRcdFx0JCggdGhpcyApLm9mZiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0Lm1vdmUgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggY29udGV4dC5zdG9wICkge1xuXHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0JC5lYWNoKHtcblx0XHRzd2lwZWxlZnQ6IFwic3dpcGUubGVmdFwiLFxuXHRcdHN3aXBlcmlnaHQ6IFwic3dpcGUucmlnaHRcIlxuXHR9LCBmdW5jdGlvbiggZXZlbnQsIHNvdXJjZUV2ZW50ICkge1xuXG5cdFx0JC5ldmVudC5zcGVjaWFsWyBldmVudCBdID0ge1xuXHRcdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkuYmluZCggc291cmNlRXZlbnQsICQubm9vcCApO1xuXHRcdFx0fSxcblx0XHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLnVuYmluZCggc291cmNlRXZlbnQgKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcbn0pKCBqUXVlcnksIHRoaXMgKTtcbiovXG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgcHJlZml4ZXMgPSBbJ1dlYktpdCcsICdNb3onLCAnTycsICdNcycsICcnXTtcbiAgZm9yICh2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYCR7cHJlZml4ZXNbaV19TXV0YXRpb25PYnNlcnZlcmAgaW4gd2luZG93KSB7XG4gICAgICByZXR1cm4gd2luZG93W2Ake3ByZWZpeGVzW2ldfU11dGF0aW9uT2JzZXJ2ZXJgXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSgpKTtcblxuY29uc3QgdHJpZ2dlcnMgPSAoZWwsIHR5cGUpID0+IHtcbiAgZWwuZGF0YSh0eXBlKS5zcGxpdCgnICcpLmZvckVhY2goaWQgPT4ge1xuICAgICQoYCMke2lkfWApWyB0eXBlID09PSAnY2xvc2UnID8gJ3RyaWdnZXInIDogJ3RyaWdnZXJIYW5kbGVyJ10oYCR7dHlwZX0uemYudHJpZ2dlcmAsIFtlbF0pO1xuICB9KTtcbn07XG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLW9wZW5dIHdpbGwgcmV2ZWFsIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtb3Blbl0nLCBmdW5jdGlvbigpIHtcbiAgdHJpZ2dlcnMoJCh0aGlzKSwgJ29wZW4nKTtcbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NlXSB3aWxsIGNsb3NlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuLy8gSWYgdXNlZCB3aXRob3V0IGEgdmFsdWUgb24gW2RhdGEtY2xvc2VdLCB0aGUgZXZlbnQgd2lsbCBidWJibGUsIGFsbG93aW5nIGl0IHRvIGNsb3NlIGEgcGFyZW50IGNvbXBvbmVudC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NlXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ2Nsb3NlJyk7XG4gIGlmIChpZCkge1xuICAgIHRyaWdnZXJzKCQodGhpcyksICdjbG9zZScpO1xuICB9XG4gIGVsc2Uge1xuICAgICQodGhpcykudHJpZ2dlcignY2xvc2UuemYudHJpZ2dlcicpO1xuICB9XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS10b2dnbGVdIHdpbGwgdG9nZ2xlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZScpO1xuICBpZiAoaWQpIHtcbiAgICB0cmlnZ2VycygkKHRoaXMpLCAndG9nZ2xlJyk7XG4gIH0gZWxzZSB7XG4gICAgJCh0aGlzKS50cmlnZ2VyKCd0b2dnbGUuemYudHJpZ2dlcicpO1xuICB9XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zYWJsZV0gd2lsbCByZXNwb25kIHRvIGNsb3NlLnpmLnRyaWdnZXIgZXZlbnRzLlxuJChkb2N1bWVudCkub24oJ2Nsb3NlLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2FibGVdJywgZnVuY3Rpb24oZSl7XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGxldCBhbmltYXRpb24gPSAkKHRoaXMpLmRhdGEoJ2Nsb3NhYmxlJyk7XG5cbiAgaWYoYW5pbWF0aW9uICE9PSAnJyl7XG4gICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZU91dCgkKHRoaXMpLCBhbmltYXRpb24sIGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgICB9KTtcbiAgfWVsc2V7XG4gICAgJCh0aGlzKS5mYWRlT3V0KCkudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gIH1cbn0pO1xuXG4kKGRvY3VtZW50KS5vbignZm9jdXMuemYudHJpZ2dlciBibHVyLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlLWZvY3VzXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZS1mb2N1cycpO1xuICAkKGAjJHtpZH1gKS50cmlnZ2VySGFuZGxlcigndG9nZ2xlLnpmLnRyaWdnZXInLCBbJCh0aGlzKV0pO1xufSk7XG5cbi8qKlxuKiBGaXJlcyBvbmNlIGFmdGVyIGFsbCBvdGhlciBzY3JpcHRzIGhhdmUgbG9hZGVkXG4qIEBmdW5jdGlvblxuKiBAcHJpdmF0ZVxuKi9cbiQod2luZG93KS5vbignbG9hZCcsICgpID0+IHtcbiAgY2hlY2tMaXN0ZW5lcnMoKTtcbn0pO1xuXG5mdW5jdGlvbiBjaGVja0xpc3RlbmVycygpIHtcbiAgZXZlbnRzTGlzdGVuZXIoKTtcbiAgcmVzaXplTGlzdGVuZXIoKTtcbiAgc2Nyb2xsTGlzdGVuZXIoKTtcbiAgbXV0YXRlTGlzdGVuZXIoKTtcbiAgY2xvc2VtZUxpc3RlbmVyKCk7XG59XG5cbi8vKioqKioqKiogb25seSBmaXJlcyB0aGlzIGZ1bmN0aW9uIG9uY2Ugb24gbG9hZCwgaWYgdGhlcmUncyBzb21ldGhpbmcgdG8gd2F0Y2ggKioqKioqKipcbmZ1bmN0aW9uIGNsb3NlbWVMaXN0ZW5lcihwbHVnaW5OYW1lKSB7XG4gIHZhciB5ZXRpQm94ZXMgPSAkKCdbZGF0YS15ZXRpLWJveF0nKSxcbiAgICAgIHBsdWdOYW1lcyA9IFsnZHJvcGRvd24nLCAndG9vbHRpcCcsICdyZXZlYWwnXTtcblxuICBpZihwbHVnaW5OYW1lKXtcbiAgICBpZih0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ3N0cmluZycpe1xuICAgICAgcGx1Z05hbWVzLnB1c2gocGx1Z2luTmFtZSk7XG4gICAgfWVsc2UgaWYodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwbHVnaW5OYW1lWzBdID09PSAnc3RyaW5nJyl7XG4gICAgICBwbHVnTmFtZXMuY29uY2F0KHBsdWdpbk5hbWUpO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5lcnJvcignUGx1Z2luIG5hbWVzIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgfVxuICBpZih5ZXRpQm94ZXMubGVuZ3RoKXtcbiAgICBsZXQgbGlzdGVuZXJzID0gcGx1Z05hbWVzLm1hcCgobmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIGBjbG9zZW1lLnpmLiR7bmFtZX1gO1xuICAgIH0pLmpvaW4oJyAnKTtcblxuICAgICQod2luZG93KS5vZmYobGlzdGVuZXJzKS5vbihsaXN0ZW5lcnMsIGZ1bmN0aW9uKGUsIHBsdWdpbklkKXtcbiAgICAgIGxldCBwbHVnaW4gPSBlLm5hbWVzcGFjZS5zcGxpdCgnLicpWzBdO1xuICAgICAgbGV0IHBsdWdpbnMgPSAkKGBbZGF0YS0ke3BsdWdpbn1dYCkubm90KGBbZGF0YS15ZXRpLWJveD1cIiR7cGx1Z2luSWR9XCJdYCk7XG5cbiAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICBsZXQgX3RoaXMgPSAkKHRoaXMpO1xuXG4gICAgICAgIF90aGlzLnRyaWdnZXJIYW5kbGVyKCdjbG9zZS56Zi50cmlnZ2VyJywgW190aGlzXSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNpemVMaXN0ZW5lcihkZWJvdW5jZSl7XG4gIGxldCB0aW1lcixcbiAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXJlc2l6ZV0nKTtcbiAgaWYoJG5vZGVzLmxlbmd0aCl7XG4gICAgJCh3aW5kb3cpLm9mZigncmVzaXplLnpmLnRyaWdnZXInKVxuICAgIC5vbigncmVzaXplLnpmLnRyaWdnZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGltZXIpIHsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuXG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICBpZighTXV0YXRpb25PYnNlcnZlcil7Ly9mYWxsYmFjayBmb3IgSUUgOVxuICAgICAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHJlc2l6ZSBldmVudFxuICAgICAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInJlc2l6ZVwiKTtcbiAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsvL2RlZmF1bHQgdGltZSB0byBlbWl0IHJlc2l6ZSBldmVudFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNjcm9sbExpc3RlbmVyKGRlYm91bmNlKXtcbiAgbGV0IHRpbWVyLFxuICAgICAgJG5vZGVzID0gJCgnW2RhdGEtc2Nyb2xsXScpO1xuICBpZigkbm9kZXMubGVuZ3RoKXtcbiAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwuemYudHJpZ2dlcicpXG4gICAgLm9uKCdzY3JvbGwuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUpe1xuICAgICAgaWYodGltZXIpeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG5cbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgc2Nyb2xsIGV2ZW50XG4gICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwic2Nyb2xsXCIpO1xuICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgc2Nyb2xsIGV2ZW50XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbXV0YXRlTGlzdGVuZXIoZGVib3VuY2UpIHtcbiAgICBsZXQgJG5vZGVzID0gJCgnW2RhdGEtbXV0YXRlXScpO1xuICAgIGlmICgkbm9kZXMubGVuZ3RoICYmIE11dGF0aW9uT2JzZXJ2ZXIpe1xuXHRcdFx0Ly90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIG11dGF0ZSBldmVudFxuICAgICAgLy9ubyBJRSA5IG9yIDEwXG5cdFx0XHQkbm9kZXMuZWFjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInKTtcblx0XHRcdH0pO1xuICAgIH1cbiB9XG5cbmZ1bmN0aW9uIGV2ZW50c0xpc3RlbmVyKCkge1xuICBpZighTXV0YXRpb25PYnNlcnZlcil7IHJldHVybiBmYWxzZTsgfVxuICBsZXQgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1yZXNpemVdLCBbZGF0YS1zY3JvbGxdLCBbZGF0YS1tdXRhdGVdJyk7XG5cbiAgLy9lbGVtZW50IGNhbGxiYWNrXG4gIHZhciBsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uID0gZnVuY3Rpb24gKG11dGF0aW9uUmVjb3Jkc0xpc3QpIHtcbiAgICAgIHZhciAkdGFyZ2V0ID0gJChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnRhcmdldCk7XG5cblx0ICAvL3RyaWdnZXIgdGhlIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBlbGVtZW50IGRlcGVuZGluZyBvbiB0eXBlXG4gICAgICBzd2l0Y2ggKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udHlwZSkge1xuXG4gICAgICAgIGNhc2UgXCJhdHRyaWJ1dGVzXCI6XG4gICAgICAgICAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInNjcm9sbFwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG5cdFx0ICBcdCR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInLCBbJHRhcmdldCwgd2luZG93LnBhZ2VZT2Zmc2V0XSk7XG5cdFx0ICB9XG5cdFx0ICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwicmVzaXplXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcblx0XHQgIFx0JHRhcmdldC50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0XSk7XG5cdFx0ICAgfVxuXHRcdCAgaWYgKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJzdHlsZVwiKSB7XG5cdFx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJtdXRhdGVcIik7XG5cdFx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuXHRcdCAgfVxuXHRcdCAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcImNoaWxkTGlzdFwiOlxuXHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIixcIm11dGF0ZVwiKTtcblx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvL25vdGhpbmdcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuICAgICAgLy9mb3IgZWFjaCBlbGVtZW50IHRoYXQgbmVlZHMgdG8gbGlzdGVuIGZvciByZXNpemluZywgc2Nyb2xsaW5nLCBvciBtdXRhdGlvbiBhZGQgYSBzaW5nbGUgb2JzZXJ2ZXJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IG5vZGVzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICB2YXIgZWxlbWVudE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbik7XG4gICAgICAgIGVsZW1lbnRPYnNlcnZlci5vYnNlcnZlKG5vZGVzW2ldLCB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZUZpbHRlcjogW1wiZGF0YS1ldmVudHNcIiwgXCJzdHlsZVwiXSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIFtQSF1cbi8vIEZvdW5kYXRpb24uQ2hlY2tXYXRjaGVycyA9IGNoZWNrV2F0Y2hlcnM7XG5Gb3VuZGF0aW9uLklIZWFyWW91ID0gY2hlY2tMaXN0ZW5lcnM7XG4vLyBGb3VuZGF0aW9uLklTZWVZb3UgPSBzY3JvbGxMaXN0ZW5lcjtcbi8vIEZvdW5kYXRpb24uSUZlZWxZb3UgPSBjbG9zZW1lTGlzdGVuZXI7XG5cbn0oalF1ZXJ5KTtcblxuLy8gZnVuY3Rpb24gZG9tTXV0YXRpb25PYnNlcnZlcihkZWJvdW5jZSkge1xuLy8gICAvLyAhISEgVGhpcyBpcyBjb21pbmcgc29vbiBhbmQgbmVlZHMgbW9yZSB3b3JrOyBub3QgYWN0aXZlICAhISEgLy9cbi8vICAgdmFyIHRpbWVyLFxuLy8gICBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLW11dGF0ZV0nKTtcbi8vICAgLy9cbi8vICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuLy8gICAgIC8vIHZhciBNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcbi8vICAgICAvLyAgIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuLy8gICAgIC8vICAgZm9yICh2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbi8vICAgICAvLyAgICAgaWYgKHByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInIGluIHdpbmRvdykge1xuLy8gICAgIC8vICAgICAgIHJldHVybiB3aW5kb3dbcHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlciddO1xuLy8gICAgIC8vICAgICB9XG4vLyAgICAgLy8gICB9XG4vLyAgICAgLy8gICByZXR1cm4gZmFsc2U7XG4vLyAgICAgLy8gfSgpKTtcbi8vXG4vL1xuLy8gICAgIC8vZm9yIHRoZSBib2R5LCB3ZSBuZWVkIHRvIGxpc3RlbiBmb3IgYWxsIGNoYW5nZXMgZWZmZWN0aW5nIHRoZSBzdHlsZSBhbmQgY2xhc3MgYXR0cmlidXRlc1xuLy8gICAgIHZhciBib2R5T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihib2R5TXV0YXRpb24pO1xuLy8gICAgIGJvZHlPYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTp0cnVlLCBhdHRyaWJ1dGVGaWx0ZXI6W1wic3R5bGVcIiwgXCJjbGFzc1wiXX0pO1xuLy9cbi8vXG4vLyAgICAgLy9ib2R5IGNhbGxiYWNrXG4vLyAgICAgZnVuY3Rpb24gYm9keU11dGF0aW9uKG11dGF0ZSkge1xuLy8gICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIG11dGF0aW9uIGV2ZW50XG4vLyAgICAgICBpZiAodGltZXIpIHsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuLy9cbi8vICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbi8vICAgICAgICAgYm9keU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbi8vICAgICAgICAgJCgnW2RhdGEtbXV0YXRlXScpLmF0dHIoJ2RhdGEtZXZlbnRzJyxcIm11dGF0ZVwiKTtcbi8vICAgICAgIH0sIGRlYm91bmNlIHx8IDE1MCk7XG4vLyAgICAgfVxuLy8gICB9XG4vLyB9XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gRm91bmRhdGlvbiBDb3JlXG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi5jb3JlLmpzJztcbi8vIEZvdW5kYXRpb24gVXRpbGl0aWVzXG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLmJveC5qcyc7XG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzJztcbmltcG9ydCAnZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeS5qcyc7XG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLm1vdGlvbi5qcyc7XG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLm5lc3QuanMnO1xuaW1wb3J0ICdmb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyLmpzJztcbmltcG9ydCAnZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwudG91Y2guanMnO1xuaW1wb3J0ICdmb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyc7XG4vLyBGb3VuZGF0aW9uIFBsdWdpbnMuIEFkZCBvciByZW1vdmUgYXMgbmVlZGVkIGZvciB5b3VyIHNpdGVcbmltcG9ydCAnZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLmRyaWxsZG93bi5qcyc7XG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi5kcm9wZG93bk1lbnUuanMnO1xuaW1wb3J0ICdmb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24ucmVzcG9uc2l2ZU1lbnUuanMnO1xuaW1wb3J0ICdmb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24ub2ZmY2FudmFzLmpzJztcblxuaW1wb3J0IGNzc1ZhcnMgZnJvbSAnY3NzLXZhcnMtcG9ueWZpbGwnO1xuXG5pbXBvcnQganF1ZXJ5IGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQgc29jaWFsU2hhcmUgZnJvbSAnbW9kdWxlcy9zb2NpYWxTaGFyZS5qcyc7XG5pbXBvcnQgY2Fyb3VzZWwgZnJvbSAnbW9kdWxlcy9jYXJvdXNlbC5qcyc7XG5pbXBvcnQgYWNjb3JkaW9uIGZyb20gJ21vZHVsZXMvYWNjb3JkaW9uLmpzJztcblxuY3NzVmFycyh7XG4gIG9uQ29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgIGpxdWVyeSgnI2Nzcy12YXJzLXBvbnlmaWxsJykuYXBwZW5kVG8oJ2hlYWQnKTtcbiAgfSxcbn0pO1xuXG4oZnVuY3Rpb24oJCkge1xuICAvLyBJbml0aWFsaXplIEZvdW5kYXRpb25cbiAgJChkb2N1bWVudCkuZm91bmRhdGlvbigpO1xuXG4gIC8vIEluaXRpYWxpemUgc29jaWFsIHNoYXJlIGZ1bmN0aW9uYWxpdHlcbiAgLy8gUmVwbGFjZSB0aGUgZW1wdHkgc3RyaW5nIHBhcmFtZXRlciB3aXRoIHlvdXIgRmFjZWJvb2sgSURcbiAgc29jaWFsU2hhcmUoJycpO1xuXG4gIC8vIEluaXRpYWxpemUgY2Fyb3VzZWxzXG4gIGNhcm91c2VsKCk7XG5cbiAgLy8gSW5pdGlhbGl6ZSBhY2NvcmRpb25zXG4gIGFjY29yZGlvbigpO1xuXG4gIC8vIEluaXRpYWxpemUgUGx1Z2luc1xuICAkKCcubWFnbmlmaWMtdHJpZ2dlcicpLm1hZ25pZmljUG9wdXAoe1xuICAgIHR5cGU6ICdpbmxpbmUnLFxuICB9KTtcblxuICAkKCcubWVlcmthdC1jdGEnKS5tZWVya2F0KHtcbiAgICBiYWNrZ3JvdW5kOiAncmdiKDIxLCA3NiwgMTAyKSByZXBlYXQteCBsZWZ0IHRvcCcsXG4gICAgaGVpZ2h0OiAnMTIwcHgnLFxuICAgIHdpZHRoOiAnMTAwJScsXG4gICAgcG9zaXRpb246ICdib3R0b20nLFxuICAgIGNsb3NlOiAnLmNsb3NlLW1lZXJrYXQnLFxuICAgIGRvbnRTaG93QWdhaW46ICcuZG9udC1zaG93JyxcbiAgICBhbmltYXRpb25JbjogJ2ZhZGUnLFxuICAgIGFuaW1hdGlvblNwZWVkOiA1MDAsXG4gICAgb3BhY2l0eTogMC45LFxuICB9KTtcbn0pKGpxdWVyeSk7XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5JztcblxuY29uc3QgYWNjb3JkaW9uID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0ICR0b2dnbGVCdXR0b24gPSAkKCdbZGF0YS1hY2NvcmRpb24tdG9nZ2xlXScpO1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFjY29yZGlvbiBjb250YWluZXIgaGVpZ2h0IGRlY2xhcmF0aW9uXG4gICAqL1xuICBmdW5jdGlvbiBwcmVwVG9nZ2xlQ29udGFpbmVyKCkge1xuICAgICR0b2dnbGVCdXR0b24uZWFjaChmdW5jdGlvbihlKSB7XG4gICAgICBjb25zdCAkdGhpcyA9ICQodGhpcyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8taW52YWxpZC10aGlzXG4gICAgICBjb25zdCAkdG9nZ2xlQ29udGVudCA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24tbGlzdF9faXRlbScpXG4gICAgICAgIC5maW5kKCR0b2dnbGVCdXR0b24uZGF0YSgnYWNjb3JkaW9uLXRvZ2dsZScpKTtcbiAgICAgIGNvbnN0IGlzSGlkZGVuID0gJHRvZ2dsZUNvbnRlbnQuYXR0cignYXJpYS1oaWRkZW4nKSA9PT0gJ2ZhbHNlJ1xuICAgICAgICA/IGZhbHNlIDogdHJ1ZTtcbiAgICAgICR0b2dnbGVDb250ZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgZmFsc2UpO1xuICAgICAgJHRvZ2dsZUNvbnRlbnQuY3NzKCdoZWlnaHQnLCAnJyk7XG4gICAgICAkdG9nZ2xlQ29udGVudC5jc3MoJ2hlaWdodCcsICR0b2dnbGVDb250ZW50LmhlaWdodCgpKTtcbiAgICAgICR0b2dnbGVDb250ZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgaXNIaWRkZW4pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgYWNjb3JkaW9uIGNvbnRhaW5lclxuICAgKi9cbiAgZnVuY3Rpb24gdG9nZ2xlKCkge1xuICAgIGNvbnN0IHRvZ2dsZVNlY3Rpb24gPSBmdW5jdGlvbihlKSB7XG4gICAgICBjb25zdCAkdGhpcyA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgIGNvbnNvbGUubG9nKCR0aGlzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAkdGhpcy50b2dnbGVDbGFzcygnYWNjb3JkaW9uLWFjdGl2ZScpO1xuICAgICAgY29uc3QgJGN1cnJlbnRUb2dnbGVDb250YWluZXIgPSAkdGhpcy5jbG9zZXN0KCcuYWNjb3JkaW9uLWxpc3RfX2l0ZW0nKVxuICAgICAgICAuZmluZCgkdGhpcy5kYXRhKCdhY2NvcmRpb24tdG9nZ2xlJykpO1xuICAgICAgY29uc3QgaXNIaWRkZW4gPSAkY3VycmVudFRvZ2dsZUNvbnRhaW5lclxuICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nKSA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogdHJ1ZTtcbiAgICAgICRjdXJyZW50VG9nZ2xlQ29udGFpbmVyLmF0dHIoJ2FyaWEtaGlkZGVuJywgIWlzSGlkZGVuKTtcbiAgICB9O1xuXG4gICAgJHRvZ2dsZUJ1dHRvbi5vbignY2xpY2snLCB0b2dnbGVTZWN0aW9uKTtcbiAgfVxuXG4gICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIHByZXBUb2dnbGVDb250YWluZXIoKTtcbiAgICB0b2dnbGUoKTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbigpIHtcbiAgICBwcmVwVG9nZ2xlQ29udGFpbmVyKCk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYWNjb3JkaW9uO1xuIiwiLyogZXNsaW50LWVudiBicm93c2VyICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQgJ3ZlbmRvci9qcXVlcnkuc2xpY2suanMnO1xuXG5jb25zdCBjYXJvdXNlbCA9IGZ1bmN0aW9uKCkge1xuICAkKCcuanMtY2Fyb3VzZWwnKS5zbGljayh7XG4gICAgc2xpZGVzVG9TaG93OiAyLFxuICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgIGFycm93czogdHJ1ZSxcbiAgICBkb3RzOiB0cnVlLFxuICAgIGZvY3VzT25TZWxlY3Q6IGZhbHNlLFxuICAgIGluZmluaXRlOiB0cnVlLFxuICAgIHJlc3BvbnNpdmU6IFtcbiAgICAgIHtcbiAgICAgICAgYnJlYWtwb2ludDogODAwLFxuICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgIGFycm93czogZmFsc2UsXG4gICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICB9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNhcm91c2VsO1xuIiwiLyogZXNsaW50LWVudiBicm93c2VyICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5cbmNvbnN0IHNvY2lhbFNoYXJlID0gZnVuY3Rpb24oZmJJZCkge1xuICBjb25zdCAkYm9keSA9ICQoJ2JvZHknKTtcblxuICAvLyBGYWNlYm9vayBzaGFyaW5nIHdpdGggdGhlIFNES1xuICAkLmdldFNjcmlwdCgnLy9jb25uZWN0LmZhY2Vib29rLm5ldC9lbl9VUy9zZGsuanMnKS5kb25lKGZ1bmN0aW9uKCkge1xuICAgICRib2R5Lm9uKCdjbGljay5zaGFyZXItZmInLCAnLnNoYXJlci1mYicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGNvbnN0ICRsaW5rID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgbWV0aG9kOiAnZmVlZCcsXG4gICAgICAgIGRpc3BsYXk6ICdwb3B1cCcsXG4gICAgICB9O1xuICAgICAgY29uc3QgbmV3VXJsID0gJGxpbmsuZGF0YSgncmVkaXJlY3QtdG8nKSA/XG4gICAgICAgICAgJGxpbmsuZGF0YSgncmVkaXJlY3QtdG8nKSA6IG51bGw7XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgd2luZG93LkZCLmluaXQoe1xuICAgICAgICBhcHBJZDogZmJJZCxcbiAgICAgICAgeGZibWw6IGZhbHNlLFxuICAgICAgICB2ZXJzaW9uOiAndjIuMCcsXG4gICAgICAgIHN0YXR1czogZmFsc2UsXG4gICAgICAgIGNvb2tpZTogdHJ1ZSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoJGxpbmsuZGF0YSgndGl0bGUnKSkge1xuICAgICAgICBvcHRpb25zLm5hbWUgPSAkbGluay5kYXRhKCd0aXRsZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoJGxpbmsuZGF0YSgndXJsJykpIHtcbiAgICAgICAgb3B0aW9ucy5saW5rID0gJGxpbmsuZGF0YSgndXJsJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICgkbGluay5kYXRhKCdwaWN0dXJlJykpIHtcbiAgICAgICAgb3B0aW9ucy5waWN0dXJlID0gJGxpbmsuZGF0YSgncGljdHVyZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoJGxpbmsuZGF0YSgnZGVzY3JpcHRpb24nKSkge1xuICAgICAgICBvcHRpb25zLmRlc2NyaXB0aW9uID0gJGxpbmsuZGF0YSgnZGVzY3JpcHRpb24nKTtcbiAgICAgIH1cblxuICAgICAgd2luZG93LkZCLnVpKG9wdGlvbnMsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChuZXdVcmwpIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IG5ld1VybDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIFR3aXR0ZXIgc2hhcmluZ1xuICAkYm9keS5vbignY2xpY2suc2hhcmVyLXR3JywgJy5zaGFyZXItdHcnLCBmdW5jdGlvbihlKSB7XG4gICAgY29uc3QgJGxpbmsgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgY29uc3QgdXJsID0gJGxpbmsuZGF0YSgndXJsJyk7XG4gICAgY29uc3QgdGV4dCA9ICRsaW5rLmRhdGEoJ2Rlc2NyaXB0aW9uJyk7XG4gICAgY29uc3QgdmlhID0gJGxpbmsuZGF0YSgnc291cmNlJyk7XG4gICAgbGV0IHR3aXR0ZXJVUkwgPSBgaHR0cHM6Ly90d2l0dGVyLmNvbS9zaGFyZT91cmw9JHtlbmNvZGVVUklDb21wb25lbnQodXJsKX1gO1xuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgaWYgKHRleHQpIHtcbiAgICAgIHR3aXR0ZXJVUkwgKz0gYCZ0ZXh0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpfWA7XG4gICAgfVxuICAgIGlmICh2aWEpIHtcbiAgICAgIHR3aXR0ZXJVUkwgKz0gYCZ2aWE9JHtlbmNvZGVVUklDb21wb25lbnQodmlhKX1gO1xuICAgIH1cbiAgICB3aW5kb3cub3Blbih0d2l0dGVyVVJMLCAndHdlZXQnLFxuICAgICAgICAnd2lkdGg9NTAwLGhlaWdodD0zODQsbWVudWJhcj1ubyxzdGF0dXM9bm8sdG9vbGJhcj1ubycpO1xuICB9KTtcblxuICAvLyBMaW5rZWRJbiBzaGFyaW5nXG4gICRib2R5Lm9uKCdjbGljay5zaGFyZXItbGknLCAnLnNoYXJlci1saScsIGZ1bmN0aW9uKGUpIHtcbiAgICBjb25zdCAkbGluayA9ICQoZS50YXJnZXQpO1xuICAgIGNvbnN0IHVybCA9ICRsaW5rLmRhdGEoJ3VybCcpO1xuICAgIGNvbnN0IHRpdGxlID0gJGxpbmsuZGF0YSgndGl0bGUnKTtcbiAgICBjb25zdCBzdW1tYXJ5ID0gJGxpbmsuZGF0YSgnZGVzY3JpcHRpb24nKTtcbiAgICBjb25zdCBzb3VyY2UgPSAkbGluay5kYXRhKCdzb3VyY2UnKTtcbiAgICBsZXQgbGlua2VkaW5VUkwgPSAnaHR0cHM6Ly93d3cubGlua2VkaW4uY29tL3NoYXJlQXJ0aWNsZT9taW5pPXRydWUmdXJsPScgK1xuICAgICAgICBlbmNvZGVVUklDb21wb25lbnQodXJsKTtcblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGlmICh0aXRsZSkge1xuICAgICAgbGlua2VkaW5VUkwgKz0gYCZ0aXRsZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aXRsZSl9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlua2VkaW5VUkwgKz0gJyZ0aXRsZT0nO1xuICAgIH1cblxuICAgIGlmIChzdW1tYXJ5KSB7XG4gICAgICBsaW5rZWRpblVSTCArPVxuICAgICAgICAgIGAmc3VtbWFyeT0ke2VuY29kZVVSSUNvbXBvbmVudChzdW1tYXJ5LnN1YnN0cmluZygwLCAyNTYpKX1gO1xuICAgIH1cblxuICAgIGlmIChzb3VyY2UpIHtcbiAgICAgIGxpbmtlZGluVVJMICs9IGAmc291cmNlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNvdXJjZSl9YDtcbiAgICB9XG5cbiAgICB3aW5kb3cub3BlbihsaW5rZWRpblVSTCwgJ2xpbmtlZGluJyxcbiAgICAgICAgJ3dpZHRoPTUyMCxoZWlnaHQ9NTcwLG1lbnViYXI9bm8sc3RhdHVzPW5vLHRvb2xiYXI9bm8nKTtcbiAgfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBzb2NpYWxTaGFyZTtcbiIsIi8qXG4gICAgIF8gXyAgICAgIF8gICAgICAgX1xuIF9fX3wgKF8pIF9fX3wgfCBfXyAgKF8pX19fXG4vIF9ffCB8IHwvIF9ffCB8LyAvICB8IC8gX198XG5cXF9fIFxcIHwgfCAoX198ICAgPCBfIHwgXFxfXyBcXFxufF9fXy9ffF98XFxfX198X3xcXF8oXykvIHxfX18vXG4gICAgICAgICAgICAgICAgICAgfF9fL1xuXG4gVmVyc2lvbjogMS41LjBcbiAgQXV0aG9yOiBLZW4gV2hlZWxlclxuIFdlYnNpdGU6IGh0dHA6Ly9rZW53aGVlbGVyLmdpdGh1Yi5pb1xuICAgIERvY3M6IGh0dHA6Ly9rZW53aGVlbGVyLmdpdGh1Yi5pby9zbGlja1xuICAgIFJlcG86IGh0dHA6Ly9naXRodWIuY29tL2tlbndoZWVsZXIvc2xpY2tcbiAgSXNzdWVzOiBodHRwOi8vZ2l0aHViLmNvbS9rZW53aGVlbGVyL3NsaWNrL2lzc3Vlc1xuXG4gKi9cbi8qIGdsb2JhbCB3aW5kb3csIGRvY3VtZW50LCBkZWZpbmUsIGpRdWVyeSwgc2V0SW50ZXJ2YWwsIGNsZWFySW50ZXJ2YWwgKi9cbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xuICAgIH1cblxufShmdW5jdGlvbigkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIHZhciBTbGljayA9IHdpbmRvdy5TbGljayB8fCB7fTtcblxuICAgIFNsaWNrID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBpbnN0YW5jZVVpZCA9IDA7XG5cbiAgICAgICAgZnVuY3Rpb24gU2xpY2soZWxlbWVudCwgc2V0dGluZ3MpIHtcblxuICAgICAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRhdGFTZXR0aW5ncywgcmVzcG9uc2l2ZVNldHRpbmdzLCBicmVha3BvaW50O1xuXG4gICAgICAgICAgICBfLmRlZmF1bHRzID0ge1xuICAgICAgICAgICAgICAgIGFjY2Vzc2liaWxpdHk6IHRydWUsXG4gICAgICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGVuZEFycm93czogJChlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBhcHBlbmREb3RzOiAkKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGFycm93czogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhc05hdkZvcjogbnVsbCxcbiAgICAgICAgICAgICAgICBwcmV2QXJyb3c6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXJvbGU9XCJub25lXCIgY2xhc3M9XCJzbGljay1wcmV2XCIgYXJpYS1sYWJlbD1cInByZXZpb3VzXCI+UHJldmlvdXM8L2J1dHRvbj4nLFxuICAgICAgICAgICAgICAgIG5leHRBcnJvdzogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtcm9sZT1cIm5vbmVcIiBjbGFzcz1cInNsaWNrLW5leHRcIiBhcmlhLWxhYmVsPVwibmV4dFwiPk5leHQ8L2J1dHRvbj4nLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhdXRvcGxheVNwZWVkOiAzMDAwLFxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc1MHB4JyxcbiAgICAgICAgICAgICAgICBjc3NFYXNlOiAnZWFzZScsXG4gICAgICAgICAgICAgICAgY3VzdG9tUGFnaW5nOiBmdW5jdGlvbihzbGlkZXIsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXJvbGU9XCJub25lXCI+JyArIChpICsgMSkgKyAnPC9idXR0b24+JztcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRvdHNDbGFzczogJ3NsaWNrLWRvdHMnLFxuICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlYXNpbmc6ICdsaW5lYXInLFxuICAgICAgICAgICAgICAgIGVkZ2VGcmljdGlvbjogMC4zNSxcbiAgICAgICAgICAgICAgICBmYWRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBmb2N1c09uU2VsZWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbml0aWFsU2xpZGU6IDAsXG4gICAgICAgICAgICAgICAgbGF6eUxvYWQ6ICdvbmRlbWFuZCcsXG4gICAgICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBhdXNlT25Ib3ZlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXVzZU9uRG90c0hvdmVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZXNwb25kVG86ICd3aW5kb3cnLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IG51bGwsXG4gICAgICAgICAgICAgICAgcm93czogMSxcbiAgICAgICAgICAgICAgICBydGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNsaWRlOiAnJyxcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJSb3c6IDEsXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgICAgIHNwZWVkOiA1MDAsXG4gICAgICAgICAgICAgICAgc3dpcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc3dpcGVUb1NsaWRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0b3VjaE1vdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgdG91Y2hUaHJlc2hvbGQ6IDUsXG4gICAgICAgICAgICAgICAgdXNlQ1NTOiB0cnVlLFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlV2lkdGg6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZlcnRpY2FsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbFN3aXBpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHdhaXRGb3JBbmltYXRlOiB0cnVlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBfLmluaXRpYWxzID0ge1xuICAgICAgICAgICAgICAgIGFuaW1hdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGF1dG9QbGF5VGltZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgY3VycmVudERpcmVjdGlvbjogMCxcbiAgICAgICAgICAgICAgICBjdXJyZW50TGVmdDogbnVsbCxcbiAgICAgICAgICAgICAgICBjdXJyZW50U2xpZGU6IDAsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAxLFxuICAgICAgICAgICAgICAgICRkb3RzOiBudWxsLFxuICAgICAgICAgICAgICAgIGxpc3RXaWR0aDogbnVsbCxcbiAgICAgICAgICAgICAgICBsaXN0SGVpZ2h0OiBudWxsLFxuICAgICAgICAgICAgICAgIGxvYWRJbmRleDogMCxcbiAgICAgICAgICAgICAgICAkbmV4dEFycm93OiBudWxsLFxuICAgICAgICAgICAgICAgICRwcmV2QXJyb3c6IG51bGwsXG4gICAgICAgICAgICAgICAgc2xpZGVDb3VudDogbnVsbCxcbiAgICAgICAgICAgICAgICBzbGlkZVdpZHRoOiBudWxsLFxuICAgICAgICAgICAgICAgICRzbGlkZVRyYWNrOiBudWxsLFxuICAgICAgICAgICAgICAgICRzbGlkZXM6IG51bGwsXG4gICAgICAgICAgICAgICAgc2xpZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2xpZGVPZmZzZXQ6IDAsXG4gICAgICAgICAgICAgICAgc3dpcGVMZWZ0OiBudWxsLFxuICAgICAgICAgICAgICAgICRsaXN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHRvdWNoT2JqZWN0OiB7fSxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1zRW5hYmxlZDogZmFsc2VcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICQuZXh0ZW5kKF8sIF8uaW5pdGlhbHMpO1xuXG4gICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9IG51bGw7XG4gICAgICAgICAgICBfLmFuaW1Qcm9wID0gbnVsbDtcbiAgICAgICAgICAgIF8uYnJlYWtwb2ludHMgPSBbXTtcbiAgICAgICAgICAgIF8uYnJlYWtwb2ludFNldHRpbmdzID0gW107XG4gICAgICAgICAgICBfLmNzc1RyYW5zaXRpb25zID0gZmFsc2U7XG4gICAgICAgICAgICBfLmhpZGRlbiA9ICdoaWRkZW4nO1xuICAgICAgICAgICAgXy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF8ucG9zaXRpb25Qcm9wID0gbnVsbDtcbiAgICAgICAgICAgIF8ucmVzcG9uZFRvID0gbnVsbDtcbiAgICAgICAgICAgIF8ucm93Q291bnQgPSAxO1xuICAgICAgICAgICAgXy5zaG91bGRDbGljayA9IHRydWU7XG4gICAgICAgICAgICBfLiRzbGlkZXIgPSAkKGVsZW1lbnQpO1xuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBudWxsO1xuICAgICAgICAgICAgXy50cmFuc2Zvcm1UeXBlID0gbnVsbDtcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSBudWxsO1xuICAgICAgICAgICAgXy52aXNpYmlsaXR5Q2hhbmdlID0gJ3Zpc2liaWxpdHljaGFuZ2UnO1xuICAgICAgICAgICAgXy53aW5kb3dXaWR0aCA9IDA7XG4gICAgICAgICAgICBfLndpbmRvd1RpbWVyID0gbnVsbDtcblxuICAgICAgICAgICAgZGF0YVNldHRpbmdzID0gJChlbGVtZW50KS5kYXRhKCdzbGljaycpIHx8IHt9O1xuXG4gICAgICAgICAgICBfLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgXy5kZWZhdWx0cywgZGF0YVNldHRpbmdzLCBzZXR0aW5ncyk7XG5cbiAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5vcHRpb25zLmluaXRpYWxTbGlkZTtcblxuICAgICAgICAgICAgXy5vcmlnaW5hbFNldHRpbmdzID0gXy5vcHRpb25zO1xuICAgICAgICAgICAgcmVzcG9uc2l2ZVNldHRpbmdzID0gXy5vcHRpb25zLnJlc3BvbnNpdmUgfHwgbnVsbDtcblxuICAgICAgICAgICAgaWYgKHJlc3BvbnNpdmVTZXR0aW5ncyAmJiByZXNwb25zaXZlU2V0dGluZ3MubGVuZ3RoID4gLTEpIHtcbiAgICAgICAgICAgICAgICBfLnJlc3BvbmRUbyA9IF8ub3B0aW9ucy5yZXNwb25kVG8gfHwgJ3dpbmRvdyc7XG4gICAgICAgICAgICAgICAgZm9yIChicmVha3BvaW50IGluIHJlc3BvbnNpdmVTZXR0aW5ncykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2l2ZVNldHRpbmdzLmhhc093blByb3BlcnR5KGJyZWFrcG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRzLnB1c2gocmVzcG9uc2l2ZVNldHRpbmdzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnRdLmJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3NbcmVzcG9uc2l2ZVNldHRpbmdzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50XS5icmVha3BvaW50XSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2l2ZVNldHRpbmdzW2JyZWFrcG9pbnRdLnNldHRpbmdzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF8uYnJlYWtwb2ludHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMubW9iaWxlRmlyc3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhIC0gYjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiIC0gYTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50Lm1vekhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBfLmhpZGRlbiA9ICdtb3pIaWRkZW4nO1xuICAgICAgICAgICAgICAgIF8udmlzaWJpbGl0eUNoYW5nZSA9ICdtb3p2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50Lm1zSGlkZGVuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIF8uaGlkZGVuID0gJ21zSGlkZGVuJztcbiAgICAgICAgICAgICAgICBfLnZpc2liaWxpdHlDaGFuZ2UgPSAnbXN2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LndlYmtpdEhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBfLmhpZGRlbiA9ICd3ZWJraXRIaWRkZW4nO1xuICAgICAgICAgICAgICAgIF8udmlzaWJpbGl0eUNoYW5nZSA9ICd3ZWJraXR2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy5hdXRvUGxheSA9ICQucHJveHkoXy5hdXRvUGxheSwgXyk7XG4gICAgICAgICAgICBfLmF1dG9QbGF5Q2xlYXIgPSAkLnByb3h5KF8uYXV0b1BsYXlDbGVhciwgXyk7XG4gICAgICAgICAgICBfLmNoYW5nZVNsaWRlID0gJC5wcm94eShfLmNoYW5nZVNsaWRlLCBfKTtcbiAgICAgICAgICAgIF8uY2xpY2tIYW5kbGVyID0gJC5wcm94eShfLmNsaWNrSGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLnNlbGVjdEhhbmRsZXIgPSAkLnByb3h5KF8uc2VsZWN0SGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLnNldFBvc2l0aW9uID0gJC5wcm94eShfLnNldFBvc2l0aW9uLCBfKTtcbiAgICAgICAgICAgIF8uc3dpcGVIYW5kbGVyID0gJC5wcm94eShfLnN3aXBlSGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLmRyYWdIYW5kbGVyID0gJC5wcm94eShfLmRyYWdIYW5kbGVyLCBfKTtcbiAgICAgICAgICAgIF8ua2V5SGFuZGxlciA9ICQucHJveHkoXy5rZXlIYW5kbGVyLCBfKTtcbiAgICAgICAgICAgIF8uYXV0b1BsYXlJdGVyYXRvciA9ICQucHJveHkoXy5hdXRvUGxheUl0ZXJhdG9yLCBfKTtcblxuICAgICAgICAgICAgXy5pbnN0YW5jZVVpZCA9IGluc3RhbmNlVWlkKys7XG5cbiAgICAgICAgICAgIC8vIEEgc2ltcGxlIHdheSB0byBjaGVjayBmb3IgSFRNTCBzdHJpbmdzXG4gICAgICAgICAgICAvLyBTdHJpY3QgSFRNTCByZWNvZ25pdGlvbiAobXVzdCBzdGFydCB3aXRoIDwpXG4gICAgICAgICAgICAvLyBFeHRyYWN0ZWQgZnJvbSBqUXVlcnkgdjEuMTEgc291cmNlXG4gICAgICAgICAgICBfLmh0bWxFeHByID0gL14oPzpcXHMqKDxbXFx3XFxXXSs+KVtePl0qKSQvO1xuXG4gICAgICAgICAgICBfLmluaXQoKTtcblxuICAgICAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUodHJ1ZSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBTbGljaztcblxuICAgIH0oKSk7XG5cbiAgICBTbGljay5wcm90b3R5cGUuYWRkU2xpZGUgPSBTbGljay5wcm90b3R5cGUuc2xpY2tBZGQgPSBmdW5jdGlvbihtYXJrdXAsIGluZGV4LCBhZGRCZWZvcmUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgYWRkQmVmb3JlID0gaW5kZXg7XG4gICAgICAgICAgICBpbmRleCA9IG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPCAwIHx8IChpbmRleCA+PSBfLnNsaWRlQ291bnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBfLnVubG9hZCgpO1xuXG4gICAgICAgIGlmICh0eXBlb2YoaW5kZXgpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwICYmIF8uJHNsaWRlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFkZEJlZm9yZSkge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5pbnNlcnRCZWZvcmUoXy4kc2xpZGVzLmVxKGluZGV4KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5pbnNlcnRBZnRlcihfLiRzbGlkZXMuZXEoaW5kZXgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhZGRCZWZvcmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkucHJlcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXMgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suYXBwZW5kKF8uJHNsaWRlcyk7XG5cbiAgICAgICAgXy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICQoZWxlbWVudCkuYXR0cignZGF0YS1zbGljay1pbmRleCcsIGluZGV4KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBfLiRzbGlkZXM7XG5cbiAgICAgICAgXy5yZWluaXQoKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYW5pbWF0ZUhlaWdodCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIGlmIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID09PSAxICYmIF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5vdXRlckhlaWdodCh0cnVlKTtcbiAgICAgICAgICAgIF8uJGxpc3QuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0YXJnZXRIZWlnaHRcbiAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFuaW1hdGVTbGlkZSA9IGZ1bmN0aW9uKHRhcmdldExlZnQsIGNhbGxiYWNrKSB7XG5cbiAgICAgICAgdmFyIGFuaW1Qcm9wcyA9IHt9LFxuICAgICAgICAgICAgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hbmltYXRlSGVpZ2h0KCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUgJiYgXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IC10YXJnZXRMZWZ0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLnRyYW5zZm9ybXNFbmFibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0YXJnZXRMZWZ0XG4gICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGFyZ2V0TGVmdFxuICAgICAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCwgXy5vcHRpb25zLmVhc2luZywgY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uY3VycmVudExlZnQgPSAtKF8uY3VycmVudExlZnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkKHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbVN0YXJ0OiBfLmN1cnJlbnRMZWZ0XG4gICAgICAgICAgICAgICAgfSkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1TdGFydDogdGFyZ2V0TGVmdFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IF8ub3B0aW9ucy5zcGVlZCxcbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiBfLm9wdGlvbnMuZWFzaW5nLFxuICAgICAgICAgICAgICAgICAgICBzdGVwOiBmdW5jdGlvbihub3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdyA9IE1hdGguY2VpbChub3cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlKCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgKyAncHgsIDBweCknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKGFuaW1Qcm9wcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUoMHB4LCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgKyAncHgpJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhhbmltUHJvcHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIF8uYXBwbHlUcmFuc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IE1hdGguY2VpbCh0YXJnZXRMZWZ0KTtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUzZCgnICsgdGFyZ2V0TGVmdCArICdweCwgMHB4LCAwcHgpJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlM2QoMHB4LCcgKyB0YXJnZXRMZWZ0ICsgJ3B4LCAwcHgpJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MoYW5pbVByb3BzKTtcblxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBfLmRpc2FibGVUcmFuc2l0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFzTmF2Rm9yID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgYXNOYXZGb3IgPSBfLm9wdGlvbnMuYXNOYXZGb3IgIT09IG51bGwgPyAkKF8ub3B0aW9ucy5hc05hdkZvcikuc2xpY2soJ2dldFNsaWNrJykgOiBudWxsO1xuICAgICAgICBpZiAoYXNOYXZGb3IgIT09IG51bGwpIGFzTmF2Rm9yLnNsaWRlSGFuZGxlcihpbmRleCwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hcHBseVRyYW5zaXRpb24gPSBmdW5jdGlvbihzbGlkZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRyYW5zaXRpb24gPSB7fTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uW18udHJhbnNpdGlvblR5cGVdID0gXy50cmFuc2Zvcm1UeXBlICsgJyAnICsgXy5vcHRpb25zLnNwZWVkICsgJ21zICcgKyBfLm9wdGlvbnMuY3NzRWFzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyYW5zaXRpb25bXy50cmFuc2l0aW9uVHlwZV0gPSAnb3BhY2l0eSAnICsgXy5vcHRpb25zLnNwZWVkICsgJ21zICcgKyBfLm9wdGlvbnMuY3NzRWFzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHRyYW5zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlKS5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXV0b1BsYXkgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uYXV0b1BsYXlUaW1lcikge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChfLmF1dG9QbGF5VGltZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgJiYgXy5wYXVzZWQgIT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uYXV0b1BsYXlUaW1lciA9IHNldEludGVydmFsKF8uYXV0b1BsYXlJdGVyYXRvcixcbiAgICAgICAgICAgICAgICBfLm9wdGlvbnMuYXV0b3BsYXlTcGVlZCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXV0b1BsYXlDbGVhciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcbiAgICAgICAgaWYgKF8uYXV0b1BsYXlUaW1lcikge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChfLmF1dG9QbGF5VGltZXIpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmF1dG9QbGF5SXRlcmF0b3IgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgaWYgKF8uZGlyZWN0aW9uID09PSAxKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoKF8uY3VycmVudFNsaWRlICsgMSkgPT09IF8uc2xpZGVDb3VudCAtXG4gICAgICAgICAgICAgICAgICAgIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5kaXJlY3Rpb24gPSAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGlmICgoXy5jdXJyZW50U2xpZGUgLSAxID09PSAwKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIF8uZGlyZWN0aW9uID0gMTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlIC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkQXJyb3dzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy4kcHJldkFycm93ID0gJChfLm9wdGlvbnMucHJldkFycm93KTtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdyA9ICQoXy5vcHRpb25zLm5leHRBcnJvdyk7XG5cbiAgICAgICAgICAgIGlmIChfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLnByZXZBcnJvdykpIHtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYXBwZW5kVG8oXy5vcHRpb25zLmFwcGVuZEFycm93cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLm5leHRBcnJvdykpIHtcbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cuYXBwZW5kVG8oXy5vcHRpb25zLmFwcGVuZEFycm93cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5idWlsZERvdHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBpLCBkb3RTdHJpbmc7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgZG90U3RyaW5nID0gJzx1bCBjbGFzcz1cIicgKyBfLm9wdGlvbnMuZG90c0NsYXNzICsgJ1wiPic7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPD0gXy5nZXREb3RDb3VudCgpOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBkb3RTdHJpbmcgKz0gJzxsaT4nICsgXy5vcHRpb25zLmN1c3RvbVBhZ2luZy5jYWxsKHRoaXMsIF8sIGkpICsgJzwvbGk+JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG90U3RyaW5nICs9ICc8L3VsPic7XG5cbiAgICAgICAgICAgIF8uJGRvdHMgPSAkKGRvdFN0cmluZykuYXBwZW5kVG8oXG4gICAgICAgICAgICAgICAgXy5vcHRpb25zLmFwcGVuZERvdHMpO1xuXG4gICAgICAgICAgICBfLiRkb3RzLmZpbmQoJ2xpJykuZmlyc3QoKS5hZGRDbGFzcygnc2xpY2stYWN0aXZlJykuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkT3V0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlci5jaGlsZHJlbihcbiAgICAgICAgICAgICc6bm90KC5zbGljay1jbG9uZWQpJykuYWRkQ2xhc3MoXG4gICAgICAgICAgICAnc2xpY2stc2xpZGUnKTtcbiAgICAgICAgXy5zbGlkZUNvdW50ID0gXy4kc2xpZGVzLmxlbmd0aDtcblxuICAgICAgICBfLiRzbGlkZXMuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hdHRyKCdkYXRhLXNsaWNrLWluZGV4JywgaW5kZXgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcblxuICAgICAgICBfLiRzbGlkZXIuYWRkQ2xhc3MoJ3NsaWNrLXNsaWRlcicpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2sgPSAoXy5zbGlkZUNvdW50ID09PSAwKSA/XG4gICAgICAgICAgICAkKCc8ZGl2IGNsYXNzPVwic2xpY2stdHJhY2tcIi8+JykuYXBwZW5kVG8oXy4kc2xpZGVyKSA6XG4gICAgICAgICAgICBfLiRzbGlkZXMud3JhcEFsbCgnPGRpdiBjbGFzcz1cInNsaWNrLXRyYWNrXCIvPicpLnBhcmVudCgpO1xuXG4gICAgICAgIF8uJGxpc3QgPSBfLiRzbGlkZVRyYWNrLndyYXAoXG4gICAgICAgICAgICAnPGRpdiBhcmlhLWxpdmU9XCJwb2xpdGVcIiBjbGFzcz1cInNsaWNrLWxpc3RcIi8+JykucGFyZW50KCk7XG4gICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKCdvcGFjaXR5JywgMCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlIHx8IF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICAkKCdpbWdbZGF0YS1sYXp5XScsIF8uJHNsaWRlcikubm90KCdbc3JjXScpLmFkZENsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICAgICAgXy5zZXR1cEluZmluaXRlKCk7XG5cbiAgICAgICAgXy5idWlsZEFycm93cygpO1xuXG4gICAgICAgIF8uYnVpbGREb3RzKCk7XG5cbiAgICAgICAgXy51cGRhdGVEb3RzKCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRsaXN0LnByb3AoJ3RhYkluZGV4JywgMCk7XG4gICAgICAgIH1cblxuICAgICAgICBfLnNldFNsaWRlQ2xhc3Nlcyh0eXBlb2YgdGhpcy5jdXJyZW50U2xpZGUgPT09ICdudW1iZXInID8gdGhpcy5jdXJyZW50U2xpZGUgOiAwKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRyYWdnYWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kbGlzdC5hZGRDbGFzcygnZHJhZ2dhYmxlJyk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYnVpbGRSb3dzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBhLCBiLCBjLCBuZXdTbGlkZXMsIG51bU9mU2xpZGVzLCBvcmlnaW5hbFNsaWRlcyxzbGlkZXNQZXJTZWN0aW9uO1xuXG4gICAgICAgIG5ld1NsaWRlcyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgb3JpZ2luYWxTbGlkZXMgPSBfLiRzbGlkZXIuY2hpbGRyZW4oKTtcblxuICAgICAgICBpZihfLm9wdGlvbnMucm93cyA+IDEpIHtcbiAgICAgICAgICAgIHNsaWRlc1BlclNlY3Rpb24gPSBfLm9wdGlvbnMuc2xpZGVzUGVyUm93ICogXy5vcHRpb25zLnJvd3M7XG4gICAgICAgICAgICBudW1PZlNsaWRlcyA9IE1hdGguY2VpbChcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNsaWRlcy5sZW5ndGggLyBzbGlkZXNQZXJTZWN0aW9uXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBmb3IoYSA9IDA7IGEgPCBudW1PZlNsaWRlczsgYSsrKXtcbiAgICAgICAgICAgICAgICB2YXIgc2xpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICBmb3IoYiA9IDA7IGIgPCBfLm9wdGlvbnMucm93czsgYisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGMgPSAwOyBjIDwgXy5vcHRpb25zLnNsaWRlc1BlclJvdzsgYysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gKGEgKiBzbGlkZXNQZXJTZWN0aW9uICsgKChiICogXy5vcHRpb25zLnNsaWRlc1BlclJvdykgKyBjKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlLmFwcGVuZENoaWxkKHJvdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1NsaWRlcy5hcHBlbmRDaGlsZChzbGlkZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXy4kc2xpZGVyLmh0bWwobmV3U2xpZGVzKTtcbiAgICAgICAgICAgIF8uJHNsaWRlci5jaGlsZHJlbigpLmNoaWxkcmVuKCkuY2hpbGRyZW4oKVxuICAgICAgICAgICAgICAgIC53aWR0aCgoMTAwIC8gXy5vcHRpb25zLnNsaWRlc1BlclJvdykgKyBcIiVcIilcbiAgICAgICAgICAgICAgICAuY3NzKHsnZGlzcGxheSc6ICdpbmxpbmUtYmxvY2snfSk7XG4gICAgICAgIH07XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNoZWNrUmVzcG9uc2l2ZSA9IGZ1bmN0aW9uKGluaXRpYWwpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBicmVha3BvaW50LCB0YXJnZXRCcmVha3BvaW50LCByZXNwb25kVG9XaWR0aDtcbiAgICAgICAgdmFyIHNsaWRlcldpZHRoID0gXy4kc2xpZGVyLndpZHRoKCk7XG4gICAgICAgIHZhciB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIHx8ICQod2luZG93KS53aWR0aCgpO1xuICAgICAgICBpZiAoXy5yZXNwb25kVG8gPT09ICd3aW5kb3cnKSB7XG4gICAgICAgICAgICByZXNwb25kVG9XaWR0aCA9IHdpbmRvd1dpZHRoO1xuICAgICAgICB9IGVsc2UgaWYgKF8ucmVzcG9uZFRvID09PSAnc2xpZGVyJykge1xuICAgICAgICAgICAgcmVzcG9uZFRvV2lkdGggPSBzbGlkZXJXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChfLnJlc3BvbmRUbyA9PT0gJ21pbicpIHtcbiAgICAgICAgICAgIHJlc3BvbmRUb1dpZHRoID0gTWF0aC5taW4od2luZG93V2lkdGgsIHNsaWRlcldpZHRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9yaWdpbmFsU2V0dGluZ3MucmVzcG9uc2l2ZSAmJiBfLm9yaWdpbmFsU2V0dGluZ3NcbiAgICAgICAgICAgIC5yZXNwb25zaXZlLmxlbmd0aCA+IC0xICYmIF8ub3JpZ2luYWxTZXR0aW5ncy5yZXNwb25zaXZlICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKGJyZWFrcG9pbnQgaW4gXy5icmVha3BvaW50cykge1xuICAgICAgICAgICAgICAgIGlmIChfLmJyZWFrcG9pbnRzLmhhc093blByb3BlcnR5KGJyZWFrcG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLm9yaWdpbmFsU2V0dGluZ3MubW9iaWxlRmlyc3QgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uZFRvV2lkdGggPCBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uZFRvV2lkdGggPiBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRCcmVha3BvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uYWN0aXZlQnJlYWtwb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0QnJlYWtwb2ludCAhPT0gXy5hY3RpdmVCcmVha3BvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5icmVha3BvaW50U2V0dGluZ3NbdGFyZ2V0QnJlYWtwb2ludF0gPT09ICd1bnNsaWNrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8udW5zbGljaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgXy5vcmlnaW5hbFNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnRdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbCA9PT0gdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ucmVmcmVzaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hY3RpdmVCcmVha3BvaW50ID0gdGFyZ2V0QnJlYWtwb2ludDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uYnJlYWtwb2ludFNldHRpbmdzW3RhcmdldEJyZWFrcG9pbnRdID09PSAndW5zbGljaycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8udW5zbGljaygpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8ub3JpZ2luYWxTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5yZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChfLmFjdGl2ZUJyZWFrcG9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hY3RpdmVCcmVha3BvaW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gXy5vcmlnaW5hbFNldHRpbmdzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbCA9PT0gdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5vcHRpb25zLmluaXRpYWxTbGlkZTtcbiAgICAgICAgICAgICAgICAgICAgXy5yZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2hhbmdlU2xpZGUgPSBmdW5jdGlvbihldmVudCwgZG9udEFuaW1hdGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgaW5kZXhPZmZzZXQsIHNsaWRlT2Zmc2V0LCB1bmV2ZW5PZmZzZXQ7XG5cbiAgICAgICAgLy8gSWYgdGFyZ2V0IGlzIGEgbGluaywgcHJldmVudCBkZWZhdWx0IGFjdGlvbi5cbiAgICAgICAgJHRhcmdldC5pcygnYScpICYmIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdW5ldmVuT2Zmc2V0ID0gKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCk7XG4gICAgICAgIGluZGV4T2Zmc2V0ID0gdW5ldmVuT2Zmc2V0ID8gMCA6IChfLnNsaWRlQ291bnQgLSBfLmN1cnJlbnRTbGlkZSkgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5kYXRhLm1lc3NhZ2UpIHtcblxuICAgICAgICAgICAgY2FzZSAncHJldmlvdXMnOlxuICAgICAgICAgICAgICAgIHNsaWRlT2Zmc2V0ID0gaW5kZXhPZmZzZXQgPT09IDAgPyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgOiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gaW5kZXhPZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jdXJyZW50U2xpZGUgLSBzbGlkZU9mZnNldCwgZmFsc2UsIGRvbnRBbmltYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ25leHQnOlxuICAgICAgICAgICAgICAgIHNsaWRlT2Zmc2V0ID0gaW5kZXhPZmZzZXQgPT09IDAgPyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgOiBpbmRleE9mZnNldDtcbiAgICAgICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihfLmN1cnJlbnRTbGlkZSArIHNsaWRlT2Zmc2V0LCBmYWxzZSwgZG9udEFuaW1hdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnaW5kZXgnOlxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGV2ZW50LmRhdGEuaW5kZXggPT09IDAgPyAwIDpcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuZGF0YS5pbmRleCB8fCAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuaW5kZXgoKSAqIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcblxuICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY2hlY2tOYXZpZ2FibGUoaW5kZXgpLCBmYWxzZSwgZG9udEFuaW1hdGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jaGVja05hdmlnYWJsZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgbmF2aWdhYmxlcywgcHJldk5hdmlnYWJsZTtcblxuICAgICAgICBuYXZpZ2FibGVzID0gXy5nZXROYXZpZ2FibGVJbmRleGVzKCk7XG4gICAgICAgIHByZXZOYXZpZ2FibGUgPSAwO1xuICAgICAgICBpZiAoaW5kZXggPiBuYXZpZ2FibGVzW25hdmlnYWJsZXMubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICAgIGluZGV4ID0gbmF2aWdhYmxlc1tuYXZpZ2FibGVzLmxlbmd0aCAtIDFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgbiBpbiBuYXZpZ2FibGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgbmF2aWdhYmxlc1tuXSkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IHByZXZOYXZpZ2FibGU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwcmV2TmF2aWdhYmxlID0gbmF2aWdhYmxlc1tuXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbmRleDtcbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNsZWFuVXBFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICQoJ2xpJywgXy4kZG90cykub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8ub3B0aW9ucy5wYXVzZU9uRG90c0hvdmVyID09PSB0cnVlICYmIF8ub3B0aW9ucy5hdXRvcGxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJCgnbGknLCBfLiRkb3RzKVxuICAgICAgICAgICAgICAgIC5vZmYoJ21vdXNlZW50ZXIuc2xpY2snLCBfLnNldFBhdXNlZC5iaW5kKF8sIHRydWUpKVxuICAgICAgICAgICAgICAgIC5vZmYoJ21vdXNlbGVhdmUuc2xpY2snLCBfLnNldFBhdXNlZC5iaW5kKF8sIGZhbHNlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cgJiYgXy4kcHJldkFycm93Lm9mZignY2xpY2suc2xpY2snLCBfLmNoYW5nZVNsaWRlKTtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdyAmJiBfLiRuZXh0QXJyb3cub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy4kbGlzdC5vZmYoJ3RvdWNoc3RhcnQuc2xpY2sgbW91c2Vkb3duLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9mZigndG91Y2htb3ZlLnNsaWNrIG1vdXNlbW92ZS5zbGljaycsIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ3RvdWNoZW5kLnNsaWNrIG1vdXNldXAuc2xpY2snLCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaGNhbmNlbC5zbGljayBtb3VzZWxlYXZlLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuXG4gICAgICAgIF8uJGxpc3Qub2ZmKCdjbGljay5zbGljaycsIF8uY2xpY2tIYW5kbGVyKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmF1dG9wbGF5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoXy52aXNpYmlsaXR5Q2hhbmdlLCBfLnZpc2liaWxpdHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy4kbGlzdC5vZmYoJ21vdXNlZW50ZXIuc2xpY2snLCBfLnNldFBhdXNlZC5iaW5kKF8sIHRydWUpKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ21vdXNlbGVhdmUuc2xpY2snLCBfLnNldFBhdXNlZC5iaW5kKF8sIGZhbHNlKSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRsaXN0Lm9mZigna2V5ZG93bi5zbGljaycsIF8ua2V5SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZvY3VzT25TZWxlY3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICQoXy4kc2xpZGVUcmFjaykuY2hpbGRyZW4oKS5vZmYoJ2NsaWNrLnNsaWNrJywgXy5zZWxlY3RIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQod2luZG93KS5vZmYoJ29yaWVudGF0aW9uY2hhbmdlLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLm9yaWVudGF0aW9uQ2hhbmdlKTtcblxuICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8ucmVzaXplKTtcblxuICAgICAgICAkKCdbZHJhZ2dhYmxlIT10cnVlXScsIF8uJHNsaWRlVHJhY2spLm9mZignZHJhZ3N0YXJ0JywgXy5wcmV2ZW50RGVmYXVsdCk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9mZignbG9hZC5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZigncmVhZHkuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8uc2V0UG9zaXRpb24pO1xuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2xlYW5VcFJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsIG9yaWdpbmFsU2xpZGVzO1xuXG4gICAgICAgIGlmKF8ub3B0aW9ucy5yb3dzID4gMSkge1xuICAgICAgICAgICAgb3JpZ2luYWxTbGlkZXMgPSBfLiRzbGlkZXMuY2hpbGRyZW4oKS5jaGlsZHJlbigpO1xuICAgICAgICAgICAgb3JpZ2luYWxTbGlkZXMucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgIF8uJHNsaWRlci5odG1sKG9yaWdpbmFsU2xpZGVzKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jbGlja0hhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5zaG91bGRDbGljayA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hdXRvUGxheUNsZWFyKCk7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuXG4gICAgICAgIF8uY2xlYW5VcEV2ZW50cygpO1xuXG4gICAgICAgICQoJy5zbGljay1jbG9uZWQnLCBfLiRzbGlkZXIpLnJlbW92ZSgpO1xuXG4gICAgICAgIGlmIChfLiRkb3RzKSB7XG4gICAgICAgICAgICBfLiRkb3RzLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLiRwcmV2QXJyb3cgJiYgKHR5cGVvZiBfLm9wdGlvbnMucHJldkFycm93ICE9PSAnb2JqZWN0JykpIHtcbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy4kbmV4dEFycm93ICYmICh0eXBlb2YgXy5vcHRpb25zLm5leHRBcnJvdyAhPT0gJ29iamVjdCcpKSB7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy4kc2xpZGVzKSB7XG4gICAgICAgICAgICBfLiRzbGlkZXMucmVtb3ZlQ2xhc3MoJ3NsaWNrLXNsaWRlIHNsaWNrLWFjdGl2ZSBzbGljay1jZW50ZXIgc2xpY2stdmlzaWJsZScpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXNsaWNrLWluZGV4JylcbiAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICcnLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogJycsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIuaHRtbChfLiRzbGlkZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5jbGVhblVwUm93cygpO1xuXG4gICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stc2xpZGVyJyk7XG4gICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2staW5pdGlhbGl6ZWQnKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZGlzYWJsZVRyYW5zaXRpb24gPSBmdW5jdGlvbihzbGlkZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRyYW5zaXRpb24gPSB7fTtcblxuICAgICAgICB0cmFuc2l0aW9uW18udHJhbnNpdGlvblR5cGVdID0gJyc7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGUpLmNzcyh0cmFuc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5mYWRlU2xpZGUgPSBmdW5jdGlvbihzbGlkZUluZGV4LCBjYWxsYmFjaykge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5jc3NUcmFuc2l0aW9ucyA9PT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmNzcyh7XG4gICAgICAgICAgICAgICAgekluZGV4OiAxMDAwXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCwgXy5vcHRpb25zLmVhc2luZywgY2FsbGJhY2spO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIF8uYXBwbHlUcmFuc2l0aW9uKHNsaWRlSW5kZXgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuY3NzKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgICAgICAgIHpJbmRleDogMTAwMFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5kaXNhYmxlVHJhbnNpdGlvbihzbGlkZUluZGV4KTtcblxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKCk7XG4gICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmZpbHRlclNsaWRlcyA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0ZpbHRlciA9IGZ1bmN0aW9uKGZpbHRlcikge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoZmlsdGVyICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUuZmlsdGVyKGZpbHRlcikuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG5cbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRDdXJyZW50ID0gU2xpY2sucHJvdG90eXBlLnNsaWNrQ3VycmVudFNsaWRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuICAgICAgICByZXR1cm4gXy5jdXJyZW50U2xpZGU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldERvdENvdW50ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHZhciBicmVha1BvaW50ID0gMDtcbiAgICAgICAgdmFyIGNvdW50ZXIgPSAwO1xuICAgICAgICB2YXIgcGFnZXJRdHkgPSAwO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHBhZ2VyUXR5ID0gTWF0aC5jZWlsKF8uc2xpZGVDb3VudCAvIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCk7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHBhZ2VyUXR5ID0gXy5zbGlkZUNvdW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2hpbGUgKGJyZWFrUG9pbnQgPCBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICArK3BhZ2VyUXR5O1xuICAgICAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBjb3VudGVyICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgICAgICAgICBjb3VudGVyICs9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYWdlclF0eSAtIDE7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldExlZnQgPSBmdW5jdGlvbihzbGlkZUluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdGFyZ2V0TGVmdCxcbiAgICAgICAgICAgIHZlcnRpY2FsSGVpZ2h0LFxuICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAwLFxuICAgICAgICAgICAgdGFyZ2V0U2xpZGU7XG5cbiAgICAgICAgXy5zbGlkZU9mZnNldCA9IDA7XG4gICAgICAgIHZlcnRpY2FsSGVpZ2h0ID0gXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoXy5zbGlkZVdpZHRoICogXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgKiAtMTtcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICh2ZXJ0aWNhbEhlaWdodCAqIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpICogLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPiBfLnNsaWRlQ291bnQgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2xpZGVJbmRleCA+IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIChzbGlkZUluZGV4IC0gXy5zbGlkZUNvdW50KSkgKiBfLnNsaWRlV2lkdGgpICogLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIChzbGlkZUluZGV4IC0gXy5zbGlkZUNvdW50KSkgKiB2ZXJ0aWNhbEhlaWdodCkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkgKiBfLnNsaWRlV2lkdGgpICogLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSAqIHZlcnRpY2FsSGVpZ2h0KSAqIC0xO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID4gXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIC0gXy5zbGlkZUNvdW50KSAqIF8uc2xpZGVXaWR0aDtcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIC0gXy5zbGlkZUNvdW50KSAqIHZlcnRpY2FsSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gMDtcbiAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgKz0gXy5zbGlkZVdpZHRoICogTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMikgLSBfLnNsaWRlV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCArPSBfLnNsaWRlV2lkdGggKiBNYXRoLmZsb29yKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKChzbGlkZUluZGV4ICogXy5zbGlkZVdpZHRoKSAqIC0xKSArIF8uc2xpZGVPZmZzZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKChzbGlkZUluZGV4ICogdmVydGljYWxIZWlnaHQpICogLTEpICsgdmVydGljYWxPZmZzZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZhcmlhYmxlV2lkdGggPT09IHRydWUpIHtcblxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93IHx8IF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IHRhcmdldFNsaWRlWzBdID8gdGFyZ2V0U2xpZGVbMF0ub2Zmc2V0TGVmdCAqIC0xIDogMDtcblxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5lcShzbGlkZUluZGV4KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSB0YXJnZXRTbGlkZVswXSA/IHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgKiAtMSA6IDA7XG4gICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCArPSAoXy4kbGlzdC53aWR0aCgpIC0gdGFyZ2V0U2xpZGUub3V0ZXJXaWR0aCgpKSAvIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0TGVmdDtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0T3B0aW9uID0gU2xpY2sucHJvdG90eXBlLnNsaWNrR2V0T3B0aW9uID0gZnVuY3Rpb24ob3B0aW9uKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBfLm9wdGlvbnNbb3B0aW9uXTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0TmF2aWdhYmxlSW5kZXhlcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSAwLFxuICAgICAgICAgICAgY291bnRlciA9IDAsXG4gICAgICAgICAgICBpbmRleGVzID0gW10sXG4gICAgICAgICAgICBtYXg7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIG1heCA9IF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyAxO1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSBtYXggPSBfLnNsaWRlQ291bnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVha1BvaW50ID0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICogLTE7XG4gICAgICAgICAgICBjb3VudGVyID0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICogLTE7XG4gICAgICAgICAgICBtYXggPSBfLnNsaWRlQ291bnQgKiAyO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKGJyZWFrUG9pbnQgPCBtYXgpIHtcbiAgICAgICAgICAgIGluZGV4ZXMucHVzaChicmVha1BvaW50KTtcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBjb3VudGVyICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5kZXhlcztcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0U2xpY2sgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0U2xpZGVDb3VudCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHNsaWRlc1RyYXZlcnNlZCwgc3dpcGVkU2xpZGUsIGNlbnRlck9mZnNldDtcblxuICAgICAgICBjZW50ZXJPZmZzZXQgPSBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSA/IF8uc2xpZGVXaWR0aCAqIE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpIDogMDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnN3aXBlVG9TbGlkZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stc2xpZGUnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBzbGlkZSkge1xuICAgICAgICAgICAgICAgIGlmIChzbGlkZS5vZmZzZXRMZWZ0IC0gY2VudGVyT2Zmc2V0ICsgKCQoc2xpZGUpLm91dGVyV2lkdGgoKSAvIDIpID4gKF8uc3dpcGVMZWZ0ICogLTEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXBlZFNsaWRlID0gc2xpZGU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2xpZGVzVHJhdmVyc2VkID0gTWF0aC5hYnMoJChzd2lwZWRTbGlkZSkuYXR0cignZGF0YS1zbGljay1pbmRleCcpIC0gXy5jdXJyZW50U2xpZGUpIHx8IDE7XG5cbiAgICAgICAgICAgIHJldHVybiBzbGlkZXNUcmF2ZXJzZWQ7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ29UbyA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0dvVG8gPSBmdW5jdGlvbihzbGlkZSwgZG9udEFuaW1hdGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICBpbmRleDogcGFyc2VJbnQoc2xpZGUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGRvbnRBbmltYXRlKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoISQoXy4kc2xpZGVyKS5oYXNDbGFzcygnc2xpY2staW5pdGlhbGl6ZWQnKSkge1xuXG4gICAgICAgICAgICAkKF8uJHNsaWRlcikuYWRkQ2xhc3MoJ3NsaWNrLWluaXRpYWxpemVkJyk7XG4gICAgICAgICAgICBfLmJ1aWxkUm93cygpO1xuICAgICAgICAgICAgXy5idWlsZE91dCgpO1xuICAgICAgICAgICAgXy5zZXRQcm9wcygpO1xuICAgICAgICAgICAgXy5zdGFydExvYWQoKTtcbiAgICAgICAgICAgIF8ubG9hZFNsaWRlcigpO1xuICAgICAgICAgICAgXy5pbml0aWFsaXplRXZlbnRzKCk7XG4gICAgICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xuICAgICAgICAgICAgXy51cGRhdGVEb3RzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignaW5pdCcsIFtfXSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRBcnJvd0V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cub24oJ2NsaWNrLnNsaWNrJywge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwcmV2aW91cydcbiAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93Lm9uKCdjbGljay5zbGljaycsIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnbmV4dCdcbiAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXREb3RFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICQoJ2xpJywgXy4kZG90cykub24oJ2NsaWNrLnNsaWNrJywge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdpbmRleCdcbiAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8ub3B0aW9ucy5wYXVzZU9uRG90c0hvdmVyID09PSB0cnVlICYmIF8ub3B0aW9ucy5hdXRvcGxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJCgnbGknLCBfLiRkb3RzKVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VlbnRlci5zbGljaycsIF8uc2V0UGF1c2VkLmJpbmQoXywgdHJ1ZSkpXG4gICAgICAgICAgICAgICAgLm9uKCdtb3VzZWxlYXZlLnNsaWNrJywgXy5zZXRQYXVzZWQuYmluZChfLCBmYWxzZSkpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRpYWxpemVFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5pbml0QXJyb3dFdmVudHMoKTtcblxuICAgICAgICBfLmluaXREb3RFdmVudHMoKTtcblxuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaHN0YXJ0LnNsaWNrIG1vdXNlZG93bi5zbGljaycsIHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3N0YXJ0J1xuICAgICAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNobW92ZS5zbGljayBtb3VzZW1vdmUuc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdtb3ZlJ1xuICAgICAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNoZW5kLnNsaWNrIG1vdXNldXAuc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdlbmQnXG4gICAgICAgIH0sIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vbigndG91Y2hjYW5jZWwuc2xpY2sgbW91c2VsZWF2ZS5zbGljaycsIHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2VuZCdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuXG4gICAgICAgIF8uJGxpc3Qub24oJ2NsaWNrLnNsaWNrJywgXy5jbGlja0hhbmRsZXIpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXV0b3BsYXkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKF8udmlzaWJpbGl0eUNoYW5nZSwgXy52aXNpYmlsaXR5LmJpbmQoXykpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy4kbGlzdC5vbignbW91c2VlbnRlci5zbGljaycsIF8uc2V0UGF1c2VkLmJpbmQoXywgdHJ1ZSkpO1xuICAgICAgICBfLiRsaXN0Lm9uKCdtb3VzZWxlYXZlLnNsaWNrJywgXy5zZXRQYXVzZWQuYmluZChfLCBmYWxzZSkpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kbGlzdC5vbigna2V5ZG93bi5zbGljaycsIF8ua2V5SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZvY3VzT25TZWxlY3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICQoXy4kc2xpZGVUcmFjaykuY2hpbGRyZW4oKS5vbignY2xpY2suc2xpY2snLCBfLnNlbGVjdEhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdvcmllbnRhdGlvbmNoYW5nZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5vcmllbnRhdGlvbkNoYW5nZS5iaW5kKF8pKTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5yZXNpemUuYmluZChfKSk7XG5cbiAgICAgICAgJCgnW2RyYWdnYWJsZSE9dHJ1ZV0nLCBfLiRzbGlkZVRyYWNrKS5vbignZHJhZ3N0YXJ0JywgXy5wcmV2ZW50RGVmYXVsdCk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdsb2FkLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnNldFBvc2l0aW9uKTtcbiAgICAgICAgJChkb2N1bWVudCkub24oJ3JlYWR5LnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnNldFBvc2l0aW9uKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdFVJID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy4kcHJldkFycm93LnNob3coKTtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdy5zaG93KCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJGRvdHMuc2hvdygpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmF1dG9wbGF5ID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIF8uYXV0b1BsYXkoKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmtleUhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMzcgJiYgXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uY2hhbmdlU2xpZGUoe1xuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ3ByZXZpb3VzJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM5ICYmIF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICduZXh0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmxhenlMb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgbG9hZFJhbmdlLCBjbG9uZVJhbmdlLCByYW5nZVN0YXJ0LCByYW5nZUVuZDtcblxuICAgICAgICBmdW5jdGlvbiBsb2FkSW1hZ2VzKGltYWdlc1Njb3BlKSB7XG4gICAgICAgICAgICAkKCdpbWdbZGF0YS1sYXp5XScsIGltYWdlc1Njb3BlKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIGltYWdlU291cmNlID0gJCh0aGlzKS5hdHRyKCdkYXRhLWxhenknKSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICAgICAgICAgICAgICAgIGltYWdlVG9Mb2FkLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGltYWdlVG9Mb2FkLnNyYyA9IGltYWdlU291cmNlO1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdzcmMnLCBpbWFnZVNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtbGF6eScpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5jdXJyZW50U2xpZGUgKyAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIgKyAxKTtcbiAgICAgICAgICAgICAgICByYW5nZUVuZCA9IHJhbmdlU3RhcnQgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmFuZ2VTdGFydCA9IE1hdGgubWF4KDAsIF8uY3VycmVudFNsaWRlIC0gKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyICsgMSkpO1xuICAgICAgICAgICAgICAgIHJhbmdlRW5kID0gMiArIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMiArIDEpICsgXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5vcHRpb25zLmluZmluaXRlID8gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIF8uY3VycmVudFNsaWRlIDogXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICByYW5nZUVuZCA9IHJhbmdlU3RhcnQgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJhbmdlU3RhcnQgPiAwKSByYW5nZVN0YXJ0LS07XG4gICAgICAgICAgICAgICAgaWYgKHJhbmdlRW5kIDw9IF8uc2xpZGVDb3VudCkgcmFuZ2VFbmQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxvYWRSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stc2xpZGUnKS5zbGljZShyYW5nZVN0YXJ0LCByYW5nZUVuZCk7XG4gICAgICAgIGxvYWRJbWFnZXMobG9hZFJhbmdlKTtcblxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIGNsb25lUmFuZ2UgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLXNsaWRlJyk7XG4gICAgICAgICAgICBsb2FkSW1hZ2VzKGNsb25lUmFuZ2UpO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID49IF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIGNsb25lUmFuZ2UgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLWNsb25lZCcpLnNsaWNlKDAsIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgbG9hZEltYWdlcyhjbG9uZVJhbmdlKTtcbiAgICAgICAgfSBlbHNlIGlmIChfLmN1cnJlbnRTbGlkZSA9PT0gMCkge1xuICAgICAgICAgICAgY2xvbmVSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stY2xvbmVkJykuc2xpY2UoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAqIC0xKTtcbiAgICAgICAgICAgIGxvYWRJbWFnZXMoY2xvbmVSYW5nZSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUubG9hZFNsaWRlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5jc3Moe1xuICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKTtcblxuICAgICAgICBfLmluaXRVSSgpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMubGF6eUxvYWQgPT09ICdwcm9ncmVzc2l2ZScpIHtcbiAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLm5leHQgPSBTbGljay5wcm90b3R5cGUuc2xpY2tOZXh0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uY2hhbmdlU2xpZGUoe1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICduZXh0J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUub3JpZW50YXRpb25DaGFuZ2UgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUoKTtcbiAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wYXVzZSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1BhdXNlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xuICAgICAgICBfLnBhdXNlZCA9IHRydWU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnBsYXkgPSBTbGljay5wcm90b3R5cGUuc2xpY2tQbGF5ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8ucGF1c2VkID0gZmFsc2U7XG4gICAgICAgIF8uYXV0b1BsYXkoKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucG9zdFNsaWRlID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2FmdGVyQ2hhbmdlJywgW18sIGluZGV4XSk7XG5cbiAgICAgICAgXy5hbmltYXRpbmcgPSBmYWxzZTtcblxuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG5cbiAgICAgICAgXy5zd2lwZUxlZnQgPSBudWxsO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXV0b3BsYXkgPT09IHRydWUgJiYgXy5wYXVzZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucHJldiA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1ByZXYgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ3ByZXZpb3VzJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnByb2dyZXNzaXZlTGF6eUxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBpbWdDb3VudCwgdGFyZ2V0SW1hZ2U7XG5cbiAgICAgICAgaW1nQ291bnQgPSAkKCdpbWdbZGF0YS1sYXp5XScsIF8uJHNsaWRlcikubGVuZ3RoO1xuXG4gICAgICAgIGlmIChpbWdDb3VudCA+IDApIHtcbiAgICAgICAgICAgIHRhcmdldEltYWdlID0gJCgnaW1nW2RhdGEtbGF6eV0nLCBfLiRzbGlkZXIpLmZpcnN0KCk7XG4gICAgICAgICAgICB0YXJnZXRJbWFnZS5hdHRyKCdzcmMnLCB0YXJnZXRJbWFnZS5hdHRyKCdkYXRhLWxhenknKSkucmVtb3ZlQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKS5sb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRJbWFnZS5yZW1vdmVBdHRyKCdkYXRhLWxhenknKTtcbiAgICAgICAgICAgICAgICAgICAgXy5wcm9ncmVzc2l2ZUxhenlMb2FkKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEltYWdlLnJlbW92ZUF0dHIoJ2RhdGEtbGF6eScpO1xuICAgICAgICAgICAgICAgICAgICBfLnByb2dyZXNzaXZlTGF6eUxvYWQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgY3VycmVudFNsaWRlID0gXy5jdXJyZW50U2xpZGU7XG5cbiAgICAgICAgXy5kZXN0cm95KCk7XG5cbiAgICAgICAgJC5leHRlbmQoXywgXy5pbml0aWFscyk7XG5cbiAgICAgICAgXy5pbml0KCk7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICBpbmRleDogY3VycmVudFNsaWRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGZhbHNlKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVpbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oXy5vcHRpb25zLnNsaWRlKS5hZGRDbGFzcyhcbiAgICAgICAgICAgICdzbGljay1zbGlkZScpO1xuXG4gICAgICAgIF8uc2xpZGVDb3VudCA9IF8uJHNsaWRlcy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID49IF8uc2xpZGVDb3VudCAmJiBfLmN1cnJlbnRTbGlkZSAhPT0gMCkge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLmN1cnJlbnRTbGlkZSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5zZXRQcm9wcygpO1xuXG4gICAgICAgIF8uc2V0dXBJbmZpbml0ZSgpO1xuXG4gICAgICAgIF8uYnVpbGRBcnJvd3MoKTtcblxuICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xuXG4gICAgICAgIF8uaW5pdEFycm93RXZlbnRzKCk7XG5cbiAgICAgICAgXy5idWlsZERvdHMoKTtcblxuICAgICAgICBfLnVwZGF0ZURvdHMoKTtcblxuICAgICAgICBfLmluaXREb3RFdmVudHMoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZvY3VzT25TZWxlY3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICQoXy4kc2xpZGVUcmFjaykuY2hpbGRyZW4oKS5vbignY2xpY2suc2xpY2snLCBfLnNlbGVjdEhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXMoMCk7XG5cbiAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuXG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdyZUluaXQnLCBbX10pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCQod2luZG93KS53aWR0aCgpICE9PSBfLndpbmRvd1dpZHRoKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoXy53aW5kb3dEZWxheSk7XG4gICAgICAgICAgICBfLndpbmRvd0RlbGF5ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgXy53aW5kb3dXaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuICAgICAgICAgICAgICAgIF8uY2hlY2tSZXNwb25zaXZlKCk7XG4gICAgICAgICAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZW1vdmVTbGlkZSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1JlbW92ZSA9IGZ1bmN0aW9uKGluZGV4LCByZW1vdmVCZWZvcmUsIHJlbW92ZUFsbCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAodHlwZW9mKGluZGV4KSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICByZW1vdmVCZWZvcmUgPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gcmVtb3ZlQmVmb3JlID09PSB0cnVlID8gMCA6IF8uc2xpZGVDb3VudCAtIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmRleCA9IHJlbW92ZUJlZm9yZSA9PT0gdHJ1ZSA/IC0taW5kZXggOiBpbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPCAxIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+IF8uc2xpZGVDb3VudCAtIDEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgaWYgKHJlbW92ZUFsbCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbigpLnJlbW92ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmVxKGluZGV4KS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5hcHBlbmQoXy4kc2xpZGVzKTtcblxuICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcblxuICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRDU1MgPSBmdW5jdGlvbihwb3NpdGlvbikge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHBvc2l0aW9uUHJvcHMgPSB7fSxcbiAgICAgICAgICAgIHgsIHk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gLXBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHggPSBfLnBvc2l0aW9uUHJvcCA9PSAnbGVmdCcgPyBNYXRoLmNlaWwocG9zaXRpb24pICsgJ3B4JyA6ICcwcHgnO1xuICAgICAgICB5ID0gXy5wb3NpdGlvblByb3AgPT0gJ3RvcCcgPyBNYXRoLmNlaWwocG9zaXRpb24pICsgJ3B4JyA6ICcwcHgnO1xuXG4gICAgICAgIHBvc2l0aW9uUHJvcHNbXy5wb3NpdGlvblByb3BdID0gcG9zaXRpb247XG5cbiAgICAgICAgaWYgKF8udHJhbnNmb3Jtc0VuYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhwb3NpdGlvblByb3BzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvc2l0aW9uUHJvcHMgPSB7fTtcbiAgICAgICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlKCcgKyB4ICsgJywgJyArIHkgKyAnKSc7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MocG9zaXRpb25Qcm9wcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlM2QoJyArIHggKyAnLCAnICsgeSArICcsIDBweCknO1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHBvc2l0aW9uUHJvcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldERpbWVuc2lvbnMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uJGxpc3QuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogKCcwcHggJyArIF8ub3B0aW9ucy5jZW50ZXJQYWRkaW5nKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kbGlzdC5oZWlnaHQoXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uJGxpc3QuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogKF8ub3B0aW9ucy5jZW50ZXJQYWRkaW5nICsgJyAwcHgnKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgXy5saXN0V2lkdGggPSBfLiRsaXN0LndpZHRoKCk7XG4gICAgICAgIF8ubGlzdEhlaWdodCA9IF8uJGxpc3QuaGVpZ2h0KCk7XG5cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSAmJiBfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uc2xpZGVXaWR0aCA9IE1hdGguY2VpbChfLmxpc3RXaWR0aCAvIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay53aWR0aChNYXRoLmNlaWwoKF8uc2xpZGVXaWR0aCAqIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmxlbmd0aCkpKTtcblxuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy52YXJpYWJsZVdpZHRoID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLndpZHRoKDUwMDAgKiBfLnNsaWRlQ291bnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5zbGlkZVdpZHRoID0gTWF0aC5jZWlsKF8ubGlzdFdpZHRoKTtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suaGVpZ2h0KE1hdGguY2VpbCgoXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSkgKiBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5sZW5ndGgpKSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb2Zmc2V0ID0gXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJXaWR0aCh0cnVlKSAtIF8uJHNsaWRlcy5maXJzdCgpLndpZHRoKCk7XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gZmFsc2UpIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLndpZHRoKF8uc2xpZGVXaWR0aCAtIG9mZnNldCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldEZhZGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICB0YXJnZXRMZWZ0O1xuXG4gICAgICAgIF8uJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKF8uc2xpZGVXaWR0aCAqIGluZGV4KSAqIC0xO1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgICAgICAgICAgICByaWdodDogdGFyZ2V0TGVmdCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICAgICAgICB6SW5kZXg6IDgwMCxcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0YXJnZXRMZWZ0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICAgICAgICAgIHpJbmRleDogODAwLFxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF8uJHNsaWRlcy5lcShfLmN1cnJlbnRTbGlkZSkuY3NzKHtcbiAgICAgICAgICAgIHpJbmRleDogOTAwLFxuICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID09PSAxICYmIF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5vdXRlckhlaWdodCh0cnVlKTtcbiAgICAgICAgICAgIF8uJGxpc3QuY3NzKCdoZWlnaHQnLCB0YXJnZXRIZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldE9wdGlvbiA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1NldE9wdGlvbiA9IGZ1bmN0aW9uKG9wdGlvbiwgdmFsdWUsIHJlZnJlc2gpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIF8ub3B0aW9uc1tvcHRpb25dID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHJlZnJlc2ggPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG4gICAgICAgICAgICBfLnJlaW5pdCgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uc2V0RGltZW5zaW9ucygpO1xuXG4gICAgICAgIF8uc2V0SGVpZ2h0KCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy5zZXRDU1MoXy5nZXRMZWZ0KF8uY3VycmVudFNsaWRlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLnNldEZhZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdzZXRQb3NpdGlvbicsIFtfXSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldFByb3BzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgYm9keVN0eWxlID0gZG9jdW1lbnQuYm9keS5zdHlsZTtcblxuICAgICAgICBfLnBvc2l0aW9uUHJvcCA9IF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gdHJ1ZSA/ICd0b3AnIDogJ2xlZnQnO1xuXG4gICAgICAgIGlmIChfLnBvc2l0aW9uUHJvcCA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlci5hZGRDbGFzcygnc2xpY2stdmVydGljYWwnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stdmVydGljYWwnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChib2R5U3R5bGUuV2Via2l0VHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBib2R5U3R5bGUuTW96VHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBib2R5U3R5bGUubXNUcmFuc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudXNlQ1NTID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5jc3NUcmFuc2l0aW9ucyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYm9keVN0eWxlLk9UcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICdPVHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctby10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICdPVHJhbnNpdGlvbic7XG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLnBlcnNwZWN0aXZlUHJvcGVydHkgPT09IHVuZGVmaW5lZCAmJiBib2R5U3R5bGUud2Via2l0UGVyc3BlY3RpdmUgPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUuTW96VHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAnTW96VHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctbW96LXRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ01velRyYW5zaXRpb24nO1xuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZS5wZXJzcGVjdGl2ZVByb3BlcnR5ID09PSB1bmRlZmluZWQgJiYgYm9keVN0eWxlLk1velBlcnNwZWN0aXZlID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9keVN0eWxlLndlYmtpdFRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ3dlYmtpdFRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLXdlYmtpdC10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICd3ZWJraXRUcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUucGVyc3BlY3RpdmVQcm9wZXJ0eSA9PT0gdW5kZWZpbmVkICYmIGJvZHlTdHlsZS53ZWJraXRQZXJzcGVjdGl2ZSA9PT0gdW5kZWZpbmVkKSBfLmFuaW1UeXBlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvZHlTdHlsZS5tc1RyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ21zVHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctbXMtdHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnbXNUcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUubXNUcmFuc2Zvcm0gPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUudHJhbnNmb3JtICE9PSB1bmRlZmluZWQgJiYgXy5hbmltVHlwZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAndHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICd0cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICd0cmFuc2l0aW9uJztcbiAgICAgICAgfVxuICAgICAgICBfLnRyYW5zZm9ybXNFbmFibGVkID0gKF8uYW5pbVR5cGUgIT09IG51bGwgJiYgXy5hbmltVHlwZSAhPT0gZmFsc2UpO1xuXG4gICAgfTtcblxuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldFNsaWRlQ2xhc3NlcyA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgY2VudGVyT2Zmc2V0LCBhbGxTbGlkZXMsIGluZGV4T2Zmc2V0LCByZW1haW5kZXI7XG5cbiAgICAgICAgXy4kc2xpZGVyLmZpbmQoJy5zbGljay1zbGlkZScpLnJlbW92ZUNsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJykucmVtb3ZlQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuICAgICAgICBhbGxTbGlkZXMgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLXNsaWRlJyk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIGNlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gY2VudGVyT2Zmc2V0ICYmIGluZGV4IDw9IChfLnNsaWRlQ291bnQgLSAxKSAtIGNlbnRlck9mZnNldCkge1xuICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXMuc2xpY2UoaW5kZXggLSBjZW50ZXJPZmZzZXQsIGluZGV4ICsgY2VudGVyT2Zmc2V0ICsgMSkuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhPZmZzZXQgPSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlcy5zbGljZShpbmRleE9mZnNldCAtIGNlbnRlck9mZnNldCArIDEsIGluZGV4T2Zmc2V0ICsgY2VudGVyT2Zmc2V0ICsgMikuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlcy5lcShhbGxTbGlkZXMubGVuZ3RoIC0gMSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGluZGV4ID09PSBfLnNsaWRlQ291bnQgLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlcy5lcShfLm9wdGlvbnMuc2xpZGVzVG9TaG93KS5hZGRDbGFzcygnc2xpY2stY2VudGVyJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShpbmRleCkuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDw9IChfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSkge1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlcy5zbGljZShpbmRleCwgaW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KS5hZGRDbGFzcygnc2xpY2stYWN0aXZlJykuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxsU2xpZGVzLmxlbmd0aCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgYWxsU2xpZGVzLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuICAgICAgICAgICAgICAgIGluZGV4T2Zmc2V0ID0gXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlID8gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIGluZGV4IDogaW5kZXg7XG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPT0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICYmIChfLnNsaWRlQ291bnQgLSBpbmRleCkgPCBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlcy5zbGljZShpbmRleE9mZnNldCAtIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gcmVtYWluZGVyKSwgaW5kZXhPZmZzZXQgKyByZW1haW5kZXIpLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlcy5zbGljZShpbmRleE9mZnNldCwgaW5kZXhPZmZzZXQgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KS5hZGRDbGFzcygnc2xpY2stYWN0aXZlJykuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMubGF6eUxvYWQgPT09ICdvbmRlbWFuZCcpIHtcbiAgICAgICAgICAgIF8ubGF6eUxvYWQoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXR1cEluZmluaXRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgaSwgc2xpZGVJbmRleCwgaW5maW5pdGVDb3VudDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8ub3B0aW9ucy5jZW50ZXJNb2RlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlICYmIF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICBzbGlkZUluZGV4ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50ID0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5maW5pdGVDb3VudCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gXy5zbGlkZUNvdW50OyBpID4gKF8uc2xpZGVDb3VudCAtXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50KTsgaSAtPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlSW5kZXggPSBpIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAucHJlcGVuZFRvKF8uJHNsaWRlVHJhY2spLmFkZENsYXNzKCdzbGljay1jbG9uZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGluZmluaXRlQ291bnQ7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZUluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggKyBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kVG8oXy4kc2xpZGVUcmFjaykuYWRkQ2xhc3MoJ3NsaWNrLWNsb25lZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1jbG9uZWQnKS5maW5kKCdbaWRdJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hdHRyKCdpZCcsICcnKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0UGF1c2VkID0gZnVuY3Rpb24ocGF1c2VkKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXV0b3BsYXkgPT09IHRydWUgJiYgXy5vcHRpb25zLnBhdXNlT25Ib3ZlciA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5wYXVzZWQgPSBwYXVzZWQ7XG4gICAgICAgICAgICBfLmF1dG9QbGF5Q2xlYXIoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2VsZWN0SGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHZhciB0YXJnZXRFbGVtZW50ID0gJChldmVudC50YXJnZXQpLmlzKCcuc2xpY2stc2xpZGUnKSA/XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkgOlxuICAgICAgICAgICAgJChldmVudC50YXJnZXQpLnBhcmVudHMoJy5zbGljay1zbGlkZScpO1xuXG4gICAgICAgIHZhciBpbmRleCA9IHBhcnNlSW50KHRhcmdldEVsZW1lbnQuYXR0cignZGF0YS1zbGljay1pbmRleCcpKTtcblxuICAgICAgICBpZiAoIWluZGV4KSBpbmRleCA9IDA7XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLXNsaWRlJykucmVtb3ZlQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShpbmRleCkuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpLmF0dHIoXCJhcmlhLWhpZGRlblwiLCBcImZhbHNlXCIpO1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVyLmZpbmQoJy5zbGljay1zbGlkZScpLnJlbW92ZUNsYXNzKCdzbGljay1jZW50ZXInKTtcbiAgICAgICAgICAgICAgICBfLiRzbGlkZXMuZXEoaW5kZXgpLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF8uYXNOYXZGb3IoaW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIF8uc2xpZGVIYW5kbGVyKGluZGV4KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2xpZGVIYW5kbGVyID0gZnVuY3Rpb24oaW5kZXgsIHN5bmMsIGRvbnRBbmltYXRlKSB7XG5cbiAgICAgICAgdmFyIHRhcmdldFNsaWRlLCBhbmltU2xpZGUsIG9sZFNsaWRlLCBzbGlkZUxlZnQsIHRhcmdldExlZnQgPSBudWxsLFxuICAgICAgICAgICAgXyA9IHRoaXM7XG5cbiAgICAgICAgc3luYyA9IHN5bmMgfHwgZmFsc2U7XG5cbiAgICAgICAgaWYgKF8uYW5pbWF0aW5nID09PSB0cnVlICYmIF8ub3B0aW9ucy53YWl0Rm9yQW5pbWF0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlICYmIF8uY3VycmVudFNsaWRlID09PSBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uYXNOYXZGb3IoaW5kZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFyZ2V0U2xpZGUgPSBpbmRleDtcbiAgICAgICAgdGFyZ2V0TGVmdCA9IF8uZ2V0TGVmdCh0YXJnZXRTbGlkZSk7XG4gICAgICAgIHNsaWRlTGVmdCA9IF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSk7XG5cbiAgICAgICAgXy5jdXJyZW50TGVmdCA9IF8uc3dpcGVMZWZ0ID09PSBudWxsID8gc2xpZGVMZWZ0IDogXy5zd2lwZUxlZnQ7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UgJiYgXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IGZhbHNlICYmIChpbmRleCA8IDAgfHwgaW5kZXggPiBfLmdldERvdENvdW50KCkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hbmltYXRlU2xpZGUoc2xpZGVMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlICYmIChpbmRleCA8IDAgfHwgaW5kZXggPiAoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSkpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuICAgICAgICAgICAgICAgIGlmIChkb250QW5pbWF0ZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBfLmFuaW1hdGVTbGlkZShzbGlkZUxlZnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZSh0YXJnZXRTbGlkZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hdXRvcGxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChfLmF1dG9QbGF5VGltZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhcmdldFNsaWRlIDwgMCkge1xuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGFuaW1TbGlkZSA9IF8uc2xpZGVDb3VudCAtIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSBfLnNsaWRlQ291bnQgKyB0YXJnZXRTbGlkZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXRTbGlkZSA+PSBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApIHtcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSB0YXJnZXRTbGlkZSAtIF8uc2xpZGVDb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFuaW1TbGlkZSA9IHRhcmdldFNsaWRlO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5hbmltYXRpbmcgPSB0cnVlO1xuXG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKFwiYmVmb3JlQ2hhbmdlXCIsIFtfLCBfLmN1cnJlbnRTbGlkZSwgYW5pbVNsaWRlXSk7XG5cbiAgICAgICAgb2xkU2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBhbmltU2xpZGU7XG5cbiAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXMoXy5jdXJyZW50U2xpZGUpO1xuXG4gICAgICAgIF8udXBkYXRlRG90cygpO1xuICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5mYWRlU2xpZGUoYW5pbVNsaWRlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF8uYW5pbWF0ZUhlaWdodCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICBfLmFuaW1hdGVTbGlkZSh0YXJnZXRMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN0YXJ0TG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5oaWRlKCk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cuaGlkZSgpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRkb3RzLmhpZGUoKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlRGlyZWN0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHhEaXN0LCB5RGlzdCwgciwgc3dpcGVBbmdsZSwgXyA9IHRoaXM7XG5cbiAgICAgICAgeERpc3QgPSBfLnRvdWNoT2JqZWN0LnN0YXJ0WCAtIF8udG91Y2hPYmplY3QuY3VyWDtcbiAgICAgICAgeURpc3QgPSBfLnRvdWNoT2JqZWN0LnN0YXJ0WSAtIF8udG91Y2hPYmplY3QuY3VyWTtcbiAgICAgICAgciA9IE1hdGguYXRhbjIoeURpc3QsIHhEaXN0KTtcblxuICAgICAgICBzd2lwZUFuZ2xlID0gTWF0aC5yb3VuZChyICogMTgwIC8gTWF0aC5QSSk7XG4gICAgICAgIGlmIChzd2lwZUFuZ2xlIDwgMCkge1xuICAgICAgICAgICAgc3dpcGVBbmdsZSA9IDM2MCAtIE1hdGguYWJzKHN3aXBlQW5nbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChzd2lwZUFuZ2xlIDw9IDQ1KSAmJiAoc3dpcGVBbmdsZSA+PSAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIChfLm9wdGlvbnMucnRsID09PSBmYWxzZSA/ICdsZWZ0JyA6ICdyaWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoc3dpcGVBbmdsZSA8PSAzNjApICYmIChzd2lwZUFuZ2xlID49IDMxNSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAnbGVmdCcgOiAncmlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPj0gMTM1KSAmJiAoc3dpcGVBbmdsZSA8PSAyMjUpKSB7XG4gICAgICAgICAgICByZXR1cm4gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gJ3JpZ2h0JyA6ICdsZWZ0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmICgoc3dpcGVBbmdsZSA+PSAzNSkgJiYgKHN3aXBlQW5nbGUgPD0gMTM1KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnbGVmdCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAncmlnaHQnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICd2ZXJ0aWNhbCc7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlRW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBzbGlkZUNvdW50O1xuXG4gICAgICAgIF8uZHJhZ2dpbmcgPSBmYWxzZTtcblxuICAgICAgICBfLnNob3VsZENsaWNrID0gKF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPiAxMCkgPyBmYWxzZSA6IHRydWU7XG5cbiAgICAgICAgaWYgKF8udG91Y2hPYmplY3QuY3VyWCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy50b3VjaE9iamVjdC5lZGdlSGl0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcihcImVkZ2VcIiwgW18sIF8uc3dpcGVEaXJlY3Rpb24oKV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPj0gXy50b3VjaE9iamVjdC5taW5Td2lwZSkge1xuXG4gICAgICAgICAgICBzd2l0Y2ggKF8uc3dpcGVEaXJlY3Rpb24oKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICBzbGlkZUNvdW50ID0gXy5vcHRpb25zLnN3aXBlVG9TbGlkZSA/IF8uY2hlY2tOYXZpZ2FibGUoXy5jdXJyZW50U2xpZGUgKyBfLmdldFNsaWRlQ291bnQoKSkgOiBfLmN1cnJlbnRTbGlkZSArIF8uZ2V0U2xpZGVDb3VudCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihzbGlkZUNvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50RGlyZWN0aW9uID0gMDtcbiAgICAgICAgICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcihcInN3aXBlXCIsIFtfLCBcImxlZnRcIl0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVDb3VudCA9IF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgPyBfLmNoZWNrTmF2aWdhYmxlKF8uY3VycmVudFNsaWRlIC0gXy5nZXRTbGlkZUNvdW50KCkpIDogXy5jdXJyZW50U2xpZGUgLSBfLmdldFNsaWRlQ291bnQoKTtcbiAgICAgICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoc2xpZGVDb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIF8uY3VycmVudERpcmVjdGlvbiA9IDE7XG4gICAgICAgICAgICAgICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoXCJzd2lwZVwiLCBbXywgXCJyaWdodFwiXSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKF8udG91Y2hPYmplY3Quc3RhcnRYICE9PSBfLnRvdWNoT2JqZWN0LmN1clgpIHtcbiAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihfLmN1cnJlbnRTbGlkZSk7XG4gICAgICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICgoXy5vcHRpb25zLnN3aXBlID09PSBmYWxzZSkgfHwgKCdvbnRvdWNoZW5kJyBpbiBkb2N1bWVudCAmJiBfLm9wdGlvbnMuc3dpcGUgPT09IGZhbHNlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5kcmFnZ2FibGUgPT09IGZhbHNlICYmIGV2ZW50LnR5cGUuaW5kZXhPZignbW91c2UnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udG91Y2hPYmplY3QuZmluZ2VyQ291bnQgPSBldmVudC5vcmlnaW5hbEV2ZW50ICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgICAgIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcy5sZW5ndGggOiAxO1xuXG4gICAgICAgIF8udG91Y2hPYmplY3QubWluU3dpcGUgPSBfLmxpc3RXaWR0aCAvIF8ub3B0aW9uc1xuICAgICAgICAgICAgLnRvdWNoVGhyZXNob2xkO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnRvdWNoT2JqZWN0Lm1pblN3aXBlID0gXy5saXN0SGVpZ2h0IC8gXy5vcHRpb25zXG4gICAgICAgICAgICAgICAgLnRvdWNoVGhyZXNob2xkO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5kYXRhLmFjdGlvbikge1xuXG4gICAgICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgICAgICAgXy5zd2lwZVN0YXJ0KGV2ZW50KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbW92ZSc6XG4gICAgICAgICAgICAgICAgXy5zd2lwZU1vdmUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgICAgICAgIF8uc3dpcGVFbmQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVNb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBlZGdlV2FzSGl0ID0gZmFsc2UsXG4gICAgICAgICAgICBjdXJMZWZ0LCBzd2lwZURpcmVjdGlvbiwgc3dpcGVMZW5ndGgsIHBvc2l0aW9uT2Zmc2V0LCB0b3VjaGVzO1xuXG4gICAgICAgIHRvdWNoZXMgPSBldmVudC5vcmlnaW5hbEV2ZW50ICE9PSB1bmRlZmluZWQgPyBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgOiBudWxsO1xuXG4gICAgICAgIGlmICghXy5kcmFnZ2luZyB8fCB0b3VjaGVzICYmIHRvdWNoZXMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJMZWZ0ID0gXy5nZXRMZWZ0KF8uY3VycmVudFNsaWRlKTtcblxuICAgICAgICBfLnRvdWNoT2JqZWN0LmN1clggPSB0b3VjaGVzICE9PSB1bmRlZmluZWQgPyB0b3VjaGVzWzBdLnBhZ2VYIDogZXZlbnQuY2xpZW50WDtcbiAgICAgICAgXy50b3VjaE9iamVjdC5jdXJZID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlc1swXS5wYWdlWSA6IGV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA9IE1hdGgucm91bmQoTWF0aC5zcXJ0KFxuICAgICAgICAgICAgTWF0aC5wb3coXy50b3VjaE9iamVjdC5jdXJYIC0gXy50b3VjaE9iamVjdC5zdGFydFgsIDIpKSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPSBNYXRoLnJvdW5kKE1hdGguc3FydChcbiAgICAgICAgICAgICAgICBNYXRoLnBvdyhfLnRvdWNoT2JqZWN0LmN1clkgLSBfLnRvdWNoT2JqZWN0LnN0YXJ0WSwgMikpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlRGlyZWN0aW9uID0gXy5zd2lwZURpcmVjdGlvbigpO1xuXG4gICAgICAgIGlmIChzd2lwZURpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT09IHVuZGVmaW5lZCAmJiBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID4gNCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc2l0aW9uT2Zmc2V0ID0gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gMSA6IC0xKSAqIChfLnRvdWNoT2JqZWN0LmN1clggPiBfLnRvdWNoT2JqZWN0LnN0YXJ0WCA/IDEgOiAtMSk7XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwb3NpdGlvbk9mZnNldCA9IF8udG91Y2hPYmplY3QuY3VyWSA+IF8udG91Y2hPYmplY3Quc3RhcnRZID8gMSA6IC0xO1xuICAgICAgICB9XG5cblxuICAgICAgICBzd2lwZUxlbmd0aCA9IF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGg7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5lZGdlSGl0ID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmICgoXy5jdXJyZW50U2xpZGUgPT09IDAgJiYgc3dpcGVEaXJlY3Rpb24gPT09IFwicmlnaHRcIikgfHwgKF8uY3VycmVudFNsaWRlID49IF8uZ2V0RG90Q291bnQoKSAmJiBzd2lwZURpcmVjdGlvbiA9PT0gXCJsZWZ0XCIpKSB7XG4gICAgICAgICAgICAgICAgc3dpcGVMZW5ndGggPSBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoICogXy5vcHRpb25zLmVkZ2VGcmljdGlvbjtcbiAgICAgICAgICAgICAgICBfLnRvdWNoT2JqZWN0LmVkZ2VIaXQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gY3VyTGVmdCArIHN3aXBlTGVuZ3RoICogcG9zaXRpb25PZmZzZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IGN1ckxlZnQgKyAoc3dpcGVMZW5ndGggKiAoXy4kbGlzdC5oZWlnaHQoKSAvIF8ubGlzdFdpZHRoKSkgKiBwb3NpdGlvbk9mZnNldDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5zd2lwZUxlZnQgPSBjdXJMZWZ0ICsgc3dpcGVMZW5ndGggKiBwb3NpdGlvbk9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gdHJ1ZSB8fCBfLm9wdGlvbnMudG91Y2hNb3ZlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uYW5pbWF0aW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBfLnNldENTUyhfLnN3aXBlTGVmdCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlU3RhcnQgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRvdWNoZXM7XG5cbiAgICAgICAgaWYgKF8udG91Y2hPYmplY3QuZmluZ2VyQ291bnQgIT09IDEgfHwgXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9PSB1bmRlZmluZWQgJiYgZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRvdWNoZXMgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF07XG4gICAgICAgIH1cblxuICAgICAgICBfLnRvdWNoT2JqZWN0LnN0YXJ0WCA9IF8udG91Y2hPYmplY3QuY3VyWCA9IHRvdWNoZXMgIT09IHVuZGVmaW5lZCA/IHRvdWNoZXMucGFnZVggOiBldmVudC5jbGllbnRYO1xuICAgICAgICBfLnRvdWNoT2JqZWN0LnN0YXJ0WSA9IF8udG91Y2hPYmplY3QuY3VyWSA9IHRvdWNoZXMgIT09IHVuZGVmaW5lZCA/IHRvdWNoZXMucGFnZVkgOiBldmVudC5jbGllbnRZO1xuXG4gICAgICAgIF8uZHJhZ2dpbmcgPSB0cnVlO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51bmZpbHRlclNsaWRlcyA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1VuZmlsdGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLiRzbGlkZXNDYWNoZSAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICBfLnVubG9hZCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc0NhY2hlLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xuXG4gICAgICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUudW5sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgICQoJy5zbGljay1jbG9uZWQnLCBfLiRzbGlkZXIpLnJlbW92ZSgpO1xuICAgICAgICBpZiAoXy4kZG90cykge1xuICAgICAgICAgICAgXy4kZG90cy5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy4kcHJldkFycm93ICYmICh0eXBlb2YgXy5vcHRpb25zLnByZXZBcnJvdyAhPT0gJ29iamVjdCcpKSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8uJG5leHRBcnJvdyAmJiAodHlwZW9mIF8ub3B0aW9ucy5uZXh0QXJyb3cgIT09ICdvYmplY3QnKSkge1xuICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIF8uJHNsaWRlcy5yZW1vdmVDbGFzcygnc2xpY2stc2xpZGUgc2xpY2stYWN0aXZlIHNsaWNrLXZpc2libGUnKS5hdHRyKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpLmNzcygnd2lkdGgnLCAnJyk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVuc2xpY2sgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIF8uZGVzdHJveSgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51cGRhdGVBcnJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBjZW50ZXJPZmZzZXQ7XG5cbiAgICAgICAgY2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMik7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgJiYgXy5vcHRpb25zLmluZmluaXRlICE9PVxuICAgICAgICAgICAgdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgICAgICBpZiAoXy5jdXJyZW50U2xpZGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5hZGRDbGFzcygnc2xpY2stZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKF8uY3VycmVudFNsaWRlID49IF8uc2xpZGVDb3VudCAtIDEgJiYgXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVwZGF0ZURvdHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgXy4kZG90cy5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xuICAgICAgICAgICAgXy4kZG90cy5maW5kKCdsaScpLmVxKE1hdGguZmxvb3IoXy5jdXJyZW50U2xpZGUgLyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpKS5hZGRDbGFzcygnc2xpY2stYWN0aXZlJykuYXR0cihcImFyaWEtaGlkZGVuXCIsIFwiZmFsc2VcIik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS52aXNpYmlsaXR5ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChkb2N1bWVudFtfLmhpZGRlbl0pIHtcbiAgICAgICAgICAgIF8ucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uYXV0b1BsYXkoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgICQuZm4uc2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgb3B0ID0gYXJndW1lbnRzWzBdLFxuICAgICAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgICAgICBsID0gXy5sZW5ndGgsXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIHJldDtcbiAgICAgICAgZm9yIChpOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdCA9PSAnb2JqZWN0JyB8fCB0eXBlb2Ygb3B0ID09ICd1bmRlZmluZWQnKVxuICAgICAgICAgICAgICAgIF9baV0uc2xpY2sgPSBuZXcgU2xpY2soX1tpXSwgb3B0KTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXQgPSBfW2ldLnNsaWNrW29wdF0uYXBwbHkoX1tpXS5zbGljaywgYXJncyk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJldCAhPSAndW5kZWZpbmVkJykgcmV0dXJuIHJldDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXztcbiAgICB9O1xuXG59KSk7XG4iXX0=
