#!/bin/bash

image=$1
if [[ $image =~ ^centos:8 ]]; then
  builddep="dnf builddep"
  dnf install -q -y epel-release
  dnf install -q -y 'dnf-command(config-manager)'
  dnf config-manager --set-enabled PowerTools
  dnf install -q -y python3 python3-pip
  pip3 install -r requirements.txt
  python3 django-dynamic-map-borinud/load_tests.py
  dnf groupinstall -q -y "Development Tools"
  dnf install -q -y 'dnf-command(builddep)'
  dnf install -q -y rpmdevtools
  dnf install -q -y git
  cd django-dynamic-map-borinud/
  set +x
  spectool -g -R -S django-dynamic-map-borinud.spec
  rpmbuild -ba django-dynamic-map-borinud.spec
elif [[ $image =~ ^fedora: ]]; then
  dnf install q -y python3 python3-pip
  pip3 install -r requirements.txt
  python3 django-dynamic-map-borinud/load_tests.py
fi
