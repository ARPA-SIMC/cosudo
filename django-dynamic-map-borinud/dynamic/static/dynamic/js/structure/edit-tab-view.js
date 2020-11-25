let EditTabView = function (urlBorinud, map, pruneCluster, overlay, pruneClusterStations, stationCollection) {
    this.stations = [];
    this.allStations = stationCollection;
    this.urlBorinud = urlBorinud
    this.map = map
    this.overlay = overlay
    this.stationsMarkers = []
    this.pruneCluster = pruneClusterStations
};

EditTabView.prototype.initEvents = function () {
    const self = this;

    $('.edit-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        e.target // newly activated tab
        e.relatedTarget // previous active tab
        if (e.target.id === "stations-tab") {
            self.stations = self.allStations.getAll()
        } else {
            self.stations = []
        }
        self.render()
    })
}
EditTabView.prototype.render = function () {
    const self = this
    let pruneCluster = self.pruneCluster

    pruneCluster.RemoveMarkers()
    pruneCluster.RedrawIcons()
    self.stationsMarkers = []
    if (self.stations.length > 0) {
        let coords = []
        pruneCluster.PrepareLeafletMarker = function (leafletMarker, data) {
            let text = "Ident: " + null2_(data.ident) +
                "<br>Lon: " + data.lon / 100000 +
                "<br>Lat: " + data.lat / 100000 +
                "<br>Network: " + data.network
            if (leafletMarker.getPopup()) {
                leafletMarker.setPopupContent(text);
            } else {
                leafletMarker.bindPopup(text);
            }
            leafletMarker.on("contextmenu", function () {
                $.Topic("station-add").publish(data);
            })
        };
        pruneCluster.BuildLeafletClusterIcon = function (cluster) {
            return PruneClusterForLeaflet.prototype.BuildLeafletClusterIcon.call(this, cluster);
        };
        self.stations.forEach((station) => {
            let lon = station.lon / 100000,
                lat = station.lat / 100000
            coords.push([lat, lon]);
            let marker = new PruneCluster.Marker(lat, lon)
            marker.data = station
            self.stationsMarkers.push(marker)
            pruneCluster.RegisterMarker(marker);
        })
        self.map.addLayer(pruneCluster);
        try {
            self.map.fitBounds(coords);
        } catch (err) {
            toastr.error("Error setting bounds...");
        }
    }
}