leaflet-arrows
==============

Draw layers with arrows to your leaflet map, so you might guessed it requires http://leafletjs.com/

Very early version, read the doc in the code

Usage
=====

	var windlayer = MT.arrows.makeArrowLayer(data, {
						nameOfLayer: "Wind", 
						isWindDegree: true,
						nameOfDegreeProperty: "winddirection", 
						nameOfDistanceProperty: "windspeed", 
						nameOfColorProperty : 'alt',
						pathOptions : { 
							color: '#333', 
							opacity: 0.9,
							weight: 2,
							smoothFactor: 0
						}, 
						popupContent: createPopupContent,
						}, getColor);
	windlayer.layerGroup.addTo(map);
	layerControl.addOverlay(windlayer.layerGroup, windlayer.layerName);