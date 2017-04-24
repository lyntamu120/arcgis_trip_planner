describe("button effect", function () {
    loadFixtures("banner.html");
    ligten("01");

    it ("the button with label '01' should be green", function () {
        var btn01 = $("#01");
        expect(btn01).toHaveClass("btn");
    });

});

