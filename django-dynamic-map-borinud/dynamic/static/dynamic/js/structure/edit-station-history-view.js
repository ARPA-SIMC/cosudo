let EditStationHistoryView = function (dataCollection, map) {
    this.data = dataCollection;
    this.nextUrl = null
    this.prevUrl = null
    this.map = map
};

EditStationHistoryView.prototype.initEvents = function () {
    const self = this
    this.publishers();
    this.subscribers();
    self.reload("/dynamic/edits?type=s")

    $(document.body).on("click", ".locateOnMap", function () {
        let lat = parseInt($(this).attr("data-lat")) / 100000
        let lon = parseInt($(this).attr("data-lon")) / 100000
        let marker = L.marker([lat, lon])
        marker.addTo(self.map);
        self.map.panTo(marker.getLatLng());
        window.setTimeout(function () {
            marker.remove()
        }, 3000)
    })

};

EditStationHistoryView.prototype.reload = function (url) {
    const self = this
    $.ajax({
        url: url,
        dataType: "json",
        success: function (resp) {
            console.log()
            self.nextUrl = resp.next === null ? "" : resp.next
            self.prevUrl = resp.previous === null ? "" : resp.previous
            $.Topic("edit-station-history-set").publish(resp.results);
        },
        error: function (e) {
            console.log(e.toString());
        }
    });

};


EditStationHistoryView.prototype.publishers = function () {
    const self = this

    $("#prevHistoryStation, #nextHistoryStation").on("click", function () {
        let url = $(this).attr("data-url")
        self.reload(url)
    })


};


EditStationHistoryView.prototype.subscribers = function () {
    const self = this;

    $.Topic("edit-station-history-add").subscribe(function () {
        self.render();
    });

    $.Topic("edit-station-history-add-array").subscribe(function () {
        self.render();
    });

    $.Topic("edit-station-history-set").subscribe(function () {
        self.render();
    });

    $.Topic("edit-station-history-reload").subscribe(function () {
        self.reload("/dynamic/edits?type=s");
    });

};


EditStationHistoryView.prototype.render = function () {
    const self = this
    const dataCol = this.data.getAll();
    const listSel = $('#station-history-list')
    listSel.html('');
    let html = '';
    console.log(self)
    $("#prevHistoryStation").attr("data-url", self.prevUrl)
    $("#prevHistoryStation").prop("disabled", self.prevUrl === "")

    $("#nextHistoryStation").attr("data-url", self.nextUrl)
    $("#nextHistoryStation").prop("disabled", self.nextUrl === "")

    // Build wishes html
    dataCol.map((data, index) => {
        let classColor = data.type === "i" ? "badge-danger" : "badge-success"
        let typeStr = data.type === "i" ? "Invalidation" : "Validation"
        let innerTrs = ""
        data.stationEdits.forEach((edit) => {
            innerTrs += `<tr><td><button data-lon="${edit.lon}" data-lat="${edit.lat}" class="btn btn-primary locateOnMap"><i class="fa fa-map-marker"></i></button> </td><td>${edit.ident}</td><td>${edit.lon}</td><td>${edit.lat}</td><td>${edit.network}</td><td>${edit["var"]}</td><td>${edit.trange}</td><td>${edit.level}</td></tr>`
        })
        let innerTable = ` <div class="table-responsive" style="max-height: 400px;">
                                    <table class="table table-sm table-bordered table-hover table-striped">
                                        <thead>
                                        <tr>
                                        <th></th>
                                            <th>Ident</th>
                                            <th>Longitudine</th>
                                            <th>Latitudine</th>
                                            <th>network</th>
                                            <th>Var</th>
                                            <th>Trange</th>
                                            <th>level</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                            ${innerTrs}
                                        </tbody>
                                    </table>
                                </div>`
        html += `<li id="${data.id}" class="list-group-item">
                    <div class="d-flex flex-row justify-content-between">
                        <div class="d-flex flex-column justify-content-between">  
                            <div class="d-flex flex-row justify-content-between"><b>Edit date:</b>${moment(data.created_date).format("DD/MM/YYYY HH:mm:ss")}</div>
                            <div class="d-flex flex-row justify-content-between"><b>Type:</b><span class="badge ${classColor}">${typeStr}</span></div>
                            ${data.startDate !== null ? `<div class="d-flex flex-row justify-content-between"><b>Start date:</b>${moment(data.startDate).utcOffset(data.startDate).format("DD/MM/YYYY HH:mm:ss")}</div>` : ""}
                            ${data.finalDate !== null ? `<div class="d-flex flex-row justify-content-between"><b>End date:</b>${moment(data.finalDate).utcOffset(data.finalDate).format("DD/MM/YYYY HH:mm:ss")}</div>` : ""}
                        </div>
                        <button class="btn btn-secondary makeStationReport my-auto" data-id="${data.id}" type="button"">
                            <i class="fa fa-download"></i>
                        </button>
                        <button class="btn btn-link my-auto" type="button" data-toggle="collapse" data-target="#collapseEditStation${data.id}" aria-expanded="false" aria-controls="collapseEditStation${data.id}">
                            <i class="fa fa-caret-down"></i>
                        </button>
                    </div>
                </li>
                <div class="collapse" id="collapseEditStation${data.id}">
                  ${innerTable}
                </div>`
    });

    // Update the wish list and the sum DOM elements
    listSel.append(html);
};