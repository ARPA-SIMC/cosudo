let EditTabView = function (urlBorinud, map, pruneCluster, overlay, pruneCluster) {
    this.stations = [];
    this.urlBorinud = urlBorinud
    this.map = map
    this.overlay = overlay
    this.stationsMarkers = []
    this.pruneCluster = pruneCluster
};

EditTabView.prototype.initEvents = function () {
    const self = this;

    $('.edit-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        e.target // newly activated tab
        e.relatedTarget // previous active tab
        let url = `${self.urlBorinud}/geojson/*/*/*/*/*/*/stations`
        if (e.target.id === "stations-tab") {
            $.ajax({
                url: url,
                dataType: "json",
                success: function (collection) {
                    hours = ["*"]
                    self.stations = collection.features
                    self.render()
                },
                beforeSend: function () {
                    self.overlay.fadeIn(300);
                },
                complete: function () {
                    self.overlay.fadeOut(300);
                },

            })
        } else {
            self.stations = []
            self.render()
        }
    })
}
EditTabView.prototype.render = function (collection = []) {
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
            coords.push([station.geometry.coordinates[1], station.geometry.coordinates[0]]);
            let marker = new PruneCluster.Marker(station.geometry.coordinates[1], station.geometry.coordinates[0])
            marker.data = station.properties
            marker.data.station = true
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