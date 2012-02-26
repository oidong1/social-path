var RedisStore, app, count, express, io, oauth, socket;

io = require('socket.io');

express = require("express");

oauth = new (require("oauth").OAuth)("https://api.twitter.com/oauth/request_token", "https://api.twitter.com/oauth/access_token", "u5NYzybIGyLNSXwi0gGISQ", "7Dbc9ywqNpsRjkBq3MM6ma9BmfRs35qPwVbOZJf0AgE", "1.0", "http://localhost:3100/auth", "HMAC-SHA1");

RedisStore = require('connect-redis')(express);

app = module.exports = express.createServer();

app.configure(function() {
  app.register('.coffee', require('coffeekup'));
  app.set("views", __dirname + "/views");
  app.set("view engine", "coffeekup");
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: "secret",
    store: new RedisStore(),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  }));
  app.use(app.router);
  return app.use(express.static(__dirname + "/public"));
});

app.configure("development", function() {
  return app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure("production", function() {
  return app.use(express.errorHandler());
});

app.dynamicHelpers({
  session: function(req, res) {
    return req.session;
  }
});

app.get("/", function(req, res) {
  return res.render('index.coffee');
});

app.get("/user/:id", function(req, res) {
  return res.render('index.coffee', {
    usr: req.params.id
  });
});

app.get("/login", function(req, res) {
  req.session.ref = req.header('Referer');
  console.log(req.header("Referer"));
  return oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
    if (error) {
      return res.send(error);
    } else {
      req.session.oauth = {};
      req.session.oauth.token = oauth_token;
      req.session.oauth.token_secret = oauth_token_secret;
      return res.redirect("https://twitter.com/oauth/authenticate?oauth_token=" + oauth_token);
    }
  });
});

app.get("/auth", function(req, res) {
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier;
    return oauth.getOAuthAccessToken(req.session.oauth.token, req.session.oauth.token_secret, req.session.oauth.verifier, function(error, oauth_access_token, oauth_access_token_secret, results) {
      if (error) {
        return res.send(error);
      } else {
        req.session.oauth.access_token = oauth_access_token;
        req.session.oauth.access_token_secret = oauth_access_token_secret;
        req.session.user_profile = results;
        return res.redirect(req.session.ref);
      }
    });
  }
});

app.get("/signout", function(req, res) {
  delete req.session.oauth;
  delete req.session.user_profile;
  return res.redirect("/");
});

app.error(function(err, res) {
  return res.send(err.message, 500);
});

app.listen(3100);

count = 0;

socket = io.listen(app);

socket.sockets.on('connection', function(client) {
  count++;
  client.broadcast.emit("count", count);
  client.on("msg", function(msg, usr) {
    console.log("sended");
    client.emit("msg", msg, usr);
    return client.broadcast.emit("msg", msg, usr);
  });
  return client.on("disconnect", function() {
    return count--;
  });
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);