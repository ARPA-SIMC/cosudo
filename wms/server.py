# (C) Copyright 2012-2019 ECMWF.
#
# This software is licensed under the terms of the Apache Licence Version 2.0
# which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
# In applying this licence, ECMWF does not waive the privileges and immunities
# granted to it by virtue of its status as an intergovernmental organisation nor
# does it submit to any jurisdiction.

import logging
import os
import tempfile
import Magics.macro as magics
import threading

import errors, protocol, datatypes

from flask import send_file

LOG = logging.getLogger(__name__)


def revert_bbox(bbox):
    minx, miny, maxx, maxy = bbox
    return [miny, minx, maxy, maxx]


bounding_box = {"1.3.0_EPSG:4326": revert_bbox}

_CRSS = {crs["name"]: datatypes.CRS(**crs) for crs in magics.wmscrs()["crss"]}

MAGICS_OUTPUT_TYPES = {
    "image/png": "png",
}

LOCK = threading.Lock()


class TmpFile:
    def __init__(self):
        self.fname = None

    def target(self, ext):
        fd, self.fname = tempfile.mkstemp(
            prefix="wms-server-", suffix=".{}".format(ext)
        )
        os.close(fd)

        # Change output plot file permissions to something more reasonable, so
        # we are at least able to read the produced plots if directed outside
        # the docker environment (through the use of --volume).
        os.chmod(self.fname, 0o644)
        return self.fname

    def content(self):
        with open(self.fname, "rb") as f:
            return f.read()

    def cleanup(self):
        LOG.debug("Deleting %s" % self.fname)
        os.unlink(self.fname)


class NoCaching:
    def create_output(self):
        return TmpFile()


class WMSServer:
    def __init__(self, caching=NoCaching()):

        self.caching = caching

        # For objects to store context
        self.stash = {}

    def process(self, request, Response, render_template, reraise=False, output=None):

        url = request.url.split("?")[0]

        LOG.info(request.url)

        params, _ = protocol.filter_wms_params(request.args)

        service_orig = params.setdefault("service", "wms")
        service = service_orig.lower()

        version = params.setdefault("version", "1.3.0")

        req_orig = params.setdefault("request", "getcapabilities")
        req = req_orig.lower()

        if output is None:
            output = self.caching.create_output()

        try:
            LOG.info(req)
            if service != "wms":
                raise errors.ServiceNotDefined(service_orig)

            if version not in protocol.SUPPORTED_VERSIONS:
                raise Exception("Unsupported WMS version {}".format(version))

            if req == "getcapabilities":
                variables = {
                    "service": {"title": "WMS", "url": url, },
                    #"crss": self.plotter.supported_crss,
                    #"geographic_bounding_box": self.plotter.geographic_bounding_box,
                    #"layers": layers,
                }

                content_type = "text/xml"
                content = render_template("capabilities_{}.xml".format(version), **variables)

            elif req == "getmap":

                with LOCK:
                    params = protocol.get_wms_parameters(req, version, params)
                    params["_macro"] = request.args.get("_macro", False)
                    params["output"] = output

                    for k in ("request", "service"):
                        try:
                            del params[k]
                        except KeyError:
                            pass
                    if version == "1.1.1":
                        srs = params.pop("srs")
                        params["crs"] = srs

                    return generate_layer(params)

            elif req == "getlegendgraphic":
                with LOCK:
                    params = protocol.get_wms_parameters(req, version, params)

                    params["output"] = output

                    for k in ("request", "service"):
                        try:
                            del params[k]
                        except KeyError:
                            pass

                    return generate_legend(**params)

            else:
                raise errors.OperationNotSupported(req_orig)
        except errors.WMSError as exc:
            if reraise:
                raise
            LOG.exception("%s(): Error: %s", req, exc)
            content_type = exc.content_type(version)
            content = exc.body(version)

        except Exception as exc:
            if reraise:
                raise

            LOG.exception("%s(): Error: %s", req, exc)
            exc = errors.wrap(exc)
            content_type = exc.content_type(version)
            content = exc.body(version)

        return Response(content, mimetype=content_type)


