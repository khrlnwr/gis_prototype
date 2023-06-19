
// ---------------------- MAP CONTROL ----------------------
var element = document.getElementById("map");
var lat_lng = [-7.328998, 110.499975];
var zoom_level = 6;

var map = L.map(element.id).setView(lat_lng, zoom_level);    
// var tileLayer = L.esri.basemapLayer("Imagery").addTo(map);    

// Define the basemaps
var basemaps = {
    "Imagery": L.esri.basemapLayer("Imagery"),
    "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors'
    })
};
    
// Add the default basemap
basemaps["Imagery"].addTo(map);
  
// Add the basemap control
L.control.layers(basemaps).addTo(map);
  
// a Leaflet marker is used by default to symbolize point features.
const restaurantLayer = L.esri
.featureLayer({
    url:"https://services.arcgis.com/rOo16HdIMeOBI4Mb/arcgis/rest/services/Oldest_Surviving_Los_Angeles_Restaurants/FeatureServer/0",
});

const dangerousDogs = L.esri.featureLayer({
    url: "https://services.arcgis.com/rOo16HdIMeOBI4Mb/ArcGIS/rest/services/Declared_Dangerous_Dogs_Map/FeatureServer/0",            
});

const hurricanesLayer = L.esri.dynamicMapLayer({                 
    url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer/",
    opacity: 1,
    useCors: false });
    
var provinceLayer = L.tileLayer.wms('http://localhost:8080/geoserver/trickworld/wms?', {
    layers: 'trickworld:IDN_adm1',
    opacity: 0.3
});

var cityLayer = L.tileLayer.wms('http://localhost:8080/geoserver/trickworld/wms?', {
    layers: 'trickworld:IDN_adm2',
    opacity: 0.3
});

var kepolisian = L.tileLayer.wms('http://localhost:8080/geoserver/trickworld/wms?', {
    layers: 'trickworld:Polda_polres',
    opacity: 0.3,
});

var housingLayer = L.esri.dynamicMapLayer({
    url: "https://gis.bnpb.go.id/server/rest/services/rumah/MapServer/",
    opacity: 0.5,
});

var majeneLayer = L.esri.dynamicMapLayer({
    url: "https://gis.bnpb.go.id/server/rest/services/Titik_Epicenter_Majene/MapServer",
    opacity: 0.5
});

var kodam_koramil = L.tileLayer.wms('http://localhost:8080/geoserver/trickworld/wms?', {
    layers: 'trickworld:Kodim_koramil',
    opacity: 0.3
});


var overlayLayers = {
    "Province Layer": provinceLayer,
    "City Layer": cityLayer,
    "Police Layer": kepolisian,
    "Kodim Koramil": kodam_koramil
};

L.control.layers(null, overlayLayers).addTo(map);

map.on('click', function(e) {

    var topLayer = null;
    var maxZIndex = -Infinity;

    // Iterate over the overlayLayers object to find the top layer
    for (var layerName in overlayLayers) {
        var layer = overlayLayers[layerName];
        var zIndex = layer.options.zIndex || 0;

        var visible = map.hasLayer(layer);

        if (zIndex > maxZIndex && visible) {
            topLayer = layer;
            maxZIndex = zIndex;
        }
    }

    if (topLayer) {
        var url = getFeatureInfoUrl(e.latlng, topLayer);
        console.log("URL: " + url);
    
        fetch(url)
            .then(function(response) {
                console.log(response);
                return response.text();
        }).then(function(data) {

            var name = "";
            if (topLayer == kodam_koramil) {
                name = getKodimKoramilName(data);
                console.log(name);
            } else if (topLayer == kepolisian) {
                name = getKepolisianName(data);
                console.log(name);
            }

            // console.log(data);
            var popupContent = name;
    
            // Display the popup at the clicked location
            L.popup()
                .setLatLng(e.latlng)
                .setContent(popupContent)
                .openOn(map);
        });
    }


});

// Function to construct the GetFeatureInfo request URL
function getFeatureInfoUrl(latlng, layer) {
    var point = map.latLngToContainerPoint(latlng, map.getZoom()),
        size = map.getSize(),
        bounds = map.getBounds(),
        params = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          srs: 'EPSG:4326',
          styles: layer.wmsParams.styles,
          transparent: layer.wmsParams.transparent,
          version: layer.wmsParams.version,
          format: layer.wmsParams.format,
          bbox: bounds.toBBoxString(),
          height: size.y,
          width: size.x,
          layers: layer.wmsParams.layers,
          query_layers: layer.wmsParams.layers,
          info_format: 'text/html'
        };
  
    params[params.version === '1.3.0' ? 'i' : 'x'] = Math.round(point.x);
    params[params.version === '1.3.0' ? 'j' : 'y'] = Math.round(point.y);
  
    return layer._url + L.Util.getParamString(params, layer._url, true);
}

