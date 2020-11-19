let EditDataHistoryCollection = function () {
    // Here we store the Wish objects
    this.data = [];
};


EditDataHistoryCollection.prototype.add = function (data) {
    this.data.push(data);
};
EditDataHistoryCollection.prototype.set = function (data) {
    this.data = data;
};

EditDataHistoryCollection.prototype.addMultiple = function (dataArray) {
    this.data.push(...dataArray);
};


EditDataHistoryCollection.prototype.getAll = function () {
    return this.data;
};


EditDataHistoryCollection.prototype.subscribe = function () {
    const self = this;

    $.Topic("edit-data-history-add").subscribe(function (data) {
        self.add(data);
    });
    $.Topic("edit-data-history-set").subscribe(function (data) {
        self.set(data);
    });
    $.Topic("edit-data-history-add-array").subscribe(function (dataArray) {
        self.addMultiple(dataArray);
    });
};
