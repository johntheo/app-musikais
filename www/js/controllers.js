var map;

angular.module('starter.controllers', [])

    .controller('ConfigCtrl', function($scope) {
    $scope.settings = {
        enableGPS: true
    };
})
    
    .controller('UserCtrl', function($scope,$http,$ionicLoading) {
    $scope.show = false;
    
    $http.get('http://servidor-musikais.rhcloud.com/util/list/onibus').
    success(function(data) {
        $scope.onibus = data;
        $scope.bus = onibus[1];
    });
    
    $scope.change = function(bus) {
        $http.get('http://servidor-musikais.rhcloud.com/busUserContext/idOnibus='+bus.id).
        success(function(data) {
            $scope.show = true;
            $scope.busContext = data;
            $http.get('http://servidor-musikais.rhcloud.com/util/list/imagens/idRegiao='+data.regiao.id).
            success(function(data2) {
                $scope.imagens = data2;
            }); 
        });
    };

    $scope.vote = function(bus,idVoto){
        $http.get('http://servidor-musikais.rhcloud.com/busUserContext/rate/idOnibus='+bus.id+'&idVoto='+idVoto).
        success(function(data) {
            $ionicLoading.show({ template: data.message, noBackdrop: true, duration: 2000 });
        });
    };
})

    .controller('MapController', function($scope, $ionicLoading, $compile, $http) {
    $http.get('http://servidor-musikais.rhcloud.com/util/list/motorista').
    success(function(data) {
        $scope.motoristas = data;
        $scope.motorista = motoristas[1];
    });

    $http.get('http://servidor-musikais.rhcloud.com/util/list/onibus').
    success(function(data) {
        $scope.onibus = data;
        $scope.bus = onibus[1];
    });

    $scope.initialize = function() {
        var myLatlng = new google.maps.LatLng(-25.428877, -49.271377);

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
            $scope.pontos = data;
            for (var ponto in data) {
                angular.forEach($scope.pontos, function(ponto) {
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
            infowindow.open(map, marker);
        });


        $scope.map = map;
        
    }
    //google.maps.event.addDomListener(window, 'load', initialize);


});