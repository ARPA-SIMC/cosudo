from django.conf import settings


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

"""extract products with levels"""
EXTRACT_PRODUCTS = get("EXTRACT_PRODUCTS",
                       {"cosmo_2l": [{"value": "GRIB1,80,2,2", "display_value": "MSL Mean sea level pressure Pa"},
                                     {"value": "GRIB1,80,2,11", "display_value": "T Temperature K"},
                                     {"value": "GRIB1,80,2,33", "display_value": "U U-component of wind m s^-1"},
                                     {"value": "GRIB1,80,2,34", "display_value": "V V-component of wind m s^-1"},
                                     {"value": "GRIB1,80,2,51", "display_value": "Q Specific humidity kg kg^-1"},
                                     {"value": "GRIB1,80,2,52", "display_value": "R Relative humidity %"},
                                     {"value": "GRIB1,80,2,61", "display_value": "TP Total precipitation kg m^-2"},
                                     {"value": "GRIB1,80,2,71", "display_value": "TCC Total cloud cover %"},
                                     {"value": "GRIB1,80,2,73", "display_value": "LCC Low cloud cover %"},
                                     {"value": "GRIB1,80,2,74", "display_value": "MCC Medium cloud cover %"},
                                     {"value": "GRIB1,80,2,75", "display_value": "HCC High cloud cover %"},
                                     {"value": "GRIB1,80,201,22", "display_value": "GRIB1(080, 201, 022)"},
                                     {"value": "GRIB1,80,201,23", "display_value": "GRIB1(080, 201, 023)"},
                                     {"value": "GRIB1,80,2,65",
                                      "display_value": "SF Water equivalentof accumulated snow depth kg m^-2"},
                                     ],
                        "lama5": [{"value": "GRIB1,80,2,2", "display_value": "MSL Mean sea level pressure Pa"},
                                  {"value": "GRIB1,80,2,11", "display_value": "T Temperature K"},
                                  {"value": "GRIB1,80,2,33", "display_value": "U U-component of wind m s^-1"},
                                  {"value": "GRIB1,80,2,51", "display_value": "Q Specific humidity kg kg^-1"},
                                  {"value": "GRIB1,80,2,61", "display_value": "TP Total precipitation kg m^-2"},
                                  {"value": "GRIB1,80,2,71", "display_value": "TCC Total cloud cover %"},
                                  {"value": "GRIB1,80,2,73", "display_value": "LCC Low cloud cover %"},
                                  {"value": "GRIB1,80,2,74", "display_value": "MCC Medium cloud cover %"},
                                  {"value": "GRIB1,80,2,75", "display_value": "HCC High cloud cover %"},
                                  {"value": "GRIB1,200,2,111",
                                   "display_value": "None Net short-wave radiation flux (surface) W m^-2"},
                                  {"value": "GRIB1,200,2,112",
                                   "display_value": "None Net long-wave radiation flux (surface) W m^-2"},
                                  ]})
