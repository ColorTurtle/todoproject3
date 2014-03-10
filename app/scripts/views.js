var app = app || {};
var ENTER_KEY = 13;

$(function() {
	new app.AppView();
});

app.AppView = Backbone.View.extend({

	el: '#todoapp',

	statsTemplate: _.template($('#stats-template').html()),

	events: {
		'keypress #new-todo' 			: 'createOnEnter',
		'click #clear-completed' 	: 'clearComplete',
		'click #toggle-all' 			: 'toggleAllComplete'
	},

	initialize: function() {
		this.allCheckbox = this.$('#toggle-all')[0];
		this.$input = this.$('#new-todo');
		this.$footer = this.$('#footer');
		this.$main = this.$('#main');

		this.listenTo(app.Todos, 'add', this.addOne);
		this.listenTo(app.Todos, 'reset', this.addAll);
		thi.listenTo(app.Todos, 'change:completed', this.filterOne);
		this.listenTo(app.Todos, 'filter', this.filterAll);
		this.listenTo(app.Todos, 'all', this.render);

		app.Todos.fetch();
	},

	render: function(){
		var completed = app.Todos.completed().length;
		var remaining = app.Todos.remaining().length;

		if ( app.Todos.length ) {
			this.$main.show();
			this.$footer.show();

			this.$footer.html(this.statsTemplate({
				completed: completed,
				remaining: remaining
			}));

			this.$('#filters li a')
				.removeClass('selected')
				.filter('[href="#/' + ( app.TodoFilter || '' ) + '"]')
				.addClass('selected');
		} else {
			this.$main.hide();
			this.$footer.hide();
		}

		this.allCheckbox.checked = !remaining;
	},

	// Add a single todo item to the list by creating a view for it
	// and append to the 'ul'
	addOne: function(){
		var view = new app.TodoView({ model: todo });
		$('#todo-list').append(view.render().el );
	},

	// Add all items in the Todos collection at once.
	addAll: function(){
		this.$('#todo-list').html('');
		app.Todos.each(this.addOne, this);
	}, 

	filterOne: function(todo) {
		todo.trigger('visible');
	}, 

	filterAll: function() {
		app.Todos.each(this.filterOne, this);
	}, 

	// Generate the attributes for a new todo item.
	newAttributes: function() {
		return {
			title: this.$input.val().trim(),
			order: app.Todos.nextOrder(), 
			completed: false
		};
	},

	// If you hit return in the main input field, create new Todo model,
	// persisting it to local Storage.
	createOnEnter: function( event ) {
		if ( event.which !== ENTER_KEY || !this.$input.val().trim() ) {
			return;
		}

		app.Todos.create( this.newAttributes() );
		this.$input.val('');
	},

	// Clear all completed todo items, destroying their models.
	clearComplete: function() {
		_.invoke(app.Todos.completed(), 'destroy');
		return false;
	}, 

	toggleAllComplete: function() {
		var completed = this.allCheckbox.checked;

		app.Todos.each(function( todo ) {
			todo.save({
				'completed': completed
			});
		});
	}
});

// Todo Item View
app.TodoView = Backbone.View.extend({
	tagName: 'li',

	template: _.template( $('#item-template').html() ),

	events: {
		'dblclick label'	: 'edit',
		'keypress .edit'	: 'updateOnEnter',
		'blur .edit'			: 'close'
	},

	initialize: function() {
		this.listenTo(this.model, 'change', this.render);
	},

	render: function() {
		this.$el.html( this.template(this.model.toJSON()));
		this.$input = this.$('.edit');
		return this;
	},

	// Switch this view into '"editing"' mode, displaying the input field.
	edit: function() {
		this.$el.addClass('editing');
		this.$input.focus();
	},

	// Close the '"editing"' mode, saving changes to the todo.
	close: function(){
		var value = this.$input.val().trim();

		if ( value ) {
			this.model.save({ title: value });
		}

		this.$el.removeClass('editing');
	},

	// If you hit enter, editing is done.
	updateOnEnter: function( e ) {
		if (e.which === ENTER_KEY ) {
			this.close();
		}
	}
});