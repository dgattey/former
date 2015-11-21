/*
 * FORMER
 * ------
 * Contains all javascript for Former, the automatic, 
 * timeline-based backup solution, saved right to your browser.
 * When loaded, this script will Formerify all input[type=text]
 * and textareas in your page.
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
 * Creates an object for updating fields
 * - element.value is the source of truth for data
 * - element contains the DOM element to update
 * - history contains an array of all changes (saved to
 *   localStorage too, so should persist across sessions)
 */
function Former(element) {
	/* Sets up data based on local storage */
	this.element = element;
	this.history = this.get() || [];
	element.value = '';

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
	var hovering = $('<div class="hovering_buttons"></div>').appendTo(wrapper);
	var clearButton = $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0" viewBox="0 0 128 128" width="15" xml:space="preserve"><path d="M121.8 113.5c0 4.1-1.5 7.5-4.4 10.1 -2.6 3-6 4.4-10.1 4.4 -4.1 0-7.6-1.5-10.6-4.4L64.2 86.6l-33 36.9c-2.6 3-6 4.4-10.1 4.4 -4.1 0-7.6-1.5-10.6-4.4 -3-2.6-4.4-6-4.4-10.1 0-4.1 1.5-7.6 4.4-10.6l34-38.9 -34-38.9c-3-2.6-4.4-6-4.4-10.1 0-4.1 1.5-7.6 4.4-10.6 3-3 6.5-4.4 10.6-4.4 4.1 0 7.5 1.5 10.1 4.4l33 37.4L96.7 4.4c3-3 6.5-4.4 10.6-4.4 4.1 0 7.5 1.5 10.1 4.4 3 3 4.4 6.5 4.4 10.6 0 4.1-1.5 7.5-4.4 10.1L83.4 64l34 38.9C120.4 105.8 121.8 109.4 121.8 113.5z"/></svg>')
		.appendTo(hovering);
	var timelineButton = $('<svg class="timeline_button" version="1.1" x="0" y="0" width="22" viewBox="-20 -10 148 148"><path d="M72.9 3C44.2 3 20.2 26 17.6 55.2H0l27.9 32.3 27.9-32.3H39.1c2.6-16.8 16.8-30.1 33.5-30.1 18.9 0 33.9 15.9 33.9 35.4S90.9 95.9 72.5 95.9c-7.3 0-14.2-2.2-20.2-7.1l-12.9 17.7C49 114 60.6 118 72.5 118c30.5 0 55.4-25.7 55.4-57.5C128.3 28.7 103.4 3 72.9 3z"/><ellipse cx="72.9" cy="60.5" rx="13.3" ry="13.7"/></svg>')
		.appendTo(hovering);

	// Click handlers
	var former = this;
	$(element).click(function(){former.updateModel();});
	clearButton.click(function(){former.clear();});
	timelineButton.click(function(){former.timelineButtonClicked();});
}

/*
 * Clears all history of this input/textarea and shows
 * that fact to the user
 */
Former.prototype.clear = function(){
	// TODO: prompt
	console.log('clear clicked!', this);
};

/*
 * Shows or hides the timeline in response to the button being clicked.
 */
Former.prototype.timelineButtonClicked = function(){
	var hidden = this.timeline === undefined;

	// Make sure we save the model before showing timeline
	this.updateModel();
	
	// Create it, since it didn't exist
	if (hidden) {
		this.createTimeline();
		this.timeline.appendTo($(this.element.parentNode));
	}
};

/*
 * Hides the timeline if shown, and returns whether hiding was
 * successful. If the timeline didn't exist, it'll return false.
 */
Former.prototype.hideTimeline = function(){
	$(this.element).toggleClass('timeline-change', false);
	if (this.timeline) {
		this.timeline.remove();
		this.timeline = undefined;
		return true;
	}
	return false;
};

/*
 * Called in response to the user moving the timeline - just
 * updates the actual text, not the model.
 */
Former.prototype.moveTimeline = function(event){
	$(this.element).toggleClass('timeline-change', true);
	var val = $(event.target).prop('value');
	this.element.value = this.history[val]; // Don't update the model
};

/*
 * Creates timeline input element and sets up values. Also sets 
 * this.timeline to the wrapper around the input.
 */
Former.prototype.createTimeline = function() {
	var former = this;
	var tm = $('<input type="range"></input>');
	tm.prop('max', this.history.length - 1);
	tm.prop('value', tm.prop('max'));
	tm.on('input', function(event){former.moveTimeline(event);});
	tm.on('mouseup', function(event){former.hideTimeline(event);});

	// Represents the wrapped timeline object
	this.timeline = $('<div class="timeline"></div>').append(tm);
};

/*
 * Calls the appropriate handler for a given event
 */
Former.prototype.handleEvent = function(event) {
	this.updateModel(this.element.value);
};

/*
 * Given a value, updates the model and saves a new 
 * version of history if it's a new value
 */
Former.prototype.updateModel = function(value) {
	if (value === undefined) value = this.element.value;

	// Hide timeline if shown
	this.hideTimeline();

	// Don't save same data twice
	if (value == this.history[this.history.length - 1]) return;
	this.element.value = value;
	this.history.push(value);
	this.save(this.history);
};

/*
 * Saves an object to local storage safely and without 
 * overwhelming localStorage (by queuing saves for every
 * few seconds rather than at every change)
 */
Former.prototype.save = function(obj) {
	// TODO: Schedule a save for at most once every two seconds so as to not overwhelm storage
	console.log("Saving model " + this.hashID());
	localStorage.setItem(this.hashID(), JSON.stringify(obj));
};

/*
 * Gets an object out of local storage based on the hash ID
 */
Former.prototype.get = function() {
	return JSON.parse(localStorage.getItem(this.hashID()));
};

/*
 * Gives a unique ID for this element based on element ID
 * TODO: Make stronger
 */
Former.prototype.hashID = function(){
	return this.element.id;
};

/*
 * Initializes document and injects Former's for all 
 * inputs of type text and textareas that it finds.
 */
$(function(){
	$('input[type=text], textarea')
	.each(function(){
		return new Former(this);
	});
});