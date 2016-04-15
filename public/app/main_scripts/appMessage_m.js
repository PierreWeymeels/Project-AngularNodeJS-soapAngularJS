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

	return {
		ExceptionMsg : ExceptionMsg,
		UserMsg : UserMsg,
	};
}]);
