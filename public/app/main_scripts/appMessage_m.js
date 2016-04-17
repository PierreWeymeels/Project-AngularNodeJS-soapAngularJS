angular.module('appMessage_m', []).factory('appMessage', [
function() {

	var ExceptionMsg = function(module, method, message) {
		var that = this;
		that.module = module;
		that.method = method;
		that.message = message;

		if (!ExceptionMsg.prototype._toString) {
			ExceptionMsg.prototype._toString = function() {
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

		if (!UserMsg.prototype._toString) {
			UserMsg.prototype._toString = function() {
				return 'type: ' + this.type + ' | message: ' + this.message;
			};
		}
		return that;
	};
	
	function allocateError(e, MODULE_TAG, method,terminal) {
		if ( e instanceof appMessage.UserMsg)
			return (terminal) ? e._toString() : e;      
		else {
			if (!( e instanceof appMessage.ExceptionMsg))
				e = new ExceptionMsg(MODULE_TAG, method, e.message);
			$log.error(e._toString());
			var userMsg = new UserMsg('fatal error', 'from soap service');
			return (terminal) ? userMsg._toString() : userMsg;
		}
	}
	
	function allocateError(e, MODULE_TAG, method,terminal) {
		if ( e instanceof appMessage.UserMsg)
			return (terminal) ? e._toString() : e;      
		else {
			if (!( e instanceof appMessage.ExceptionMsg))
				e = new appMessage.ExceptionMsg(MODULE_TAG, method, e.message);
			if(terminal){
				$log.error(e._toString());
				var userMsg = new appMessage.UserMsg('fatal error', 'from soap service');
				return userMsg._toString();
			}else
				return e;
		}
	}

	return {
		ExceptionMsg : ExceptionMsg,
		
		UserMsg : UserMsg,
		
		allocateError : function(e, MODULE_TAG, method, terminal){
			return allocateError(e, MODULE_TAG, method, terminal);
		}
	};
}]);
