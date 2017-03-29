$(document).ready(function(){
        var map, gsvc;
    require([
        "esri/symbols/PictureMarkerSymbol","esri/map", "esri/graphic", "esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol","esri/Color",
        "esri/tasks/GeometryService", "esri/tasks/ProjectParameters","esri/symbols/CartographicLineSymbol",
        "esri/SpatialReference", "esri/InfoTemplate", "dojo/dom", "dojo/on","esri/geometry/Polyline",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "dojo/parser",
        "dojo/domReady!"
    ], function(
        PictureMarkerSymbol,Map, Graphic, SimpleMarkerSymbol, SimpleLineSymbol, Color,
        GeometryService, ProjectParameters,CartographicLineSymbol,
        SpatialReference, InfoTemplate, dom, on, Polyline, ArcGISDynamicMapServiceLayer,
        ArcGISTiledMapServiceLayer,parser
    ) {

        parser.parse();
        map = new Map("map");
        var layer;
        layer = new ArcGISTiledMapServiceLayer("http://gis.tamu.edu/arcgis/rest/services/TS/TSbasemap021417/MapServer");
        map.addLayer(layer);


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

        // function identifyFeatures(evt){
        //     var extentGeom = pointToExtent(map,evt.mapPoint,10);
        // }

        $( 'button[type=button]').each(function() {
            $(this).click(function() {
                if($(this).val()=='clearRoute'){
                    map.graphics.clear();
                }else{
                    map.on("load", addGraphics($(this).val()));
                    map.on("load", addStops($(this).val()));
                    map.on("load", addCurrentBuses($(this).val()));
                }
            });
        });



    });

});