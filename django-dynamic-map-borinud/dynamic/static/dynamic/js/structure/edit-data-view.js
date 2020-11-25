let EditDataView = function (dataCollection, map, pruneCluster, overlay) {
    this.data = dataCollection;
    this.pruneCluster = pruneCluster;
    this.overlay = overlay;
    this.map = map;
};

EditDataView.prototype.initEvents = function () {
    this.publishers();
    this.subscribers();
};


EditDataView.prototype.publishers = function () {
    const self = this

    self.map.on(L.Draw.Event.CREATED, function (e) {
            let id = $('#myTabContent .active').attr('id');
            if (id === "data") {
                self.overlay.fadeIn(300);
                self.pruneCluster.Cluster._markers.forEach((marker) => {
                    if (isMarkerInsidePolygon(marker, e.layer)) {
                        $.Topic("data-add").publish(marker.data);
                    }
                })
                self.overlay.fadeOut(300)
            }
        }
    );

    $(document.body).on("click", ".removeFromTable", function () {
        let id = $(this).data('id');

        $.Topic("data-remove").publish(id);
    });

    $("#removeAll").on("click", function () {

        $.Topic("data-remove-all").publish();
    });

    $(document.body).on("click", ".validateButton", function () {
        let id = this.id
        let data = self.data.getAll()
        if (data.length <= 0) {
            toastr.warning("Select data to validate/invalidate")
        } else {
            let payload = {
                data: data,
                type: id
            }
            $.ajax({
                type: "POST",
                url: "/dynamic/manual-edit-attributes-data/",
                data: JSON.stringify(payload),
                dataType: "json",
                success: function (data) {
                    if (data.success) {
                        $.Topic("data-remove-all").publish();
                        $.Topic("edit-data-history-reload").publish();
                        toastr.success("Done!")
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

        }
    })
};


EditDataView.prototype.subscribers = function () {
    const self = this;

    $.Topic("data-add").subscribe(function () {
        self.render();
    });

    $.Topic("data-remove").subscribe(function () {
        self.render();
    });

    $.Topic("data-remove-all").subscribe(function () {
        self.render();
    });
};


EditDataView.prototype.render = function () {
    const dataCol = this.data.getAll();
    const tbodySel = $('#selectedData > tbody')
    tbodySel.html('');
    let html = '';

    // Build wishes html
    dataCol.map((data, index) => {
        html += `<tr><td><button data-id="${index}" class="btn btn-sm btn-danger removeFromTable"><i class="fa fa-trash"></i></button></td><td>${data.ident}</td><td>${normalizeString(data.lon)}</td><td>${normalizeString(data.lat)}</td><td>${data.network}</td><td>(${normalizeString(data.trange[0])},${normalizeString(data.trange[1])},${normalizeString(data.trange[2])})</td><td>(${normalizeString(data.level[0])},${normalizeString(data.level[1])},${normalizeString(data.level[2])},${normalizeString(data.level[3])})</td><td>${Object.keys(data.data[0].vars)[0]}</td><td>${data.date}</td></tr>`
    });

    // Update the wish list and the sum DOM elements
    tbodySel.append(html);
};