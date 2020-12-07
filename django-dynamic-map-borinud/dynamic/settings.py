from django.conf import settings
import os


def get(key, default):
    return getattr(settings, key, default)


"""url of borinud service"""
BORINUD_URL = get("BORINUD_URL", "/borinud/api/v1")

"""url of skinny wms service"""
WMS_URL = get("WMS_URL", "http://0.0.0.0/wms")

"""wms port"""
WMS_PORT = get("WMS_PORT", "5000")

"""map server url"""
MAP_SERVER_WMS_URL = get("MAP_SERVER_WMS_URL", "http://3.122.252.209/wms")

"""map server port"""
MAP_SERVER_WMS_PORT = get("MAP_SERVER_WMS_PORT", "80")

"""path of repository dir """
REPOSITORY_DIR = get("REPOSITORY_DIR", "./testgrib/")

"""url of arkiweb service"""
ARKIWEB_URL = get("ARKIWEB_URL", "https://simc.arpae.it/services/arkiweb/data")

"""credentials for arkiweb service"""
USERNAME_ARKIWEB = get("USERNAME_ARKIWEB", "")
PASSWORD_ARKIWEB = get("PASSWORD_ARKIWEB", "")

"""dballe db string"""
DBALLE_DB_DYNAMIC = get("DBALLE_DB_DYNAMIC", "sqlite://test.sqlite")
