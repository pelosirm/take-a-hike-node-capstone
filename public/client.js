function getHikes() {
    $.ajax({
            url: "https://www.hikingproject.com/data/get-trails?lat=40.0274&lon=-105.2519&maxDistance=10&key=200208774-24dfee334bb22d6484c0a63d8884816d",
            type: "GET",
            dataType: "json"
        })
        .done(function (results) {
            console.log(results)
            //            let hikes = results.trails
            //            addHikes(hikes)
        })
        .fail(function (jxhqr, error, errorThrown) {
            console.log('oops')

        })
}

function initMap() {
    var uluru = {
        lat: 40.02,
        lng: -105.2979
    };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: uluru
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map
    });

}



//// Get the button that opens the modal
//var btn = document.getElementById("addLink");
//
//// Get the <span> element that closes the modal
//var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal




//// When the user clicks on <span> (x), close the modal
//span.onclick = function () {
//    modal.style.display = "none";
//}
//
//// When the user clicks anywhere outside of the modal, close it
//window.onclick = function (event) {
//    if (event.target == modal) {
//        modal.style.display = "none";
//    }
//}

function addHikes(results) {
    let htmlOutput = ''
    for (let i = 0; i < results.length; i++) {
        htmlOutput += "<img src='" + results[i].imgSmall + "'>"
    }
    $('.search-results').append(htmlOutput);
}


$(document).ready(function () {
    console.log("ready!");
    getHikes()

    $("#addLink").on("click", function () {
        console.log('fired')
        event.preventDefault();
        let modal = document.getElementById('myModal');
        modal.style.display = "block";
    })
});
