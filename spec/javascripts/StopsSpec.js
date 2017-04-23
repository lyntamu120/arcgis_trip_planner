describe("A suite is just a function", function() {
    var a;

    it("and so is a spec", function() {
        a = true;

        expect(a).toBe(true);
    });
});

describe("If I use obtainSingleStop function", function () {
    var stop27 = obtainSingleStop("27");
    var length = stop27.length;

    it("I should obtain the JSON form of route 27",function () {
        expect(length).toBeGreaterThan(1);
    });
});

describe("If I use obtainStop function", function () {
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