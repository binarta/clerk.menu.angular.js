angular.module('checkpoint', [])
    .factory('account', [function() {
        return {
            getPermissions: function () {}
        };
    }])
    .factory('fetchAccountMetadata', function () {
        return jasmine.createSpy('fetchAccountMetadata');
    })
    .controller('SignoutController', function () {});