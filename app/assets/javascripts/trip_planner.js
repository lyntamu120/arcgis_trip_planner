$(document).ready(function(){
    var map, gsvc;
    require([
        "esri/map", "esri/graphic", "esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol", "esri/Color",
        "esri/tasks/GeometryService", "esri/tasks/ProjectParameters","esri/symbols/CartographicLineSymbol",
        "esri/SpatialReference", "esri/InfoTemplate", "dojo/dom", "dojo/on","esri/geometry/Polyline",
        "dojo/domReady!"
    ], function(
        Map, Graphic, SimpleMarkerSymbol, SimpleLineSymbol, Color,
        GeometryService, ProjectParameters,CartographicLineSymbol,
        SpatialReference, InfoTemplate, dom, on, Polyline
    ) {
        map = new Map("map", {
            basemap: "streets",
            center: [-96.3364829, 30.6187199],
            zoom: 15
        });



        function routeData(rouNum) {
            var json = null;
            var routeURL = "http://transport.tamu.edu:80/BusRoutesFeed/api/route/" + rouNum + "/pattern";
            $.ajax({
                beforeSend: function(req) {
                    req.setRequestHeader("Accept", "application/json");
                    // req.setRequestHeader("Access-Control-Allow-Origin", "*");
                    // req.setRequestHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
                    // req.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
                },
                async: false,
                global: false,
                //url: "/pattern_27",
                url: routeURL,
                dataType: "json",
                success: function (data) {
                    json = data;
                }
            });
            return json;
        }



        gsvc = new GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

        on(map, "load", projectToLatLong);

        function projectToLatLong(Longtitude1, Latitude1, Longtitude2, Latitude2) {
            // map.graphics.clear();

            m_mapPoint = [];  //point array

            m_mapPoint[0] = new esri.geometry.Point(Longtitude1, Latitude1, new esri.SpatialReference({ wkid: 32139 }));
            m_mapPoint[1] = new esri.geometry.Point(Longtitude2, Latitude2, new esri.SpatialReference({ wkid: 32139 }));

            var outSR = new SpatialReference(4326);

            var params = new esri.tasks.ProjectParameters();
            // add array of points
            params.geometries = m_mapPoint;
            // Output Spatial Reference in lat/long (wkid 3857 )
            params.outSR = outSR;

            //gsvc.project(params, callback);
            return params;
        }


        function drawPolyline(params) {
            gsvc.project(params, function callback(m_mapPoint) {
                var symbol = new CartographicLineSymbol(
                    CartographicLineSymbol.STYLE_SOLID,
                    new Color([255, 0, 0]), 5,
                    CartographicLineSymbol.CAP_ROUND,
                    CartographicLineSymbol.JOIN_MITER, 2
                );
                var path = new esri.geometry.Polyline();
                path.addPath([m_mapPoint[0], m_mapPoint[1]]);
                //path.addPath([m_mapPoint[0], m_mapPoint[1],m_mapPoint[2], m_mapPoint[3], m_mapPoint[4]]);
                var graphic = new esri.Graphic(path, symbol);
                //draw the line on the map
                map.graphics.add(graphic);
            });
        }

        //draw the routes
         function drawRoutes(routeNum) {
             var mydata = routeData(routeNum);
             for (var i = 0; i < mydata.length - 1; i++) {
                 var rstparams = projectToLatLong(mydata[i].Longtitude, mydata[i].Latitude, mydata[i + 1].Longtitude, mydata[i + 1].Latitude);
                 drawPolyline(rstparams);
             }
         }

         $("#27").click(drawRoutes(26));


    });



});
