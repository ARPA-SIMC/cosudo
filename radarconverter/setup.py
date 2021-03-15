from setuptools import setup

setup(
    name='radar_converter',
    version='0.1.2',
    packages=['radar_grib2netcdf', 'radar_netcdf2grib'],
    install_requires=[
        'attrs==20.3.0',
        'cffi==1.14.3',
        'cftime==1.3.0',
        'eccodes==1.0.0',
        'netCDF4==1.5.4',
        'numpy==1.19.4',
        'pycparser==2.20'
        ],
    url='',
    license='GNU GPL v2',
    author='',
    author_email='',
    description='Convert radar netcdf to grib1/2 and grib1/2 to netcdf',
    entry_points={
        'console_scripts': [
            'radar_grib2netcdf=radar_grib2netcdf.radar_grib2netcdf:main',
            'radar_netcdf2grib=radar_netcdf2grib.radar_netcdf2grib:main'
        ]
    }
)
