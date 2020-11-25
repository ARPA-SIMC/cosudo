let StationCollection = function () {
    // Here we store the Wish objects
    this.data = [];
};

StationCollection.prototype.add = function (data) {
    this.data.push(data);
};

StationCollection.prototype.addMultiple = function (dataArray) {
    this.data.push(...dataArray);
};

StationCollection.prototype.getAll = function () {
    return this.data;
};


/*StationCollection.prototype.subscribe = function () {
    const self = this;

    $.Topic("data-add").subscribe(function (data) {
        self.add(data);
    });

    $.Topic("data-remove").subscribe(function (data) {
        self.remove(data);
    });

    $.Topic("data-remove-all").subscribe(function () {
        self.removeAll();
    });
};*/
