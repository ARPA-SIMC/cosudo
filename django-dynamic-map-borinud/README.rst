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


