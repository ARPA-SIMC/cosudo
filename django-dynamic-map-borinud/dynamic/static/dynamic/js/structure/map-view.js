let MapView = function (
    urlBorinud,
    map,
    pruneCluster,
    legend,
    overlay,
    urlWms,
    notFoundImage,
    urlMapServer,
    websiteDomain
) {

    this.collection = [];
    this.urlBorinud = urlBorinud;
    this.map = map;
    this.pruneCluster = pruneCluster;
    this.legend = legend;
    this.overlay = overlay;
    this.selectedHour = "*";
    this.selectedTimeLayers = "*";
    this.controlLayer = L.control.layers();
    this.urlWms = urlWms;
    this.notFoundImage = notFoundImage;
    this.urlMapServer = urlMapServer;
    this.grades = [];
    this.websiteDomain = websiteDomain
    this.opacityControls = {}
    this.availableTimesLayer = {}
    this.markersLayer = new L.LayerGroup();
};

MapView.prototype.initEvents = function () {
    const self = this;
    let hours = ["*"];
    let timesLayer = ["*"];
    let sliderB33192 = $("#filterB33192");
    let checkFilterB33192 = $("#checkFilterB33192");
    let sliderB33193 = $("#filterB33193");
    let checkFilterB33193 = $("#checkFilterB33193");
    let sliderB33194 = $("#filterB33194");
    let checkFilterB33194 = $("#checkFilterB33194");
    let bcode = {
        bcode: "B00001",
        description: "Undefined",
        unit: "Undefined",
        offset: 0,
        scale: 1,
        userunit: "",
    };
    createSliderFilter(sliderB33192);
    switchFilter(sliderB33192, checkFilterB33192);
    createSliderFilter(sliderB33193);
    switchFilter(sliderB33193, checkFilterB33193);
    createSliderFilter(sliderB33194);
    switchFilter(sliderB33194, checkFilterB33194);
    getWmsLayers(self.urlWms, 502)
    getWmsLayers(self.urlMapServer, 501)
    self.controlLayer.addTo(self.map)
    self.markersLayer.addTo(self.map)
    self.map.on("layeradd", function (l) {
        const name = l.layer.options.layers
        // if layer is a wms layer
        if (name) {
            updateTimesSliderLayers()
            //add the opacity control
            if (self.opacityControls[name])
                self.opacityControls[name].addTo(self.map);
            //set  colors
            let params = {}
            if ($("#syncColors").is(":checked") && self.grades.length > 0) {
                params["dim_grades"] = self.grades
                params["dim_colors"] = colors
            }
            l.layer.setParams(params);
        }

    });

    self.map.on("layerremove", function (l) {
        //remove opacity control on layer remove
        if (self.opacityControls[l.layer.options.layers]) {
            self.opacityControls[l.layer.options.layers].remove();
            updateTimesSliderLayers()
        }

    });


    $(document.body).on("change", "#syncColors", function () {
        // removes or sets the wms params for synchronize colors
        if ($(this).is(":checked")) {
            if (self.grades.length > 0) {
                let activeLayers = self.controlLayer.getActiveOverlays();
                activeLayers.forEach((layer) => {
                    layer.setParams({dim_grades: self.grades, dim_colors: colors});
                });
            } else {
                toastr.warning("Search first");
                $(this).prop("checked", false);
            }
        } else {
            let activeLayers = self.controlLayer.getActiveOverlays();
            activeLayers.forEach((layer) => {
                delete (layer.wmsParams.dim_grades);
                delete (layer.wmsParams.dim_colors);
                layer.setParams();
            });
        }
    });

    $(document.body).on("click", "#toggleMarkers", function () {
        //shows or hides markers from map
        let collection = [];
        if ($(this).hasClass("showing")) {
            $(this).html("<i class='fa fa-eye-slash'></i>");
            $(this).removeClass("showing");
            $(this).addClass("hiding");
        } else {
            $(this).html("<i class='fa fa-eye'></i>");
            $(this).removeClass("hiding");
            $(this).addClass("showing");
            collection = self.collection;
        }
        let selectedValues = getSelectedValues();
        let selectedObject = $("input[name='objectToShow']:checked").val();
        self.render(collection, bcode, selectedObject, selectedValues, toggleClusteringValue());
    });


    $(document.body).on("click", "#toggleClustering", function () {
        //shows or hides markers from map
        if ($(this).hasClass("showing")) {
            $(this).html("<i class='fa fa-toggle-off'></i>");
            $(this).removeClass("showing");
            $(this).addClass("hiding");
        } else {
            $(this).html("<i class='fa fa-toggle-on'></i>");
            $(this).removeClass("hiding");
            $(this).addClass("showing");
        }
        self.overlay.fadeIn(300);
        let selectedValues = getSelectedValues();
        let selectedObject = $("input[name='objectToShow']:checked").val();
        self.render(filterData(), bcode, selectedObject, selectedValues, toggleClusteringValue());
        self.overlay.fadeOut(300);
    });

    $("#sliderTime").slider({
        value: 0,
        min: 0,
        max: 1,
        slide: function (event, ui) {
            self.selectedHour = hours[ui.value];
        },
        step: 1,
    });
    $("#sliderTimeLayers").slider({
        value: 0,
        min: 0,
        max: 1,
        step: 1,
        slide: function (event, ui) {
            self.selectedTimeLayers = timesLayer[ui.value];
        },
    });
    $(document.body).on("click", ".open-graph", function () {
        //add the search to graph view
        let idCol = $(this).attr("data-id");
        if (self.collection[idCol]) {
            let selectedValues = getSelectedValues();
            let data = self.collection[idCol];
            let query = {
                ident: data.ident,
                lon_lat: `${data.lon},${data.lat}`,
                network: data.network,
                timerange: `${normalizeString(data.trange[0])},${normalizeString(
                    data.trange[1]
                )},${normalizeString(data.trange[2])}`,
                level: `${null2_(data.level[0])},${null2_(data.level[1])},${null2_(
                    data.level[2]
                )},${null2_(data.level[3])}`,
                vars: Object.keys(data.data[0].vars)[0],
                date: selectedValues.date,
                hour: selectedValues.hour,
                dsn: selectedValues.dsn,
            };
            $.Topic("query-add").publish(query);
            toastr.success("Done!");
        }
    });

    $(document.body).on("click", ".open-wind-graph", function () {
        //opens the wind rose graph
        let idCol = $(this).attr("data-id");
        let selectedValues = getSelectedValues();
        if (self.collection[idCol]) {
            let data = self.collection[idCol];
            let urlDirWind =
                `${self.urlBorinud}/dbajson/${null2_(data.ident)}/${
                    data.lon + "," + data.lat
                }/` +
                `${null2_(data.network)}/${
                    data.trange[0] + "," + data.trange[1] + "," + data.trange[2]
                }/${
                    null2_(data.level[0]) +
                    "," +
                    null2_(data.level[1]) +
                    "," +
                    null2_(data.level[2]) +
                    "," +
                    null2_(data.level[3])
                }/B11001/` +
                `timeseries/${selectedValues.date.split("-")[0]}/${
                    selectedValues.date.split("-")[1]
                }/${selectedValues.date.split("-")[2]}` +
                `${selectedValues.hour !== "*" ? "/" + selectedValues.hour : ""}?dsn=${
                    selectedValues.dsn
                }`;
            let urlSpeedWind =
                `${self.urlBorinud}/dbajson/${null2_(data.ident)}/${
                    data.lon + "," + data.lat
                }/` +
                `${null2_(data.network)}/${
                    data.trange[0] + "," + data.trange[1] + "," + data.trange[2]
                }/${
                    null2_(data.level[0]) +
                    "," +
                    null2_(data.level[1]) +
                    "," +
                    null2_(data.level[2]) +
                    "," +
                    null2_(data.level[3])
                }/B11002/` +
                `timeseries/${selectedValues.date.split("-")[0]}/${
                    selectedValues.date.split("-")[1]
                }/${selectedValues.date.split("-")[2]}` +
                `${selectedValues.hour !== "*" ? "/" + selectedValues.hour : ""}?dsn=${
                    selectedValues.dsn
                }`;
            openGraphWind(urlDirWind, urlSpeedWind, self.overlay);
        }
    });

    $(document.body).on("mousedown", ".slider-control", function () {
        // fix for slider, disables dragging on map on sliding
        self.map.dragging.disable();
    });

    $(document.body).on("mouseout", ".slider-control", function () {
        // fix for slider, enables dragging on map after sliding
        self.map.dragging.enable();
    });

    $("#applyFilter").click(function () {
        // on click filter button in filters section
        self.overlay.fadeIn(300);
        let selectedValues = getSelectedValues();
        let selectedObject = $("input[name='objectToShow']:checked").val();
        self.render(filterData(), bcode, selectedObject, selectedValues, toggleClusteringValue());
        self.overlay.fadeOut(300);
    });

    $(document.body).on("slidestop", "#sliderTime", function (event, ui) {
        // on data time slider stop
        let selectedValues = getSelectedValues();
        let selectedObject = $("input[name='objectToShow']:checked").val();
        self.render(filterData(), bcode, selectedObject, selectedValues, toggleClusteringValue());
    });

    $(document.body).on("slidestop", "#sliderTimeLayers", function (event, ui) {
        // on layer time slider stop
        let hour = getTimeForWmsLayer()
        updateTimeWmsLayers(hour)
    });

    // trigger search on change of datepicker
    $("#datetimepicker").on("change.datetimepicker", function (e) {
        e.stopPropagation();
        update();
    });
    //trigger search on change of form items
    $(".updateOnClick").on("change", function () {
        update();
    });

    function toggleClusteringValue() {
        return !$("#toggleClustering").hasClass("showing")
    }

    function updateTimesSliderLayers() {
        // get times of the active layers
        let activeLayers = self.controlLayer.getActiveOverlays();
        timesLayer = activeLayers.reduce((array, layer) => {
            const name = layer.options.layers
            return [...new Set(array.concat(self.availableTimesLayer[name]))]
        }, ["*"])
        //get labels from string time
        let sliderLabels = timesLayer.map((item) => {
            return item === "*" ? item : moment(item).format("DD-MM-YYYY, HH:mm:ss");
        });
        $("#sliderTimeLayers")
            .slider("option", "max", sliderLabels.length - 1)
            .slider("pips", {
                first: "label",
                last: "label",
                rest: "pip",
                labels: sliderLabels,
                step: 1,
                prefix: "",
                suffix: "",
            })
            .slider("float", {
                handle: true,
                pips: true,
                labels: sliderLabels,
                prefix: "",
                suffix: "",
            })
            .slider("value", 0);
        self.selectedTimeLayers = "*"
        let hour = getTimeForWmsLayer()
        updateTimeWmsLayers(hour)
    }

    function updateTimeWmsLayers(hour) {
        let activeLayers = self.controlLayer.getActiveOverlays();
        if (!hour.includes("*")) {
            activeLayers.forEach((layer) => {
                layer.setParams({time: hour});
            });
        } else {
            activeLayers.forEach((layer) => {
                delete (layer.wmsParams.time);
                layer.setParams();
            });
        }
    }

    function getTimeForWmsLayer() {
        let hour = self.selectedTimeLayers;
        let selectedHourForm = $("#hour").val();
        if (hour === "*") {
            let date = $("#datetimepicker").datetimepicker("viewDate")
            hour = moment(date).format("YYYY-MM-DD");
            hour = `${hour}T${selectedHourForm}:00:00`;
        }
        return hour
    }

    function getWmsLayers(url, overrideZIndexValue = undefined) {
        $.ajax({
            type: "GET",
            url: url,
            data: {request: "getCapabilities", service: "wms"},
            dataType: "text",
            success: function (data) {
                const capabilities = new WMSCapabilities().parse(data);
                const layers = capabilities?.Capability?.Layer?.Layer;
                if (overrideZIndexValue) {
                    self.map.createPane(url);
                    self.map.getPane(url).style.zIndex = overrideZIndexValue;
                }
                layers.forEach((l) => {
                    let layer = L.tileLayer.wms(url, {
                        layers: l.Name,
                        format: "image/png",
                        transparent: "TRUE",
                        attribution: "",
                        version: "1.3.0",
                        errorTileUrl: self.notFoundImage,
                        ...(overrideZIndexValue ? {pane: url} : {})
                    });
                    if (overrideZIndexValue)
                        layer.setZIndex(overrideZIndexValue)
                    self.controlLayer.addOverlay(layer, l.Title)
                    self.opacityControls[l.Name] = L.control.opacity({[l.Title]: layer});
                    //get times from getCapabilties
                    let result = []
                    "Dimension" in l && l.Dimension && l.Dimension.forEach((time) => {
                        result = result.concat(getTimesFromGetCapabilities(time))
                    })
                    self.availableTimesLayer[l.Name] = [...result]
                })
            }
        })
    }


    function createSliderFilter(element) {
        element
            .slider({
                disabled: true,
                values: [0, 10],
                min: 0,
                range: true,
                max: 10,
                step: 1,
            })
            .slider("pips")
            .slider("float");
    }

    function switchFilter(slider, checkbox) {
        checkbox.change(function () {
            if (this.checked) {
                slider.slider("enable");
            } else {
                slider.slider("disable");
            }
        });
    }


    function getSelectedValues() {
        let selectFields = [
            "ident",
            "lon_lat",
            "network",
            "hour",
            "vars",
            "timerange",
            "level",
            "dsn",
        ];
        let returnResult = {};
        selectFields.forEach((item) => {
            returnResult[item] = $(`select[name="${item}"]`).val();
        });
        let date = $("#datetimepicker").datetimepicker("viewDate");
        returnResult["date"] = moment(date).format("YYYY-MM-DD");
        return returnResult;
    }

    function getUrl(selectedObj, selectedValues) {
        let url
        switch (selectedObj) {
            case "data":
                url =
                    `${self.urlBorinud}/dbajson/${selectedValues.ident}/${selectedValues.lon_lat}/` +
                    `${selectedValues.network}/${selectedValues.timerange}/${selectedValues.level}/${selectedValues.vars}/` +
                    `spatialseries/${selectedValues.date.split("-")[0]}/${
                        selectedValues.date.split("-")[1]
                    }/${selectedValues.date.split("-")[2]}` +
                    `${
                        selectedValues.hour !== "*" ? "/" + selectedValues.hour : ""
                    }?dsn=${selectedValues.dsn}&query=attr`
                break
            case "stations":
                url =
                    `${self.urlBorinud}/geojson/${selectedValues.ident}/${selectedValues.lon_lat}/` +
                    `${selectedValues.network}/*/*/*/stations?dsn=${selectedValues.dsn}`
                break;
            default:
                url =
                    `${self.urlBorinud}/geojson/${selectedValues.ident}/${selectedValues.lon_lat}/` +
                    `${selectedValues.network}/*/*/*/stationdata?dsn=${selectedValues.dsn}`
                ;
                break;

        }
        const copyUrl = url.indexOf("http://") === 0 || url.indexOf("https://") === 0 ? url : `${self.websiteDomain}${url}`
        $("#url-borinud-data").attr("data-url", copyUrl)
        return url
    }

    function getActiveFilters(filterList) {
        let activeFilters = [];
        filterList.forEach((filter) => {
            if (filter["checkbox"].prop("checked")) {
                activeFilters.push([filter["bcode"], filter["slider"]]);
            }
        });
        return activeFilters;
    }

    function itemCheckInvalid(item, bcodeKey) {
        let radioB33196val = parseInt($("input[name='invalidData']:checked").val());
        switch (radioB33196val) {
            case 0: {
                return true;
            }
            case 1: {
                return !(
                    bcodeKey in item.data[0].vars &&
                    "B33196" in item.data[0].vars[bcodeKey].a
                );
            }
            case 2: {
                return (
                    bcodeKey in item.data[0].vars &&
                    "B33196" in item.data[0].vars[bcodeKey].a
                );
            }
        }
    }

    function resetFilters() {
        checkFilterB33192.prop("checked", false).trigger("change");
        checkFilterB33193.prop("checked", false).trigger("change");
        checkFilterB33194.prop("checked", false).trigger("change");
        $("#invalidData2").prop("checked", true);
        self.selectedHour = hours[0];
    }

    function filterData() {
        let date = self.selectedHour;
        let vSliderB33192 = [
            sliderB33192.slider("values", 0),
            sliderB33192.slider("values", 1),
        ];
        let vSliderB33193 = [
            sliderB33193.slider("values", 0),
            sliderB33193.slider("values", 1),
        ];
        let vSliderB33194 = [
            sliderB33194.slider("values", 0),
            sliderB33194.slider("values", 1),
        ];
        let bcodeKey = $("#vars").val();
        let collection = self.collection;
        if (date !== "*") {
            collection = collection.filter((item) => {
                return item.date === date;
            });
        }
        let activeFilters = getActiveFilters([
            {
                checkbox: checkFilterB33192,
                slider: vSliderB33192,
                bcode: "B33192",
            },
            {
                checkbox: checkFilterB33193,
                slider: vSliderB33193,
                bcode: "B33193",
            },
            {
                checkbox: checkFilterB33194,
                slider: vSliderB33194,
                bcode: "B33194",
            },
        ]);
        let filteredCollection = [];
        collection.forEach((item) => {
            let found = true;
            activeFilters.forEach((filter) => {
                if (
                    !(
                        bcodeKey in item.data[0].vars &&
                        filter[0] in item.data[0].vars[bcodeKey].a &&
                        item.data[0].vars[bcodeKey].a[filter[0]] >= filter[1][0] &&
                        item.data[0].vars[bcodeKey].a[filter[0]] <= filter[1][1]
                    )
                ) {
                    found = false;
                }
            });
            if (!itemCheckInvalid(item, bcodeKey)) {
                found = false;
            }
            if (found) {
                filteredCollection.push(item);
            }
        });
        if (self.selectedTimeLayers === "*") {
            let hour = getTimeForWmsLayer()
            updateTimeWmsLayers(hour)
        }
        return filteredCollection;
    }


    function update() {
        resetFilters();
        let selectedValues = getSelectedValues();
        let selectedObject = $("input[name='objectToShow']:checked").val();
        let url = getUrl(selectedObject, selectedValues);
        let goOn = true;
        if (selectedObject === "data") {
            if (selectedValues.vars === "*") {
                goOn = false;
            }
        }
        if (goOn) {
            $.ajax({
                url: url,
                dataType: "json",
                success: function (collection) {
                    hours = ["*"];
                    self.collection = collection;
                    if (selectedObject === "data") {
                        if (selectedValues.vars !== "*") {
                            if (selectedValues.vars in borinud.config.B) {
                                bcode = borinud.config.B[selectedValues.vars];
                            } else {
                                bcode = {
                                    bcode: selectedValues.vars,
                                    description: "Undefined",
                                    unit: "Undefined",
                                    offset: 0,
                                    scale: 1,
                                    userunit: "",
                                };
                            }
                            if (!("offset" in bcode)) {
                                bcode = {...bcode, offset: 0}
                            }
                            if (!("scale" in bcode)) {
                                bcode = {...bcode, scale: 1}
                            }
                        }
                        collection.forEach((item, index) => {
                            item.indexCol = index;
                            if (hours.indexOf(item.date) === -1) hours.push(item.date);
                        });

                        hours.sort(function (a, b) {
                            return new Date(a) - new Date(b);
                        });
                        let sliderLabels = hours.map((item) => {
                            if (item !== "*") return moment(item).format("HH:mm:ss");
                            return item;
                        });
                        $("#sliderTime")
                            .slider("option", "max", sliderLabels.length - 1)
                            .slider("pips", {
                                first: "label",
                                last: "label",
                                rest: "pip",
                                labels: sliderLabels,
                                step: 1,
                                prefix: "",
                                suffix: "",
                            })
                            .slider("float", {
                                handle: true,
                                pips: true,
                                labels: sliderLabels,
                                prefix: "",
                                suffix: "",
                            })
                            .slider("value", 0);
                        self.render(
                            filterData(),
                            bcode,
                            selectedObject,
                            selectedValues,
                            toggleClusteringValue()
                        );
                    } else {
                        self.render(
                            collection,
                            bcode,
                            selectedObject,
                            selectedValues,
                            toggleClusteringValue()
                        );
                    }
                },
                beforeSend: function () {
                    self.overlay.fadeIn(300);
                },
                complete: function () {
                    self.overlay.fadeOut(300);
                },
            });
        } else {
            toastr.error("Select a var");
        }
    }


};
MapView.prototype.render = function (
    collection,
    bcode,
    selectedObj,
    selectedValues,
    noClustering = false
) {
    const self = this;
    self.overlay.fadeIn(300);
    self.legend.remove();
    self.pruneCluster.RemoveMarkers();
    self.pruneCluster.RedrawIcons();
    self.markersLayer.clearLayers();
    if (collection.length <= 0) {
        toastr.warning("No data");
    } else {
        if (selectedObj !== "data") {
            preparePruneClusterSimple(self.pruneCluster, selectedObj)
            collection.features.forEach((station) => {
                let marker = new PruneCluster.Marker(
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                );
                marker.data = station.properties;
                self.pruneCluster.RegisterMarker(marker);
            });
        } else {
            let min = Infinity,
                max = -Infinity;
            collection.forEach((data) => {
                min = Math.min(
                    min,
                    data.data.map((item) => {
                        if (selectedValues.vars in item.vars)
                            return item.vars[selectedValues.vars].v;
                    })
                );
                max = Math.max(
                    max,
                    data.data.map((item) => {
                        if (selectedValues.vars in item.vars)
                            return item.vars[selectedValues.vars].v;
                    })
                );
            });
            if (!noClustering) {
                let pi2 = Math.PI * 2;
                self.pruneCluster.PrepareLeafletMarker = function (leafletMarker, data) {
                    setSimpleIconMarker(selectedValues, bcode, min, max, leafletMarker, data)
                }
                self.pruneCluster.Cluster.Size = 15;
                if ($("#vars").val() === "B11001") {
                    preparePruneClusterWind(self.pruneCluster)
                } else {
                    self.legend.onAdd = function (map) {
                        let div = L.DomUtil.create("div", "info legend");
                        // loop through our density intervals and generate a label with a colored square for each interval
                        let halfdelta = (max - min) / (colors.length * 2);
                        let grades = [];
                        for (let i = 0; i < colors.length; i++) {
                            let grade = min + halfdelta * (i * 2 + 1);
                            div.innerHTML +=
                                '<div style="background:white">' +
                                '<b style="background:' +
                                getColor(grade, min, max) +
                                '">&nbsp;&nbsp;&nbsp;</b>&nbsp;' +
                                roundValue(grade * bcode.scale + bcode.offset) +
                                "<br>" +
                                "</div>";
                            grades.push(grade * bcode.scale + bcode.offset);
                        }
                        self.grades = grades;
                        if ($("#syncColors").is(":checked")) {
                            let activeLayers = self.controlLayer.getActiveOverlays();
                            activeLayers.forEach((layer) => {
                                layer.setParams({dim_grades: self.grades, dim_colors: colors});
                            });
                        }
                        return div;
                    };
                    self.legend.addTo(self.map);
                    preparePruneClusterAllData(self.pruneCluster, max, min, pi2, bcode, selectedValues)
                }
                $.each(collection, function (i, feature) {
                    let marker = getMarker(feature, selectedValues)
                    if ($("#vars").val() === "B11001") {
                        marker.category = getIndexCompass(marker.data.value);
                    } else {
                        marker.category = getColorIndex(marker.data.value, min, max);
                    }
                    self.pruneCluster.RegisterMarker(marker);
                });
            } else {
                $.each(collection, function (i, feature) {
                    self.markersLayer.addLayer(getSimpleMarker(feature, selectedValues, bcode, min, max))
                });
            }

        }
        //self.map.addLayer(self.pruneCluster);
        self.pruneCluster.ProcessView();
    }
    self.overlay.fadeOut(300);
};
