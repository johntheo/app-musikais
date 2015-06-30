var map;

angular.module('starter.controllers', [])

    .controller('DashCtrl', function($scope) {})

    .controller('ChatsCtrl', function($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function(chat) {
        Chats.remove(chat);
    }
})

    .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})
    .controller('MapController', function($scope, $ionicLoading, $compile, $http) {
    $scope.initialize = function() {
        var myLatlng = new google.maps.LatLng(-25.428877,-49.271377);

        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Olá!</a></div>";
        var compiled = $compile(contentString)($scope);

        var infowindow = new google.maps.InfoWindow({
            content: compiled[0]
        });

        var mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map"),
                                  mapOptions);


        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Musikais Curitiba'
        });

        //INIT PONTOS
        $http.get('http://servidor-musikais.rhcloud.com/recommendation/get/regions').
        success(function(data) {
            for (var ponto in data) {
                $scope.pontos = data;
                angular.forEach($scope.pontos, function(ponto){
                    var regiaoOptions = new google.maps.Circle({
                        strokeColor: '#33cd5f',
                        strokeOpacity: 0.1,
                        strokeWeight: 0.1,
                        fillColor: '#33cd5f',
                        fillOpacity: 0.06,
                        map: map,
                        center: new google.maps.LatLng(ponto.latitude, ponto.longitude),
                        radius: ponto.raio

                    });
                });
            }
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map,marker);
        });


        $scope.map = map;
    }
    //google.maps.event.addDomListener(window, 'load', initialize);


})

    .controller('AccountCtrl', function($scope) {
    $scope.settings = {
        enableFriends: true
    };
});
