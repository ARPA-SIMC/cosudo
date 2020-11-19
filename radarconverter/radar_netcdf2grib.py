"""
================================================================
!
! Trasforma i file netdcf contenenti la precipitazione cumulata
! da radar (cosi' come codificati ad ARPA-SIMC) in file GRIB1 o GRIB2.
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
GRIB_DAY_FORMAT = "%Y%m%d"
GRIB_TIME_FORMAT = "%H%M"

rmiss = -0.0100000  # lo imposto uguale al valore rmiss di default dei netcdf
imiss = 255

tipo = 'regular_ll'  # string
component_flag = 0  # int CONSTANT


def radar_netcdf2grib(name_nc, fileout=None, grib_output_type=2):

    #  cattura errori
    if not name_nc:
        raise Exception("Manca il file di input.")

    #correzione eventuaale parametro errato
    if grib_output_type != 1:
        grib_output_type = 2

    # Apertura del file netcdf
    ncid = netCDF4.Dataset(name_nc)

    # Estraggo le dimensioni delle variabili immagazzinate
    dim_lon = ncid.dimensions['lon'].size
    dim_lat = ncid.dimensions['lat'].size

    # Estraggo l'istante di emissione del dato
    time = ncid.variables['time'].units

    '''
    Time e' definito come "hour before AAAA-MM-GG hh:mm:0"
    Nelle vecchie cumulate potrebbe esserci scritto "hours"
    invece di "hour", "since" invece "before". Per ovviare
    al problema divido la stringa in 4 sottostringhe.
    In questo modo la data e' nella sottostringa 3 e l'ora
    nella sottostringa 4
    '''

    # Controllo che l'unita' di cumulazione non siano i minuti.
    if time[0:7] == 'minutes':
        raise Exception("Le cumulate in minuti non sono ancora gestite, esco")
    elif time[0:4] == 'hour':
        dum = time.split(" ")
        date = datetime.datetime.strptime("{} {}".format(dum[-2], dum[-1]), date_format)

    # Estraggo le variabili necessarie al grib
    for k in ncid.variables.keys():
        if k == 'cum_pr_mm':  # Estraggo gli attributi del campo di pioggia
            varid_pr = ncid.variables['cum_pr_mm']
            cum_pr_mm = [varid_pr[:]][0]
            pr_units = varid_pr.units
            acc_t = varid_pr.accum_time_h
            '''
            Verifico che l'unita' di misura sia 'mm':
            Per una qualche ragione non chiara c'è un carattere nullo nella lettura
            di pr_units che non viene eliminato dalla funzione TRIM. Elimino il
            problema con un trucco
            '''
            if pr_units.strip() != 'mm':
                raise Exception("L'unita' di misura non e' mm, esco")
            if acc_t == 0:
                print("Accumulation time (acc_t) not defined! Default= 1.0 hour")
                acc_t = 1.0
            # Sostituisco il valor mancante con rmiss
            cum_pr_mm = np.array(cum_pr_mm)
            #cum_pr_mm = np.where(cum_pr_mm >= 0.0, cum_pr_mm, rmiss)
            cum_pr_mm = cum_pr_mm[0]

        elif k == 'geo_dim':
            varid_geo = ncid.variables['geo_dim']
            geo_lim = [varid_geo[:]][0]
        elif k == 'mesh_dim':
            varid_mesh = ncid.variables['mesh_dim']
            mesh_xy = [varid_mesh[:]][0]

    '''
    ==============================================================================
    SCRITTURA DEL GRIB
    ==============================================================================
    '''
    if fileout is None:
        fileout = "datasets/radar_SRT_{}h.grib{}".format(date.strftime(date_format_filename),  str(grib_output_type))

    print("Output file={}".format(fileout))

    if "/" in fileout:
        if not os.path.exists(os.path.dirname(fileout)):
            try:
                os.makedirs(os.path.dirname(fileout))
            except OSError as exc:  # Guard against race condition
                if exc.errno != errno.EEXIST:
                    raise

    fout = open(fileout, 'wb')

    # Definizione della griglia e del formato del grib  1 o 2
    gaid_template = codes_grib_new_from_samples("regular_ll_sfc_grib{}".format(str(grib_output_type)))

    # Data di emissione
    date_time = date

    # Setto i parametri del grib
    key_map_grib = {
        'generatingProcessIdentifier': 1,
        # 'centre': 80,
        'missingValue': rmiss,
        'packingType': 'grid_simple',
        'bitmapPresent': 1,

        'resolutionAndComponentFlags': 0,  # resolutionAndComponentFlags

        'topLevel': 0,  # l1
        'bottomLevel': imiss,  # l2
        # Variabile precipitazione
        'centre': 200,
        # istante di emissione del dato
        'dataDate': int(date_time.strftime(GRIB_DAY_FORMAT)),
        'dataTime': int(date_time.strftime(GRIB_TIME_FORMAT)),
        }

    # correzioni chiavi diverse tra grib1  e grib2
    if grib_output_type == 1:
        # Timerange
        key_map_grib['timeRangeIndicator'] = 4 #non dovrebbe essere 13?
        key_map_grib['P1'] = 0
        key_map_grib['P2'] = acc_t
        key_map_grib['indicatorOfUnitOfTimeRange'] = 1

        # Variabile precipitazione
        key_map_grib['gribTablesVersionNo'] = 2  # category
        key_map_grib['indicatorOfParameter'] = 61  # number

        # parametri copiati a mano
        key_map_grib['level'] = 0
        key_map_grib['iDirectionIncrement'] = "MISSING"
        key_map_grib['jDirectionIncrement'] = "MISSING"

    else:
        # Timerange
        key_map_grib['indicatorOfUnitOfTimeRange'] = 1
        key_map_grib['forecastTime'] = 0

        # Variabile precipitazione
        key_map_grib['parameterCategory'] = 1  # category
        key_map_grib['parameterNumber'] = 52  # number
        key_map_grib['discipline'] = 0  # discipline

        # parametri copiati a mano
        key_map_grib['shapeOfTheEarth'] = 1  # shapeOfTheEarth
        key_map_grib['scaleFactorOfRadiusOfSphericalEarth'] = 2  # scaleFactorOfRadiusOfSphericalEarth
        key_map_grib['scaledValueOfRadiusOfSphericalEarth'] = 637099700  # scaledValueOfRadiusOfSphericalEarth
        key_map_grib['iDirectionIncrement'] = "MISSING"  # iDirectionIncrement
        key_map_grib['jDirectionIncrement'] = "MISSING"  # jDirectionIncrement

        key_map_grib['productDefinitionTemplateNumber'] = 8
        key_map_grib['typeOfFirstFixedSurface'] = 1

        key_map_grib['scaleFactorOfFirstFixedSurface'] = 0
        key_map_grib['scaledValueOfFirstFixedSurface'] = 0

        key_map_grib['scaledValueOfFirstFixedSurface'] = 0
        key_map_grib['typeOfStatisticalProcessing'] = 1
        key_map_grib['typeOfTimeIncrement'] = 1
        key_map_grib['lengthOfTimeRange'] = 1

    codes_set_key_vals(gaid_template, key_map_grib)

    codes_set_key_vals(gaid_template, {
            'typeOfGrid': tipo,
            'Ni': dim_lon,  # nx
            'Nj': dim_lat,  # ny
            'longitudeOfFirstGridPointInDegrees': geo_lim[1],  # xmin (loFirst)
            'longitudeOfLastGridPointInDegrees': geo_lim[3],  # xmax (loLast)
            'latitudeOfFirstGridPointInDegrees': geo_lim[2],  # ymin (laFirst)
            'latitudeOfLastGridPointInDegrees': geo_lim[0],  # ymax (laLast)
            'uvRelativeToGrid': component_flag,  # component_flag
        })

    cum_pr_mm = np.flip(cum_pr_mm, 0)
    codes_set_values(gaid_template, cum_pr_mm.flatten())

    codes_write(gaid_template, fout)
    codes_release(gaid_template)
    fout.close()

    #Chiusura file netcdf
    ncid.close()

    print("OK")

'''
#radar_netcdf2grib("datasets/comp-ACRR_202003260000_001H.nc", grib_output_type=1)
radar_netcdf2grib("/home/fabio/PycharmProjects/skinnywms-master/skinnywms/testdata/comp-ACRR_202003260015_001H.nc",
                  fileout="/home/fabio/PycharmProjects/skinnywms-master/skinnywms/testdata/comp-ACRR_202003260015_001H.grib1", grib_output_type=1)
                  
'''


def check_param(argv):
    inputfile = None
    outputfile = None
    grib_version = None
    try:
        opts, args = getopt.getopt(argv, "i:o:v:h", ["ifile=", "ofile=", "grib_version=", "help"])
    except getopt.GetoptError:
        print('Error: "radar_netcdf2grib.py -h" for help')
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print('radar_netcdf2grib.py: convert radar netcdf to grib1 or grib2')
            print('Input:')
            print('\t-h\thelp')
            print('\t-i\t<path:inputfile> (required)')
            print('\t-o\t<path:outputfile> (optional)')
            print('\t-v\t<int:grib_version> (optional, default=2)')
            print('Ouput')
            print('\tGrib file')
            sys.exit()
        elif opt in ("-i", "--ifile"):
            inputfile = arg
        elif opt in ("-o", "--ofile"):
            outputfile = arg
        elif opt in ("-v", "--grib_version"):
            grib_version = int(arg)
        else:
            print(str(opt) + " not exist, \"radar_netcdf2grib.py -h\" for help")
            print('Error parameter: "radar_netcdf2grib.py -h" for help')
            sys.exit(2)
    return inputfile, outputfile, grib_version


if __name__ == '__main__':
    # Map command line arguments to function arguments.
    param = check_param(sys.argv[1:])
    radar_netcdf2grib(param[0], param[1], param[2])