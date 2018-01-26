// api calls

function getHikeCoordinates(location) {
    $.ajax({
            url: "http://localhost:8080/hikes/" + location,
            type: "GET",
            dataType: "json"
        })
        .done(function (results) {
            console.log('results from server' + results);
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log(jxhqr);
            console.log(error);
            console.log(errorThrown)
        })
}


$(document).ready(function () {
    console.log("ready!");

    $("#addLink").on("click", function () {
        console.log('fired')
        event.preventDefault();
        let modal = document.getElementById('myModal');
        modal.style.display = "block";
    })

    $('.search-location').on('submit', function () {
        event.preventDefault();
        console.log($('#location').val())
        let locationValue = $('#location').val();
        getHikeCoordinates(locationValue);
    })
});
