let GraphView = function (queryCollection, urlBorinud, sidebar, overlay, websiteDomainAndSchema) {
    this.queryData = queryCollection;
    this.urlBorinud = urlBorinud;
    this.sidebar = sidebar;
    this.chart = undefined;
    this.overlay = overlay;
    this.websiteDomain = websiteDomainAndSchema
};

GraphView.prototype.initEvents = function () {
    const self = this;

    self.publishers();
    self.subscribers();

    $(window).on("resize", function () {
        $("#sidebarChart").css({height: $("#sidebar").height() + "px"});
    });

    $(window).resize();

    self.sidebar.on("content", function (e) {
        if (e.id === "chart-tab") {
            $("#sidebarChart").show();
        } else {
            $("#sidebarChart").hide();
        }
    });
};

GraphView.prototype.publishers = function () {
    const self = this;

    $(document.body).on("click", ".removeTrace", function () {
        let id = $(this).attr("data-id");
        $.Topic("query-remove").publish(id);
    });

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
            returnResult[item] = $(`select[name="${item}Graph"]`).val();
        });
        let date = $("#datetimepickerGraph").datetimepicker("viewDate");
        returnResult["date"] = moment(date).format("YYYY-MM-DD");
        return returnResult;
    }

    $("#showGraphButton").on("click", function () {
        if ($("select[name='varsGraph']").val() !== "*") {
            let selectedValues = getSelectedValues();
            $.Topic("query-add").publish(selectedValues);
        } else {
            toastr.error("Select a var!");
        }
    });
    $(document.body).on("click", "#showWindRose", function () {
        let selectedValues = getSelectedValues();
        //create request url
        let urlDir =
            `${self.urlBorinud}/dbajson/${selectedValues.ident}/${selectedValues.lon_lat}/` +
            `${selectedValues.network}/${selectedValues.timerange}/${selectedValues.level}/B11001/` +
            `spatialseries/${selectedValues.date.split("-")[0]}/${
                selectedValues.date.split("-")[1]
            }/${selectedValues.date.split("-")[2]}` +
            `${selectedValues.hour !== "*" ? "/" + selectedValues.hour : ""}?dsn=${
                selectedValues.dsn
            }`;
        let urlSpeed =
            `${self.urlBorinud}/dbajson/${selectedValues.ident}/${selectedValues.lon_lat}/` +
            `${selectedValues.network}/${selectedValues.timerange}/${selectedValues.level}/B11002/` +
            `spatialseries/${selectedValues.date.split("-")[0]}/${
                selectedValues.date.split("-")[1]
            }/${selectedValues.date.split("-")[2]}` +
            `${selectedValues.hour !== "*" ? "/" + selectedValues.hour : ""}?dsn=${
                selectedValues.dsn
            }`;

        openGraphWind(urlDir, urlSpeed, self.overlay);
    });
};

GraphView.prototype.subscribers = function () {
    const self = this;

    $.Topic("query-add").subscribe(function () {
        self.render();
    });

    $.Topic("query-remove").subscribe(function () {
        self.render();
    });

    $.Topic("query-remove-all").subscribe(function () {
        self.render();
    });
};

