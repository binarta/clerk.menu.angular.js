(function () {
    'use strict';
    angular.module('clerk.menu', ['ngRoute', 'clerk.menu.templates', 'binarta-checkpointjs-angular1', 'config', 'toggle.edit.mode', 'i18n', 'browser.info', 'notifications'])
        .run(['i18nRendererInstaller', 'editModeRenderer', '$rootScope', '$location', installI18nRenderer])
        .run(['binartaMenuRunner', function (binartaMenu) {binartaMenu.run();}])
        .service('binartaMenuRunner', ['$rootScope', '$document', '$window', '$compile', '$templateCache', 'config', 'binarta', 'browserInfo', 'topicMessageDispatcher', binartaMenuRunnerService]);

    function installI18nRenderer(i18nRendererInstaller, editModeRenderer, $rootScope, $location) {
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
                            if (!args.editor) $('[name="translation"]').focus();
                        }
                    },
                    translation: args.translation,
                    editor: args.editor || 'default'
                });

                if (args.path) {
                    rendererScope.followLink = function () {
                        $location.path(args.path);
                        editModeRenderer.close();
                    };
                }

                editModeRenderer.open({
                    template: args.template,
                    scope: rendererScope
                });
            }
        });
    }

    function binartaMenuRunnerService($rootScope, $document, $window, $compile, $templateCache, config, binarta, browserInfo, topicMessageDispatcher) {
        var body = $document.find('body');
        var scope, menuIsInitialized;

        this.angularScope = function() {
            return scope;
        };

        this.run = function () {
            binarta.schedule(function () {
                if (!isExpired()) registerCheckpointEvents();
            });
        };

        function isExpired() {
            return isTrial() && binarta.application.profile().trial.expired;
        }

        function isTrial() {
            return binarta.application.profile().trial != undefined;
        }

        function registerCheckpointEvents() {
            binarta.checkpoint.profile.eventRegistry.add({
                signedin: onSignedIn,
                signedout: onSignedOut
            });
        }

        function onSignedIn() {
            if(!menuIsInitialized) {
                menuIsInitialized = true;
                renderBinartaMenu();
            }
        }

        function onSignedOut() {
            if (menuIsInitialized) scope.$destroy();
        }

        function renderBinartaMenu() {
            binarta.application.config.findPublic('platform.brand', renderBrandedBinartaMenu);
        }

        function renderBrandedBinartaMenu(brand) {
            var isClerk = hasEditModePermission();
            var element;
            scope = $rootScope.$new();
            scope.brand = brand;
            scope.showBranding = isClerk;
            scope.showUpgradeButton = isTrial() && !isOnBinarta();
            scope.showBasket = !isClerk && !isOnBinarta();
            scope.showEdit = isClerk;
            scope.showSeo = isClerk;
            scope.showSiteSettings = isClerk;
            scope.showAccount = !isClerk;
            scope.showChangePassword = isClerk;
            scope.showOrderHistory = !isOnBinarta();
            scope.showExternalApplications = isClerk && !isOnBinarta() && !isWebstersBrand(brand);
            scope.showInternalApplications = isOnBinarta();
            binarta.application.config.findPublic('platform.theme.options.enabled', function (isEnabled) {
                scope.showTheme = isClerk && (isEnabled != 'false');
            });
            scope.isPage = isPage;
            scope.signout = signout;
            if (isClerk) registerEditModeRendererEvents();

            element = $compile($templateCache.get('bin-clerk-menu.html'))(scope);
            addBodyClass();
            body.prepend(element);


            scope.$on('$destroy', function () {
                element.remove();
                removeBodyClass();
                menuIsInitialized = false;
            });
        }

        function removeBodyClass() {
            body.removeClass('bin-menu');
        }

        function addBodyClass() {
            body.addClass('bin-menu');
        }

        function hasEditModePermission() {
            return binarta.checkpoint.profile.hasPermission('edit.mode');
        }

        function isOnBinarta() {
            return config.namespace == 'binarta';
        }

        function isPage(page) {
            return page == binarta.application.unlocalizedPath();
        }

        function signout() {
            binarta.checkpoint.profile.signout({
                unauthenticated: function () {
                    topicMessageDispatcher.fire('checkpoint.signout', 'ok');
                }
            });
        }

        function isWebstersBrand(brand) {
            return brand == 'websters';
        }

        function registerEditModeRendererEvents() {
            var rememberedPosition = 0;
            var menuOpenedClass= 'bin-menu-opened';
            var isMainMenuOpened = false;

            scope.$on('edit.mode.renderer', function (event, args) {
                args.open ? onOpen(args.id) : onClose(args.id);
            });

            function onOpen(id) {
                if (id == 'main') openMain();
                if (id == 'popup') openPopup();
            }

            function onClose(id) {
                if (id == 'main') closeMain();
                if (id == 'popup') closePopup();
            }

            function openMain() {
                isMainMenuOpened = true;
                setRememberedPosition();
                closePopup();
                openMenu();
            }

            function closeMain() {
                isMainMenuOpened = false;
                closeMenu();
                goToRememberedPosition();
            }

            function openPopup() {
                scope.showPopup = true;
                if (!isMainMenuOpened) openMenu();
            }

            function closePopup() {
                scope.showPopup = false;
                if (!isMainMenuOpened) closeMenu();
            }

            function openMenu() {
                scope.editModeOpened = true;
                body.addClass(menuOpenedClass);
            }

            function closeMenu() {
                scope.editModeOpened = false;
                body.removeClass(menuOpenedClass);
            }

            function setRememberedPosition() {
                if (isMobileOrTablet()) rememberedPosition = body.scrollTop();
            }

            function goToRememberedPosition() {
                if (isMobileOrTablet()) $window.scrollTo(0, rememberedPosition);
            }

            function isMobileOrTablet() {
                return browserInfo.mobile || browserInfo.tablet;
            }
        }
    }
})();