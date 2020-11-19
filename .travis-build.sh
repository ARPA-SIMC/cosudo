#!/bin/bash

image=$1
if [[ $image =~ ^centos:8 ]]
then
    pkgcmd="dnf"
    builddep="dnf builddep"
    builddepopt=""
    sed -i '/^tsflags=/d' /etc/dnf/dnf.conf
    dnf update -q -y
    dnf install -q -y epel-release
    dnf install -q -y 'dnf-command(config-manager)'
    dnf config-manager --set-enabled PowerTools
    dnf groupinstall -q -y "Development Tools"
    dnf install -q -y 'dnf-command(builddep)'
    dnf install -q -y git
    dnf install -q -y rpmdevtools
    dnf install -q -y pv
    dnf copr enable -q -y simc/stable
elif [[ $image =~ ^fedora: ]]
then
    pkgcmd="dnf"
    builddep="dnf builddep"
    builddepopt=""
    sed -i '/^tsflags=/d' /etc/dnf/dnf.conf
    dnf update -q -y
    dnf install -q -y 'dnf-command(builddep)'
    dnf install --allowerasing -q -y @buildsys-build
    dnf install -q -y git
    dnf install -q -y rpmdevtools
    dnf install -q -y pv
    dnf install -q -y 'dnf-command(copr)'
    dnf copr enable -q -y simc/stable
fi

$builddep -q -y $builddepopt django-dynamic-map-borinud/django-dynamic-map-borinud.spec
python3 django-dynamic-map-borinud/load_tests.py

