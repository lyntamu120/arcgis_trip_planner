$(document).ready(function () {
    main();
});

var main = function() {
    //Arcgis api, using dojo callback function
    require([
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/query",
        "dojo/_base/Color",
        "dojo/_base/array",
        "dojo/parser",
        "dijit/registry",
        "esri/urlUtils",
        "esri/map",
        "esri/lang",
        "esri/graphic",
        "esri/InfoTemplate",
        "esri/layers/GraphicsLayer",
        "esri/renderers/SimpleRenderer",
        "esri/geometry/Point",
        "esri/tasks/FeatureSet",

        "esri/tasks/ClosestFacilityTask",
        "esri/tasks/ClosestFacilityParameters",

        "esri/dijit/Search",
        "esri/geometry/screenUtils",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/layers/FeatureLayer",
        "esri/symbols/PictureMarkerSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/CartographicLineSymbol",
        "esri/geometry/Polyline",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/config",


        "dijit/form/ComboBox",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",

        "dojo/domReady!"

    ],  function (dom, domConstruct, query, Color, array, parser, registry,
                  urlUtils, Map, esriLang, Graphic, InfoTemplate, GraphicsLayer, SimpleRenderer,
                  Point, FeatureSet,
                  ClosestFacilityTask, ClosestFacilityParameters,
                  Search, screenUtils, ArcGISTiledMapServiceLayer,FeatureLayer,PictureMarkerSymbol,
                  SimpleMarkerSymbol, SimpleLineSymbol, CartographicLineSymbol, Polyline, ArcGISDynamicMapServiceLayer, ArcGISTiledMapServiceLayer,
                  esriConfig) {

        dojoCallBack(
            dom, domConstruct, query, Color, array, parser, registry,
            urlUtils, Map, esriLang, Graphic, InfoTemplate, GraphicsLayer, SimpleRenderer,
            Point, FeatureSet,
            ClosestFacilityTask, ClosestFacilityParameters,
            Search, screenUtils, ArcGISTiledMapServiceLayer,FeatureLayer,PictureMarkerSymbol,
            SimpleMarkerSymbol, SimpleLineSymbol, CartographicLineSymbol, Polyline, ArcGISDynamicMapServiceLayer, ArcGISTiledMapServiceLayer,
            esriConfig
        );
    });
}

