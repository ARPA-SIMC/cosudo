Installation
==================================
django-dynamic-map-borinud can be installed on CentOS (8) and Fedora (>= 30).
django-dynamic-map-borinud is available in copr repository.
To install run the following commands in a terminal::

    dnf copr enable simc/stable
    dnf copr enable pat1/rmap
    dnf copr enable simc/cosudo
    dnf install python3-django-dynamic-map-borinud


Configuration
==================================
django-dynamic-map-borinud is a reusable django application, so the app needs a django project to run.
After setting up, your django project, edit your `settings.py` file to include `'dynamic'` and `'rest_framework'` in the `INSTALLED_APPS`
listing::


    INSTALLED_APPS = [
        ...
        'rest_framework',
        'dynamic',
    ]

Edit your `settings.py` file to add borinud web service path (the standard path is "/borinud/api/v1")::


    BORINUD_URL = "..."
    
Edit your `settings.py` file to add the wms service path (the standard path is  "http://0.0.0.0:5000/wms")::


    WMS_URL = "..."

Edit your `settings.py` file to add the repository directory path (the standard path is  "/testgrib")::


    REPOSITORY_DIR = "..."
    
Edit your `settings.py` file to add the credentials for arkiweb and the url for arkiweb (standard is 'https://simc.arpae.it/services/arkiweb/data')::


    USERNAME_ARKIWEB = "..."
    PASSWORD_ARKIWEB = "..."
    ARKIWEB_URL = "..." 

Edit your project `urls.py` file to import the URLs::


    url_patterns = [
        ...

        path('dynamic/', include('dynamic.urls')),
    ]

Add "dynamic.can_extract" permission to the accounts that can download the gribs from the extract-page.

Add the following configuration for django-rest-framework ::

    REST_FRAMEWORK = {
        'DEFAULT_PERMISSION_CLASSES': (
            'rest_framework.permissions.IsAuthenticated',
        ),
        'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
        'PAGE_SIZE': 15
        }
