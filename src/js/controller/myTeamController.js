app.controller('myTeamController', ['$scope', '$log', 'DataSource', '$stateParams', '$state', function($scope, $log, DataSource, $stateParams, $state) {

    $scope.currentURLState = $state.current.name;
    $scope.isTeamView = false;


    if (_.isUndefined($stateParams.search)) {
        $scope.searchKeyword = "";
    } else {
        $scope.searchKeyword = $stateParams.search;
    }

    var contentRequestParams = '';
    var myTeam = [];
    var businessAreas = [];
    var businessAreasRole = [];
    $scope.picsURL = "http://my.barclays.intranet:80/User%20Photos/Profile%20Pictures/";

    // Need to check online
    $scope.placeholder = "img/person.gif";


    $scope.loadMyTeam = function() {
        callbackLoadObservationForm = function(data) {
            $('#fullScreenLoader').modal('hide');
            _.each(data.response, function(item) {
                var backslashTohash = item.primaryLoginAccount.replace(/\\/g, "_");
                item.photoURL = url + "/image?url=" + $scope.picsURL + backslashTohash + '_MThumb.jpg';
                myTeam.push(item);
            });

            $scope.employeeList = myTeam;
            $log.debug("test peers data");
        };


        var url = appEnv[appEnv.env].baseWSURL;

        if (appEnv[appEnv.env] === "stub")
            url = appEnv[appEnv.env].baseWSURL + "stubs/MEMBERLIST_CONTENT_LIST.json";
        //var factory = $scope.getSessionFactory();
        //contentRequestParams = {brid:factory.getBrid()};
        contentRequestParams = "";
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(contentRequestParams), "GET_MANAGER_PEERS");
        var params = {
            header: appEnv[appEnv.env].requestHeader,
            requestData: requestParams
        };
        DataSource.get(url, params, callbackLoadObservationForm, appEnv[appEnv.env].requestMethod);
    };


    $scope.searchEmployee = function() {
        callbackLoadObservationForm = function(data) {
            $('#fullScreenLoader').modal('hide');
//                $log.debug("searchEmployee");
//                $log.debug(data);
            _.each(data.response, function(item) {
                var backslashTohash = item.primaryLoginAccount.replace(/\\/g, "_");
                item.photoURL = url + "/image?url=" + $scope.picsURL + backslashTohash + '_MThumb.jpg';
                myTeam.push(item);
            });
            $scope.employeeList = myTeam;
        };

        var url = appEnv[appEnv.env].baseWSURL;

        if (appEnv[appEnv.env] === "stub")
            url = appEnv[appEnv.env].baseWSURL + "stubs/SEARCH_BY_NAME.json";
        contentRequestParams = $scope.searchKeyword;
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(contentRequestParams), "SEARCH_BY_NAME");
        var params = {
            header: appEnv[appEnv.env].requestHeader,
            requestData: requestParams
        };
        DataSource.get(url, params, callbackLoadObservationForm, appEnv[appEnv.env].requestMethod);
    };



    $scope.selectEmployee = function(BRID)
    {

        if ($scope.currentURLState === 'myTeam') {
            $scope.isTeamView = true;
            $('#BusinessSelectModal').modal('hide');
            window.location.href = $scope.baseURL + "observationList";
        }
        else{

            var factory = $scope.getSessionFactory();
            //alert(factory.getBrid() + ":" + BRID.brid);
            if(factory.getBrid()===BRID.brid){
                alert("You cannot create a development record about yourself, please select a colleague");
            }
            else{
                //alert(factory.getBrid());

                $scope.isTeamView = false;
                $('#BusinessSelectModal').modal('show');
            }
        }

        _.each($scope.employeeList, function(item) {
            if (BRID.brid == item.brid) {
//                    $log.debug(BRID.brid + "==" + item.brid);
//                    $log.debug(item.displayName);
                $log.debug(item.brid);
//                    $log.debug(item.businessUnitName);
                $scope.displayPopupName = BRID.displayName;
//
                $scope.getObservationFactory().setObserveeData(item);
                $scope.getObservationFactory().setSelectedBRID(item.brid);

            }
        });
    };

    $scope.selectEmployeeFromPrevList = function(BRID)
    {
        $('#BusinessSelectModal').modal('show');
        _.each($scope.prevObserveList, function(item) {
            $scope.displayPopupName = BRID.displayName;
            if (BRID.brid == item.brid) {
                $scope.getObservationFactory().setObserveeData(item);

                $log.debug(BRID.displayName);
            }

            //$log.debug(BRID.brid + "==" + item.brid);


//              $scope.selectedName =  $scope.getObservationFactory().getObserveeData();
        });

    };

    $scope.selected = "Please select";
    $scope.clicktoSelectBusiness = function(selectedRole) {

        if(selectedRole){
            $('[data-toggle="dropdown"]').parent().removeClass('open');
            $scope.getObservationFactory().setRole(selectedRole.businessRoleId);
            $scope.selected = selectedRole.name;
            event.stopPropagation();
        }
        else{
            event.preventDefault();
            event.stopPropagation();
            $('[data-toggle="dropdown"]').parent().addClass('open');
        }
    };
    $scope.proceedtoObservation = function() {

        if (!($scope.selected == "Please select")) {
            window.location.href = $scope.baseURL + "newObservation";
            $('#BusinessSelectModal').modal('hide');
            $('#fullScreenLoader').modal('show');
        }
    };


    function selectObserveeBusinessArea(params) {
        _.each(params.businessAreaList, function(data) {
//                $log.debug(data);
            businessAreas.push(data);
            $scope.businessName = businessAreas;
        });
    }


    // GET_BRID_DETAILS_ARRAY
    $scope.loadBridArray = function(param) {
        callbackloadBridArray = function(data) {
            var prevObserve = [];

            $log.debug('prevObserve');
            $log.debug(prevObserve);

            _.each(data.response, function(item) {
                var backslashTohash = item.primaryLoginAccount.replace(/\\/g, "_");
                item.photoURL = url + "/image?url=" + $scope.picsURL + backslashTohash + '_MThumb.jpg';
                prevObserve.push(item);
            });
            $scope.prevObserveList = prevObserve;
        };

        var url = appEnv[appEnv.env].baseWSURL;
        if (appEnv[appEnv.env] === "stub")
            url = appEnv[appEnv.env].baseWSURL + "stubs/MEMBERLIST_CONTENT_LIST.json";
        contentRequestParams = param;
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(contentRequestParams), "GET_BRID_DETAILS_ARRAY");
        var params = {
            header: appEnv[appEnv.env].requestHeader,
            requestData: requestParams
        };
        DataSource.get(url, params, callbackloadBridArray, appEnv[appEnv.env].requestMethod);
    };


    //RECENT_OBSERVEE
