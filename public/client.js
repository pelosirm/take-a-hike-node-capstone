let activeUser = '';

// api calls
function createUser(user) {
    $.ajax({
            url: "http://localhost:8080/users/create",
            type: "POST",
            dateType: "json",
            data: JSON.stringify(user),
            contentType: "application/json"
        })
        .done(function (results) {
            activeUser = results;
            search();
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log(jxhqr);
            console.log(error);
            console.log(errorThrown);
        })
}

function loginUser(user) {
    $.ajax({
            url: "http://localhost:8080/users/login",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(user),
            contentType: "application/json"
        })
        .done(function (results) {
            activeUser = results;
            search();
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log(jxhqr);
            console.log(error);
            console.log(errorThrown)
        })
}

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

function addHike(hikeInfo) {
    $.ajax({
            url: "http://localhost:8080/hikes/create-new",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(hikeInfo),
            contentType: 'application/json'
        })
        .done(function (results) {
            console.log(results);
            alert(results);
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log(jxhqr);
            console.log(error);
            console.log(errorThrown);
        })
}

function getTrip(user) {
    $.ajax({
            url: "http://localhost:8080/trips/" + user,
            type: "GET",
            dataType: "json",
        })
        .done(function (results) {
            buildTripHtml(results)
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log(jxhqr);
            console.log(error);
            console.log(errorThrown);
        })
}

function buildHikeHtml(data) {
    let htmlOutput = '';

    data.forEach(function (value, index) {
        htmlOutput += `<div class="hike">`
        htmlOutput += `<div class="hike-img-text" id="img${index}" style="background-image: url('${value.imgMedium}')">`
        htmlOutput += `<div class="text-content">`
        htmlOutput += `<p><span class="trail-name">${value.name}</span><br>`
        htmlOutput += `Length :<span class="trail-length">${value.length}</span><br>`
        htmlOutput += `Location :<span class="trail-location">${value.location}</span><br></p>`
        htmlOutput += `</div>`
        htmlOutput += `<div class = "more-info" >`
        htmlOutput += `<a target="_blank" href = "${value.url}"> MORE INFO </a><i class="fa fa-tree" aria-hidden="true"></i>`
        htmlOutput += `<a class = "add-link"> ADD TO TRIP </a>`
        htmlOutput += '</div></div>'
        htmlOutput += `<div class="google-maps" id="map' + index + '"><iframe width="100%" height="300" frameborder="1" style="border:0"`
        htmlOutput += `src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCDP7Dr9Y3d1lf4q-ezgIU8njXxG3mLmZ8&q=${value.latitude},${value.longitude}">`
        htmlOutput += '</iframe></div>'
        htmlOutput += '</div>'

    })

    $('.search-results').append(htmlOutput);
    $('.search-results').show();
}

function buildTripHtml(data) {
    let htmlOutput = ''

    data.forEach(function (value, index) {
        htmlOutput += `<button class="accordion"><i class="fa fa-chevron-down" aria-hidden="true"></i> ${value.trailName} | ${value.location}</button>`
        htmlOutput += `<div class="panel">`
        htmlOutput += `<div class="hike-trips individual-hike">`
        htmlOutput += `<div class="hike-img-text">`
        htmlOutput += `<div class="text-content trip">`
        htmlOutput += `<p>${value.trailName}<br> Length : ${value.length}<br> Location : ${value.location}<br></p>`
        htmlOutput += `</div></div>`
        htmlOutput += `<div class="google-maps">`
        htmlOutput += `<iframe width="100%" height="300" frameborder="0" style="border:0" src="${value.googleMap}" allowfullscreen></iframe>`
        htmlOutput += `</div>`
        htmlOutput += `<div class="hike-info">`
        htmlOutput += `<div class="hike-notes">`
        htmlOutput += `<p> Status : ${value.status} <br> Date Completed: ${value.dateCompleted} <br> Notes: ${value.notes}</p>`
        htmlOutput += `<button class="update-hike">Update Hike</button>`
        htmlOutput += `</div></div></div></div>`
    })
    $('.trips-list').append(htmlOutput);
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
    $('.returning-user').hide();
}

