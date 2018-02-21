app.controller('landingController', ["$scope","$state","$log", function($scope,$state, $log) {
    $('#fullScreenLoader').modal('hide');
     $(".tool-tip").css('display','block');

    $(document).on("click",function(){
        $(".tool-tip").css('display','none');
    });
}]);
