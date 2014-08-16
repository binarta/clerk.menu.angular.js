describe('clerk menu module', function () {
    beforeEach(module('clerk.menu'));
    beforeEach(module('notifications'));

    describe('clerk-menu directive', function () {
        var scope, directive, registry, config, topics, response, usecase, permission, resourceLoader, resource;

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
            directive = ClerkMenuDirectiveFactory(topics, config, usecase, resourceLoader);
        }));

        it('restricted to element', function () {
            expect(directive.restrict).toEqual('E');
        });

        it('default template url', function () {
            expect(directive.templateUrl).toEqual('bower_components/binarta.clerk.menu.angular/template/clerk-menu.html');
        });

        it('template url with specific styling', function () {
            config.styling = 'bootstrap3';
            directive = ClerkMenuDirectiveFactory(topics, config, usecase, resourceLoader);

            expect(directive.templateUrl).toEqual('bower_components/binarta.clerk.menu.angular/template/bootstrap3/clerk-menu.html');
        });

        it('template url with specific components directory', function () {
            config.componentsDir = 'components';
            directive = ClerkMenuDirectiveFactory(topics, config, usecase, resourceLoader);

            expect(directive.templateUrl).toEqual('components/binarta.clerk.menu.angular/template/clerk-menu.html');
        });

        describe('on link', function () {
            var cssResource = '/binarta.clerk.menu.angular/css/clerk-menu.css';

            beforeEach(function () {
                directive.link(scope);
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
                    directive.link(scope);
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
                directive = ClerkMenuDirectiveFactory(topics, config, usecase, resourceLoader);
                directive.link(scope);
                response.yes();

                expect(resource).toEqual('components' + cssResource);
            });

            it('when not authenticated', function () {
                response.no();

                expect(resource).toEqual('bower_components' + cssResource);
            });

            it('when not authorized and different components dir', function () {
                config.componentsDir = 'components';
                directive = ClerkMenuDirectiveFactory(topics, config, usecase, resourceLoader);
                directive.link(scope);
                response.no();

                expect(resource).toEqual('components' + cssResource);
            });
        });
    });
});