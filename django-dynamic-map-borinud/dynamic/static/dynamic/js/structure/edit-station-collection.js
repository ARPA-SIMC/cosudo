let EditStationCollection = function () {
    // Here we store the Wish objects
    this.data = [];
};

function getArrayStrings(data) {
    return [data.ident,
        normalizeString(data.lon),
        normalizeString(data.lat),
        data.network]
}

EditStationCollection.prototype.add = function (data) {


    if (!(this.data.map((item) => JSON.stringify(getArrayStrings(item))).includes(JSON.stringify(getArrayStrings(data)))))
        this.data.push(data);
};

EditStationCollection.prototype.addMultiple = function (dataArray) {
    dataArray.forEach((newStation) => {
        if (!(this.data.map((item) => JSON.stringify(getArrayStrings(item))).includes(JSON.stringify(getArrayStrings(newStation)))))
            this.data.push(newStation);
    })
};

EditStationCollection.prototype.getAll = function () {
    return this.data;
};

EditStationCollection.prototype.remove = function (index) {
    this.data.splice(index, 1);
};
EditStationCollection.prototype.removeAll = function () {
    this.data = []
}


EditStationCollection.prototype.subscribe = function () {
    const self = this;

    $.Topic("station-add").subscribe(function (data) {
        self.add(data);
    });

    $.Topic("station-remove").subscribe(function (data) {
        self.remove(data);
    });

    $.Topic("station-add-multiple").subscribe(function (dataArray) {
        self.addMultiple(dataArray);
    });

    $.Topic("station-remove-all").subscribe(function () {
        self.removeAll();
    });
};