def generate_layer(params):
    output = params["output"]
    selected_layer = params['layers'][0]

    output_fname = output.target("png")
    path, _ = os.path.splitext(output_fname)

    name = 'magics'
    # Setting of the output file name
    output_o = magics.output(output_formats=['png'],
                             output_name_first_page_number="off",
                             output_name=path,
                             output_cairo_transparent_background="on"
                             )

    min_x, min_y, max_x, max_y = params['bbox']
    width = params['width']
    height = params['height']
    # Magics is talking in cm.
    width_cm = width / 40.0
    height_cm = height / 40.0
    magics.silent()

    coordinates_system = {"EPSG:4326": "latlon"}

    crs = params["crs"]
    if crs.startswith("EPSG:32661:"):
        crs_name = "polar_north"
        lon_vertical = float(crs.split(":")[2])
    elif crs.startswith("EPSG:32761:"):
        crs_name = "polar_south"
        lon_vertical = float(crs.split(":")[2])
    elif crs == "EPSG:32761":
        crs_name = "EPSG:32761"
    else:
        try:
            crs = _CRSS[crs]
            crs_name = crs.name
        except KeyError:
            raise ValueError("Unsupported CRS '{}'".format(crs))

    try:
        magics_format = params['format']
    except KeyError:
        magics_format = "image/png"

    map_params = {
        "subpage_map_projection": crs_name,
        "subpage_lower_left_latitude": min_y,
        "subpage_lower_left_longitude": min_x,
        "subpage_upper_right_latitude": max_y,
        "subpage_upper_right_longitude": max_x,
        "subpage_coordinates_system": coordinates_system.get(
            crs_name, "projection"
        ),
        "subpage_frame": "off",
        "page_x_length": width_cm,
        "page_y_length": height_cm,
        "super_page_x_length": width_cm,
        "super_page_y_length": height_cm,
        "subpage_x_length": width_cm,
        "subpage_y_length": height_cm,
        "subpage_x_position": 0.0,
        "subpage_y_position": 0.0,
        "output_width": width,
        "page_frame": "off",
        "skinny_mode": "on",
        "page_id_line": "off"
    }

    # add extra settings for polar stereographic projection when
    # vertical longitude is not 0
    if crs_name in ["polar_north", "polar_south"]:
        map_params["subpage_map_vertical_longitude"] = lon_vertical

    if crs_name in ["polar_north"]:
        map_params["subpage_map_true_scale_north"] = 90

    if crs_name in ["polar_south"]:
        map_params["subpage_map_true_scale_south"] = -90

    # Setting the geographical area
    projection = magics.mmap(**map_params)

    if selected_layer == "foreground":

        # Defining the coastlines
        black_background = magics.mcoast(
            map_coastline_sea_shade="on",
            map_coastline_land_shade_colour="black",
            map_grid="on",
            map_grid_line_style="dash",
            map_grid_colour="white",
            map_coastline_land_shade="on",
            map_coastline_sea_shade_colour="rgb(0.15,0.15,0.15)",
            map_label="on",
            map_coastline_colour="tan")

        # Load the grib data
        wind_from_grib = magics.mgrib(
            grib_input_file_name='testdata/uv200.grib',
            grib_wind_position_1=1,
            grib_wind_position_2=2)

        # Defining Wind plotting
        coloured_wind = magics.mwind(
            wind_field_type='arrows',
            wind_arrow_unit_velocity=25.0,
            wind_arrow_min_speed=10.0,
            wind_thinning_factor=3.,
            wind_advanced_method='on',
            wind_advanced_colour_selection_type='interval',
            wind_advanced_colour_level_interval=10.0,
            wind_advanced_colour_reference_level=20.0,
            wind_advanced_colour_max_value=100.0,
            wind_advanced_colour_min_value=20.0,
            wind_advanced_colour_table_colour_method='calculate',
            wind_advanced_colour_direction='clockwise',
            wind_advanced_colour_min_level_colour='turquoise',
            wind_advanced_colour_max_level_colour='purple_red')

        magics.plot(output_o, projection, black_background, wind_from_grib, coloured_wind)

    else:

        # Loading GRIB file
        grib_data = magics.mgrib(grib_input_file_name="testdata/total_precipitation.grib")

        coast_params = {}
        contour_params2 = {}
        contour_params = {}
        if selected_layer == '10fg':
            grib_data = magics.mgrib(grib_input_file_name="testdata/data.grib")
            coast_params = {
                "map_coastline_sea_shade_colour": "#8fcdf4",
                "map_grid": "off",
                "map_coastline_sea_shade": "on",
                "map_label": "off",
                "map_coastline_colour": "#f2f2f2",
                "map_coastline_resolution": "medium",
            }
        elif selected_layer == 'background':
            coast_params = {
                "map_coastline_general_style": "background",
                "map_coastline_resolution": "medium"
            }
        elif selected_layer == 'kx':
            contour_params = {
                "contour_automatic_setting": "style_name",
                "contour_style_name": "sh_blured_f0t300",
                'contour': 'off',
                'contour_hilo': 'off',
            }
            contour_params2 = {
                "contour_automatic_setting": "style_name",
                "contour_style_name": "sh_all_f5t70lst",
                'contour': 'off',
                'contour_hilo': 'off',
            }
        elif selected_layer == 'mx2t':
            contour_params = {
                "contour_automatic_setting": "style_name",
                "contour_style_name": "sh_all_f5t70lst",
            }
            grib_data = magics.mgrib(grib_input_file_name="testdata/vorticity.grib")
        else:
            contour_params = {
                'contour': 'off',
                'contour_hilo': 'off',
                'contour_interval': 2.0,
                'contour_label': 'off',
                'contour_level_selection_type': 'interval',
                'contour_shade': 'on',
                'contour_shade_palette_name': 'eccharts_rainbow_purple_red_25',
                'contour_shade_colour_method': 'palette',
                'contour_shade_max_level': 22.0,
                'contour_shade_method': 'area_fill',
                'contour_shade_min_level': -28.0,
                'legend': 'on'
            }

        coast = magics.mcoast(coast_params)

        contour = magics.mcont(contour_params)


        # Plotting
        if contour_params2 != {}:
            magics.plot(output_o, projection, grib_data, contour, coast, magics.mcont(contour_params2))
        else:
            magics.plot(output_o, projection, grib_data, contour, coast)

    resp = send_file(path + ".png", magics_format)
    output.cleanup()

    return resp


