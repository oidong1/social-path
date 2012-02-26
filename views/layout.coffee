doctype 5
html lang:'ja',->
  head ->
    title 'Social-Path'
    meta charset: 'utf-8'
    link rel:'stylesheet', href:'/stylesheets/style.css'
    link rel:'stylesheet', href:'/stylesheets/bootstrap.min.css'
    script src: 'http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.min.js'
    script src: '/javascripts/arbor.js'
    script src: '/javascripts/main.js'
    script src:'/socket.io/socket.io.js'
  body ->
    header class:'navbar navbar-fixed-top',->
      div class:'navbar-inner',->
        div class:'container',->
          a class:'brand', href:'../',->
            text 'Social-Path'
          div class:'nav-collapse',->
            ul class:'nav',->
              li ->
                a class:"swatch-link",href:"http://localhost:3100/login",->
                text "SignIn"

    div class:'container', ->
      @body
