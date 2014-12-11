var vlq = require('./vlq');
var fields = ['generatedColumn', 'source', 'originalLine', 'originalColumn', 'name'];

module.exports = Coder;
function Coder() {}

Coder.prototype.decode = function(mapping) {
  var value = this.rawDecode(mapping);
  var output = {};

  for (var i=0; i<fields.length;i++) {
    var field = fields[i];
    if (value.hasOwnProperty(field)) {
      var prevField = 'prev_' + field;
      output[field] = value[field];
      if (typeof this[prevField] !== 'undefined') {
        output[field] += this[prevField];
      }
      this[prevField] = output[field];
    }
  }
  return output;
};

Coder.prototype.encode = function(value) {
  var output = '';
  for (var i=0; i<fields.length;i++) {
    var field = fields[i];
    if (value.hasOwnProperty(field)){
      var prevField = 'prev_' + field;
      var valueField = value[field];
      if (typeof this[prevField] !== 'undefined') {
        output += vlq.encode(valueField-this[prevField]);
      } else {
        output += vlq.encode(valueField);
      }
      this[prevField] = valueField;
    }
  }
  return output;
};

Coder.prototype.resetColumn = function() {
  this.prev_generatedColumn = null;
};

Coder.prototype.adjustLine = function(n) {
  this.prev_originalLine += n;
};

Coder.prototype.rawDecode = function(mapping) {
  var buf = {rest: mapping};
  var output = {};
  var fieldIndex = 0;
  while (fieldIndex < fields.length && buf.rest.length > 0) {
    vlq.decode(buf.rest, buf);
    output[fields[fieldIndex]] = buf.value;
    fieldIndex++;
  }
  return output;
};
