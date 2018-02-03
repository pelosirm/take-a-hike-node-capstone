//assign active user for user interactions
let activeUser = '';

// api calls

//fading messages to display alerts and errors
function displayError(message) {
    $(".error-message span").html(message);
    $(".error-message").fadeIn();
    $(".error-message").fadeOut(10000);
};

//create new user
function createUser(user) {
    $.ajax({
            url: "https://take-a-hike-node-capstone.herokuapp.com/users/create",
            type: "POST",
            dateType: "json",
            data: JSON.stringify(user),
            contentType: "application/json"
        })
        .done(function (results) {
            // assign active user for further interactions
            activeUser = results;
            search();
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log(jxhqr);
            console.log(error);
            console.log(errorThrown);
            displayError('Oops! Something went wrong')
        })
}

//login returning user
function loginUser(user) {
    $.ajax({
            url: "https://take-a-hike-node-capstone.herokuapp.com/users/login",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(user),
            contentType: "application/json"
        })
        .done(function (results) {
            //assign active user for furhter interactions
            activeUser = results;
            //see user's trips
            getTrip(activeUser);
            //show user trips
            myTrips();
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log(jxhqr);
            console.log(error);
            console.log(errorThrown);
            displayError('Oops! Something went wrong')
        })
}

// get hikes based on inputed location
function getHikes(location) {
    $.ajax({
            url: "https://take-a-hike-node-capstone.herokuapp.com/hikes/" + location,
            type: "GET",
            dataType: "json"
        })
        .done(function (results) {
            //build results from external api calls
            let trails = results.trails

            if (results.message == "No lat/lon specified") {
                let html = `<div class="search-title"><h1> No results for ${location}</h1></div>`
                $('.search-results').append(html)
                $('.search-results').show();
            } else if (trails.length > 0) {
                buildHikeHtml(trails);
            }
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log(jxhqr);
            console.log(error);
            console.log(errorThrown);
            let html = `<h1> No results for${location}</h1>`
            $('.search-title').append(html)
        })
}


//add hikes to list
function addHike(hikeInfo) {
    $.ajax({
            url: "https://take-a-hike-node-capstone.herokuapp.com/hikes/create-new",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(hikeInfo),
            contentType: 'application/json'
        })
        .done(function (results) {
            //alert that the hike has been added
            displayError(results);
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log(jxhqr);
            console.log(error);
            console.log(errorThrown);
        })
}

//get saved information by user
function getTrip(user) {
    $.ajax({
            url: "https://take-a-hike-node-capstone.herokuapp.com/trips/" + user,
            type: "GET",
            dataType: "json",
        })
        .done(function (results) {
            //build results page
            buildTripHtml(results)
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log(jxhqr);
            console.log(error);
            console.log(errorThrown);
        })
}


//update save information
function updateTrip(id, data, returnUpdate) {
    $.ajax({
            url: "https://take-a-hike-node-capstone.herokuapp.com/trips/update/" + id,
            type: "PUT",
            dataType: "json",
            data: JSON.stringify(data),
            contentType: "application/json"
        })
        .done(function (results) {
            //return updated informatiion
            buildUpdateReturn(results, returnUpdate);
            displayError('Trip Updated!')
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log(jxhqr);
            console.log(error);
            console.log(errorThrown);
        })
}

//remove hiking trip from list
function deleteTrip(id) {
    $.ajax({
            url: "https://take-a-hike-node-capstone.herokuapp.com/delete/" + id,
            type: "DELETE",
            dataType: "json"
        })
        .done(function (results) {
            //return updated list of trips that are saved by user and rebuild with updated info
            $('.trips-list').empty();
            getTrip(activeUser);
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log(jxhqr);
            console.log(error);
            console.log(errorThrown);
            displayError('Oops! Something went wrong')
        })
}