def generate_legend(output, layer, format="image/png", style="", version="1.3.0", height=150, width=600, transparent=True):
    try:
        magics_format = "png"
    except KeyError:
        raise errors.InvalidFormat(format)

    output_fname = output.target("png")
    path, _ = os.path.splitext(output_fname)

    # Setting of the output file name
    output_o = magics.output(
                    output_formats=['png'],
                    output_name_first_page_number="off",
                    output_cairo_transparent_background=transparent,
                    output_width=width,
                    output_name=path,
                )

    # Magics is talking in cm.
    width_cm = float(width) / 40.0
    height_cm = float(height) / 40.0

    args = [
        magics.mmap(
            subpage_frame="off",
            page_x_length=width_cm,
            page_y_length=height_cm,
            super_page_x_length=width_cm,
            super_page_y_length=height_cm,
            subpage_x_length=width_cm,
            subpage_y_length=height_cm,
            subpage_x_position=0.0,
            subpage_y_position=0.0,
            output_width=width,
            page_frame="off",
            page_id_line="off",
        ),
    ]

    contour_params = {
        "contour_automatic_setting": "style_name",
        "contour_style_name": "sh_all_f5t70lst",
        'contour': 'off',
        'contour_hilo': 'off',
        'legend': 'on',
        "contour_legend_only": True
    }

    contour = magics.mcont(contour_params)

    args += [magics.mgrib(grib_input_file_name="testdata/vorticity.grib"), contour]

    legend_font_size = "25%"
    if width_cm < height_cm:
        legend_font_size = "5%"

    legend_title = layer

    legend = magics.mlegend(
        legend_title="on",
        legend_title_text=legend_title,
        legend_display_type="continuous",
        legend_box_mode="positional",
        legend_only=True,
        legend_box_x_position=0.00,
        legend_box_y_position=0.00,
        legend_box_x_length=width_cm,
        legend_box_y_length=height_cm,
        legend_box_blanking=not transparent,
        legend_text_font_size=legend_font_size,
        legend_text_colour="white",
    )

    # self.log.debug('plot(): Calling macro.plot(%s)', args)
    try:
        magics.plot(output_o, *args, legend)
    except Exception as e:
        LOG.exception("Magics error: %s", e)
        raise

    resp = send_file(path + ".png", magics_format)
    output.cleanup()

    return resp

