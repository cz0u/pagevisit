function createFile(name) {
	var file = Components.classes["@mozilla.org/file/directory_service;1"].
		getService(Components.interfaces.nsIProperties).
		get("ProfD", Components.interfaces.nsIFile);
	file.append("visitlog");
	file.append(name);
	if (file.exitst() == false) {
		file.create(file.NORMAL_FILE_TYPE, 0755);
	}
}

var file = Components.classes["@mozilla.org/file/directory_service;1"].
           getService(Components.interfaces.nsIProperties).
           get("ProfD", Components.interfaces.nsIFile);
file.append("visitlog");
if (file.exists() == false) {
	file.create(file.DIRECTORY_TYPE, 0755);
}
file.append("data.txt");

window.addEventListener("load", function load(event){
    window.removeEventListener("load", load, false); //remove listener, no longer needed
    PageVisit.init();
    var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"].
			   	   createInstance(Components.interfaces.nsIFileInputStream);
	fiStream.init(file, 0x01|0x08, 0666, 0);
	var sIStream = Components.classes["@mozilla.org/scriptableinputstream;1"].
		       	   createInstance(Components.interfaces.nsIScriptableInputStream);
	sIStream.init(fiStream);
    var data = "";
    while (true) {
    	var chunk = sIStream.read(4096);
    	if (chunk.length == 0)
    		break;
    	data += chunk;
    }
    //popup("DATA", data);
    if (data.length != 0) {
	    PageVisit.Page = JSON.parse(data);
	}
	sIStream.close();
	//popup("VisitLog", PageVisit.Page);
},false);

function popup(title, text) {
	try {
		Components.classes['@mozilla.org/alerts-service;1'].
		getService(Components.interfaces.nsIAlertsService).
		showAlertNotification(null, title, text, false, '', null);
	} catch(e) {
	}
}

var testObserver = {
	observe : function(sub, topic, data) {
		if (topic == "content-document-global-created") {
		}
	}
}

var closeObserver = {
	observe : function(sub, topic, data) {
		if (topic == "quit-application") {
			var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
               				createInstance(Components.interfaces.nsIFileOutputStream);
			// use 0x02 | 0x10 to open file for appending.
			foStream.init(file, 0x02|0x08|0x20, 0666, 0);

			var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
               				 createInstance(Components.interfaces.nsIConverterOutputStream);
			converter.init(foStream, "UTF-8", 0, 0);
			var jsonstr = JSON.stringify(PageVisit.Page);
			converter.writeString(jsonstr);
			converter.close(); // this closes foStream
		}
	}
}

var obService = Components.classes["@mozilla.org/observer-service;1"].
	getService(Components.interfaces.nsIObserverService);
obService.addObserver(testObserver, "content-document-global-created", false);
obService.addObserver(closeObserver, "quit-application", false);

var PageVisit = {
	Page: {},
	init: function() {
		//popup("Browser", gBrowser);
		popup("initWindow", window);
		if (gBrowser) 
			gBrowser.addEventListener("DOMContentLoaded", function(event) {
				PageVisit.onPageLoad(event);
			}, false);
	},
	onPageLoad: function(ev) {
		var doc = ev.originalTarget;
		var win = doc.defaultView;
		if (win === win.top) {
			popup("window", win.document.location);
			if (this.Page[win.document.location] === undefined) {
				this.Page[win.document.location] = 1;
			} else {
				this.Page[win.document.location] += 1;
			}
		}
		/*
		if (doc.nodeName != "#document") {
			return;
		}
		if (PageVisit.Page[doc.location] === undefined) {
			PageVisit.Page[doc.location] = 1;
			popup("URL", doc.location.href);
		} else {
			PageVisit.Page[doc.location] += 1;
		}
		*/
	},
	fini: function() {
	}
}

function url2host(url) {
	var i = url.indexOf('#');
	var rest;
	if (i == -1) {
		rest = url;
	} else {
		rest = url.slice(0,i);
	}
	i = rest.indexOf('://');
	var schem;
	if (i == -1) {
		schem = "http"
	} else {
		schem = rest.slice(0,i);
		rest = rest.slice(i+3);
	}
	i = rest.indexOf('/');
	var host;
	if (i == -1) {
		host = rest;
	} else {
		host = rest.slice(0, i);
	}
	return [schem, host];
}

var onMenuCommand = function(event) {
}
