angular
  .module('theme.core.navigation_controller', ['theme.core.services'])
  .controller('NavigationController', ['$scope', '$location', '$timeout', function($scope, $location, $timeout) {
    'use strict';
    $scope.menu = [{
      label: 'Overview',
      iconClasses: '',
      separator: true
    }, {
      label: 'Things',
      iconClasses: 'glyphicon glyphicon-cog',
      url: '#/',
    }, {
      label: 'Communities',
      iconClasses: 'glyphicon glyphicon-cog',
      url: '#/communities'
    }, {
      label: 'Dashboard',
      iconClasses: 'glyphicon glyphicon-home',
      url: '#/dashboard'
    }, {
      label: 'Layouts',
      iconClasses: 'glyphicon glyphicon-th-list',
      html: '<span class="badge badge-warning">2</span>',
      children: [{
        label: 'Grids',
        url: '#/layout-grid'
      }, {
        label: 'Horizontal Navigation',
        url: '#/layout-horizontal'
      }, {
        label: 'Horizontal Navigation 2',
        url: '#/layout-horizontal2'
      }, {
        label: 'Fixed Boxed Layout',
        url: '#/layout-fixed'
      }]
    }, {
      label: 'Notifications',
      iconClasses: 'glyphicon glyphicon-inbox',
      html: '<span class="badge badge-indigo">3</span>',
      children: [{
        label: 'Inbox',
        url: '#/inbox'
      }, {
        label: 'Compose',
        url: '#/compose-mail'
      }, {
        label: 'Read',
        url: '#/read-mail'
      }, {
        label: 'Email Templates',
        url: '#/extras-email-templates'
      }]
    }, {
      label: 'Tasks',
      iconClasses: 'glyphicon glyphicon-ok',
      html: '<span class="badge badge-info">7</span>',
      url: '#/tasks'
    }, {
      label: 'Calendar',
      iconClasses: 'glyphicon glyphicon-calendar',
      url: '#/calendar'
    }, {
      label: 'Gallery',
      iconClasses: 'glyphicon glyphicon-th-large',
      url: '#/gallery'
    }, {
      label: 'Maps',
      iconClasses: 'glyphicon glyphicon-map-marker',
      hideOnHorizontal: true,
      children: [{
        label: 'Google Maps',
        url: '#/maps-google'
      }, {
        label: 'Vector Maps',
        url: '#/maps-vector'
      }]
    }];


    var setParent = function(children, parent) {
      angular.forEach(children, function(child) {
        child.parent = parent;
        if (child.children !== undefined) {
          setParent(child.children, child);
        }
      });
    };

    $scope.findItemByUrl = function(children, url) {
      for (var i = 0, length = children.length; i < length; i++) {
        if (children[i].url && children[i].url.replace('#', '') === url) {
          return children[i];
        }
        if (children[i].children !== undefined) {
          var item = $scope.findItemByUrl(children[i].children, url);
          if (item) {
            return item;
          }
        }
      }
    };

    setParent($scope.menu, null);

    $scope.openItems = []; $scope.selectedItems = []; $scope.selectedFromNavMenu = false;

    $scope.select = function(item) {
      // close open nodes
      if (item.open) {
        item.open = false;
        return;
      }
      for (var i = $scope.openItems.length - 1; i >= 0; i--) {
        $scope.openItems[i].open = false;
      }
      $scope.openItems = [];
      var parentRef = item;
      while (parentRef !== null) {
        parentRef.open = true;
        $scope.openItems.push(parentRef);
        parentRef = parentRef.parent;
      }

      // handle leaf nodes
      if (!item.children || (item.children && item.children.length < 1)) {
        $scope.selectedFromNavMenu = true;
        for (var j = $scope.selectedItems.length - 1; j >= 0; j--) {
          $scope.selectedItems[j].selected = false;
        }
        $scope.selectedItems = [];
        parentRef = item;
        while (parentRef !== null) {
          parentRef.selected = true;
          $scope.selectedItems.push(parentRef);
          parentRef = parentRef.parent;
        }
      }
    };

    $scope.highlightedItems = [];
    var highlight = function(item) {
      var parentRef = item;
      while (parentRef !== null) {
        if (parentRef.selected) {
          parentRef = null;
          continue;
        }
        parentRef.selected = true;
        $scope.highlightedItems.push(parentRef);
        parentRef = parentRef.parent;
      }
    };

    var highlightItems = function(children, query) {
      angular.forEach(children, function(child) {
        if (child.label.toLowerCase().indexOf(query) > -1) {
          highlight(child);
        }
        if (child.children !== undefined) {
          highlightItems(child.children, query);
        }
      });
    };

    // $scope.searchQuery = '';
    $scope.$watch('searchQuery', function(newVal, oldVal) {
      var currentPath = '#' + $location.path();
      if (newVal === '') {
        for (var i = $scope.highlightedItems.length - 1; i >= 0; i--) {
          if ($scope.selectedItems.indexOf($scope.highlightedItems[i]) < 0) {
            if ($scope.highlightedItems[i] && $scope.highlightedItems[i] !== currentPath) {
              $scope.highlightedItems[i].selected = false;
            }
          }
        }
        $scope.highlightedItems = [];
      } else
      if (newVal !== oldVal) {
        for (var j = $scope.highlightedItems.length - 1; j >= 0; j--) {
          if ($scope.selectedItems.indexOf($scope.highlightedItems[j]) < 0) {
            $scope.highlightedItems[j].selected = false;
          }
        }
        $scope.highlightedItems = [];
        highlightItems($scope.menu, newVal.toLowerCase());
      }
    });

    $scope.$on('$routeChangeSuccess', function() {
      if ($scope.selectedFromNavMenu === false) {
        var item = $scope.findItemByUrl($scope.menu, $location.path());
        if (item) {
          $timeout(function() {
            $scope.select(item);
          });
        }
      }
      $scope.selectedFromNavMenu = false;
      $scope.searchQuery = '';
    });
  }]);