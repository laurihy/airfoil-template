/*
* Backlift analytics
*/

(function(){  

  $('.signupform').submit(function(e){
    var form = $(e.target)

    if(!form.attr('data-send')!==undefined){
        e.preventDefault()
        
        if(form.attr('action')!==undefined){
            from.attr('data-send','true')
            form.submit()
        } else {
            $.post('/backlift/data/signups', form.serialize(), function(){
                form.html('<p style="margin: 20px 0; color: #27AE60; font-size: 1.2em">Thanks!</p>')
            })
        }

    }
  });


})($)