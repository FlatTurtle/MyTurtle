Turtles
=======


Each turtle module represents a Backbone.Model, Backbone.Collection and Backbone.View. By passing these constructor functions to the framework, your turtle is created. The framework will breed your turtle and couple your model, collection and view. It will also create a placeholder element that will be available to your view.

Model
-----

Methods: http://documentcloud.github.com/backbone/#Model

Example:

    var Book = Backbone.Model.extend({
      defaults: {
        "author": "unknown",
        "title": "no title",
        "pages": 0
      }
    });

*A model class with default members*

Collection
----------

Methods: http://documentcloud.github.com/backbone/#Collection

Example:

    var Library = Backbone.Collection.extend({
      model: Book,
      initialize : function(models, options) {
            // fetch collection when born
            this.bind("born", this.fetch);
        },
      url : function() {
            return "http://api.yourlibrary.com";
        }
    });

*A library class that contains a number of Book objects fetched from a remote source (check the backbone documentation for more information about remote collections)*

Events:

- refresh: the frameworks requests to refresh your collection
- born: your turtle fully grown (post-constructor)
- destroy: your turtle is destroyed

View
----

Methods: http://documentcloud.github.com/backbone/#View

Example (using jQuery and jQuery.tmpl):

    var BookShelf = Backbone.View.extend({
      initialize : function() {
        // render when born (collection may be empty)
        this.bind("born", this.render);
        // render whenever the collection changes
        this.collection.bind("reset", this.render);
      },
      render: function() {
        $(this.el).html($.tmpl('<li>${author} - ${title}</li>', this.collection.toJSON()));
      }
    });

*A view class that uses jQuery.tmpl to render the collection when the turtle is born and whenever the collection is modified*

Events:

- refresh: the frameworks requests to refresh your collection
- born: your turtle fully grown (post-constructor)
- destroy: your turtle is destroyed

Registering a turtle module
---------------------------

All turtle modules are initially registered with the global Turtles object before you can start growing them. You can register a turtle like this:

    Turtles.register("books", {
      collection : Library,
      view : BookShelf,
      model : Book
    });

Once your turtle is registered you can create multiple instances by passing the turtle name and optional options:

    Turtles.grow("books", { limit : 10 });

The options are then passed to your Collection and View object on creation. Some functionality is support trough these options by our custom loader, for example:

- source: "..."
  Turtles may be located from a remote location. The script located at this url will be automatically loaded. If the source option is not passed, it will try to load the turtle's script from the turtles folder.
- group: "..."
  When you grow multiple instances of 1 turtle they will be automatically grouped and switched by a timer. If you don't want the turtle to be grouped you may specify a custom group for this turtle that prevents this.

NOTE: We override the basic grow method with our own grow method that automatically loads the turtle's javascript file and creates a placeholder (with jQuery).

