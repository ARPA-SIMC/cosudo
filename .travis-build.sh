#!/bin/bash

image=$1
if [[ $image =~ ^centos:8 ]]; then
  dnf install -q -y epel-release
  dnf install -q -y python
  dnf install -q -y python-pip

elif [[ $image =~ ^fedora: ]]; then
  dnf install python3
fi
pip3 install -r requirements.txt
python3 django-dynamic-map-borinud/load_tests.py
