angular.module('browser.info', [])
    .service('browserInfo', function () {
        init();

        function init() {
            this.mobile = false;
            this.tablet = false;
        }

        this.setDevice = function (device) {
            init();
            if (device == 'mobile') this.mobile = true;
            if (device == 'tablet') this.tablet = true;
        }
    });
