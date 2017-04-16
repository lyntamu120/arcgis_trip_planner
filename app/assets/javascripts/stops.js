

//obtain all stops data
function obtainSingleStop(routeNum) {
    var stop;
    var routeURL = "http://thehub2.tamu.edu:80/BusRoutesFeed/api/route/" + routeNum + "/stops";
    $.ajax({
        beforeSend: function(req) {
            req.setRequestHeader("Accept", "application/json");
        },
        async: false,
        global: false,
        url: routeURL,
        dataType: "json",
        success: function (data) {
            stop = data;
        }
    });
    return stop;
}

function obtainStop() {
    var allStops = [];
    var index = 0;
    for (var i = 1; i < 10; i++) {
        var busNum = "0" + i;
        var stops = obtainSingleStop(busNum);
        for (var j = 0; j < stops.length; j++) {
            allStops[index] = {};
            allStops[index].Longtitude = stops[j].Longtitude;
            allStops[index].Latitude = stops[j].Latitude;
            allStops[index].Num = busNum;
            index = index + 1;
        }
    }
    var extraStop = obtainSingleStop("N_W04");
    for (var j = 0; j < stops.length; j++) {
        allStops[index] = {};
        allStops[index].Longtitude = extraStop[j].Longtitude;
        allStops[index].Latitude = extraStop[j].Latitude;
        allStops[index].Num = "N_W04";
        index = index + 1;
    }
    return allStops;
}