function dojoCallBack(
    dom, domConstruct, query, Color, array, parser, registry,
    urlUtils, Map, esriLang, Graphic, InfoTemplate, GraphicsLayer, SimpleRenderer,
    Point, FeatureSet,
    ClosestFacilityTask, ClosestFacilityParameters,
    Search, screenUtils, ArcGISTiledMapServiceLayer,FeatureLayer,PictureMarkerSymbol,
    SimpleMarkerSymbol, SimpleLineSymbol, CartographicLineSymbol, Polyline, ArcGISDynamicMapServiceLayer, ArcGISTiledMapServiceLayer,
    esriConfig

){
    var incidentsGraphicsLayer, routeGraphicLayer, closestFacilityTask;
    var allStops = obtainStop();
    var map;
    esriConfig.defaults.io.corsEnabledServers.push("utility.arcgis.com");

    //add the map
    parser.parse();
    map = new Map("map");
    var layer = new ArcGISTiledMapServiceLayer(mainMapLayerUrl);
    map.addLayer(layer);

    // set the search widgets
    var search1 = new Search({
        autoNavigate:false,
        // drop the default source
        sources:[],
        map: map
    }, dom.byId("search1"));

    var search2 = new Search({
        autoNavigate:false,
        sources:[],
        map: map
    }, dom.byId("search2"));

    addSource(search1, "Please enter your starting point", FeatureLayer);
    search1.startup();

    addSource(search2, "Please enter your destination", FeatureLayer);
    search2.startup();


    params1 = new ClosestFacilityParameters();
    params2 = new ClosestFacilityParameters();

    //start
    params1.impedenceAttribute= "Miles";
    params1.defaultCutoff= 2.0;
    params1.returnIncidents=false;
    params1.returnRoutes=true;
    params1.returnDirections = true;
    params1.travelMode = 5;
    //end
    params2.impedenceAttribute= "Miles";
    params2.defaultCutoff= 2.0;
    params2.returnIncidents=false;
    params2.returnRoutes=true;
    params2.returnDirections=true;
    params2.travelMode = 5;

    var symbol1 = new PictureMarkerSymbol(symbol1Info);
    var symbol2 = new PictureMarkerSymbol(symbol2Info);


    map.on("load", function (evtObj) {
        var mapp = evtObj.target;
        var line = new SimpleLineSymbol();
        //set the bus stop symbol to be invisible
        line.setStyle(SimpleLineSymbol.STYLE_NULL);
        var facilityPointSymbol = new SimpleMarkerSymbol();
        facilityPointSymbol.setOutline(line);

        var incidentPointSymbol = new SimpleMarkerSymbol(
            SimpleMarkerSymbol.STYLE_CIRCLE,
            16,
            new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color([89,95,35]), 2
            ),
            new Color([130,159,83,0.40])
        );

        incidentsGraphicsLayer = new GraphicsLayer();

        var incidentsRenderer = new SimpleRenderer(incidentPointSymbol);
        incidentsGraphicsLayer.setRenderer(incidentsRenderer);
        mapp.addLayer(incidentsGraphicsLayer);

        routeGraphicLayer = new GraphicsLayer();

        var routePolylineSymbol = new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([89,95,35]),
            4.0
        );
        var routeRenderer = new SimpleRenderer(routePolylineSymbol);
        routeGraphicLayer.setRenderer(routeRenderer);

        mapp.addLayer(routeGraphicLayer);

        var facilitiesGraphicsLayer = new GraphicsLayer();
        var facilityRenderer = new SimpleRenderer(facilityPointSymbol);
        facilitiesGraphicsLayer.setRenderer(facilityRenderer);

        mapp.addLayer(facilitiesGraphicsLayer);


        for(var i = 0; i < allStops.length; i++){
            facilitiesGraphicsLayer.add(new Graphic(new Point(allStops[i].Longtitude,allStops[i].Latitude,mapp.spatialReference)));
        }


        var facilities = new FeatureSet();
        facilities.features = facilitiesGraphicsLayer.graphics;

        params1.facilities = facilities;
        params1.outSpatialReference = mapp.spatialReference;
        params2.facilities = facilities;
        params2.outSpatialReference = mapp.spatialReference;
    });

    //closestFacilityTask = new ClosestFacilityTask("https://route.arcgis.com/arcgis/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World");
    closestFacilityTask = new ClosestFacilityTask(ClosestFacilityServiceUrl);

    params1.defaultTargetFacilityCount = 10;
    params2.defaultTargetFacilityCount = 10;

    function clearGraphics() {
        //clear graphics
        map.graphics.clear();
        routeGraphicLayer.clear();
        incidentsGraphicsLayer.clear();
    }

    var symbolStart = new PictureMarkerSymbol(symbolStartInfo);
    var symbolEnd = new PictureMarkerSymbol(symbolEndInfo);

    function showLocation() {
        $('.arcgisSearch .searchGroup .searchInput').css("border-color","");
        if (search1.searchResults != null && search2.searchResults != null) {
            if(search1.searchResults[0][0].name == 'Memorial Student Center'){
                params1.defaultCutoff= 10.0;
                params1.defaultTargetFacilityCount = 10;
            }else {
                params1.defaultCutoff = 3.5;
                params1.defaultTargetFacilityCount = 4;
            }

            if(search2.searchResults[0][0].name == 'Memorial Student Center'){
                params2.travelDirection = "From_FACILITY"
                params2.defaultCutoff= 10.0;
                params2.defaultTargetFacilityCount = 10;
            }else{
                params2.travelDirection = "From_FACILITY"
                params2.defaultCutoff= 3.5;
                params2.defaultTargetFacilityCount = 4;
            }

            var e = search1.searchResults[0][0];
            var f = search2.searchResults[0][0];
            map.graphics.clear();
            var point1 = e.feature.geometry;
            // search2.on("select-result", function(f){
            var point2 = f.feature.geometry;
            var loc1 = point1.rings;
            var loc2 = point2.rings;
            clearGraphics();
            //var inPoint = new Point(evt.mapPoint.x, evt.mapPoint.y, map.spatialReference);
            //extract the first point of each ring as the start and destination
            var inPoint1 = new Point(loc1[0][0][0], loc1[0][0][1], map.spatialReference);
            var inPoint2 = new Point(loc2[0][0][0], loc2[0][0][1], map.spatialReference);
            var start = new Graphic(inPoint1, symbol1);
            var end = new Graphic(inPoint2, symbol2);
            incidentsGraphicsLayer.add(start);
            incidentsGraphicsLayer.add(end);
            //set the incidents
            var features1 = [];
            var features2 = [];
            features1.push(start);
            features2.push(end);
            var incidents1 = new FeatureSet();
            var incidents2 = new FeatureSet();
            incidents1.features = features1;
            incidents2.features = features2;
            params1.incidents = incidents1;
            params2.incidents = incidents2;


                closestFacilityTask.solve(params1, function (solveResult1) {
                    solveFT(solveResult1);
                }, function (err) {
                    if ($("#text").is(':empty')) {
                        $('#text').text("There are no suitable stops because even the closest stop takes very long time to walk to.");
                    }
                });

            function solveFT(solveResult1){
                var points1 = [];

                if(search1.searchResults[0][0].name == 'Memorial Student Center'){
                    stopspecial = [];
                    stopspecial.push(allStops[8].Longtitude);
                    stopspecial.push(allStops[8].Latitude);
                    stopspecial.push(allStops[8].Num);
                    stopspecial.push(8);
                    points1.push(stopspecial);
                }

                if(search1.searchResults[0][0].name == 'Reed Arena'){
                    stopspecial2 = [];
                    stopspecial2.push(allStops[7].Longtitude);
                    stopspecial2.push(allStops[7].Latitude);
                    stopspecial2.push(allStops[7].Num);
                    stopspecial2.push(7);
                    points1.push(stopspecial2);
                    stopspecial5 = [];
                    stopspecial5.push(allStops[56].Longtitude);
                    stopspecial5.push(allStops[56].Latitude);
                    stopspecial5.push(allStops[56].Num);
                    stopspecial5.push(56);
                    points1.push(stopspecial5);
                }

                array.forEach(solveResult1.routes, function(route1, index1){

                    //build an array of route info
                    //dojo array.map can create a new array
                    //solveResult1.derections[0].features is an array, each feature is a graphic object

                    var attr = array.map(solveResult1.directions[index1].features, function(feature){
                        return feature.attributes.text;
                    });


                    //route1 is also a graphic object
                    route1.setAttributes(attr);

                    //find the coordinate of closest point
                    destination1 = route1.attributes[route1.attributes.length - 1];
                    destinationArray1 = destination1.split(" ");
                    destinationId1 = destinationArray1[3];
                    stopId1 = +destinationId1;

                    stopPoint1X = params1.facilities.features[stopId1 - 1].geometry.x;
                    stopPoint1Y = params1.facilities.features[stopId1 - 1].geometry.y;

                    stopPoint1 = [];
                    stopPoint1.push(stopPoint1X);
                    stopPoint1.push(stopPoint1Y);
                    stopPoint1.push(allStops[stopId1 - 1].Num);
                    stopPoint1.push(stopId1 - 1);
                    stopPoint1.push(route1);
                    points1.push(stopPoint1);

                });

                closestFacilityTask.solve(params2, function(solveResult2){

                    var points2 = [];

                    if(search2.searchResults[0][0].name == 'Memorial Student Center'){
                        stopspecial1 = [];
                        stopspecial1.push(allStops[8].Longtitude);
                        stopspecial1.push(allStops[8].Latitude);
                        stopspecial1.push(allStops[8].Num);
                        stopspecial1.push(8);
                        points2.push(stopspecial1);
                    }
                    if(search2.searchResults[0][0].name == 'Reed Arena'){
                        stopspecial3 = [];
                        stopspecial3.push(allStops[7].Longtitude);
                        stopspecial3.push(allStops[7].Latitude);
                        stopspecial3.push(allStops[7].Num);
                        stopspecial3.push(7);
                        points2.push(stopspecial3);
                        stopspecial4 = [];
                        stopspecial4.push(allStops[56].Longtitude);
                        stopspecial4.push(allStops[56].Latitude);
                        stopspecial4.push(allStops[56].Num);
                        stopspecial4.push(56);
                        points2.push(stopspecial4);
                    }

                    array.forEach(solveResult2.routes, function(route2, index2){
                        //build an array of route info
                        var attr = array.map(solveResult2.directions[index2].features, function(feature){
                            return feature.attributes.text;
                        });
                        route2.setAttributes(attr);
                        destination2 = route2.attributes[0];
                        destinationArray2 = destination2.split(" ");
                        destinationId2 = destinationArray2[3];
                        stopId2 = +destinationId2;

                        stopPoint2X = params2.facilities.features[stopId2-1].geometry.x;
                        stopPoint2Y = params2.facilities.features[stopId2-1].geometry.y;
                        stopPoint2 = [];
                        stopPoint2.push(stopPoint2X);
                        stopPoint2.push(stopPoint2Y);
                        stopPoint2.push(allStops[stopId2-1].Num);
                        stopPoint2.push(stopId2-1);
                        stopPoint2.push(route2);
                        points2.push(stopPoint2);
                    });

                    var r1 = [];
                    var r2 = [];
                    var min = [];
                    var max = [];
                    for(var j = 0; j < points1.length; j++){
                        for(var k = 0; k < points2.length; k++){
                            if(points1[j][2] == points2[k][2]){
                                min[points1[j][2]] = 200;
                                max[points1[j][2]] = 0;
                            }
                        }
                    }

                    for(var j = 0; j < points1.length; j++){
                        for(var k = 0; k < points2.length; k++){
                            if(points1[j][2] == points2[k][2]){
                                if(points2[k][3] - points1[j][3] > 0 && points2[k][3] - points1[j][3] < min[points1[j][2]]){
                                    console.log("there is at least a suitable route");
                                    min[points1[j][2]] = points2[k][3] - points1[j][3];
                                    r1[points1[j][2]] = points1[j][4];
                                    r2[points1[j][2]] = points2[k][4];

                                    map.graphics.clear();
                                    removeAllLigten();
                                    addGraphics(points1[j][2]);
                                    addCurrentBuses(points1[j][2]);
                                    addStops(points1[j][2]);
                                    addPointsAndText(points1[j][2]);

                                    var p1 = new Point(points1[j][0], points1[j][1], map.spatialReference);
                                    var p2 = new Point(points2[k][0], points2[k][1], map.spatialReference);
                                    var graphic1 = new Graphic(p1, symbolStart);
                                    map.graphics.add(graphic1);
                                    var graphic2 = new Graphic(p2, symbolEnd);
                                    map.graphics.add(graphic2);
                                } else if (points2[k][3] - points1[j][3] < 0 && Math.abs(points2[k][3] - points1[j][3]) > max[points1[j][2]]){
                                    find = true;
                                    console.log("there is at least a suitable route");
                                    max[points1[j][2]] = points2[k][3] - points1[j][3];
                                    r1[points1[j][2]] = points1[j][4];
                                    r2[points1[j][2]] = points2[k][4];
                                    map.graphics.clear();
                                    removeAllLigten();
                                    addGraphics(points1[j][2]);
                                    addCurrentBuses(points1[j][2]);
                                    addStops(points1[j][2]);
                                    addPointsAndText(points1[j][2]);
                                    var p1 = new Point(points1[j][0], points1[j][1], map.spatialReference);
                                    var p2 = new Point(points2[k][0], points2[k][1], map.spatialReference);
                                    var graphic1 = new Graphic(p1, symbolStart);
                                    map.graphics.add(graphic1);
                                    var graphic2 = new Graphic(p2, symbolEnd);
                                    map.graphics.add(graphic2);
                                }
                            }
                        }
                    }

                    if ($("#text").is(':empty')) {
                        $('#text').text("There are no suitable stops because even the closest stop takes very long time to walk to.");
                    }

                }, function (err) {
                    if ($("#text").is(':empty')) {
                        $('#text').text("There are no suitable stops because even the closest stop takes very long time to walk to.");
                    }
                });


            };
        } else if (search1.searchResults == null && search2.searchResults == null) {
            $('.arcgisSearch .searchGroup .searchInput').css("border-color","red");
        } else if (search1.searchResults == null) {
            $('.arcgisSearch .searchGroup .searchInput').first().css("border-color","red");
            console.log(search1.searchResults);
            console.log(search2.searchResults);
        } else {
            $('.arcgisSearch .searchGroup .searchInput').last().css("border-color","red");
        }
    }

    //set colors for each route
    var color = [];
    color['01'] = [98, 64, 153];
    color['02'] = [234, 116, 36];
    color['03'] = [1 ,1, 1];
    color['04'] = [236, 39, 39];
    color['05'] = [94, 155, 211];
    color['06'] = [20, 178, 75];
    color['08'] = [233, 22, 139];
    color['09'] = [80, 0, 0];     //may be changed;
    color['12'] = [0, 84, 166];
    color['15'] = [40, 144, 58];
    color['22'] = [189, 26, 141];
    color['26'] = [0, 111, 59];
    color['27'] = [0, 174, 239];
    color['31'] = [102, 45, 145];
    color['34'] = [234, 116, 36];
    color['35'] = [96, 56, 19];
    color['36'] = [150, 115, 72];
    color['40'] = [255, 255, 0 ];
    color['N0104'] = [255, 0, 0];


    // draw routes
    function addGraphics(routeNum) {
        $("#text").text("Please take route " + routeNum + ", get on the bus at the red mark and get off at the green mark.");
        ligten(routeNum);
        var routeURL = "http://thehub2.tamu.edu:80/BusRoutesFeed/api/route/" + routeNum + "/pattern";
        $.ajax({
            beforeSend: function(req) {
                req.setRequestHeader("Accept", "application/json");
            },
            async: false,
            global: false,
            url: routeURL,
            dataType: "json",
            success: function (data) {
                var route27 = data;
                var symbol = new CartographicLineSymbol(
                    CartographicLineSymbol.STYLE_SOLID,
                    new Color(color[routeNum]), 5,
                    CartographicLineSymbol.CAP_ROUND,
                    CartographicLineSymbol.JOIN_MITER, 2
                );
                for (var i = 0; i < route27.length - 1; i++) {
                    var polyline = new Polyline({
                        "paths":[
                            [
                                [route27[i].Longtitude, route27[i].Latitude],
                                [route27[i + 1].Longtitude, route27[i + 1].Latitude]
                            ]
                        ],"spatialReference":{
                            "wkid":32139
                        }
                    });
                    var graphic = new esri.Graphic(polyline, symbol);
                    map.graphics.add(graphic);
                }
            }
        });
    }


    function addCurrentBuses(routeNum) {
        var busURL = "http://thehub2.tamu.edu:80/BusRoutesFeed/api/route/" + routeNum + "/buses/mentor";
        $.ajax({
            beforeSend: function(req) {
                req.setRequestHeader("Accept", "application/json");
            },
            async: false,
            global: false,
            url: busURL,
            dataType: "json",
            success: function (data) {
                console.log(data.length);

                var buses = data;
                var pictureMarkerSymbol = new PictureMarkerSymbol('http://icons.iconarchive.com/icons/fasticon/happy-bus/48/bus-green-icon.png', 45, 45);
                pictureMarkerSymbol.setColor(color[routeNum]);
                for (var i = 0; i < buses.length; i++) {

                    var pointSymbol = new esri.symbol.SimpleMarkerSymbol(); // point
                    // pointSymbol.setColor([255,0,0]);
                    var pt = new esri.geometry.Point(buses[i].GPS.Long, buses[i].GPS.Lat, map.spatialReference);
                    var attr = {"Capacity ": buses[i].APC.TotalPassenger / 100};//, "Next stops departure time": buses[i].NextStops.ScheduledDepartTime};
                    var infoTemplate = new InfoTemplate("Route " + routeNum);
                    var graphic = new esri.Graphic(pt, pictureMarkerSymbol, attr, infoTemplate);
                    map.graphics.add(graphic);

                }
            }
        });
    }


    function addStops(routeNum) {
        var stopsURL = "http://thehub2.tamu.edu:80/BusRoutesFeed/api/route/" + routeNum + "/stops";
        $.ajax({
            beforeSend: function(req) {
                req.setRequestHeader("Accept", "application/json");
            },
            async: false,
            global: false,
            url: stopsURL,
            dataType: "json",
            success: function (data) {
                var stops = data;
                for (var i = 0; i < stops.length - 1; i++) {
                    addPointsAndText(stops[i].Longtitude, stops[i].Latitude, stops[i].Name, routeNum, stops[i + 1].Name);
                }
            }
        });
    }

    function addPointsAndText(x, y, text, routeNum, nextStopName) {
        // create the points symbol
        var pointSymbol = new esri.symbol.SimpleMarkerSymbol(); // point
        pointSymbol.setColor(color[routeNum]);

        // create the TextSymbol and the corresponding text
        var font = new esri.symbol.Font();
        font.setSize(10);
        font.setWeight(esri.symbol.Font.WEIGHT_BOLD);
        var textSymbol = new esri.symbol.TextSymbol();
        textSymbol.setText(text);
        textSymbol.setColor(color[routeNum]);
        textSymbol.setFont(font);
        textSymbol.setKerning(true);

        // set points in the map
        var pt = new esri.geometry.Point(x, y, map.spatialReference);

        // construct the new graphic
        var infoTemplate = new InfoTemplate(text);
        var attr = {"The next stop is " : nextStopName};
        var graphic = new esri.Graphic(pt, pointSymbol,attr,infoTemplate);
        map.graphics.add(graphic);
    }



    $( '#results button').each(function() {
        var val = $(this).val();
        $(this).click(function(){
            if (val === 'clearRoute') {
                clearTimeTable();
            } else {
                addTimeTable(val);
            }
        });
    });

    $('#clearall').click(function () {
        clearGraphics();
        removeAllLigten();
        $("#text").empty();
        $("#hiddendiv").addClass('hidden');
    });


    $("#closeTable").click(function(){
        $("#hiddendiv").addClass('hidden');
    });

    $('#findDirections').click(function () {
        removeAllLigten();
        $("#text").empty();
            showLocation();
    });

}

function addSource(search, text, FeatureLayer) {
    var sources = search.get("sources");
    sources.push({

        featureLayer: new FeatureLayer(`${mainMapLayerUrl}/2`),
        searchFields: ["BldgAbbr","BldgName"],
        suggestionTemplate: "${BldgAbbr} ${BldgName}",
        exactMatch: false,
        name: "TexasA&M",
        outFields: ["*"],
        placeholder: text,
        maxResults: 4,
        maxSuggestions: 3,
        enableSuggestions: true,
        minCharacters: 2
    });
    search.set("sources", sources);
}
