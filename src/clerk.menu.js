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
    }

    function binartaMenuRunnerService($rootScope, $document, $window, $compile, $templateCache, config, binarta, browserInfo, topicMessageDispatcher) {
        var body = $document.find('body');
        var scope = $rootScope.$new();
        var element;

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
            if(!element) renderBinartaMenu();
        }

        function onSignedOut() {
            removeElement();
            removeBodyClass();
        }

        function removeElement() {
            if (element) {
                element.remove();
                element = undefined;
            }
        }

        function removeBodyClass() {
            body.removeClass('bin-menu');
        }

        function addBodyClass() {
            body.addClass('bin-menu');
        }

        function renderBinartaMenu() {
            binarta.application.config.findPublic('platform.brand', renderBrandedBinartaMenu);
        }

        function renderBrandedBinartaMenu(brand) {
            var isClerk = hasEditModePermission();
            scope.brand = brand;
            scope.showBranding = isClerk;
            scope.showUpgradeButton = isTrial() && !isOnBinarta();
            scope.showBasket = !isClerk && !isOnBinarta();
            scope.showEdit = isClerk;
            scope.showSeo = isClerk;
            scope.showSiteSettings = isClerk;
            scope.showAccount = !isClerk;
            scope.showChangePassword = isClerk;
            scope.showExternalApplications = isClerk && !isOnBinarta() && !isWebstersBrand(brand);
            scope.showInternalApplications = isOnBinarta();
            binarta.application.config.findPublic('platform.theme.options.enabled', function (isEnabled) {
                scope.showTheme = isClerk && (isEnabled != 'false');
            });
            scope.isPage = isPage;
            scope.signout = signout;
            if (isClerk) registerEditModeRendererEvents();

            element = angular.element($templateCache.get('bin-clerk-menu.html'));
            $compile(element)(scope);
            addBodyClass();
            body.prepend(element);
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
                setRememberedPosition();
                closePopup();
                scope.editModeOpened = true;
                body.addClass(menuOpenedClass);
            }

            function closeMain() {
                scope.editModeOpened = false;
                body.removeClass(menuOpenedClass);
                goToRememberedPosition();
            }

            function openPopup() {
                scope.showPopup = true;
            }

            function closePopup() {
                scope.showPopup = false;
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