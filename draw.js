//mapboxToken pour satellite map
var mapboxToken = 'pk.eyJ1IjoiYWdyaWxsaWFuY2UiLCJhIjoiY2lmM3hxNnlzMzAwZ3NxbTU4OWJjemcwayJ9.1dwiZmxEP5Hdl3BzHeOkiA';//public
//layer parcelles
var parcelles = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33'
            })
          })
        })
      });


//creation de la map
var map = new ol.Map({
  target: 'map',
  layers: [
  /*  new ol.layer.Tile({
      source: new ol.source.OSM()
    }),*/
    new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token='+mapboxToken
      })
    }),
    parcelles
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-73, 50]),
    zoom: 5
  })
});

var Modify = {
  init: function() {
    this.select = new ol.interaction.Select();
    map.addInteraction(this.select);

    this.modify = new ol.interaction.Modify({
      features: this.select.getFeatures()
    });
    map.addInteraction(this.modify);

    this.setEvents();
  },
  setEvents: function() {
    var selectedFeatures = this.select.getFeatures();

    this.select.on('change:active', function() {
      selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
    });
  },
  setActive: function(active) {
    this.select.setActive(active);
    this.modify.setActive(active);
  }
};
Modify.init();

var optionsForm = document.getElementById('options-form');

var Draw = {
  init: function() {
    map.addInteraction(this.Point);
    this.Point.setActive(false);
    map.addInteraction(this.LineString);
    this.LineString.setActive(false);
    map.addInteraction(this.Polygon);
    this.Polygon.setActive(false);
  },
  Point: new ol.interaction.Draw({
    source: parcelles.getSource(),
    type: /** @type {ol.geom.GeometryType} */ ('Point')
  }),
  LineString: new ol.interaction.Draw({
    source: parcelles.getSource(),
    type: /** @type {ol.geom.GeometryType} */ ('LineString')
  }),
  Polygon: new ol.interaction.Draw({
    source: parcelles.getSource(),
    type: /** @type {ol.geom.GeometryType} */ ('Polygon')
  }),
  getActive: function() {
    return this.activeType ? this[this.activeType].getActive() : false;
  },
  setActive: function(active) {
    var type = optionsForm.elements['draw-type'].value;
    if (active) {
      this.activeType && this[this.activeType].setActive(false);
      this[type].setActive(true);
      this.activeType = type;
    } else {
      this.activeType && this[this.activeType].setActive(false);
      this.activeType = null;
    }
  }
};
Draw.init();


/**
 * Let user change the geometry type.
 * @param {Event} e Change event.
 */
optionsForm.onchange = function(e) {
  var type = e.target.getAttribute('name');
  var value = e.target.value;
  if (type == 'draw-type') {
    Draw.getActive() && Draw.setActive(true);
  } else if (type == 'interaction') {
    if (value == 'modify') {
      Draw.setActive(false);
      Modify.setActive(true);
    } else if (value == 'draw') {
      Draw.setActive(true);
      Modify.setActive(false);
    }
  }
};

Draw.setActive(true);
Modify.setActive(false);

// The snap interaction must be added after the Modify and Draw interactions
// in order for its map browser event handlers to be fired first. Its handlers
// are responsible of doing the snapping.
var snap = new ol.interaction.Snap({
  source: parcelles.getSource()
});
map.addInteraction(snap);
