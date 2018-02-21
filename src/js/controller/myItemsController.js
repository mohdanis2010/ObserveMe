app.controller('myItemsController', ["$scope","$state","$log", function($scope,$state, $log) {
  $('#fullScreenLoader').modal('hide');

  $scope.setPage = function () {
    $state.transitionTo("learn");
  };

}]);
