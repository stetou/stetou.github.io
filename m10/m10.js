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

var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(19);
var matrixIds = new Array(19);
for (var z = 0; z < 19; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}
/*
var defaults = {
        requestEncoding: "REST",
        matrixSet: "EPSG_3857",
        format: "image/png",
		opacity: 0.7,
		isBaseLayer: true
    };
	*/
  /*
	var orthos = new OpenLayers.Layer.WMTS(OpenLayers.Util.applyDefaults({
        name:"Orthophotographies (Gouvernement du Quebec)",
        url: "./orthos.php?TILEMATRIXSET={TileMatrixSet}&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}",
        layer: "orthos",
        style: "default"
    },
    defaults));
	oMap.addLayer( orthos );
*/


var attribution = new ol.Attribution({
  html: 'Tiles &copy; <a href="http://services.arcgisonline.com/arcgis/rest/' +
      'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</a>'
});
//creation de la map
var map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      opacity: 0.7,
      extent: projectionExtent,
      source: new ol.source.WMTS({
        attributions: [attribution],
url: "./orthos.php?TILEMATRIXSET={TileMatrixSet}&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}",
        //url: 'http://www.geomsp.qc/carto/wmts',
        layer: 'orthos',
        matrixSet: 'EPSG:3857',
        format: 'image/png',
        projection: ol.proj.get('EPSG:3857'),
        tileGrid: new ol.tilegrid.WMTS({
          origin: ol.extent.getTopLeft(projectionExtent),
          resolutions: resolutions,
          matrixIds: matrixIds
        }),
        style: 'default'
      })
    })
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
