#!/bin/bash

image=$1
if [[ $image =~ ^centos:8 ]]
then
    dnf install -q -y epel-release
    dnf install -q -y yum-plugin-copr
    dnf config-manager --set-enabled PowerTools
    dnf copr enable -q -y simc/stable
elif [[ $image =~ ^fedora: ]]
then
    dnf update -q -y
    dnf install -q -y dnf-plugin-copr
    dnf install -q -y 'dnf-command(copr)'
    dnf copr enable -q -y simc/stable
fi
dnf install -q -y python3
dnf install -q -y python3-requests
dnf install -q -y python3-django
dnf install -q -y python3-django-rest-framework
dnf install -q -y  dballe
python3 django-dynamic-map-borinud/load_tests.py