GraphView.prototype.render = function () {
    const self = this;
    self.overlay.fadeIn(300);

    function getUrlGraph(data) {
        let url =
            `${self.urlBorinud}/dbajson/${null2_(data.ident)}/${data.lon_lat}/` +
            `${null2_(data.network)}/${data.timerange}/${null2_(data.level)}/${
                data.vars
            }/` +
            `timeseries/${data.date.split("-")[0]}/${data.date.split("-")[1]}/${
                data.date.split("-")[2]
            }` +
            `${data.hour !== "*" ? "/" + data.hour : ""}?dsn=${data.dsn}&query=attr`
        ;
        const copyUrl = url.indexOf("http://") === 0 || url.indexOf("https://") === 0 ? url : `${self.websiteDomain}${url}`
        $("#url-borinud-graph").attr("data-url", copyUrl)
        return url
    }

    async function getDataGraph() {
        let dataSet = [];
        for (const [index, queryData] of self.queryData.data.entries()) {
            let collection = await $.ajax({
                url: getUrlGraph(queryData),
                dataType: "json",
            });
            let data_dict = {};
            collection.forEach((feature) => {
                let bcode = Object.keys(feature.data[0].vars)[0];
                let valBcode = {
                    bcode: bcode,
                    description: "Undefined",
                    unit: "Undefined",
                    offset: 0,
                    scale: 1,
                    userunit: "",
                };
                if (bcode in borinud.config.B) {
                    valBcode = borinud.config.B[bcode]
                }
                if (!("offset" in valBcode)) {
                    valBcode = {...valBcode, offset: 0}
                }
                if (!("scale" in valBcode)) {
                    valBcode = {...valBcode, scale: 1}
                }

                let val = (feature.data[0].vars[Object.keys(feature.data[0].vars)[0]].v * valBcode.scale + valBcode.offset)
                    .toPrecision(5)

                if (borinud.config.B[bcode] !== undefined) {
                    bcode =
                        valBcode.description +
                        " " +
                        valBcode.unit;
                }
                let trange = borinud.config.trange.describe(
                    ...feature.data[0].timerange
                );
                let level = borinud.config.level.describe(...feature.data[0].level);
                let key = `IDENT:${null2_(feature.ident)}|LAT_LON:${
                    feature.lat.toString() + "," + feature.lon.toString()
                }|NETWORK: ${
                    feature.network
                }|TIMERANGE: ${trange}|LEVEL:${level}|BCODE:${bcode}`;
                if (!(key in data_dict)) data_dict[key] = {data: [], pointBg: []};
                data_dict[key].data.push({
                    x: new Date(feature.date),
                    y: val,
                    data: feature,
                });
                if (
                    "B33196" in
                    feature.data[0].vars[Object.keys(feature.data[0].vars)[0]].a
                )
                    data_dict[key].pointBg.push("red");
                else data_dict[key].pointBg.push("green");
            });
            for (let key in data_dict)
                dataSet.push({
                    data: data_dict[key].data,
                    fill: false,
                    borderColor: getRandomColor(),
                    pointBackgroundColor: data_dict[key].pointBg,
                    tooltip: key,
                    index: index,
                    pointRadius: 5,
                    pointHoverRadius: 5,
                    lineTension: 0,
                });
        }
        return dataSet;
    }

    function popDescription(str) {
        return str.split(":").pop();
    }

    //let response = await getDataGraph()
    getDataGraph().then((datasets) => {
        document.querySelector("#chart-container").innerHTML =
            '<canvas id="chart"></canvas>';
        var ctx = document.getElementById("chart").getContext("2d");
        self.chart = new Chart(ctx, {

            // The type of chart we want to create
            type: "line",
            // The data for our dataset
            data: {
                datasets: datasets,
            },
            options: {

                onClick: function (evt) {
                    var element = self.chart.getElementAtEvent(evt);
                    if (element.length > 0) {
                        let datasetIndex = element[0]._datasetIndex;
                        let elementIndex = element[0]._index;
                        let r = confirm("Add to edit table?");
                        if (r) {
                            let dataCopy = {
                                ...self.chart.data.datasets[datasetIndex].data[elementIndex]
                                    .data,
                            };
                            dataCopy.value =
                                dataCopy.data[0].vars[Object.keys(dataCopy.data[0].vars)[0]].v;
                            dataCopy.trange = dataCopy.data[0].timerange;
                            dataCopy.level = dataCopy.data[0].level;
                            $.Topic("data-add").publish(dataCopy);
                            toastr.success("Done!");
                        }
                    }
                },
                scales: {
                    xAxes: [
                        {
                            type: "time",
                            time: {
                                parser: "D/M/YYYY, H:mm:ss",
                                displayFormats: {
                                    millisecond: "DD/MM/YYYY HH:mm:ss",
                                    second: "DD/MM/YYYY HH:mm:ss",
                                    minute: "DD/MM/YYYY HH:mm:ss",
                                    hour: "DD/MM/YYYY HH:mm:ss",
                                    day: "DD/MM/YYYY HH:mm:ss",
                                    week: "DD/MM/YYYY HH:mm:ss",
                                    month: "DD/MM/YYYY HH:mm:ss",
                                    quarter: "DD/MM/YYYY HH:mm:ss",
                                    year: "DD/MM/YYYY HH:mm:ss",
                                },
                                tooltipFormat: "DD/MM/YYYY HH:mm:ss",
                            },
                        },
                    ],
                },
                tooltips: {
                    callbacks: {
                        afterLabel: function (tooltipItem, data) {
                            var label = data.datasets[tooltipItem.datasetIndex].tooltip.split(
                                "|"
                            );
                            return label;
                        },
                    },
                },

                /*   animation: {
                  onComplete: function (e) {
                    this.options.animation.onComplete = null;
                    // remove loading spinner
                    jQuery("#loadingChart").hide();
                    // create image from canvas
                    let url = self.chart.toBase64Image();
                    // set download link to button
                    let button = document.getElementById("printGraph");
                    button.href = url;
                    // enable button download
                    button.removeAttribute("disabled");
                  },
                }, */
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: "xy",
                        },
                        zoom: {
                            enabled: true,
                            mode: "xy",
                        },
                    },
                },
            },
        });
        let trs = ``;
        let queryDict = {};
        datasets.forEach((dataset) => {
            if (!(dataset.index in queryDict)) {
                queryDict[dataset.index] = [];
            }
            queryDict[dataset.index].push(dataset);
        });
        for (key in queryDict) {
            queryDict[key].forEach((dataset, index) => {
                tooltipInfo = dataset.tooltip.split("|");
                if (index == 0) {
                    trs += `<tr data-id="${dataset.index}"><td rowspan="${queryDict[key].length}"><button data-id="${dataset.index}" class="btn btn-danger removeTrace btn-sm"><i class="fa fa-trash"></i></button></td>`;
                } else {
                    trs += `<tr data-id="${dataset.index}">`;
                }
                trs += `<td style="background-color:${
                    dataset.borderColor
                };min-width: 40px;"></td><td>${popDescription(tooltipInfo[0])}</td><td>${popDescription(
                    tooltipInfo[1]
                )}</td><td>${popDescription(tooltipInfo[2])}</td><td>${popDescription(
                    tooltipInfo[3]
                )}</td><td>${popDescription(tooltipInfo[4])}</td><td>${popDescription(
                    tooltipInfo[5]
                )}</td></tr>`;
            });
        }
        let table = `<table id="tableChart" class="table table-sm table-bordered table-hover table-striped ">
    <thead><tr><th></th><th></th><th>Ident</th><th>Lat lon</th><th>Network</th><th>Timerange</th><th>Level</th><th>Bcode</th></tr></thead>
    <tbody>${trs}</tbody>
    </table>`;
        $("#tableChart").html(table);
        self.overlay.fadeOut(300);
    });
};
