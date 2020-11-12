let EditStationView = function (stationCollection, map, pruneCluster, overlay) {
    this.data = stationCollection;
    this.pruneCluster = pruneCluster;
    this.overlay = overlay;
    this.map = map;
};

EditStationView.prototype.initEvents = function () {
    this.publishers();
    this.subscribers();
    const self = this
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
        let id = this.id === "validateStations"? "validate"  : "invalidate"
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
                                            "trange": trange.split(",").map((tr)=>parseInt(tr)),
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
                                } else {
                                    toastr.error("Something went wrong!")
                                    console.log(data);
                                }
                                //$("#searchButton").trigger("click")
                            },
                            error: function (errMsg) {
                                console.log(errMsg);
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
};


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