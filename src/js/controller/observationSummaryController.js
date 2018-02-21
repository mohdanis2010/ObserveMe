app.controller('observationSummaryController', ['$scope', '$log', 'DataSource', "$stateParams", function ($scope, $log, DataSource, $stateParams) {

    $('#fullScreenLoader').modal('hide');
    var obsrvColl = $scope.getObservationFactory().getObservationFormPayload();
    $scope.observationAnswers = $scope.getObservationFactory().getObservationAnswers();
    $scope.actionItems = $scope.getObservationFactory().getObservationActionItems();
    $scope.observationSummary = null;

    renderSummaryPageHTML();

    $scope.createAction = function () {

        if ($scope.actionTitle && $scope.actionDesc) {
            var action = {
                "actionItemID": null,
                "actionItemStatus": "DRAFT",
                "actionItemOwnerType": "OBSERVER",
                "actionIteVerifierType": "OBSERVEE",
                "actionItemTitle": $scope.actionTitle,
                "actionItemDescription": $scope.actionDesc,
                "actionItemDueDate": $('#datetimepicker').val(),
                "actionItemCOmpletionDate": ""
            };

            $scope.actionItems.push(action);

            $scope.actionTitle = null;
            $scope.actionDesc = null;
        }
        else
            alert("All fields are mandatory to create an action");

    };


    $scope.deleteAction = function (index) {
        $scope.actionItems.splice(index, 1);
    };

    $scope.clickDateTime = function() {
        $('#datetimepicker').datetimepicker({
            format: 'd-m-Y',
            timepicker: false,
            closeOnDateSelect: true
        });
    };


    $scope.saveObservation = function () {

        $scope.getObservationFactory().setObservationSummary($scope.observationSummary)
        var observationParams = $scope.getObservationFactory().saveObservation();

        $log.debug(observationParams);

        callbackSaveObservation = function (data) {
            $log.debug(data);
            alert("Observation record saved with id " + data.response.messageResponse.jsonResponse)
        };
        var url = appEnv[appEnv.env].baseWSURL;
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(observationParams)), "ADD_OBSERVATION");
        var params = {
            header: appEnv[appEnv.env].requestHeader,
            requestData: requestParams
        };
        DataSource.get(url, params, callbackSaveObservation, appEnv[appEnv.env].requestMethod);

    };


    function renderSummaryPageHTML() {

        var Html = "";
        var sectionHtml = "";

        _.each(obsrvColl, function (obsrv) {

            sectionHtml = "";

            if (obsrv.itemOrder == "3") { //TODO: This is temporary, will be removed when response is fixed
                obsrv.childItems.splice(0, 1);
                $log.debug("removed 1st node in product observation");
            }

            $log.debug("HTML for \n\n" + obsrv.formItem.name + ":::::::----:::::::");

            sectionHtml = sectionHtml + "<div id='obsrv" + obsrv.formItem.itemId + "'>";
            sectionHtml = sectionHtml + "<div class='section-hdr'>" + obsrv.formItem.name + "</div>";
            sectionHtml = sectionHtml + renderObsrvDetails(obsrv.childItems) + "</div>";

            $log.debug(sectionHtml);

            Html = Html + sectionHtml;

        });

        $("#ObservationCntr").html(Html);
        
        $scope.observationSummary = $scope.getObservationFactory().getObservationSummary();
    }

    function renderObsrvDetails(obsrvDetails) {

        var returnHtml = "";

        //For Free Observation
        if (obsrvDetails.length === 1) {
            returnHtml = "<pre class='section-data'>" + getAnswerData(obsrvDetails[0].formItem.itemId) + "</pre>"
        }
        else {

            _.each(obsrvDetails, function (rowData) {
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
                else //COLUMN 2 - Lengthy
                    returnHtml = returnHtml + "<p class='row-data'>" + getAnswerData(rowData.childItems[0].formItem.itemId) + "</p>";

                returnHtml = returnHtml + "</div>";

                $log.debug(returnHtml);
            });

        }

        return returnHtml;
    }


    function getEvalRadioBtnHtml(evalData) {
        var returnBtnHTML = "";

        var selectedEvalId = getAnswerData(evalData.formItem.itemId);

        var btnDetails = _.find(evalData.formItem.formItemValueType.formItemValues, function (btn) {
            return btn.itemValueId == selectedEvalId;
        });

        if (!_.isUndefined(btnDetails))
            returnBtnHTML = "<div class='oo-btn' style='background-color:" + btnDetails.color.colorValue + "'>" + btnDetails.name + "</div>";

        return returnBtnHTML;
    }


    function getAnswerData(itemId) {

        var answer = _.result(_.find($scope.observationAnswers, function (answer) {
            return answer.formItemID == itemId;
        }), "answer");

        if (!_.isUndefined(answer))
            return answer;
        else
            return "";
    }

}]);
