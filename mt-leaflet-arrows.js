var MT = MT || {};
// arrow module -> requires Leaflet!
// https://github.com/meteotest/leaflet-arrows
MT.arrows = (function() {
	/**
	 * private functions and attributes to make code more save
	 */
	var config = {
		stretchFactor : 1, // should the distance be stretched?
		arrowheadLength : 4, // in km
		arrowheadClosingLine : false, // should a closing third line be drawn?
		arrowheadDegree : 140, // degree of arrowhead
		clickableWidth : 10, // defines the width in pixels of the "phantom" path to capture click events on a line
		validator : function(pointData) { return typeof pointData !== 'undefined'; }, // validator is a callback function that takes the data object of the current point and returns whether it is 'valid'. Invalid arrows will be drawn gray
		colorInvalidPoint : '#777'
	};

	function calculateEndPoint(latlng, dist, degree) {
		/*
		 * Problem 1C. Calculate end point (latitude/longitude) given a starting
		 * point, distance, and azimuth
		 * 
		 * Given {lat1, lon1, distance, azimuth} calculate {lat2, lon2}. First,
		 * work backwards (relative to Problem 1A) and find b from the distance
		 * by dividing by the Earth radius. b = distance / (Earth Radius) making
		 * sure distance and (Earth Radius) are the same units so that we end up
		 * with b in radians. Knowing b, calculate a using a =
		 * arccos(cos(b)*cos(90 - lat1) + sin(90 - lat1)*sin(b)*cos(azimuth)) —
		 * basically taking the arc cosine of the Law of Cosines for a. From a,
		 * we can get lat2, so the only item remaining is to figure lon2; we can
		 * get that if we know B. Calculate B using B =
		 * arcsin(sin(b)*sin(azimuth)/sin(a)). Then finally, lat2 = 90 - a and
		 * lon2 = B + lon1. Essentially, we just worked Problem 1A backwards.
		 * 
		 * Source:
		 * http://www.codeguru.com/cpp/cpp/algorithms/article.php/c5115/Geographic-Distance-and-Azimuth-Calculations.htm
		 * 
		 */
		var distance = dist * config.stretchFactor;
		var R = 6378.137, // earth radius in kmmeters
		d2r = L.LatLng.DEG_TO_RAD, // degree 2 radius
		r2d = L.LatLng.RAD_TO_DEG, // 

		bearing = degree * d2r;
		distance = distance / R;
		var a = Math.acos(Math.cos(distance) *
				Math.cos((90 - latlng.lat) * d2r) +
				Math.sin((90 - latlng.lat) * d2r) *
				Math.sin(distance) *
				Math.cos(bearing));
		var B = Math.asin(Math.sin(distance) * Math.sin(bearing) / Math.sin(a));
		return new L.LatLng(90 - a * r2d, B * r2d + latlng.lng);
	}

	function calculateArrowArray(latlng, degree) {
		// calculates the Array for the arrow

		// latlng is the position, where the arrow is added
		// degree is the degree of the line

		if (latlng.length !== undefined) {
			latlng = new L.LatLng(latlng);
		}
		var firstEdge = calculateEndPoint(latlng, config.arrowheadLength, degree -
				config.arrowheadDegree);
		var arr = [ firstEdge, latlng,
				calculateEndPoint(latlng, config.arrowheadLength, degree + config.arrowheadDegree) ];

		if (config.arrowheadClosingLine) {
			arr.push(firstEdge);
		}
		return arr;

	}

	/**
	 * public properties
	 */
	return {
		/**
		 * Takes an object as parameter and sets the configuration accordingly.
		 * Preserves keys in the base configruation, that aren't assigned
		 */
		setConfiguration : function(customConfig) {
			if (customConfig !== undefined) {
				for ( var id in customConfig) {
					if (customConfig.hasOwnProperty(id)) {
						config[id] = customConfig[id];
					}
				}
			}
		},

		getStretchFactor : function() {
			return config.stretchFactor;
		},

		/**
		 * data: object containing information for arrows { key : {
		 * nameOfDegreeProperty* : Number (degree) nameOfDistanceProperty* :
		 * Number (km) [[nameOfColorProperty* : Any -> will be applied to the
		 * 'colorScheme' function]] opt } }
		 * 
		 * options : object for customizing path and data handling **important**
		 * define the names of the attributes in data map, which hold the
		 * information on length, degree and the parameter for the colorScheme
		 * function (*) { nameOfDegreeProperty : String eg. 'deg' -> name of
		 * Property in data objects containing the degree value
		 * nameOfDistanceProperty : String 'length'-> name of Property in data
		 * objects containing the distance value nameOfColorProperty : String
		 * 'value' -> name of Property in data objects containing the value,
		 * which should be supplied to the colorScheme function isWindDegree :
		 * boolean (is Degree value direction of wind? -> degree - 180 }
		 */
		makeArrowLayer : function(data, options, colorScheme) {
			// options: nameOfLayer, isWindDegree, nameOfDegreeAttribute,
			// nameOfDistanceAttribute, pathOptions, popupContent

			var pointPathOption = {
				stroke : false,
				fillOpacity: 0.8,
			};

			this.setConfiguration(options); // customize the config according to the options

			var allArrows = [];
			for ( var dataId in data) {
				var entity = data[dataId];
				if (entity[options.nameOfDegreeProperty] !== undefined &&
						entity[options.nameOfDistanceProperty] !== undefined) {
					var startPoint = new L.LatLng(entity.lat, entity.lon);
					// TODO make name of lat/long property customizable

					var degree = options.isWindDegree ? entity[options.nameOfDegreeProperty] - 180
							: entity[options.nameOfDegreeProperty];
					var distance = entity[options.nameOfDistanceProperty];
					var pathOption = options.pathOptions;

					// is current arrow valid?
					if (typeof config.validator !== 'function' || config.validator(entity)) {
						pathOption.color = typeof colorScheme === "function" ? colorScheme(entity[options.nameOfColorProperty]) : options.color;						
					} else {
						pathOption.color = config.colorInvalidPoint;
					}

					distance = parseFloat(distance);

					// if distance is 0 draw a point instead of an arrow
					if (distance === 0 || distance === "undefined") {
						pointPathOption.color = pathOption.color;
						var circle = L.circle(startPoint, 1000, pointPathOption);
						circle.bindPopup(options.popupContent(entity, dataId));
						allArrows.push(circle);
					} else {
						var theLine = [ startPoint, calculateEndPoint(startPoint, distance, degree) ];
						var theArrow = calculateArrowArray(theLine[1], degree);

						var backgroundPathOption = $.extend(true, {}, pathOption);
						backgroundPathOption.opacity = 0;
						backgroundPathOption.weight = config.clickableWidth;

						var backgroundMulitpolyline = new L.MultiPolyline([ theLine, theArrow ],
								backgroundPathOption);
						var multipolyline = new L.MultiPolyline([ theLine, theArrow ], pathOption);

						backgroundMulitpolyline.bindPopup(options.popupContent(entity, dataId));
						allArrows.push(multipolyline);
						allArrows.push(backgroundMulitpolyline);
					}
				}
			}
			var lg = L.layerGroup(allArrows);
			return {
				layerGroup : lg,
				layerName : options.nameOfLayer
			};
		}
	};
})();