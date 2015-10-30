angular.module('application', [])
    .service('applicationDataService', [function () {
        this.isExpired = function () {
            return {
                then: function (fn) {
                    fn(false);
                }
            };
        };
    }]);
