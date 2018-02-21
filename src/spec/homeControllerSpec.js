describe("homeController", function() {
    beforeEach(module('app'));

    var $controller;

    beforeEach(inject(function(_$controller_){
        $controller = _$controller_;
    }));

    describe('$scope.testJasmine', function() {
        it('sets the strength to "strong" if the password length is >8 chars', function() {
            var $scope = {};
            var controller = $controller('homeController', { $scope: $scope });
            $scope.password = 'longerthaneightchars';
            $scope.testJasmine();
            expect($scope.strength).toEqual('strong');
        });
    });
});