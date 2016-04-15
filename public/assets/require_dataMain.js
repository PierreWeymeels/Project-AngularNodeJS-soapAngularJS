requirejs.config({
	//enforceDefine : true,

	baseUrl: '../',

	paths : {
		wsLibs: '../app/webService/service/libs',	
	},
});

//To detect errors that are not caught by local errbacks, you can override requirejs.onError():
requirejs.onError = function(err) {
	console.log('Requirejs error: Type=> ' + err.requireType + ' | Msg=> ' + err.message);
	if (err.requireType === 'timeout') {
		console.log('modules: ' + err.requireModules);
	}

}; 