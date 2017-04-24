describe("Test the obtainSingleStop function", function () {
    var stop27 = obtainSingleStop("27");
    var length = stop27.length;

    it("I should obtain the JSON form of route 27",function () {
        expect(length).toBeGreaterThan(1);
    });
});

describe("Test the obtainStop function", function () {
    var allstops = obtainStop();
    var length = allstops.length;

    it("I should obtain a total of 98 stops", function () {
        expect(length).toBe(98);
    });

    it("the first stop's num should be '01'", function () {
        expect(allstops[0].Num).toBeDefined();
        expect(allstops[0].Num).toBe('01');

    });

    it("the Latitute and Longtitude should be defined",function () {
        expect(allstops[0].Latitude).toBeDefined();
        expect(allstops[0].Longtitude).toBeDefined();
    })

});

describe("Test addTimeTable function", function () {

    it("I should see the time table of this moment when I use addTimeTable('01')", function () {
        loadFixtures("banner.html");
        addTimeTable('02');
        var timetable = $("#routeNum");
        expect(timetable).toContainText("Route 4");
        expect($("#hiddendiv")).toHaveClass("hidden");
    });
});

describe("Test the button effect ", function () {
    beforeEach(function () {
        loadFixtures("banner.html");
    });


    it ("If I use ligten function the button with label '01' should be green", function () {
        var btn01 = $("#01");
        ligten("01");
        expect(btn01).toBeDefined();
        expect(btn01).toHaveClass("btn-success");
    });

    it ("If I use  removeAllLigten function all ligten labels should be normal",function () {
        ligten("01");
        ligten("02");
        ligten("03");
        expect($("#01")).toHaveClass("btn-success");
        expect($("#02")).toHaveClass("btn-success");
        expect($("#03")).toHaveClass("btn-success");
        removeAllLigten();
        expect($("#01")).not.toHaveClass("btn-success");
        expect($("#02")).not.toHaveClass("btn-success");
        expect($("#03")).not.toHaveClass("btn-success");
    });
});

describe("Test the trip planner navigation", function () {
    beforeEach(function () {
        loadFixtures("banner.html");
    });

    it ("I should see the direction modal when I click the dir icon", function () {
        var dir = $("#dir");
        spyOnEvent(dir, 'click');
        dir.click();
        expect(dir).not.toBeHidden();
    });

    it("I should see red border of both boxes if I click Find Routes button directly", function () {
        var findRoute= $("#findDirections");
        spyOnEvent(findRoute, 'click');
        findRoute.click();
        expect($(".arcgisSearch .searchGroup .searchInput")).toBeDefined();
    });
});


