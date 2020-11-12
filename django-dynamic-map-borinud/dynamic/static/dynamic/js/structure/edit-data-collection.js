function normalizeString(val) {
    if (val === null)
        return "0"
    return val.toString()
}

function getArrayStrings(data) {
    return [data.ident,
        normalizeString(data.lon),
        normalizeString(data.lat),
        data.network,
        `(${normalizeString(data.trange[0])},${normalizeString(data.trange[1])},${normalizeString(data.trange[2])})`,
        `(${normalizeString(data.level[0])},${normalizeString(data.level[1])},${normalizeString(data.level[2])},${normalizeString(data.level[3])})`,
        Object.keys(data.data[0].vars)[0],
        data.date]
}

let EditDataCollection = function () {
    // Here we store the Wish objects
    this.data = [];
};


EditDataCollection.prototype.add = function (data) {
    if (!(this.data.map((item) => JSON.stringify(getArrayStrings(item))).includes(JSON.stringify(getArrayStrings(data)))))
        this.data.push(data);
};


EditDataCollection.prototype.getAll = function () {
    return this.data;
};


EditDataCollection.prototype.remove = function (index) {

this.data.splice(index, 1);
};
EditDataCollection.prototype.removeAll = function () {
    this.data = []
}


EditDataCollection.prototype.subscribe = function () {
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
};
