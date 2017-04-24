$(document).ready(function(){
    var allStops = obtainStop();
    var map, params;
    require([
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/query",
        "dojo/_base/Color",
        "dojo/_base/array",
        //"esri/Color",
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

    ], function(
        dom, domConstruct, query, Color, array, parser, registry,
        urlUtils, Map, esriLang, Graphic, InfoTemplate, GraphicsLayer, SimpleRenderer,
        Point, FeatureSet,
        ClosestFacilityTask, ClosestFacilityParameters,
        Search, screenUtils, ArcGISTiledMapServiceLayer,FeatureLayer,PictureMarkerSymbol,
        SimpleMarkerSymbol, SimpleLineSymbol, CartographicLineSymbol, Polyline, ArcGISDynamicMapServiceLayer, ArcGISTiledMapServiceLayer,
        esriConfig

    ) {
        var incidentsGraphicsLayer, routeGraphicLayer, closestFacilityTask;
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
        layer = new ArcGISTiledMapServiceLayer("http://gis.tamu.edu/arcgis/rest/services/TS/TSbasemap021417/MapServer");
        map.addLayer(layer);

        // set the search widgets
        var search1 = new Search({
            autoNavigate:false,
            sources:[],
            map: map
        }, dom.byId("search1"));

        var search2 = new Search({
            autoNavigate:false,
            sources:[],
            map: map
        }, dom.byId("search2"));


        function addSource(search, text) {
            var sources = search.get("sources");
            sources.push({
                featureLayer: new FeatureLayer("http://gis.tamu.edu/arcgis/rest/services/TS/TSbasemap021417/MapServer/0"),
                searchFields: ["GIS.FCOR.WebMapStructure.BldgAbbr"],
                suggestionTemplate: "${GIS.FCOR.WebMapStructure.BldgAbbr} ${GIS.FCOR.WebMapStructure.BldgName}",
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

        addSource(search1, "Please enter your starting point");
        search1.startup();

        addSource(search2, "Please enter your destination");
        search2.startup();

        // search1.on("select-result", showLocation);


        params1 = new ClosestFacilityParameters();
        params2 = new ClosestFacilityParameters();
        //start
        params1.impedenceAttribute= "Miles";
        params1.defaultCutoff= 6.0;
        params1.returnIncidents=false;
        params1.returnRoutes=true;
        params1.returnDirections = true;
        //end
        params2.impedenceAttribute= "Miles";
        params2.defaultCutoff= 6.0;
        params2.returnIncidents=false;
        params2.returnRoutes=true;
        params2.returnDirections=true;

        var symbol1 = new PictureMarkerSymbol({"angle":0,"xoffset":12,"yoffset":12,"type":"esriPMS","url":"http://static.arcgis.com/images/Symbols/Basic/RedFlag.png","imageData":"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","contentType":"image/png","width":34,"height":34});
        var symbol2 = new PictureMarkerSymbol({"angle":0,"xoffset":12,"yoffset":12,"type":"esriPMS","url":"http://static.arcgis.com/images/Symbols/Basic/GreenFlag.png","imageData":"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","contentType":"image/png","width":34,"height":34});
        map.on("load", function(evtObj) {
            var map = evtObj.target;
            var line = new SimpleLineSymbol();
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
            map.addLayer(incidentsGraphicsLayer);

            routeGraphicLayer = new GraphicsLayer();

            var routePolylineSymbol = new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color([89,95,35]),
                4.0
            );
            var routeRenderer = new SimpleRenderer(routePolylineSymbol);
            routeGraphicLayer.setRenderer(routeRenderer);

            map.addLayer(routeGraphicLayer);

            var facilitiesGraphicsLayer = new GraphicsLayer();
            var facilityRenderer = new SimpleRenderer(facilityPointSymbol);
            facilitiesGraphicsLayer.setRenderer(facilityRenderer);

            map.addLayer(facilitiesGraphicsLayer);



            for(var i = 0; i < allStops.length; i++){
                facilitiesGraphicsLayer.add(new Graphic(new Point(allStops[i].Longtitude,allStops[i].Latitude,map.spatialReference)));
            }


            var facilities = new FeatureSet();
            facilities.features = facilitiesGraphicsLayer.graphics;

            params1.facilities = facilities;
            params1.outSpatialReference = map.spatialReference;
            params2.facilities = facilities;
            params2.outSpatialReference = map.spatialReference;
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

        function tryicon(e) {
            map.graphics.clear();
            var point = e.result.feature.geometry;
            var symbol = new SimpleMarkerSymbol().setStyle(
                SimpleMarkerSymbol.STYLE_SQUARE).setColor(
                new Color([0,255,0,0.5])
            );
            var graphic = new Graphic(point, symbol);
            map.graphics.add(graphic);
        }

        function showLocation() {
            $('.arcgisSearch .searchGroup .searchInput').css("border-color","");
            if (search1.searchResults != null && search2.searchResults != null) {

                console.log(search1.searchResults[0][0]);
                console.log(search2.searchResults[0][0]);

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

                closestFacilityTask.solve(params1, function(solveResult1){
                    console.log(solveResult1);
                    var points1 = [];
                    array.forEach(solveResult1.routes, function(route1, index1){
                        //build an array of route info
                        //dojo array.map can create a new array
                        //solveResult1.derections[0].features is an array, each feature is a graphic object
                        var attr = array.map(solveResult1.directions[index1].features, function(feature){
                            return feature.attributes.text;
                        });
                        //var infoTemplate = new InfoTemplate("Attributes", "${*}");
                        //console.log(route);
                        //route.setInfoTemplate(infoTemplate);

                        //route1 is also a graphic object
                        route1.setAttributes(attr);

                        //find the coordi of cloest point
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
                        //routeGraphicLayer.add(route1);

                    });

                    closestFacilityTask.solve(params2, function(solveResult2){
                        var points2 = [];
                        array.forEach(solveResult2.routes, function(route2, index2){
                            //build an array of route info
                            var attr = array.map(solveResult2.directions[index2].features, function(feature){
                                return feature.attributes.text;
                            });
                            //var infoTemplate = new InfoTemplate("Attributes", "${*}");
                            //console.log(route);

                            //route.setInfoTemplate(infoTemplate);
                            route2.setAttributes(attr);
                            destination2 = route2.attributes[route2.attributes.length - 1];
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
                            //routeGraphicLayer.add(route2);
                        });
                        //  console.log(points1);
                        //  console.log(points2);
                        //  addGraphics("04");
                        var r1 = [];
                        var r2 = [];
                        var min = [];
                        for(var j = 0; j < points1.length; j++){
                            for(var k = 0; k < points2.length; k++){
                                if(points1[j][2] == points2[k][2]){
                                    min[points1[j][2]] = 200;
                                }
                            }
                        }
                        var symbolStart = new PictureMarkerSymbol({
                            "angle":0,
                            "xoffset":2,
                            "yoffset":8,
                            "type":"esriPMS",
                            "url":"http://static.arcgis.com/images/Symbols/Basic/RedShinyPin.png",
                            "imageData":"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",
                            "contentType":"image/png",
                            "width":24,
                            "height":24
                        });

                        var symbolEnd = new PictureMarkerSymbol({
                            "angle":0,
                            "xoffset":2,
                            "yoffset":8,
                            "type":"esriPMS",
                            "url":"http://static.arcgis.com/images/Symbols/Basic/GreenShinyPin.png",
                            "imageData":"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","contentType":"image/png","width":24,"height":24
                        });



                        removeAllLigten();
                        console.log(points1);
                        console.log(points2);

                        for(var j = 0; j < points1.length; j++){
                            for(var k = 0; k < points2.length; k++){
                                if(points1[j][2] == points2[k][2]){
                                    if(points2[k][3] - points1[j][3] > 0 && points2[k][3] - points1[j][3] < min[points1[j][2]]){
                                        console.log("there is at least a suitable route");
                                        min[points1[j][2]] = points2[k][3] - points1[j][3];
                                        r1[points1[j][2]] = points1[j][4];
                                        r2[points1[j][2]] = points2[k][4];

                                        map.graphics.clear();
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

                    });

                });
                // });
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
                    // var webStyleSymbol = new WebStyleSymbol({
                    //       name: "Bus",
                    //       portal: {
                    //         url: "https://www.arcgis.com"
                    //       },
                    //       styleName: "EsriIconsStyle"
                    // });
                    pictureMarkerSymbol.setColor(color[routeNum]);
                    for (var i = 0; i < buses.length; i++) {
                        console.log(buses[i].GPS.Lat);
                        console.log(buses[i].GPS.Long);

                        var pointSymbol = new esri.symbol.SimpleMarkerSymbol(); // point
                        // pointSymbol.setColor([255,0,0]);
                        var pt = new esri.geometry.Point(buses[i].GPS.Long, buses[i].GPS.Lat, map.spatialReference);
                        var graphic = new esri.Graphic(pt, pictureMarkerSymbol);
                        map.graphics.add(graphic);

                    }
                }
            });
        }
        function addGraphics(routeNum) {

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

        $('#clearall').click(clearGraphics);
        $("#closeTable").click(function(){
            $("#hiddendiv").addClass('hidden');
        });

        $('#findDirections').click(showLocation);

    });
});
