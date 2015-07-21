angular.module('starter.controllers', [])
  .config(function($sceProvider) {
    // Completely disable SCE.  For demonstration purposes only!
    // Do not use in new projects.
    $sceProvider.enabled(false);
  })

.controller('ConfigCtrl', function($scope, $http, settings) {
  $scope.settings = settings;
  $http.get('http://servidor-musikais.rhcloud.com/recommendation/get/regions').
  success(function(data) {
    $scope.regioes = data;
  });

  $scope.mudar = function() {
    $scope.settings.latText = $scope.regiao.latitude;
    $scope.settings.lngText = $scope.regiao.longitude;
  }
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

  $scope.refresh = function(bus) {
    $http.get('http://servidor-musikais.rhcloud.com/busUserContext/idOnibus=' + bus.id)
      .success(function(data) {
        $scope.show = true;
        $scope.busContext = data;
        $http.get('http://servidor-musikais.rhcloud.com/util/list/imagens/idRegiao=' + data.regiao.id).
        success(function(data2) {
          $scope.imagens = data2;
        });
      })
      .finally(function() {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
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

.controller('BusCtrl', function($scope, $ionicLoading, $compile, $http, $cordovaMedia, $timeout, settings, audio, ClockSrv) {
  $scope.settings = settings;
  $scope.playing = false;

  $scope.initialize = function() {
    if (window.Connection) {
      if (navigator.connection.type == Connection.NONE) {
        $ionicPopup.confirm({
            title: "Sem internet",
            content: "Ops! Por enquanto não é possível rodar sem internet. Tente depois ou conecte-se a uma rede"
          })
          .then(function(result) {
            if (!result) {
              ionic.Platform.exitApp();
            }
          });
      }
    }

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
  $scope.tocarMusica = function() {
    var d = new Date();
    var timestamp = d.getTime();
    var musicaId = $scope.contexto.musicas[Math.floor(Math.random() * $scope.contexto.musicas.length)].id;
    $scope.musicaLink = 'http://musikais.com/musicas/' + musicaId + '.ogg';
    if ($scope.bus != null || $scope.motorista != null) {
      var busId = $scope.bus.id;
      var motoristaId = $scope.motorista.id;
      audio.play($scope.musicaLink);
      $http.get('http://servidor-musikais.rhcloud.com/recommendation/set/idOnibus=' + busId + '&idMotorista=' + motoristaId + '&idMusica=' + musicaId + '&lat=' + $scope.latitude + '&lon=' + $scope.longitude + '&timestamp=' + timestamp).
      success(function(data) {
        $ionicLoading.show({
          template: 'Carregando música',
          noBackdrop: true,
          duration: 2000
        });
      });
      $scope.playing = true;
    } else {
      $ionicLoading.show({
        template: 'Hey! Você esqueceu de informar ÔNIBUS ou MOTORISTA.',
        noBackdrop: true,
        duration: 3000
      });
    }

  }

  $scope.play = function() {

    if ($scope.playing) {
      ClockSrv.stopClock();
      audio.pause();
      $scope.playing = false;
    } else {
      $scope.tocarMusica();
      ClockSrv.startClock(function() {
        $scope.tocarMusica();
      });

    }
  }

  $scope.settings.verifyMapClass = function() {
    if ($scope.settings.monitor && $scope.settings.force) {
      $scope.settings.mapClass = "map-class1";
    } else if ($scope.settings.monitor && !$scope.settings.force) {
      $scope.settings.mapClass = "map-class2";
    } else if (!$scope.settings.monitor && $scope.settings.force) {
      $scope.settings.mapClass = "map-class3";
    } else if (!$scope.settings.monitor && !$scope.settings.force) {
      $scope.settings.mapClass = "map-class4";
    }
  }

  function initMap() {
    $scope.settings.verifyMapClass();
    var myLatlng = new google.maps.LatLng($scope.settings.latText, $scope.settings.lngText);

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
    if (!$scope.settings.force) {
      $scope.longitude = position.coords.longitude;
      $scope.latitude = position.coords.latitude;
      $scope.marker.setPosition(new google.maps.LatLng($scope.latitude, $scope.longitude));
      $scope.map.panTo(new google.maps.LatLng($scope.latitude, $scope.longitude));
      horaAtual();
      obterContexto(position.coords.latitude, position.coords.longitude);
    } else {
      $scope.longitude = $scope.settings.lngText;
      $scope.latitude = $scope.settings.latText;
      $scope.marker.setPosition(new google.maps.LatLng($scope.settings.latText, $scope.settings.lngText));
      $scope.map.panTo(new google.maps.LatLng($scope.settings.latText, $scope.settings.lngText));
      horaAtual();
      obterContexto($scope.settings.latText, $scope.settings.lngText);
    }

  }

  function onError(error) {
    $ionicPopup.confirm({
        title: error.code,
        content: error.message
      })
      .then(function(result) {
        if (!result) {
          ionic.Platform.exitApp();
        }
      });
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

  function obterContexto(latitude, longitude) {
    $http.get('http://servidor-musikais.rhcloud.com/recommendation/get/lat=' + latitude + '&lon=' + longitude + '&horario=' + $scope.hora).
    success(function(data) {
      $scope.contexto = data;
    });
  }


});
