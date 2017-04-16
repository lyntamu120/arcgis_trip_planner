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
        esriConfig.defaults.io.corsDetection = false;
        // urlUtils.addProxyRule({
        //   urlPrefix: "route.arcgis.com",
        //   proxyUrl: "http://localhost/~good/PHP/proxy.php"
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
        params1.defaultCutoff= 10.0;
        params1.returnIncidents=false;
        params1.returnRoutes=true;
        params1.returnDirections = true;
        //end
        params2.impedenceAttribute= "Miles";
        params2.defaultCutoff= 10.0;
        params2.returnIncidents=false;
        params2.returnRoutes=true;
        params2.returnDirections=true;

        //params.travelMode="Walking";
        var symbol1 = new PictureMarkerSymbol({
            "angle":0,
            "xoffset":0,
            "yoffset":12,
            "type":"esriPMS",
            "url":"http://static.arcgis.com/images/Symbols/Basic/RedStickpin.png",
            "imageData": "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",
            "contentType":"image/png",
            "width":34,
            "height":34
        });

        var symbol2 = new PictureMarkerSymbol({
            "angle":0,
            "xoffset":0,
            "yoffset":12,
            "type":"esriPMS",
            "url":"http://static.arcgis.com/images/Symbols/Basic/GreenStickpin.png",
            "imageData":"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",
            "contentType":"image/png",
            "width":34,
            "height":34
        });

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

        closestFacilityTask = new ClosestFacilityTask("https://route.arcgis.com/arcgis/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World");


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

                        for(var j = 0; j < points1.length; j++){
                            for(var k = 0; k < points2.length; k++){
                                if(points1[j][2] == points2[k][2]){
                                    if(points2[k][3] - points1[j][3] > 0 && points2[k][3] - points1[j][3] < min[points1[j][2]]){
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
            } else {
                console.log(search1.searchResults);
                console.log(search2.searchResults);
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
