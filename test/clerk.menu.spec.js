describe('clerk menu module', function () {
    var editModeRendererSpy, editModeRendererClosedSpy;
    angular.module('toggle.edit.mode', [])
        .service('editModeRenderer', function () {
            this.open = function (args) {
                editModeRendererSpy = args;
            };
            this.close = function () {
                editModeRendererClosedSpy = true
            };
        });

    var i18nRendererInstallerSpy;
    angular.module('i18n', [])
        .factory('i18nRendererInstaller', function () {
            return function (args) {
                i18nRendererInstallerSpy = args;
            };
        });

    angular.module('basket', [])
        .controller('ViewBasketController', function () {
        });

    beforeEach(module('binartajs-angular1-spec'));
    beforeEach(module('basket'));
    beforeEach(module('clerk.menu'));

    describe('on run', function () {
        var binarta, $rootScope, $location, binartaMenu, account, fetchAccountMetadata, $document, $q, $routeParams, application;

        beforeEach(inject(function (_binarta_, _$rootScope_, _$location_, binartaMenuRunner, _account_, _fetchAccountMetadata_, _$document_, _$q_, _$routeParams_, applicationDataService) {
            binarta = _binarta_;
            $location = _$location_;
            binartaMenu = binartaMenuRunner;
            fetchAccountMetadata = _fetchAccountMetadata_;
            $rootScope = _$rootScope_;
            $rootScope.$digest();
            editModeRendererSpy = undefined;
            editModeRendererClosedSpy = undefined;
            account = _account_;
            $document = _$document_;
            $q = _$q_;
            $routeParams = _$routeParams_;
            application = applicationDataService;
        }));

        it('install i18nRenderer', function () {
            expect(i18nRendererInstallerSpy).toEqual({open: jasmine.any(Function)});
        });

        describe('when i18nRenderer is opened', function () {
            var submitSpy;

            beforeEach(function () {
                i18nRendererInstallerSpy.open({
                    submit: function (translation) {
                        submitSpy = translation;
                    },
                    translation: 'translation',
                    editor: 'editor',
                    template: 'template'
                });
            });

            it('editModeRenderer is called', function () {
                expect(editModeRendererSpy.template).toEqual('template');
                expect(editModeRendererSpy.scope.translation).toEqual('translation');
                expect(editModeRendererSpy.scope.editor).toEqual('editor');
            });

            it('on submit', function () {
                editModeRendererSpy.scope.translation = 'test';

                editModeRendererSpy.scope.submit();

                expect(submitSpy).toEqual('test');
                expect(editModeRendererClosedSpy).toBeTruthy();
            });

            it('on cancel', function () {
                editModeRendererSpy.scope.cancel();

                expect(editModeRendererClosedSpy).toBeTruthy();
            });

            describe('on erase', function () {
                it('no i18nForm', function () {
                    editModeRendererSpy.scope.erase();

                    expect(editModeRendererSpy.scope.translation).toEqual('');
                });

                describe('with i18nForm', function () {
                    var setViewValueSpy, isRendered, jQuerySelectorSpy, isFocused;

                    beforeEach(function () {
                        editModeRendererSpy.scope.i18nForm = {
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

                        editModeRendererSpy.scope.erase();
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
                expect(editModeRendererSpy.scope.followLink).toBeUndefined();
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
                    i18nRendererInstallerSpy.open(args);
                });

                it('on followLink', function () {
                    editModeRendererSpy.scope.followLink();

                    expect($location.path()).toEqual('/link/to/page');
                    expect(editModeRendererClosedSpy).toBeTruthy();
                });
            });
        });

        describe('binarta-menu', function () {
            var body;

            beforeEach(function () {
                body = $document.find('body');
            });

            describe('when user is signed in', function () {
                beforeEach(function() {
                    binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                });

                describe('and user has no edit.mode permission', function () {
                    beforeEach(function () {
                        // var deferred = $q.defer();
                        // deferred.resolve([]);
                        // spyOn(account, 'getPermissions').and.returnValue(deferred.promise);

                        // fetchAccountMetadata.calls.first().args[0].ok();
                        // $rootScope.$digest();
                        // binarta.checkpoint.profile.refresh();
                    });

                    it('bin-menu class is added to body', function () {
                        expect(body.hasClass('bin-menu')).toBeTruthy();
                    });

                    it('menu is added to dom', function () {
                        expect(body.html()).toContain('id="bin-menu"');
                    });

                    describe('with scope', function () {
                        var scope;

                        beforeEach(inject(function (binartaMenuRunner) {
                            scope = binartaMenuRunner.angularScope();
                        }));

                        describe('check if current page is homepage', function () {
                            it('with no locale and not on home', function () {
                                $location.path('/test/');

                                expect(scope.isPage()).toBeFalsy();
                            });

                            it('with no locale and on home', function () {
                                $location.path('/');

                                expect(scope.isPage()).toBeTruthy();
                            });

                            it('with locale and not on home', function () {
                                $routeParams.locale = 'locale';
                                $location.path('/locale/test/');

                                expect(scope.isPage()).toBeFalsy();
                            });

                            it('with locale and on home', function () {
                                $routeParams.locale = 'locale';
                                $location.path('/locale/');

                                expect(scope.isPage()).toBeTruthy();
                            });
                        });

                        describe('check if current page is other page', function () {
                            it('with no locale and not on home', function () {
                                $location.path('/test/');

                                expect(scope.isPage('page')).toBeFalsy();
                            });

                            it('with no locale and on home', function () {
                                $location.path('/page');

                                expect(scope.isPage('page')).toBeTruthy();
                            });

                            it('with locale and not on home', function () {
                                $routeParams.locale = 'locale';
                                $location.path('/locale/test/');

                                expect(scope.isPage('page')).toBeFalsy();
                            });

                            it('with locale and on home', function () {
                                $routeParams.locale = 'locale';
                                $location.path('/locale/page');

                                expect(scope.isPage('page')).toBeTruthy();
                            });
                        });
                    });
                });

                describe('and user is clerk with edit.mode permission', function () {
                    beforeEach(function () {
                        var deferred = $q.defer();
                        deferred.resolve(['edit.mode']);
                        spyOn(account, 'getPermissions').and.returnValue(deferred.promise);

                        fetchAccountMetadata.calls.first().args[0].ok();
                        $rootScope.$digest();
                    });
                });

                describe('when user is signed out', function () {
                    beforeEach(function () {
                        body.addClass('bin-menu');
                        binarta.checkpoint.profile.signout();
                    });

                    it('remove class from body', function () {
                        expect(body.hasClass('bin-menu')).toBeFalsy();
                    });
                });
            });
        });

        describe('app is expired', function () {
            var body;

            beforeEach(function () {
                spyOn(application, 'isExpired').and.returnValue({
                    then: function (fn) {
                        fn(true);
                    }
                });
                fetchAccountMetadata.calls.reset();
                body = $document.find('body');
                body.removeClass('bin-menu');

                binartaMenu.run();
            });

            it('do not load the menu', function () {
                expect(fetchAccountMetadata).not.toHaveBeenCalled();
                expect(body.hasClass('bin-menu')).toBeFalsy();
            });
        });
    });
});