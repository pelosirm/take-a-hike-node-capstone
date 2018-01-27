// api calls

function getHikes(location) {
    $.ajax({
            url: "http://localhost:8080/hikes/" + location,
            type: "GET",
            dataType: "json"
        })
        .done(function (results) {
            buildHikeHtml(results);
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log(jxhqr);
            console.log(error);
            console.log(errorThrown)
        })
}

function createMaps(data) {
    data.forEach(function (hikes) {
        initMap(hikes.coordinates, hikes.id);
    })

}

function initMap(coordinates, id) {
    //    var uluru = {
    //        lat: 40.02,
    //        lng: -105.2979
    //    };
    let map = new google.maps.Map(document.getElementById(id), {
        zoom: 15,
        center: coordinates
    });
    let marker = new google.maps.Marker({
        position: coordinates,
        map: map
    });
}



function initialize(coords) {
    var markers = [];
    var maps = [];

    for (var i = 0, length = coords.length; i < length; i++) {
        var point = coords[i];
        var latlng = new google.maps.LatLng(point.lat, point.lng);

        maps[i] = new google.maps.Map(document.getElementById('map' + i), {
            zoom: point.zoom,
            center: latlng
        });

        markers[i] = new google.maps.Marker({
            position: latlng,
            map: maps[i]
        });
    }
}

function buildHikeHtml(data) {
    let htmlOutput = '';
    let googleMaps = [];
    data.forEach(function (value, index) {
        htmlOutput += '<div class="hike">'
        htmlOutput += '<div class="hike-img-text">'
        htmlOutput += '<img src="' + value.imgMedium + '">'
        htmlOutput += '<div class="text-content">'
        htmlOutput += '<p>' + value.name + '<br> Length :' + value.length + '<br>Location :' + value.location + '<br></p>'
        htmlOutput += '</div>'
        htmlOutput += '<div class = "more-info" >'
        htmlOutput += '<a href = "' + value.url + '"> MORE INFO </a> | <a id = "addLink"> ADD TO TRIP </a>'
        htmlOutput += '</div></div>'
        htmlOutput += '<div class="google-map" id="map' + index + '"></div>'
        htmlOutput += '</div>'

        let mapPoints = {
            id: 'map' + index,
            coordinates: {
                lat: value.latitude,
                lng: value.longitude
            }
        }

        googleMaps.push(mapPoints);
    })

    $('.search-results').append(htmlOutput);
    $('.search-results').show();
    var coords = [
        {
            lat: 49.18589,
            lng: -2.19917,
            zoom: 17
        },
        {
            lat: 101.1986,
            lng: -50.2445,
            zoom: 17
        },
        {
            lat: 29.125285,
            lng: -82.048823,
            zoom: 17
        }
    ];

    initialize(coords);

}


$(document).ready(function () {
    console.log("ready!");


    $('.search-results').hide();
    $("#addLink").on("click", function () {
        console.log('fired')
        event.preventDefault();
        let modal = document.getElementById('myModal');
        modal.style.display = "block";
    })

    $('.search-location').on('submit', function () {
        event.preventDefault();
        let locationValue = $('#location').val();
        getHikes(locationValue);
        $('.header-image').hide();
        $('.header-intro').hide();

    })
});
