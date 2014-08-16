angular.module('clerk.menu', ['notifications', 'config'])
    .directive('clerkMenu', ['ngRegisterTopicHandler', 'config', 'activeUserHasPermission', 'resourceLoader', ClerkMenuDirectiveFactory]);

function ClerkMenuDirectiveFactory(ngRegisterTopicHandler, config, activeUserHasPermission, resourceLoader) {
    var componentsDir = config.componentsDir || 'bower_components';
    var styling = config.styling ? config.styling + '/' : '';

    return {
        restrict: 'E',
        templateUrl: componentsDir + '/binarta.clerk.menu.angular/template/' + styling + 'clerk-menu.html',
        link: function (scope) {
            scope.namespace = config.namespace;
            if(config.supportedLanguages) putLocalePrefixOnScope();

            function putLocalePrefixOnScope() {
                ngRegisterTopicHandler(scope, 'i18n.locale', function (locale) {
                    scope.localePrefix = locale + '/';
                });
            }

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