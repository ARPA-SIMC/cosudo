%define python3_vers python3
%define version 1.0.8
Name: django-dynamic-map-borinud
Version: %{version}
Release: 1
Summary: This app shows borinud data on a dynamic map

License: BSD 3-Clause
Url: https://github.com/ARPA-SIMC/cosudo
Source0: https://github.com/arpa-simc/cosudo/archive/v%{version}.tar.gz

Requires: python3
BuildRequires:  python3-devel
BuildRequires:  python3-setuptools
BuildArch:      noarch
%description
django-dynamic-map-borinud
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

Edit your `settings.py` file to add the wms service path (the standard path is  "http://0.0.0.0:5000/wms").

.. code-block:: python

    WMS_URL = "..."


Edit your project `urls.py` file to import the URLs:


.. code-block:: python

    url_patterns = [
        ...

        path('dynamic/', include('dynamic.urls')),
    ]


%package   -n %{python3_vers}-django-dynamic-map-borinud
Summary: This app shows borinud data on a dynamic map

%description -n %{python3_vers}-django-dynamic-map-borinud
%{python3_vers}-django-dynamic-map-borinud
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

Edit your `settings.py` file to add the wms service path (the standard path is  "http://0.0.0.0:5000/wms").

.. code-block:: python

    WMS_URL = "..."


Edit your project `urls.py` file to import the URLs:


.. code-block:: python

    url_patterns = [
        ...

        path('dynamic/', include('dynamic.urls')),
    ]



%prep
%autosetup -n cosudo-%{version}
cd django-dynamic-map-borinud


%build
cd django-dynamic-map-borinud
%py3_build

%install
cd django-dynamic-map-borinud
%py3_install

%files -n %{python3_vers}-django-dynamic-map-borinud
%{python3_sitelib}/*