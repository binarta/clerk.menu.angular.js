describe('clerk menu module', function () {
    beforeEach(module('binartajs-angular1-spec'));
    beforeEach(module('clerk.menu'));

    describe('on run', function () {
        var binarta, $rootScope, $location, binartaMenu, $document, $window, $q, $routeParams, editModeRenderer,
            i18nRendererInstaller, config, checkpointGateway, applicationGateway, browserInfo, topics;

        beforeEach(inject(function (_binarta_, _$rootScope_, _$location_, binartaMenuRunner, _$document_, _$window_,
                                    _$q_, _$routeParams_, _editModeRenderer_, _i18nRendererInstaller_, _config_,
                                    binartaCheckpointGateway, binartaApplicationGateway, _browserInfo_,
                                    topicMessageDispatcher) {
            binarta = _binarta_;
            $location = _$location_;
            binartaMenu = binartaMenuRunner;
            $rootScope = _$rootScope_;
            $document = _$document_;
            $window = _$window_;
            $q = _$q_;
            $routeParams = _$routeParams_;
            editModeRenderer = _editModeRenderer_;
            i18nRendererInstaller = _i18nRendererInstaller_;
            config = _config_;
            checkpointGateway = binartaCheckpointGateway;
            applicationGateway = binartaApplicationGateway;
            browserInfo = _browserInfo_;
            topics = topicMessageDispatcher;
        }));

        describe('installI18nRenderer', function () {
            var submitSpy, editModeSpy;

            it('i18nRendererInstaller is called', function () {
                expect(i18nRendererInstaller).toHaveBeenCalled();
            });

            describe('on open', function () {
                beforeEach(function () {
                    i18nRendererInstaller.calls.mostRecent().args[0].open({
                        submit: function (translation) {
                            submitSpy = translation;
                        },
                        translation: 'translation',
                        editor: 'editor',
                        template: 'template'
                    });
                    editModeSpy = editModeRenderer.open.calls.mostRecent().args[0];
                });

                it('editModeRenderer is called', function () {
                    expect(editModeSpy.template).toEqual('template');
                    expect(editModeSpy.scope.translation).toEqual('translation');
                    expect(editModeSpy.scope.editor).toEqual('editor');
                });

                it('on submit', function () {
                    editModeSpy.scope.translation = 'test';

                    editModeSpy.scope.submit();

                    expect(submitSpy).toEqual('test');
                    expect(editModeRenderer.close).toHaveBeenCalled();
                });

                it('on cancel', function () {
                    editModeSpy.scope.cancel();

                    expect(editModeRenderer.close).toHaveBeenCalled();
                });

                describe('on erase', function () {
                    it('no i18nForm', function () {
                        editModeSpy.scope.erase();

                        expect(editModeSpy.scope.translation).toEqual('');
                    });

                    describe('with i18nForm', function () {
                        var setViewValueSpy, isRendered, jQuerySelectorSpy, isFocused;

                        beforeEach(function () {
                            editModeSpy.scope.i18nForm = {
                                translation: {
                                    $setViewValue: function (value) {
                                        setViewValueSpy = value;
                                    },
                                    $render: function () {
                                        isRendered = true;
                                    }
                                }
                            };

                            $ = function (selector) {
                                jQuerySelectorSpy = selector;
                                return {
                                    focus: function () {
                                        isFocused = true;
                                    }
                                }
                            };

                            editModeSpy.scope.erase();
                        });

                        it('viewValue is cleared', function () {
                            expect(setViewValueSpy).toEqual('');
                        });

                        it('translation field is rendered', function () {
                            expect(isRendered).toBeTruthy();
                        });

                        it('focus element', function () {
                            expect(jQuerySelectorSpy).toEqual('[name="translation"]');
                            expect(isFocused).toBeTruthy();
                        });
                    });
                });

                it('no followLink defined', function () {
                    expect(editModeSpy.scope.followLink).toBeUndefined();
                });
            });

            describe('when element is an anchor', function () {
                var args;

                beforeEach(function () {
                    args = {
                        translation: 'translation',
                        editor: 'editor',
                        template: 'template',
                        href: '#!/link/to/page'
                    };
                });

                describe('and i18nRenderer is opened', function () {
                    beforeEach(function () {
                        i18nRendererInstaller.calls.mostRecent().args[0].open(args);
                        editModeSpy = editModeRenderer.open.calls.mostRecent().args[0];
                    });

                    it('on followLink', function () {
                        editModeSpy.scope.followLink();

                        expect($location.path()).toEqual('/link/to/page');
                        expect(editModeRenderer.close).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('binarta-menu', function () {
            var body, menuRunner, scope;

            beforeEach(inject(function (binartaMenuRunner) {
                menuRunner = binartaMenuRunner;
                scope = menuRunner.angularScope();
                body = $document.find('body');
                checkpointGateway.permissions = [];
            }));

            function assertScope() {
                it('body class is added', function () {
                    expect(body.hasClass('bin-menu')).toBeTruthy();
                });

                it('template is appended to body', function () {
                    expect(body.html()).toContain('id="bin-menu"');
                });

                it('not branded by default', function () {
                    expect(scope.brand).toEqual('');
                });

                describe('on isPage', function () {
                    beforeEach(function () {
                        binarta.application.setLocaleForPresentation('en');
                        $location.path('/en/foo');
                    });

                    it('true case', function() {
                        expect(scope.isPage('/foo')).toBeTruthy();
                    });

                    it('false case', function() {
                        expect(scope.isPage('/')).toBeFalsy();
                    });
                });

                describe('on signout', function () {
                    beforeEach(function () {
                        scope.signout();
                    });

                    it('checkpoint.signout notification is fired', function () {
                        expect(topics.fire).toHaveBeenCalledWith('checkpoint.signout', 'ok');
                    });
                });
            }

            function assertClerk() {
                it('show branding', function () {
                    expect(scope.showBranding).toBeTruthy();
                });

                it('show edit button', function () {
                    expect(scope.showEdit).toBeTruthy();
                });

                it('show theme button', function () {
                    expect(scope.showTheme).toBeTruthy();
                });

                it('show seo button', function () {
                    expect(scope.showSeo).toBeTruthy();
                });

                it('show site settings link', function () {
                    expect(scope.showSiteSettings).toBeTruthy();
                });

                it('show change password link', function () {
                    expect(scope.showChangePassword).toBeTruthy();
                });

                describe('registered on edit mode event', function () {
                    describe('open main edit menu', function () {
                        beforeEach(function () {
                            $rootScope.$broadcast('edit.mode.renderer', {open: true, id: 'main'});
                        });

                        it('set editModeOpened variable to be used in template', function () {
                            expect(scope.editModeOpened).toBeTruthy();
                        });

                        it('body class is added', function () {
                            expect(body.hasClass('bin-menu-opened')).toBeTruthy();
                        });

                        describe('open popup edit menu', function () {
                            beforeEach(function () {
                                $rootScope.$broadcast('edit.mode.renderer', {open: true, id: 'popup'});
                            });

                            it('hide main menu', function () {
                                expect(scope.showPopup).toBeTruthy();
                            });

                            it('editModeOpened is available', function () {
                                expect(scope.editModeOpened).toBeTruthy();
                            });

                            it('body class is added', function () {
                                expect(body.hasClass('bin-menu-opened')).toBeTruthy();
                            });

                            describe('close popup edit menu', function () {
                                beforeEach(function () {
                                    $rootScope.$broadcast('edit.mode.renderer', {open: false, id: 'popup'});
                                });

                                it('show main menu', function () {
                                    expect(scope.showPopup).toBeFalsy();
                                });

                                it('editModeOpened is available', function () {
                                    expect(scope.editModeOpened).toBeTruthy();
                                });

                                it('body class is added', function () {
                                    expect(body.hasClass('bin-menu-opened')).toBeTruthy();
                                });

                                describe('close main edit menu', function () {
                                    beforeEach(function () {
                                        $rootScope.$broadcast('edit.mode.renderer', {open: false, id: 'main'});
                                    });

                                    it('editModeOpened is closed', function () {
                                        expect(scope.editModeOpened).toBeFalsy();
                                    });

                                    it('body class is removed', function () {
                                        expect(body.hasClass('bin-menu-opened')).toBeFalsy();
                                    });
                                });
                            });

                            describe('open main edit menu', function () {
                                beforeEach(function () {
                                    $rootScope.$broadcast('edit.mode.renderer', {open: true, id: 'main'});
                                });

                                it('show main menu', function () {
                                    expect(scope.showPopup).toBeFalsy();
                                });
                            });
                        });
                    });

                    ['mobile', 'tablet'].forEach(function (device) {
                        describe('when ' + device, function () {
                            beforeEach(function () {
                                spyOn(jQuery.fn, 'scrollTop').and.returnValue(100);
                                $window.scrollTo = jasmine.createSpy('spy');
                                browserInfo.setDevice(device);
                            });

                            describe('open main edit menu', function () {
                                beforeEach(function () {
                                    $rootScope.$broadcast('edit.mode.renderer', {open: true, id: 'main'});
                                });

                                describe('close main edit menu', function () {
                                    beforeEach(function () {
                                        $rootScope.$broadcast('edit.mode.renderer', {open: false, id: 'main'});
                                    });

                                    it('scroll to remembered position', function () {
                                        expect($window.scrollTo).toHaveBeenCalledWith(0, 100);
                                    });
                                });
                            });
                        });
                    });
                });
            }

            describe('is not on binarta namespace', function () {
                beforeEach(function () {
                    config.namespace = '-';
                    binarta.application.adhesiveReading.read('-');
                });

                describe('when user is signed in', function () {
                    beforeEach(function () {
                        binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                    });

                    it('do not show branding', function () {
                        expect(scope.showBranding).toBeFalsy();
                    });

                    it('do not show upgrade button', function () {
                        expect(scope.showUpgradeButton).toBeFalsy();
                    });

                    it('show basket', function () {
                        expect(scope.showBasket).toBeTruthy();
                    });

                    it('do not show edit button', function () {
                        expect(scope.showEdit).toBeFalsy();
                    });

                    it('do not show theme button', function () {
                        expect(scope.showTheme).toBeFalsy();
                    });

                    it('do not show seo button', function () {
                        expect(scope.showSeo).toBeFalsy();
                    });

                    it('do not show site settings link', function () {
                        expect(scope.showSiteSettings).toBeFalsy();
                    });

                    it('show account link', function () {
                        expect(scope.showAccount).toBeTruthy();
                    });

                    it('do not show change password link', function () {
                        expect(scope.showChangePassword).toBeFalsy();
                    });

                    it('show order history link', function () {
                        expect(scope.showOrderHistory).toBeTruthy();
                    });

                    it('do not show (external) applications link', function () {
                        expect(scope.showExternalApplications).toBeFalsy();
                    });

                    it('do not show (internal) applications link', function () {
                        expect(scope.showInternalApplications).toBeFalsy();
                    });

                    assertScope();
                });

                describe('and user is clerk with edit.mode permission', function () {
                    beforeEach(function () {
                        checkpointGateway.addPermission('edit.mode');
                    });

                    describe('and app is not in trial', function () {
                        beforeEach(function () {
                            binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                        });

                        it('do not show upgrade button', function () {
                            expect(scope.showUpgradeButton).toBeFalsy();
                        });

                        it('do not show basket', function () {
                            expect(scope.showBasket).toBeFalsy();
                        });

                        it('do not show account link', function () {
                            expect(scope.showAccount).toBeFalsy();
                        });

                        it('do not show order history link', function () {
                            expect(scope.showOrderHistory).toBeFalsy();
                        });

                        it('show (external) applications link', function () {
                            expect(scope.showExternalApplications).toBeTruthy();
                        });

                        it('do not show (internal) applications link', function () {
                            expect(scope.showInternalApplications).toBeFalsy();
                        });

                        assertClerk();
                        assertScope();
                    });

                    describe('and app is in trial', function () {
                        beforeEach(function () {
                            applicationGateway.updateApplicationProfile({trial: '-'});
                            binarta.application.refresh();
                            binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                        });

                        it('show upgrade button', function () {
                            expect(scope.showUpgradeButton).toBeTruthy();
                        });

                        assertScope();
                    });
                });
            });

            describe('is on binarta namespace', function () {
                beforeEach(function () {
                    config.namespace = 'binarta';
                    binarta.application.adhesiveReading.read('-');
                });

                describe('when user is signed in', function () {
                    beforeEach(function () {
                        binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                    });

                    it('do not show branding', function () {
                        expect(scope.showBranding).toBeFalsy();
                    });

                    it('do not show upgrade button', function () {
                        expect(scope.showUpgradeButton).toBeFalsy();
                    });

                    it('do not show basket', function () {
                        expect(scope.showBasket).toBeFalsy();
                    });

                    it('do not show edit button', function () {
                        expect(scope.showEdit).toBeFalsy();
                    });

                    it('do not show theme button', function () {
                        expect(scope.showTheme).toBeFalsy();
                    });

                    it('do not show seo button', function () {
                        expect(scope.showSeo).toBeFalsy();
                    });

                    it('do not show site settings link', function () {
                        expect(scope.showSiteSettings).toBeFalsy();
                    });

                    it('show account link', function () {
                        expect(scope.showAccount).toBeTruthy();
                    });

                    it('do not show change password link', function () {
                        expect(scope.showChangePassword).toBeFalsy();
                    });

                    it('do not show order history link', function () {
                        expect(scope.showOrderHistory).toBeFalsy();
                    });

                    it('do not show (external) applications link', function () {
                        expect(scope.showExternalApplications).toBeFalsy();
                    });

                    it('show (internal) applications link', function () {
                        expect(scope.showInternalApplications).toBeTruthy();
                    });

                    assertScope();
                });

                describe('and user is clerk with edit.mode permission', function () {
                    beforeEach(function () {
                        checkpointGateway.addPermission('edit.mode');
                        binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                    });

                    it('do not show upgrade button', function () {
                        expect(scope.showUpgradeButton).toBeFalsy();
                    });

                    it('do not show basket', function () {
                        expect(scope.showBasket).toBeFalsy();
                    });

                    it('do not show account link', function () {
                        expect(scope.showAccount).toBeFalsy();
                    });

                    it('do not show order history link', function () {
                        expect(scope.showOrderHistory).toBeFalsy();
                    });

                    it('do not show (external) applications link', function () {
                        expect(scope.showExternalApplications).toBeFalsy();
                    });

                    it('show (internal) applications link', function () {
                        expect(scope.showInternalApplications).toBeTruthy();
                    });

                    assertClerk();
                    assertScope();
                });
            });

            describe('when app is expired', function () {
                beforeEach(function () {
                    applicationGateway.updateApplicationProfile({trial: {expired: true}});
                    binarta.application.refresh();
                    binarta.application.adhesiveReading.read('-');
                });

                it('do not load the binarta menu', function () {
                    expect(binarta.checkpoint.profile.eventRegistry.isEmpty()).toBeTruthy();
                });
            });

            describe('when using the websters brand', function () {
                beforeEach(function () {
                    applicationGateway.addPublicConfig({id: 'platform.brand', value: 'websters'});
                });

                describe('is not on binarta namespace', function () {
                    beforeEach(function () {
                        config.namespace = '-';
                        binarta.application.adhesiveReading.read('-');
                    });

                    describe('when user is signed in', function () {
                        beforeEach(function () {
                            binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                        });

                        it('brand is available', function () {
                            expect(scope.brand).toEqual('websters');
                        });

                        it('do not show (external) applications link', function () {
                            expect(scope.showExternalApplications).toBeFalsy();
                        });
                    });

                    describe('and user is clerk with edit.mode permission', function () {
                        beforeEach(function () {
                            checkpointGateway.addPermission('edit.mode');
                            binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                        });

                        it('do not show (external) applications link', function () {
                            expect(scope.showExternalApplications).toBeFalsy();
                        });
                    });
                });
            });

            describe('when theme options are disabled', function () {
                beforeEach(function () {
                    applicationGateway.addPublicConfig({id: 'platform.theme.options.enabled', value: 'false'});
                    binarta.application.adhesiveReading.read('-');
                });

                describe('and user is clerk with edit.mode permission', function () {
                    beforeEach(function () {
                        checkpointGateway.addPermission('edit.mode');
                        binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                    });

                    it('do not show theme button', function () {
                        expect(scope.showTheme).toBeFalsy();
                    });
                });
            });
        });
    });
});