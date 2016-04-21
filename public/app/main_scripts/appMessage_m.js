angular.module('appMessage_m', []).factory('appMessage', ['$log',
function($log) {
    var queue = [];

	var ExceptionMsg = function(module, method, message) {
		var that = this;
		that.module = module;
		that.method = method;
		that.message = message;

		if (!ExceptionMsg.prototype._toString) {
			ExceptionMsg.prototype.toString = function() {
				//this instead that because that will be the first instance of the class !
				return 'module: ' + this.module 
					+ ' | method: ' + this.method 
					+ ' | message: ' + this.message;
			};
		};

		return that;
	};

	var UserMsg = function(type, message) {
		var that = this;
		that.type = type;
		that.message = message;

		if (!UserMsg.prototype.toString) {
			UserMsg.prototype.toString = function() {
				return 'type: ' + this.type + ' | message: ' + this.message;
			};
		}
		return that;
	};
	
	function allocateError(e, MODULE_TAG, method,terminal) {
		if ( e instanceof UserMsg)
			return (terminal) ? e.toString() : e;      
		else {
			var err = (queue.length === 0) ? e.message : 'capture parent '+queue.length;
			var errorStep = new ExceptionMsg(MODULE_TAG, method, err);
			queue.push(errorStep.toString());
			if(terminal){
				launchError();
				queue = [];
				var userMsg = new UserMsg('fatal error', 'from soap service');
				return userMsg.toString();
			}
			return e;
		}
	}
	
	function launchError(){
		var error = "";
		for (var i=0; i < queue.length; ++i) {
			error += queue[i]+'\n'; //Instead of queue.shift() because it is o(n)
		}
		$log.error(error);
	}

	return {
		//ExceptionMsg : ExceptionMsg,
		
		UserMsg : UserMsg,
		
		allocateError : function(e, MODULE_TAG, method, terminal){
			return allocateError(e, MODULE_TAG, method, terminal);
		}
	};
}]);