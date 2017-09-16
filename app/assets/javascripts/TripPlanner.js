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

    // urlUtils.addProxyRule({
    //   urlPrefix: "route.arcgis.com",
    //   //proxyUrl: "http://localhost/~good/PHP/proxy.php"
    //   //proxyUrl: "http://utility.arcgis.com/usrsvcs/appservices/WLVOPaOWpFFMRAs4/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World"
    //   proxyUrl: "http://utility.arcgis.com/usrsvcs/appservices/yWcaHxyNfdwJOiG2/rest/services/World/Route/NAServer/Route_World"
    // });

    //add the map
    parser.parse();
    map = new Map("map");
    var layer;
    layer = new ArcGISTiledMapServiceLayer("http://gis.tamu.edu/arcgis/rest/services/FCOR/BaseMap_081517/MapServer");
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

    var symbol1 = new PictureMarkerSymbol({"angle":0,"xoffset":12,"yoffset":12,"type":"esriPMS","url":"http://static.arcgis.com/images/Symbols/Basic/RedFlag.png","imageData":"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","contentType":"image/png","width":34,"height":34});
    var symbol2 = new PictureMarkerSymbol({"angle":0,"xoffset":12,"yoffset":12,"type":"esriPMS","url":"http://static.arcgis.com/images/Symbols/Basic/GreenFlag.png","imageData":"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","contentType":"image/png","width":34,"height":34});


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
    closestFacilityTask = new ClosestFacilityTask("http://utility.arcgis.com/usrsvcs/appservices/WLVOPaOWpFFMRAs4/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World");

    params1.defaultTargetFacilityCount = 10;
    params2.defaultTargetFacilityCount = 10;

    function clearGraphics() {
        //clear graphics
        map.graphics.clear();
        routeGraphicLayer.clear();
        incidentsGraphicsLayer.clear();
    }

    var symbolStart = new PictureMarkerSymbol({
        "angle":0,
        "xoffset":0,
        "yoffset":20,
        "type":"esriPMS",
        "url":"http://static.arcgis.com/images/Symbols/Shapes/RedPin1LargeB.png",
        "imageData":"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADImlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1MzA4NzI3NkQyN0MxMUUwQUU5NUVFMEYwMTY0NzUwNSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1MzA4NzI3N0QyN0MxMUUwQUU5NUVFMEYwMTY0NzUwNSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjUzMDg3Mjc0RDI3QzExRTBBRTk1RUUwRjAxNjQ3NTA1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjUzMDg3Mjc1RDI3QzExRTBBRTk1RUUwRjAxNjQ3NTA1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQg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",
        "contentType": "image/png",
        "width":50,
        "height":50});
    var symbolEnd = new PictureMarkerSymbol({
        "angle":0,
        "xoffset":0,
        "yoffset":20,
        "type":"esriPMS",
        "url":"http://static.arcgis.com/images/Symbols/Shapes/GreenPin1LargeB.png",
        "imageData":"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADImlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpBQTQxMkU2NEQzMUUxMUUwQUU5NUVFMEYwMTY0NzUwNSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpBQTQxMkU2NUQzMUUxMUUwQUU5NUVFMEYwMTY0NzUwNSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkFBNDEyRTYyRDMxRTExRTBBRTk1RUUwRjAxNjQ3NTA1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkFBNDEyRTYzRDMxRTExRTBBRTk1RUUwRjAxNjQ3NTA1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQg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",
        "contentType":"image/png",
        "width":50,
        "height":50});

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
    color['N_W04'] = [255, 0, 0];


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



    // function addCurrentBuses(routeNum) {
    //     var busURL = "http://thehub2.tamu.edu:80/BusRoutesFeed/api/route/" + routeNum + "/buses/mentor";
    //     $.ajax({
    //         beforeSend: function(req) {
    //             req.setRequestHeader("Accept", "application/json");
    //         },
    //         async: true,
    //         global: false,
    //         url: busURL,
    //         dataType: "json",
    //         success: function (data) {
    //
    //
    //             var buses = data;
    //             var pictureMarkerSymbol = new PictureMarkerSymbol('http://icons.iconarchive.com/icons/fasticon/happy-bus/48/bus-green-icon.png', 35, 35);
    //
    //             pictureMarkerSymbol.setColor(color[routeNum]);
    //             for (var i = 0; i < buses.length; i++) {
    //
    //                 // console.log(buses[i].NextStops);
    //
    //                 var pointSymbol = new esri.symbol.SimpleMarkerSymbol(); // point

    //                 var pt = new esri.geometry.Point(buses[i].GPS.Long, buses[i].GPS.Lat, map.spatialReference);
    //                 var attr = {"Capacity ": buses[i].APC.TotalPassenger / 100};//, "Next stops departure time": buses[i].NextStops.ScheduledDepartTime};
    //                 var infoTemplate = new InfoTemplate("Route " + routeNum);
    //                 var busGraphic = new esri.Graphic(pt, pictureMarkerSymbol, attr, infoTemplate);
    //                 map.graphics.add(busGraphic);
    //
    //             }
    //         }
    //     });
    // }

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
        // map.graphics.on("click", function(e){
        //   //get the associated node info when the graphic is clicked
        //     var node = e.graphic.getNode();
        //     console.log(node);
        // });
        // dojo.connect(map.graphics,"onClick",identifyFeatures);
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
        featureLayer: new FeatureLayer("http://gis.tamu.edu/arcgis/rest/services/FCOR/BaseMap_081517/MapServer/2"),
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
