describe('clerk menu module', function () {
    angular.module('angularx', []);

    beforeEach(module('clerk.menu'));
    beforeEach(module('notifications'));

    describe('clerk-menu directive', function () {
        var scope, directive, registry, config, topics, response, usecase, permission, resourceLoader, resource,
            templateSpy, templateArgs, rendererSpy, $location, host, account, user;

        beforeEach(inject(function ($rootScope, ngRegisterTopicHandler, topicRegistryMock, $q) {
            scope = $rootScope.$new();
            registry = topicRegistryMock;
            config = {
                namespace: 'namespace'
            };
            topics = ngRegisterTopicHandler;
            usecase = function (it, p) {
                response = it;
                permission = p;
            };
            resource = '';
            resourceLoader = {
                add: function(r) {
                    resource = r;
                },
                remove: function(r) {
                    resource = r;
                }
            };
            templateSpy = {
                setTemplateUrl: function (args){
                    templateArgs = args;
                }
            };
            var i18nRendererInstaller = function (renderer) {
                rendererSpy = {
                    open: renderer.open
                };
            };

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

            directive = ClerkMenuDirectiveFactory(topics, config, usecase, resourceLoader, templateSpy, i18nRendererInstaller, $location, account);
        }));

        it('creates a child scope', function () {
            expect(directive.scope).toBeTruthy();
        });

        it('restricted to element', function () {
            expect(directive.restrict).toEqual('E');
        });

        it('template', function () {
            expect(directive.template).toEqual('<div ng-include="templateUrl"></div>');
        });

        describe('on link', function () {
            var cssResource = '/binarta.clerk.menu.angular/css/clerk-menu.css';

            beforeEach(function () {
                directive.link(scope, null, {});
            });

            it('setTemplateUrl is called', function () {
                expect(templateArgs).toEqual({
                    scope: scope,
                    module: 'clerk.menu',
                    name: 'clerk-menu.html',
                    permission: 'edit.mode'
                });
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

            it('triggers usecase', function () {
                expect(response).toBeDefined();
            });

            it('user must have edit.mode permission', function () {
                expect(permission).toEqual('edit.mode');
            });

            it('scope is given to usecase', function () {
                expect(response.scope).toEqual(scope);
            });

            it('when authorized', function () {
                response.yes();

                expect(resource).toEqual('bower_components' + cssResource);
            });

            it('when authorized and different components dir', function () {
                config.componentsDir = 'components';
                directive.link(scope, null, {});
                response.yes();

                expect(resource).toEqual('components' + cssResource);
            });

            it('when not authenticated', function () {
                response.no();

                expect(resource).toEqual('bower_components' + cssResource);
            });

            it('when not authorized and different components dir', function () {
                config.componentsDir = 'components';
                directive.link(scope, null, {});
                response.no();

                expect(resource).toEqual('components' + cssResource);
            });

            it('clerk menu renderer is installed', function () {
                expect(rendererSpy.open).toEqual(jasmine.any(Function));
            });

            describe('when renderer is opened', function () {
                var submitSpy;

                var args = {
                    translation: 'translation',
                    editor: 'editor',
                    submit: function (translation) {
                        submitSpy = translation;
                    }
                };

                beforeEach(function () {
                    rendererSpy.open(args);
                });

                it('puts translation on scope', function () {
                    expect(scope.translation).toEqual(args.translation);
                });

                it('puts editor type on scope', function () {
                    expect(scope.editor).toEqual(args.editor);
                });

                it('when editor is not defined, set to default', function () {
                    rendererSpy.open({});

                    expect(scope.editor).toEqual('default');
                });

                it('puts cancel function on scope', function () {
                    expect(scope.cancel).toEqual(jasmine.any(Function));
                });

                describe('on cancel', function () {
                    beforeEach(function () {
                        scope.cancel();
                    });

                    it('resets scope values', function () {
                        expect(scope.translation).toBeUndefined();
                        expect(scope.editor).toBeUndefined();
                    });
                });

                it('puts submit function on scope', function () {
                    expect(scope.submit).toEqual(jasmine.any(Function));
                });

                describe('on submit', function () {
                    var translation = 'updatedTranslation';

                    beforeEach(function () {
                        scope.submit(translation);
                    });

                    it('submit is propagated', function () {
                        expect(submitSpy).toEqual(translation);
                    });

                    it('resets scope values', function () {
                        expect(scope.translation).toBeUndefined();
                        expect(scope.editor).toBeUndefined();
                    });
                });
            });
        });

        describe('set template settings to scope', function () {
            beforeEach(function () {
                directive.link(scope, null, {
                    settings: '{setting: true}'
                });
            });

            it('should be on scope', function () {
                expect(scope.settings).toEqual({setting: true});
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
    });
});