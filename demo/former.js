/*
 * 
 */

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

	// Wraps with .former class
	$(element).wrap('<div class="former"></div>');
	var wrapper = $(element.parentNode);

	// Add buttons as overlay on top right
	// TODO: make this look nicer...
	wrapper.append('<div class="hovering_buttons"><svg version="1.2" x="0" y="0" width="22" viewBox="-10 -10 150 150"><polygon points="64 0 83.8 42.1 128 48.9 96 81.7 103.6 128 64 106.1 24.4 128 32 81.7 0 48.9 44.2 42.1 "/></svg><svg version="1.1" x="0" y="0" width="24" viewBox="-10 -20 150 150"><path d="M72.9 3C44.2 3 20.2 26 17.6 55.2H0l27.9 32.3 27.9-32.3H39.1c2.6-16.8 16.8-30.1 33.5-30.1 18.9 0 33.9 15.9 33.9 35.4S90.9 95.9 72.5 95.9c-7.3 0-14.2-2.2-20.2-7.1l-12.9 17.7C49 114 60.6 118 72.5 118c30.5 0 55.4-25.7 55.4-57.5C128.3 28.7 103.4 3 72.9 3z"/><ellipse cx="72.9" cy="60.5" rx="13.3" ry="13.7"/></svg>');

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
$(function(){
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