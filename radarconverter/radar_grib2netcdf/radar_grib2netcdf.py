"""
================================================================
!
! Trasforma i file grib contenenti la precipitazione cumulata
! da radar (cosi' come codificati ad ARPA-SIMC) in file netdcf.
!
!================================================================
"""
import getopt
import netCDF4
import numpy as np
import datetime
from eccodes import *
import os
import errno

# COSTANTI
date_format = "%Y-%m-%d %H:%M:%S"
date_format_filename = "%Y/%m/%d/%H/%M"
date_format_netcdf = "hour before %Y-%m-%d %H:%M:0"
GRIB_DAY_FORMAT = "%Y%m%d"
GRIB_TIME_FORMAT = "%H%M"

rmiss_netcdf = "   -0.0100000"  #  default dei netcdf
rmiss_grib = 9999


def radar_grib2netcdf(name_grib, name_nc=""):

    #  cattura errori
    if not name_grib:
        raise Exception("Manca il file di input.")

    grib_file = open(name_grib, 'rb')

    gid = codes_grib_new_from_file(grib_file)

    tempo = str(codes_get(gid, "dataDate"))
    ora = str(codes_get(gid, "dataTime"))
    while len(ora) < 4:
        ora = "0" + ora
    tempo = tempo + ora
    tempo = datetime.datetime.strptime(tempo, GRIB_DAY_FORMAT + GRIB_TIME_FORMAT)

    if name_nc is None or name_nc == "":
        name_nc = ".".join(name_grib.split("/")[-1].split(".")[:-1]) + ".nc"


    # Apertura del file netcdf
    ncid = netCDF4.Dataset(name_nc, "w", format="NETCDF4")

    ncid.createDimension("time", None)
    ncid.createDimension("lat", codes_get(gid, "Nj"))
    ncid.createDimension("lon", codes_get(gid, "Ni"))
    ncid.createDimension("geo_dim", 4)
    ncid.createDimension("mesh_dim", 2)

    v = ncid.createVariable("lon", "f4", ("lon",))
    v.long_name = "longitude"
    v.units = "degrees_east"
    v.standard_name = "longitude"
    a = codes_get(gid, 'longitudeOfFirstGridPointInDegrees')
    b = codes_get(gid, 'longitudeOfLastGridPointInDegrees')
    mesh_lon = (b - a) / (codes_get(gid, "Ni") - 1)
    v[:] = np.append(np.array(np.arange(a, b, (b - a) / (codes_get(gid, "Ni") - 1))), b)

    v = ncid.createVariable("lat", "f4", ("lat",))
    v.long_name = "latitude"
    v.units = "degrees_north"
    v.standard_name = "latitude"
    a = codes_get(gid, 'latitudeOfLastGridPointInDegrees')
    b = codes_get(gid, 'latitudeOfFirstGridPointInDegrees')
    mesh_lat = (b - a) / (codes_get(gid, "Nj") - 1)
    v[:] = np.append(np.array(np.arange(a, b, (b - a) / (codes_get(gid, "Nj") - 1))), b)

    v = ncid.createVariable("time", "f4", ("time",))
    v.long_name = "time"
    v.units = tempo.strftime(date_format_netcdf)
    v[:] = np.array([0])

    v = ncid.createVariable("idl", "S1")
    v.projection_name = "lat-lon"
    v.projection_index = "0s"
    v.grid_mapping_name = "idl-lat-lon"
    v[:] = ""

    v = ncid.createVariable("geo_dim", "f4", ("geo_dim",))
    v.long_name = "Geo limits [yLL,xLL,yUR,xUR]"
    v.units = "degrees"
    v[:] = np.array(
        [codes_get(gid, 'latitudeOfLastGridPointInDegrees'),
         codes_get(gid, 'longitudeOfFirstGridPointInDegrees'),
         codes_get(gid, 'latitudeOfFirstGridPointInDegrees'),
         codes_get(gid, 'longitudeOfLastGridPointInDegrees')]
    )

    v = ncid.createVariable("mesh_dim", "f4", ("mesh_dim",))
    v.long_name = "Grid Mesh Size [X_mesh_size, Y_mesh_size]"
    v.units = "degrees"
    v[:] = np.array([mesh_lon, mesh_lat])

    v = ncid.createVariable("cum_pr_mm", "f4", ("time", "lat", "lon",))
    v.long_name = "Radar Precipitation amount"
    v.units = "mm"
    v.standard_name = "precipitation_amount"
    v.valid_min = 0.0
    v.valid_max = 10000.0
    v.coordinates = "lat lon"
    v.detection_minimum = "      0.00000"
    v.undetectable = "      0.00000"
    v.var_missing = rmiss_netcdf
    v.accum_time_h = 1.0
    # Necessario convertire in arraymultidim, uso il numero di valori della lon(Ni) e poi inverto sul primo asse
    data = np.array(codes_get_values(gid))
    data = np.where(data != codes_get(gid, "missingValue"), data, rmiss_netcdf)  # replace missingvalue
    v[:] = np.array([np.flip(np.reshape(data, (-1, codes_get(gid, "Ni"))), 0)])

    # ATTIBUTI GLOBALI
    ncid.Conventions = "CF-1.4"
    ncid.history = "Created by radar_grib2netcdf"
    ncid.institute = "ARPA ER - SIMC "
    ncid.title = "Radar product"
    ncid.reference = "palberoni@arpa.emr.it"
    ncid.comment = "none"
    ncid.MapType = "SRT"
    ncid.RADARS_NAME = " spc gat"

    ncid.close()

    codes_release(gid)
    grib_file.close()

    print("OK")


def main():
    argv = sys.argv[1:]
    inputfile = None
    outputfile = None
    try:
        opts, args = getopt.getopt(argv, "i:o:h", ["ifile=", "ofile=", "help"])
    except getopt.GetoptError:
        print('Error: "radar_grib2netcdf.py -h" for help')
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print('radar_grib2netcdf.py: convert radar grib1 or grib2 to netcdf')
            print('Input:')
            print('\t-h\thelp')
            print('\t-i\t<path:inputfile> (required)')
            print('\t-o\t<path:outputfile> (optional)')
            print('Ouput')
            print('\tNetcdf file')
            sys.exit()
        elif opt in ("-i", "--ifile"):
            inputfile = arg
        elif opt in ("-o", "--ofile"):
            outputfile = arg
        else:
            print(str(opt) + " not exist, \"radar_grib2netcdf.py -h\" for help")
            print('Error parameter: "radar_grib2netcdf.py -h" for help')
            sys.exit(2)
    radar_grib2netcdf(inputfile, outputfile)


if __name__ == '__main__':
    # Map command line arguments to function arguments.
    main()
