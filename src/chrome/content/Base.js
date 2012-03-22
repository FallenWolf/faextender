/* FAExtender base */

if (!com) { var com = {}; }
if (!com.neocodenetworks) { com.neocodenetworks = {}; }
if (!com.neocodenetworks.faextender) { com.neocodenetworks.faextender = {}; }

com.neocodenetworks.faextender.Base = {
	// Get a jQuery instance
	getjQuery: function(doc) {
		// Load directly into our injection window
		var jQueryEnv = { window: doc.defaultView };

		// Return if jQuery was already loaded
		if (jQueryEnv.window.jQuery) {
			return jQueryEnv.window.jQuery;
		}
		
		// Components.utils.import("resource://faextender/jquery-1.7.min.js", jQueryEnv); // This doesn't work for some reason
		var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);  
		loader.loadSubScript("resource://faextender/jquery-1.7.min.js", jQueryEnv);
		
		var jQuery = jQueryEnv.window.jQuery;
		
		// Make sure jQuery was actually loaded
		if (jQuery == null) {
			com.neocodenetworks.faextender.Base.logError("Unable to load jQuery!");
			return null;
		}
		
		// Enable no conflict mode
		jQuery.noConflict();
		
		// Return jQuery object
		return jQuery;
	},

	// Get the prefs service
	getPrefsService: function() {
		return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	},

	// Determine if a page matches the location
	checkDomain: function(doc) {
		var loc = doc.location;
		if (!loc) return false;
		
		// Check domain
		return (loc.hostname.indexOf("furaffinity.net") > -1);
	},

	// Determine if a page matches the location
	checkLocation: function(doc, allowed) {
		var loc = doc.location;
		if (!loc) return false;
		
		if (!(allowed instanceof Array)) {
			allowed = [allowed];
		}
		
		// Check each allowed path
		for (var i = 0; i < allowed.length; i++) {
			var path = allowed[i];
			if (loc.pathname.indexOf(path) == 0) return true;
		}
		
		return false;
	},

	// Wrap xpath handling
	getXPath: function(doc, path) {
		return doc.evaluate(path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	},

	// Log an error
	logError: function(msg) {
		var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage("FAExtender error: " + msg);
	},
	logException: function(err) {
		com.neocodenetworks.faextender.Base.logError(err.name + " error @ line " + err.lineNumber + ":\r\n" + err.message);
	},
	debugMsg: function(msg, obj) {
		var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage("FAExtender debug: " + msg);
		
		if (obj) consoleService.logStringMessage(obj);
	},

	// List of functions to call
	targets: [],
	
	// Register a function to call on page load
	registerTarget: function(callback, locations) {
		if (callback == null) {
			com.neocodenetworks.faextender.Base.logError("Callback registered was null");
			return;
		}
		
		com.neocodenetworks.faextender.Base.targets.push({ "callback": callback, "locations": locations });
	},

	// Fired when an individual page/tab loads
	onPageLoad: function(e) {
		if (e.originalTarget instanceof HTMLDocument) {
			doc = e.originalTarget;
			
			// Check domain
			if (!com.neocodenetworks.faextender.Base.checkDomain(doc)) return;
			
			// Check targets
			var targets = com.neocodenetworks.faextender.Base.targets;
			
			for (var i = 0; i < targets.length; i++) {
				if (com.neocodenetworks.faextender.Base.checkLocation(doc, targets[i].locations)) {
					targets[i].callback(doc);
				}
			}
		}
	}
}