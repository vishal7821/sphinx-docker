(function () {
  'use strict';

  angular.module('BlurAdmin.pages.landing', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('landing', {
          url: '/sphinx',
          templateUrl: 'app/pages/landing/landing.html',
          title: 'landing',
          sidebarMeta: {
            icon: 'ion-android-home',
            order: 0,
          },
        });
  }

})();
