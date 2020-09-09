#!/bin/bash

image=$1
if [[ $image =~ ^centos:8 ]]; then
  dnf install -q -y epel-release
  dnf install -q -y 'dnf-command(config-manager)'
  dnf config-manager --set-enabled PowerTools
  dnf install -q -y python36u python36u-libs python36u-devel python36u-pip
  pip3 install -r requirements.txt
  python3 django-dynamic-map-borinud/load_tests.py
elif [[ $image =~ ^fedora: ]]; then
  dnf install python3
  pip install -r requirements.txt
  python django-dynamic-map-borinud/load_tests.py
fi
