/**
 * Created by Shalini negi on 9/24/15.
 */

define(["jsonParse", "fakeResponse"], function(jsonParse,fakeResponse)
{
    describe("jsonParse ", function()
    {
        "use strict";
        var jsonParse;
        var successString 		= fakeResponse.successResponse;
        var errorString 		= fakeResponse.errorResponse;

        beforeEach(function()
        {
            jsonParse = jsonParse;
        });

        afterEach(function()
        {
            jsonParse= null;
        });


         // test for friend id returning the json parser
        it("id is in fact 'friends ids' and b to be not null", function()
        {
            var id = "2884343461";
            var b = successString;
            expect(id).toBe(b);
            expect(b).not.toBe(null);
        });

        // test for friend id not returning the json parser
        it("id is in fact 'friends ids' and b to be not null", function()
        {
            var id = "2884343461";
            var b = errorString;
            expect(false).toBe(true);
            expect(id).toBe(errorString);
        });

});
}