function getKodimKoramilName(data) {
    var htmlContent = data;
    var container = document.createElement('div');

    container.innerHTML = htmlContent;            
    var table = container.querySelector('table.featureInfo'); 
    var rows = table.querySelectorAll('tr');
    var name = "";
    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var columns = row.querySelectorAll('td');

        // Extract the values from each column
        var fid = columns[0].textContent;
        var id1 = columns[1].textContent;
        var name1 = columns[2].textContent;
        var id2 = columns[3].textContent;
        var name2 = columns[4].textContent;
        var id4 = columns[5].textContent;
        var name4 = columns[6].textContent;
        var latitude = columns[7].textContent;
        var longitude = columns[8].textContent;
        var alamat = columns[9].textContent;

        name = name4 + " " + alamat + " " + latitude + " " + longitude;
        break;
    }

    return name;
}


function getKepolisianName(data) {
    var htmlContent = data;
    var container = document.createElement('div');

    container.innerHTML = htmlContent;            
    var table = container.querySelector('table.featureInfo'); 

    var rows = table.querySelectorAll('tr');
    var name = "";

    for (var i=1; i<rows.length; i++) {
        var row = rows[i];
        var col = row.querySelectorAll('td');

        var name_ = col[6].textContent;
        var alamat_ = col[9].textContent;
        var lat_ = col[7].textContent;
        var long_ = col[8].textContent;

        name = name_ + " " + alamat_ + " " + lat_ + " " + long_;
        break;
    }

    return name;
}

// -------------------------- MODAL --------------------------
var modal = document.getElementById("modalFilter");
var btnFilter = document.getElementById("btnFilter");

