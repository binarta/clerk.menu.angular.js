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
            topicRegistry.subscribe('config.initialized', putNamespaceOnScope);
            $scope.$on('$destroy', function () {
                topicRegistry.unsubscribe('config.initialized', putNamespaceOnScope);
            });
        }
    };
}