function search() {
    $('.header-intro').show();
    $('.search-input').show();
    $('.header-text').hide();
    $('.header-image').show();
    $('.my-trips').hide();
    $('.search-results').hide();
    $('.returning-user').hide();
    $('.create-new').hide();

}

function myTrips() {
    $('.my-trips').show();
    $('.header-intro').hide();
    $('.search-input').hide();
    $('.header-text').hide();
    $('.search-results').hide();
    $('.header-image').hide();
}

$(document).ready(function () {
    frontPage();



    $('.search-results').hide();
    $('.my-trips').hide();

    // nav bar scroll
    $(document).scroll(function () {
        let $nav = $(".navbar-fixed-top");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });

    $('.search-results').on('click', '.add-link', function () {
        let newHike = {}
        let hikeImage;

        newHike.trailName = $(this).closest('.hike').find('.trail-name').text();
        newHike.length = $(this).closest('.hike').find('.trail-length').text();
        hikeImage = $(this).closest('.hike-img-text').css('background-image');
        hikeImage = hikeImage.replace('url("', '').replace('")', '')
        newHike.img = hikeImage
        newHike.location = $(this).closest('.hike').find('.trail-location').text();
        newHike.url = $(this).closest('.more-info').find('a').attr('href');
        newHike.googleMap = $(this).closest('.hike').find('.google-maps').find('iframe').attr('src');
        newHike.dateCompleted = '';
        newHike.notes = '';
        newHike.status = false;
        newHike.account = activeUser;

        addHike(newHike);
    })

    $('.form-create-new').on('submit', function () {
        event.preventDefault();
        let form = document.body.querySelector('.form-create-new');

        if (form.checkValidity && !form.checkValidity()) {
            return;
        }

        let user = $('.form-create-new [name=username]').val();
        let password = $('.form-create-new [name=password]').val();
        let confirmPassword = $('.form-create-new [name=confirmPassword]').val();

        if (password !== confirmPassword) {
            event.preventDefault();
            alert('Passwords must match!')
        } else {
            event.preventDefault();
            let newUser = {
                username: user,
                password: password
            }
            createUser(newUser)
        }
    })

    $('.form-returning-user').on('submit', function () {
        event.preventDefault();
        let form = document.body.querySelector('.form-returning-user');

        if (form.checkValidity && !form.checkValidity()) {
            return;
        }
        let user = $('.form-returning-user [name=username]').val();
        let password = $('.form-returning-user [name=password]').val();

        let returingUser = {
            username: user,
            password: password
        }
        loginUser(returingUser);
    })



    $('.search-location').on('submit', function () {
        event.preventDefault();
        let locationValue = encodeURI($('#location').val());
        getHikes(locationValue);
        $('.search-input').hide();
        $('.header-intro').hide();
        $('.header-image').hide();
    })

    $('.nav-sign-up').on('click', function () {
        login();
    })

    $('.nav-demo').on('click', function () {
        search();
    })

    $('.nav-login').on('click', function () {
        $('.header-image').show();
        $('.header-intro').show();
        $('.returning-user').show();
        $('.create-new').hide();
        $('.search-input').hide();
        $('.header-text').hide();
        $('.search-results').hide();
        $('.my-trips').hide();
    })

    $('.nav-trips').on('click', function () {
        myTrips();
        console.log(activeUser)
        getTrip(activeUser)
        $('.update-form').hide();

    })

    $('.nav-search').on('click', function () {
        search();
    })

    $('.update-hike').on('click', function () {
        $('.update-form').show();
        $('.hike-notes').hide()
    })

    $('.trips-list').on('click', '.accordion', function () {
        this.classList.toggle("active");

        let panel = this.nextElementSibling;
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    })

    //expandable buttons for my trips
    let acc = document.getElementsByClassName("accordion");
    let i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
            this.classList.toggle("active");

            let panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }


});
