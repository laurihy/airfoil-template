/*
* Handles views and collections for dashboard-view.
* 
* Basically, dashboard shows snapshot of app, containing recent 
* request-history, build errors, files and some misc data
*
* Template is in index.html and navigation in routes.js
*
*/

App.dashboard = {}
App.dashboard.viewGen = new App.helpers.viewGen();

App.dashboard.mainView = Backbone.View.extend({
  collection: App.adminData,
    render: function(){
    $('#content').html(_.template($('#dashboard-template').html(),{model:this.collection}));
    $('#filelist').html(App.helpers.printFolders(App.helpers.parseFolders(this.collection._files)))
  }
});

App.dashboard.renderLayout = function(){
  var view = App.dashboard.viewGen('main', App.dashboard.mainView, {});
  view.render();
}