//build results from search data
function buildHikeHtml(data) {
    let htmlOutput = '<div class="search-title"><h1> Hike Results</h1></div>';

    data.forEach(function (value, index) {
        let background = '';

        if (value.imgMedium == '') {
            background = `style="background-image: url('denise-bossarte-263147.jpg')"`
        } else {
            background = `style="background-image: url('${value.imgMedium}')"`
        }

        htmlOutput += `<div class="hike">`
        htmlOutput += `<div class="hike-img-text" id="img${index}" ${background}>`
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

//build results from saved trips
function buildTripHtml(data) {
    let htmlOutput = ''

    data.forEach(function (value, index) {

        let status = '';
        let dateCompleted = ''

        if (!value.status) {
            status = "Haven't Hiked It"
        } else {
            status = 'Completed'
        }

        if (!value.dateCompleted) {
            dateCompleted = 'Not Yet'
        } else {
            dateCompleted = buildDate(value.dateCompleted)
        }

        htmlOutput += `<button class="accordion"><i class="fa fa-chevron-down" aria-hidden="true"></i> ${value.trailName} | ${value.location} <span class="right"> ${dateCompleted} </span></button><i class="fa fa-minus-circle" aria-hidden="true"></i>`
        htmlOutput += `<div class="panel" id= ${value._id}>`
        htmlOutput += `<div class="hike-trips individual-hike">`
        htmlOutput += `<div class="hike-img-text" style="background-image: url('${value.img}')">`
        htmlOutput += '</div>'
        htmlOutput += `<div class="google-maps">`
        htmlOutput += `<iframe width="100%" height="300" frameborder="0" style="border:0" src="${value.googleMap}" allowfullscreen></iframe>`
        htmlOutput += `</div>`
        htmlOutput += `<div class="hike-info">`
        htmlOutput += `<div class="hike-notes">`
        htmlOutput += `<p> <span class="heavy">Trail : </span> ${value.trailName} <br>`
        htmlOutput += `<span class="heavy"> Length : </span>${value.length} <br>`
        htmlOutput += `<span class="heavy">Location : </span> ${value.location}<br>`
        htmlOutput += `<span class="heavy update-status">Status : </span>${status} <br>`
        htmlOutput += `<span class="heavy">Date Completed : </span><span class="update-complete">${dateCompleted}</span><br>`
        htmlOutput += `<span class="heavy">Notes : </span> <span class="update-notes">${value.notes}</span></p>`
        htmlOutput += `<button class="update-hike">Update Hike</button>`
        htmlOutput += `</div></div></div></div>`

    })

    $('.trips-list').append(htmlOutput);
}


//build form to update individual trip data
function buildUpdateHtml(id, notes, date) {

    let htmlOutput = ''

    htmlOutput += `<form id=${id} class='form-update-hike'>`
    htmlOutput += `<input type="radio" name="status" value=false id ="notComplete' required> <label for="notComplete"> Haven't Hiked It </label><br>`
    htmlOutput += `<input type="radio" name="status" value=true id="completed"> <label for="completed"> Hiked It </label><br>`
    htmlOutput += `Date Completed :<input type="date" name="dateCompleted" value="${date}"><br>`
    htmlOutput += `<textarea>${notes}</textarea><br>`
    htmlOutput += `<button class="update-hike-form-button">Update Hike</button>`
    htmlOutput += `</form>`

    return htmlOutput
}

//when updated build updated data
function buildUpdateReturn(value, returnUpdate) {
    returnUpdate.empty();

    let htmlOutput = ''
    let formatDate = buildDate(value.dateCompleted)
    let status = ''

    if (!value.status) {
        status = "Haven't Hiked It"
    } else {
        status = 'Completed'
    }

    htmlOutput += `<div class="hike-notes">`
    htmlOutput += `<p> <span class="heavy">Trail : </span> ${value.trailName} <br>`
    htmlOutput += `<span class="heavy"> Length : </span>${value.length} <br>`
    htmlOutput += `<span class="heavy">Location : </span> ${value.location}<br>`
    htmlOutput += `<span class="heavy update-status">Status : </span>${status} <br>`
    htmlOutput += `<span class="heavy">Date Completed : </span><span class="update-complete">${formatDate}</span><br>`
    htmlOutput += `<span class="heavy">Notes : </span><span class="update-notes">${value.notes}</span></p>`
    htmlOutput += `<button class="update-hike">Update Hike</button>`
    htmlOutput += `</div>`

    returnUpdate.append(htmlOutput);
}

//format date for proper date display
function buildDate(date) {

    let returnDate

    returnDate = new Date(date);
    year = returnDate.getFullYear();
    month = returnDate.getMonth() + 1;
    dt = returnDate.getDate();

    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
        month = '0' + month;
    }
    returnDate = year + '-' + month + '-' + dt;

    return returnDate;
}


// page manipulation

//hide for search functionality
function search() {
    $('.header-intro').show();
    $('.search-input').show();
    $('.header-text').hide();
    $('.header-image').show();
    $('.my-trips').hide();
    $('.search-results').hide();
    $('.returning-user').hide();
    $('.create-new').hide();
    $('.nav-login').hide();
    $('.nav-sign-up').hide();
    $('.nav-signout').show();
    $('.nav-trips').show();
    $('.nav-demo').hide();
    $('.nav-search').show();
    $('.nav-signout').show();
    $('.demo-user').hide();

}

//hide info to show user trips
function myTrips() {
    $('.my-trips').show();
    $('.trips-list').show();
    $('.header-intro').hide();
    $('.search-input').hide();
    $('.header-text').hide();
    $('.search-results').hide();
    $('.header-image').hide();
    $('.nav-login').hide();
    $('.nav-sign-up').hide();
    $('.nav-trips').show();
    $('.nav-demo').hide();
    $('.nav-search').show();
    $('.nav-signout').show();
    $('.demo-user').hide();
}

$(document).ready(function () {

    //this is the front end page loading
    $('.login').hide();
    $('.search-input').hide();
    $('.search-results').hide();
    $('.my-trips').hide();
    $('.nav-signout').hide();
    $('.nav-trips').hide();
    $('.nav-search').hide();
    $('.nav-signout').hide();
    $('.my-trips').hide();
    $('.error-message').hide();
    $('.demo-user').hide();

    // nav bar scroll
    $(document).scroll(function () {
        let $nav = $(".navbar-fixed-top");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });

    //create new user
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
            displayError('Passwords must match!')
        } else {
            event.preventDefault();
            let newUser = {
                username: user,
                password: password
            }
            createUser(newUser);

            $('.form-create-new [name=username]').val('');
            $('.form-create-new [name=password]').val('');
            $('.form-create-new [name=confirmPassword]').val('');
        }
    })

    //login returning user
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

        $('.form-returning-user [name=username]').val('');
        $('.form-returning-user [name=password]').val('');
    })

    //get hikes from external api
    $('.search-location').on('submit', function () {
        event.preventDefault();
        let locationValue = encodeURI($('#location').val());

        $('.search-results').empty();

        getHikes(locationValue);

        $('#location').val('');
        $('.search-input').hide();
        $('.header-intro').hide();
        $('.header-image').hide();
    })

    //adding hike from search results
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

    //navigation page manipulation
    //login in user
    $('.nav-sign-up').on('click', function () {

        $('.create-new').show();
        $('.header-text').hide();
        $('.search-input').hide();
        $('.search-results').hide();
        $('.my-trips').hide();
        $('.returning-user').hide();
        $('.demo-user').hide();
    })

    $('.nav-demo').on('click', function () {

        $('.header-image').show();
        $('.header-intro').show();
        $('.returning-user').show();
        $('.create-new').hide();
        $('.search-input').hide();
        $('.header-text').hide();
        $('.search-results').hide();
        $('.my-trips').hide();
        $('.demo-user').show();

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
        $('.demo-user').hide();
    })

    $('.nav-search').on('click', function () {
        search();
    })

    $('.nav-signout').on('click', function () {
        location.reload();
    })

    //go to my my trips
    $('.nav-trips').on('click', function () {
        myTrips();
        $('.trips-list').empty();
        getTrip(activeUser)
    })

    //update hike page manipulation
    $('.update-hike').on('click', function () {
        $('.update-form').show();
        $('.hike-notes').hide()
    })

    //expand trips list toggles
    $('.trips-list').on('click', '.accordion', function () {
        this.classList.toggle("active");
        $(this).next().next().toggle();
    })

    $('.trips-list').on('click', '.update-hike', function () {

        let updateId = $(this).closest('.panel').attr('id')
        let notes = $(this).closest('.panel').find('.update-notes').text();
        let date = $(this).closest('.panel').find('.update-complete').text();
        if (date == "Not Yet" || date == '') {
            date = buildDate(new Date())
        }
        let divUpdate = $(this).closest('.hike-notes')
        $(this).closest('.hike-notes').empty();
        let updateForm = buildUpdateHtml(updateId, notes, date)
        divUpdate.append(updateForm);

    })

    $('.trips-list').on('submit', '.form-update-hike', function () {
        event.preventDefault();

        let updateHikeInfo = {};
        let id = $(this).attr('id');
        let returnUpdate = $(this).closest('.hike-notes');

        //create updated object
        updateHikeInfo.id = id
        updateHikeInfo.status = $('.form-update-hike [name=status]:checked').val();

        if (updateHikeInfo.status == false) {
            updateHikeInfo.dateCompleted = ''
            updateHikeInfo.notes = ''
        } else {
            updateHikeInfo.dateCompleted = $('.form-update-hike [name=dateCompleted]').val();
            updateHikeInfo.notes = $('.form-update-hike textarea').val();
        }



        //reach out and update information
        updateTrip(id, updateHikeInfo, returnUpdate);
    })

    $('.trips-list').on('click', '.fa-minus-circle', function () {
        let item = $(this).next().attr('id')
        deleteTrip(item);
    })



});
