describe('clerk menu module', function () {
    angular.module('angularx', []);

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
                expect(editModeRendererSpy).toEqual({
                    ctx: {
                        submit: jasmine.any(Function),
                        cancel: jasmine.any(Function),
                        translation: 'translation',
                        editor: 'editor'
                    }, template: 'template'
                });
            });

            it('and editModeRenderer submit is called', function () {
                editModeRendererSpy.ctx.submit('test');

                expect(submitSpy).toEqual('test');
                expect(editModeRendererClosedSpy).toBeTruthy();
            });

            it('and editModeRenderer cancel is called', function () {
                editModeRendererSpy.ctx.cancel();

                expect(editModeRendererClosedSpy).toBeTruthy();
            });
        });
    });

    describe('clerk-menu directive', function () {
        var scope, directive, registry, config, topics, $location, host, account, user;

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

            directive = ClerkMenuDirectiveFactory(topics, config, $location, account);
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

            it('put value on scope', function () {
                expect(scope.editModeOpened).toBeTruthy();
            });
        });
    });
});