let QueryCollection = function () {
  // Here we store the Wish objects
  this.data = [];
};

QueryCollection.prototype.add = function (data) {
  if (
    !this.data
      .map((item) => JSON.stringify(item))
      .includes(JSON.stringify(data))
  )
    this.data.push(data);
};

QueryCollection.prototype.remove = function (index) {
  this.data.splice(index, 1);
};

QueryCollection.prototype.getAll = function () {
  return this.data;
};

QueryCollection.prototype.removeAll = function () {
  this.data = [];
};

QueryCollection.prototype.subscribe = function () {
  const self = this;

  $.Topic("query-add").subscribe(function (data) {
    console.log(data);
    self.add(data);
  });
  $.Topic("query-remove").subscribe(function (index) {
    self.remove(index);
  });

  $.Topic("query-remove-all").subscribe(function () {
    self.removeAll();
  });
};
