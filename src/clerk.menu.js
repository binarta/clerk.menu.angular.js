angular.module('clerk.menu', ['ngRoute', 'checkpoint', 'i18n', 'toggle.edit.mode', 'config'])
    .run(['i18nRendererInstaller', 'editModeRenderer', '$rootScope', '$location', function (i18nRendererInstaller, editModeRenderer, $rootScope, $location) {
        i18nRendererInstaller({
            open: function (args) {
                var rendererScope = angular.extend($rootScope.$new(), {
                    submit: function () {
                        args.submit(rendererScope.translation);
                        editModeRenderer.close();
                    },
                    cancel: function () {
                        editModeRenderer.close();
                    },
                    erase: function () {
                        rendererScope.translation = '';
                        if (rendererScope.i18nForm) {
                            rendererScope.i18nForm.translation.$setViewValue('');
                            rendererScope.i18nForm.translation.$render();
                            $('[name="translation"]').focus();
                        }
                    },
                    translation: args.translation,
                    editor: args.editor || 'default'
                });

                if (args.href) {
                    rendererScope.followLink = function () {
                        $location.path(removeHashbang(args.href));
                        editModeRenderer.close();
                    };
                }

                editModeRenderer.open({
                    template: args.template,
                    scope: rendererScope
                });
            }
        });

        function removeHashbang(href) {
            return href.replace('#!', '');
        }
    }])
    .run(['$rootScope', '$document', '$window', '$compile', '$location', '$routeParams', 'fetchAccountMetadata', 'account', 'config', function ($rootScope, $document, $window, $compile, $location, $routeParams, fetchAccountMetadata, account, config) {
        var body = $document.find('body');
        var scope = $rootScope.$new();
        var element;

        fetchAccountMetadata({
            ok: function () {
                account.getPermissions().then(function (permissions) {
                    var isClerk = permissions.reduce(function (p, c) {
                        return p || c.name == 'edit.mode';
                    }, undefined);
                    renderBinartaMenu(isClerk);
                });
            },
            unauthorized: function () {
                if (element) element.remove();
                body.removeClass('bin-menu');
            },
            scope: scope
        });

        function renderBinartaMenu(isClerk) {
            var template;

            if (isClerk) {
                var host = $location.host();
                var hostToCheck = 'binarta.com';
                var isOnBinartaDomain = host.indexOf(hostToCheck, host.length - hostToCheck.length) != -1;
                template = getClerkTemplate(isOnBinartaDomain);
                var rememberedPosition = 0;

                scope.$on('edit.mode.renderer', function (event, args) {
                    if (args.id == 'popup' && args.open) {
                        $('[edit-mode-renderer="main"]').hide();
                        $('[edit-mode-renderer="popup"]').show();
                    } else {
                        $('[edit-mode-renderer="popup"]').hide();
                        $('[edit-mode-renderer="main"]').show();
                    }

                    if (args.id == 'main') {
                        scope.editModeOpened = args.open;
                        if (args.open) openMenu();
                        else closeMenu();
                    }
                });

                function openMenu() {
                    if ((body.hasClass('mobile') || body.hasClass('tablet')) && !body.hasClass('bin-menu-opened')) {
                        rememberedPosition = body.scrollTop();
                        body.addClass('bin-menu-opened');
                    }
                }

                function closeMenu() {
                    if ((body.hasClass('mobile') || body.hasClass('tablet')) && body.hasClass('bin-menu-opened')) {
                        body.removeClass('bin-menu-opened');
                        $window.scrollTo(0, rememberedPosition);
                    }
                }
            } else {
                template = getUserTemplate();
            }

            element = angular.element(template);
            $compile(element)(scope);
            body.addClass('bin-menu');
            body.prepend(element);

            scope.isPage = function (page) {
                return localePrefix() + (page || '') == $location.path();
            };

            function localePrefix() {
                return '/' + ($routeParams.locale ? $routeParams.locale + '/' : '');
            }
        }

        function isBinartaNamespace() {
            return config.namespace == 'binarta';
        }

        function getClerkTemplate(isOnBinartaDomain) {
            return '<div id="bin-menu" class="bin-menu-clerk">' +
                '<div class="bin-menu-left">' +
                (
                    isOnBinartaDomain
                        ? '<a class="btn-bin-menu btn-bin-menu-publish" ng-href="{{binartaUpgradeUri}}" ng-disabled="editModeOpened">' +
                    '<img src="//cdn.binarta.com/image/clerk-menu/logo-small.png"' +
                    'srcset="//cdn.binarta.com/image/clerk-menu/logo-small.png 1x,' +
                    '//cdn.binarta.com/image/clerk-menu/logo-small@2x.png 2x,' +
                    '//cdn.binarta.com/image/clerk-menu/logo-small@3x.png 3x"' +
                    'alt="Binarta logo">' +
                    '<span i18n code="clerk.menu.upgrade.button" read-only>{{var}}</span>' +
                    '</a>'
                        : '<div class="bin-menu-brand">' +
                    '<a ng-href="#!{{localePrefix}}/" ng-disabled="editModeOpened">' +
                    '<img src="//cdn.binarta.com/image/clerk-menu/logo.png"' +
                    'srcset="//cdn.binarta.com/image/clerk-menu/logo.png 1x,' +
                    '//cdn.binarta.com/image/clerk-menu/logo@2x.png 2x,' +
                    '//cdn.binarta.com/image/clerk-menu/logo@3x.png 3x"' +
                    'alt="Binarta logo"' +
                    'class="bin-menu-brand-normal">' +
                    '<img src="//cdn.binarta.com/image/clerk-menu/logo-small.png"' +
                    'srcset="//cdn.binarta.com/image/clerk-menu/logo-small.png 1x,' +
                    '//cdn.binarta.com/image/clerk-menu/logo-small@2x.png 2x,' +
                    '//cdn.binarta.com/image/clerk-menu/logo-small@3x.png 3x"' +
                    'alt="Binarta logo"' +
                    'class="bin-menu-brand-small">' +
                    '</a>' +
                    '</div>'
                ) +
                '</div>' +
                '<div class="bin-menu-actions">' +

                '<div class="bin-menu-item" ng-class="{true:\'open\'}[editModeOpened]">' +
                '<button toggle-edit-mode ng-click="toggleEditMode()" accesskey="e" class="btn-bin-menu btn-bin-menu-edit" ng-class="{true:\'active\'}[editing]"' +
                'checkpoint-permission-for="edit.mode" ng-disabled="!permitted || editModeOpened">' +
                '<i class="fa fa-magic fa-fw"></i>' +
                '<span i18n code="clerk.menu.edit.button" read-only>{{var}}</span>' +
                '</button>' +
                '<div class="dropdown-menu bin-menu-edit" role="menu" aria-labelledby="editModeMenu">' +
                '<div class="dropdown-menu-inner">' +
                '<div edit-mode-renderer="popup"></div>' +
                '<div edit-mode-renderer="main"></div>' +
                '</div>' +
                '</div>' +
                '</div>' +

                '<div class="bin-menu-item">' +
                '<a class="btn-bin-menu" ng-disabled="isPage() || editModeOpened" ng-href="#!{{localePrefix}}/">' +
                '<i class="fa fa-home fa-fw"></i>' +
                '<span i18n code="clerk.menu.home.button" read-only>{{var}}</span>' +
                '</a>' +
                '</div>' +

                //'<div class="bin-menu-item">' +
                //'<button class="btn-bin-menu" ng-disabled="editModeOpened">' +
                //'<i class="fa fa-paint-brush fa-fw"></i>' +
                //'<span i18n code="clerk.menu.theme.button" read-only>{{var}}</span>' +
                //'</button>' +
                //'</div>' +

                '<div class="bin-menu-item" seo-support>' +
                '<button class="btn-bin-menu" type="button" role="button" ng-click="open()" ng-disabled="editModeOpened">' +
                '<i class="fa fa-globe fa-fw"></i>' +
                '<span i18n code="clerk.menu.seo.button" read-only>{{var}}</span>' +
                '</button>' +
                '</div>' +

                '<div class="bin-menu-item">' +
                '<button class="btn-bin-menu dropdown-toggle" data-toggle="dropdown" type="button" id="accountMenu" role="button" aria-expanded="false" ng-disabled="editModeOpened">' +
                '<i class="fa fa-user fa-fw"></i>' +
                '<span i18n code="clerk.menu.account.button" read-only>{{var}}</span>' +
                '</button>' +
                '<ul class="dropdown-menu account-menu" role="menu" aria-labelledby="accountMenu">' +
                '<li><a ng-href="#!{{localePrefix}}/admin" i18n code="clerk.menu.site.settings.link" read-only><i class="fa fa-cog fa-fw"></i> {{var}}</a></li>' +
                '<li><a ng-href="#!{{localePrefix}}/changemypassword" i18n code="clerk.menu.change.password.link" read-only><i class="fa fa-lock fa-fw"></i> {{var}}</a></li>' +
                '<li checkpoint-permission-for="purchase.order.find.all" ng-show="permitted""><a ng-href="#!{{localePrefix}}/order-history" i18n code="clerk.menu.order.history.link" read-only><i class="fa fa-archive fa-fw"></i> {{var}}</a></li>' +
                '<li><a ng-href="{{binartaBaseUri}}#!/applications" target="_blank" i18n code="clerk.menu.my.applications.link" read-only><i class="fa fa-external-link fa-fw"></i> {{var}}</a></li>' +
                '<li ng-controller="SignoutController"><a ng-href="#!{{localePrefix}}/" ng-click="submit()" i18n code="clerk.menu.logout.link" read-only><i class="fa fa-sign-out fa-fw"></i> {{var}}</a></li>' +
                '</ul>' +
                '</div>' +

                '</div>' +
                '</div>';
        }

        function getUserTemplate() {
            return '<div id="bin-menu">' +
                '<div class="bin-menu-actions">' +

                '<div class="bin-menu-item">' +
                '<a class="btn-bin-menu" ng-disabled="isPage()" ng-href="#!{{localePrefix}}/">' +
                '<i class="fa fa-home fa-fw"></i>' +
                '<span i18n code="clerk.menu.home.button" read-only>{{var}}</span>' +
                '</a>' +
                '</div>' +
                (
                    isBinartaNamespace() ? '' :
                    '<div class="bin-menu-item" ng-controller="ViewBasketController" ng-show="quantity > 0">' +
                    '<a class="btn-bin-menu" ng-href="#!{{localePrefix}}/basket" ng-disabled="isPage(\'basket\')">' +
                    '<i class="fa fa-shopping-cart fa-fw"></i>' +
                    '<span i18n code="clerk.menu.basket.button" read-only>({{quantity}}) {{(subTotal || 0) / 100 | currency}}</span>' +
                    '</a>' +
                    '</div>'
                ) +
                '<div class="bin-menu-item">' +
                '<button class="btn-bin-menu dropdown-toggle" data-toggle="dropdown" type="button" id="accountMenu" role="button" aria-expanded="false" ng-disabled="editModeOpened">' +
                '<i class="fa fa-user fa-fw"></i>' +
                '<span i18n code="clerk.menu.account.button" read-only>{{var}}</span>' +
                '</button>' +
                '<ul class="dropdown-menu account-menu" role="menu" aria-labelledby="accountMenu">' +
                '<li><a ng-href="#!{{localePrefix}}/account" i18n code="clerk.menu.my.account.link" read-only><i class="fa fa-user fa-fw"></i> {{var}}</a></li>' +
                (
                    isBinartaNamespace()
                    ? '<li><a ng-href="#!{{localePrefix}}/applications" i18n code="clerk.menu.my.applications.link" read-only><i class="fa fa-th-large fa-fw"></i> {{var}}</a></li>'
                    : '<li><a ng-href="#!{{localePrefix}}/order-history" i18n code="clerk.menu.order.history.link" read-only><i class="fa fa-archive fa-fw"></i> {{var}}</a></li>'
                ) +
                '<li ng-controller="SignoutController"><a ng-href="#!{{localePrefix}}/" ng-click="submit()" i18n code="clerk.menu.logout.link" read-only><i class="fa fa-sign-out fa-fw"></i> {{var}}</a></li>' +
                '</ul>' +
                '</div>' +

                '</div>' +
                '</div>';
        }
    }]);