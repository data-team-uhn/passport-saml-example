#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import argparse
import requests
import defusedxml.ElementTree as ET

DEFAULT_IDP_METADATA_URL = "http://localhost:8484/auth/realms/myrealm/protocol/saml/descriptor"

argparser = argparse.ArgumentParser()
argparser.add_argument('--saml_metadata_url', help='URL for the XML metadata describing the IdP. Defaults to ' + DEFAULT_IDP_METADATA_URL, default=DEFAULT_IDP_METADATA_URL)
args = argparser.parse_args()

metadata_response = requests.get(args.saml_metadata_url)
if (metadata_response.status_code != 200):
  print("Error obtaining SAML IdP XML metadata")
  sys.exit(-1)

xml_tree = ET.fromstring(metadata_response.text)
signing_cert_node = xml_tree.find("{urn:oasis:names:tc:SAML:2.0:metadata}IDPSSODescriptor/{urn:oasis:names:tc:SAML:2.0:metadata}KeyDescriptor[@use='signing']/{http://www.w3.org/2000/09/xmldsig#}KeyInfo/{http://www.w3.org/2000/09/xmldsig#}X509Data/{http://www.w3.org/2000/09/xmldsig#}X509Certificate")

if (signing_cert_node is None):
  print("Could not find the signing certificate node")
  exit(-1)

print(signing_cert_node.text)
