app.controller('observationListOverviewController', ['$scope', '$log', 'DataSource', "$stateParams", function($scope, $log, DataSource, $stateParams) {

    $scope.obsrvID = $stateParams.id;
    $scope.currentAction = "";
    //$scope.obsrvID = "165";

    var contentRequestParams;

    // Load the observation record Detail
    $scope.loadObsrvRecordDetail = function() {
        callbackObsrvContentDetail = function(data) {
            $('#fullScreenLoader').modal('hide');
            $log.debug(data);

            $scope.obsrvResponseData = data.response;

            //To display the details at the top right corner
            var DeveloperAndDevelopeeBrid = $scope.obsrvResponseData.observeeBrid + "," + $scope.obsrvResponseData.observerBrid;
            $scope.loadDeveloperAndDevelopeeName(DeveloperAndDevelopeeBrid);

            renderOverviewPageHTML(data.response);
        };

        var url = appEnv[appEnv.env].baseWSURL;
        contentRequestParams = {observationId: $scope.obsrvID};
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(contentRequestParams)), "GET_OBSERVATION");
        var params = {
            header: appEnv[appEnv.env].requestHeader,
            requestData: requestParams
        };
        DataSource.get(url, params, callbackObsrvContentDetail, appEnv[appEnv.env].requestMethod);
    };

    $scope.loadDeveloperAndDevelopeeName = function(bridIDs) {
        callBackLoadDevloperAndDevelopeeName = function(data) {

            if(data.response && data.response.length==2)
            {
                $scope.developee = data.response[0].displayName;
                $scope.developer = data.response[1].displayName;
                $scope.show=true;
            }else{
                $scope.developee = data.response[0].displayName;
                $scope.show=false;
            }
            $scope.developeeBrid = bridIDs.split(",")[0];
            $scope.developerBrid = bridIDs.split(",")[1];
        };

        var url = appEnv[appEnv.env].baseWSURL;
        if (appEnv[appEnv.env] === "stub")
            url = appEnv[appEnv.env].baseWSURL + "stubs/MEMBERLIST_CONTENT_LIST.json";
        contentRequestParams = bridIDs;
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(contentRequestParams), "GET_BRID_DETAILS_ARRAY");
        var params = {
            header: appEnv[appEnv.env].requestHeader,
            requestData: requestParams
        };
        DataSource.get(url, params, callBackLoadDevloperAndDevelopeeName, appEnv[appEnv.env].requestMethod);
    };


    //Invoked onClick of "Complete Action" button, this take the actionId and calls WS to set status
    $scope.completeAction = function(actionIdToComplete) {

        $("#completeActionModal").modal("hide");
        $('#fullScreenLoader').modal('show');

        var completedAction = _.find($scope.actionItems, function(action) {
            return action.actionItemID == actionIdToComplete;
        });

        //completedAction.actionItemStatus = "COMPLETED"; //As expected by WS


        var payload = {
            submissionDate:$scope.obsrvResponseData.submittedDate,
            observationID: $scope.obsrvResponseData.observationID,
            observerBrid:$scope.obsrvResponseData.observerBrid,
            name: $scope.obsrvResponseData.name,
            rollID: $scope.obsrvResponseData.rollID, // Temp need to be changed.
            observeeBrid: $scope.obsrvResponseData.observeeBrid,
            observationSummary: $scope.obsrvResponseData.observationSummary,
            observationStatus: $scope.obsrvResponseData.observationStatus,
            creationDate:$scope.obsrvResponseData.creation_date,
            observationAnswer: [], //No change to the observation Answers

            observationActionItems: [{
                actionItemID: completedAction.actionItemID,
                actionItemStatus: "COMPLETED",
                actionItemOwnerType: completedAction.owner,
                actionIteVerifierType: completedAction.verifier,
                actionItemTitle: completedAction.title,
                actionItemDescription: completedAction.description,
                actionItemDueDate: completedAction.dueDate,
                actionItemCOmpletionDate: completedAction.completionDate
            }
            ]
        };


        callbackCompleteAction = function(data) {

            $('#fullScreenLoader').modal('hide');

            if(!data.response){
                //If there is any issue with WS ressponse
                $log.debug("Unable to update Action status, some issue with WebService");

                completedAction.statusClass = "status-incomplete";
                completedAction.actionItemStatus = "Incomplete";
                return;
            }

            if (data.response.messageStatus) {
                completedAction.statusClass = "status-complete";
                completedAction.actionItemStatus = "Complete";
            }
            else {

                completedAction.statusClass = "status-incomplete";
                completedAction.actionItemStatus = "Incomplete";
            }
        }

        var url = appEnv[appEnv.env].baseWSURL;
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(payload)), "ADD_OBSERVATION");
        var params = {
            header: appEnv[appEnv.env].requestHeader,
            requestData: requestParams
        };
        DataSource.get(url, params, callbackCompleteAction, appEnv[appEnv.env].requestMethod);

    };



    //To close the Complete Action Modal dialog
    $("#btnCloseModal").on("click", function() {
        $("#completeActionModal").modal("hide");
    });


    //To show the Complete Action Modal dialog
    $scope.showActionModal = function(selectedActionId) {

        //var bridsarr = $scope.getRequestParamsFactory().getRequestParams();
        //$log.debug("My My My");
        //$log.debug(bridsarr.input.brid);
       var factory = $scope.getSessionFactory();
        if((factory.getBrid()===$scope.developeeBrid) ||(factory.getBrid()===$scope.developerBrid))
        {
            $scope.currentAction = _.find($scope.actionItems, function(action) {
                return action.actionItemID == selectedActionId;
            });

            if (!($scope.currentAction.actionItemStatus == "Complete"))
                $("#completeActionModal").modal("show");

        }else{
            $scope.currentAction = _.find($scope.actionItems, function(action) {
                return action.actionItemID == selectedActionId;
            });

            if (!($scope.currentAction.actionItemStatus == "Complete"))
                alert("You can't complete actions");
        }

    };



    function renderOverviewPageHTML(response) {

        var obsrvColl = response.formtemplate.observationItem;
        obsrvColl = _.sortBy(obsrvColl, "itemOrder");


        //Summary
        $("#obsrvSummary").html(response.observationSummary);

        $scope.actionItems = [];

        if (!_.isEmpty(response.observationActionItems)) {
            _.each(response.observationActionItems, function(actionItem) {

                actionItem.dispDueDate = moment(actionItem.dueDate).format("DD/MM/YYYY");

                if (_.isEmpty(actionItem.actionItemStatus) || actionItem.actionItemStatus == "PENDING") {
                    actionItem.actionItemStatus = "Incomplete";
                    actionItem.statusClass = "status-incomplete";
                } else {
                    actionItem.actionItemStatus = "Complete";
                    actionItem.statusClass = "status-complete";
                }

                $scope.actionItems.push(actionItem);
            });
        } else {
            //No action records
            $("#oo-action-tbl tbody").append("<tr><td colspan='3'>No Actions</td></tr>");
        }


        var sectionHtml = "";

        _.each(obsrvColl, function(obsrv) {

            /*if (obsrv.itemOrder == "3") {
             obsrv.childItems.splice(0, 1);
             $log.debug("removed 1st node in product observation");
             }*/

            //$log.debug("building HTML for" + obsrv.formItem.name);

            sectionHtml = sectionHtml + "<div id='obsrv" + obsrv.formItem.itemId + "'>";
            sectionHtml = sectionHtml + "<div class='section-hdr'>" + obsrv.formItem.name + "</div>";
            sectionHtml = sectionHtml + renderObsrvDetails(obsrv.childItems) + "</div>";
        });

        $("#ObservationCntr").html(sectionHtml);

    }

    function renderObsrvDetails(obsrvDetails) {

        var returnHtml = "";

        //For Free Observation
        if (obsrvDetails.length === 1) {
            returnHtml = "<p class='section-data'>" + getAnswerData(obsrvDetails[0].formItem.itemId) + "</p>"
        }
        else {

            _.each(obsrvDetails, function(rowData) {
                $log.debug(rowData.formItem.name);

                //COLUMN 1
                returnHtml = returnHtml + "<div class='section-row'><div class='row-hdr' style='background-color:" + rowData.formItem.color.colorValue + ";'>" + rowData.formItem.name + "</div>";

                //For THREE column Format ONLY
                if (rowData.childItems.length === 2) {

                    //COLUMN 2
                    returnHtml = returnHtml + "<div class='row-left-data'><div class='qtn'>" + rowData.childItems[0].formItem.name + "</div>";

                    returnHtml = returnHtml + getEvalRadioBtnHtml(rowData.childItems[0]) + "</div>";

                    //COLUMN 3
                    returnHtml = returnHtml + "<p class='row-data'>" + getAnswerData(rowData.childItems[1].formItem.itemId) + "</p>";
                }
                else { //COLUMN 2 - Lengthy

                    //To check if Product Observation 1st row, which needs to display the product name
                    if (rowData.childItems.length == 1 && rowData.childItems[0].formItem.formItemType.name == "LOV_PRODUCT_LIST"){
                        returnHtml = returnHtml + "<p class='row-data'>" + getProductName(rowData.childItems[0]) + "</p>";
                    }
                    else
                        returnHtml = returnHtml + "<p class='row-data'>" + getAnswerData(rowData.childItems[0].formItem.itemId) + "</p>";
                }

                returnHtml = returnHtml + "</div>";

                $log.debug(returnHtml);
            });

        }

        return returnHtml;
    }

    function getEvalRadioBtnHtml(evalData) {
        var returnBtnHTML = "";

        var selectedEvalId = getAnswerData(evalData.formItem.itemId);

        var btnDetails = _.find(evalData.formItem.formItemValueType.formItemValues, function(btn) {
            return btn.itemValueId == selectedEvalId;
        });

        if (!_.isUndefined(btnDetails))
            returnBtnHTML = "<div class='oo-btn' style='background-color:" + btnDetails.color.colorValue + "'>" + btnDetails.name + "</div>";

        return returnBtnHTML;
    }

    function getProductName(ProductData) {
        var selectedProdId = getAnswerData(ProductData.formItem.itemId);

        var selectedProduct = _.find(ProductData.formItem.formItemValueType.formItemValues, function(prdct) {
            return prdct.itemValueId == selectedProdId;
        });

        if (!_.isUndefined(selectedProduct))
            return selectedProduct.name;
        else
            return "";
    }

    function getAnswerData(itemId) {

        var answer = _.result(_.find($scope.obsrvResponseData.observationAnswers, function(answer) {
            return answer.item_id === itemId;
        }), "answer");

        if (!_.isUndefined(answer))
            return answer;
        else
            return "";
    }


    $scope.$watch(function() {
        return $scope.getSessionFactory().getBusinessAreas()
    }, function(newVal, oldVal) {
        if (newVal !== null) {
            $scope.loadObsrvRecordDetail();
        }
    });


}]);

