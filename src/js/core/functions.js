/*
 * FlatTurtle
 * Helper functions
 *
 * @author: Jens Segers (jens@irail.be)
 * @author: Michiel Vancoillie (michiel@irail.be)
 * @license: AGPLv3
 */

/*
 * Set a default timeout of 15 seconds for all ajax requests
 */
$.ajaxSetup({
    timeout: 15000
});

/*
 * Sort elements in a parent container by data-order attribute
 */
function sort(items, attribute) {
    if (attribute == null)
        attribute = 'data-order';

    var parent = items.parent();
    var list = items.get();

    // sort by data-order attribute
    list.sort(function(a, b) {
        // both are plain javascript objects now
        if (a.getAttribute(attribute) == b.getAttribute(attribute))
            return 0;
        return a.getAttribute(attribute) < b.getAttribute(attribute) ? -1 : 1;
    });

    $.each(list, function(idx, itm) { parent.append(itm); });
}

/*
 * A friendly time format function
 *
 * {Y} - 4 digit year
 * {m} - month with leading zero
 * {d} - day with leading zero
 * {H} - hours with leading zero
 * {h} - hours without leading zero
 * {M} - minutes with leading zero
 * {i} - minutes without leading zero
 * {S} - seconds with leading zero
 */
Date.prototype.format = function(format) {

    var date = this;

    // 4 digit year
    format = format.replace('{Y}', function() {
        return date.getFullYear();
    });

    // month with leading zero
    format = format.replace('{m}', function() {
        var month = date.getMonth() + 1;
        return (month < 10 ? "0" : "") + month;
    });

    // day with leading zero
    format = format.replace('{d}', function() {
        var day = date.getDate();
        return (day < 10 ? "0" : "") + day;
    });

    // hours with leading zero
    format = format.replace('{H}', function() {
        var hours = date.getHours();
        return (hours < 10 ? "0" : "") + hours;
    });

    // hours without leading zero
    format = format.replace('{h}', function() {
        return date.getHours();
    });

    // minutes with leading zero
    format = format.replace('{M}', function() {
        var minutes = date.getMinutes();
        return (minutes < 10 ? "0" : "") + minutes;
    });

    // minutes without leading zero
    format = format.replace('{i}', function() {
        return date.getMinutes();
    });

    // seconds with leading zero
    format = format.replace('{S}', function() {
        var seconds = date.getSeconds();
        return (seconds < 10 ? "0" : "") + seconds;
    });

    return format;
}

// Roman digit regepx
var detectRomanNumber = new RegExp('^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$');

/*
 * Capitalize every word of a string
 */
String.prototype.capitalize = function() {
    return this.replace(/(\w)(\w*)/g, function(g0,g1,g2){
        // Filter roman numbers
        if(g2.match(detectRomanNumber)){
            g2 = g2.toUpperCase();
        }else{
            g2 = g2.toLowerCase();
        }

        return g1.toUpperCase() + g2;
    });
}

/*
 * Add a number of hours to a date
 */
Date.prototype.addHours= function(h){
    this.addMinutes(h*60);
    return this;
}

/*
 * Add a number of minutes to a date
 */
Date.prototype.addMinutes= function(m){
    this.setMinutes(this.getMinutes()+m);
    return this;
}

/*
 * Format time in hours:minutes
 */
function formatTime(time){
    var hours = Math.floor(time/60);
    var minutes = Math.floor(time%60);
    if(hours == 0 && minutes == 0){
        time = "< 1m";
    }if(hours == 0 && minutes > 0){
        time = minutes + "m";
    }else if(time < 0){
        time = false;
    }else{
        if(hours< 10) hours = '0' + hours;
        if(minutes< 10) minutes = '0' + minutes;
        time = hours + 'h' + minutes;
    }

    return time;
}

/*
 * Hash a string
 */
 String.prototype.hashCode = function(){
     var hash = 0, i, character;
     if (this.length == 0) return hash;
     for (i = 0; i < this.length; i++) {
         character = this.charCodeAt(i);
         hash = ((hash<<5)-hash)+character;
         hash = hash & hash; // Convert to 32bit integer
     }
     return hash;
 };

 /*
  * Fix timezone bug (daylight savings)
  */
 Date.prototype.stdTimezoneOffset = function() {
     var jan = new Date(this.getFullYear(), 0, 1);
     var jul = new Date(this.getFullYear(), 6, 1);
     return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
 }