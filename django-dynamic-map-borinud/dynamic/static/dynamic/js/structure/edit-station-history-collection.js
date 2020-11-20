let EditStationHistoryCollection = function () {
    // Here we store the Wish objects
    this.data = [];
};


EditStationHistoryCollection.prototype.add = function (data) {
    this.data.push(data);
};
EditStationHistoryCollection.prototype.set = function (data) {
    this.data = data;
};

EditStationHistoryCollection.prototype.addMultiple = function (dataArray) {
    this.data.push(...dataArray);
};


EditStationHistoryCollection.prototype.getAll = function () {
    return this.data;
};


EditStationHistoryCollection.prototype.subscribe = function () {
    const self = this;

    $.Topic("edit-station-history-add").subscribe(function (data) {
        self.add(data);
    });
    $.Topic("edit-station-history-set").subscribe(function (data) {
        self.set(data);
    });
    $.Topic("edit-station-history-add-array").subscribe(function (dataArray) {
        self.addMultiple(dataArray);
    });
};
