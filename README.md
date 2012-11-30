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
	layerControl.addOverlay(windlayer.layerGroup, windlayer.layerName

The ''data'' argument for the makeArrowLayer function should be in this style:

	{
		'key1' : {
			winddirection : 50,
			windspeed : 10, // km/h
			alt : 3000,  // this will used as Argument for the getColor function
			lat : 47.5,
			lon : 7.6
			// additional properties can be added and displayed in the popup
		},
		'keyN' : { ... }
	}

note: you can customize the attributes nameOfDegreeProperty, nameOfDistanceProperty, nameOfColorProperty to match your data-objects