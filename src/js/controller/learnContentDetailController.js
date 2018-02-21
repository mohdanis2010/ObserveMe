app.controller('learnContentDetailController', ["$scope","$log","DataSource","$stateParams", function($scope,$log,DataSource,$stateParams){


    $scope.contentID = $stateParams.id;
    var contentRequestParams;
    $scope.dislikeSelected="";
    $scope.likeSelected="";

    // Load the content Detail
    $scope.loadContentDetail = function(){
        callbackLoadContentDetail = function(data) {
            $('#fullScreenLoader').modal('hide');
            $log.debug(data);
            $scope.learnData=data.response;
            if(!_.isUndefined($scope.learnData.thumbail_url)){
                $scope.learnData.thumbail_url=$scope.getUtilityFactory().getPhotoURL($scope.learnData.thumbail_url);
            }
            if(!_.isUndefined($scope.learnData.uploadedByProfile.profile_image_url)){
                $scope.learnData.uploadedByProfile.profile_image_url=$scope.getUtilityFactory().getPhotoURL($scope.learnData.uploadedByProfile.profile_image_url);
            }
            if($scope.learnData.category==='mp4'){
                $scope.loadVideo('video/mp4');
                 $(".description").hide();
            }else if($scope.learnData.category==='mp3'){
                $scope.loadVideo('audio/mp3');
                 $(".description").hide();
            }else{
                $("#player_a1").hide();
                $("#homeVideo").hide();
            }

            if($scope.learnData.contentRatings)
            {
                if($scope.learnData.contentRatings.contentRating==="-1.0"){
                    $scope.dislikeSelected="selected";
                    $scope.likeSelected="";
                }else if($scope.learnData.contentRatings.contentRating==="1.0"){
                    $scope.dislikeSelected="";
                    $scope.likeSelected="selected";
                }
            }
        };
        var url = appEnv[appEnv.env].baseWSURL;
        if(appEnv[appEnv.env]==="stub") url = appEnv[appEnv.env].baseWSURL + "stubs/GET_LEARNING_CONTENT_LIST_DETAILS.json";
        contentRequestParams={content_id:$scope.contentID};
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(contentRequestParams)),"GET_LEARNING_CONTENT_LIST_DETAILS");
        var params={
            header: appEnv[appEnv.env].requestHeader,
            requestData:requestParams
        };
        DataSource.get(url,params,callbackLoadContentDetail,appEnv[appEnv.env].requestMethod);
    };


    //Update Content History
     $scope.updateContentHistory = function(){
           callUpdateContentHistory = function(data) {
            //$('#fullScreenLoader').modal('hide');
            //$log.debug(data);
            $log.debug("updated content history:" + $scope.contentID);
        };


        var url = appEnv[appEnv.env].baseWSURL;
        contentRequestParams={contentID:$scope.contentID};
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(contentRequestParams)),"ADD_CONTENT_HISTORY");
        var params={
            header: appEnv[appEnv.env].requestHeader,
            requestData:requestParams
        };
        DataSource.get(url,params,callUpdateContentHistory,appEnv[appEnv.env].requestMethod);
    };


    //document_extract
    $scope.loadVideo = function(ext){
        $(document).ready(function() {

            var vidURL=$scope.learnData.content_url;
            var vidPhoto=$scope.learnData.thumbail_url;
            var vidURLe=encodeURIComponent(vidURL);
            var vidPhotoe=encodeURIComponent(vidPhoto);
            var videoHtml='<video controls="controls" poster="'+vidPhoto+'" width="550" height="360"><source src="'+vidURL+'" type="video/mp4" /> <object type="application/x-shockwave-flash" data="http://releases.flowplayer.org/swf/flowplayer-3.2.1.swf" width="640" height="360"><param name="movie" value="http://releases.flowplayer.org/swf/flowplayer-3.2.1.swf" /><param name="allowFullScreen" value="true" /><param name="wmode" value="transparent" /> <param name="flashVars" value="config={\'playlist\':[\''+vidPhotoe+'\',{\'url\':\''+vidURLe+'\',\'autoPlay\':false}]}" /><img alt="Big Buck Bunny" src="'+vidPhoto+'" width="550" height="360" title="No video playback capabilities, please download the video below" /></object></video>';
            $('#homeVideo').html(videoHtml);
//            $('#homeVideoModal').modal({show:true});
//            $('#homeVideoModal').on('hidden.bs.modal', function () {
//                $('#homeVideoModalBody').html('');
//            });

//            projekktor('#player_a1', {
//                    poster: $scope.learnData.thumbail_url,
//                    title: $scope.learnData.title,
////                    playerFlashMP4: '/swf/StrobeMediaPlayback/StrobeMediaPlayback.swf',
////                    playerFlashMP3: '/swf/StrobeMediaPlayback/StrobeMediaPlayback.swf',
//                    playerFlashMP4: '/swf/StrobeMediaPlayback/jarisplayer.swf',
//                    playerFlashMP3: '/swf/StrobeMediaPlayback/jarisplayer.swf',
//                    width: 640,
//                    height: 385,
//                    playlist: [
//                        {
//                            0: {src: $scope.learnData.content_url , type: ext}
//                        }
//                    ]
//                }, function(player) {            // on ready
//                    player.addListener('state', stateListener);
//                }
//            );
//
//
//            var stateListener = function(state) {
//                switch(state) {
//                    case 'PLAYING':
//                        //alert('Playing');// Call the viewed service here
//                         $scope.updateContentHistory();
//                    break;
//                    case 'PAUSED':
//                    case 'STOPPED':
//                    break;
//                }
//            }


        });
    };



    $scope.rateContent = function(ratingValue){
        if(ratingValue==-1){
            $scope.dislikeSelected="selected";
            $scope.likeSelected="";
        }else if(ratingValue==1){
            $scope.dislikeSelected="";
            $scope.likeSelected="selected";
        }
        //$("#rating-container").html("Please wait. We are sending your rating.");
        callbackLoadContentDetail = function(data) {
            $('#fullScreenLoader').modal('hide');
            $log.debug(data);
            //$("#rating-container").html("The content has been rated.....");
        };
        var url = appEnv[appEnv.env].baseWSURL;
        if(appEnv[appEnv.env]==="stub") url = appEnv[appEnv.env].baseWSURL + "stubs/UPDATE_RATING.json";
        contentRequestParams={content_id:$scope.contentID, like_dislike:ratingValue};
        //var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(contentRequestParams)),"UPDATE_RATING");
        var requestParams = $scope.getRequestParamsFactory().getRequestParams($.base64.encode(JSON.stringify(contentRequestParams)),"THUMBS_UP_DOWN");
        var params={
            header: appEnv[appEnv.env].requestHeader,
            requestData:requestParams
        };
        DataSource.get(url,params,callbackLoadContentDetail,appEnv[appEnv.env].requestMethod);
    };

    $('#searchButton').on('click', function () {
        triggerSearch();
    });

    function triggerSearch(){
        $('#fullScreenLoader').modal();
        window.location.href=$scope.baseURL+"learn/"+$scope.searchKeyword;
    }

    $scope.$watch(function () { return $scope.getSessionFactory().getBusinessAreas() }, function (newVal, oldVal) {
        if (newVal !== null) {
            $scope.loadContentDetail();
        }
    });

}]);