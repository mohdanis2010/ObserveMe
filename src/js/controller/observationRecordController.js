app.controller('observationRecordController', ['$scope','$log','DataSource','$stateParams','$state','filterFilter',function($scope,$log,DataSource,$stateParams, $state, filterFilter) {

    var observationList=[];
    var selectedUserArray=[];
    var selectedStatusArray=[];
    var selectedDateArray=[];
    var loadObjNames=[];
    var storebridId ='';



    $scope.loadBridArray = function(observationsAs,bridIdList){
        callbackloadBridArray = function(data) {

            $('#fullScreenLoader').modal('hide');
            loadObjNames=data.response;
            var tmpObservationRecords=[];
            _.each(observationList, function(item) {
                var observeeItem;
                if(observationsAs==="GET_RECENT_OBSERVERLIST"){
                    observeeItem=_.find(loadObjNames, _.matchesProperty('brid', item.observee_BRID));
                }else{
                    observeeItem=_.find(loadObjNames, _.matchesProperty('brid', item.observer_BRID));
                }
                if(!_.isUndefined(observeeItem)){
                    item.name=observeeItem.displayName;
                    item.account=observeeItem.primaryLoginAccount;
                }
                tmpObservationRecords.push(item);
            });

            observationList=tmpObservationRecords;
            $scope.masterObservationList = observationList;
            $scope.uniqueNames = _.unique(_.pluck(observationList,'name'));
            $scope.uniqueStatus = _.unique(_.pluck(observationList,'status'));
            $scope.observationList = observationList;


        };

        var url = appEnv[appEnv.env].baseWSURL;
        if(appEnv[appEnv.env]==="stub") url = appEnv[appEnv.env].baseWSURL + "stubs/MEMBERLIST_CONTENT_LIST.json";
        contentRequestParams= bridIdList;
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(contentRequestParams),"GET_BRID_DETAILS_ARRAY");
        var params={
            header: appEnv[appEnv.env].requestHeader,
            requestData:requestParams
        };

        DataSource.get(url,params,callbackloadBridArray,appEnv[appEnv.env].requestMethod);
    };


    function loadObseverList(observationsAs){
        callbackobservationRecord = function(data) {
            var bridIdList;
            _.each(data.response, function(item) {

                if(observationsAs==="GET_RECENT_OBSERVERLIST"){
                    storebridId+=item.observee_BRID + ',' ;
                }else{
                    storebridId+=item.observer_BRID + ',' ;
                }

                bridIdList = storebridId.replace(/,\s*$/, "");
//                $log.debug("Load brid services");
//                $log.debug(bridIdList);
                 observationList.push(item);
            });

            $scope.loadBridArray(observationsAs,bridIdList)

            $scope.sortType='name';
            $scope.sortType='due_date';
            $scope.sortType='status';
            $scope.sortReverse  = false;  // set the default sort order
            $scope.search  = '';


        };

        var url = appEnv[appEnv.env].baseWSURL;

        if(appEnv[appEnv.env]==="stub") url = appEnv[appEnv.env].baseWSURL + "stubs/MEMBERLIST_CONTENT_LIST.json";
        contentRequestParams="";
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(contentRequestParams),observationsAs);
        // var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(contentRequestParams)),"GET_OBSERVATION");
        var params={
            header: appEnv[appEnv.env].requestHeader,
            requestData:requestParams
        };
        $('#fullScreenLoader').modal();
        DataSource.get(url,params,callbackobservationRecord,appEnv[appEnv.env].requestMethod);
    }


    //FILTER BY NAME

    $scope.filterByname = function(){
        var filteredObservationRecords=[];
        _.each(selectedUserArray, function(user) {
            $log.debug(user);
            var tmpFilteredObservationsList=_.filter(observationList, {'name':user});
            filteredObservationRecords=filteredObservationRecords.concat(tmpFilteredObservationsList);
        });
        $log.debug("filteredObservationRecords Filled");
        $log.debug(filteredObservationRecords);
        $scope.observationList=filteredObservationRecords;

    };



    //FILTER BY STATUS

    $scope.filterByStatus = function(){
        var filteredObservationRecords=[];
        _.each(selectedStatusArray, function(user) {
            $log.debug(user);
            var tmpFilteredObservationsList=_.filter(observationList, {'status':user});
            filteredObservationRecords=filteredObservationRecords.concat(tmpFilteredObservationsList);
        });
        $log.debug("filteredObservationRecords Filled");
        $log.debug(filteredObservationRecords);
        $scope.observationList=filteredObservationRecords;

    };


    $("#datetimepicker").datetimepicker({
        format: 'd-m-Y',
        timepicker: false,
        closeOnDateSelect: true,
        onSelectDate: function(ct, $i) {
            var fromDate= ct.dateFormat('d/m/Y');
            $("#fromDate").val(fromDate);
            $scope.fromDate=fromDate;
            selectedDateArray.push($scope.fromDate);
        }
    });



    $("#datetimepicker-1").datetimepicker({
        format: 'd-m-Y',
        timepicker: false,
        closeOnDateSelect: true,
        onSelectDate: function(ct, $i) {
            $("#toDate").val(ct.dateFormat('d/m/Y'));
            var toDate= ct.dateFormat('d/m/Y');
            $("#toDate").val(toDate);
            $scope.toDate=toDate;

        }
    });





    //FILTER BY Date

    $scope.filterByDate = function(){
        var filteredObservationRecords=[];
        var selectedfromDate = moment($scope.fromDate, "DD/MM/YYYY").valueOf();
        var selectedToDate = moment($scope.toDate, "DD/MM/YYYY").valueOf();
        var tmpFilteredObservationsList=[];
        _.each(observationList, function(item) {
            var sortdaterecords = _.inRange(item.due_date, selectedfromDate, selectedToDate);

            if(sortdaterecords){
                tmpFilteredObservationsList.push(item) ;
              }

        });

           $log.debug(tmpFilteredObservationsList);
           filteredObservationRecords=filteredObservationRecords.concat(tmpFilteredObservationsList);
           $scope.observationList=filteredObservationRecords;

    };

 // CLEAR FILTERS

    $scope.filterClear = function()
    {
        var selectedUserArray=[];
         $scope.observationList = observationList;
    };



    $scope.selectPerson = function($event, name) {

        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        if (action == 'add' & selectedUserArray.indexOf(name) == -1) selectedUserArray.push(name);
        if (action == 'remove' && selectedUserArray.indexOf(name) != -1) selectedUserArray.splice(selectedUserArray.indexOf(name), 1);
    };


    $scope.selectStatus = function($event, name) {

        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        if (action == 'add' & selectedStatusArray.indexOf(name) == -1) selectedStatusArray.push(name);
        if (action == 'remove' && selectedStatusArray.indexOf(name) != -1) selectedStatusArray.splice(selectedStatusArray.indexOf(name), 1);
    };




    $scope.getObservationList = function(index){
        if(index==1){
            observationList=[];
            loadObseverList("GET_RECENT_OBSERVEELIST");
        }
        else{
            observationList=[];
            loadObseverList("GET_RECENT_OBSERVERLIST");
        }
    };


    loadObseverList("GET_RECENT_OBSERVEELIST");

}]);
