const http = require('http');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const process = require('process');
const express = require("express");
const forge = require('node-forge');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const saml = require('passport-saml');

dotenv.config();

const HTTP_PORT = process.env.HTTP_PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
const LISTEN_HOST = process.env.LISTEN_HOST || "127.0.0.1";
const USE_SSL = Boolean(process.env.USE_SSL === "true");

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const samlStrategy = new saml.Strategy({
  // URL that goes from the Identity Provider -> Service Provider
  callbackUrl: process.env.CALLBACK_URL,
  // URL that goes from the Service Provider -> Identity Provider
  entryPoint: process.env.ENTRY_POINT,
  // Usually specified as `/shibboleth` from site root
  issuer: process.env.ISSUER,
  identifierFormat: null,
  // Service Provider private key
  decryptionPvk: fs.readFileSync(__dirname + '/cert/saml/key.pem', 'utf8'),
  // Service Provider Certificate
  privateCert: fs.readFileSync(__dirname + '/cert/saml/key.pem', 'utf8'),
  // Identity Provider's public key
  cert: fs.readFileSync(__dirname + '/cert/saml/idp_cert.pem', 'utf8'),
  validateInResponseTo: false,
  disableRequestedAuthnContext: true,
  acceptedClockSkewMs: -1,
}, (profile, done) => done(null, profile));

passport.use(samlStrategy);

const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: crypto.randomBytes(64).toString('hex'),
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect('/login');
  }
}

app.get('/', ensureAuthenticated, (req, res) => {
  res.send("Authenticated as " + req.user.nameID + " by " + req.user.issuer);
});

app.get('/login', passport.authenticate('saml', { failureRedirect: '/login/fail' }), (req, res) => {
  res.redirect('/');
});

app.post('/sp/consumer', passport.authenticate('saml', { failureRedirect: '/login/fail' }), (req, res) => {
  res.redirect('/');
});

app.get('/login/fail', (req, res) => {
  res.status(401).send('Login failed');
});

//general error handler
app.use((err, req, res, next) => {
  console.log("Fatal error: " + JSON.stringify(err));
  next(err);
});

if (USE_SSL) {
  // HTTPS
  let httpsPrivateKey = fs.readFileSync(__dirname + '/cert/https/key.pem', 'utf8');
  let httpsCertificate = fs.readFileSync(__dirname + '/cert/https/cert.pem', 'utf8');
  let httpsConfig = { key: httpsPrivateKey, cert: httpsCertificate };
  let httpsServer = https.createServer(httpsConfig, app);
  httpsServer.listen(HTTPS_PORT, LISTEN_HOST, () => {
    console.log('Listening on https://%s:%d', httpsServer.address().address, httpsServer.address().port);
    // Display the SHA-256 fingerprint of the certificate
    let forgeCert = forge.pki.certificateFromPem(httpsCertificate);
    let forgeCertDer = forge.asn1.toDer(forge.pki.certificateToAsn1(forgeCert)).getBytes()
    let certSha256 = forge.md.sha256
      .create()
      .start()
      .update(forgeCertDer)
      .digest()
      .toHex()
      .match(/.{2}/g)
      .join(':')
      .toUpperCase();
    console.log('SSL Certificate SHA-256 Fingerprint: %s', certSha256);
  });
} else {
  // HTTP
  let httpServer = http.createServer(app);
  httpServer.listen(HTTP_PORT, LISTEN_HOST, () => {
    console.log('Listening on http://%s:%d', httpServer.address().address, httpServer.address().port);
  });
}
