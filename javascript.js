// This is the js file for the choropleth map.

// Initialize function to load the map
function initialize(){

	// Set the basemap.
	var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

	var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
		streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});
	
	// Set the body of the map.
	var map1 = L.map('map1', {
		center: [53.269985, -1.040298],
		zoom: 13,
		layers: grayscale
	});
	
	var baseLayers = {
		"Grayscale": grayscale,
		"Streets": streets
	};
	
	L.control.layers(baseLayers).addTo(map1);
	
	//Load the province data of China.
	var geojson = L.geoJson(database).addTo(map1);
	
	// control that shows state info on hover
	var info = L.control();

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};
	// Set the content of info window.
	info.update = function (props) {
		this._div.innerHTML = '<h4>Forest health information of each plot in Clumber Park</h4>' +  (props ? 'Plot number: ' +
			'<b>' + props.OBJECTID__+ '</b><br />' + 'Forest type: '+'<b>'+props.Forest_typ+' forest'+'</b>' + '<br>' + 'Dominant Tree Specie: '+
			'<b>'+props.Dominant_t +'</b>'+ '<br>' +'Tree Diversity: '+'<b>'+ props.Tree_diver+'</b>' + '<br>' +'FEHI Value: '+'<b>'+ props.FEHI+'</b>'
			: 'Hover over a plot');
	};

	info.addTo(map1);
	
	// get colour depending on the number of COVID-19 confirmed cases
	function getColor(d) {
    return d > 80  ? 'darkgreen' :
           d > 60  ? '#74c476' :
           d > 40  ? '#fd8d3c' :
                     '#e31a1c';
           
	}
	 
	function style1(feature) {
    return {
        fillColor: getColor(feature.properties.FEHI),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5
    };
	}
	L.geoJson(database, {style: style1}).addTo(map1);
	
	// highlighted states when they are hover with a mouse.
	function highlightFeature(e) {
		var layer = e.target;
		// set a thick grey border  
		layer.setStyle({
			weight: 5,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.7
		});
		// bring layer to the front
		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}

		info.update(layer.feature.properties);
	}

	var geojson;
	function resetHighlight(e) {
		geojson.resetStyle(e.target);
		info.update();
	}

	// A cclick listener that zooms to the state.
	function zoomToFeature(e) {
		map1.fitBounds(e.target.getBounds());
	}

	// Add the listeners on our state layer
	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
		});
	}

	geojson = L.geoJson(database, {
		style: style1,
		onEachFeature: onEachFeature
	}).addTo(map1);

	map1.attributionControl.addAttribution('Forest Research &copy; <a href="https://www.forestresearch.gov.uk/">Forest Health of Clumber Park</a>');

	// Custom Legend Control

	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {

		var div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 40, 60, 80],
			labels = [],
			from, to;

		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];

			labels.push(
				'<i style="background:' + getColor(from + 1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}

		div.innerHTML = labels.join('<br>');
		return div;
	};

	legend.addTo(map1);

}

