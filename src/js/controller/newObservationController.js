app.controller('newObservationController', ["$scope", "$log", "DataSource", function($scope, $log, DataSource) {


    $('input, textarea').placeholder();

    //window.location.href="index.html#/selectObservee";
    var ProdSelectionDDElementId = 0;
    $scope.developer = "";


    $scope.loadDeveloperAndDevelopeeName = function(bridIDs) {
        callBackLoadDevloperAndDevelopeeName = function(data) {

            if(data.response && data.response.length==1)
            {
                $scope.developer = data.response[0].displayName;
            }
        };

        $("#obsrveeObsrverName").hide();
        $("#observeeNameID").show();
        $("#observeePhotoID").show();


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

    var DeveloperBrid = $scope.getSessionFactory().getBrid();
    //var DeveloperBrid = $scope.getRequestParamsFactory().getRequestParams().input.brid

    $scope.loadDeveloperAndDevelopeeName(DeveloperBrid);

    if($scope.getObservationFactory().getObserveeData())
    {
        $scope.developee = $scope.getObservationFactory().getObserveeData().displayName;
        $scope.photoURL = $scope.getObservationFactory().getObserveeData().photoURL;
        $scope.placeholder = "img/person.gif";
    }

    $("#summarySection").hide();

    $scope.currentTabContentID = '';
    var obsrvColl;
    var tabs;
    var validations;

    $scope.loadObservationForm = function() {
        callbackLoadObservationForm = function(data) {
            $('#fullScreenLoader').modal('hide');
            $log.debug(data);

            //Need to clear previous data
            $scope.getObservationFactory().clear();

            tabs = data.response.observationItem;
            validations = data.response.observationValidations;
            tabs = _.sortBy(tabs, 'itemOrder');
            $scope.getObservationFactory().setObservationFormPayload(tabs); // Save Payload in the Factory
            $log.debug("Tabs");
            $log.debug(tabs);
            generateTabs(tabs);
            updateLOVUI();
        };
        var url = appEnv[appEnv.env].baseWSURL;
        //if(appEnv[appEnv.env]==="stub") url = appEnv[appEnv.env].baseWSURL + "stubs/FORM_TEMPLATE.json";
        var roleID = $scope.getObservationFactory().getRole();
        contentRequestParams = {roleId: roleID};
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(contentRequestParams)), "FORM_TEMPLATE");
        var params = {
            header: appEnv[appEnv.env].requestHeader,
            requestData: requestParams
        };
        DataSource.get(url, params, callbackLoadObservationForm, appEnv[appEnv.env].requestMethod);
    };



    // Check if the given ItemId is a SubmenuItem
    $scope.isSubmenuitem = function(itemID){

        var observationChildren = [];
        var isSubmenu = false;
        var observations = $scope.getObservationFactory().getObservationFormPayload();

        // Get all the childItems into a single array
        _.each(observations, function(observationItems){
            observationChild = observationItems.childItems;

            _.each(observationChild, function(childItems) {
                observationChildren.push(childItems);
            });
        });

        // Check the child Item is sub menu item
        _.each(observationChildren, function(childrens){
            if(childrens.formItem.itemId == itemID && childrens.formItem.formItemType.name == 'SUB_MENU_ITEM'){
                isSubmenu = true;
            }
        });

        // Return isSubmenu is true or false
        return isSubmenu;
    };




    // Get all the sub menu child elementsby passing a submenuItemId
    $scope.getSubmenuitems = function(itemID){

        var observationChildren = [];
        var observationSubmenuitems = [];
        var observations = $scope.getObservationFactory().getObservationFormPayload();

        // Get all the childItems into a single array
        _.each(observations, function(observationItems){
            observationChild = observationItems.childItems;

            _.each(observationChild, function(childItems) {
                observationChildren.push(childItems);
            });
        });

        // Check the child Item is sub menu item
        _.each(observationChildren, function(childrens){
            if(childrens.formItem.itemId == itemID && childrens.formItem.formItemType.name == 'SUB_MENU_ITEM'){

                // Check if the sub sub item is a LOV_YES_NO and get the item ID
                _.each(childrens.childItems, function(subChilditems){
                    if(subChilditems.formItem.formItemType.name == 'LOV_YES_NO' ||
                        subChilditems.formItem.formItemType.name == 'LOV_PRODUCT_LIST'){
                        observationSubmenuitems = subChilditems.formItem.itemId;

                        if(subChilditems.formItem.formItemType.name == 'LOV_PRODUCT_LIST')
                            ProdSelectionDDElementId = subChilditems.formItem.itemId;
                    }
                });
            }
        });

        // returns the itemId of LOV_YES_NO of a submenuItemId passed.  ( we are not getting the textarea id, since checkeing the
        // LOV_YES_NO is enough )
        return observationSubmenuitems;
    };


    $scope.checkChildIdinAnswers = function(childId, observationAnswers){

        var result = $.grep(observationAnswers, function(e){ return e.formItemID == childId; });
        if (result.length >= 1) {
            return true;
        } else{
            return false;
        }
    };


    // Get all sub menu items from the validation list
    $scope.getAllsubmenufields = function(){

        var submenuItems = [];
        var result = [];

        _.each(validations, function(validationmanItem) {

            if(validationmanItem.itemID && !validationmanItem.itemValueID && validationmanItem.itemID != ""){
                submenuItems.push(validationmanItem.itemID);
            }
        });

        $.each(submenuItems, function(i, e) {
            if ($.inArray(e, result) == -1) result.push(e);
        });

        return result;
    };


    // Load mandatory IDs of the submenu Items passed
    $scope.loadMantoryItems = function(itemId){

        var manItemlist = [];
        _.each(validations, function(validationmanItem) {

            if(validationmanItem.itemID && !validationmanItem.itemValueID && validationmanItem.itemID != ""){
                if(itemId == validationmanItem.itemID){

                    manItemlist.push(validationmanItem.mandatoryItemID);
                }
            }
        });

        return manItemlist;
    };


    // Fetch all the mandatory IDs of the submenu Items
    $scope.getAllmandatoryIds = function(){

        var submenuItems = $scope.getAllsubmenufields();
        var manItems = [];

        for(i=0; i<submenuItems.length; i++){
            manItems[submenuItems[i]] = $scope.loadMantoryItems(submenuItems[i]);
        }

        return manItems;
    };




    $scope.saveDraftObservation = function() {
        var observationAnswers = [];

        //var radioFields=$("#" + $scope.currentTabContentID + " input:radio:checked");

        $log.debug("radio button id");
        var radioFields = $("input:radio:checked");
        $log.debug("radioFields");
        //$log.debug(radioFields);
        _.each(radioFields, function(field) {
            var radioVal = $("#" + field.id).val();
            var radioFormItemID = $("#" + field.id).attr('rel');
            // $log.debug(field);
            // $log.debug(radioVal);
            $log.debug(radioFormItemID);
            var data = {
                formItemID: radioFormItemID,
                answer: radioVal
            };
            observationAnswers.push(data);
        });

        $log.debug("text area id");
        //var fields=$("#" + $scope.currentTabContentID + " textarea");  // For getting the list of the fields in the tab
        var fields = $("textarea");
        _.each(fields, function(field) {
            var textareaID = $("#" + field.id).attr('rel');
            var textareaValue = $("#" + field.id).val();
            // $log.debug(field);
            // $log.debug(textareaID);
            // $log.debug(textareaValue);
            var data = {
                formItemID: textareaID,
                answer: textareaValue
            };

            if (textareaValue !== "" && $.trim(textareaValue) !== "Start writing here")
                observationAnswers.push(data);
        });



        var selectFields = $("select");
        _.each(selectFields, function(field) {
            var selectID = $("#" + field.id).attr('rel');
            var selectValue = $("#" + field.id).val();
            $log.debug("Select Id");
            // $log.debug(field);
            $log.debug(selectID);
            //$log.debug(selectValue);
            var data = {
                formItemID: selectID,
                answer: selectValue
            };
            if (selectValue !== "")
                observationAnswers.push(data);
        });

        /*

         ItemType	    item_id	item_value_id	mandatory_item_id	Description
         SUB_MENU_ITEM	Value	Null		Value			If the item type is Sub menu Item both the Sub menu Item child should have some Value
         ANY		        value	Null		value			The Mandatory item should not be empty
         ANY		        value	value		value	 		If the item_value_id of the item_id selected the manadatory_item_id should not be emptry
         Form_free_text	Null	Null		value			mandatory Item_id field should not be

         */


        var isFormFreeTxtValid = 1; // Form free text validation. ( free obsrvation)
        var isNoHasComments = true; // If "No" is selected then textarea should be filled.
        var submenuMandatoryItems = [];
        var dataPresentInLovYesNo = false;

        _.each(validations, function(validationItem) {

            // Validation condition #01, If the mandatory Id itself the item Id
            if(!validationItem.itemID && !validationItem.itemValueID){
                isFormFreeTxtValid = 0;
                _.each(observationAnswers, function(observationAnswerItem) {
                    if(observationAnswerItem.formItemID == validationItem.mandatoryItemID){
                        isFormFreeTxtValid = 1;
                    }
                });
            }

            // Validation condition #02, If both the itemId and itemValueId are present
            else if(validationItem.itemID && validationItem.itemValueID){

                _.each(observationAnswers, function(observationAnswerItem) {

                    // Check if the itemId and answers in the obervationAnswer matches the validation data
                    $log.debug("Answer Id : " + observationAnswerItem.formItemID);
                    if(observationAnswerItem.formItemID==validationItem.itemID && observationAnswerItem.answer==validationItem.itemValueID){

                        if(!dataPresentInLovYesNo)
                            dataPresentInLovYesNo = true;

                        //alert(JSON.stringify(observationAnswers));

                        var result = $.grep(observationAnswers, function(e){ return e.formItemID == validationItem.mandatoryItemID; });

                        //alert("Array Length"+ result.length);
                        if (result.length >= 1) {

                        } else{
                            isNoHasComments = false;
                            //alert("isNoHasComments  is set to false");
                        }
                    }
                });
            }
        });



        // Validation condition #03, If the itemId is present and is a submenu
        submenuMandatoryItems = $scope.getAllmandatoryIds();

        var subMenuChildItems = [];
        var subMenuChildIDs = [];

        _.each(submenuMandatoryItems, function(proItems) {
            _.each(proItems, function(propSubItems) {

                subMenuChildItems.push($scope.getSubmenuitems(propSubItems));
            });
        });

        $.each(subMenuChildItems, function(i, e) {
            if ($.inArray(e, subMenuChildIDs) == -1) subMenuChildIDs.push(e);
        });

        var noOfItemsNotFoundInAnswers=0;
        _.each(subMenuChildIDs, function(childId) {

            var noOfItemsNotFound=1;
            if($scope.checkChildIdinAnswers(childId, observationAnswers) == false){
                noOfItemsNotFoundInAnswers+=1;
            }
        });


        var noDataInProdObsv=false;
        //If none of the fields in Product observation is filled, then this makes it a valid condition
        if(noOfItemsNotFoundInAnswers==subMenuChildIDs.length){
            noDataInProdObsv=true;
        }

        var dataValidated=true;
        var errorMsg="";


        if(isFormFreeTxtValid == 0){
            dataValidated =false;
            errorMsg += "\n Free observation text is mandatory";
        }

        if(!noDataInProdObsv && $scope.checkChildIdinAnswers(ProdSelectionDDElementId, observationAnswers) == false){
            errorMsg += "\n Product Tab - Please select a product";
        }

        if(!noDataInProdObsv && !isNoHasComments){
            dataValidated =false;
            errorMsg += "\n Product Tab - If for any question answer is 'No' then comment is required";
        }

        if(!noDataInProdObsv && (!noOfItemsNotFoundInAnswers==0) && (noOfItemsNotFoundInAnswers < subMenuChildIDs.length)){

            dataValidated =false;
            errorMsg += "\n Product Tab - All fields are mandatory if any one field is filled";
        }



        //alert("noDataInProdObsv:"+ noDataInProdObsv +",isNoHasComments:"+isNoHasComments);


        $log.debug("Form Validation : " + dataValidated);

        $log.debug("Saving Fields with Data");
        $log.debug(observationAnswers);
        $scope.getObservationFactory().setObservationAnswers(observationAnswers);
        $scope.getObservationFactory().setObservationStatus('DRAFT');

        if(dataValidated)
            toggleSection();
        else
            alert("Form validation failed \n" + errorMsg);

    };

    $scope.loadObservationForm();

    function generateTabs(formItemID, observationAnswers) {
        _.each(observationAnswers, function(observationAnswerItem) {
            if (observationAnswerItem.formItemID === formItemID && observationAnswerItem.answer !== "") {
                return true;
            }
        });
        return false;
    }

    function generateTabs(tabs) {
        var tabsHtml = '';
        var tabContentsHtml = '';
        var tabContentsHtmlData = '';
        var tabCounter = 0;
        _.each(tabs, function(tab) {
            var tabOpacityClass = ' opacity';
            var tabContentStyle = 'display: none;';
            if (tabCounter === 0) {
                tabContentStyle = '';
                var tabOpacityClass = '';
            }
            tabsHtml = tabsHtml + '<button id="tab-' + tab.formItem.itemId + '" class="btn tabButton ' + tabOpacityClass + '" ng-click="toggleTab(' + tabCounter + ')" values="' + tab.formItem.name + '" aria-label="' + tab.formItem.name + '">' + tab.formItem.name + '</button>';
            tabContentsHtmlData = getTabHTML(tab, tabCounter);

            tabContentsHtml = tabContentsHtml + '<div class="tab-content" id="tab-' + tab.formItem.itemId + '-content" style="' + tabContentStyle + '">' + tabContentsHtmlData + '</div>';
            tabCounter++;
        });
        $("#observation-tabs").html(tabsHtml);
        $("#observation-body").html(tabContentsHtml);
        initiateAccordion();
    }

    function getTabHTML(tabData, tabIndex) {
        $log.debug("tabData.childItems for " + tabData.formItem.name);
        $log.debug(tabData.childItems);
        var returnHtml = '';
        var hintFormsContent = '';
        var previousTabContentType = '';
        var accordionCount=0;

        _.each(tabData.childItems, function(item) {
            if (!_.isUndefined(item.formItem.formItemType.name)) {

                if (item.formItem.formItemType.name === "FORM_FREE_TEXT") {
                    returnHtml += generateTextarea(item);
                } else if (item.formItem.formItemType.name === "SUB_MENU_ITEM") {
                    if (previousTabContentType !== "SUB_MENU_ITEM") {
                        //Tab Content Prefix HTML
                        returnHtml += '<div class="structure-container"><div class="table-layout"><div class="table-cell fixed-width-400"> <div class="collapsible-panel">';
                    }
                    var hintBullets = '';
                    if (!_.isUndefined(item.hint)) {
                        hintBullets = item.hint.description;
                        hintBullets = JSON.parse(hintBullets);
                        var hintDataSectionHTML = '';
                        var hintDataSectionDetailHTML = '';
                        _.each(hintBullets.hints, function(item) {
                            hintDataSectionDetailHTML = "";
                            _.each(item.items, function(listItem) {
                                hintDataSectionDetailHTML += '<li>' + listItem.item + '</li>';
                            });

                            hintDataSectionDetailHTML = '<div class="accordion-content-body"><ul class="accordion-list">' + hintDataSectionDetailHTML + ' </ul> </div>';
                            hintDataSectionHTML+= '<section class="Wrapper-datalist" aria-labelledby="' + item.header + '">';

                            if(item.header){

                                //If product observation, then all accordion subsection header will have color same as
                                //background color.
                                if(tabIndex==2)
                                    hintDataSectionHTML+= '<div class="accordion-Subcontent-header" style="background-color:#3A6B84;color:#FFFFFF;font-weight:bold">' + item.header + '</div>';
                                else
                                    hintDataSectionHTML+= '<div class="accordion-Subcontent-header" style="background-color:'+ item.color +'">' + item.header + '</div>';

                            }
                            hintDataSectionHTML+=hintDataSectionDetailHTML + '</section>';
                        });

                        hintBullets = hintDataSectionHTML;
                    }
                    //Tab Content
                    returnHtml += '<h3 rel="' + item.formItem.itemId + '" class="accord-header"';

                    arrow = "ArrowWhite.png";

                    if(tabIndex===2){ //only for Product observation the style is hardcoded
                        accordionCount+=1;

                        if(accordionCount==1){
                            returnHtml+= " style='background-color:white !important;color:grey !important;'>";
                            arrow = "ArrowBlue.png";
                        }
                        else
                            returnHtml+= " style='background-color:#3A6B84;color:#FFFFFF;'>";
                    }
                    else{
                        returnHtml+= ' style="background-color:' + item.formItem.color.colorValue + ';">';
                    }

                    returnHtml+= item.formItem.name + ' <span class="Custaccordion-header-icon" aria-selected="true" aria-expanded="true" role="tab" tabindex="0"><img src="img/'+ arrow +'" height="20" width="20"></span></h3><div> <div class="text_center full left padding"> ' + hintBullets + '</div></div>';

                    //Generate Form fields against each Hint
                    var hintFormHTML = getHintForm(item);
                    //Hint Forms content
                    //hintFormsContent += '<div class="tab-hint-content" id="tab-hint-content-' + item.formItem.itemId + '" style="display:none">' + item.formItem.name + hintFormHTML + '</div>';
                    hintFormsContent += '<div class="tab-hint-content" id="tab-hint-content-' + item.formItem.itemId + '" style="display:none">'+'<br>'+ hintFormHTML + '</div>';
                }
                previousTabContentType = item.formItem.formItemType.name;
            }
        });
        if (previousTabContentType === "SUB_MENU_ITEM") {
            //Tab Content Postfix HTML
            returnHtml += '</div></div> <div class="table-cell fixed-width-550"> <div style=" width:100%; margin: 10px auto;" class="observation-inputs" aria-labelledby=""><form role="form"><div class="form-group">' + hintFormsContent + '</div></form></div></div></div></div> ';
        }
        return returnHtml;
    }

    function getHintForm(item) {
        var hintFormHTML = "";
        _.each(item.childItems, function(hintFormItem) {
            if (hintFormItem.formItem.formItemType.name === "FORM_FREE_TEXT") {
                if (!_.isUndefined(hintFormItem.formItem.name)) {
                    hintFormHTML += generateTextarea(hintFormItem);
                }
            } else if (hintFormItem.formItem.formItemType.name === "LOV_RADIO" || hintFormItem.formItem.formItemType.name === "LOV_YES_NO") {
                hintFormHTML += generateLOVRadio(hintFormItem);
            } else if (hintFormItem.formItem.formItemType.name === "LOV_PRODUCT_LIST") {
                hintFormHTML += generateProductList(hintFormItem);
            }
        });
        return hintFormHTML;
    }

//        var idIndex = 0;


    //Generate LOV and Textarea HTML
    function generateLOVRadio(hintFormItem) {
        var returnHTML = '';
        returnHTML = '<p>' + hintFormItem.formItem.name + '</p><div class="btn-group custom-btn-group"><div data-toggle="buttons">  <div class="btn-group lov-buttons-parent">';
        var mainItemID = hintFormItem.formItem.itemId;
        var sortedFormItemValues = _.sortBy(hintFormItem.formItem.formItemValueType.formItemValues, 'valueOrder');

        _.each(sortedFormItemValues, function(hintFormItem) {
            returnHTML += ' <label class="btn btn-primary lov-buttons" style="background-color:' + hintFormItem.color.colorValue + '" aria-describedby="' + hintFormItem.name + '"> <input style="width:0px;height:0px" type="radio" id="item_' + mainItemID + '_LOV_' + hintFormItem.itemValueId + '" aria-describedby="' + hintFormItem.name + '" rel="' + mainItemID + '" name="lov_' + mainItemID + '" value="' + hintFormItem.itemValueId + '" >' + hintFormItem.name + '</label>';
            //returnHTML += '<input class="btn btn-primary lov-buttons" type="radio" id="item_' + mainItemID + '_LOV_' + hintFormItem.itemValueId + '" aria-describedby="' + hintFormItem.name + '" rel="' + mainItemID + '" name="lov_' + mainItemID + '" value="' + hintFormItem.itemValueId + '" >' + hintFormItem.name;
        });
        returnHTML += '</div></div></div>';
        return returnHTML;
    }

    //var state=false;
    $('#newObsrvSection').off().on("click", ".btn.btn-primary.lov-buttons", function() {

        var checked = (navigator.userAgent.match(/MSIE\s(?!9.0)/))?!$(this).children().prop('checked'):$(this).children().prop('checked');
        //event.preventDefault();
        //event.stopPropagation();
        //alert("state before:" + state);
        //if(state){
        //    state = false;
        //    return;
        //}
        //alert("state After:" + state);
        //alert("prop:" + $(this).children().prop('checked'));
        if(!navigator.userAgent.match(/MSIE\s(?!9.0)/))$(this).children().prop('checked', !checked);
        if(checked) {
            //state = false;
            $(this).removeClass("blue-border");
            $(this).removeClass("active");

        } else {
            //state = true;
            //$(this).children().prop('checked', true);
            $(this).addClass("blue-border");
            $(this).siblings().removeClass("blue-border");

        }

        return false;
    });


    function generateTextarea(hintFormItem) {
        var returnHTML = '';
        returnHTML = '<textarea style="width:100%; height:100%; border: 0px; color: black; padding:10px;" rows="10" id="textarea-' + hintFormItem.formItem.itemId + '"  rel="' + hintFormItem.formItem.itemId + '"  placeholder="' + hintFormItem.formItem.name + '"></textarea>';
        return returnHTML;
    }
    function generateProductList(hintFormItem) {
        $log.debug("Generating Product List");
        $log.debug(hintFormItem);
        var returnHTML = '';
        returnHTML = '<div><select style="width:90%" id="select-' + hintFormItem.formItem.itemId + '"  rel="' + hintFormItem.formItem.itemId + '">';
        returnHTML += '<option value="">Select the product being provided</option>';

        var sortedProdList = _.sortBy(hintFormItem.formItem.formItemValueType.formItemValues, "name");

        _.each(sortedProdList, function(hintFormItem) {
            $log.debug("Generating Product List Item");
            $log.debug(hintFormItem);
            returnHTML += '<option value="' + hintFormItem.itemValueId + '">' + hintFormItem.name + '</option>';
        });
        returnHTML += '</select></div>';
        $log.debug("Generating Product List returned");
        $log.debug(returnHTML);
        return returnHTML;
    }

    //Handle Tab events
    $(document).on("click", ".tabButton", function() {
        $scope.currentTabContentID = this.id + "-content";
        $(".tab-content").each(function(index, value) {
            $(this).hide();
            if ($scope.currentTabContentID === this.id) {
                $(this).show();
            }
        });
        $(this).removeClass('opacity');
        $(this).siblings().addClass('opacity');

        if($(this).attr("values") =="Product"){

            if($("#"+$scope.currentTabContentID+" .tab-hint-content:visible").length==0)
                $("#"+$scope.currentTabContentID+" .tab-hint-content:first").show();
        }
    });

    //Accordion Related functions
    function initiateAccordion() {
        $(".collapsible-panel, .contributors").accordion({
            activate: function(event, ui) {
            }
        });
        $(document).ready(function($) {
            $(".collapsible-panel, .contributors").on("accordionactivate", function(event, ui) {
                event.preventDefault();
                $('html,body').animate({scrollTop: $(".ui-accordion-content").offset().top}, 500);
            });
        });
        $(function() {
            $(".collapsible-panel").accordion({
                collapsible: true,
                heightStyle: "content",
                active: false,
                speed: 50
            });
        });
        $(document).on("click", ".accord-header", function() {
            var headerColor = $(this).css("background-color");
            $("#"+$(this).attr("aria-controls")).css("background-color",headerColor);
            $(".tab-hint-content").hide();
            $("#tab-hint-content-" + $(this).attr('rel')).show();

            $log.debug("Clicked Tab with ID");
            $log.debug($(this).attr('rel'));
        });
    }




    /*===================================================Summary=================================================================================*/
    $('#editSummary').on('click', function() {
        toggleSection();
    });


    function toggleSection() {

        if ($("#newObsrvSection").is(':visible')) {
            $("#newObsrvSection").hide();

            revealSummarySection();
            $(".pg-hdr h1").html("Develop summary");
            $("body").scrollTop(0);
            $("#summarySection").show();
            $("#obsrveeObsrverName").show("fast", function(){
                $(this).css("width","100%");
            });
            $("#observeeNameID").hide();
            $("#observeePhotoID").hide();


        }
        else {
            $("#summarySection").hide();
            $("body").scrollTop(0);
            $("#newObsrvSection").show();
            $("#obsrveeObsrverName").hide();

            $("#observeeNameID").show();
            $("#observeePhotoID").show();

            $(".pg-hdr h1").html("Make an observation");
        }
    }


    function revealSummarySection()
    {
        obsrvColl = $scope.getObservationFactory().getObservationFormPayload();
        $scope.observationAnswers = $scope.getObservationFactory().getObservationAnswers();
        $scope.actionItems = $scope.getObservationFactory().getObservationActionItems();
        $scope.observationSummary = null;

        renderSummaryPageHTML();
    }


    $scope.createAction = function() {

        if ($scope.actionTitle && $scope.actionDesc) {
            var action = {
                "actionItemID": null,
                "actionItemStatus": "PENDING",
                "actionItemOwnerType": "OBSERVER",
                "actionIteVerifierType": "OBSERVEE",
                "actionItemTitle": $scope.actionTitle,
                "actionItemDescription": $scope.actionDesc,
                "actionItemDueDate": "", //Filled while saving by converting to long datatype
                "actionItemDispDueDate": $('#tbxDatetimepicker').val(),
                "actionItemCOmpletionDate": ""
            };

            $scope.actionItems.push(action);

            $scope.actionTitle = null;
            $scope.actionDesc = null;
            $('#tbxDatetimepicker').val("");
        }
        else
            alert("All fields are mandatory to create an action");

    };


    $scope.deleteAction = function(index) {
        $scope.actionItems.splice(index, 1);
    };

    $("#datetimepicker").datetimepicker({
        format: 'd-m-Y',
        timepicker: false,
        closeOnDateSelect: true,
        minDate:'0',
        onSelectDate: function(ct, $i) {
            $("#tbxDatetimepicker").val(ct.dateFormat('d/m/Y'));
        }
    });

    $scope.saveObservation = function() {
        $('#fullScreenLoader').modal('show');
        $("#submitModal").modal("hide");
        $scope.getObservationFactory().setObservationSummary($scope.observationSummary);
        $scope.getObservationFactory().setObservationStatus("SUBMITTED");
        var observationParams = $scope.getObservationFactory().saveObservation();

        $log.debug("Payload to ADD_OBSERVATION");
        $log.debug(observationParams);

        var url = appEnv[appEnv.env].baseWSURL;
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(observationParams)), "ADD_OBSERVATION");
        callbackSaveObservation = function(data) {
            $('#fullScreenLoader').modal('hide');
            $log.debug("Got response from ADD_OBSERVATION");
            $log.debug(data);
            $log.debug("Observation record saved with id " + data.response.messageResponse.jsonResponse);
            window.location.href = appEnv[appEnv.env].baseURL + "observationRecord";
        };
        var params = {
            header: appEnv[appEnv.env].requestHeader,
            requestData: requestParams
        };
        DataSource.get(url, params, callbackSaveObservation, appEnv[appEnv.env].requestMethod);

    };


    function renderSummaryPageHTML() {

        var Html = "";
        var sectionHtml = "";

        _.each(obsrvColl, function(obsrv) {

            sectionHtml = "";

            /*if (obsrv.itemOrder == "3") { //TODO: This is temporary, will be removed when response is fixed
             obsrv.childItems.splice(0, 1);
             $log.debug("removed 1st node in product observation");
             }*/

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

        $scope.observationSummary = $scope.getObservationFactory().getObservationSummary();

    }

    function renderObsrvDetails(obsrvDetails) {

        var returnHtml = "";

        //For Free Observation
        if (obsrvDetails.length === 1) {

            if(getAnswerData(obsrvDetails[0].formItem.itemId) != "")
                returnHtml = "<p class='section-data'>" + getAnswerData(obsrvDetails[0].formItem.itemId) + "</p>"
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

        var answer = _.result(_.find($scope.observationAnswers, function(answer) {
            return answer.formItemID == itemId;
        }), "answer");

        if (!_.isUndefined(answer))
            return answer;
        else
            return "";
    }

    function updateLOVUI(){

//
//
        if (navigator.userAgent.match(/MSIE\s(?!9.0)/)) {
            $('.lov-buttons-parent').each(function() {

                $(this).find("label:eq( 0 )").css({'position': 'relative', 'float': 'left','left': '0px','top': '2px'});
                $(this).find("label:eq( 1 )").css({'position':'relative','left':'90px','top': '-29px'});
                $(this).find("label:eq( 2 )").css({'position':'relative','left':'180px','top': '-61px'});
                $(this).find("label:eq( 3 )").css({'position':'relative','left':'270px','top': '-91px'});
                $(this).find("label:eq( 4 )").css({'position':'relative','left':'360px','top': '-122px'});

                $(this).find("label").each(function(){

                }).click(function(){

                    //$('label').not(this).removeClass('button-border');
                    $(this).toggleClass('button-border');
                    $(this).siblings().removeClass("button-border");

                    $log.debug('selected chkbox');

                    if($(this).hasClass('button-border')){
                        $(this).find('input[type="radio"]').prop("checked",true);
                        //alert('Checked');
                    }

                    else{
                        $(this).find('input[type="radio"]').prop("checked",false);
                        //alert('UNChecked');
                    }

                });

            });
        }


    }

    $scope.launchConfirmDialog = function(){
        $("#submitModal").modal("show");
    };

    $scope.cancel = function(){
        $("#submitModal").modal("hide");
    };

}]);
