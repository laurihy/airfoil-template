App.metrics = {}
App.metrics.viewGen = new App.helpers.viewGen();

App.metrics.parseDataByVariant = function(rawdata){
  var variants = {}
  _.each(rawdata, function(period){
    var periodData = App.metrics.periodToVariantBased(period,['visited','completed'])
    _.each(_.keys(periodData), function(variant){
      variants[variant] = variants[variant] || []
      periodData[variant]['_created'] = period['_created']
      variants[variant].push(periodData[variant])
    })
  })
  return variants
}

App.metrics.periodToVariantBased = function(period, events){
  // from server we get {event: {a: 0, b: 0}, event2: {...}}
  // convert this to {a: {event: 0, event2: 0}, b: {..}}
  var ret = {}
  _.each(_.keys(period), function(event){
    if(events.indexOf(event)>=0){
      _.each(_.keys(period[event]), function(variant){
        ret[variant] = ret[variant] || {}
        ret[variant][event] = period[event][variant]
      })  
    }
  })
  return ret
}

App.metrics.combineHistoryAndCurrent = function(){
  ret = App.metrics.parsedHistory
  _.each(_.keys(App.metrics.parsedCurrent), function(key){
    ret[key].push(App.metrics.parsedCurrent[key])
  })
  return ret;
}

App.metrics.sum = function(data, events){
  ret = {}
  _.each(data, function(datapoint){
    _.each(_.keys(datapoint), function(key){
      if(events.indexOf(key)>=0){
        ret[key] = ret[key] || 0
        ret[key] += datapoint[key]
      }
    })
  })
  return ret
}

App.metrics.conversionBoxView = Backbone.View.extend({
  template: $('#conversionbox-template').html(),
  initialize: function(options){
    this.data = options.data
    this.variant = options.variant
  },

  render: function(ticks){
    if(ticks===undefined){
      ticks = 30
    }

    this.$el.html(_.template(this.template, 
      {'variant': this.variant,
        'data': this.sumData(ticks)}
    )).el

    return this;
  },

  sumData: function(ticks){
    //min = Math.max(0, this.data.length-ticks)
    //filtered = this.data.slice(min, this.data.length)
    sum = App.metrics.sum(this.data,['visited','completed'])
    sum['conversion'] = 0
    if(sum['visited']!=0){
      sum['conversion'] = parseFloat(sum['completed'])/parseFloat(sum['visited'])
    }
    return sum
  }



})

App.metrics.conversionView = Backbone.View.extend({
  template: $('#conversion-template').html(),
  initialize: function(options){
    this.data = options.data;
    this.currentdata = options.currentdata;
  },

  render: function(){
    this.$el.html(_.template(this.template)).el
    this.renderSubviews()
    return this
  },

  renderSubviews: function(ticks){

    this.$el.find('#holder').html();
    var self = this;
    _.each(_.keys(this.data), function(variant){
      var holder = $('<div style="float: left;  margin: 5px; width: 225px; height: 205px;">');
      var view = App.metrics.viewGen(variant, App.metrics.conversionBoxView, { 
        data: self.data[variant],
        variant: variant
      })
      holder.html(view.render(ticks).el)
      self.$el.find('#holder').append(holder)
    });

  }
})

App.metrics.chartView = Backbone.View.extend({
  template: $('#chart-template').html(),
  initialize: function(options){
    this.data = options.data
  },
  
  render: function(){
    this.$el.html(_.template(this.template)).el
    return this;
  },

  formatGraphData: function(){
    var ret = []
    var self = this;
    _.each(_.keys(this.data), function(key){
      var entry = {}
      entry['name'] = key
      entry['data'] = _.map(self.data[key], function(data){
        var date = (data['_created']===undefined) ? new Date() : new Date(data['_created'])
        var time = Math.floor(date.getTime()/1000)
        if(data['_created'])
/*
        y = 0
        if(data['visited']!==0){
          y = data['completed'] / data['visited'] * 100;
        }*/
        y = Math.random()*100
        return {
          'y': y,
          'x': time
        }
      })
      ret.push(entry)
    })
    return ret
  },

  renderChart: function(){
    
    var seriesData = [ [], [], [] ];
    var random = new Rickshaw.Fixtures.RandomData(150);

    for (var i = 0; i < 150; i++) {
      random.addData(seriesData);
    }

    // instantiate our graph!
    var data = this.formatGraphData();
    console.log(data)

    var graph = new Rickshaw.Graph( {
      element: document.getElementById("chart"),
      width: 940,
      height: 500,
      renderer: 'line',
      series: data
    } );

    graph.render();
    
    var hoverDetail = new Rickshaw.Graph.HoverDetail( {
      graph: graph
    } );

    var axes = new Rickshaw.Graph.Axis.Time( {
      graph: graph
    } );

    axes.render()
  }
})

App.metrics.mainview = Backbone.View.extend({
  template: $('#metrics-main-template').html(),
  el: '#content',
  initialize: function(options){
    this.conversionView = options.conversionView;
    this.chartView = options.chartView;
  },
  render: function(){
    this.$el.html(_.template(this.template))
    this.$el.find('#conversion-holder').html(this.conversionView.render().el);
    this.$el.find('#chart-holder').html(this.chartView.render().el);

    this.chartView.renderChart()
  }
})


App.metrics.renderLayout = function(){

  App.metrics.parsedHistory = App.metrics.parsedHistory || App.metrics.parseDataByVariant(App.rawDataHistory)
  App.metrics.parsedCurrent = App.metrics.parsedCurrent || App.metrics.periodToVariantBased(App.rawDataCurrent, ['visited','completed'])
  App.metrics.parsedData = App.metrics.parsedData || App.metrics.combineHistoryAndCurrent();

  var conversions = App.metrics.viewGen('conversion', App.metrics.conversionView, {
    data: App.metrics.parsedData
  })
  var chart = App.metrics.viewGen('chart', App.metrics.chartView, {
    data: App.metrics.parsedHistory
  })

	var view = App.metrics.viewGen('main', App.metrics.mainview, { 
    conversionView: conversions,
    chartView: chart
  });
  view.render();
}