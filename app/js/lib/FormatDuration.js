// Taken from http://js.vpro.nl/1.43/vpro/shared/domain/duration/FormatDuration.js
define(function() {
    var a = function(a, b) {
        this.duration = a || 0, this.separator = b || ":"
    };
    a.prototype = {
        getMilliseconds: function() {
            return this.duration
        },
        getMinutes: function() {
            var a = Math.floor(this.duration / 1e3),
                b = Math.floor(a / 60);
            return b
        },
        getMinutesSeconds: function() {
            var a = Math.floor(this.duration / 1e3),
                b = Math.floor(a / 60),
                c = Math.floor(a % 60);
            return b + this.separator + (c < 10 ? "0" + c : c)
        },
        getHoursMinutesSeconds: function() {
            var a = Math.floor(this.duration / 1e3),
                b = Math.floor(a / 3600),
                c = Math.floor(a % 3600 / 60),
                d = Math.floor(a % 3600 % 60),
                e = this.separator + (d < 10 ? "0" + d : d);
            c > 0 ? (e = c + e, b > 0 && (e = b + this.separator + (c < 10 ? "0" + e : e))) : e = "0" + e;
            return e
        }
    };
    return a
})