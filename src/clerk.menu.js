angular.module('clerk.menu', ['notifications', 'config', 'angularx', 'i18n', 'toggle.edit.mode'])
    .directive('clerkMenu', ['ngRegisterTopicHandler', 'config', '$location', 'account', ClerkMenuDirectiveFactory])
    .run(['i18nRendererInstaller', 'editModeRenderer', '$rootScope', function (i18nRendererInstaller, editModeRenderer, $rootScope) {
        i18nRendererInstaller({
            open: function (args) {
                var scope = $rootScope.$new();
                scope.submit = function (translation) {
                    args.submit(translation);
                    editModeRenderer.close();
                };

                scope.cancel = function () {
                    editModeRenderer.close();
                };

                scope.translation = args.translation;
                scope.editor = args.editor || 'default';
                
                editModeRenderer.open({
                    template: args.template,
                    scope: scope
                });
            }
        });
    }]);

function ClerkMenuDirectiveFactory(ngRegisterTopicHandler, config, $location, account) {
    return {
        scope: true,
        restrict: 'E',
        template: '<div checkpoint-permission-for="edit.mode">' +
        '<div ng-if="permitted">' +
        '<div id="binarta-clerk-menu-top-fix"></div>' +
        '<div id="binarta-clerk-menu-wrapper">' +
        '<div id="binarta-clerk-menu">' +
        '<div class="binarta-clerk-menu-left">' +
        '<div class="binarta-clerk-menu-brand" ng-if="published">' +
        '<a href="https://binarta.com">' +
        '<img src="//s3-eu-west-1.amazonaws.com/binarta/image/clerk-menu/logo.png"' +
        'srcset="//s3-eu-west-1.amazonaws.com/binarta/image/clerk-menu/logo.png 1x,' +
        '//s3-eu-west-1.amazonaws.com/binarta/image/clerk-menu/logo@2x.png 2x,' +
        '//s3-eu-west-1.amazonaws.com/binarta/image/clerk-menu/logo@3x.png 3x"' +
        'alt="Binarta logo"' +
        'class="binarta-clerk-menu-brand-normal">' +
        '<img src="//s3-eu-west-1.amazonaws.com/binarta/image/clerk-menu/logo-small.png"' +
        'srcset="//s3-eu-west-1.amazonaws.com/binarta/image/clerk-menu/logo-small.png 1x,' +
        '//s3-eu-west-1.amazonaws.com/binarta/image/clerk-menu/logo-small@2x.png 2x,' +
        '//s3-eu-west-1.amazonaws.com/binarta/image/clerk-menu/logo-small@3x.png 3x"' +
        'alt="Binarta logo"' +
        'class="binarta-clerk-menu-brand-small">' +
        '</a>' +
        '</div>' +
        '<div ng-if="!published">' +
        '<a class="btn-clerk-menu btn-clerk-menu-publish" href="https://binarta.com/#!/applications">' +
        '<img src="//s3-eu-west-1.amazonaws.com/binarta/image/clerk-menu/logo-small.png"' +
        'srcset="//s3-eu-west-1.amazonaws.com/binarta/image/clerk-menu/logo-small.png 1x,' +
        '//s3-eu-west-1.amazonaws.com/binarta/image/clerk-menu/logo-small@2x.png 2x,' +
        '//s3-eu-west-1.amazonaws.com/binarta/image/clerk-menu/logo-small@3x.png 3x"' +
        'alt="Binarta logo">' +
        '<span>UPGRADEN</span>' +
        '</a>' +
        '</div>' +
        '</div>' +
        '<div class="binarta-clerk-menu-buttons">' +
        '<div class="clerk-menu-item" ng-class="{true:\'open\'}[editModeOpened]">' +
        '<button toggle-edit-mode ng-click="toggleEditMode()" accesskey="e" class="btn-clerk-menu btn-clerk-menu-edit" ng-class="{true:\'active\'}[editing]"' +
        'checkpoint-permission-for="edit.mode" ng-disabled="!permitted || editModeOpened"' +
        'analytics-on="click" analytics-category="clerk-menu" analytics-event="toggle-edit-mode">' +
        '<i class="fa fa-magic fa-fw"></i>' +
        '<span>EDIT</span>' +
        '</button>' +
        '<div class="dropdown-menu" role="menu" aria-labelledby="editModeMenu">' +
        '<div class="dropdown-menu-inner">' +
        '<div edit-mode-renderer></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="clerk-menu-item" seo-support>' +
        '<button class="btn-clerk-menu" data-toggle="dropdown" type="button" role="button" ng-click="open()">' +
        '<i class="fa fa-globe fa-fw"></i>' +
        '<span>SEO</span>' +
        '</button>' +
        '</div>' +
        '<div class="clerk-menu-item">' +
        '<a class="btn-clerk-menu" href="https://binarta.com/#!/contact/Support {{namespace}}?email={{user.email}}">' +
        '<i class="fa fa-life-ring fa-fw"></i>' +
        '<span>HELP</span>' +
        '</a>' +
        '</div>' +
        '<div class="clerk-menu-item">' +
        '<a class="btn-clerk-menu" href="#!/{{localePrefix}}admin">' +
        '<i class="fa fa-cog fa-fw"></i>' +
        '<span class="visible-xs">INST</span>' +
        '<span class="hidden-xs">INSTELLINGEN</span>' +
        '</a>' +
        '</div>' +
        '<div class="clerk-menu-item">' +
        '<button class="btn-clerk-menu dropdown-toggle" data-toggle="dropdown" type="button" id="accountMenu" role="button" aria-expanded="false">' +
        '<i class="fa fa-user fa-fw"></i>' +
        '<span>ACCOUNT</span>' +
        '</button>' +
        '<ul class="dropdown-menu account-menu" role="menu" aria-labelledby="accountMenu">' +
        '<li><a href="#!/{{localePrefix}}changemypassword">Wachtwoord veranderen</a></li>' +
        '<li><a href="https://binarta.com/#!/applications">Mijn websites</a></li>' +
        '<li ng-controller="SignoutController">' +
        '<a href="" ng-click="submit()">' +
        '<i class="fa fa-sign-out"></i> Uitloggen' +
        '</a>' +
        '</li>' +
        '</ul>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>',
        link: function (scope) {

            scope.namespace = config.namespace;
            if(config.supportedLanguages) putLocalePrefixOnScope();

            function putLocalePrefixOnScope() {
                ngRegisterTopicHandler(scope, 'i18n.locale', function (locale) {
                    scope.localePrefix = locale + '/';
                });
            }

            scope.$on('edit.mode.renderer', function (event, args) {
                scope.editModeOpened = args.open;
            });

            account.getMetadata().then(function(metadata) {
                scope.user = metadata;
            }, function() {
                scope.user = {};
            });

            var host = $location.host();
            var hostToCheck = 'binarta.com';
            scope.published = host.indexOf(hostToCheck, host.length - hostToCheck.length) == -1;
        }
    };
}