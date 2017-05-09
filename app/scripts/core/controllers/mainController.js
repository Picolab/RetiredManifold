angular.module('theme.core.main_controller', ['theme.core.services'])
  .controller('MainController', ['$scope', '$theme', '$timeout', 'progressLoader', '$location', '$modal', '$cookies', 'thingsList',
    function($scope, $theme, $timeout, progressLoader, $location, $modal, $cookies, thingsList) {
    'use strict';
    // $scope.layoutIsSmallScreen = false;
    $scope.layoutFixedHeader = $theme.get('fixedHeader');
    $scope.layoutPageTransitionStyle = $theme.get('pageTransitionStyle');
    $scope.layoutDropdownTransitionStyle = $theme.get('dropdownTransitionStyle');
    $scope.layoutPageTransitionStyleList = ['bounce',
      'flash',
      'pulse',
      'bounceIn',
      'bounceInDown',
      'bounceInLeft',
      'bounceInRight',
      'bounceInUp',
      'fadeIn',
      'fadeInDown',
      'fadeInDownBig',
      'fadeInLeft',
      'fadeInLeftBig',
      'fadeInRight',
      'fadeInRightBig',
      'fadeInUp',
      'fadeInUpBig',
      'flipInX',
      'flipInY',
      'lightSpeedIn',
      'rotateIn',
      'rotateInDownLeft',
      'rotateInDownRight',
      'rotateInUpLeft',
      'rotateInUpRight',
      'rollIn',
      'zoomIn',
      'zoomInDown',
      'zoomInLeft',
      'zoomInRight',
      'zoomInUp'
    ];

    $scope.layoutLoading = true;

    $scope.things = thingsList.getThings();

    $scope.thingsList = thingsList;//necessary for the watch
    $scope.$watch('thingsList.getThings()', function(newValue){//detect when the value in the service changes
      $scope.things = newValue;
      console.log("Got here2!", $scope.things);
    });

    $scope.storageWatcher = sessionStorage;//necessary for the watch
    $scope.$watch('storageWatcher.getItem(\'things\')', function(newValue){//detect changes in the session storage
      thingsList.updateThings();
      console.log("Got here!", $scope.things);
    });

    var asyncCallback = function(){//this callback ensures the "thing" objects appear when first authorized and when things are added
        $scope.$apply(function(){
          $scope.things = thingsList.getThings();
        });
      }

     if(manifoldAuth.authenticatedSession()){
      manifold.updateSession(asyncCallback);
     }

    $scope.getLayoutOption = function(key) {
      return $theme.get(key);
    };

    $scope.openAddModal = function(size) {
      $modal.open({
        templateUrl: 'addModal.html',
        controller: function($scope, $modalInstance) {
          $scope.close = function () {
            $modalInstance.dismiss('cancel'); 
          };
          $scope.add = function() {
            var nameExists = function(){
              var things = thingsList.getThings();//we can't just call mainController's $scope.things, because we are using a different controller here.
              for(var i = 0; i < things.length; i++){
                if(things[i].name === $scope.name){
                  return true;
                }
              }
              return false;
            };
            if($scope.name !== undefined && $scope.name !== ""){
              if(!nameExists()){
                manifold.createThing($scope.name, asyncCallback);
                $modalInstance.dismiss('cancel'); 
              }else{
                alert("Name already exists!");
              }
            }else{
              alert("No name!");
            }
          };
        },
        size: size,
      });
    };

    $scope.openCommModal = function(size) {
      $modal.open({
        templateUrl: 'commModal.html',
        controller: function($scope, $modalInstance) {
          $scope.close = function () {
            $modalInstance.dismiss('cancel'); 
          };
          $scope.add = function() {
            //create a new "Thing"
            $modalInstance.dismiss('cancel'); 
          };
        },
        size: size,
      });
    };


    $scope.setNavbarClass = function(classname, $event) {
      $event.preventDefault();
      $event.stopPropagation();
      $theme.set('topNavThemeClass', classname);
    };

    $scope.setSidebarClass = function(classname, $event) {
      $event.preventDefault();
      $event.stopPropagation();
      $theme.set('sidebarThemeClass', classname);
    };

    $scope.$watch('layoutFixedHeader', function(newVal, oldval) {
      if (newVal === undefined || newVal === oldval) {
        return;
      }
      $theme.set('fixedHeader', newVal);
    });
    $scope.$watch('layoutLayoutBoxed', function(newVal, oldval) {
      if (newVal === undefined || newVal === oldval) {
        return;
      }
      $theme.set('layoutBoxed', newVal);
    });
    $scope.$watch('layoutLayoutHorizontal', function(newVal, oldval) {
      if (newVal === undefined || newVal === oldval) {
        return;
      }
      $theme.set('layoutHorizontal', newVal);
    });
    $scope.$watch('layoutPageTransitionStyle', function(newVal) {
      $theme.set('pageTransitionStyle', newVal);
    });
    $scope.$watch('layoutDropdownTransitionStyle', function(newVal) {
      $theme.set('dropdownTransitionStyle', newVal);
    });

    $scope.hideHeaderBar = function() {
      $theme.set('headerBarHidden', true);
    };

    $scope.showHeaderBar = function($event) {
      $event.stopPropagation();
      $theme.set('headerBarHidden', false);
    };

    $scope.toggleLeftBar = function() {
      if ($scope.layoutIsSmallScreen) {
        return $theme.set('leftbarShown', !$theme.get('leftbarShown'));
      }
      $theme.set('leftbarCollapsed', !$theme.get('leftbarCollapsed'));
    };

    $scope.toggleRightBar = function() {
      $theme.set('rightbarCollapsed', !$theme.get('rightbarCollapsed'));
    };

    $scope.toggleSearchBar = function($event) {
      $event.stopPropagation();
      $event.preventDefault();
      $theme.set('showSmallSearchBar', !$theme.get('showSmallSearchBar'));
    };

    $scope.chatters = [{
      id: 0,
      status: 'online',
      avatar: 'potter.png',
      name: 'Jeremy Potter'
    }, {
      id: 1,
      status: 'online',
      avatar: 'tennant.png',
      name: 'David Tennant'
    }, {
      id: 2,
      status: 'online',
      avatar: 'johansson.png',
      name: 'Anna Johansson'
    }, {
      id: 3,
      status: 'busy',
      avatar: 'jackson.png',
      name: 'Eric Jackson'
    }, {
      id: 4,
      status: 'online',
      avatar: 'jobs.png',
      name: 'Howard Jobs'
    }, {
      id: 5,
      status: 'online',
      avatar: 'potter.png',
      name: 'Jeremy Potter'
    }, {
      id: 6,
      status: 'away',
      avatar: 'tennant.png',
      name: 'David Tennant'
    }, {
      id: 7,
      status: 'away',
      avatar: 'johansson.png',
      name: 'Anna Johansson'
    }, {
      id: 8,
      status: 'online',
      avatar: 'jackson.png',
      name: 'Eric Jackson'
    }, {
      id: 9,
      status: 'online',
      avatar: 'jobs.png',
      name: 'Howard Jobs'
    }];
    $scope.currentChatterId = null;
    $scope.hideChatBox = function() {
      $theme.set('showChatBox', false);
    };
    $scope.toggleChatBox = function(chatter, $event) {
      $event.preventDefault();
      if ($scope.currentChatterId === chatter.id) {
        $theme.set('showChatBox', !$theme.get('showChatBox'));
      } else {
        $theme.set('showChatBox', true);
      }
      $scope.currentChatterId = chatter.id;
    };

    $scope.hideChatBox = function() {
      $theme.set('showChatBox', false);
    };

    $scope.$on('themeEvent:maxWidth767', function(event, newVal) {
      $timeout(function() {
        $scope.layoutIsSmallScreen = newVal;
        if (!newVal) {
          $theme.set('leftbarShown', false);
        } else {
          $theme.set('leftbarCollapsed', false);
        }
      });
    });
    $scope.$on('themeEvent:changed:fixedHeader', function(event, newVal) {
      $scope.layoutFixedHeader = newVal;
    });
    $scope.$on('themeEvent:changed:layoutHorizontal', function(event, newVal) {
      $scope.layoutLayoutHorizontal = newVal;
    });
    $scope.$on('themeEvent:changed:layoutBoxed', function(event, newVal) {
      $scope.layoutLayoutBoxed = newVal;
    });
    
    $scope.removeSession = function(clickEvent) {
      console.log("removing session");
      manifoldAuth.removeSession(true,$cookies); // true for hard reset (log out of login server too)
      $location.path('/extras-login2');
    };

    $scope.rightbarAccordionsShowOne = false;
    $scope.rightbarAccordions = [{
      open: true
    }, {
      open: true
    }, {
      open: true
    }, {
      open: true
    }, {
      open: true
    }, {
      open: true
    }, {
      open: true
    }];

    $scope.$on('$routeChangeStart', function() {
      if ($location.path() === '') {
        return $location.path('/');
      }
      progressLoader.start();
      progressLoader.set(50);
    });
    $scope.$on('$routeChangeSuccess', function() {
      progressLoader.end();
      if ($scope.layoutLoading) {
        $scope.layoutLoading = false;
      }
    });
  }]);