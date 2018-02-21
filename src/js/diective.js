//app.directive(
//    "bnDocumentClick",
//    function( $document, $parse ){
//        var linkFunction = function( $scope, $element, $attributes ){
//            var scopeExpression = $attributes.bnDocumentClick;
//            var invoker = $parse( scopeExpression );
//            $document.on(
//                "click",
//                "#bg_colour_settings li span",
//                function( event ){
//                    $scope.$apply(
//                        function(){
//                            invoker(
//                                $scope,
//                                {
//                                    $event: event
//                                }
//                            );
//
//                        }
//                    );
//
//                }
//            );
//        };
//        return( linkFunction );
//    }
//);