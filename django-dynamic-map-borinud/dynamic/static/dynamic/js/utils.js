Chart.plugins.register({
    beforeDraw: function (c) {
        let ctx = c.chart.ctx;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, c.chart.width, c.chart.height);
    }
});
(function (L) {
    /*
    * by tonekk. 2014, MIT License
    */

    L.ExtendedDivIcon = L.DivIcon.extend({
        createIcon: function (oldIcon) {
            let div = L.DivIcon.prototype.createIcon.call(this, oldIcon);

            if (this.options.id) {
                div.id = this.options.id;
            }

            if (this.options.style) {
                for (let key in this.options.style) {
                    div.style[key] = this.options.style[key];
                }
            }
            return div;
        }
    });

    L.extendedDivIcon = function (options) {
        return new L.ExtendedDivIcon(options);
    }
})(window.L);

L.Control.Layers.include({
    getActiveOverlays: function () {

        // Create array for holding active layers
        let active = [];
        let control = this;

        // Iterate all layers in control
        control._layers.forEach(function (obj) {
            // Check if it's an overlay and added to the map
            if (obj.overlay && control._map.hasLayer(obj.layer)) {
                // Push layer to active array
                active.push(obj.layer);
            }
        });

        // Return array
        return active;
    }
});
Chart.defaults.global.legend.display = false;
let colors = ['#3030ff', '#007885', '#00855D', '#0D8500', '#478500', '#788500', '#853C00', '#850000'];

function getColorIndex(d, min, max) {
    let delta = (max - min) / (colors.length);
    return Math.max(0, Math.min(colors.length - 1, Math.floor((d - min) / delta)));
}


function getColor(d, min, max) {
    return colors[getColorIndex(d, min, max)];
}

function null2_(i) {
    return (i === null) ? "-" : i;
}

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function degToCompass(num) {
    let val = Math.floor((num / 22.5) + 0.5);
    let arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}

function getIndexCompass(num) {
    return Math.round(num / 45) % 8;
}

function windClassification(speedValue) {
    if (speedValue <= 5) {
        return "0-5 m/s"
    } else if (speedValue > 5 && speedValue <= 20) {
        return "6-20 m/s"
    } else if (speedValue > 20) {
        return ">20 m/s"
    }
}

let windColors = ["rgb(203,201,226)", "rgb(158,154,200)", "rgb(106,81,163)"]

function normalizeString(val) {
    if (val === null)
        return "0"
    return val.toString()
}

$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }

        if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
            // Only send the token to relative URLs i.e. locally.
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    }
});

