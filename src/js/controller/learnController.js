app.controller('learnController', ["$scope","$log","DataSource","sessionFactory","$stateParams", function($scope,$log,DataSource,sessionFactory,$stateParams){

    if(_.isUndefined($stateParams.search)) {
        $scope.searchKeyword="";
    }else{
        $scope.searchKeyword=$stateParams.search;
    }
    var contentRequestParams;
    $scope.businessUnitID="";
    $scope.contentType="";
    $scope.pageNo="0";
    $scope.pageSize="10";
    $scope.learnHistoryArray = "";
    $scope.learnArray = "";



    // Load the content list
    $scope.loadContent = function(){
        callbackLoadContent = function(data) {
            $log.debug(data);
            updateView(data.response);

            $log.debug("invoking updateHistory() from LoadContentCallback");
            updateHistory();
        };
        var url = appEnv[appEnv.env].baseWSURL;
        if(appEnv[appEnv.env]==="stub") url = appEnv[appEnv.env].baseWSURL + "stubs/GET_LEARNING_CONTENT_LIST.json";
        //contentRequestParams={business_unit_id:$scope.businessUnitID, search_keyword:$scope.searchKeyword, page_no:$scope.pageNo, page_size:$scope.pageSize, content_type:$scope.contentType};
        contentRequestParams={search_keyword:$scope.searchKeyword, index:$scope.pageNo, count:$scope.pageSize};
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(contentRequestParams)),"GET_LEARNING_CONTENT_LIST");
        var params={
            header: appEnv[appEnv.env].requestHeader,
            requestData:requestParams
        };
        $scope.searchKeyword="";
        DataSource.get(url,params,callbackLoadContent,appEnv[appEnv.env].requestMethod);
    };
    function updateView(obj){
        $('#fullScreenLoader').modal('hide');
        if(obj.length===0 || obj.length===null){
            $log.debug("No Learn Data found");
        }else{
            var learnArray = [];
            _.each(obj, function(item) {
                item.created_at=new Date(parseInt(item.created_at.replace("/Date(", "").replace(")/",""), 10)).toLocaleString();
                item.modified_at=new Date(parseInt(item.modified_at.replace("/Date(", "").replace(")/",""), 10)).toLocaleString();


                if(!_.isUndefined(item.thumbail_url)) {
                    item.thumbail_url = $scope.getUtilityFactory().getPhotoURL(item.thumbail_url);
                }

                //if(!_.isUndefined(item.thumbail_url)){
                //    var thumbnails = item.thumbail_url.split(",");
                //    if(thumbnails.length>1){
                //        item.thumbail_url=thumbnails[0];
                //    }
                //}

                if(!_.isUndefined(item.duration)){

                    var duration=item.duration;
                    if(duration>60){
                        item.duration= Math.round(duration/60) + " Minutes";
                    }

                }else{
                    item.duration="";
                }


                $log.debug(item);
                learnArray.push(item);
            });
            $scope.learnArray=learnArray;
        }
    }
    $('#searchButton').on('click', function () {
        if($("#searchModule").val()==0){
                  alert('Please enter search keywords');
        }
        else{
            triggerSearch();
        }

    });


    $('#searchModule').keypress(function (e) {
        var key = e.which;
        if(key == 13)  // the enter key code
        {

            if($("#searchModule").val()==0){
                alert('Please enter search keywords');
            }
            else{
                triggerSearch();
            }
        }
    });

    function triggerSearch(){
        $('#fullScreenLoader').modal();
        window.location.href=$scope.baseURL+"learn/"+$scope.searchKeyword;
    }


    //Method to get the viewed history data
    $scope.loadContentHistory = function () {
        callbackLoadContentHistory = function (data) {

            $log.debug("Response GET_CONTENT_HISTORY\n\n" + data);
            $scope.learnHistoryArray = data.response;

            if ($scope.learnArray.length > 0) {
                $log.debug("invoking updateHistory() from HistoryCallBack");
                updateHistory();
            }
        };

        var url = appEnv[appEnv.env].baseWSURL;
        if (appEnv[appEnv.env] === "stub") url = appEnv[appEnv.env].baseWSURL + "stubs/GET_CONTENT_HISTORY.json";
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(""), "GET_CONTENT_HISTORY");
        var params = {
            header: appEnv[appEnv.env].requestHeader,
            requestData: requestParams
        };
        DataSource.get(url, params, callbackLoadContentHistory, appEnv[appEnv.env].requestMethod);
    };




    //Called from both LoadContent and LoadContentHistory callback, to update the UI if already viewed.
    function updateHistory() {

        //Check if we have received response from both the WS calls, if we have data, then proceed.
        if ($scope.learnArray.length > 0 && $scope.learnHistoryArray.length > 0) {
            _.each($scope.learnHistoryArray, function (history) {

                learnArrayItem = _.find($scope.learnArray, function (learnItem) {
                    return learnItem.content_id == history.content_id;
                });

                if (learnArrayItem) {
                    learnArrayItem.viewed = "visited";  //this can be directly used in ng-class so kept the class nam
                                                        //instead of true/false values.
                }
            });
        }
    }


    $scope.$watch(function () { return $scope.getSessionFactory().getBusinessAreas() }, function (newVal, oldVal) {
        if (newVal !== null) {
            $scope.loadContent();
            $scope.loadContentHistory();
        }
    });


}]);