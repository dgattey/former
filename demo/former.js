/*
 * 
 */

// Loads function f on document did load
function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()};

// From http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
var isEventSupported = (function(){
    var tagNames = {
      'select':'input','change':'input',
      'submit':'form','reset':'form',
      'error':'img','load':'img','abort':'img'
    }
    function isEventSupported(eventName) {
      var el = document.createElement(tagNames[eventName] || 'div');
      eventName = 'on' + eventName;
      var isSupported = (eventName in el);
      if (!isSupported) {
        el.setAttribute(eventName, 'return;');
        isSupported = typeof el[eventName] == 'function';
      }
      el = null;
      return isSupported;
    }
    return isEventSupported;
  })();

function save(key, obj) {
	localStorage.setItem(key, JSON.stringify(obj));
}

function get(key) {
	return JSON.parse(localStorage.getItem(key));
}

// Sets up two way data binding for element "element", with initial
// data "data"
function Former(element, data) {
	// Sets up data
	this.data = data;
	this.element = element;
	this.history = [];
	element.value = data;

	/* Adds event listeners */
	if (isEventSupported('input')) {
		element.addEventListener("input", this, false);
	} else if (isEventSupported('textInput')) {
		element.addEventListener("textInput", this, false);
	}
	element.addEventListener("change", this, false);
}

// Delegates what to do when given event happens
Former.prototype.handleEvent = function (event) {
	this.change(this.element.value, event.type);
};

// Simply updates the backend with the value of the model
Former.prototype.change = function (value, type) {
	this.data = value;
	this.element.value = value;
	if (this.history.length == 0 || this.history.length > 0 && this.history[this.history.length-1] != value){
		this.history.push(value);
		// TODO: Fix the id - this is too fragile
		save(this.element.id, this.history);
	}
};

// Calls initializer when document loaded
r(function(){
	// Load all inputs and textareas into memory
	var inputs = document.querySelectorAll("form input[type=text]");
	var texts = document.querySelectorAll("form textarea");
	for (var i = 0; i < inputs.length; i++) {
		new Former(inputs[i],'');
	}
	for (i = 0; i < texts.length; i++) {
		new Former(texts[i],'');
	}
});