# passport-saml-example

This node.js web application demonstrates SSO authentication provided by a SAML server (such as https://fs.uhn.ca/), using the `passport-saml` package.

Config
======

This app requires 3 files to be placed in a folder named `cert/saml`
located in the project's root directory. These files include:

- `idp_cert.pem`: The certificate  of the Identity Provider (IdP).
- `cert.pem`: Your own SAML certificate
- `key.pem`: The private key associated with your own SAML certificate.

Next, copy `.env.sample` to `.env` and edit appropriately.

Creating Private Key and Certificates
=====================================

The SP files ( `cert/saml/cert.pem`, `cert/saml/key.pem` ) can be
generated with the following command (accepting all default options):
- `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -nodes -days 900`

The IdP Certificate ( `idp_cert.pem` ) can be obtained through the
following commands.

```bash
echo "-----BEGIN CERTIFICATE-----" > cert/saml/idp_cert.pem
python3 print_idp_cert_from_url.py --saml_metadata_url https://fs.uhn.ca/FederationMetadata/2007-06/FederationMetadata.xml >> cert/saml/idp_cert.pem
echo "-----END CERTIFICATE-----" >> cert/saml/idp_cert.pem
```

Registering the Service Provider
================================

Contact ITS to register your Service Provider. During this step, the IdP Administrator downloads the metadata from the `/Shibboleth.sso/Metadata` endpoint and loads it into the IdP.

Usage
=====

```
npm install
node app.js
```

