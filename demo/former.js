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

	var parent = $(element.parentNode);

	// Add .former class to parent div (assumes it has one)
	parent.addClass('former');

	// Add buttons as overlay on top right
	// TODO: make this look nicer...
	parent.append('<div class="hovering_buttons"><svg version="1.2" x="0" y="0" width="20" viewBox="0 0 128 128" xml:space="preserve"><polygon points="64 0 83.8 42.1 128 48.9 96 81.7 103.6 128 64 106.1 24.4 128 32 81.7 0 48.9 44.2 42.1 "/></svg><svg version="1.1" x="0" y="0" viewBox="-67 269 30 28" width="20" xml:space="preserve"><path d="M-50 270c-6.7 0-12.3 5.2-12.9 11.8h-4.1l6.5 7.3 6.5-7.3h-3.9c0.6-3.8 3.9-6.8 7.8-6.8 4.4 0 7.9 3.6 7.9 8 0 4.4-3.6 8-7.9 8 -1.7 0-3.3-0.5-4.7-1.6l-3 4c2.2 1.7 4.9 2.6 7.7 2.6 7.1 0 12.9-5.8 12.9-13C-37.1 275.8-42.9 270-50 270z"/><ellipse cx="-50" cy="283" rx="3.1" ry="3.1"/></svg></div>');

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