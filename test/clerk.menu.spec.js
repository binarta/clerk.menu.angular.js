describe('clerk menu module', function () {
    angular.module('angularx', []);
    angular.module('browser.info', []);
    angular.module('rest.client', []);
    angular.module('angular.usecase.adapter', []);
    angular.module('checkpoint', []);

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

    beforeEach(module('clerk.menu'));
    beforeEach(module('notifications'));


    describe('on run', function () {
        var $location;

        beforeEach(inject(function ($rootScope, _$location_) {
            $location = _$location_;
            $rootScope.$digest();
            editModeRendererSpy = undefined;
            editModeRendererClosedSpy = undefined;
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
    });

    describe('clerk-menu directive', function () {
        var scope, directive, registry, config, $location, host, path, account, user, height, window, $rootScope, browserInfo;

        beforeEach(inject(function (_$rootScope_, topicRegistryMock, $q) {
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
            registry = topicRegistryMock;
            config = {
                namespace: 'namespace'
            };

            host = 'test.binarta.com';
            $location = {
                host: function () {
                    return host;
                },
                path: function () {
                    return path;
                }
            };

            user = {
                name: 'foo'
            };

            account = {
                getMetadata: function () {
                    var deferred = $q.defer();
                    deferred.resolve(user);
                    return deferred.promise;
                }
            };

            browserInfo = {
                mobile: true
            };

            $ = function (body) {
                $.element = body;

                return {
                    scrollTop: function () {
                        height = 100;
                        return height;
                    },
                    addClass: function (c) {
                        $.addedClass = c;
                    },
                    removeClass: function (c) {
                        $.removedClass = c;
                    },
                    children: function () {
                        return {
                            not: function (c) {
                                $.not = c;
                                return {
                                    show: function () {
                                        $.showCalled = true;
                                    },
                                    hide: function () {
                                        $.hideCalled = true;
                                    }
                                }
                            }
                        }
                    }
                }
            };

            window = {
                scrollTo: function (left, top) {
                    window.scrollToLeft = left;
                    window.scrollToTop = top;
                }
            };

            directive = ClerkMenuDirectiveFactory(config, $location, account, browserInfo, window, $rootScope);
        }));

        it('creates a child scope', function () {
            expect(directive.scope).toBeTruthy();
        });

        it('restricted to element', function () {
            expect(directive.restrict).toEqual('E');
        });

        it('template', function () {
            expect(directive.template).toEqual(jasmine.any(String));
        });

        describe('on link', function () {
            var cssResource = '/binarta.clerk.menu.angular/css/clerk-menu.css';

            beforeEach(function () {
                directive.link(scope, null, {});
            });

            it('namespace is available on scope', function () {
                expect(scope.namespace).toEqual('namespace');
            });

            it('if localization is not supported then there is no locale prefix', function () {
                expect(scope.localePrefix).toBeUndefined();
            });
        });

        describe('when on mobile device', function () {
            beforeEach(function () {
                browserInfo.mobile = true;

                directive.link(scope, null, {});
            });

            it('set mobile on scope', function () {
                expect(scope.mobile).toBeTruthy();
            });
        });

        describe('when not on mobile device', function () {
            beforeEach(function () {
                browserInfo.mobile = false;

                directive.link(scope, null, {});
            });

            it('set mobile on scope', function () {
                expect(scope.mobile).toBeFalsy();
            });
        });

        describe('set published flag on scope', function () {
            describe('when on Binarta.com domain', function () {
                describe('on demo', function () {
                    beforeEach(function () {
                        host = 'test.app.demo.binarta.com';

                        directive.link(scope, null, {});
                    });

                    it('published schould be false', function () {
                        expect(scope.published).toEqual(false);
                    });
                });

                describe('on prod', function () {
                    beforeEach(function () {
                        host = 'test.app.binarta.com';

                        directive.link(scope, null, {});
                    });

                    it('published schould be false', function () {
                        expect(scope.published).toEqual(false);
                    });
                });
            });

            describe('when not on Binarta.com domain', function () {
                beforeEach(function () {
                    host = 'example.com';

                    directive.link(scope, null, {});
                });

                it('published schould be true', function () {
                    expect(scope.published).toEqual(true);
                });
            });
        });

        describe('set user data on scope', function () {
            beforeEach(function () {
                directive.link(scope, null, {});
            });

            it('user should be available', function () {
                scope.$digest();

                expect(scope.user).toEqual(user);
            });
        });

        describe('when edit.mode.renderer is broadcasted', function () {
            beforeEach(function () {
                directive.link(scope);

                scope.$broadcast('edit.mode.renderer', {open: true});
            });

            describe('open edit mode menu', function () {
                it('put value on scope', function () {
                    expect(scope.editModeOpened).toBeTruthy();
                });

                describe('and device is mobile', function () {
                    it('get body element', function () {
                        expect($.element).toEqual('body');
                    });

                    it('get current position', function () {
                        expect(height).toEqual(100);
                    });

                    it('add class to body', function () {
                        expect($.addedClass).toEqual('binarta-clerk-menu-fullscreen');
                    });

                    it('hide all children of body except for the clerk menu', function () {
                        expect($.hideCalled).toBeTruthy();
                        expect($.not).toEqual('clerk-menu');
                    });
                });

                describe('close edit mode menu', function () {
                    beforeEach(function () {
                       scope.$broadcast('edit.mode.renderer', {open: false});
                    });

                    it('remove class from body', function () {
                        expect($.removedClass).toEqual('binarta-clerk-menu-fullscreen');
                    });

                    it('show all children of body', function () {
                        expect($.showCalled).toBeTruthy();
                        expect($.not).toEqual('clerk-menu');
                    });

                    it('go to remembered position', function () {
                        expect(window.scrollToLeft).toEqual(0);
                        expect(window.scrollToTop).toEqual(height);
                    });
                });
            });
        });

        describe('check for homepage', function () {
            describe('not on homepage', function () {
                beforeEach(function () {
                    path = '/foo';

                    directive.link(scope, null, {});
                });

                it('value is false', function () {
                    expect(scope.isHomePageActive()).toBeFalsy();
                });
            });

            describe('on homepage', function () {
                beforeEach(function () {
                    path = '/';

                    directive.link(scope, null, {});
                });

                it('value is false', function () {
                    expect(scope.isHomePageActive()).toBeTruthy();
                });
            });

            describe('and locale', function () {
                beforeEach(function () {
                    $rootScope.localePrefix = '/locale';
                });

                describe('not on homepage', function () {
                    beforeEach(function () {
                        path = '/locale/foo';

                        directive.link(scope, null, {});
                    });

                    it('value is false', function () {
                        expect(scope.isHomePageActive()).toBeFalsy();
                    });
                });

                describe('on homepage', function () {
                    beforeEach(function () {
                        path = '/locale/';

                        directive.link(scope, null, {});
                    });

                    it('value is false', function () {
                        expect(scope.isHomePageActive()).toBeTruthy();
                    });
                });
            });
        });
    });
});