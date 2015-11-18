/*
 * 
 */

// Loads function f on document did load
function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f();}

// From http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
var isEventSupported = (function(){
    var tagNames = {
      'select':'input','change':'input',
      'submit':'form','reset':'form',
      'error':'img','load':'img','abort':'img'
    };
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

/*
 * Creates a two-way bound object for updating fields
 * - data contains the value of the model
 * - element contains the DOM element to update
 * - history contains an array of all changes
 */
function Former(element, data) {
	// Sets up data
	this.data = data;
	this.element = element;
	this.history = [];
	element.value = data;

	/* Adds event listeners */
	if (isEventSupported('input')) {
		element.addEventListener('input', this, false);
	} else if (isEventSupported('textInput')) {
		element.addEventListener('textInput', this, false);
	}
	element.addEventListener('change', this, false);
}

// Delegates what to do when given event happens
Former.prototype.handleEvent = function (event) {
	this.change(this.element.value, event.type);
};

// Simply updates the backend with the value of the model
Former.prototype.change = function (value, type) {
	this.data = value;
	console.log(localStorage);
	this.element.value = value;
	if (this.history.length === 0 || this.history.length > 0 && this.history[this.history.length-1] != value){
		this.history.push(value);
		// TODO: Fix the id - this is too fragile
		this.save(this.hashID(), this.history);
	}
};

Former.prototype.save = function(key, obj) {
	// TODO: Schedule a save for at most once every two seconds so as to not overwhelm storage
	localStorage.setItem(key, JSON.stringify(obj));
};

Former.prototype.get = function(key) {
	return JSON.parse(localStorage.getItem(key));
};

Former.prototype.hashID = function(){
	return window.location.href + '::FORM::' + this.element.id;
};

// Calls initializer when document loaded
r(function(){
	// Load all inputs and textareas into memory
	var inputs = document.querySelectorAll('form input[type=text]');
	var texts = document.querySelectorAll('form textarea');
	for (var i = 0; i < inputs.length; i++) {
		new Former(inputs[i],'');
	}
	for (i = 0; i < texts.length; i++) {
		new Former(texts[i],'');
	}
});