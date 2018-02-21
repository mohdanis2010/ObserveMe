var app = angular.module('app', ['ui.router']);

app.config(['$locationProvider','$urlRouterProvider', '$stateProvider', '$logProvider','$httpProvider', function($locationProvider, $urlRouterProvider, $stateProvider, $logProvider,$httpProvider) {

  //$logProvider.debugEnabled(false);
  //$locationProvider.html5Mode(true);


  //Enable cross domain calls
  $httpProvider.defaults.useXDomain = true;
  $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
  $httpProvider.defaults.headers.common = {};
  $httpProvider.defaults.headers.post = {};
  $httpProvider.defaults.headers.put = {};
  $httpProvider.defaults.headers.patch = {};

  //Remove the header containing XMLHttpRequest used to identify ajax call
  //that would prevent CORS from working
  //delete $httpProvider.defaults.headers.common['X-Requested-With'];


  $urlRouterProvider.otherwise('/');


  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: "views/landingView.html",
      controller: 'landingController',
      onEnter: function(){
        //Entering state
        $('#fullScreenLoader').modal();
      },
      onExit: function(){
        //Exit state
        $('#fullScreenLoader').modal();
      }
    })
    .state('myTeam', {
      url: '/myTeam',
      templateUrl: "views/myTeamView.html",
      controller: 'myTeamController',
      onEnter: function(){
        //Entering state
        $('#fullScreenLoader').modal();


      },
      onExit: function(){
        //Exit state
        $('#fullScreenLoader').modal();
      }
    })
    .state('selectObservee', {
      url: '/selectObservee',
      templateUrl: "views/myTeamView.html",
      controller: 'myTeamController',
      onEnter: function(){
        //Entering state
        $('#fullScreenLoader').modal();

      },
      onExit: function(){
        //Exit state
        $('#fullScreenLoader').modal();
      }
    })
    .state('myTeamSearch', {
      url: "/myTeam/:search",
      templateUrl: "views/myTeamView.html",
      controller: 'myTeamController',
      onEnter: function(){
        //Entering state
        $('#fullScreenLoader').modal();
      },
      onExit: function(){
        $('#fullScreenLoader').modal();
        //Exit state
      }
    })

    .state('businessArea', {
      url: '/businessArea',
      templateUrl: "views/businessAreaView.html",
      controller: 'businessAreaController',
      onEnter: function(){
        //Entering state
        $('#fullScreenLoader').modal();
      },
      onExit: function(){
        //Exit state
        $('#fullScreenLoader').modal();
      }
    })
    .state('learnDetail', {  // NEED TO BE REVERTED - Temporary c/o Anis
      url: '/learnDetail/:id',
      //.state('learn.content', { // NEED TO BE REVERTED - Temporary c/o Anis
      //url: '/learn:contentID',
      templateUrl: "views/learnContentDetailView.html",
      controller: 'learnContentDetailController',
        onEnter: function(){
          //Entering state
          $('#fullScreenLoader').modal();
        },
        onExit: function(){
          //Exit state
          $('#fullScreenLoader').modal();
        }
    })
    .state('learn', {
      url: "/learn",
      templateUrl: "views/learnView.html",
      // templateUrl: "views/LearnView.html",
      controller: 'learnController',
        onEnter: function(){
          //Entering state
          $('#fullScreenLoader').modal();
        },
        onExit: function(){
          $('#fullScreenLoader').modal();
          //Exit state
        }
    })
      .state('learnSearch', {
        url: "/learn/:search",
        templateUrl: "views/learnView.html",
        controller: 'learnController',
        onEnter: function(){
          //Entering state
          $('#fullScreenLoader').modal();
        },
        onExit: function(){
          $('#fullScreenLoader').modal();
          //Exit state
        }
      })
    .state('newObservation', {
      url: '/newObservation',
      templateUrl: "views/newObservationView.html",
      controller: 'newObservationController',
        onEnter: function(){
          //Entering state
          $('#fullScreenLoader').modal();
        },
        onExit: function(){
          //Exit state
          $('#fullScreenLoader').modal();
        }
    })
    //.state('observationRecord', {
    //  url: '/observationRecord',
    //  templateUrl: "views/ObservationRecordOverView.html",
    //  controller: 'observationRecordController',
    //    onEnter: function(){
    //      //Entering state
    //      $('#fullScreenLoader').modal();
    //    },
    //    onExit: function(){
    //      //Exit state
    //      $('#fullScreenLoader').modal();
    //    }
    //})
      .state('observationRecord', {
        url: '/observationRecord',
        templateUrl: "views/ObservationRecordOverView.html",
        controller: 'ObservationRecordOverviewController',
        onEnter: function(){
          //Entering state
          $('#fullScreenLoader').modal();
        },
        onExit: function(){
          //Exit state
          $('#fullScreenLoader').modal();
        }
      })

      .state('observationList', {
        url: '/observationList',
        templateUrl: "views/ObservationListOthers.html",
        controller: 'ObservationListOthersController',
        onEnter: function(){
          //Entering state
          $('#fullScreenLoader').modal();
        },
        onExit: function(){
          //Exit state
          $('#fullScreenLoader').modal();
        }
      })

    .state('observationOverview', {
      url: '/observationOverview/:id',
      templateUrl: "views/observationOverviewView.html",
      controller: 'observationOverviewController',
      onEnter: function(){
        //Entering state
        $('#fullScreenLoader').modal();
      },
      onExit: function(){
        //Exit state
        $('#fullScreenLoader').modal();
      }
    })


      .state('observationOverviewOthers', {
        url: '/observationOverviewOthers/:id',
        templateUrl: "views/observationListOverviewView.html",
        controller: 'observationListOverviewController',
        onEnter: function(){
          //Entering state
          $('#fullScreenLoader').modal();
        },
        onExit: function(){
          //Exit state
          $('#fullScreenLoader').modal();
        }
      })

    .state('observationSummary', {
      url: '/observationSummary',
      templateUrl: "views/observationSummaryView.html",
      controller: 'observationSummaryController',
      onEnter: function(){
        //Entering state
        $('#fullScreenLoader').modal();
      },
      onExit: function(){
        //Exit state
        $('#fullScreenLoader').modal();
      }
    })
    .state('test', {
      url: '/test',
      templateUrl: "views/testView.html",
      controller: 'testController',
          onEnter: function(){
              //Entering state
              //$('#fullScreenLoader').modal();
          },
          onExit: function(){
            //$('#fullScreenLoader').modal();
          }
    })
    .state('myItems', {
      url: '/myItems',
      templateUrl: "views/myItemsView.html",
      controller: 'myItemsController',
        onEnter: function(){
          //Entering state
          $('#fullScreenLoader').modal();
        },
        onExit: function(){
          $('#fullScreenLoader').modal();
        }
    });

}]);




app.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });

      attrs.$observe('ngSrc', function(value) {
        if (!value && attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
});



//$log.debug("This is a debug");
//$log.log("This is a log");
//$log.info("This is a info");
//$log.warn("This is a warn");
//$log.error("This is a error");


