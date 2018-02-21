/**
 * Created by chetan on 26/8/15.
 */

app.controller('ObservationRecordOverviewController', ['$scope','$log','DataSource','$stateParams','$state','filterFilter',function($scope,$log,DataSource,$stateParams, $state, filterFilter) {

    $scope.dateFromArr = [];
    $scope.dateToArr = [];

    $scope.categoryArr = ["individual","directReport","spanofcontrol"];

    $scope.categoryArrUI = ["Individual","Direct Report","Span of Control"]; //drop down.

    //$scope.bridMIYou = $scope.ownBRID;
    var factory = $scope.getSessionFactory();
    $scope.bridMIYou = factory.getBrid();
    $scope.levelMI = "individual";

    $scope.getMI = function(brid,category,fromDate,toDate) {
        //Get the MI details.
        var url = appEnv[appEnv.env].baseWSURL;

        function callbackObsrvContentDetail(data) {
            var arr = [];
            arr.push(parseInt(data.response.free));
            arr.push(parseInt(data.response.product));
            arr.push(parseInt(data.response.structure));

            $scope.drawChart(arr);
        };
        var contentRequestParams = {
            brid:brid,
            category:category,
            fromDate:fromDate,
            toDate:toDate
        };

        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(contentRequestParams)), "GET_MI_LIST");

        var params = {
            header: appEnv[appEnv.env].requestHeader,
            requestData: requestParams
        };
        DataSource.get(url, params, callbackObsrvContentDetail, appEnv[appEnv.env].requestMethod);

    };

    // DEFAULT VALUES FOR MI
    $scope.callMIDefaultValues = function() {
        $('#MIChart').empty();

        var selectedfromDate = 0;
        var selectedToDate = moment().valueOf();
        $scope.getMI($scope.bridMIYou,"individual",selectedfromDate,selectedToDate);
    };


    $scope.observerClickMI = function(brid) {
        $('#MIChart').empty();
        
        if(!brid)
            brid =factory.getBrid(); 


        $scope.bridMIYou = brid;


        var selectedfromDate = "";
        var selectedToDate = "";
        if(!$scope.fromDateMI || !$scope.toDateMI) {
            selectedfromDate = 0;
            selectedToDate = moment().valueOf();
        }else{
            selectedfromDate = moment($scope.fromDateMI, "DD/MM/YYYY").valueOf();
            selectedToDate = moment($scope.toDateMI, "DD/MM/YYYY").valueOf();
        }
        $scope.getMI(brid,$scope.levelMI,selectedfromDate,selectedToDate);
    };


    $scope.levelDropDownClick = function(level) {
        $('#MIChart').empty();
        $scope.levelMI = level;
        var selectedfromDate = "";
        var selectedToDate = "";
        if(!$scope.fromDateMI || !$scope.toDateMI) {
            selectedfromDate = 0;
            selectedToDate = moment().valueOf();
        }else{
            selectedfromDate = moment($scope.fromDateMI, "DD/MM/YYYY").valueOf();
            selectedToDate = moment($scope.toDateMI, "DD/MM/YYYY").valueOf();
        }
        $scope.getMI($scope.bridMIYou,level,selectedfromDate,selectedToDate);
    };

    $scope.submitMIByDate = function() {
        $('#MIChart').empty();
//        alert($scope.fromDate+" "+$scope.toDate);
        var selectedfromDate = moment($scope.fromDateMI, "DD/MM/YYYY").valueOf();
        var selectedToDate = moment($scope.toDateMI, "DD/MM/YYYY").valueOf();
        $scope.getMI($scope.bridMIYou,$scope.levelMI,selectedfromDate,selectedToDate);
    };

    $(document).on("click", ".tabButton", function () {
            $scope.currentTabContentID = this.id + "-content";
            $(".tab-content").each(function (index, value) {
                    $(this).hide();
                    if ($scope.currentTabContentID === this.id) {
                        $(this).show();
                    }
                }
            );
            $(this).removeClass('opacity');
            $(this).siblings().addClass('opacity');
        }
    );


    $scope.drawChart = function (arr) {

        //arr = [25, 37, 72];
        var line1 = [['Free', arr[0]], ['Structured', arr[1]], ['Product', arr[2]]];
        var maxValue = Math.max.apply(Math,arr);
        maxValue = Math.ceil(maxValue/10)*10;
        maxValue = (maxValue<10)?10:maxValue;

        $('#MIChart').jqplot([line1], {
            title: '',
            seriesColors: ['#1D73A7'],
            seriesDefaults: {
                renderer: $.jqplot.BarRenderer,
                rendererOptions: {
                    barMargin: 120,
                    varyBarColor: false,
                    barWidth: 30,
                    highlightMouseOver: false

                },
                pointLabels: {
                    show: true
                }
            },
            axes: {
//                xaxis: {
//                    renderer: $.jqplot.CategoryAxisRenderer
//                }

                xaxis: {
                    renderer: $.jqplot.CategoryAxisRenderer,
                    tickOptions:{
                        showGridline: false

                    }
                },
                yaxis: {
                    min:0,
                    max:Math.ceil(maxValue/10)*10,
                    numberTicks:11
                }
            }

        });
    }
    ;

    //$scope.drawChart([]);

    var observationList=[];
    var selectedUserArray=[];
    var selectedStatusArray=[];
    var selectedDateArray=[];
    var loadObjNames=[];
    var storebridId ='';

    $scope.observerClickMI();
    loadObseverList("GET_RECENT_OBSERVERLIST");
    
    $scope.analyticsClick = function() {
//        $scope.getMI('directReport');
        $scope.observerClickMI();
    };

    $scope.observationsClick = function() {
        observationList=[];
        loadObseverList("GET_RECENT_OBSERVERLIST");
    };

    $scope.loadBridArray = function(observationsAs,bridIdList){
        callbackloadBridArray = function(data) {

            $('#fullScreenLoader').modal('hide');
            loadObjNames=data.response;

            $log.debug("####################*************");
            $log.debug(loadObjNames);

//            if (_.isUndefined(loadObjNames.displayName)){
//                 alert('displayName');
//            }
//


            var tmpObservationRecords=[];
            /* Add one dummy record for yourself */
            tmpObservationRecords.push({"me":true,"name":"Person (you)","title":"","account":$scope.getSessionFactory().getBrid()});
            _.each(observationList, function(item) {
                var observeeItem;
                if(observationsAs==="GET_RECENT_OBSERVERLIST"){
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

            if(observationsAs==="GET_RECENT_OBSERVERLIST")
            $scope.obsrvNameList = _.unique(observationList,'observee_BRID');


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

            if("GET_RECENT_OBSERVERLIST"==observationsAs)
                $("#btnDeveloper").siblings().removeClass("active").end().addClass("active");
            else
                $("#btnDevelopee").siblings().removeClass("active").end().addClass("active");



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


    $("#miDatePickerFrom").datetimepicker({
        format: 'd-m-Y',
        timepicker: false,
        closeOnDateSelect: true,
        onSelectDate: function(ct, $i) {
            var fromDate= ct.dateFormat('d/m/Y');
            $("#fromDate-MI").val(fromDate);
            $scope.fromDateMI=fromDate;
            //selectedDateArray.push($scope.fromDate);
        }
    });



    $("#miDatePickerTo").datetimepicker({
        format: 'd-m-Y',
        timepicker: false,
        closeOnDateSelect: true,
        onSelectDate: function(ct, $i) {
            $("#toDate-MI").val(ct.dateFormat('d/m/Y'));
            var toDate= ct.dateFormat('d/m/Y');
            $("#toDate-MI").val(toDate);
            $scope.toDateMI=toDate;
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
 

    };

    $scope.filterClearMI = function(whatToClear)
    {
         $('#MIChart').empty();

        var selectedfromDate = 0;
        var selectedToDate = moment().valueOf();

        if($scope.fromDateMI && $scope.toDateMI){

            selectedfromDate = moment($scope.fromDateMI, "DD/MM/YYYY").valueOf();
            selectedToDate = moment($scope.toDateMI, "DD/MM/YYYY").valueOf();
        }

        if(whatToClear == "date"){
            var selectedfromDate = 0;
            var selectedToDate = moment().valueOf();

            $scope.fromDateMI = "";
            $scope.toDateMI = "";
        }
        else{
             $scope.levelMI = "individual";
             $("#lblChangeLvl").html("Change level");
        }

        $scope.getMI($scope.bridMIYou, $scope.levelMI,selectedfromDate,selectedToDate);
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




    $scope.filterByDevelopee = "Filter by developee name";
    $scope.developColName = "DEVELOPEE NAME";

    $scope.getObservationList = function(index){
        if(index==1){
            observationList=[];
           $scope.developColName = "DEVELOPER NAME";
           $scope.filterByDevelopee = "Filter by developer name";
            loadObseverList("GET_RECENT_OBSERVEELIST");
        }
        else{
            observationList=[];
            $scope.developColName = "DEVELOPEE NAME";
            $scope.filterByDevelopee = "Filter by developee name";
            loadObseverList("GET_RECENT_OBSERVERLIST");
        }
    };






    $scope.$watch(function () {
            return $scope.getSessionFactory().getBusinessAreas()
        }
        , function (newVal, oldVal) {
            if (newVal !== null) {
                //$scope.getMI('directReport');
                //$scope.getMI('individual');
                //$scope.getMI('spanofcontrol');
                //loadObseverList("GET_RECENT_OBSERVEELIST");

                loadObseverList("GET_RECENT_OBSERVEELIST");
                $scope.callMIDefaultValues();

            }
        }
    );


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
        var thisText = $(this).find('span').html();
        $(this).parents('.dropdown-main').find('.appendTitle').html(thisText);
    });


    $(".custom-menu-items").on("click", ".btn-default", function() {
        //Menu scroll logic
        if($(".cutom-menu-item").size()>6){
        $(".custom-dropdown-menu").css({'max-height':'300px','overflow':'scroll','overflow-x':'hidden'});

        }
    });



    $(".dropdown-main").on("click", ".btn-default", function() {

        $(this).find('.img-arrow').toggleClass('arrow-up');

    });


    $(document).on("click", ".container", function() {

        $('.img-arrow').removeClass('arrow-up');

    });


}
]);
