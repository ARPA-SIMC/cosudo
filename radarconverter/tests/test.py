import unittest
from os import listdir, path, remove
from os.path import isfile, join
import filecmp

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


class TestMethods(unittest.TestCase):

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
                same_file = False
                print("Errore su file: {}".format(nc_filename_orig))
        self.assertTrue(same_file)

        clear_dir(path_temps)
    '''


if __name__ == '__main__':
    unittest.main()
