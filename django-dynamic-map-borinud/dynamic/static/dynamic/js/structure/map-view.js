let MapView = function (urlBorinud, map, pruneCluster, legend, overlay) {
    this.collection = [];
    this.urlBorinud = urlBorinud
    this.map = map
    this.pruneCluster = pruneCluster
    this.legend = legend
    this.overlay = overlay
    this.selectedHour = "*"
};

MapView.prototype.initEvents = function () {
    const self = this;
    let hours = ["*"]
    let sliderB33192 = $("#filterB33192")
    let checkFilterB33192 = $("#checkFilterB33192")
    let sliderB33193 = $("#filterB33193")
    let checkFilterB33193 = $("#checkFilterB33193")
    let sliderB33194 = $("#filterB33194")
    let checkFilterB33194 = $("#checkFilterB33194")
    let radioB33196 = $("input[name='invalidData']")
    let bcode = {
        "bcode": "B00001",
        "description": "Undefined",
        "unit": "Undefined",
        "offset": 0,
        "scale": 1,
        "userunit": ""
    }
    createSliderFilter(sliderB33192)
    switchFilter(sliderB33192, checkFilterB33192)
    createSliderFilter(sliderB33193)
    switchFilter(sliderB33193, checkFilterB33193)
    createSliderFilter(sliderB33194)
    switchFilter(sliderB33194, checkFilterB33194)
    let customControl = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function (map) {
            let el = L.DomUtil.create('div', 'leaflet-bar ');
            el.innerHTML = '<a role="button" id="toggleMarkers" class="showing"><i class="fa fa-eye"></i> </a>';
            return el;
        }
    });
    self.map.addControl(new customControl());

    $(document.body).on("click", "#toggleMarkers", function () {
        let collection = []
        if ($(this).hasClass("showing")) {
            $(this).html("<i class='fa fa-eye-slash'></i>")
            $(this).removeClass("showing")
            $(this).addClass("hiding")
        } else {
            $(this).html("<i class='fa fa-eye'></i>")
            $(this).removeClass("hiding")
            $(this).addClass("showing")
            collection = self.collection
        }
        let selectedValues = getSelectedValues()
        let selectedObject = $("input[name='objectToShow']:checked").val()
        self.render(collection, bcode, undefined, selectedObject, selectedValues)
    })

    function createSliderFilter(element) {
        element.slider({
            disabled: true,
            values: [0, 10],
            min: 0,
            range: true,
            max: 10,
            step: 1,
        }).slider("pips").slider("float");
    }

    function switchFilter(slider, checkbox) {
        checkbox.change(function () {
            if (this.checked) {
                slider.slider('enable');
            } else {
                slider.slider('disable');
            }
        })
    }

    $("#sliderTime").slider({
        value: 0,
        min: 0,
        max: 1,
        slide: function (event, ui) {
            self.selectedHour = hours[ui.value]
        },
        step: 1,
    })

    function getSelectedValues() {
        let selectFields = ["ident", "lon_lat", "network", "hour", "vars", "timerange", "level", "dsn"]
        let returnResult = {}
        selectFields.forEach((item) => {
            returnResult[item] = $(`select[name="${item}"]`).val()
        })
        let date = $("#datetimepicker").datetimepicker("viewDate")
        returnResult["date"] = moment(date).format("YYYY-MM-DD")
        return returnResult
    }

    function getUrl(selectedObj, selectedValues) {
        switch (selectedObj) {
            case "data":
                return `${self.urlBorinud}/dbajson/${selectedValues.ident}/${selectedValues.lon_lat}/` +
                    `${selectedValues.network}/${selectedValues.timerange}/${selectedValues.level}/${selectedValues.vars}/` +
                    `spatialseries/${selectedValues.date.split("-")[0]}/${selectedValues.date.split("-")[1]}/${selectedValues.date.split("-")[2]}` +
                    `${selectedValues.hour !== "*" ? "/" + selectedValues.hour : ""}?dsn=${selectedValues.dsn}&query=attr`
            case "stations":
                return `${self.urlBorinud}/geojson/${selectedValues.ident}/${selectedValues.lon_lat}/` +
                    `${selectedValues.network}/*/*/*/stations?dsn=${selectedValues.dsn}`
            default:
                return `${self.urlBorinud}/geojson/${selectedValues.ident}/${selectedValues.lon_lat}/` +
                    `${selectedValues.network}/*/*/*/stationdata?dsn=${selectedValues.dsn}`

        }
    }

    function getActiveFilters(filterList) {
        let activeFilters = []
        filterList.forEach((filter) => {
            if (filter["checkbox"].prop("checked")) {
                activeFilters.push([filter["bcode"], filter["slider"]])
            }
        })
        return activeFilters
    }

    function itemCheckInvalid(item, bcodeKey) {
        let radioB33196val = parseInt($("input[name='invalidData']:checked").val())
        switch (radioB33196val) {
            case 0: {
                return true
            }
            case 1: {
                return !(bcodeKey in item.data[0].vars && "B33196" in item.data[0].vars[bcodeKey].a);
            }
            case 2: {
                return bcodeKey in item.data[0].vars && "B33196" in item.data[0].vars[bcodeKey].a;
            }
        }
    }

    function resetFilters() {
        checkFilterB33192.prop("checked", false).trigger('change');
        checkFilterB33193.prop("checked", false).trigger('change');
        checkFilterB33194.prop("checked", false).trigger('change');
        $("#invalidData2").prop("checked", true);
        self.selectedHour = hours[0]
    }

    function filterData() {
        let date = self.selectedHour
        let vSliderB33192 = [sliderB33192.slider("values", 0), sliderB33192.slider("values", 1)];
        let vSliderB33193 = [sliderB33193.slider("values", 0), sliderB33193.slider("values", 1)];
        let vSliderB33194 = [sliderB33194.slider("values", 0), sliderB33194.slider("values", 1)];
        let bcodeKey = $("#vars").val()
        let collection = self.collection
        if (date !== "*") {
            collection = collection.filter((item) => {
                return item.date === date
            })
        }
        let activeFilters = getActiveFilters([
            {
                "checkbox": checkFilterB33192,
                "slider": vSliderB33192,
                "bcode": "B33192"
            },
            {
                "checkbox": checkFilterB33193,
                "slider": vSliderB33193,
                "bcode": "B33193"
            }, {
                "checkbox": checkFilterB33194,
                "slider": vSliderB33194,
                "bcode": "B33194"
            }])
        let filteredCollection = []
        collection.forEach((item) => {
            let found = true
            activeFilters.forEach((filter) => {
                if (!(bcodeKey in item.data[0].vars
                    && filter[0] in item.data[0].vars[bcodeKey].a
                    && item.data[0].vars[bcodeKey].a[filter[0]] >= filter[1][0]
                    && item.data[0].vars[bcodeKey].a[filter[0]] <= filter[1][1])) {
                    found = false
                }
            })
            if (!itemCheckInvalid(item, bcodeKey)) {
                found = false
            }
            if (found) {
                filteredCollection.push(item)
            }

        })
        return filteredCollection
        /**
         if (date !== "*" && controlLayer !== undefined) {
            let activeLayers = controlLayer.getActiveOverlays()
            activeLayers.forEach((layer) => {
                layer.setParams({time: date})
            })
        }
         */


    }

    function openGraph(urlGraph, headerModal) {
        $.ajax({
            url: urlGraph,
            dataType: "json",
            success: function (collection) {
                let data_dict = {}
                collection.features.forEach((feature) => {
                    let trange = borinud.config.trange.describe(...feature.properties.trange);
                    let key = `IDENT:${null2_(feature.properties.ident)}|LAT_LON:${feature.properties.lat.toString() + "," + feature.properties.lon.toString()}|NETWORK: ${feature.properties.network}|TIMERANGE: ${trange}`
                    if (!(key in data_dict))
                        data_dict[key] = []
                    data_dict[key].push({"x": new Date(feature.properties.date), "y": feature.properties.val})
                })
                let datasets = []
                for (let key in data_dict)
                    datasets.push({data: data_dict[key], fill: false, borderColor: getRandomColor(), tooltip: key})
                // get the canvas element
                console.log(datasets)
                document.querySelector("#chart-container").innerHTML = '<canvas id="chart"></canvas>';
                var ctx = document.getElementById('chart').getContext('2d');
                $("#modalGraph").modal("show");
                let chart = new Chart(ctx, {
                    legend: {
                        display: false
                    },
                    // The type of chart we want to create
                    type: 'line',
                    // The data for our dataset
                    data: {
                        datasets: datasets,
                    },
                    options: {
                        scales: {
                            xAxes: [{
                                type: "time",
                                time: {
                                    parser: "D/M/YYYY, H:mm:ss",
                                    displayFormats: {
                                        millisecond: 'DD/MM/YYYY HH:mm:ss',
                                        second: 'DD/MM/YYYY HH:mm:ss',
                                        minute: 'DD/MM/YYYY HH:mm:ss',
                                        hour: 'DD/MM/YYYY HH:mm:ss',
                                        day: 'DD/MM/YYYY HH:mm:ss',
                                        week: 'DD/MM/YYYY HH:mm:ss',
                                        month: 'DD/MM/YYYY HH:mm:ss',
                                        quarter: 'DD/MM/YYYY HH:mm:ss',
                                        year: 'DD/MM/YYYY HH:mm:ss'
                                    },
                                    tooltipFormat: 'DD/MM/YYYY HH:mm:ss'
                                }
                            }],
                        },
                        tooltips: {
                            callbacks: {
                                afterLabel: function (tooltipItem, data) {
                                    var label = data.datasets[tooltipItem.datasetIndex].tooltip.split("|");
                                    return label
                                }
                            }
                        },

                        animation: {
                            onComplete: function (e) {
                                this.options.animation.onComplete = null;
                                // remove loading spinner
                                jQuery("#loadingChart").hide();
                                // create image from canvas
                                let url = chart.toBase64Image();
                                // set download link to button
                                let button = document.getElementById("printGraph");
                                button.href = url;
                                // enable button download
                                button.removeAttribute("disabled");

                            }
                        },
                        plugins: {
                            zoom: {
                                pan: {
                                    enabled: true,
                                    mode: 'xy'
                                },
                                zoom: {
                                    enabled: true,
                                    mode: 'xy',
                                }
                            }
                        }
                    }
                });
                $("#chartHeader").html(headerModal)
            },
            beforeSend: function () {
                self.overlay.fadeIn(300);
            },
            complete: function () {
                self.overlay.fadeOut(300);
            },
        });
    }

    $(document.body).on("click", "#showGraphButton", function () {
        let selectedValues = getSelectedValues()

        let urlGraph = `${self.urlBorinud}/geojson/${null2_(selectedValues.ident)}/${selectedValues.lon_lat}/` +
            `${null2_(selectedValues.network)}/${selectedValues.timerange}/${selectedValues.level}/${selectedValues.vars}/` +
            `timeseries/${selectedValues.date.split("-")[0]}/${selectedValues.date.split("-")[1]}/${selectedValues.date.split("-")[2]}` +
            `${selectedValues.hour !== "*" ? "/" + selectedValues.hour : ""}?dsn=${selectedValues.dsn}`

        let headerModal = ""
        openGraph(urlGraph, headerModal)

    })
    $(document.body).on("click", ".open-graph", function () {
        let idCol = $(this).attr('data-id')
        let selectedValues = getSelectedValues()
        if (self.collection[idCol]) {
            let data = self.collection[idCol]
            let urlGraph = `${self.urlBorinud}/geojson/${null2_(data.ident)}/${data.lon + "," + data.lat}/` +
                `${null2_(data.network)}/${data.trange[0] +
                "," + data.trange[1] + "," + data.trange[2]}/${null2_(data.level[0]) + "," + null2_(data.level[1]) + "," +
                null2_(data.level[2]) + "," + null2_(data.level[3])}/${selectedValues.vars}/` +
                `timeseries/${selectedValues.date.split("-")[0]}/${selectedValues.date.split("-")[1]}/${selectedValues.date.split("-")[2]}` +
                `${selectedValues.hour !== "*" ? "/" + selectedValues.hour : ""}?dsn=${selectedValues.dsn}`

            let headerModal = "Ident: " + null2_(data.ident) + " Coords: " + data.lat + "," + data.lon +
                " Network:" + null2_(data.network)
                + "<br>" + borinud.config.trange.describe(data.trange[0], data.trange[1], data.trange[2]) + "<br>"
                + borinud.config.level.describe(data.level[0], data.level[1], data.level[2], data.level[3]) + "<br>"
            openGraph(urlGraph, headerModal)
        }
    })
    $(document.body).on("click", "#showWindRose", function () {
        let selectedValues = getSelectedValues()
        //create request url
        let urlDir = `${self.urlBorinud}/dbajson/${selectedValues.ident}/${selectedValues.lon_lat}/` +
            `${selectedValues.network}/${selectedValues.timerange}/${selectedValues.level}/B11001/` +
            `spatialseries/${selectedValues.date.split("-")[0]}/${selectedValues.date.split("-")[1]}/${selectedValues.date.split("-")[2]}` +
            `${selectedValues.hour !== "*" ? "/" + selectedValues.hour : ""}?dsn=${selectedValues.dsn}`;
        let urlSpeed = `${self.urlBorinud}/dbajson/${selectedValues.ident}/${selectedValues.lon_lat}/` +
            `${selectedValues.network}/${selectedValues.timerange}/${selectedValues.level}/B11002/` +
            `spatialseries/${selectedValues.date.split("-")[0]}/${selectedValues.date.split("-")[1]}/${selectedValues.date.split("-")[2]}` +
            `${selectedValues.hour !== "*" ? "/" + selectedValues.hour : ""}?dsn=${selectedValues.dsn}`;

        openGraphWind(urlDir, urlSpeed)

    })

    function openGraphWind(urlDirWind, urlSpeedWind) {
        $.ajax({
            url: urlDirWind,
            dataType: "json",
            success: function (windDirectionData) {
                $.ajax({
                        url: urlSpeedWind,
                        dataType: "json",
                        success: function (windSpeedData) {
                            let dataWindSpeedDByDir = {}
                            windSpeedData.forEach((speedValue) => {
                                windDirectionData.forEach((directionValue) => {
                                    if (speedValue.date === directionValue.date
                                        && speedValue.ident === directionValue.ident
                                        && speedValue.lon === directionValue.lon
                                        && speedValue.lat === directionValue.lat
                                        && speedValue.network === directionValue.network) {
                                        let speed = speedValue.data[0].vars["B11002"].v
                                        let key = windClassification(speed)
                                        if (!(key in dataWindSpeedDByDir)) {
                                            dataWindSpeedDByDir[key] = {
                                                "dir": {
                                                    "N": {total: 0},
                                                    "NNE": {total: 0},
                                                    "NE": {total: 0},
                                                    "ENE": {total: 0},
                                                    "E": {total: 0},
                                                    "ESE": {total: 0},
                                                    "SE": {total: 0},
                                                    "SSE": {total: 0},
                                                    "S": {total: 0},
                                                    "SSW": {total: 0},
                                                    "SW": {total: 0},
                                                    "WSW": {total: 0},
                                                    "W": {total: 0},
                                                    "WNW": {total: 0},
                                                    "NW": {total: 0},
                                                    "NNW": {total: 0}
                                                },
                                                "total": 0

                                            }
                                        }
                                        let direction = degToCompass(directionValue.data[0].vars["B11001"].v)
                                        dataWindSpeedDByDir[key].dir[direction].total += 1
                                        dataWindSpeedDByDir[key].total += 1
                                    }
                                })
                            })
                            let dataSpeedAverage = []
                            let i = 0
                            for (let key in dataWindSpeedDByDir) {
                                dataSpeedAverage.push({
                                    r: Object.keys(dataWindSpeedDByDir[key].dir).map(function (keyDir) {
                                        return (dataWindSpeedDByDir[key].dir[keyDir].total / dataWindSpeedDByDir[key].total) * 100;
                                    }),
                                    theta: Object.keys(dataWindSpeedDByDir[key].dir),
                                    name: key,
                                    marker: {color: windColors[i]},
                                    type: "barpolar"
                                })
                                i++
                            }
                            let dataDict = {
                                "N": 0,
                                "NNE": 0,
                                "NE": 0,
                                "ENE": 0,
                                "E": 0,
                                "ESE": 0,
                                "SE": 0,
                                "SSE": 0,
                                "S": 0,
                                "SSW": 0,
                                "SW": 0,
                                "WSW": 0,
                                "W": 0,
                                "WNW": 0,
                                "NW": 0,
                                "NNW": 0
                            }
                            windDirectionData.forEach((data) => {
                                dataDict[degToCompass(data.data[0].vars["B11001"].v)] += 1;
                            })
                            $("#modalWindRose").modal("show");
                            let data = [{
                                r: Object.keys(dataDict).map(function (key) {
                                    return dataDict[key];
                                }),
                                theta: Object.keys(dataDict),
                                name: "11-14 m/s",
                                marker: {color: getRandomColor()},
                                type: "barpolar"
                            }
                            ]
                            let layout = {
                                title: "Wind Direction Distribution",
                                font: {size: 16},
                                legend: {font: {size: 16}},
                                polar: {
                                    radialaxis: {angle: 90,},
                                    angularaxis: {direction: "clockwise"}
                                },
                                autosize: true,
                            }
                            let layoutSpeed = {
                                title: "Wind Speed Distribution",
                                font: {size: 16},
                                legend: {font: {size: 16}},
                                showlegend: true,
                                polar: {
                                    barmode: "overlay",
                                    bargap: 0,
                                    radialaxis: {ticksuffix: "%", angle: 90, dtick: 20},
                                    angularaxis: {direction: "clockwise"}
                                },
                                autosize: true,
                            }
                            Plotly.newPlot(document.getElementById("windRoseContainer"), data, layout)
                            Plotly.newPlot(document.getElementById("windRoseSpeedContainer"), dataSpeedAverage, layoutSpeed)

                        },
                        beforeSend: function () {
                            self.overlay.fadeIn(300);
                        },
                        complete: function () {
                            self.overlay.fadeOut(300);
                        },

                    }
                )
            }
            ,
            beforeSend: function () {
                self.overlay.fadeIn(300);
            }
            ,
            complete: function () {
                self.overlay.fadeOut(300);
            }
            ,

        })

    }

    $(document.body).on("click", ".open-wind-graph", function () {
        let idCol = $(this).attr('data-id')
        let selectedValues = getSelectedValues()
        if (self.collection[idCol]) {
            let data = self.collection[idCol]
            let urlDirWind = `${self.urlBorinud}/dbajson/${null2_(data.ident)}/${data.lon + "," + data.lat}/` +
                `${null2_(data.network)}/${data.trange[0] +
                "," + data.trange[1] + "," + data.trange[2]}/${null2_(data.level[0]) + "," + null2_(data.level[1]) + "," +
                null2_(data.level[2]) + "," + null2_(data.level[3])}/B11001/` +
                `timeseries/${selectedValues.date.split("-")[0]}/${selectedValues.date.split("-")[1]}/${selectedValues.date.split("-")[2]}` +
                `${selectedValues.hour !== "*" ? "/" + selectedValues.hour : ""}?dsn=${selectedValues.dsn}`
            let urlSpeedWind = `${self.urlBorinud}/dbajson/${null2_(data.ident)}/${data.lon + "," + data.lat}/` +
                `${null2_(data.network)}/${data.trange[0] +
                "," + data.trange[1] + "," + data.trange[2]}/${null2_(data.level[0]) + "," + null2_(data.level[1]) + "," +
                null2_(data.level[2]) + "," + null2_(data.level[3])}/B11002/` +
                `timeseries/${selectedValues.date.split("-")[0]}/${selectedValues.date.split("-")[1]}/${selectedValues.date.split("-")[2]}` +
                `${selectedValues.hour !== "*" ? "/" + selectedValues.hour : ""}?dsn=${selectedValues.dsn}`
            openGraphWind(urlDirWind, urlSpeedWind)
        }
    })

    $(document.body).on("mousedown", ".slider-control", function () {
        self.map.dragging.disable();
    });

    $(document.body).on("mouseout", ".slider-control", function () {
        self.map.dragging.enable();
    });

    $("#applyFilter").click(function () {
        self.overlay.fadeIn(300)
        let selectedValues = getSelectedValues()
        let selectedObject = $("input[name='objectToShow']:checked").val()
        self.render(filterData(), bcode, undefined, selectedObject, selectedValues)
        self.overlay.fadeOut(300)

    })

    $(document.body).on("slidestop", "#sliderTime", function (event, ui) {
        let selectedValues = getSelectedValues()
        let selectedObject = $("input[name='objectToShow']:checked").val()
        self.render(filterData(), bcode, undefined, selectedObject, selectedValues)
    });

    $("#datetimepicker").on('change.datetimepicker', function (e) {
        e.stopPropagation()
        update()

    });

    function update() {
        resetFilters()
        let selectedValues = getSelectedValues()
        let selectedObject = $("input[name='objectToShow']:checked").val()
        let url = getUrl(selectedObject, selectedValues)
        let goOn = true
        if (selectedObject === "data") {
            if (selectedValues.vars === "*") {
                goOn = false
            }
        }
        if (goOn) {
            $.ajax({
                    url: url,
                    dataType: "json",
                    success: function (collection) {
                        hours = ["*"]
                        self.collection = collection
                        if (selectedObject === "data") {
                            if (selectedValues.vars !== "*") {
                                bcode = borinud.config.B[selectedValues.vars];
                            }
                            collection.forEach((item, index) => {
                                item.indexCol = index
                                if (hours.indexOf(item.date) === -1)
                                    hours.push(item.date);
                            })

                            hours.sort(function (a, b) {
                                return new Date(a) - new Date(b);
                            });
                            self.render(filterData(), bcode, hours, selectedObject, selectedValues)

                        } else {
                            self.render(collection, bcode, undefined, selectedObject, selectedValues)
                        }

                    },
                    beforeSend: function () {
                        self.overlay.fadeIn(300);
                    },
                    complete: function () {
                        self.overlay.fadeOut(300);
                    },

                }
            )
        } else {
            toastr.error("Select a var")
        }
    }

    $(".updateOnClick").on("change", function () {
        update()
    })
}
MapView.prototype.render = function (collection, bcode, hours, selectedObj, selectedValues) {
    const self = this

    function clusterCheckInvalid(cluster, bcodeKey) {
        for (let item in cluster) {
            if (bcodeKey in cluster[item].data.data[0].vars && "B33196" in cluster[item].data.data[0].vars[bcodeKey].a)
                return true
        }
        return false
    }

    function setPopup(data, selected_values) {
        let popupText = "<div>" +
            "Ident: " + null2_(data.ident) +
            "<br>Lon: " + data.lon / 100000 +
            "<br>Lat: " + data.lat / 100000 +
            "<br>Network: " + data.network +
            "<br>Trange: " + borinud.config.trange.describe(data.trange[0], data.trange[1], data.trange[2]) +
            "<br>Level: " + borinud.config.level.describe(data.level[0], data.level[1], data.level[2], data.level[3]) +
            "<br>Date: " + data.date
        data.data.forEach((item) => {
            for (let key in item.vars) {
                let b = borinud.config.B[key];
                popupText += "<br>Var: " + b.description + " " + item.vars[key].v + " (" + b.unit + ")";
                if (Object.keys(item.vars[key].a).length > 0) {
                    popupText += "<br><ul>"
                    for (let keyAttr in item.vars[key].a) {
                        let attr = item.vars[key].a[keyAttr];
                        popupText += keyAttr + ": " + attr;
                    }
                    popupText += "</ul>"
                }

            }
        })
        popupText += `<br><button data-id="${data.indexCol}" type="button" class="btn btn-primary btn-block open-graph" >Show graph</button>`;
        if (selected_values.vars === "B11001" || selected_values.vars === "B11002") {
            popupText += `<button data-id="${data.indexCol}" type="button" class="btn btn-primary btn-block open-wind-graph " >Show wind rose graph</button>`;
        }
        popupText += "</div>";
        return popupText;
    }

    self.overlay.fadeIn(300);
    self.legend.remove();
    self.pruneCluster.RemoveMarkers();
    self.pruneCluster.RedrawIcons();
    if (collection.length <= 0) {
        $("#showGraphButton").attr("disabled", true)
        toastr.warning("No data")
    } else {
        $("#showGraphButton").attr("disabled", false)
        let coords = []
        if (selectedObj !== "data") {
            self.pruneCluster.PrepareLeafletMarker = function (leafletMarker, data) {
                let text = "Ident: " + null2_(data.ident) +
                    "<br>Lon: " + data.lon / 100000 +
                    "<br>Lat: " + data.lat / 100000 +
                    "<br>Network: " + data.network
                if (selectedObj === "constantStationData") {
                    text += "<br>" + borinud.config.B[data.var].description + " :" + data.val
                }
                if (leafletMarker.getPopup()) {
                    leafletMarker.setPopupContent(text);
                } else {
                    leafletMarker.bindPopup(text);
                }
            };
            self.pruneCluster.BuildLeafletClusterIcon = function (cluster) {
                return PruneClusterForLeaflet.prototype.BuildLeafletClusterIcon.call(this, cluster);
            };
            collection.features.forEach((station) => {
                coords.push([station.geometry.coordinates[1], station.geometry.coordinates[0]]);
                let marker = new PruneCluster.Marker(station.geometry.coordinates[1], station.geometry.coordinates[0])
                marker.data = station.properties
                self.pruneCluster.RegisterMarker(marker);
            })
        } else {

            if (hours !== undefined) {
                let sliderLabels = [...hours].map((item) => {
                    if (item !== "*")
                        return moment(item).format("HH:mm:ss")
                    return item
                })
                $("#sliderTime").slider("option", "max", sliderLabels.length - 1).slider('pips', {
                    first: 'label',
                    last: 'label',
                    rest: 'pip',
                    labels: sliderLabels,
                    step: 1,
                    prefix: "",
                    suffix: ""
                }).slider('float', {
                    handle: true,
                    pips: true,
                    labels: sliderLabels,
                    prefix: "",
                    suffix: ""
                }).slider("value", 0);
            }
            let min = Infinity, max = -Infinity
            collection.forEach((data) => {
                min = Math.min(min, data.data.map((item) => {
                    if (selectedValues.vars in item.vars)
                        return item.vars[selectedValues.vars].v
                }));
                max = Math.max(max, data.data.map((item) => {
                    if (selectedValues.vars in item.vars)
                        return item.vars[selectedValues.vars].v
                }));
            })
            let pi2 = Math.PI * 2;
            self.pruneCluster.PrepareLeafletMarker = function (leafletMarker, data) {
                if (leafletMarker.getPopup()) {
                    leafletMarker.setPopupContent(setPopup(data, selectedValues));
                } else {
                    leafletMarker.bindPopup(setPopup(data, selectedValues));
                }
                let val = (data.value * bcode.scale + bcode.offset).toPrecision(5).replace(/\.?0+$/, "");
                let vallen = val.length * 6 + 6;
                leafletMarker.setIcon(
                    L.extendedDivIcon({
                        iconSize: new L.Point(vallen, 14),
                        labelAnchor: [vallen / 2, 0],
                        html: val,
                        className: 'myDivIcon',
                        style: {backgroundColor: getColor(data.value, min, max)}
                    })
                );
                let bcodeKey = $("#vars").val()
                if (bcodeKey in data.data[0].vars && "B33196" in data.data[0].vars[bcodeKey].a) {
                    vallen += 4
                    leafletMarker.setIcon(
                        L.extendedDivIcon({
                            iconSize: new L.Point(vallen, 18),
                            labelAnchor: [vallen / 2, 0],
                            html: val,
                            className: 'myDivIcon',
                            style: {
                                backgroundColor: getColor(data.value, min, max),
                                borderColor: "rgba(255, 51, 51, 1)",
                                borderWidth: "2px"
                            }
                        })
                    );
                }
                leafletMarker.bindTooltip(data.date.toString());
                leafletMarker.on("contextmenu", function () {
                    $.Topic("data-add").publish(data);
                })
            };
            self.pruneCluster.Cluster.Size = 15;
            if ($("#vars").val() === "B11001") {
                self.pruneCluster.BuildLeafletClusterIcon = function (cluster) {
                    let markersCluster = cluster.GetClusterMarkers()
                    let bcodeKey = $("#vars").val()
                    L.Icon.MarkerCluster = L.Icon.extend({
                        options: {
                            iconSize: new L.Point(100, 100),
                            className: 'prunecluster leaflet-markercluster-icon'
                        },

                        createIcon: function () {
                            let e = document.createElement('canvas');
                            this._setIconStyles(e, 'icon');
                            let s = this.options.iconSize;
                            e.width = s.x;
                            e.height = s.y;
                            this.draw(e.getContext('2d'), s.x, s.y);
                            return e;
                        },

                        createShadow: function () {
                            return null;
                        },

                        draw: function (canvas, width, height) {

                            let windDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW",]
                            canvas.textAlign = 'center';
                            canvas.textBaseline = 'top';
                            canvas.font = 'bold 10px sans-serif';
                            canvas.strokeStyle = "grey";
                            canvas.lineWidth = 0.5;
                            canvas.moveTo(50, 5)
                            canvas.lineTo(50, 95);
                            canvas.moveTo(5, 50)
                            canvas.lineTo(95, 50);
                            canvas.stroke();
                            canvas.fillStyle = "grey"
                            canvas.fillText("N", 50, 0, 20);
                            canvas.textBaseline = 'middle';
                            canvas.fillText("E", 96, 50, 20);
                            canvas.textBaseline = 'bottom';
                            canvas.fillText("S", 50, 100, 20);
                            canvas.textBaseline = 'middle';
                            canvas.fillText("W", 4, 50, 20);
                            for (let i = 0, l = windDirections.length; i < l; ++i) {
                                let maxHeight = 36
                                var size = (this.stats[i] * maxHeight) / this.population;
                                let radiusSize = size < 0 || isNaN(size) ? 0 : size
                                canvas.beginPath();
                                canvas.moveTo(50, 50);
                                canvas.fillStyle = "#58e";
                                if (clusterCheckInvalid(markersCluster, bcodeKey)) {
                                    canvas.fillStyle = "red";
                                }
                                canvas.lineWidth = 1;
                                canvas.strokeStyle = "black";
                                switch (i) {
                                    case 0:
                                        canvas.arc(50, 50, radiusSize + 4, 1.375 * Math.PI, 1.625 * Math.PI);
                                        break
                                    case 1:
                                        canvas.arc(50, 50, radiusSize + 4, 1.625 * Math.PI, 1.875 * Math.PI);
                                        break
                                    case 2:
                                        canvas.arc(50, 50, radiusSize + 4, 1.875 * Math.PI, 0.125 * Math.PI);
                                        break
                                    case 3:
                                        canvas.arc(50, 50, radiusSize + 4, 0.125 * Math.PI, 0.375 * Math.PI);
                                        break
                                    case 4:
                                        canvas.arc(50, 50, radiusSize + 4, 0.375 * Math.PI, 0.625 * Math.PI);
                                        break
                                    case 5:
                                        canvas.arc(50, 50, radiusSize + 4, 0.625 * Math.PI, 0.875 * Math.PI);
                                        break
                                    case 6:
                                        canvas.arc(50, 50, radiusSize + 4, 0.875 * Math.PI, 1.125 * Math.PI);
                                        break
                                    case 7:
                                        canvas.arc(50, 50, radiusSize + 4, 1.125 * Math.PI, 1.375 * Math.PI);
                                        break
                                }
                                canvas.lineTo(50, 50);
                                canvas.stroke();
                                canvas.fill();
                                canvas.closePath();

                            }
                            canvas.beginPath();
                            canvas.fillStyle = "#fff";
                            canvas.arc(50, 50, 4, 0, Math.PI * 2);
                            canvas.stroke();
                            canvas.fill();
                            canvas.closePath();
                        }
                    });
                    let e = new L.Icon.MarkerCluster();
                    e.stats = cluster.stats;
                    e.population = cluster.population;

                    //this try to make the little values more visible (no less of 5%)
                    for (let i = 0, l = e.stats.length; i < l; ++i) {
                        if ((e.stats[i] > 0) && ((e.stats[i] / e.population) < 0.1)) {
                            let inc = (e.population * 0.05) - e.stats[i];
                            e.stats[i] += inc;
                            e.population += inc;
                        }
                    }

                    return e;
                };

                $.each(collection, function (i, feature) {
                    coords.push([feature.lat / 100000, feature.lon / 100000]);
                    let marker = new PruneCluster.Marker(feature.lat / 100000, feature.lon / 100000);
                    marker.data = feature;
                    marker.data.value = 0
                    feature.data.forEach((item) => {
                        if (selectedValues.vars in item.vars) {
                            marker.data.value = item.vars[selectedValues.vars].v
                            marker.data.trange = item.timerange
                            marker.data.level = item.level
                        }
                    })
                    marker.category = getIndexCompass(marker.data.value);
                    self.pruneCluster.RegisterMarker(marker);
                });
            } else {
                self.legend.onAdd = function (map) {
                    let div = L.DomUtil.create('div', 'info legend');
                    // loop through our density intervals and generate a label with a colored square for each interval
                    let halfdelta = ((max - min) / (colors.length * 2.));

                    for (let i = 0; i < colors.length; i++) {
                        let grade = min + halfdelta * (i * 2 + 1);
                        div.innerHTML +=
                            '<div style="background:white">' +
                            '<b style="background:' + getColor(grade, min, max) + '">&nbsp;&nbsp;&nbsp;</b>&nbsp;' +
                            (grade * bcode.scale + bcode.offset).toPrecision(5).replace(/\.?0+$/, "") +
                            '<br>' +
                            '</div>';
                    }
                    return div;
                };

                self.legend.addTo(self.map);
                self.pruneCluster.BuildLeafletClusterIcon = function (cluster) {
                    let markersCluster = cluster.GetClusterMarkers()
                    let bcodeKey = $("#vars").val()
                    L.Icon.MarkerCluster = L.Icon.extend({
                        options: {
                            iconSize: new L.Point(100, 100),
                            className: "prunecluster leaflet-markercluster-icon"
                        },

                        createIcon: function () {
                            let e = document.createElement('canvas');
                            this._setIconStyles(e, 'icon');
                            let s = this.options.iconSize;
                            e.width = s.x;
                            e.height = s.y;
                            this.draw(e.getContext('2d'), s.x, s.y);
                            return e;
                        },

                        createShadow: function () {
                            return null;
                        },

                        draw: function (canvas, width, height) {
                            if (clusterCheckInvalid(markersCluster, bcodeKey)) {
                                canvas.beginPath();
                                canvas.arc(50, 50, 30, 0, 2 * Math.PI);
                                canvas.fillStyle = "rgba(255, 51, 51, 0.5)";
                                canvas.fill()
                                canvas.strokeStyle = "rgba(255, 51, 51, 1)";
                                canvas.stroke();
                            }

                            let start = 0;
                            let prevalent = 0;
                            let prevalentindex = 0;
                            for (let i = 0, l = colors.length; i < l; ++i) {
                                var size = this.stats[i] / this.population;
                                if (size > 0) {
                                    if (this.stats[i] > prevalent) {
                                        prevalentindex = i;
                                        prevalent = this.stats[i];
                                    }
                                    canvas.beginPath();
                                    canvas.moveTo(50, 50);
                                    canvas.fillStyle = colors[i];
                                    let from = start;
                                    let to = start + size * pi2;
                                    if (to < from) {
                                        from = start;
                                    }
                                    canvas.arc(50, 50, 22, from, to);
                                    start = to;
                                    canvas.lineTo(50, 50);
                                    canvas.strokeStyle = "black";
                                    canvas.stroke();
                                    canvas.fill();
                                    canvas.closePath();
                                }
                            }
                            canvas.beginPath();
                            canvas.fillStyle = colors[prevalentindex];
                            canvas.arc(50, 50, 15, 0, Math.PI * 2);
                            canvas.stroke();
                            canvas.fill();
                            canvas.closePath();
                            canvas.fillStyle = '#111';
                            canvas.textAlign = 'center';
                            canvas.textBaseline = 'middle';
                            canvas.font = 'bold 10px sans-serif';
                            //canvas.fillText(this.population, 22, 22,28);
                            let halfdelta = ((max - min) / (colors.length * 2.));
                            let grade = min + halfdelta * (prevalentindex * 2 + 1);
                            grade = (grade * bcode.scale + bcode.offset).toPrecision(5).replace(/\.?0+$/, "");
                            canvas.fillText(grade, 50, 50, 28);
                        }
                    });
                    let e = new L.Icon.MarkerCluster();
                    e.stats = cluster.stats;
                    e.population = cluster.population;

                    //this try to make the little values more visible (no less of 5%)
                    for (let i = 0, l = e.stats.length; i < l; ++i) {
                        if ((e.stats[i] > 0) && ((e.stats[i] / e.population) < 0.1)) {
                            let inc = (e.population * 0.05) - e.stats[i];
                            e.stats[i] += inc;
                            e.population += inc;
                        }
                    }

                    return e;
                };


                $.each(collection, function (i, feature) {

                    coords.push([feature.lat / 100000, feature.lon / 100000]);

                    let marker = new PruneCluster.Marker(feature.lat / 100000, feature.lon / 100000);
                    marker.data = feature;
                    marker.data.value = 0
                    feature.data.forEach((item) => {
                        if (selectedValues.vars in item.vars) {
                            marker.data.value = item.vars[selectedValues.vars].v
                            marker.data.trange = item.timerange
                            marker.data.level = item.level
                            marker.data.selected = false
                        }
                    })
                    marker.category = getColorIndex(marker.data.value, min, max);
                    self.pruneCluster.RegisterMarker(marker);
                });
            }
        }
        self.map.addLayer(self.pruneCluster);
        try {
            self.map.fitBounds(coords);
        } catch (err) {
            toastr.error("Error setting bounds...");
        }
    }
    self.overlay.fadeOut(300);

}