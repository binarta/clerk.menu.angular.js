angular.module('clerk.menu', ['notifications', 'config'])
    .directive('clerkMenu', ['topicRegistry', 'config', '$route', ClerkMenuDirectiveFactory]);

function ClerkMenuDirectiveFactory(topicRegistry, config, $route) {
    return {
        restrict: 'E',
        templateUrl: $route.routes['/template/clerk-menu'].templateUrl,
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