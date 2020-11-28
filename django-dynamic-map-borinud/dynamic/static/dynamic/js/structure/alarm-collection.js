let AlarmCollection = function () {
  // Here we store the Wish objects
  this.data = [];
};

AlarmCollection.prototype.add = function (data) {
  this.data.push(data);
};

AlarmCollection.prototype.set = function (data) {
  this.data = data;
};

AlarmCollection.prototype.remove = function (index) {
  this.data.splice(index, 1);
};

AlarmCollection.prototype.getAll = function () {
  return this.data;
};

AlarmCollection.prototype.removeAll = function () {
  this.data=[];
};


AlarmCollection.prototype.subscribe = function () {
  const self = this;

  $.Topic("alarm-add").subscribe(function (data) {
    self.add(data);
  });
  $.Topic("alarm-remove").subscribe(function (index) {
    self.remove(index);
  });
  $.Topic("alarm-set").subscribe(function (data) {
    self.set(data);
  });

  $.Topic("alarm-remove-all").subscribe(function () {
    self.removeAll();
  });

};
