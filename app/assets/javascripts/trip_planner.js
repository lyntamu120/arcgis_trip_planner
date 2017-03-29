$(document).ready(function(){
    var map, gsvc;
    require([
        "esri/map", "esri/graphic", "esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol", "esri/Color",
        "esri/tasks/GeometryService", "esri/tasks/ProjectParameters","esri/symbols/CartographicLineSymbol",
        "esri/SpatialReference", "esri/InfoTemplate", "dojo/dom", "dojo/on","esri/geometry/Polyline",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "dojo/parser",
        "dojo/domReady!"
    ], function(
        Map, Graphic, SimpleMarkerSymbol, SimpleLineSymbol, Color,
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





        function addGraphics(routeNum) {
            var routeURL = "http://thehub2.tamu.edu:80/BusRoutesFeed/api/route/" + routeNum + "/pattern";
            $.ajax({
                beforeSend: function(req) {
                    req.setRequestHeader("Accept", "application/json");
                },
                // async: false,
                // global: false,
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

        $( 'button[type=button]').each(function() {
            $(this).click(function() {
                if($(this).val()=='clearRoute'){
                    map.graphics.clear();
                }else{
                    map.on("load", addGraphics($(this).val()));
                }
            });
        });

    });

});
