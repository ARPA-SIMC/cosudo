let EditStationView = function (editStationCollection, map, pruneCluster, overlay, urlBorinud, stationCollection) {
    this.data = editStationCollection;
    this.pruneCluster = pruneCluster;
    this.overlay = overlay;
    this.map = map;
    this.urlBorinud = urlBorinud
    this.allStations = stationCollection
};

EditStationView.prototype.initEvents = function () {
    this.publishers();
    this.subscribers();
    const self = this

    const invalidationVarsFormView = new InvalidationVarsFormView()
    invalidationVarsFormView.initEvents()

    function createSlider(values, id) {
        let min = Math.min(...values.filter(function (n) {
            return !isNaN(n);
        }))
        let max = Math.max(...values.filter(function (n) {
            return !isNaN(n);
        }))

        $(`${id}`).slider({
            values: [min, max],
            min: min,
            range: true,
            max: max,
            step: 10,
        }).slider("pips").slider("float");
    }

    let B07030values = []
    let B07031values = []

    self.allStations.getAll().forEach((station) => {
        B07030values.push(station["B07030"])
        B07031values.push(station["B07031"])
    })
    createSlider([...new Set(B07031values)], "#filterStationsB07031")
    createSlider(B07030values, "#filterStationsB07030")

    $('#startDateI').datetimepicker({
        widgetPositioning: {
            horizontal: 'left',
            vertical: 'bottom'
        },
        locale: 'it'
    });
    $('#finalDateI').datetimepicker({
        widgetPositioning: {
            horizontal: 'left',
            vertical: 'bottom'
        },
        locale: 'it'
    });

    $(document.body).on("click", ".validateButtonStations", function () {
        let initialDate = $('#inputStartDateI').val()
        let finalDate = $("#inputFinalDateI").val()
        let check = true
        let id = this.id === "validateStations" ? "validate" : "invalidate"
        let data = self.data.getAll()
        if (data.length <= 0) {
            toastr.warning("Select stations to validate/invalidate")
        } else {
            if (initialDate !== "") {
                let payload = {
                    initialDate: moment.utc(initialDate, "DD-MM-YYYY HH:mm").toDate(),
                    finalDate: "",
                    data: [],
                    type: id
                }
                if (finalDate !== "") {
                    payload.finalDate = moment.utc(finalDate, "DD-MM-YYYY HH:mm").toDate()
                    if (payload.finalDate.getTime() <= payload.initialDate.getTime())
                        check = false
                }
                if (check) {
                    let dataStations = []
                    let selectedVars = $("#varsInvalidation").val()
                    let selectedTrange = $("#trangeInvalidation").val()
                    let selectedLevel = $("#levelInvalidation").val()
                    if (selectedLevel.length > 0 && selectedTrange.length > 0 && selectedVars.length > 0) {
                        data.forEach((station) => {
                            selectedVars.forEach((vars) => {
                                selectedTrange.forEach((trange) => {
                                    selectedLevel.forEach((level) => {
                                        dataStations.push({
                                            ...station,
                                            "level": level.split(",").map(
                                                (level) => {
                                                    if (level === "-")
                                                        return null
                                                    return parseInt(level)
                                                }),
                                            "trange": trange.split(",").map((tr) => parseInt(tr)),
                                            "var": vars
                                        })
                                    })
                                })
                            })
                        })
                        payload.data = dataStations

                        console.log(payload)

                        $.ajax({
                            type: "POST",
                            url: "/dynamic/manual-edit-attributes-station/",
                            data: JSON.stringify(payload),
                            dataType: "json",
                            success: function (data) {
                                if (data.success) {
                                    $.Topic("station-remove-all").publish();
                                    toastr.success("Done!")
                                    $.Topic("edit-station-history-reload").publish();

                                } else {
                                    toastr.error("Something went wrong!")
                                    console.log(data);
                                }
                                //$("#searchButton").trigger("click")
                            },
                            error: function (errMsg) {
                                console.log(errMsg);
                            },
                            beforeSend: function () {
                                self.overlay.fadeIn(300);
                            },
                            complete: function () {
                                self.overlay.fadeOut(300);
                            }
                        });


                    } else {
                        toastr.warning("Select at least one var, one level, one timerange!")
                    }

                } else {
                    toastr.warning("Initial date has to be smaller than final date")
                }
            } else {
                toastr.warning("Set the initial date")
            }


        }
    })
}


EditStationView.prototype.publishers = function () {
    const self = this

    self.map.on(L.Draw.Event.CREATED, function (e) {
            let id = $('#myTabContent .active').attr('id');
            if (id === "stations") {
                self.overlay.fadeIn(300);
                self.pruneCluster.Cluster._markers.forEach((marker) => {
                    if (isMarkerInsidePolygon(marker, e.layer)) {
                        $.Topic("station-add").publish(marker.data);
                    }
                })
                self.overlay.fadeOut(300)
            }
        }
    );
    $(document.body).on("click", "#addStationsFromConstantData", function () {
        let sliderB07030 = $("#filterStationsB07030")
        let sliderB07031 = $("#filterStationsB07031")
        let vSliderB07030 = [sliderB07030.slider("values", 0), sliderB07030.slider("values", 1)];
        let vSliderB07031 = [sliderB07031.slider("values", 0), sliderB07031.slider("values", 1)];
        let stationsToAdd = []
        self.allStations.getAll().forEach((station) => {
            let valueB07030 = station["B07030"]
            let valueB07031 = station["B07031"]
            if ((valueB07030 >= vSliderB07030[0] && valueB07030 <= vSliderB07030[1])
                && (valueB07031 >= vSliderB07031[0] && valueB07031 <= vSliderB07031[1])) {
                stationsToAdd.push(station)
            }
        })
        $.Topic("station-add-multiple").publish(stationsToAdd);
        toastr.success("Done!")
    })

    $(document.body).on("click", ".removeFromTableStation", function () {
        let id = $(this).data('id');

        $.Topic("station-remove").publish(id);
    });

    $("#removeAllStations").on("click", function () {

        $.Topic("station-remove-all").publish();
    });


};


EditStationView.prototype.subscribers = function () {
    const self = this;

    $.Topic("station-add").subscribe(function () {
        self.render();
    });

    $.Topic("station-remove").subscribe(function () {
        self.render();
    });

    $.Topic("station-add-multiple").subscribe(function () {
        self.render();
    });

    $.Topic("station-remove-all").subscribe(function () {
        self.render();
    });
};


EditStationView.prototype.render = function () {
    const dataCol = this.data.getAll();
    const tbodySel = $('#selectedStations > tbody')
    tbodySel.html('');
    let html = '';

    // Build wishes html
    dataCol.map((data, index) => {
        html += `<tr><td><button data-id="${index}" class="btn btn-sm btn-danger removeFromTableStation"><i class="fa fa-trash"></i></button></td><td>${data.ident}</td><td>${normalizeString(data.lon)}</td><td>${normalizeString(data.lat)}</td><td>${data.network}</td></tr>`
    });

    // Update the wish list and the sum DOM elements
    tbodySel.append(html);
};