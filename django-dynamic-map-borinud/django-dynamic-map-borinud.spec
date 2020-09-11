%define name cosudo
%define version $TRAVIS_TAG
%define unmangled_version $TRAVIS_TAG
%define release 1

Summary: This app shows borinud data on a dynamic map
Name: %{name}
Version: %{version}
Release: %{release}
Source0: https://github.com/arpa-simc/cosudo/archive/v%{version}.tar.gz
License: MIT
Group: Development/Libraries
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-buildroot
Prefix: %{_prefix}
BuildArch: noarch
Vendor: UNKNOWN <UNKNOWN>
Url: https://github.com/ARPA-SIMC/cosudo
Requires: python3
BuildRequires:  python3-devel
BuildRequires:  python3-setuptools
%description
cosudo
==========================

Introduction
---------------

This app shows the borinud data, on a dynamic map.

Edit your `settings.py` file to include `'dynamic'` in the `INSTALLED_APPS`
listing.

.. code-block:: python

    INSTALLED_APPS = [
        ...

        'dynamic',
    ]

Edit your `settings.py` file to add borinud web service path (the standard path is "/borinud/api/v1").

.. code-block:: python

    BORINUD_URL = "..."


Edit your project `urls.py` file to import the URLs:


.. code-block:: python

    url_patterns = [
        ...

        path('dynamic/', include('dynamic.urls')),
    ]




%prep
%setup -n %{name}-%{unmangled_version} -n %{name}-%{unmangled_version}

%build
python3 django-dynamic-map-borinud/setup.py build

%install
ls
python3 django-dynamic-map-borinud/setup.py install --single-version-externally-managed -O1 --root=$RPM_BUILD_ROOT --record=INSTALLED_FILES



%files -f INSTALLED_FILES
%defattr(-,root,root)