
    function addTimeTable (routeNum) {

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd='0'+dd
        }

        if(mm<10) {
            mm='0'+mm
        }

        today = mm+'/'+dd+'/'+yyyy;

        drawTimeTable(today, routeNum);
    }

    function drawTimeTable(today, routeNum) {
        var tableURL = "http://thehub2.tamu.edu:80/BusRoutesFeed/api/Route/" + routeNum + "/TimeTable";
        $.ajax({
            beforeSend:
                function(req) {
                    req.setRequestHeader("Accept", "application/json");
                },
            url: tableURL,
            dataType: "json",
            success: function (data) {
                populateDataintoRows(data, today, routeNum);
            }
        });
    }

    function populateDataintoRows(data, today, routeNum) {

        //the name of stops of this route (not the name but a string contains the name)
        clearTimeTable();

        $("#TableDate").text(today);
        $("#routeNum").text("Route" + routeNum);
        var keys = Object.keys(data[0]);
        var l = keys.length;
        var header = '';

        //extract the names
        for (var k = 0; k < l; k++) {
            for (var m = 0; m < keys[k].length; m++) {
                if (keys[k].charAt(m) <= 'Z' && keys[k].charAt(m) >= 'A') {
                    break;
                }
            }
            header = header + '<th>' + keys[k].substring(m) + '</th>';
        }

        //add table header
        $('#TimeTableGrid').append('<tr>' + header + '</tr>');
        //add table row of data
        console.log(data.length);
        for (var i = 0; i < data.length; i++) {
            var terminate = l - 1;
            while(data[i][keys[terminate]] == null){
                terminate--;
            }
            if(!compareTime(data[i][keys[terminate]])){
                continue;
            }
            var td = '';
            if (data[i][keys[0]] === null) {
                data[i][keys[0]] = '&nbsp;';
            }
            for (var j = 0; j < l; j++) {
                console.log("here?");
                td = td + '<td>' + data[i][keys[j]] + '</td>';
            }
            $("#TimeTableGrid tr:last").after('<tr>' + td + '</tr>');
        }
        $("#hiddendiv").removeClass('hidden');
    }

    function compareTime(s){
        var d = new Date();
        var hCurrent = d.getHours()%12;
        var mCurrent = d.getMinutes();
        var ampmCurrent = d.getHours() >= 12 ? 'PM' : 'AM';

        var hBus = +(s.substring(0, 2))%12;
        var mBus = +(s.substring(3, 5));
        var ampmBus = s.substring(s.length-2, s.length);
        if(ampmBus < ampmCurrent){
            return false;
        }
        if(ampmBus > ampmCurrent){
            return true;
        }
        if(hBus > hCurrent){
            return true;
        }else return hBus == hCurrent&&mBus >= mCurrent;
    }


    function ligten(btnnum) {
        var id = '#' + btnnum;
        $(id).addClass('btn-success');
    }

    function removeligten(btnnum) {
        var id = '#' + btnnum;
        $(id).removeClass('btn-success');
    }

    function removeAllLigten() {
        for (var i = 1; i <= 9; i++) {
            var btnnum = '0' + i;
            removeligten(btnnum);
        }
        removeligten('N_W04');
    }

    function clearTimeTable() {
        $("#TimeTableGrid tr").remove();
        $("caption").remove();
        $("#hiddendiv").addClass('hidden');
    }




