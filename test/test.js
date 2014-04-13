"use strict"

var ndarray = require("ndarray")
var ndselect = require("../select.js")
var tape = require("tape")
var pack = require("ndarray-pack")
var unpack = require("ndarray-unpack")

function GetView(data) {
  this._data = data
  this.length = data.length
}
GetView.prototype.get = function(i) {
  return this._data[i]
}
GetView.prototype.set = function(i,v) {
  return this._data[i]=v
}

tape("ndarray-select", function(t) {

  function verifyArray1D(data) {
    var copy = data.slice()
    copy.sort(function(a,b) {
      return a-b
    })
    for(var i=0; i<data.length; ++i) {
      var view = ndarray(data.slice())
      ndselect(view, i)
      t.equals(view.get(i), copy[i])
      view.data.sort()
      t.same(view.data, copy)
      
      var getView = new GetView(data.slice())
      var dview = ndarray(getView)
      ndselect(dview, i)
      t.equals(dview.get(i), copy[i])
      dview.data._data.sort()
      t.same(dview.data._data, copy)

      view.data = data.slice()
      ndselect(view, i, function(a,b) {
        return a.get()-b.get()
      })
      t.equals(view.get(i), copy[i])
      view.data.sort()
      t.same(view.data, copy)
    }
    t.equals(ndselect(ndarray(data), -1), null)
    t.equals(ndselect(ndarray(data), 10000), null) 
  }

  verifyArray1D([0])
  verifyArray1D([5, 4, 3, 2, 1,0])
  verifyArray1D([0,1,2,3,4,5])
  verifyArray1D([1, -1, 0, 1, 1, 2])
  
  function compareArray(a,b) {
    for(var i=0; i<a.length; ++i) {
      var d = a[i] - b[i]
      if(d) { 
        return d
      }
    }
    return 0
  }

  function verifyArray2D(data) {
    var sorted = data.slice()
    sorted.sort(compareArray)
    for(var i=0; i<data.length; ++i) {
      var view = pack(data)
      var section = ndselect(view, i)
      t.same(unpack(section), sorted[i])
      var vdata = unpack(view)
      vdata.sort(compareArray)
      t.same(vdata, sorted)
    }
  }

  verifyArray2D([
    [0, 1, 0],
    [0, 0, 3],
    [0, 0, 2],
    [-1, 0, 1]
    ])

  verifyArray2D([
    [0,0,0,0,1],
    [0,0,0,0,2],
    [0,0,0,0,3],
    [0,0,0,0,4],
    [0,0,0,0,5],
    [0,0,0,0,6],
  ])


  ndselect(pack([
      [[0,0],
       [0,0]],
      [[1,1],
       [1,1]]]), 1)

  t.end()
})