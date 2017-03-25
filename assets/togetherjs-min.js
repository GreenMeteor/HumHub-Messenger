/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint scripturl:true */
(function () {

  var defaultConfiguration = {
    // Disables clicks for a certain element.
    // (e.g., 'canvas' would not show clicks on canvas elements.)
    // Setting this to true will disable clicks globally.
    dontShowClicks: false,
    // Experimental feature to echo clicks to certain elements across clients:
    cloneClicks: false,
    // Enable Mozilla or Google analytics on the page when TogetherJS is activated:
    // FIXME: these don't seem to be working, and probably should be removed in favor
    // of the hub analytics
    enableAnalytics: false,
    // The code to enable (this is defaulting to a Mozilla code):
    analyticsCode: "UA-35433268-28",
    // The base URL of the hub (gets filled in below):
    hubBase: null,
    // A function that will return the name of the user:
    getUserName: null,
    // A function that will return the color of the user:
    getUserColor: null,
    // A function that will return the avatar of the user:
    getUserAvatar: null,
    // The siteName is used in the walkthrough (defaults to document.title):
    siteName: null,
    // Whether to use the minimized version of the code (overriding the built setting)
    useMinimizedCode: undefined,
    // Any events to bind to
    on: {},
    // Hub events to bind to
    hub_on: {},
    // Enables the alt-T alt-T TogetherJS shortcut; however, this setting
    // must be enabled early as TogetherJSConfig_enableShortcut = true;
    enableShortcut: false,
    // The name of this tool as provided to users.  The UI is updated to use this.
    // Because of how it is used in text it should be a proper noun, e.g.,
    // "MySite's Collaboration Tool"
    toolName: null,
    // Used to auto-start TogetherJS with a {prefix: pageName, max: participants}
    // Also with findRoom: "roomName" it will connect to the given room name
    findRoom: null,
    // If true, starts TogetherJS automatically (of course!)
    autoStart: false,
    // If true, then the "Join TogetherJS Session?" confirmation dialog
    // won't come up
    suppressJoinConfirmation: false,
    // If true, then the "Invite a friend" window won't automatically come up
    suppressInvite: false,
    // A room in which to find people to invite to this session,
    inviteFromRoom: null,
    // This is used to keep sessions from crossing over on the same
    // domain, if for some reason you want sessions that are limited
    // to only a portion of the domain:
    storagePrefix: "togetherjs",
    // When true, we treat the entire URL, including the hash, as the identifier
    // of the page; i.e., if you one person is on `http://example.com/#view1`
    // and another person is at `http://example.com/#view2` then these two people
    // are considered to be at completely different URLs
    includeHashInUrl: false,
    // When true, the WebRTC-based mic/chat will be disabled
    disableWebRTC: false,
    // When true, youTube videos will synchronize
    youtube: true,
    // Ignores the following console messages, disables all messages if set to true
    ignoreMessages: ["cursor-update", "keydown", "scroll-update"],
    // Ignores the following forms (will ignore all forms if set to true):
    ignoreForms: [":password"]
  };

  var styleSheet = "/togetherjs/togetherjs.css";

  var baseUrl = "https://togetherjs.com";
  if (baseUrl == "__" + "baseUrl__") {
    // Reset the variable if it doesn't get substituted
    baseUrl = "";
  }
  // True if this file should use minimized sub-resources:
  var min = "yes" == "__" + "min__" ? false : "yes" == "yes";

  var baseUrlOverride = localStorage.getItem("togetherjs.baseUrlOverride");
  if (baseUrlOverride) {
    try {
      baseUrlOverride = JSON.parse(baseUrlOverride);
    } catch (e) {
      baseUrlOverride = null;
    }
    if ((! baseUrlOverride) || baseUrlOverride.expiresAt < Date.now()) {
      // Ignore because it has expired
      localStorage.removeItem("togetherjs.baseUrlOverride");
    } else {
      baseUrl = baseUrlOverride.baseUrl;
      var logger = console.warn || console.log;
      logger.call(console, "Using TogetherJS baseUrlOverride:", baseUrl);
      logger.call(console, "To undo run: localStorage.removeItem('togetherjs.baseUrlOverride')");
    }
  }

  var configOverride = localStorage.getItem("togetherjs.configOverride");
  if (configOverride) {
    try {
      configOverride = JSON.parse(configOverride);
    } catch (e) {
      configOverride = null;
    }
    if ((! configOverride) || configOverride.expiresAt < Date.now()) {
      localStorage.removeItem("togetherjs.configOverride");
    } else {
      var shownAny = false;
      for (var attr in configOverride) {
        if (attr == "expiresAt" || ! configOverride.hasOwnProperty(attr)) {
          continue;
        }
        if (! shownAny) {
          console.warn("Using TogetherJS configOverride");
          console.warn("To undo run: localStorage.removeItem('togetherjs.configOverride')");
        }
        window["TogetherJSConfig_" + attr] = configOverride[attr];
        console.log("Config override:", attr, "=", configOverride[attr]);
      }
    }
  }

  var version = "unknown";
  // FIXME: we could/should use a version from the checkout, at least
  // for production
  var cacheBust = "";
  if ((! cacheBust) || cacheBust == "") {
    cacheBust = Date.now() + "";
  } else {
    version = cacheBust;
  }

  // Make sure we have all of the console.* methods:
  if (typeof console == "undefined") {
    console = {};
  }
  if (! console.log) {
    console.log = function () {};
  }
  ["debug", "info", "warn", "error"].forEach(function (method) {
    if (! console[method]) {
      console[method] = console.log;
    }
  });

  if (! baseUrl) {
    var scripts = document.getElementsByTagName("script");
    for (var i=0; i<scripts.length; i++) {
      var src = scripts[i].src;
      if (src && src.search(/togetherjs.js(\?.*)?$/) !== -1) {
        baseUrl = src.replace(/\/*togetherjs.js(\?.*)?$/, "");
        console.warn("Detected baseUrl as", baseUrl);
        break;
      } else if (src && src.search(/togetherjs-min.js(\?.*)?$/) !== -1) {
        baseUrl = src.replace(/\/*togetherjs-min.js(\?.*)?$/, "");
        console.warn("Detected baseUrl as", baseUrl);
        break;
      }
    }
  }
  if (! baseUrl) {
    console.warn("Could not determine TogetherJS's baseUrl (looked for a <script> with togetherjs.js and togetherjs-min.js)");
  }

  function addStyle() {
    var existing = document.getElementById("togetherjs-stylesheet");
    if (! existing) {
      var link = document.createElement("link");
      link.id = "togetherjs-stylesheet";
      link.setAttribute("rel", "stylesheet");
      link.href = baseUrl + styleSheet + "?bust=" + cacheBust;
      document.head.appendChild(link);
    }
  }

  function addScript(url) {
    var script = document.createElement("script");
    script.src = baseUrl + url + "?bust=" + cacheBust;
    document.head.appendChild(script);
  }

  var TogetherJS = window.TogetherJS = function TogetherJS(event) {
    if (TogetherJS.running) {
      var session = TogetherJS.require("session");
      session.close();
      return;
    }
    TogetherJS.startup.button = null;
    try {
      if (event && typeof event == "object") {
        if (event.target && typeof event) {
          TogetherJS.startup.button = event.target;
        } else if (event.nodeType == 1) {
          TogetherJS.startup.button = event;
        } else if (event[0] && event[0].nodeType == 1) {
          // Probably a jQuery element
          TogetherJS.startup.button = event[0];
        }
      }
    } catch (e) {
      console.warn("Error determining starting button:", e);
    }
    if (window.TowTruckConfig) {
      console.warn("TowTruckConfig is deprecated; please use TogetherJSConfig");
      if (window.TogetherJSConfig) {
        console.warn("Ignoring TowTruckConfig in favor of TogetherJSConfig");
      } else {
        window.TogetherJSConfig = TowTruckConfig;
      }
    }
    if (window.TogetherJSConfig && (! window.TogetherJSConfig.loaded)) {
      TogetherJS.config(window.TogetherJSConfig);
      window.TogetherJSConfig.loaded = true;
    }

    // This handles loading configuration from global variables.  This
    // includes TogetherJSConfig_on_*, which are attributes folded into
    // the "on" configuration value.
    var attr;
    var attrName;
    var globalOns = {};
    for (attr in window) {
      if (attr.indexOf("TogetherJSConfig_on_") === 0) {
        attrName = attr.substr(("TogetherJSConfig_on_").length);
        globalOns[attrName] = window[attr];
      } else if (attr.indexOf("TogetherJSConfig_") === 0) {
        attrName = attr.substr(("TogetherJSConfig_").length);
        TogetherJS.config(attrName, window[attr]);
      } else if (attr.indexOf("TowTruckConfig_on_") === 0) {
        attrName = attr.substr(("TowTruckConfig_on_").length);
        console.warn("TowTruckConfig_* is deprecated, please rename", attr, "to TogetherJSConfig_on_" + attrName);
        globalOns[attrName] = window[attr];
      } else if (attr.indexOf("TowTruckConfig_") === 0) {
        attrName = attr.substr(("TowTruckConfig_").length);
        console.warn("TowTruckConfig_* is deprecated, please rename", attr, "to TogetherJSConfig_" + attrName);
        TogetherJS.config(attrName, window[attr]);
      }


    }
    // FIXME: copy existing config?
    // FIXME: do this directly in TogetherJS.config() ?
    // FIXME: close these configs?
    var ons = TogetherJS.config.get("on");
    for (attr in globalOns) {
      if (globalOns.hasOwnProperty(attr)) {
        // FIXME: should we avoid overwriting?  Maybe use arrays?
        ons[attr] = globalOns[attr];
      }
    }
    TogetherJS.config("on", ons);
    for (attr in ons) {
      TogetherJS.on(attr, ons[attr]);
    }
    var hubOns = TogetherJS.config.get("hub_on");
    if (hubOns) {
      for (attr in hubOns) {
        if (hubOns.hasOwnProperty(attr)) {
          TogetherJS.hub.on(attr, hubOns[attr]);
        }
      }
    }

    if (! TogetherJS.startup.reason) {
      // Then a call to TogetherJS() from a button must be started TogetherJS
      TogetherJS.startup.reason = "started";
    }

    // FIXME: maybe I should just test for TogetherJS.require:
    if (TogetherJS._loaded) {
      var session = TogetherJS.require("session");
      addStyle();
      session.start();
      return;
    }
    // A sort of signal to session.js to tell it to actually
    // start itself (i.e., put up a UI and try to activate)
    TogetherJS.startup._launch = true;

    addStyle();
    var minSetting = TogetherJS.config.get("useMinimizedCode");
    TogetherJS.config.close("useMinimizedCode");
    if (minSetting !== undefined) {
      min = !! minSetting;
    }
    var requireConfig = TogetherJS._extend(TogetherJS.requireConfig);
    var deps = ["session", "jquery"];
    function callback(session, jquery) {
      TogetherJS._loaded = true;
      if (! min) {
        TogetherJS.require = require.config({context: "togetherjs"});
        TogetherJS._requireObject = require;
      }
    }
    if (! min) {
      if (typeof require == "function") {
        if (! require.config) {
          console.warn("The global require (", require, ") is not requirejs; please use togetherjs-min.js");
          throw new Error("Conflict with window.require");
        }
        TogetherJS.require = require.config(requireConfig);
      }
    }
    if (typeof TogetherJS.require == "function") {
      // This is an already-configured version of require
      TogetherJS.require(deps, callback);
    } else {
      requireConfig.deps = deps;
      requireConfig.callback = callback;
      if (! min) {
        window.require = requireConfig;
      }
    }
    if (min) {
      addScript("/togetherjs/togetherjsPackage.js");
    } else {
      addScript("/togetherjs/libs/require.js");
    }
  };

  TogetherJS.pageLoaded = Date.now();

  TogetherJS._extend = function (base, extensions) {
    if (! extensions) {
      extensions = base;
      base = {};
    }
    for (var a in extensions) {
      if (extensions.hasOwnProperty(a)) {
        base[a] = extensions[a];
      }
    }
    return base;
  };

  TogetherJS._startupInit = {
    // What element, if any, was used to start the session:
    button: null,
    // The startReason is the reason TogetherJS was started.  One of:
    //   null: not started
    //   started: hit the start button (first page view)
    //   joined: joined the session (first page view)
    reason: null,
    // Also, the session may have started on "this" page, or maybe is continued
    // from a past page.  TogetherJS.continued indicates the difference (false the
    // first time TogetherJS is started or joined, true on later page loads).
    continued: false,
    // This is set to tell the session what shareId to use, if the boot
    // code knows (mostly because the URL indicates the id).
    _joinShareId: null,
    // This tells session to start up immediately (otherwise it would wait
    // for session.start() to be run)
    _launch: false
  };
  TogetherJS.startup = TogetherJS._extend(TogetherJS._startupInit);
  TogetherJS.running = false;

  TogetherJS.requireConfig = {
    context: "togetherjs",
    baseUrl: baseUrl + "/togetherjs",
    urlArgs: "bust=" + cacheBust,
    paths: {
      jquery: "libs/jquery-1.8.3.min",
      walkabout: "libs/walkabout/walkabout",
      esprima: "libs/walkabout/lib/esprima",
      falafel: "libs/walkabout/lib/falafel",
      tinycolor: "libs/tinycolor",
      whrandom: "libs/whrandom/random"
    }
  };

  TogetherJS._mixinEvents = function (proto) {
    proto.on = function on(name, callback) {
      if (typeof callback != "function") {
        console.warn("Bad callback for", this, ".once(", name, ", ", callback, ")");
        throw "Error: .once() called with non-callback";
      }
      if (name.search(" ") != -1) {
        var names = name.split(/ +/g);
        names.forEach(function (n) {
          this.on(n, callback);
        }, this);
        return;
      }
      if (this._knownEvents && this._knownEvents.indexOf(name) == -1) {
        var thisString = "" + this;
        if (thisString.length > 20) {
          thisString = thisString.substr(0, 20) + "...";
        }
        console.warn(thisString + ".on('" + name + "', ...): unknown event");
        if (console.trace) {
          console.trace();
        }
      }
      if (! this._listeners) {
        this._listeners = {};
      }
      if (! this._listeners[name]) {
        this._listeners[name] = [];
      }
      if (this._listeners[name].indexOf(callback) == -1) {
        this._listeners[name].push(callback);
      }
    };
    proto.once = function once(name, callback) {
      if (typeof callback != "function") {
        console.warn("Bad callback for", this, ".once(", name, ", ", callback, ")");
        throw "Error: .once() called with non-callback";
      }
      var attr = "onceCallback_" + name;
      // FIXME: maybe I should add the event name to the .once attribute:
      if (! callback[attr]) {
        callback[attr] = function onceCallback() {
          callback.apply(this, arguments);
          this.off(name, onceCallback);
          delete callback[attr];
        };
      }
      this.on(name, callback[attr]);
    };
    proto.off = proto.removeListener = function off(name, callback) {
      if (this._listenerOffs) {
        // Defer the .off() call until the .emit() is done.
        this._listenerOffs.push([name, callback]);
        return;
      }
      if (name.search(" ") != -1) {
        var names = name.split(/ +/g);
        names.forEach(function (n) {
          this.off(n, callback);
        }, this);
        return;
