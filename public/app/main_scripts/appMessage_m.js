angular.module('appMessage_m', []).factory('appMessage', [
function() {
	
return {
	ExceptionMsg : function(module, method, message){
		var that = this;
		that.module = module;
		that.method = method;
		that.message = message;
		
		that.toString = function(){
			return 'module: '+that.module
				+' | method: '+that.method
				+' | message: '+that.message;
		};
		return that;
	},
	UserMsg : function(type, message){
		var that = this;
		that.type = type;
		that.message = message;
		
		that.toString = function(){
			return 'type: '+that.type
				+' | message: '+that.message;
		};
		return that;
	},
};
}]);
