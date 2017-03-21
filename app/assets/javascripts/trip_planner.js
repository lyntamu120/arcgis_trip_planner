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


        function routeData(rouNum) {
            var json = null;
            var routeURL = "http://thehub2.tamu.edu:80/BusRoutesFeed/api/route/" + rouNum + "/pattern";
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

        //, "on(mapload", projectToLatLong);
        on(map,"load", drawRoutes);

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


        function drawPolyline(params, routeNum) {
            gsvc.project(params, function callback(m_mapPoint) {
                var symbol = new CartographicLineSymbol(
                    CartographicLineSymbol.STYLE_SOLID,
                    new Color(color[routeNum]), 5,
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
                 var rstparams = projectToLatLong(mydata[i].Longtitude, mydata[i].Latitude, mydata[i + 1].Longtitude, mydata[i + 1].Latitude)
                 drawPolyline(rstparams, routeNum);
             }
         }

        //code for check box
        /*$('input[type=checkbox]').each(function() {
            $(this).change(function() {
            if($(this).is(":checked")) {
                drawRoutes($(this).val());
            }else{
                map.graphics.clear();
            }
            });
        });*/

        $( 'button[type=button]' ).each(function() {
            $(this).click(function() {
                if($(this).val()=='clearRoute'){
                    map.graphics.clear();
                }else{
                    drawRoutes($(this).val());
                }
            });
        });



    });



});
