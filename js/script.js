
// ---------------------- MAP CONTROL ----------------------
var element = document.getElementById("map");
var lat_lng = [37.71, -99.88];
var zoom_level = 6;

var map = L.map(element.id).setView(lat_lng, zoom_level);    
var tileLayer = L.esri.basemapLayer("Imagery").addTo(map);    

var icon = L.icon({
    iconUrl: "assets/restaurant.png",
    iconSize: [64, 64],
    iconAnchor: [32, 32],
    popupAnchor: [0, -11]
});

// a Leaflet marker is used by default to symbolize point features.
const restaurantLayer = L.esri
.featureLayer({
    url:"https://services.arcgis.com/rOo16HdIMeOBI4Mb/arcgis/rest/services/Oldest_Surviving_Los_Angeles_Restaurants/FeatureServer/0",
    // pointToLayer: function(geojson, latlng) {
    // return L.marker(latlng, {
    //     icon: icon
    // });
    // }
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
    opacity: 0.3
});

var housingLayer = L.esri.dynamicMapLayer({
    url: "https://gis.bnpb.go.id/server/rest/services/rumah/MapServer/",
    opacity: 0.5,
});

var majeneLayer = L.esri.dynamicMapLayer({
    url: "https://gis.bnpb.go.id/server/rest/services/Titik_Epicenter_Majene/MapServer",
    opacity: 0.5
});


var overlayLayers = {
    "Housing Layer": housingLayer,
    "Majene Layer": majeneLayer,
    "Province Layer": provinceLayer,
    "City Layer": cityLayer,
    "Police Layer": kepolisian,
    "Restaurant Layer": restaurantLayer,
    "Hurricane Layer": hurricanesLayer,
    "Polda & Polres": polda_polres
};

L.control.layers(null, overlayLayers).addTo(map);

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