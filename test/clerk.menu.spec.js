describe('clerk menu module', function () {
    angular.module('angularx', []);
    angular.module('browser.info', []);

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
        beforeEach(inject(function ($rootScope) {
            $rootScope.$digest();
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

            it('and editModeRenderer submit is called', function () {
                editModeRendererSpy.scope.submit('test');

                expect(submitSpy).toEqual('test');
                expect(editModeRendererClosedSpy).toBeTruthy();
            });

            it('and editModeRenderer cancel is called', function () {
                editModeRendererSpy.scope.cancel();

                expect(editModeRendererClosedSpy).toBeTruthy();
            });
        });
    });

    describe('clerk-menu directive', function () {
        var scope, directive, registry, config, topics, $location, host, account, user, height;

        beforeEach(inject(function ($rootScope, ngRegisterTopicHandler, topicRegistryMock, $q) {
            scope = $rootScope.$new();
            registry = topicRegistryMock;
            config = {
                namespace: 'namespace'
            };
            topics = ngRegisterTopicHandler;

            host = 'test.binarta.com';
            $location = {
                host: function () {
                    return host;
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

            var browserInfo = {
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
                    },
                    scrollTo: function (left, top) {
                        $.scrollToLeft = left;
                        $.scrollToTop = top;
                    }
                }
            };

            directive = ClerkMenuDirectiveFactory(topics, config, $location, account, browserInfo);
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

            describe('if localization is supported', function () {
                beforeEach(function () {
                    config.supportedLanguages = 'locale';
                    directive.link(scope, null, {});
                });

                describe('when i18n locale notification received', function () {
                    beforeEach(function () {
                        registry['i18n.locale']('locale');
                    });

                    it('put locale prefix on scope', function () {
                        expect(scope.localePrefix).toEqual('locale/');
                    });
                });
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
                        expect($.scrollToLeft).toEqual(0);
                        expect($.scrollToTop).toEqual(height);
                    });
                });
            });
        });
    });
});