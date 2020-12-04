import unittest
from os import listdir, path, remove
from os.path import isfile, join
import filecmp
import netCDF4
import numpy as np

from radarconverter.radar_grib2netcdf.radar_grib2netcdf import radar_grib2netcdf
from radarconverter.radar_netcdf2grib.radar_netcdf2grib import radar_netcdf2grib

path_grib1 = "dataset/grib1/"
path_grib2 = "dataset/grib2/"
path_netcdf = "dataset/netcdf/"
path_temps = "dataset/temps/"


def clear_dir(dir_name):
    """
    Delete all file ins pecified dir
    """
    print("CLEANING DIR {} ...".format(dir_name))
    for f in listdir(dir_name):
            if isfile(join(dir_name, f)):
                remove(join(dir_name, f))
    print("CLEAN DIR {} DONE".format(dir_name))


def read_netcdf_data(name_nc):
    # Apertura del file netcdf
    ncid = netCDF4.Dataset(name_nc)
    for k in ncid.variables.keys():
        if k == 'cum_pr_mm':  # Estraggo gli attributi del campo di pioggia
            varid_pr = ncid.variables['cum_pr_mm']
            temp = [varid_pr[:]][0]
            temp = np.array(temp)
            cum_pr_mm = temp[0]
        if k == 'lat':
            varid_pr = ncid.variables['lat']
            temp = [varid_pr[:]][0]
            temp = np.array(temp)
            lats = temp[0]
        if k == 'lon':
            varid_pr = ncid.variables['lon']
            temp = [varid_pr[:]][0]
            temp = np.array(temp)
            lons = temp[0]

    return lats, lons, cum_pr_mm


class TestMethods(unittest.TestCase):
    """
    Insert
    """

    def test_convertion_grib1(self):
        print("TEST GRIB1")
        same_file = True
        files = [f for f in listdir(path_grib1) if isfile(join(path_grib1, f))]
        for f in files:
            grib_filename_orig = path_grib1 + path.basename(f)
            grib_filename_new = path_temps + path.basename(f)
            nc_filename = path_temps + path.basename(f).replace("grib1", "nc")
            radar_grib2netcdf(grib_filename_orig, nc_filename)
            radar_netcdf2grib(nc_filename, grib_filename_new, 1)
            if not filecmp.cmp(grib_filename_orig, grib_filename_new):
                same_file = False
                print("Errore su file: {}".format(grib_filename_orig))
        self.assertTrue(same_file)

        clear_dir(path_temps)

    '''
    def test_convertion_grib2(self):
        print("TEST GRIB2")
        same_file = True
        files = [f for f in listdir(path_grib2) if isfile(join(path_grib2, f))]
        for f in files:
            grib_filename_orig = path_grib2 + path.basename(f)
            grib_filename_new = path_temps + path.basename(f)
            nc_filename = path_temps + path.basename(f).replace("grib2", "nc")
            radar_grib2netcdf(grib_filename_orig, nc_filename)
            radar_netcdf2grib(nc_filename, grib_filename_new, 2)
            if not filecmp.cmp(grib_filename_orig, grib_filename_new):
                same_file = False
                print("Errore su file: {}".format(grib_filename_orig))
        self.assertTrue(same_file)

        clear_dir(path_temps)
    '''
    def test_convertion_netcdf(self):
        print("TEST NETCDF")
        same_file = True
        files = [f for f in listdir(path_netcdf) if isfile(join(path_netcdf, f))]
        for f in files:
            nc_filename_orig = path_netcdf + path.basename(f)
            nc_filename_new = path_temps + path.basename(f)
            grib_filename = path_temps + path.basename(f).replace("nc", "grib1")
            radar_netcdf2grib(nc_filename_orig, grib_filename, 1)
            radar_grib2netcdf(grib_filename, nc_filename_new)
            if not filecmp.cmp(nc_filename_orig, nc_filename_new):
                lats_new, lons_new, cum_pr_mm_new = read_netcdf_data(nc_filename_new)
                lats_orig, lons_orig, cum_pr_mm_orig = read_netcdf_data(nc_filename_orig)
                error_max_lat = np.max(np.abs(lats_new - lats_orig))
                error_max_lon = np.max(np.abs(lons_new - lons_orig))
                error_max_cum_pr_mm = np.max(np.abs(cum_pr_mm_new - cum_pr_mm_orig))
                error_max = error_max_lat
                if error_max < error_max_lon:
                    error_max = error_max_lon
                if error_max < error_max_cum_pr_mm:
                    error_max = error_max_cum_pr_mm

                if error_max >= 0.005:
                    print("errore massmo {}".format(str(error_max)))
                    same_file = False
                    print("Errore su file: {}".format(nc_filename_orig))
        self.assertTrue(same_file)

        clear_dir(path_temps)



if __name__ == '__main__':
    unittest.main()
