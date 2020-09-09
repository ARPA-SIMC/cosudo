#!/bin/bash
dnf update -y
dnf install -y python36u python36u-libs python36u-devel python36u-pip
python django-dynamic-map-borinud/load_tests.py


