describe('clerk menu module', function () {
    beforeEach(module('clerk.menu'));

    describe('clerk-menu directive', function () {
        var scope, directive, registry, config;

        beforeEach(inject(function ($rootScope, topicRegistry, topicRegistryMock) {
            scope = $rootScope.$new();
            registry = topicRegistryMock;
            config = {
                namespace: 'namespace'
            };
            directive = ClerkMenuDirectiveFactory($rootScope, topicRegistry, config);
        }));

        it('restricted to element', function () {
            expect(directive.restrict).toEqual('E');
        });

        it('template url', function () {
            expect(directive.templateUrl()).toEqual('app/partials/clerk-menu.html');
        });

        it('template url can be overridden by rootScope', inject(function ($rootScope) {
            $rootScope.clerkMenuTemplateUrl = 'overridden-template.html';

            expect(directive.templateUrl()).toEqual('overridden-template.html');
        }));

        describe('on link', function () {
            beforeEach(function () {
                directive.link(scope);
            });

            describe('when config is initialized', function () {
                it('namespace is available on scope', function () {
                    registry['config.initialized']();

                    expect(scope.namespace).toEqual('namespace');
                });

                describe('if localization is supported', function () {
                    beforeEach(function () {
                        config.supportedLanguages = 'locale';
                        registry['config.initialized']();
                    });

                    describe('when i18n locale notification received', function () {
                        beforeEach(function () {
                            registry['i18n.locale']('locale');
                        });

                        it('put locale prefix on scope', function () {
                            expect(scope.localePrefix).toEqual('locale/');
                        });
                    });

                    describe('when scope is destroyed', function() {
                        beforeEach(function () {
                            scope.$destroy();
                        });

                        it('unsubscribe i18n.locale', function () {
                            expect(registry['i18n.locale']).toBeUndefined();
                        });
                    });
                });

                describe('if localization is not supported', function () {
                    beforeEach(function () {
                        registry['config.initialized']();
                    });

                    it('locale is empty', function () {
                        expect(scope.localePrefix).toBeUndefined();
                    });
                });
            });
        });
    });
});