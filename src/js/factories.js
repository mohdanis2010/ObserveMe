//Factory for calling the web services
app.factory('DataSource', ['$http','$log','sessionFactory','requestParamsFactory',function($http,$log,sessionFactory,requestParamsFactory){
  return {
     get: function(url,params,callback,type){
         function callWebService(type,url,params){
             $log.debug('<--------Request Payload start-------->');
             $log.debug('Making '+type+ ' Request to ' + url + ' ' + params.requestData.config.method);
             $log.debug("With Params:");
             $log.debug(params.requestData);
             $log.debug("And Header:");
             $log.debug(params.header);
             $log.debug("and Session "+    sessionFactory.getSession());

             $http({
                 method : type,
                 url : url,
                 data: params.requestData,
                 headers :  params.header
             }).success(function(res){
                 $log.debug('Got success response from ' + url+ ' ' + params.requestData.config.method + ' >>');
                 $log.debug(res);
                 if(res.status.code===403){
                     alert('Session Expired');  //redirect to login.html and then index.html
                 }else{
                     callback(res);
                 }
             }).error(function(error){
                 $log.debug('Got Failure response from ' + url+ ' ' + params.requestData.config.method + ' >>');
                 $log.debug(error);
                 callback(error);
             });
         }

         if(sessionFactory.getSession()===null && sessionFactory.getSessionRequestSentStatus()===null){
             $log.debug("Making session request");
             sessionFactory.setSessionRequestSentStatus(true);
             var getSessionRequestParams = requestParamsFactory.getRequestParams(null,"GET_SESSION",null);
             $http({
                 method : type,
                 url : url,
                 data: getSessionRequestParams,
                 headers :  params.header
             }).success(function(res){
                 if(res.status.code===200){
                     $log.debug("Got Session : "+ res.sessionId);
                     sessionFactory.setSession(res.sessionId);
                     params.requestData.input.sessionToken= res.sessionId;
                     sessionFactory.setBrid(res.response.brid);
                     callWebService(type,url,params);
                 }else{
                     $log.debug("Failed to get the session. ");
                     alert('Unable to get session');
                 }
             }).error(function(error){
                 alert('Unable to get session');
             });


         }else{
             params.requestData.input.sessionToken= sessionFactory.getSession();
             callWebService(type,url,params);
         }
     }
  };
}]);


//For setting and getting the application session and user session related data
app.factory('sessionFactory',[function(){
    var sessionID=null;
    var userRole=null;
    var userBrid=null;
    var businessAreas=null;
    var bgSettings=null;
    var sentSessionRequest=null;

    return {
        setSessionRequestSentStatus:function(obj) {
            sentSessionRequest = obj;
        },
        getSessionRequestSentStatus:function() {
            return sentSessionRequest;
        },
        setSession:function(obj) {
            sessionID = obj;
        },
        getSession:function() {
            return sessionID;
        },
        setBrid:function(obj) {
            userBrid = obj;
        },
        getBrid:function() {
            return userBrid;
        },
        getUserRole:function() {
            return userRole;
        },
        setUserRole:function(role) {
            userRole=role;
        },
        getBGSettings:function() {
            return bgSettings;
        },
        setBGSettings:function(settings) {
            bgSettings=settings;
        },
        getBusinessAreas:function() {
            return businessAreas;
        },
        setBusinessAreas:function(res) {
            businessAreas = res;

            $.each(res.response.businessAreaList, function(key, val){
                businessAreas.response.businessAreaList[key].businessRoles = _.sortBy(val.businessRoles, "name");
            });
        }

    };
}]);


