/*
 * FlatTurtle
 * @author: Michiel Vancoillie
 */

 (function($) {

     var collection = Backbone.Collection.extend({
         initialize : function(models, options) {
            var self = this;
             // prevents loss of 'this' inside methods
             _.bindAll(this, "refresh", "configure", "parse");

             // bind events
             this.on("born", this.configure);
             this.on("born", this.refresh);
             this.on("refresh", this.refresh);
             this.on("reconfigure", this.configure);

             options.error = false;

             // automatic collection refresh
            setTimeout(function(){
                refreshInterval = setInterval(self.refresh, 900000);
            }, Math.round(Math.random()*5000));
         },
         configure : function() {
            // don't fetch if there is no data
            if ((this.options.primary == null || this.options.primary == "") &&
                 (this.options.secondary == null || this.options.secondary == ""))
                 return;

            this.options.primary = this.options.primary.toUpperCase();
            this.options.secondary = this.options.secondary.toUpperCase();
         },
         refresh : function() {
             // don't fetch if there is no data
             if ((this.options.primary == null || this.options.primary == "") &&
                 (this.options.secondary == null || this.options.secondary == ""))
                 return;

             var self = this;
             self.fetch({
                 error : function() {
                    // will allow the view to detect errors
                    self.options.error = true;
                    self.trigger('reset');
                 }
             });
         },
         url : function() {
             var query = "";
             if(this.options.primary)
                query = this.options.primary + "+";
             if(this.options.secondary){
                this.options.secondary = this.options.secondary.replace(/,/g, "+");
                query = query + this.options.secondary;
             }

             return "https://data.flatturtle.com/Finance/Stock/"+ encodeURIComponent(query) + ".json";
         },
         parse : function(json) {
             // parse ajax results
             var stocks = json.Stock;
             var data = new Object();
             data.primary = null;
             data.secondary = null;

             if(stocks == null){
                this.options.error = true;
                return false;
             }

             if(Array.isArray(stocks)){
                for (var i=0; i<stocks.length; i++) {
                    stocks[i].arrow = (stocks[i].change.match(/^\-/g))? "&#11015;" : (stocks[i].change == "0.00")?  "" : "&#11014;";
                    stocks[i].color = (stocks[i].change.match(/^\-/g))? "red" : (stocks[i].change == "0.00")? "white" : "green";
                    stocks[i].change = stocks[i].change.replace('+','').replace('-','');
                    stocks[i].change_percent = stocks[i].change_percent.replace('+','').replace('-','');
                }
                if(this.options.primary && this.options.primary.toLowerCase() == stocks[0].symbol.toLowerCase()){
                    data.primary = stocks[0];
                    stocks.shift()
                }
                if(stocks.length > 0 ) data.secondary = stocks;
             }


             return data;
         }
     });

     var view = Backbone.View.extend({
         initialize : function() {
             // prevents loss of 'this' inside methods
             _.bindAll(this, "render");

             // bind render to collection reset
             this.collection.on("reset", this.render);

             // pre-fetch template file and render when ready
             var self = this;
             if (this.template == null) {
                 $.get("turtles/finance/views/widget.html", function(template) {
                     self.template = template;
                     self.render();
                 });
             }
         },
         render : function() {
             // only render when template file is loaded
             if (this.template) {
                 var data = {
                    error: this.options.error,
                    data: this.collection.toJSON()
                 };

                 // add html to container
                 this.$el.empty();
                 this.$el.html(Mustache.render(this.template, data));
             }
         }
     });

     // register turtle
     Turtles.register("finance", {
         collection : collection,
         view : view
     });

 })(jQuery);