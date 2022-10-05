# passport-saml-example

This node.js web application demonstrates SSO authentication provided by a SAML server (such as https://fs.uhn.ca/), using the `passport-saml` package.

Config
======

This app requires 3 files to be placed in a folder named `cert/saml`
located in the project's root directory. These files include:

- `idp_cert.pem`: The certificate  of the Identity Provider (IdP).
- `cert.pem`: Your own SAML certificate
- `key.pem`: The private key associated with your own SAML certificate.

Creating Private Key and Certificates
=====================================

Generate the SP files with the following command:
- `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -nodes -days 900`

The IdP Certificate is contained within the `ds:X509Certificate` tag.
- Copy the tag's contents into a file named `cert_idp.pem`.

Next, copy `.env.sample` to `.env` and edit appropriately. Running this app locally will likely not work since the IdP can't redirect to `localhost`.

Registering the Service Provider
================================

Contact ITS to register your Service Provider. During this step, the IdP Administrator downloads the metadata from the `/Shibboleth.sso/Metadata` endpoint and loads it into the IdP.

Usage
=====

```
npm install
node app.js
```

