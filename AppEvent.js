/*  
  Application Event Manager. This is an static Object, facilitates 
  connector bus for decouples modules by using event ID 
  
  WARNING! Don't change this implementation, it's well tested and it works
  
  USAGE
  
  Register an "run always" event :    
  
  AppEvent.on('dataloaded',function(data){
    //process data
  },scope);
  
  Register an "execute once" event :  
  AppEvent.on('dataloaded',function(data){
    //process data
  },scope,true);
  
  Remove an event :   
  AppEvent.un('dataloaded');  
  
  Fire an event :   
  AppEvent.fire('dataloaded');  
  AppEvent.fire('dataloaded','showpanel');  
  
  AppEvent.fire('dataloaded',data); 
  
  @author Sushil Shinde 
 */
define(function () {

	var AppEvent = AppEvent || {};

	+ function (AppEvent) {
		var eventQueue = {};
		AppEvent.on = function (e, callback, scope, executeOnce) {
			eventQueue[e] = eventQueue[e] || [];
			eventQueue[e].executeOnce = executeOnce;
			eventQueue[e].scope = scope;
			eventQueue[e].push(callback);
		}

		AppEvent.un = function (e) {
			//TODO this implementation needs upgrade
			delete eventQueue[e];
		}

		AppEvent.fire = function (e, options) {

			var _fire = function () {
				var callabacks = eventQueue[e];
				if (callabacks) {
					callabacks.forEach(function (callback) {
						callback.call(eventQueue[e].scope || this, options);
					})
					if (eventQueue[e].executeOnce) {
						delete eventQueue[e];
					}
				}
			}

			if (typeof e === "object") {
				var eventArray = e;
				eventArray.forEach(function () {
					_fire.call(this, options);
				});
			} else {
				_fire.call(this, options);
			}
		}
	}(AppEvent);

	window.AppEvent = AppEvent;
});