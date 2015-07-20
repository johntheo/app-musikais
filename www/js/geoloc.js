// Wait for device API libraries to load
//
document.addEventListener("deviceready", onDeviceReady, false);
var watchID = null;

// device APIs are available
//
function onDeviceReady() {
    // Throw an error if no update is received every 30 seconds
    var options = { timeout: 30000 };
    watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
}

// onSuccess Geolocation
//
function onSuccess(position) {
    var element = document.getElementById('info');
    longitude = position.coords.longitude;
    latitude = position.coords.latitude;
    var latLong = new google.maps.LatLng(latitude, longitude);

    element.innerHTML += 'Latitude: '  + latitude      + ' | ' + 'Longitude: ' + longitude;


}

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}
