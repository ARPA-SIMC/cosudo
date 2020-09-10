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
  dnf install -q -y pv
  cd django-dynamic-map-borinud/
  $builddep -q -y django-dynamic-map-borinud.spec
  mkdir -p /rpmbuild/{BUILD,BUILDROOT,RPMS,SOURCES,SPECS,SRPMS}
  cp django-dynamic-map-borinud.spec /rpmbuild/SPECS/
  spectool -g -R -S /rpmbuild/SPECS/django-dynamic-map-borinud.spec
  set +x
  rpmbuild -ba /rpmbuild/SPECS/django-dynamic-map-borinud.spec 2>&1 | pv -q -L 3k
elif [[ $image =~ ^fedora: ]]; then
  dnf install q -y python3 python3-pip
  pip3 install -r requirements.txt
  python3 django-dynamic-map-borinud/load_tests.py
fi
