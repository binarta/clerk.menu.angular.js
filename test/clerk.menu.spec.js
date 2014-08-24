describe('clerk menu module', function () {
    angular.module('angularx', []);

    beforeEach(module('clerk.menu'));
    beforeEach(module('notifications'));

    describe('clerk-menu directive', function () {
        var scope, directive, registry, config, topics, response, usecase, permission, resourceLoader, resource,
            templateSpy, templateArgs;

        beforeEach(inject(function ($rootScope, ngRegisterTopicHandler, topicRegistryMock) {
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
            directive = ClerkMenuDirectiveFactory(topics, config, usecase, resourceLoader, templateSpy);
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
                directive = ClerkMenuDirectiveFactory(topics, config, usecase, resourceLoader, templateSpy);
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
                directive = ClerkMenuDirectiveFactory(topics, config, usecase, resourceLoader, templateSpy);
                directive.link(scope, null, {});
                response.no();

                expect(resource).toEqual('components' + cssResource);
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
    });
});