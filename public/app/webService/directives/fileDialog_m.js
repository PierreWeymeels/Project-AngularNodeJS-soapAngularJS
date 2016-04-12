angular.module('fileDialog_m', []).directive("fileDialog", [
function() {
	return {
		restrict : 'A',
		scope : true,
		link : function(scope, element, attr) {
			element.bind('change', function(evt) {//Attach a handler to a change event
				var reader = new FileReader();
				var file = evt.target.files[0];
				var name = file.name;
				if (file.type.localeCompare("text/xml") !== 0) {			
					element.val(null);
					scope.$emit('error', 'Only text/xml file !');
				} else {
					reader.addEventListener('load', function() {//end to read event
						scope.$emit('fileLoaded', reader.result, name);
					});
					reader.readAsText(file, 'UTF-8');
				}
			});
		}
	};
}]);
