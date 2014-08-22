angular.module('clerk.menu', ['notifications', 'config', 'angularx'])
    .directive('clerkMenu', ['ngRegisterTopicHandler', 'config', 'activeUserHasPermission', 'resourceLoader', 'binTemplate', ClerkMenuDirectiveFactory]);

function ClerkMenuDirectiveFactory(ngRegisterTopicHandler, config, activeUserHasPermission, resourceLoader, binTemplate) {
    return {
        restrict: 'E',
        template: '<div ng-include="templateUrl"></div>',
        link: function (scope, el, attrs) {
            binTemplate.setTemplateUrl({
                scope: scope,
                module: 'clerk.menu',
                name: 'clerk-menu.html',
                permission: 'edit.mode'
            });

            if (attrs.settings) scope.settings = scope.$eval(attrs.settings);

            scope.namespace = config.namespace;
            if(config.supportedLanguages) putLocalePrefixOnScope();

            function putLocalePrefixOnScope() {
                ngRegisterTopicHandler(scope, 'i18n.locale', function (locale) {
                    scope.localePrefix = locale + '/';
                });
            }

            var componentsDir = config.componentsDir || 'bower_components';

            activeUserHasPermission({
                yes: function () {
                    resourceLoader.add(componentsDir + '/binarta.clerk.menu.angular/css/clerk-menu.css');
                },
                no: function () {
                    resourceLoader.remove(componentsDir + '/binarta.clerk.menu.angular/css/clerk-menu.css');
                },
                scope: scope
            }, 'edit.mode');
        }
    };
}