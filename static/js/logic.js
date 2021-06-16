// defining variable for GeoJSON data
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// defining streetmap layer
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
});

// defining darkmap layer
var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});

//defining satellitemap layer
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

// creating earthquake layerGroup
var earthquakes = L.layerGroup();

// creating a baseMaps object to hold base layers
var baseMaps = {
  "Dark Map": darkmap,
  "Satellite Map": satelliteMap,
  "Street Map": streetmap
  };

// creating overlay object to hold overlay layer
var overlayMaps = {
  "Earthquakes": earthquakes
};

// creating map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 4,
  layers: [darkmap, earthquakes]
});

// creating layer control and adding to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// performing a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // sending the data.features object to the createFeatures function
  createFeatures(data.features);
});

// defining a function to determine the marker size by magnitude
function markerSize(magnitude) {
  return magnitude * 4;
};

// defining a function to determine the marker color by depth
function colorDepth(depth) {
  switch (true) {
    case depth > 90:
      return "DarkRed";
    case depth > 70:
      return "Red";
    case depth > 50:
      return "Chocolate";
    case depth > 30:
      return "DarkGoldenrod";
    case depth > 10:
      return "Gold";
    default:
      return "OliveDrab";
  }
};

// defining a function for adding earthquake data to the map
function createFeatures(earthquakeData) {

  // defining a function to run once for each feature in the features array giving each feature a popup describing the earthquake
  function popUp(feature, layer) {
    layer.bindPopup("<h3>Location: " + feature.properties.place +
      "</h3><hr><b>Date</b>: " + new Date(feature.properties.time) + "</br>" + "</h3><b>Depth</b>: "
      + feature.geometry.coordinates[2] + "</br><b>Magnitude</b>: " + feature.properties.mag + "</br>");
  }

  // creating GeoJSON layer containing the features array on the earthquakeData object
  L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: colorDepth(feature.geometry.coordinates[2]),
        color: "white",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.8
      });
    },

    onEachFeature: popUp
  }).addTo(earthquakes);

  // adding earthquakes layer to the map
  earthquakes.addTo(myMap);

  // adding map legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend'),
      depth = [0, 10, 30, 50, 70, 90],
      colors = ["OliveDrab", "Gold", "DarkGoldenrod", "Chocolate", "Red", "DarkRed"],
      labels = [];
    div.innerHTML += "<h3 style='text-align: center'>Earthquake Depth</h3>";
    // looping through depth intervals and generating a label with a colored square for each interval
    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' +
        depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + " km" + "<br>" : '+' + " km");
    }

    return div;
  };

  legend.addTo(myMap);

};