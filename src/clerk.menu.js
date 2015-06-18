angular.module('clerk.menu', ['notifications', 'config', 'checkpoint', 'i18n', 'toggle.edit.mode', 'browser.info'])
    .directive('clerkMenu', ['config', '$location', 'account', 'browserInfo', '$window', '$rootScope', ClerkMenuDirectiveFactory])
    .run(['i18nRendererInstaller', 'editModeRenderer', '$rootScope', function (i18nRendererInstaller, editModeRenderer, $rootScope) {
        i18nRendererInstaller({
            open: function (args) {
                var rendererScope = angular.extend($rootScope.$new(), {
                    submit: function (translation) {
                        args.submit(translation);
                        editModeRenderer.close();
                    },
                    cancel: function () {
                        editModeRenderer.close();
                    },
                    erase: function () {
                        rendererScope.translation = '';
                    },
                    translation: args.translation,
                    editor: args.editor || 'default'
                });

                editModeRenderer.open({
                    template: args.template,
                    scope: rendererScope
                });
            }
        });
    }]);

function ClerkMenuDirectiveFactory(config, $location, account, browserInfo, $window, $rootScope) {
    return {
        scope: true,
        restrict: 'E',
        template: '<div checkpoint-permission-for="edit.mode">' +
        '<div ng-if="permitted">' +
        '<div id="binarta-clerk-menu-top-fix"></div>' +
        '<div id="binarta-clerk-menu-wrapper">' +
        '<div id="binarta-clerk-menu" ng-class="{mobile: mobile}">' +
        '<div class="binarta-clerk-menu-left">' +
        '<div class="binarta-clerk-menu-brand" ng-if="published">' +
        '<a ng-href="#!{{localePrefix}}/" ng-disabled="editModeOpened">' +
        '<img src="//cdn.binarta.com/image/clerk-menu/logo.png"' +
        'srcset="//cdn.binarta.com/image/clerk-menu/logo.png 1x,' +
        '//cdn.binarta.com/image/clerk-menu/logo@2x.png 2x,' +
        '//cdn.binarta.com/image/clerk-menu/logo@3x.png 3x"' +
        'alt="Binarta logo"' +
        'class="binarta-clerk-menu-brand-normal">' +
        '<img src="//cdn.binarta.com/image/clerk-menu/logo-small.png"' +
        'srcset="//cdn.binarta.com/image/clerk-menu/logo-small.png 1x,' +
        '//cdn.binarta.com/image/clerk-menu/logo-small@2x.png 2x,' +
        '//cdn.binarta.com/image/clerk-menu/logo-small@3x.png 3x"' +
        'alt="Binarta logo"' +
        'class="binarta-clerk-menu-brand-small">' +
        '</a>' +
        '</div>' +
        '<div ng-if="!published">' +
        '<a class="btn-clerk-menu btn-clerk-menu-publish" href="https://binarta.com/#!/applications" ng-disabled="editModeOpened">' +
        '<img src="//cdn.binarta.com/image/clerk-menu/logo-small.png"' +
        'srcset="//cdn.binarta.com/image/clerk-menu/logo-small.png 1x,' +
        '//cdn.binarta.com/image/clerk-menu/logo-small@2x.png 2x,' +
        '//cdn.binarta.com/image/clerk-menu/logo-small@3x.png 3x"' +
        'alt="Binarta logo">' +
        '<span i18n code="clerk.menu.upgrade.button" default="UPGRADEN" read-only>{{var}}</span>' +
        '</a>' +
        '</div>' +
        '</div>' +
        '<div class="binarta-clerk-menu-buttons">' +
        '<div class="clerk-menu-item" ng-class="{true:\'open\'}[editModeOpened]">' +
        '<button toggle-edit-mode ng-click="toggleEditMode()" accesskey="e" class="btn-clerk-menu btn-clerk-menu-edit" ng-class="{true:\'active\'}[editing]"' +
        'checkpoint-permission-for="edit.mode" ng-disabled="!permitted || editModeOpened"' +
        'analytics-on="click" analytics-category="clerk-menu" analytics-event="toggle-edit-mode">' +
        '<i class="fa fa-magic fa-fw"></i>' +
        '<span i18n code="clerk.menu.edit.button" default="EDIT" read-only>{{var}}</span>' +
        '</button>' +
        '<div class="dropdown-menu" role="menu" aria-labelledby="editModeMenu">' +
        '<div class="dropdown-menu-inner clerk-menu-edit-mode-menu">' +
        '<div edit-mode-renderer></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="clerk-menu-item">' +
        '<a class="btn-clerk-menu" ng-disabled="isHomePageActive() || editModeOpened" ng-href="#!{{localePrefix}}/">' +
        '<i class="fa fa-home fa-fw"></i>' +
        '<span i18n code="clerk.menu.home.button" default="HOME" read-only>{{var}}</span>' +
        '</a>' +
        '</div>' +
        '<div class="clerk-menu-item" seo-support>' +
        '<button class="btn-clerk-menu" type="button" role="button" ng-click="open()" ng-disabled="editModeOpened">' +
        '<i class="fa fa-globe fa-fw"></i>' +
        '<span i18n code="clerk.menu.seo.button" default="SEO" read-only>{{var}}</span>' +
        '</button>' +
        '</div>' +
        '<div class="clerk-menu-item">' +
        '<a class="btn-clerk-menu" ng-href="https://binarta.com/#!/contact/Support {{namespace}}?email={{user.email}}" ng-disabled="editModeOpened">' +
        '<i class="fa fa-life-ring fa-fw"></i>' +
        '<span i18n code="clerk.menu.help.button" default="HELP" read-only>{{var}}</span>' +
        '</a>' +
        '</div>' +
        '<div class="clerk-menu-item">' +
        '<button class="btn-clerk-menu dropdown-toggle" data-toggle="dropdown" type="button" id="accountMenu" role="button" aria-expanded="false" ng-disabled="editModeOpened">' +
        '<i class="fa fa-user fa-fw"></i>' +
        '<span i18n code="clerk.menu.account.button" default="ACCOUNT" read-only>{{var}}</span>' +
        '</button>' +
        '<ul class="dropdown-menu account-menu" role="menu" aria-labelledby="accountMenu">' +
        '<li><a ng-href="#!{{localePrefix}}/admin" i18n code="clerk.menu.site.settings.link" default="Site instellingen" read-only><i class="fa fa-cog fa-fw"></i> {{var}}</a></li>' +
        '<li><a ng-href="#!{{localePrefix}}/changemypassword" i18n code="clerk.menu.change.password.link" default="Wachtwoord veranderen" read-only><i class="fa fa-lock fa-fw"></i> {{var}}</a></li>' +
        '<li><a href="https://binarta.com/#!/applications" i18n code="clerk.menu.my.applications.link" default="Mijn websites" read-only><i class="fa fa-external-link fa-fw"></i> {{var}}</a></li>' +
        '<li ng-controller="SignoutController"><a ng-href="#!{{localePrefix}}/" ng-click="submit()" i18n code="clerk.menu.logout.link" default="Uitloggen" read-only><i class="fa fa-sign-out fa-fw"></i> {{var}}</a></li>' +
        '</ul>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>',
        link: function (scope) {

            scope.namespace = config.namespace;
            scope.mobile = browserInfo.mobile;

            var position = 0;

            scope.$on('edit.mode.renderer', function (event, args) {
                if (scope.mobile) {
                    var body = $('body');
                    if (args.open && !scope.editModeOpened) {
                        position = body.scrollTop();
                        body.addClass('binarta-clerk-menu-fullscreen');
                        body.children().not('clerk-menu').hide();
                    }
                    if (!args.open && scope.editModeOpened) {
                        body.removeClass('binarta-clerk-menu-fullscreen');
                        body.children().not('clerk-menu').show();
                        $window.scrollTo(0, position);
                    }
                }
                scope.editModeOpened = args.open;
            });

            account.getMetadata().then(function (metadata) {
                scope.user = metadata;
            }, function () {
                scope.user = {};
            });

            var host = $location.host();
            var hostToCheck = 'binarta.com';
            scope.published = host.indexOf(hostToCheck, host.length - hostToCheck.length) == -1;

            scope.isHomePageActive = function () {
                return ($rootScope.localePrefix ? $rootScope.localePrefix + '/' : '/') == $location.path();
            };
        }
    };
}
