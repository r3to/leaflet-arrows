leaflet-arrows
==============

Draw arrows on your leaflet map. Requires http://leafletjs.com/

There will be more documentation and examples in the very near future. For now, read the code. 

Usage
=====


	var arrowOptions = {
		distanceUnit: 'km',
		isWindDegree: true,
		stretchFactor: 1,
		popupContent: function(data) { 
			return "<h3>" + data.title + "</h3>"; 
			},
		arrowheadLength: 0.8,
		drawSourceMarker: true
	};

	var arrowData = {
		latlng: L.latLng(46.95, 7.4),
		degree: 77,
		distance: 10,
		title: "Demo"
	};
	
	var arrowLayer = new L.Arrow(arrowData, arrowOptions)
	arrowLayer.layerGroup.addTo(map);