var span = document.getElementsByClassName("close")[0];
btnFilter.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function populateRegion(prov_sl, reg_sl) {
    var prov_sl = document.getElementById(prov_sl);
    var reg_sl = document.getElementById(reg_sl);

    reg_sl.innerHTML  = "";
    if (prov_sl.value == "Jawa_Barat") {
        var optionArray = ["|", "kota_bandung|Bandung", "kota_cimahi|Cimahi", "kab_bandung|Kabupaten Bandung", "kab_bandung_barat|Kabupaten Bandung Barat", "kab_bekasi|Kabupaten Bekasi", "kab_bogor|Kabupaten Bogor", "kab_ciamis|Kabupaten Ciamis", "kab_cianjur|Kabupaten Cianjur", "kab_cirebon|Kabupaten Cirebon", "kab_garut|Kabupaten Garut", "kab_indramayu|Kabupaten Indramayu", "kab_karawang|Kabupaten Karawang", "kab_kuningan|Kabupaten Kuningan", "kab_majalengka|Kabupaten Majalengka", "kab_pangandaran|Kabupaten Pangandaran", "kab_purwakarta|Kabupaten Purwakarta", "kab_subang|Kabupaten Subang", "kab_sukabumi|Kabupaten Sukabumi", "kab_sumedang|Kabupaten Sumedang", "kab_tasikmalaya|Kabupaten Tasikmalaya", "kota_banjar|Banjar", "kota_bekasi|Bekasi", "kota_bogor|Bogor", "kota_cirebon|Cirebon", "kota_depok|Depok", "kota_sukabumi|Sukabumi", "kota_tasikmalaya|Tasikmalaya"];
    } else if (prov_sl.value == "Jawa_Tengah") {
        var optionArray = ["|", "kab_batang|Kabupaten Batang", "kab_blora|Kabupaten Blora", "kab_bojonegoro|Kabupaten Bojonegoro", "kab_brebes|Kabupaten Brebes", "kab_cilacap|Kabupaten Cilacap", "kab_demak|Kabupaten Demak", "kab_grobogan|Kabupaten Grobogan", "kab_jepara|Kabupaten Jepara", "kab_karanganyar|Kabupaten Karanganyar", "kab_kebumen|Kabupaten Kebumen", "kab_kendal|Kabupaten Kendal", "kab_klaten|Kabupaten Klaten", "kab_kudus|Kabupaten Kudus", "kab_magelang|Kabupaten Magelang", "kab_pekalongan|Kabupaten Pekalongan", "kab_pemalang|Kabupaten Pemalang", "kab_purbalingga|Kabupaten Purbalingga", "kab_purworejo|Kabupaten Purworejo", "kab_rembang|Kabupaten Rembang", "kab_semarang|Kabupaten Semarang", "kab_sragen|Kabupaten Sragen", "kab_sukoharjo|Kabupaten Sukoharjo", "kab_tegal|Kabupaten Tegal", "kab_temanggung|Kabupaten Temanggung", "kab_wonogiri|Kabupaten Wonogiri", "kab_wonosobo|Kabupaten Wonosobo", "kota_magelang|Kota Magelang", "kota_pekalongan|Kota Pekalongan", "kota_salatiga|Kota Salatiga", "kota_semarang|Kota Semarang", "kota_surakarta|Kota Surakarta", "kota_tegal|Kota Tegal"];
    } else if (prov_sl.value == "Jawa_Timur") {
        var optionArray = ["|", "kab_bangkalan|Kabupaten Bangkalan", "kab_banyuwangi|Kabupaten Banyuwangi", "kab_blitar|Kabupaten Blitar", "kab_bojonegoro|Kabupaten Bojonegoro", "kab_bondowoso|Kabupaten Bondowoso", "kab_gresik|Kabupaten Gresik", "kab_jember|Kabupaten Jember", "kab_jombang|Kabupaten Jombang", "kab_kediri|Kabupaten Kediri", "kab_lamongan|Kabupaten Lamongan", "kab_lumajang|Kabupaten Lumajang", "kab_madiun|Kabupaten Madiun", "kab_magetan|Kabupaten Magetan", "kab_malang|Kabupaten Malang", "kab_mojo_kerto|Kabupaten Mojokerto", "kab_nganjuk|Kabupaten Nganjuk", "kab_ngawi|Kabupaten Ngawi", "kab_pacitan|Kabupaten Pacitan", "kab_pamekasan|Kabupaten Pamekasan", "kab_pasuruan|Kabupaten Pasuruan", "kab_ponorogo|Kabupaten Ponorogo", "kab_probolinggo|Kabupaten Probolinggo", "kab_sampang|Kabupaten Sampang", "kab_sidoarjo|Kabupaten Sidoarjo", "kab_situbondo|Kabupaten Situbondo", "kab_sumenep|Kabupaten Sumenep", "kab_tuban|Kabupaten Tuban", "kab_tulungagung|Kabupaten Tulungagung", "kota_batu|Kota Batu", "kota_blitar|Kota Blitar", "kota_kediri|Kota Kediri", "kota_madiun|Kota Madiun", "kota_malang|Kota Malang", "kota_mojo_kerto|Kota Mojokerto", "kota_pasuruan|Kota Pasuruan", "kota_probolinggo|Kota Probolinggo", "kota_surabaya|Kota Surabaya"];
    }

    for (var index in optionArray) {
        var pair = optionArray[index].split("|");
        var newOption = document.createElement("option");
        newOption.value = pair[0];
        newOption.innerHTML = pair[1];
        reg_sl.options.add(newOption);
    }
}


// ----------------------- POINTING TO SPECIFIC PLACE -----------------------------
function changeCenterCoordinate(prov_sl, reg_sl) {
    var prov_sl = document.getElementById(prov_sl);
    var reg_sl = document.getElementById(reg_sl);

    let prov = prov_sl.value.replace("_", " ");
    const indexStart = reg_sl.value.indexOf("_");    
    let region = reg_sl.value.substring(indexStart + 1, reg_sl.value.length);
    var regionName = region.concat(" ", prov);
    
    console.log(regionName);
    var url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(regionName)}&format=json`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            var latitude = data[0].lat;
            var longitude = data[0].lon;
            
            // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);            
            // console.log(region);

            const city = region.charAt(0).toUpperCase() + region.slice(1);
            // console.log(city);

            cityLayer.wmsParams.cql_filter = `NAME_2='${city}'`;
            cityLayer.redraw();

            provinceLayer.wmsParams.cql_filter = `NAME_1='${prov}'`;
            provinceLayer.redraw();

            map.setView([latitude, longitude], 10);

        } else {
            console.log('No geocoding results found.');
        }
    }).catch(error => {
        console.log('Error:', error);
    });
}