var app = app || {};

app.Todo = Backbone.Model.extend({

	defaults: {
		title: '',
		completed: false
	},

	toggle: function(){
		this.save({
			completed: !this.get('completed')
		});
	}

});

// Filter list by all todo items that are completed
var TodoList = Backbone.Collection.extend({
	model: app.Todo,

	completed: function() {
		return this.filter(function( todo ) {
			return todo.get('completed');
		});
	},

// Filter list by all todo items that are NOT completed
	remaining: function() {
		return this.without.apply(this, this.completed());
	}, 

	// 
	nextOrder: function(){
		if ( !this.length ) {
			return 1;
		}
		return this.last().get('order') + 1;
	},

	comparator: function( todo ) {
		return todo.get('order');
	}
});

app.Todos = new TodoList();