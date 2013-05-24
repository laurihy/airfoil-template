// Bunch of helper functions for the admin app

App.helpers = {}

App.helpers.isJSON = function(str){
  try{
    JSON.parse(str)
  } catch(e){
    return 'Make sure you entered valid JSON, <a href="http://jsonlint.com/">www.jsonlint.com</a>';
  }
  return '';
}

App.helpers.notEmpty = function(str){
  if(str==''){
    return "Can't be empty";
  }
  return '';
}

App.helpers.notInList = function(list, str){
  ret = function(str){
    if(list.indexOf(str)>=0){
      return "Already exists";
    } else {
      return '';
    }
  }
  return ret;
}

App.helpers.isAlphaNumeric = function(str){
  if(!(/^[a-zA-Z0-9]+$/.test(str))){
    return 'Must be alphanumeric';
  } else {
    return '';
  }
}

App.helpers.filterFunctions = {
    "equal": {
      "sym":"is",
      "func": function(a,b){ return a==b; }
    },
    "isnot": {
      "sym":"is not",
      "func": function(a,b){ return a!=b; }
    },
   /* "lt": {
      "sym":"<",
      "func": function(a,b){ return a<b; }
    },
    "gt": {
      "sym":">",
      "func": function(a,b){return a>b; }
    },*/
    "contains": {
      "sym":"contains",
      "func": function(a,b){ return a.indexOf(b)>=0; }
    },
    "notcontain": {
      "sym":"not contain",
      "func": function(a,b){ return a.indexOf(b)<0; }
    }
}

App.helpers.toggleNav = function(selector){
  $('#mainnav .active').removeClass('active');
  $(selector).addClass('active');
}

App.helpers.serializeForm = function(form){
  ret = {}
  _.each($(form+' :input'), function(item){
    name = $(item).attr('name');
    if(name!=undefined){
      v = $(item).attr('type') == 'checkbox' ? $(item).is(':checked') : $(item).val();
      ret[name] = v;
    }
  })
  return ret;
}


App.helpers.formValidator = function(form){
  this.form = form;
  this.hasErrors = false;
  var self = this;

  this.clientValidate = function(rules){
    self.hasErrors = false;
    _.each(rules, function(rule){
      field = $(self.form+' [name="'+rule['field']+'"]')
      value = field.val();
      error = rule['func'](value);
      if(error!=''){
        self.setError(field, error);
      }
    });
  },

  this.serverValidate = function(errors){
    _.each(Object.keys(errors), function(key){
      field = $(self.form+' [name="'+key+'"]');
      msg = errors[key].join(', ');
      self.setError(field, msg);
    });
  },

  this.clearErrors = function(){
    this.hasErrors = false;
    $(form+' .control-group').removeClass('error')
    $(form+' .control-group label.control-label').html('')
  }

  this.setError = function(field, msg){
    group = field.closest('.control-group');
    group.find('.control-label').append(msg+' ');
    group.addClass('error');
    self.hasErrors = true;
  }

  return this;
}

App.helpers.checkLogin = function(login, success){
  if(!App.current_user || App.current_user._groups.indexOf('administrators')<0){
    login();
  } else {
    success();
  }
}

App.helpers.viewGen = function(){
  var views = {};
  ret = function(key, func, args){
    if(views.hasOwnProperty(key)){
      views[key].close();
    }
    var v = new func(args);
    views[key] = v;
    return v;
  }
  return ret;
}

Backbone.View.prototype.close = function() {
  $(this.el).unbind();
}

App.helpers.parseFolders = function(filelist, beginning){
  beginning = beginning || ''
  ret = {}
  _.each(filelist, function(file){
    var parts = file.split('/')
    path = ret  
    for(i=0;i<parts.length;i++){
      path[parts[i]] = path[parts[i]] || {}
      path = path[parts[i]]
    }
  });
  return ret
}

// Recursively goes through app's folder structure
// TODO: get rid of this and move to template
App.helpers.printFolders = function(folders){
  var ret = $('<ul>');
  _.each(Object.keys(folders), function(item){
    var cur = $('<li>');
    var filecount = Object.keys(folders[item]).length
    //var ext = item.split('.')[1]
    //ext = ext || '' // if no file extension
    if(filecount>0){
      //ext = 'folder'
      var elementid = item+Math.random().toString().replace('.','') // hack to avoid clashes in names
      cur.append('<a data-toggle="collapse" data-target="#'+elementid+'">'+item+' /</a>');
      subfolder = App.helpers.printFolders(folders[item]);
      subfolder.addClass('subfolder collapse').attr('id', elementid);
      cur.append(subfolder);
    } else {
      cur.append(item);
    }
    //cur.prepend(App.helpers.getExtensionIcon(ext))
    ret.append(cur);
  });
  return ret  
}

App.helpers.getExtensionIcon = function(str){
  str = str.toLowerCase()
  cls = ''
  if(str=='folder'){
    cls='icon-folder-close'
  } else if(['png','jpg','jpeg', 'gif'].indexOf(str)>=0){
    cls = 'icon-picture'
  } else {
    cls = 'icon-file'
  }
  return '<i class="'+cls+'" style="opacity: 0.6; margin-right: 8px"></i>'
}