function isMarkerInsidePolygon(marker, poly) {
    let polyPoints = poly.getLatLngs()[0];
    let x = marker.position.lat, y = marker.position.lng;

    let inside = false;
    for (let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        let xi = polyPoints[i].lat, yi = polyPoints[i].lng;
        let xj = polyPoints[j].lat, yj = polyPoints[j].lng;

        let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

function roundValue(value) {
    return value.toPrecision(5).replace(/(\.\d*?[0-9])0+$/g, "$1")
}

function copyToClipBoard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

function printDiv(id) {
    var container = document.getElementById(id);
    html2canvas(container).then((canvas) => {
        let canvasImg = canvas.toDataURL("image/jpg");
        printJS({printable: canvasImg, type: 'image', imageStyle: 'width:100%', modal: true, documentTitle: ""});

    });
}

function explodeCapabiltiesTimeRange(timeRange) {
    let tr = timeRange.split("/")
    let result = []
    let startTime = new Date(Date.parse(tr[0]));
    let endTime = new Date(Date.parse(tr[1]));
    let period = (tr.length > 2 && tr[2].length) ? tr[2] : "P1D";
    let duration = nezasa.iso8601.Period.parse(period, true);
    let currentTime = new Date(startTime.getTime());
    while (currentTime < endTime) {
        result.push(moment(currentTime.getTime()).format("YYYY-MM-DDTHH:mm:ss"));
        let utc = true;
        let l = duration.length;
        let get = utc ? "getUTC" : "get";
        let set = utc ? "setUTC" : "set";
        if (l > 0 && duration[0] != 0) {
            currentTime[set + "FullYear"](currentTime[get + "FullYear"]() + duration[0]);
        }
        if (l > 1 && duration[1] != 0) {
            currentTime[set + "Month"](currentTime[get + "Month"]() + duration[1]);
        }
        if (l > 2 && duration[2] != 0) {
            currentTime[set + "Date"](currentTime[get + "Date"]() + (duration[2] * 7));
        }
        if (l > 3 && duration[3] != 0) {
            currentTime[set + "Date"](currentTime[get + "Date"]() + duration[3]);
        }
        if (l > 4 && duration[4] != 0) {
            currentTime[set + "Hours"](currentTime[get + "Hours"]() + duration[4]);
        }
        if (l > 5 && duration[5] != 0) {
            currentTime[set + "Minutes"](currentTime[get + "Minutes"]() + duration[5]);
        }
        if (l > 6 && duration[6] != 0) {
            currentTime[set + "Seconds"](currentTime[get + "Seconds"]() + duration[6]);
        }
    }
    if (currentTime >= endTime) {
        result.push(moment(endTime.getTime()).format("YYYY-MM-DDTHH:mm:ss"));
    }
    return result
}

function getTimesFromGetCapabilities(time) {
    const timeRanges = time.values.split(",")
    let result = []
    for (let i in timeRanges) {
        let timeRange = timeRanges[i].replace(/Z/g, "")
        if (timeRange.split("/").length === 3) {
            result = result.concat(explodeCapabiltiesTimeRange(timeRange))
        } else {
            result.push(timeRange);
        }
    }
    return result
}

function setPopup(data, selected_values) {
    let popupText =
        "<div>" +
        "Ident: " +
        null2_(data.ident) +
        "<br>Lon: " +
        data.lon / 100000 +
        "<br>Lat: " +
        data.lat / 100000 +
        "<br>Network: " +
        data.network +
        "<br>Trange: " +
        borinud.config.trange.describe(
            data.trange[0],
            data.trange[1],
            data.trange[2]
        ) +
        "<br>Level: " +
        borinud.config.level.describe(
            data.level[0],
            data.level[1],
            data.level[2],
            data.level[3]
        ) +
        "<br>Date: " +
        data.date;
    data.data.forEach((item) => {
        for (let key in item.vars) {
            let b = borinud.config.B[key];
            popupText +=
                "<br>Var: " +
                b.description +
                " " +
                item.vars[key].v +
                " (" +
                b.unit +
                ")";
            if (Object.keys(item.vars[key].a).length > 0) {
                popupText += "<br><ul>";
                for (let keyAttr in item.vars[key].a) {
                    let attr = item.vars[key].a[keyAttr];
                    popupText += keyAttr + ": " + attr;
                }
                popupText += "</ul>";
            }
        }
    });
    popupText += `<br><button data-id="${data.indexCol}" type="button" class="btn btn-primary btn-block open-graph" >Add to graph</button>`;
    if (
        selected_values.vars === "B11001" ||
        selected_values.vars === "B11002"
    ) {
        popupText += `<button data-id="${data.indexCol}" type="button" class="btn btn-primary btn-block open-wind-graph " >Show wind rose graph</button>`;
    }
    popupText += "</div>";
    return popupText;
}

function clusterCheckInvalid(cluster, bcodeKey) {
    for (let item in cluster) {
        if (
            bcodeKey in cluster[item].data.data[0].vars &&
            "B33196" in cluster[item].data.data[0].vars[bcodeKey].a
        )
            return true;
    }
    return false;
}

function preparePruneClusterSimple(pruneCluster, selectedObj) {
    pruneCluster.PrepareLeafletMarker = function (leafletMarker, data) {
        let text =
            "Ident: " +
            null2_(data.ident) +
            "<br>Lon: " +
            data.lon / 100000 +
            "<br>Lat: " +
            data.lat / 100000 +
            "<br>Network: " +
            data.network;
        if (selectedObj === "constantStationData") {
            text +=
                "<br>" + borinud.config.B[data.var].description + " :" + data.val;
        }
        if (leafletMarker.getPopup()) {
            leafletMarker.setPopupContent(text);
        } else {
            leafletMarker.bindPopup(text);
        }
    };
    pruneCluster.BuildLeafletClusterIcon = function (cluster) {
        return PruneClusterForLeaflet.prototype.BuildLeafletClusterIcon.call(
            this,
            cluster
        );
    };
}

function preparePruneClusterWind(pruneCluster) {
    pruneCluster.BuildLeafletClusterIcon = function (cluster) {
        let markersCluster = cluster.GetClusterMarkers();
        let bcodeKey = $("#vars").val();
        L.Icon.MarkerCluster = L.Icon.extend({
            options: {
                iconSize: new L.Point(100, 100),
                className: "prunecluster leaflet-markercluster-icon",
            },

            createIcon: function () {
                let e = document.createElement("canvas");
                this._setIconStyles(e, "icon");
                let s = this.options.iconSize;
                e.width = s.x;
                e.height = s.y;
                this.draw(e.getContext("2d"), s.x, s.y);
                return e;
            },

            createShadow: function () {
                return null;
            },

            draw: function (canvas, width, height) {
                let windDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
                canvas.textAlign = "center";
                canvas.textBaseline = "top";
                canvas.font = "bold 10px sans-serif";
                canvas.strokeStyle = "grey";
                canvas.lineWidth = 0.5;
                canvas.moveTo(50, 5);
                canvas.lineTo(50, 95);
                canvas.moveTo(5, 50);
                canvas.lineTo(95, 50);
                canvas.stroke();
                canvas.fillStyle = "grey";
                canvas.fillText("N", 50, 0, 20);
                canvas.textBaseline = "middle";
                canvas.fillText("E", 96, 50, 20);
                canvas.textBaseline = "bottom";
                canvas.fillText("S", 50, 100, 20);
                canvas.textBaseline = "middle";
                canvas.fillText("W", 4, 50, 20);
                for (let i = 0, l = windDirections.length; i < l; ++i) {
                    let maxHeight = 36;
                    var size = (this.stats[i] * maxHeight) / this.population;
                    let radiusSize = size < 0 || isNaN(size) ? 0 : size;
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
                            canvas.arc(
                                50,
                                50,
                                radiusSize + 4,
                                1.375 * Math.PI,
                                1.625 * Math.PI
                            );
                            break;
                        case 1:
                            canvas.arc(
                                50,
                                50,
                                radiusSize + 4,
                                1.625 * Math.PI,
                                1.875 * Math.PI
                            );
                            break;
                        case 2:
                            canvas.arc(
                                50,
                                50,
                                radiusSize + 4,
                                1.875 * Math.PI,
                                0.125 * Math.PI
                            );
                            break;
                        case 3:
                            canvas.arc(
                                50,
                                50,
                                radiusSize + 4,
                                0.125 * Math.PI,
                                0.375 * Math.PI
                            );
                            break;
                        case 4:
                            canvas.arc(
                                50,
                                50,
                                radiusSize + 4,
                                0.375 * Math.PI,
                                0.625 * Math.PI
                            );
                            break;
                        case 5:
                            canvas.arc(
                                50,
                                50,
                                radiusSize + 4,
                                0.625 * Math.PI,
                                0.875 * Math.PI
                            );
                            break;
                        case 6:
                            canvas.arc(
                                50,
                                50,
                                radiusSize + 4,
                                0.875 * Math.PI,
                                1.125 * Math.PI
                            );
                            break;
                        case 7:
                            canvas.arc(
                                50,
                                50,
                                radiusSize + 4,
                                1.125 * Math.PI,
                                1.375 * Math.PI
                            );
                            break;
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
            },
        });
        let e = new L.Icon.MarkerCluster();
        e.stats = cluster.stats;
        e.population = cluster.population;

        //this try to make the little values more visible (no less of 5%)
        for (let i = 0, l = e.stats.length; i < l; ++i) {
            if (e.stats[i] > 0 && e.stats[i] / e.population < 0.1) {
                let inc = e.population * 0.05 - e.stats[i];
                e.stats[i] += inc;
                e.population += inc;
            }
        }

        return e;
    };
}

function preparePruneClusterAllData(pruneCluster, max, min, pi2, bcode, selectedValues) {
    pruneCluster.BuildLeafletClusterIcon = function (cluster) {
        let markersCluster = cluster.GetClusterMarkers();

        let bcodeKey = selectedValues.vars;

        L.Icon.MarkerCluster = L.Icon.extend({
            options: {
                iconSize: new L.Point(100, 100),
                className: "prunecluster leaflet-markercluster-icon",
            },

            createIcon: function () {
                let e = document.createElement("canvas");
                this._setIconStyles(e, "icon");
                let s = this.options.iconSize;
                e.width = s.x;
                e.height = s.y;
                this.draw(e.getContext("2d"), s.x, s.y);
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
                    canvas.fill();
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
                canvas.fillStyle = "#111";
                canvas.textAlign = "center";
                canvas.textBaseline = "middle";
                canvas.font = "bold 10px sans-serif";
                //canvas.fillText(this.population, 22, 22,28);
                let halfdelta = (max - min) / (colors.length * 2);
                let grade = min + halfdelta * (prevalentindex * 2 + 1);
                grade = roundValue(grade * bcode.scale + bcode.offset);
                canvas.fillText(grade, 50, 50, 28);
            },
        });
        let e = new L.Icon.MarkerCluster();
        e.stats = cluster.stats;
        e.population = cluster.population;

        //this try to make the little values more visible (no less of 5%)
        for (let i = 0, l = e.stats.length; i < l; ++i) {
            if (e.stats[i] > 0 && e.stats[i] / e.population < 0.1) {
                let inc = e.population * 0.05 - e.stats[i];
                e.stats[i] += inc;
                e.population += inc;
            }
        }

        return e;
    };
}

function prepareMarker(pruneCluster, selectedValues, bcode, min, max) {
    pruneCluster.PrepareLeafletMarker = function (leafletMarker, data) {
        if (leafletMarker.getPopup()) {
            leafletMarker.setPopupContent(setPopup(data, selectedValues));
        } else {
            leafletMarker.bindPopup(setPopup(data, selectedValues));
        }
        let val = roundValue(data.value * bcode.scale + bcode.offset);
        let vallen = val.length * 6 + 6;

        leafletMarker.setIcon(
            L.extendedDivIcon({
                iconSize: new L.Point(vallen, 14),
                labelAnchor: [vallen / 2, 0],
                html: val,
                className: "myDivIcon",
                style: {backgroundColor: getColor(data.value, min, max)},
            })
        );
        let bcodeKey = $("#vars").val();
        if (
            bcodeKey in data.data[0].vars &&
            "B33196" in data.data[0].vars[bcodeKey].a
        ) {
            vallen += 4;
            leafletMarker.setIcon(
                L.extendedDivIcon({
                    iconSize: new L.Point(vallen, 18),
                    labelAnchor: [vallen / 2, 0],
                    html: val,
                    className: "myDivIcon",
                    style: {
                        backgroundColor: getColor(data.value, min, max),
                        borderColor: "rgba(255, 51, 51, 1)",
                        borderWidth: "2px",
                    },
                })
            );
        }
        leafletMarker.bindTooltip(data.date.toString());
        let dataCopy = {...data};
        delete dataCopy.indexCol;
        leafletMarker.on("contextmenu", function () {
            let r = confirm("Add to edit table?");
            if (r) {
                $.Topic("data-add").publish(dataCopy);
                toastr.success("Done!");
            }
        });
    };
}

function getMarker(feature, selectedValues, coords) {
    let marker = new PruneCluster.Marker(
        feature.lat / 100000,
        feature.lon / 100000
    );
    marker.data = feature;
    marker.data.value = 0;
    feature.data.forEach((item) => {
        if (selectedValues.vars in item.vars) {
            marker.data.value = item.vars[selectedValues.vars].v;
            marker.data.trange = item.timerange;
            marker.data.level = item.level;
        }
    });
    return marker
}



/*
    $("#sidebar").resizable({
        handles: 'e', stop: function (e, ui) {
            widthMenu = document.getElementById('sidebar').offsetWidth;
        }
    });
*/