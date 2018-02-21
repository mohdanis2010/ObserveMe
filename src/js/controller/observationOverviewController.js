app.controller('observationOverviewController', ['$scope', '$log', 'DataSource', "$stateParams", function($scope, $log, DataSource, $stateParams) {

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
                var DeveloperAndDevelopeeBrid = $scope.obsrvResponseData.observerBrid + "," + $scope.obsrvResponseData.observeeBrid;
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
                        $scope.developer = _.result(_.find(data.response, {'brid':$scope.obsrvResponseData.observerBrid}),'displayName');  
                        $scope.developee = _.result(_.find(data.response, {'brid':$scope.obsrvResponseData.observeeBrid}),'displayName');
                }
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

            $scope.currentAction = _.find($scope.actionItems, function(action) {
                return action.actionItemID == selectedActionId;
            });

            if (!($scope.currentAction.actionItemStatus == "Complete"))
            $("#completeActionModal").modal("show");
        };



        function renderOverviewPageHTML(response) {

            var obsrvColl = response.formtemplate.observationItem;
            obsrvColl = _.sortBy(obsrvColl, "itemOrder");


        //Summary
        if (!_.isEmpty(response.observationSummary)) {
            $("#obsrvSummary").html(response.observationSummary);
        }
        else{
            $("#summary").hide();
        }

        $scope.actionItems = [];

        if (!_.isEmpty(response.observationActionItems)) {
            $("#actionsTbl").show();
            $("#oo-action-tbl").show();
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
            $("#actionsTbl").hide();
            $("#oo-action-tbl").hide();

        }

        var Html = "";
        var sectionHtml = "";

        _.each(obsrvColl, function(obsrv) {
            sectionHtml = "";
            sectionHtml = sectionHtml + "<div id='obsrv" + obsrv.formItem.itemId + "'>";
            sectionHtml = sectionHtml + "<div class='section-hdr'>" + obsrv.formItem.name + "</div>";

            var sectionDetailHtml = renderObsrvDetails(obsrv.childItems);


            if(sectionDetailHtml)
                sectionHtml+= sectionDetailHtml + "</div>";
            else
                sectionHtml="";

            Html = Html + sectionHtml;
        });
        $("#ObservationCntr").html(Html);


    }

    function renderObsrvDetails(obsrvDetails) {

        var returnHtml = "";

            //For Free Observation
            if (obsrvDetails.length === 1) {

                var ans= getAnswerData(obsrvDetails[0].formItem.itemId);
                if(ans)
                     returnHtml = "<p class='section-data'>" + ans + "</p>"
            }
            else {

                _.each(obsrvDetails, function(rowData) {
                    $log.debug(rowData.formItem.name);


                var rowHTML = "";

                //COLUMN 1
                rowHTML = rowHTML + "<div class='section-row'><div class='row-hdr' style='background-color:" + rowData.formItem.color.colorValue + ";'>" + rowData.formItem.name + "</div>";

                    //For THREE column Format ONLY
                    if (rowData.childItems.length === 2) {

                    //COLUMN 2
                    rowHTML = rowHTML + "<div class='row-left-data'><div class='qtn'>" + rowData.childItems[0].formItem.name + "</div>";

                    var radioBtnHTML = getEvalRadioBtnHtml(rowData.childItems[0]);
                    var commentHTML = getAnswerData(rowData.childItems[1].formItem.itemId);


                    if(radioBtnHTML || commentHTML){
                        rowHTML = rowHTML + radioBtnHTML+ "</div>";

                        //COLUMN 3
                        rowHTML = rowHTML + "<p class='row-data'>" + commentHTML + "</p>";
                    }
                    else
                        rowHTML ="";

                }


                else { //COLUMN 2 - Lengthy

                    //To check if Product Observation 1st row, which needs to display the product name
                    if (rowData.childItems.length == 1 && rowData.childItems[0].formItem.formItemType.name == "LOV_PRODUCT_LIST"){

                        var prodName = getProductName(rowData.childItems[0]);

                        if(prodName)
                            rowHTML = rowHTML + "<p class='row-data'>" + prodName + "</p>";
                        else
                            rowHTML="";

                    }
                    else{

                        var commentHTML = getAnswerData(rowData.childItems[0].formItem.itemId);

                        if(commentHTML)
                            rowHTML = rowHTML + "<p class='row-data'>" + commentHTML + "</p>";
                        else
                            rowHTML="";
                    }
                }

                if(rowHTML)
                    returnHtml+= rowHTML + "</div>";

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