//For Creating a request with the web service params wrapper
app.factory('requestParamsFactory', ['sessionFactory',function(sessionFactory){
    return {
        getRequestParams:function(requestParams, method) {
            var params={
                "input": {
                    //"brid": (appEnv.env==="dev") ? "E20043838" : "",
                    "brid": (appEnv.env==="dev") ? "" : sessionFactory.getBrid(),
                    //"brid": (appEnv.env==="dev") ? "G44715845" : sessionFactory.getBrid(),
                    "request": requestParams,
                    "userAccount": "CLIENT.BARCLAYSCORP.COM",
                    "sessionToken": sessionFactory.getSession(),
                    "krb": null
                },
                "config": {
                    "appCode": "OME",
                    "client": "DESKTOP",
                    "dataSource": "CUSTOM",
                    "method": method,
                    "provider": "MYZONE"
                }
            };
            return params;
        }
    };
}]);


//For setting and getting the Observation Data
app.factory('observationFactory',[function(){
    var observeeData=null;
    var role=null;
    var brid=null;
    var observationStatus=null;  //DRAFT or SUBMITTED
    var observationAnswers=null;
    var observationFormPayload=null;
    var observationActionItems=[];
    var observationSummary = null;

    var observerData=null;
    var formData=null;
    var creationDate;
    var submissionDate;
    return {
        setObserveeData:function(obj){
            observeeData = obj;
        },
        getObserveeData:function(){
            return observeeData;
        },
        setObserverData:function(obj){
            observerData = obj;
        },
        getObserverData:function(){
            return observerData;
        },
        setRole:function(obj){
            role = obj;
        },
        getRole:function() {
            return role;
        },
        setSelectedBRID:function(obj){
            brid = obj;
        },
        getSelectedBRID:function() {
            return brid;
        },

        setFormData:function(obj){
            formData = obj;
        },
        getFormData:function(){
            return formData;
        },
        getObservationStatus:function(){
            return observationStatus;
        },
        setObservationStatus:function(obj){
            observationStatus = obj;
        },
        getObservationAnswers:function(){
            return observationAnswers;
        },
        setObservationAnswers:function(obj){
            observationAnswers = obj;
        },
        setCreationDate:function(obj) {
            creationDate = obj;
        },
        getCreationDate:function(){
            return creationDate;
        },
        setSubmissionDate:function(obj) {
            submissionDate = obj;
        },
        getSubmissionDate:function() {
            return submissionDate;
        },
        getObservationActionItems:function(){
            var longDate = new Date();

              _.each(observationActionItems, function(actionItem){

                  //change from dd/mm/yyyy to timestamp -"234234234"
                  if(actionItem.actionItemDispDueDate)
                      actionItem.actionItemDueDate = moment(actionItem.actionItemDispDueDate, "DD/MM/YYYY").valueOf();
                  else
                      actionItem.actionItemDueDate ="";

                  actionItem.actionItemCOmpletionDate = longDate.getTime();
              });

            return observationActionItems;
        },
        setObservationActionItems:function(obj){
            observationActionItems = obj;
        },
        getObservationFormPayload:function(){
            return observationFormPayload;
        },
        setObservationFormPayload:function(obj){
            observationFormPayload = obj;
        },
        getObservationSummary:function(){
            return observationSummary;
        },
        setObservationSummary:function(obj){
            observationSummary = obj;
        },
        saveObservation:function(){
            var saveObservationParams={
                    observationID:null,
                    name:"",
                    rollID:role,
                    observeeBrid:observeeData.brid,
                    observationSummary:observationSummary,
                    observationStatus:observationStatus,
                    observationAnswer:observationAnswers,
                    observationActionItems:this.getObservationActionItems(),
                    creationDate:creationDate,
                    submissionDate:submissionDate
            };
            
            return saveObservationParams;
        },
        clear:function(){
              observationAnswers=null;
              observationActionItems.length=0;
        }
    };
}]);



//For Utilities
app.factory('utilityFactory', [function(){
    return {
        getPhotoURL:function(url) {

            var thumbnails = url.split(",");
            if(thumbnails.length>1){
                return thumbnails[0];
            }else{
                return url;
            }
            return thumbnails;
        }
    };
}]);