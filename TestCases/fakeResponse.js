/**
 * Created by Shalini negi on 9/24/15.
 */

define([], function() {
    "use strict";

    var fakeResponse;
    fakeResponse = {

        errorResponse: '{"response":{"type":"ERROR","errors":{"error":{"code":"300-700","message":"Could not parse the json string."}}}}',
        successResponse: '{"response":{"type":"OK","body":{"ids":{"2884343461,2425151,783214,18839785,177838676,162867260,74736540,11348282,50393960,813286,43403778"}"next_cursor":0,"next_cursor_str":0,"previous_cursor":0,"previous_cursor_str":0 }}}',

        toString:function ()
        {
            return "[object fakeResponse]";
        }
    };

    return fakeResponse;
});
