//
//
//function createMaps(data) {
//    data.forEach(function (hikes) {
//        initMap(hikes.coordinates, hikes.id);
//    })
//
//}
//
//function initMap(coordinates, id) {
//    let map = new google.maps.Map(document.getElementById(id), {
//        zoom: 15,
//        center: coordinates
//    });
//    let marker = new google.maps.Marker({
//        position: coordinates,
//        map: map
//    });
//}

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

function buildHikeHtml(data) {
    let htmlOutput = '';
    let imgUrl = [];
    data.forEach(function (value, index) {
        htmlOutput += `<div class="hike">`
        htmlOutput += `<div class="hike-img-text" id="img${index}">`
        htmlOutput += '<div class="text-content">'
        htmlOutput += '<p><span class="trail-name">' + value.name + '</span><br>Length :<span class="trail-length">' + value.length + '</span><br>Location :<span class="trail-location">' + value.location + '</span><br></p>'
        htmlOutput += '</div>'
        htmlOutput += '<div class = "more-info" >'
        htmlOutput += '<a target="_blank" href = "' + value.url + '"> MORE INFO </a><i class="fa fa-tree" aria-hidden="true"></i><a class = "add-link"> ADD TO TRIP </a>'
        htmlOutput += '</div></div>'
        htmlOutput += '<div class="google-maps" id="map' + index + '"><iframe width="100%" height="300" frameborder="1" style="border:0" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCDP7Dr9Y3d1lf4q-ezgIU8njXxG3mLmZ8&q=' + value.latitude + ',' + value.longitude + '">'
        htmlOutput += '</iframe></div>'
        htmlOutput += '</div>'

        imgUrl.push(value.imgMed)
    })

    $('.search-results').append(htmlOutput);
    $('.search-results').show();
}

function addHike() {

}

// page manipulation

function frontPage() {
    $('.login').hide();
    $('.search-input').hide();
    $('.search-results').hide();
    $('.my-trips').hide();
}

function login() {
    $('.create-new').show();
    $('.header-text').hide();
    $('.search-input').hide();
    $('.search-results').hide();
    $('.my-trips').hide();
}

function search() {
    $('.search-input').show();
    $('.header-intro').show();
    $('.search-input').show();
    $('.header-text').hide();
    $('.my-trips').hide();
    $('.search-results').hide();

}

function saveHike() {

}

$(document).ready(function () {
    frontPage();

    $('.search-results').hide();

    $(document).scroll(function () {
        let $nav = $(".navbar-fixed-top");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
        console.log('fired')
    });

    $('.search-results').on('click', '.add-link', function () {
        let modal = document.getElementById('myModal');
        modal.style.display = "block";

        newHike.trailName = $(this).closest('.hike').find('.trail-name').text();
        newHike.length = $(this).closest('.hike').find('.trail-length').text();
        newHike.img = $(this).closest('.hike').find('img').attr('src');
        newHike.location = $(this).closest('.hike').find('.trail-location').text();


    })

    $('.close').on('click', function () {
        let modal = document.getElementById('myModal');
        modal.style.display = "none";
    })

    $('.search-location').on('submit', function () {
        event.preventDefault();
        let locationValue = $('#location').val();
        getHikes(locationValue);
        $('.search-input').hide();
        $('.header-intro').hide();
        $('.header-image').hide();
    })

    $('.get-started').on('click', function () {
        login();
    })

    $('.nav-demo').on('click', function () {
        search();
    })


});
