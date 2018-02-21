/**
 * Created by chetan on 26/8/15.
 */

app.controller('ObservationListOthersController', ['$scope','$log','DataSource','$stateParams','$state','filterFilter',function($scope,$log,DataSource,$stateParams, $state, filterFilter) {



    var observationList=[];
    var selectedUserArray=[];
    var selectedStatusArray=[];
    var selectedDateArray=[];
    var loadObjNames=[];
    var storebridId ='';

    //############################# Other Changes ############################################################

    $scope.loadBridArray = function(observationsAs,bridIdList){
        callbackloadBridArray = function(data) {

            $('#fullScreenLoader').modal('hide');
            loadObjNames=data.response;

            $log.debug("####################*************");
            $log.debug(loadObjNames);



            var tmpObservationRecords=[];
            _.each(observationList, function(item) {
                var observeeItem;
                if(observationsAs==="GET_RECENT_OBSERVERLIST_OTHER"){
                    observeeItem=_.find(loadObjNames, _.matchesProperty('brid', item.observee_BRID));
                }else{
                    observeeItem=_.find(loadObjNames, _.matchesProperty('brid', item.observer_BRID));
                }
                if(!_.isUndefined(observeeItem)){
                    item.name=observeeItem.displayName;
                    item.title=observeeItem.title;
                    item.account=observeeItem.primaryLoginAccount;

                    if(item.name) // To check if the name is not empty
                        tmpObservationRecords.push(item);
                }
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


    //Grid By brids///////////////////////////////////////////////////////////////////

    $scope.recentObservationOthers = function(observationsAs) {

        callbackobservationOthers = function(data) {
            $('#fullScreenLoader').modal('hide');

            //_.each(data.response, function(item) {
            //
            //    $log.debug(item);
            //    observationList.push(item);
            //    $scope.observationList = observationList;
            //
            //});


            var bridIdList;
            _.each(data.response, function(item) {

                if(observationsAs==="GET_RECENT_OBSERVERLIST_OTHER"){
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



        };

        var url = appEnv[appEnv.env].baseWSURL;

        if(appEnv[appEnv.env]==="stub") url = appEnv[appEnv.env].baseWSURL + "stubs/MEMBERLIST_CONTENT_LIST.json";
        //contentRequestParams={brid:'E20038708'};

        var bridID = $scope.getObservationFactory().getSelectedBRID();
        $log.debug("bridID bridID bridID bridID bridID");
        $log.debug(bridID);
        contentRequestParams = {brid: bridID};

        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(contentRequestParams)),observationsAs);
        var params={
            header: appEnv[appEnv.env].requestHeader,
            requestData:requestParams
        };
        $('#fullScreenLoader').modal();
        DataSource.get(url,params,callbackobservationOthers,appEnv[appEnv.env].requestMethod);



    };
    //############################# Other Changes END ############################################################

    //observationList=[];

    $scope.filterByDevelopee = "Filter by developer name";
    $scope.developColName = "DEVELOPER NAME";
    $scope.getObservationList = function(index){
        if(index==1){
            observationList=[];

            $scope.developColName = "DEVELOPER NAME";
            $scope.filterByDevelopee = "Filter by developer name";
            $scope.recentObservationOthers("GET_RECENT_OBSERVEELIST_OTHER");
        }
        else{
            observationList=[];
            $scope.developColName = "DEVELOPEE NAME";
            $scope.filterByDevelopee = "Filter by developee name";
            $scope.recentObservationOthers("GET_RECENT_OBSERVERLIST_OTHER");
        }
    };


    $scope.$watch(function () {
            return $scope.getSessionFactory().getBusinessAreas()
        }
        , function (newVal, oldVal) {
            if (newVal !== null) {

                $scope.recentObservationOthers("GET_RECENT_OBSERVEELIST_OTHER");

            }
        }
    );




    //FILTER BY NAME

    $scope.filterByname = function(e){

        if (selectedUserArray.length =='') {
            e.preventDefault();
        }

        else{
            var filteredObservationRecords=[];
            _.each(selectedUserArray, function(user) {
                $log.debug(user);
                var tmpFilteredObservationsList=_.filter(observationList, {'name':user});
                filteredObservationRecords=filteredObservationRecords.concat(tmpFilteredObservationsList);
            });
            $log.debug("filteredObservationRecords Filled");
            $log.debug(filteredObservationRecords);
            $scope.observationList=filteredObservationRecords;

        }


    };



    //FILTER BY STATUS

    $scope.filterByStatus = function(){
        if (selectedStatusArray.length =='') {
            e.preventDefault();
        }
        else{
            var filteredObservationRecords=[];
            _.each(selectedStatusArray, function(user) {
                $log.debug(user);
                var tmpFilteredObservationsList=_.filter(observationList, {'status':user});
                filteredObservationRecords=filteredObservationRecords.concat(tmpFilteredObservationsList);
            });
            $log.debug("filteredObservationRecords Filled");
            $log.debug(filteredObservationRecords);
            $scope.observationList=filteredObservationRecords;
        }

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


    $("#datetimepicker-2").datetimepicker({
        format: 'd-m-Y',
        timepicker: false,
        closeOnDateSelect: true,
        onSelectDate: function(ct, $i) {
            var fromDate= ct.dateFormat('d/m/Y');
            $("#fromDate-MI").val(fromDate);
            $scope.fromDate=fromDate;
            selectedDateArray.push($scope.fromDate);
        }
    });



    $("#datetimepicker-3").datetimepicker({
        format: 'd-m-Y',
        timepicker: false,
        closeOnDateSelect: true,
        onSelectDate: function(ct, $i) {
            $("#toDate-MI").val(ct.dateFormat('d/m/Y'));
            var toDate= ct.dateFormat('d/m/Y');
            $("#toDate-MI").val(toDate);
            $scope.toDate=toDate;

        }
    });




    //FILTER BY Date

    $scope.filterByDate = function(e){
        if($("#fromDate").val()=='' && $("#toDate").val() =='')
        {
            e.preventDefault();
        }

        else{

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

        }

    };

    // CLEAR FILTERS

    $scope.filterClear = function()
    {
        var selectedUserArray=[];
        $scope.observationList = observationList;

        $scope.fromDate = "";
        $scope.toDate = "";
        $scope.fromDateMI = "";
        $scope.toDateMI = "";

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




    //Filter Menu CSS

    $('.nav.navbar-nav').on('click', function (event) {
        //$(this).children("li").toggleClass("open");
        $(this).children("li").addClass("open");

        if ($(this).children("li").hasClass("open")) {
            $(this).children().find(".mega-dropdown-menu").slideDown();
//
            $(this).children("div.drop-down-arrow").children().attr("src", "img/ArrowUp.png");
        }


        /*
         else {
         $(this).children().find(".dropdown-menu").slideUp();
         $(this).children("div.drop-down-arrow").children().attr("src", "img/ArrowDown.png");
         }*/


        //$("#observerNameMenu").slideDown();
    });


    /*$('li.dropdown.mega-dropdown a.namefilter').on('click', function (event) {
     //$(this).parent().toggleClass("open");
     $("#observerNameMenu").slideDown();
     });


     $('li.dropdown.mega-dropdown a.datefilter').on('click', function (event) {
     $(this).parent().toggleClass("open");
     $(this).children("img").attr("src","img/ArrowUp.png");
     $("#observerDateMenu").slideDown();
     });


     $('li.dropdown.mega-dropdown a.statusfilter').on('click', function (event) {
     $(this).parent().toggleClass("open");
     $("#observerStatusMenu").slideDown();
     });*/



//    $('.filter-wrapper').on('click', function (event) {
//
//
//            $(this).children().find('.mega-dropdown-menu').slideToggle();
//
//
//
//    });



    $('#filterByname').on('click', function (event) {
            $("#observerNameMenu").slideUp();
        }
    );


    $('#filterByDate').on('click', function (event) {
            $("#observerDateMenu").slideUp();
            $(this).children("img").attr("src", "img/ArrowUp.png");
        }
    );

    $('#filterByStatus').on('click', function (event) {
            $("#observerStatusMenu").slideUp();
        }
    );

    $('body').on('click', function (e) {
            if (!$('li.dropdown.mega-dropdown').is(e.target) && $('li.dropdown.mega-dropdown').has(e.target).length === 0 && $('.open').has(e.target).length === 0) {
                $("#observerNameMenu").slideUp();
                $("#observerStatusMenu").slideUp();
                $("#observerDateMenu").slideUp();
                $("#personMenu").slideUp();
                $("#changeLevelMenu").slideUp();
                $("#changeDatePeriodMenu").slideUp();
                $("#observerDateMenu-MI").slideUp();

                $(".nav.navbar-nav div img").attr("src", "img/ArrowDown.png");
            }
        }
    );


    $('.cleaFilter-btn').on('click', function (event) {
            $('.filterItems').find("input[type='checkbox']").removeAttr('checked');

        }
    );

    $('.Observee-btn').css('background', '#017EB6').children('a').css('color', '#fff');

    $('.Observee-btn').click(function () {
            $(this).css('background', '#017EB6').children('a').css('color', '#fff');
            $('.Observer-btn').css('background', '#E8E8E8').children('a').css('color', '#005e81');
        }
    );

    $('.Observer-btn').click(function () {
        $(this).css('background', '#017EB6').children('a').css('color', '#fff');
        $('.Observee-btn').css('background', '#E8E8E8').children('a').css('color', '#005e81');
    });



    //NEW Dropdown outside click btn

    $('.img-arrow').addClass('arrow-down1');
    $('.img-arrow').parent().css('margin-right','-8px')
    $(".dropdown-out").on("click", "li", function(e) {
        e.stopImmediatePropagation();
    });

    //NEW Dropdown inside click btn
    $(".dropdown-in").on("click", "li", function() {

    });


    $(".dropdown-main").on("click", ".btn-default", function() {

        $(this).find('.img-arrow').toggleClass('arrow-up');

    });


    $(document).on("click", ".container", function() {

        $('.img-arrow').removeClass('arrow-up');

    });





}
]);
