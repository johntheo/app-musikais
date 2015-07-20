angular.module('starter.controllers', [])

.controller('ConfigCtrl', function($scope, settings) {
  $scope.settings = settings;
})

.controller('UserCtrl', function($scope, $http, $ionicLoading, settings) {
  $scope.show = false;

  $http.get('http://servidor-musikais.rhcloud.com/util/list/onibus').
  success(function(data) {
    $scope.onibus = data;
  });

  $scope.change = function(bus) {
    $http.get('http://servidor-musikais.rhcloud.com/busUserContext/idOnibus=' + bus.id).
    success(function(data) {
      $scope.show = true;
      $scope.busContext = data;
      $http.get('http://servidor-musikais.rhcloud.com/util/list/imagens/idRegiao=' + data.regiao.id).
      success(function(data2) {
        $scope.imagens = data2;
      });
    });
  };

  $scope.vote = function(bus, idVoto) {
    $http.get('http://servidor-musikais.rhcloud.com/busUserContext/rate/idOnibus=' + bus.id + '&idVoto=' + idVoto).
    success(function(data) {
      $ionicLoading.show({
        template: data.message,
        noBackdrop: true,
        duration: 2000
      });
    });
  };
})

.controller('BusCtrl', function($scope, $ionicLoading, $compile, $http, settings) {
  $scope.settings = settings;
  $scope.latText = -25.428877;
  $scope.lngText = -49.271377;

  $scope.initialize = function() {
    $http.get('http://servidor-musikais.rhcloud.com/util/list/motorista').
    success(function(data) {
      $scope.motoristas = data;
    });
    $http.get('http://servidor-musikais.rhcloud.com/util/list/onibus').
    success(function(data) {
      $scope.onibus = data;
    });

    var options = {
      frequency: 1000,
      timeout: 30000
    };
    initMap();
    watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
  }

  $scope.play = function(){
    var d = new Date();
    var timestamp = d.getTime();
    var musicaId = $scope.contexto.musicas[0].id;
    var busId = $scope.bus.id;
    var motoristaId = $scope.motorista.id;
    $http.get('http://servidor-musikais.rhcloud.com/recommendation/set/idOnibus='+busId+'&idMotorista='+motoristaId+'&idMusica='+musicaId+'&lat='+$scope.latitude+'&lon='+$scope.longitude+'&timestamp='+timestamp).
    success(function(data) {
      $ionicLoading.show({
        template: data.message,
        noBackdrop: true,
        duration: 2000
      });
    });
  }

  function initMap() {
    if($scope.settings.monitor && $scope.settings.force){
      $scope.mapClass = "map-class1";
    } else if($scope.settings.monitor && !$scope.settings.force){
      $scope.mapClass = "map-class2";
    } else if(!$scope.settings.monitor && $scope.settings.force){
      $scope.mapClass = "map-class3";
    } else if(!$scope.settings.monitor && !$scope.settings.force){
      $scope.mapClass = "map-class4";
    }

    var myLatlng = new google.maps.LatLng($scope.latText, $scope.lngText);

    var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.map = new google.maps.Map(document.getElementById("map"),
      mapOptions);


    $scope.marker = new google.maps.Marker({
      position: myLatlng,
      map: $scope.map,
      icon: 'img/bus.png',
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
            map: $scope.map,
            center: new google.maps.LatLng(ponto.latitude, ponto.longitude),
            radius: ponto.raio

          });
        });
      }
    });

    //Marker + infowindow + angularjs compiled ng-click
    var contentHead = "<div>";
    var content = "Jardineira Curitiba";
    var contentBottom = "</div>";
    var contentString = contentHead + content + contentBottom;
    var compiled = $compile(contentString)($scope);

    var infowindow = new google.maps.InfoWindow({
      content: compiled[0]
    });
    google.maps.event.addListener($scope.marker, 'click', function() {
      if ($scope.marker.getAnimation() != null) {
        $scope.marker.setAnimation(null);
      } else {
        $scope.marker.setAnimation(google.maps.Animation.BOUNCE);
      }
      infowindow.open($scope.map, $scope.marker);
    });
  }

  function onSuccess(position) {
    if(!$scope.settings.force){
      $scope.longitude = position.coords.longitude;
      $scope.latitude = position.coords.latitude;
      $scope.marker.setPosition(new google.maps.LatLng($scope.latitude, $scope.longitude));
      $scope.map.panTo(new google.maps.LatLng($scope.latitude, $scope.longitude));
      horaAtual();
      obterContexto(position.coords.latitude,position.coords.longitude);
    }else{
      $scope.longitude = $scope.lngText;
      $scope.latitude = $scope.latText;
      $scope.marker.setPosition(new google.maps.LatLng($scope.latText, $scope.lngText));
      $scope.map.panTo(new google.maps.LatLng($scope.latText, $scope.lngText));
      horaAtual();
      obterContexto($scope.latText,$scope.lngText);
    }

  }

  function onError(error) {
    alert('code: ' + error.code + '\n' +
      'message: ' + error.message + '\n');
  }

  function horaAtual() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    $scope.hora = h;
    $scope.minuto = m;
    $scope.segundo = s;
  }

  function obterContexto(latitude,longitude) {
    $http.get('http://servidor-musikais.rhcloud.com/recommendation/get/lat='+latitude+'&lon='+longitude+'&horario='+$scope.hora).
    success(function(data) {
      $scope.contexto = data;
    });
  }


});
