angular.module('clerk.menu', ['notifications', 'config', 'angularx'])
    .directive('clerkMenu', ['ngRegisterTopicHandler', 'config', 'activeUserHasPermission', 'resourceLoader', 'binTemplate', 'i18nRendererInstaller', '$location', 'account', ClerkMenuDirectiveFactory]);

function ClerkMenuDirectiveFactory(ngRegisterTopicHandler, config, activeUserHasPermission, resourceLoader, binTemplate, i18nRendererInstaller, $location, account) {
    return {
        scope: true,
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

            i18nRendererInstaller({
                open: function(args) {
                    scope.submit = function (translation) {
                        args.submit(translation);
                        scope.init();
                    };
                    scope.cancel = function () {
                        scope.init();
                    };
                    scope.translation = args.translation;
                    scope.editor = args.editor || 'default';
                }
            });

            scope.init = function () {
                scope.translation = undefined;
                scope.editor = undefined;
            };

            account.getMetadata().then(function(metadata) {
                scope.user = metadata;
            }, function() {
                scope.user = {};
            });

            activeUserHasPermission({
                yes: function () {
                    resourceLoader.add(componentsDir + '/binarta.clerk.menu.angular/css/clerk-menu.css');
                },
                no: function () {
                    resourceLoader.remove(componentsDir + '/binarta.clerk.menu.angular/css/clerk-menu.css');
                },
                scope: scope
            }, 'edit.mode');

            var host = $location.host();
            var hostToCheck = 'binarta.com';
            scope.published = host.indexOf(hostToCheck, host.length - hostToCheck.length) == -1;
        }
    };
}