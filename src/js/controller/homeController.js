app.controller('homeController', ['$scope','$log','DataSource',function($scope,$log,DataSource) {

    $('#fullScreenLoader').modal('hide');

    var searchData =[];
    $scope.loadteamMemberContent = function(){

        callbackLoadContent = function(data) {
            $('#fullScreenLoader').modal('hide');
//            $log.debug(data);

            if(data.length===0 || data.length===null){
                $log.debug("No Home Data found");
            }

            else if(_.isUndefined(data.profile_detail.profile_photo) || _.isNull(data.profile_detail.profile_photo)){
                $log.debug("No images found");
            }

            else{
                $scope.homeData=data;
               }
            };

        var url = appEnv[appEnv.env].baseWSURL;
        if(appEnv.env==="stub") url = appEnv[appEnv.env].baseWSURL + "stubs/HOME_CONTENT_LIST.json";

        var params={
            header: appEnv[appEnv.env].requestHeader,
            method: "",
            queryString: ""
        };

        DataSource.get(url,params,callbackLoadContent,appEnv[appEnv.env].requestMethod);

    };

   //SearchMember Functionality

    $scope.loadSearchMemberContent = function(){

        callbackLoadContent = function(data) {

         $log.debug(data);

            if(data.length===0 || data.length===null){
                $log.debug("No Search data found");
            }

            else{
                _.each(data.team_members, function(item) {
                      $scope.searchContent =  item.name;
                      searchData.push($scope.searchContent);

                });

                var searchDataStore =  searchData;

                var substringMatcher = function(strs) {
                    return function findMatches(q, cb) {
                        var matches, substringRegex;

                        // an array that will be populated with substring matches
                        matches = [];

                        // regex used to determine if a string contains the substring `q`
                        substrRegex = new RegExp(q, 'i');

                        // iterate through the pool of strings and for any string that
                        // contains the substring `q`, add it to the `matches` array
                        $.each(strs, function(i, str) {
                            if (substrRegex.test(str)) {
                                // the typeahead jQuery plugin expects suggestions to a
                                // JavaScript object, refer to typeahead docs for more info
                                matches.push({ value: str });
                            }
                        });

                        cb(matches);
                    };
                };

                // constructs the suggestion engine
                var memberLiveSearch = new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    // `states` is an array of state names defined in "The Basics"


                    local: $.map(searchDataStore, function(state) { return { value: state }; })
                });

                // kicks off the loading/processing of `local` and `prefetch`
                memberLiveSearch.initialize();

                $('#memberSearch .typeahead').typeahead({
                        hint: true,
                        highlight: true,
                        minLength: 3,
                        delay:6000
                    },
                    {
                        name: 'memberLiveSearch',
                        displayKey: 'value',
                        // `ttAdapter` wraps the suggestion engine in an adapter that
                        // is compatible with the typeahead jQuery plugin
                        source: memberLiveSearch.ttAdapter()
                     });
                   }
                };


        var url = appEnv[appEnv.env].baseWSURL;
        if(appEnv.env==="stub") url = appEnv[appEnv.env].baseWSURL + "stubs/HOME_CONTENT_LIST.json";

        var params={
            header: appEnv[appEnv.env].requestHeader,
            method: "",
            queryString: ""
        };

        DataSource.get(url,params,callbackLoadContent,appEnv[appEnv.env].requestMethod);

    };

    $scope.loadteamMemberContent();
    $scope.loadSearchMemberContent();


}]);
