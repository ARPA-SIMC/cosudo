let DataCollection = function () {
    // Here we store the Wish objects
    this.data = [];
};

DataCollection.prototype.add = function (data) {
    this.data.push(data);
};

DataCollection.prototype.addMultiple = function (dataArray) {
    this.data.push(...dataArray);
};

DataCollection.prototype.getAll = function () {
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
