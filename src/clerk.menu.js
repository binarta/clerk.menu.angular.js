angular.module('clerk.menu', ['notifications', 'config'])
    .directive('clerkMenu', ['$rootScope', 'topicRegistry', 'config', ClerkMenuDirectiveFactory]);

function ClerkMenuDirectiveFactory($rootScope, topicRegistry, config) {
    return {
        restrict: 'E',
        templateUrl: function () {
            return $rootScope.clerkMenuTemplateUrl ? $rootScope.clerkMenuTemplateUrl : 'app/partials/clerk-menu.html'
        },
        link: function ($scope) {
            var putNamespaceOnScope = function () {
                $scope.namespace = config.namespace;
            };

            var putLocalePrefixOnScope = function (locale) {
                $scope.localePrefix = locale + '/';
            };

            function subscribeI18nLocale () {
                topicRegistry.subscribe('i18n.locale', putLocalePrefixOnScope);
            }

            topicRegistry.subscribe('config.initialized', function () {
                putNamespaceOnScope();
                if(config.supportedLanguages) subscribeI18nLocale();
            });

            $scope.$on('$destroy', function () {
                topicRegistry.unsubscribe('i18n.locale', putLocalePrefixOnScope);
            });
        }
    };
}