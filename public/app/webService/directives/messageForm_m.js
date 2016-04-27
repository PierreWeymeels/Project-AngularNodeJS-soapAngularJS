angular.module('messageForm_m', []).directive("messageForm", ['$log', '$timeout', '$compile',
  function ($log, $timeout, $compile) {
    return {
      restrict: "E",
      require: ["^^accordion", "ng-model"],
      priority: 0,
      terminal: false,
      scope: {
        formInfo: "=info", part: "=part",
      },
      templateUrl: "app/webService/templates/messageForm.html",
      replace: true,
      transclude: false,
      compile: function compile(element, attrs) {
        $log.debug("messageForm compile");
        return {
          pre: function preLink(scope, element, attrs) {
            //$log.debug("messageForm preLink", scope.formInfo);
            //scope.isSubForm = (scope.part === null);
            scope.respForm = angular
               .copy(scope.formInfo.defaultImputsResp);
          },
          post: function postLink(scope, element, attrs, controllers) {
            // $log.debug("messageForm postLink", scope.formInfo);
            var accordionC = controllers[0];
            var ngModelC = controllers[1];
            initialize();

            function initialize() {
              ngModelC.$setViewValue(scope.userSubmit);
              if (scope.formInfo.forms.length !== 0)
                addSubForms();
            }

            /*
             instead in template to avoid an angular throw into an endless
             loop, because it tries to render the operationForm directive
             regardless if formInfo has forms or not :
             DO THIS =>
             */
            function addSubForms() {
              $compile(
                 '<data-accordion >' +
                 '<data-message-form ng-repeat="form in formInfo.forms" data-info="form" data-part=null ng-model="userSubmit.forms[$index]"></data-message-form>' +
                 '</data-accordion>'
                 )(scope,
                 function (cloned, scope) {
                   var nodeBg = angular.element(element).find('#buttonGroup');
                   nodeBg.before(cloned);
                 }
              );
            }

            function readyToSend() {
              var result = false;
              var forms = scope.userSubmit.forms;
              for (var i = 0; i < forms.length; ++i) {
                if (forms[i].readyToSend === false)
                  return false;
              }
              return true;
            }

            accordionC.registerGroup(scope);
            scope.visible = false;

            scope.toggle = function () {
              scope.visible = !scope.visible;
              accordionC.toggleGroup(scope);
            }

            scope.reset = function () {
              scope.respForm = angular
                 .copy(scope.formInfo.defaultImputsResp);
            }

            scope.formSubmit = function () {
              if (readyToSend()) {
                scope.userSubmit.readyToSend = true;
                scope.userSubmit.imputs = scope.respForm;
                ngModelC.$setViewValue(scope.userSubmit);
              } else {
                scope.alertMsg = {'show': true, 'message': 'Miss (sub)form(s) submit !'};
                $timeout(function () {
                  scope.alertMsg = {'show': false, 'message': null};
                }, 1000);
              }
            }
          }
        }
      }, controller: ['$scope', function (scope, $scope, $parent) {
          // $log.debug("operationForm controller",scope.formInfo);
          var vm = this;

          initialize()

          function initialize() {
            scope.alertMsg = {'show': false, 'message': null};
            scope.isSubForm = (scope.part === null);
            var isSimpleForm =
               (scope.isSubForm) ? false : (scope.part.localeCompare(scope.formInfo.name) === 0);
            scope.userSubmit =
               {'part': scope.part, 'isSimpleForm': isSimpleForm, 'form': scope.formInfo.name,
                 'readyToSend': false, 'imputs': angular.copy(scope.formInfo.defaultImputsResp),
                 'forms': []};
          }

        }],
    }
  }]);