//        var BRIDS = 'H06385427,E20040064,E20044889,E20044234,E20043838';

    var BRIDID;

    //Previous developee list
    $scope.loadObserveeContents = function() {

        callbackloadObserveeContents = function(data) {

            _.each(data.response, function(item) {
                $log.debug(item.observee_BRID);
                BRIDID=BRIDID + "," + item.observee_BRID;
            });
            $scope.loadBridArray(BRIDID);
        };
        var url = appEnv[appEnv.env].baseWSURL;
        if (appEnv[appEnv.env] === "stub")
            url = appEnv[appEnv.env].baseWSURL + "stubs/MEMBERLIST_CONTENT_LIST.json";
        contentRequestParams = $scope.getRequestParamsFactory().getRequestParams().BRID;
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(contentRequestParams), "GET_RECENT_OBSERVERLIST");
        var params = {
            header: appEnv[appEnv.env].requestHeader,
            requestData: requestParams
        };
        DataSource.get(url, params, callbackloadObserveeContents, appEnv[appEnv.env].requestMethod);
    };

    $('#searchColleagueButton').on('click', function() {

        if ($scope.searchColleagueKeyword.length > 3) {

            $('#fullScreenLoader').modal();
            window.location.href = $scope.baseURL + "myTeam/" + $scope.searchColleagueKeyword;
        }
        else
            alert("Please search with min of 4 characters");

    });


    $('#searchColleagueButton').keypress(function (e) {
        var key = e.which;
        if(key == 13)  // the enter key code
        {

            if ($scope.searchColleagueKeyword.length > 3) {
                $('#fullScreenLoader').modal();
                window.location.href = $scope.baseURL + "myTeam/" + $scope.searchColleagueKeyword;
            }
            else {alert("Please search with min of 4 characters");}

            return false;
        }
    });


    $('#searchColleague').keypress(function (e) {
        var key = e.which;
        if(key == 13)  // the enter key code
        {
            if ($scope.searchColleagueKeyword.length > 3) {
                $('#fullScreenLoader').modal();
                window.location.href = $scope.baseURL + "myTeam/" + $scope.searchColleagueKeyword;
            }
            else {alert("Please search with min of 4 characters");}
        }
    });


    $scope.prevPage = function() {

        window.location.href = $scope.baseURL + "myTeam/";
//        $log.debug("Back to myTeam");
    }

    $scope.$watch(function() {
        return $scope.getSessionFactory().getSession()
    }, function(newVal, oldVal) {
        if (newVal !== null) {
            if ($scope.searchKeyword === "") {
                $scope.isSearchEnabled = false;
                if ($scope.currentURLState === 'myTeam') {
                    $scope.isTeamView = true;
                    $scope.loadMyTeam();
                    $scope.sectionTitles = 'Team';
                }
                else {
                    $scope.isTeamView = false;
                    $scope.loadMyTeam();
                    $scope.loadObserveeContents();
                    $scope.sectionTitles = 'Develop';
                }
            } else {
                $scope.isSearchEnabled = true;
                $scope.searchEmployee();
            }
        }
    });

    $scope.$watch(function() {
        return $scope.getSessionFactory().getBusinessAreas()
    }, function(newVal, oldVal) {
        if (newVal !== null) {
            var data = $scope.getSessionFactory().getBusinessAreas();
            selectObserveeBusinessArea(data.response);
        }
    });


    //$scope.loadpreObservation();




}]);
