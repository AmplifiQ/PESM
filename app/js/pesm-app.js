/* 20150506-1732 */
(function() {
    'use strict';

    angular.module('pesm', ['ngRoute', 'ngAnimate', 'ngSanitize', 'ngTouch', 'ng.group', 'service', 'activities', 'cores'])

    .config(['$sceDelegateProvider', '$compileProvider', '$routeProvider', function($sceDelegateProvider, $compileProvider, $routeProvider) {

        $sceDelegateProvider.resourceUrlWhitelist(['self', '*']);

        $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|ms-appx|x-wmapp|x-wmapp0|blob|cdvfile):|data:image\/)/);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|ms-appx|x-wmapp|x-wmapp0|cdvfile|geo):/);

        $routeProvider
            .when('/', {
                templateUrl: 'home.html',
                controller: 'homeCtrl'
            })
            .when('/home', {
                templateUrl: 'home.html',
                controller: 'homeCtrl'
            })
            .when('/atividades', {
                templateUrl: 'atividades.html',
                controller: 'listActivityTypeCtrl'
            })
            .when('/atividades-lista', {
                templateUrl: 'atividades_lista.html',
                controller: 'listActivitiesCtrl'
            })
            .when('/atividades-lista-nucleo', {
                templateUrl: 'atividades_lista_nucleo.html',
                controller: 'listActivitiesByCoreCtrl'
            })
            .when('/atividades-descricao/:id?', {
                templateUrl: 'atividades_descricao.html',
                controller: 'activityDescriptionCtrl'
            })
            .when('/nucleos-lista', {
                templateUrl: 'nucleos_lista.html',
                controller: 'coreListCtrl'
            })
            .when('/nucleos-mapa', {
                templateUrl: 'nucleos_mapa.html',
                controller: 'coreMapCtrl'
            })
            .when('/nucleo-descricao/:id?', {
                templateUrl: 'nucleo_descricao.html',
                controller: 'coreDescriptionCtrl'
            })
            .when('/nucleo-como-chegar/:id?/:map?', {
                templateUrl: 'nucleo_como_chegar.html',
                controller: 'coreHowToGetHereCtrl'
            })
            .when('/sobre-o-parque', {
                templateUrl: 'sobre_o_parque.html',
                controller: 'aboutParkCtrl'
            })
            .otherwise({
                redirectTo: '/home',
                templateUrl: 'home.html',
                controller: 'homeCtrl'
            });
    }])

    /* ---------------------------------------------------------------------------------------------------- */
    /*  APP INIT                                                                                  */
    /* ---------------------------------------------------------------------------------------------------- */
    .run(['infoSrvc', 'gpsSrvc', function(infoSrvc, gpsSrvc) {
        gpsSrvc.updateGps();
        infoSrvc.getData();
        preloadImages();
        FastClick.attach(document.body);
    }])

    /* ---------------------------------------------------------------------------------------------------- */
    /*  PAGE: HOME                                                                                                */
    /* ---------------------------------------------------------------------------------------------------- */

    // Home Ctrl
    .controller('homeCtrl', ['$scope', 'gpsSrvc', function($scope, gpsSrvc) {
        $scope.getLocation = {};
        $scope.getLocation.area = "Procurando...";
    }])

    .directive('yourLocation', ['$timeout', 'gpsSrvc', '$interval', function($timeout, gpsSrvc, $interval) {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {

                // Interval to check for new info
                var running = $interval(function() {
                    if (gpsSrvc.area !== undefined) {
                        $scope.getLocation.area = gpsSrvc.area;
                        //$interval.cancel(running);
                    }
                }, 5000);

                element.on('click', function(e) {
                    $scope.getLocation.area = 'Procurando...';
                    gpsSrvc.updateGps();
                });

            }
        };
    }])

    /* ---------------------------------------------------------------------------------------------------- */
    /*  PAGE: ABOUT                                                                                               */
    /* ---------------------------------------------------------------------------------------------------- */
    // About Park Ctrl
    .controller('aboutParkCtrl', ['$scope', 'infoSrvc', function($scope, infoSrvc) {
        $scope.aboutPark = infoSrvc.aboutPark;
    }])

    /* ---------------------------------------------------------------------------------------------------- */
    /*  GLOBAL CONTROLLERS                                                                                  */
    /* ---------------------------------------------------------------------------------------------------- */

    // Tabs
    .controller('tabsCtrl', ['$scope', function($scope) {
        this.tab = 1;

        this.selectTab = function(setTab) {
            this.tab = setTab;
        };

        this.isSelected = function(checkTab) {
            return this.tab === checkTab;
        };
    }])

    /* ---------------------------------------------------------------------------------------------------- */
    /*  GLOBAL DIRECTIVES                                                                                   */
    /* ---------------------------------------------------------------------------------------------------- */

    // Loading animation
    .directive('routeLoadingIndicator', function($rootScope) {
        return {
            restrict: 'A',
            template: '<div ng-if="isRouteLoading"><div class="dot1"></div><div class="dot2"></div></div>',
            link: function(scope, elem, attrs) {
                scope.isRouteLoading = false;

                $rootScope.$on('$routeChangeStart', function() {
                    scope.isRouteLoading = true;
                });

                $rootScope.$on('$routeChangeSuccess', function() {
                    scope.isRouteLoading = false;
                });
            }
        };
    })

    // External Links
    .directive('a', function() {
        return {
            restrict: 'E',
            link: function(scope, element, attrs) {
                if (!attrs.href) {
                    return;
                }
                var externalRe = new RegExp("^(http|https)://");
                var url = attrs.href;

                if (externalRe.test(url)) {
                    element.on('click', function(e) {
                        e.preventDefault();
                        if (attrs.ngClick) {
                            scope.$eval(attrs.ngClick);
                        }
                        window.open(encodeURI(url), '_system');
                    });
                }
            }
        };
    })

    // Owl Carousel
    .directive('carousel', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $timeout(function() {
                    carousel(element, attrs);
                });
            }
        };
    }])

    // Map Scrolling
    .directive('mapScroll', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $timeout(function() {
                    var elementClass = '.'+element[0].className;
                    mapScroll(elementClass);
                });
            }
        };
    }])

    // On Finish Repeat
    .directive('onFinishRepeat', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                if (scope.$last === true) {
                    $timeout(function() {
                        scope.$emit(attrs.onFinishRepeat);
                    });
                }
            }
        };
    }])

    // Toggle Class
    .directive('toggleClass', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('click', function(e) {
                    e.preventDefault();
                    element.toggleClass(attrs.toggleClass);
                });
            }
        };
    })

    // Vibrate on click something
    .directive('vibrate', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('click', function(e) {
                    var hasVibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
                    if (hasVibrate) {
                        navigator.vibrate(30);
                    }
                });
            }
        };
    })

    // Go Back
    .directive('goBack', ['activitiesSrvc', function(activitiesSrvc) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('click', function(e) {
                    e.preventDefault();
                    scope.$apply(function() {
                        window.history.back();
                    });
                });
            }
        };
    }])

    // Go Home
    .directive('goHome', ['activitiesSrvc', '$location', function(activitiesSrvc, $location) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('click', function(e) {
                    e.preventDefault();
                    scope.$apply(function() {
                        $location.path("/home");
                    });
                });
            }
        };
    }])

    // Go to Activities Selection
    .directive('goActivities', ['activitiesSrvc', '$location', function(activitiesSrvc, $location) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('click', function(e) {
                    e.preventDefault();
                    scope.$apply(function() {
                        $location.path("/atividades");
                    });
                });
            }
        };
    }]);

}());