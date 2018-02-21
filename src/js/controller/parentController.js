app.controller('parentController', ["$rootScope", "$scope", "$log", "DataSource", "sessionFactory", "requestParamsFactory", "observationFactory", "utilityFactory", function($rootScope, $scope, $log, DataSource, sessionFactory, requestParamsFactory, observationFactory, utilityFactory) {
        
        $scope.ownBRID = "";
        $scope.getRequestParamsFactory = function() {
            return requestParamsFactory;
        };
        $scope.getSessionFactory = function() {
            return sessionFactory;
        };
        $scope.getObservationFactory = function() {
            return observationFactory;
        };
        $scope.getUtilityFactory = function() {
            return utilityFactory;
        };

        $scope.baseURL = appEnv[appEnv.env].baseURL;
        
        
        $scope.selected = "Please select your role";

        $scope.handleDocumentClick = function() {



            $(document).on("click", ".sliderbtn", function() {
                $(".top-navMenu1").slideToggle();
                $(".navcloseBtn").click(function() {
                    $(".top-navMenu1").slideUp();
                });
            });
//
            $(document).on("click", ".colorProfileBtn", function() {
                $(".top-navMenu2").slideToggle();
                $(".navcloseBtn").click(function() {
                    $(".top-navMenu2").slideUp();
                });
            });
//
            $(document).on("click", ".userpositionBtn", function() {
                $(".top-navMenu3").slideToggle();
                $(".navcloseBtn").click(function() {
                    $(".top-navMenu3").slideUp();
                });
            });
//
//
            $(document).on("click", ".topnav-row", function() {
                $(".topSliderWrapper").slideUp();
            });
//
            $(document).on("click", ".container-wrapper", function() {
                $(".top-navMenu1").slideUp();
                $(".top-navMenu2").slideUp();
                $(".top-navMenu3").slideUp();
            });

            $(document).on("click", ".imgBurgerWhite, .imgSettingsWhite", function() {
                $(".topSliderWrapper").slideUp();

            });
//
            $(document).ready(function() {
                $(document).on("click", ".vertical-menu h3", function() {
                    //slide up all the link lists
                    $(".vertical-menu ul ul").slideUp();
                    $('.plus', this).html('<img src="img/ArrowWhite.png" width="20" height="20" />');
                    //slide down the link list below the h3 clicked - only if its closed
                    if (!$(this).next().is(":visible")) {
                        $(this).next().slideDown();
                        $('.plus', this).html('<img src="img/ArrowWhiteDown.png" width="20" height="20" />');
                    }
                });
            });





            $(document).on("click", "#bg_colour_settings li span", function(event) {

//                $log.debug($(this).parent().attr('ref'));
                if ($(this).parent().attr('ref') === '1') {
                    $("body").addClass("bg-image");


                } else {
                    $("body").removeClass("bg-image");

                }


                $scope.setUserPrefrences($(this).parent().attr('ref'), ""); //set pref
                $scope.$apply($(this));


            });


            $(document).on("click", ".bglist", function(event) {

                if ($(".bglist:first")) {
                    $('.bglist:first').css('border','1px solid red', 'padding','10px 6px');
                }

            });



//
            $(document).on("click", "#navigation_business_areas_list li span", function(event) {

                $log.debug($(this).parent().attr('ref'));

                $(this).children().each(function() {
                    $('i').not(this).removeClass('add-icon');
                    $(this).addClass('add-icon');
                    $log.debug($('i').attr('class'));
                });

                $scope.setUserPrefrences("", $(this).parent().attr('ref'));

            });


            $(document).on("click", ".businessAreaChildList li a", function(event) {

                event.stopPropagation();

            });

            $(document).on("click", "#tabHighlight", function(event) {

                $('div').not(this).removeClass('active');
                $('div').addClass('active');

            });
        };
        
        $scope.clicktoSelectBusiness = function(selectedRole) {

                if(selectedRole)
                {
                    $('[data-toggle="dropdown"]').parent().removeClass('open');
                    $scope.getSessionFactory().setUserRole(selectedRole);
                    $scope.selected = selectedRole.name;
                     event.stopPropagation();
                }
                else
                {
                    event.preventDefault();
                    event.stopPropagation();
                    $('[data-toggle="dropdown"]').parent().addClass('open');
                }
        };

               
        $scope.checkAndSetUserRole = function() {

            //if(true){

            if ($scope.getSessionFactory().getUserRole().businessRoleId === 0) {
                var businessAreas = [];
                var resp = $scope.getSessionFactory().getBusinessAreas();
                _.each(resp.response.businessAreaList, function(data) {
                    $log.debug(data);
                    businessAreas.push(data);
                    $scope.businessName = businessAreas;
                });
                
                $("#RoleSelectModal").modal("show");
            }
        };
        
        
        $scope.proceedAfterSavingRole = function() {
            
            if (!($scope.selected == "Please select your role")) {
                
                $("#RoleSelectModal").modal("hide");
                var roleId = $scope.getSessionFactory().getUserRole().businessRoleId;
                $scope.setUserPrefrences("", roleId);
            }
        };

        // GET_USERPREFERENCE
        $scope.getUserPrefrences = function() {
            callbackloadObserveeContents = function(res) {

                    if(!res.response.backGround || !res.response.backGround.backgroundID){
                        $scope.getSessionFactory().setBGSettings({
                                                                        backgroundID: "1",
                                                                        description: "Background Image"
                                                                })
                    }
                    else
                        $scope.getSessionFactory().setBGSettings(res.response.backGround);

                $scope.getSessionFactory().setUserRole(res.response.businessAreaRoleDto);

                $scope.ownBRID = res.response.brid;
                
                if ($scope.getSessionFactory().getBGSettings().backgroundID ==="1" ) {
                   $("body").addClass("bg-image");
                }
                else{
                   $("body").removeClass("bg-image");
                }
            };
            
            var url = appEnv[appEnv.env].baseWSURL;
            var requestParams = $scope.getRequestParamsFactory().getRequestParams(null, "GET_USERPREFERENCE");
            var params = {
                header: appEnv[appEnv.env].requestHeader,
                requestData: requestParams
            };
            DataSource.get(url, params, callbackloadObserveeContents, appEnv[appEnv.env].requestMethod);
        };


        // ADD_USERPREFERENCE
        $scope.setUserPrefrences = function(bgId, roleId) {
            
            callbackSetUserPrefrences = function(res) {
                    $scope.drawObserveeBusinessArea();
                    $scope.drawBackgroundOptions();
            };

            var url = appEnv[appEnv.env].baseWSURL;
            
            if (!bgId)
                bgId = $scope.getSessionFactory().getBGSettings().backgroundID;
            else
                $scope.getSessionFactory().getBGSettings().backgroundID = bgId;

            
            if (!roleId)
                roleId = $scope.getSessionFactory().getUserRole().businessRoleId;
             else
                $scope.getSessionFactory().getUserRole().businessRoleId = roleId;

            bgId = (!bgId)?2:bgId;
            var contentRequestParams = {background_id: String(bgId),business_role_id: String(roleId)};
            //var contentRequestParams = {background_id: "1",business_role_id: "2"};
            var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(contentRequestParams)), "ADD_USERPREFERENCE");
            var params = {
                header: appEnv[appEnv.env].requestHeader,
                requestData: requestParams
            };
            DataSource.get(url, params, callbackSetUserPrefrences, appEnv[appEnv.env].requestMethod);
        };

        
        // GET_BUSINESS_AREA
        $scope.getObserveeBusinessArea = function() {
            callbackloadObserveeContents = function(res) {
                $scope.getSessionFactory().setBusinessAreas(res);
                $scope.drawObserveeBusinessArea();
                $scope.drawBackgroundOptions();
                $scope.checkAndSetUserRole();
            };
            var url = appEnv[appEnv.env].baseWSURL;
            var requestParams = $scope.getRequestParamsFactory().getRequestParams(null, "GET_BUSINESS_AREA");
            var params = {
                header: appEnv[appEnv.env].requestHeader,
                requestData: requestParams
            };
            DataSource.get(url, params, callbackloadObserveeContents, appEnv[appEnv.env].requestMethod);
        };
        // Navigation HTML for Observee Business Area
        $scope.drawObserveeBusinessArea = function() {
            var data = $scope.getSessionFactory().getBusinessAreas();
            var selectedUserRoleId = $scope.getSessionFactory().getUserRole().businessRoleId;
            
            var businessAreaHTML = "";
            _.each(data.response.businessAreaList, function(area) {
                businessAreaHTML += "<div><h5>" + area.name + "</h5></div>";
                _.each(area.businessRoles, function(role) {
                    selectedClass = "";
                    
                    if (!_.isUndefined(selectedUserRoleId) && selectedUserRoleId == role.businessRoleId)
                        selectedClass = "add-icon";
                    
                    businessAreaHTML += "<li  ref='" + role.businessRoleId + "'><span><i class='" + selectedClass + "'>&nbsp;</i>" + role.name + "</span> </li>";
                
                });
            });
            $("#navigation_business_areas_list").html(businessAreaHTML);
        };
        // Navigation HTML for Background Options
        $scope.drawBackgroundOptions = function() 
        {
            //Though this calls getBusinessAreas(), we use the response.backGrounds
            var data = $scope.getSessionFactory().getBusinessAreas();
            var BGOptionsHTML = "";
            _.each(data.response.backGrounds, function(option) {
                var selectedClass = '';
                
                $log.debug("$scope.getSessionFactory().getBGSettings()");
                $log.debug($scope.getSessionFactory().getBGSettings());
                if (!_.isUndefined($scope.getSessionFactory().getBGSettings().backgroundID)) {
                    if ($scope.getSessionFactory().getBGSettings().backgroundID === option.backgroundID) {
                        selectedClass = "add-icon";
                    }
                }

                BGOptionsHTML += "<li  ref='" + option.backgroundID + "'><span><i class='" + selectedClass + "'>&nbsp;</i>" + option.description + "</span> </li>";

            });
            $("#bg_colour_settings").html(BGOptionsHTML);
        };

        //Call only if session has been initiated and user settings have been retrieved
        //$scope.$watch(function () { return $scope.getSessionFactory().getSession() }, function (newVal, oldVal) {
        $scope.$watch(function() {
            return $scope.getSessionFactory().getBGSettings()
        }, function(newVal, oldVal) {
            if (newVal !== null) {
                $scope.getObserveeBusinessArea();
            }
        });
        
        $scope.getUserPrefrences();

        $scope.handleDocumentClick();

        $scope.$watch(function () {
                return $scope.getSessionFactory().getBusinessAreas()
            }
            , function (newVal, oldVal) {
                //$scope.handleDocumentClick();
            }
        );


    $scope.homePage = function() {

        window.location.href = $scope.baseURL + "/";
    }


    $scope.recordPage = function() {

        window.location.href = $scope.baseURL + "observationRecord";

    }

    $scope.ListRecordPage = function() {

        window.location.href = $scope.baseURL + "observationList";

    }


    }]);



