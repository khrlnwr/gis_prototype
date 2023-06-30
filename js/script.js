
// ---------------------- MAP CONTROL ----------------------
var element = document.getElementById("map");
var lat_lng = [-7.328998, 110.499975];
var zoom_level = 6;

var map = L.map(element.id).setView(lat_lng, zoom_level);    
const workspace = "trickworld";

// var tileLayer = L.esri.basemapLayer("Imagery").addTo(map);    

// Define the basemaps
var basemaps = {
    "Imagery": L.esri.basemapLayer("Imagery"),
    "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors'
    }),
    "OpenStreetMap_DE" : L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    "Esri WMS": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    })
};
    
// Add the default basemap
basemaps["Imagery"].addTo(map);
  
// Add the basemap control
// L.control.layers(basemaps).addTo(map);
  
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
    
var provinceLayer = L.tileLayer.wms('http://localhost:8080/geoserver/' + workspace + '/wms?', {
    layers: workspace + ':IDN_adm1',
    opacity: 0.3
});

var cityLayer = L.tileLayer.wms('http://localhost:8080/geoserver/' + workspace + '/wms?', {
    layers: workspace + ':IDN_adm2',
    opacity: 0.3
});

var kepolisian = L.tileLayer.wms('http://localhost:8080/geoserver/' + workspace + '/wms?', {
    layers: workspace + ':Polda_polres',
    opacity: 1,
    transparent: true,
    format: 'image/png' // Set the format to PNG
});

var housingLayer = L.esri.dynamicMapLayer({
    url: "https://gis.bnpb.go.id/server/rest/services/rumah/MapServer/",
    opacity: 0.5,
});

var majeneLayer = L.esri.dynamicMapLayer({
    url: "https://gis.bnpb.go.id/server/rest/services/Titik_Epicenter_Majene/MapServer",
    opacity: 0.5
});

var kodam_koramil = L.tileLayer.wms('http://localhost:8080/geoserver/' + workspace + '/wms?', {
    layers: workspace + ':Kodim_koramil',
    opacity: 1,
    transparent: true,
    format: 'image/png'
});

var pulau_terluar = L.tileLayer.wms('http://localhost:8080/geoserver/' + workspace + '/wms?', {
    layers: workspace + ':Pulau Terluar',
    opacity: 1,
    transparent: true,
    format: 'image/png'
});

var pos_perbatasan = L.tileLayer.wms('http://localhost:8080/geoserver/' + workspace + '/wms?', {
    layers: workspace + ':Pos_Pamtas_2',
    opacity: 1,
    transparent: true,
    format: 'image/png'
}); 

var overlayLayers = {
    "Province Layer": provinceLayer,
    "City Layer": cityLayer,
    "Police Layer": kepolisian,
    "Kodim Koramil": kodam_koramil,
    "Pulau Terluar": pulau_terluar,
    "Pos Perbatasan": pos_perbatasan
};

L.control.layers(basemaps, overlayLayers).addTo(map);

// map.on('click', function(e) {
//     var topLayer = null;
//     var maxZIndex = -Infinity;

//     // Iterate over the overlayLayers object to find the top layer
//     for (var layerName in overlayLayers) {
//         var layer = overlayLayers[layerName];
//         var zIndex = layer.options.zIndex || 0;

//         var visible = map.hasLayer(layer);

//         if (zIndex > maxZIndex && visible) {
//             topLayer = layer;
//             maxZIndex = zIndex;
//         }
//     }

//     if (topLayer) {
//         var url = getFeatureInfoUrl(e.latlng, topLayer);
//         fetch(url)
//             .then(function(response) {
//                 return response.text();
//         }).then(function(data) {

//             var name = "";
//             if (topLayer == kodam_koramil) {
//                 name = getKodimKoramilName(data);
//             } else if (topLayer == kepolisian) {
//                 name = getKepolisianName(data);
//             } else if (topLayer == pulau_terluar) {
//                 name = getPulauTerluarName(data);
//             } else if (topLayer == cityLayer) {
//                 name = getKotaName(data)
//             } else if (topLayer == pos_perbatasan) {
//                 name = getPosPerbatasanName(data);
//             }

//             var popupContent = name;
    
//             // Display the popup at the clicked location
//             L.popup().setLatLng(e.latlng).setContent(popupContent).openOn(map);
//         });
//     }
// });


// -----------------------------------------------------------------------------------------
map.on('click', function(e)  {    
    console.log("click");
    fetchData(e);
});

async function fetchData(e) {
    for (var i in overlayLayers) {
      var layer = overlayLayers[i];
      var layer_name = layer.wmsParams.layers;
      var isVisible = map.hasLayer(layer);
  
      if (layer && isVisible) {
        // console.log(layer_name);
  
        var isNull = false;
        var url = getFeatureInfoUrl(e.latlng, layer);
        
        try {
          const response = await fetch(url);
          const data = await response.text();
          
          var htmlContent = data;
          var container = document.createElement('div');
  
          container.innerHTML = htmlContent;
          var table = container.querySelector('table.featureInfo');
  
          if (table === null) {
            // console.log("table is null");
            isNull = true;
          }
           
        } catch (error) {
          console.log('Error:', error);
        }

        if (!isNull) {
            getPopupName(e, layer);
            break;
        }
        
      }
    }
}

function getPopupName(e, layer) {
    var url = getFeatureInfoUrl(e.latlng, layer);
    fetch(url)
        .then(function(response) {
            return response.text();
    }).then(function(data) {

        var name = "";
        if (layer == kodam_koramil) {
            name = getKodimKoramilName(data);
        } else if (layer == kepolisian) {
            name = getKepolisianName(data);
        } else if (layer == pulau_terluar) {
            name = getPulauTerluarName(data);
        } else if (layer == cityLayer) {
            name = getKotaName(data)
        } else if (layer == pos_perbatasan) {
            name = getPosPerbatasanName(data);
        }

        var popupContent = name;

        // Display the popup at the clicked location
        L.popup().setLatLng(e.latlng).setContent(popupContent).openOn(map);
    });
}
  

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

function getKotaName(data) {
    var htmlContent = data;
    var container = document.createElement('div');

    container.innerHTML = htmlContent;            
    var table = container.querySelector('table.featureInfo'); 
    var rows = table.querySelectorAll('tr');
    var name = "";

    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var columns = row.querySelectorAll('td');

        var kota = columns[7].textContent;
        var prov = columns[5].textContent;
        var negara = columns[3].textContent;
        
        name = kota + " " + prov + " " + negara;
        break;
    }

    return name;
}

function getPulauTerluarName(data) {
    var htmlContent = data;
    var container = document.createElement('div');

    container.innerHTML = htmlContent;            
    var table = container.querySelector('table.featureInfo');
    if (table === null) {
        return "";
    }
    
    var rows = table.querySelectorAll('tr');
    var name = "";

    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var columns = row.querySelectorAll('td');

        var fid = columns[0].textContent;
        var id1 = columns[1].textContent;
        var nameProv = columns[2].textContent;
        var namaKab = columns[4].textContent;
        var namaKec = columns[6].textContent;
        var perairan = columns[7].textContent;
        var berbatasanDengan = columns[8].textContent;
        var lat = columns[9].textContent;
        var lng = columns[10].textContent;
        
        name = namaKec + " " + namaKab + " " + nameProv + " " + lat + " " + lng + ". Berbatasan dengan " + perairan + " dan " + berbatasanDengan;
        break;
    }

    return name;
}

function getPosPerbatasanName(data) {
    var htmlContent = data;
    var container = document.createElement('div');

    container.innerHTML = htmlContent;            
    var table = container.querySelector('table.featureInfo'); 
    if (table === null) {
        return "";
    }

    var rows = table.querySelectorAll('tr');
    var name = "";
    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var columns = row.querySelectorAll('td');

        var satgas = columns[7].textContent;
        var pos = columns[6].textContent;
        var kota = columns[4].textContent;
        var prov = columns[2].textContent;
        var lat = columns[8].textContent;
        var lng = columns[9].textContent;

        name = satgas + "," + pos + ", " + kota + " " + prov + ". " + lat + " " + lng;
        break;
    }

    return name;
}

function getKodimKoramilName(data) {
    var htmlContent = data;
    var container = document.createElement('div');

    container.innerHTML = htmlContent;            
    var table = container.querySelector('table.featureInfo'); 

    if (table === null) {
        return "";
    }

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
    if (table === null) {
        return "";
    }

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
    } else if (prov_sl.value == "Aceh") {
        var optionArray = [
            "|",
            "kota_banda_aceh|Banda Aceh",
            "kab_aceh_barat|Kabupaten Aceh Barat",
            "kab_aceh_barat_daya|Kabupaten Aceh Barat Daya",
            "kab_aceh_besar|Kabupaten Aceh Besar",
            "kab_aceh_jaya|Kabupaten Aceh Jaya",
            "kab_aceh_selatan|Kabupaten Aceh Selatan",
            "kab_aceh_singkil|Kabupaten Aceh Singkil",
            "kab_aceh_tamiang|Kabupaten Aceh Tamiang",
            "kab_aceh_tengah|Kabupaten Aceh Tengah",
            "kab_aceh_tenggara|Kabupaten Aceh Tenggara",
            "kab_aceh_timur|Kabupaten Aceh Timur",
            "kab_aceh_utara|Kabupaten Aceh Utara",
            "kab_bener_merah|Kabupaten Bener Meriah",
            "kab_bireuen|Kabupaten Bireuen",
            "kab_gayo_lues|Kabupaten Gayo Lues",
            "kab_langsa|Kabupaten Langsa",
            "kab_lhokseumawe|Kabupaten Lhokseumawe",
            "kab_nagan_raya|Kabupaten Nagan Raya",
            "kab_pidie|Kabupaten Pidie",
            "kab_pidie_jaya|Kabupaten Pidie Jaya",
            "kab_sabang|Kabupaten Sabang",
            "kab_simeulue|Kabupaten Simeulue",
            "kab_subulussalam|Kabupaten Subulussalam"
          ];          
    } else if (prov_sl.value == "Bali") {
        var optionArray = ["|", "kota_denpasar|Denpasar", "kab_buleleng|Kabupaten Buleleng", "kab_jembrana|Kabupaten Jembrana", "kab_tabanan|Kabupaten Tabanan", "kab_badung|Kabupaten Badung", "kab_gianyar|Kabupaten Gianyar", "kab_klungkung|Kabupaten Klungkung", "kab_bangli|Kabupaten Bangli", "kab_karangasem|Kabupaten Karangasem"];
    } else if (prov_sl.value == "Bangka_Belitung") {
        var optionArray = [
            "|",
            "kab_bangka|Kabupaten Bangka",
            "kab_belitung|Kabupaten Belitung",
            "kab_bangka_barat|Kabupaten Bangka Barat",
            "kab_bangka_selatan|Kabupaten Bangka Selatan",
            "kab_bangka_tengah|Kabupaten Bangka Tengah",
            "kab_bangka_timur|Kabupaten Bangka Timur",
            "kab_belitung_timur|Kabupaten Belitung Timur",
            "kota_pangkalpinang|Kota Pangkalpinang"
          ];          
    } else if (prov_sl.value == "Banten") {
        var optionArray = [
            "|",
            "kab_lebak|Kabupaten Lebak",
            "kab_pandeglang|Kabupaten Pandeglang",
            "kab_serang|Kabupaten Serang",
            "kab_tangerang|Kabupaten Tangerang",
            "kota_cilegon|Kota Cilegon",
            "kota_serang|Kota Serang",
            "kota_tangerang|Kota Tangerang",
            "kota_tangerang_selatan|Kota Tangerang Selatan"
          ];
    } else if (prov_sl.value == "Bengkulu") {
        var optionArray = [
            "|",
            "kab_bengkulu_selatan|Kabupaten Bengkulu Selatan",
            "kab_bengkulu_tengah|Kabupaten Bengkulu Tengah",
            "kab_bengkulu_utara|Kabupaten Bengkulu Utara",
            "kab_kaur|Kabupaten Kaur",
            "kab_kepahiang|Kabupaten Kepahiang",
            "kab_lebong|Kabupaten Lebong",
            "kab_muko_muko|Kabupaten Muko-Muko",
            "kab_rejang_lebong|Kabupaten Rejang Lebong",
            "kab_seluma|Kabupaten Seluma",
            "kota_bengkulu|Kota Bengkulu"
          ];          
    } else if (prov_sl.value == "Gorontalo") {
        var optionArray = [
            "|",
            "kab_boalemo|Kabupaten Boalemo",
            "kab_bone_bolango|Kabupaten Bone Bolango",
            "kab_gorontalo|Kabupaten Gorontalo",
            "kab_gorontalo_utara|Kabupaten Gorontalo Utara",
            "kab_gorontalo_selatan|Kabupaten Gorontalo Selatan",
            "kab_pahuwato|Kabupaten Pahuwato",
            "kota_gorontalo|Kota Gorontalo"
          ];          
    } else if (prov_sl.value == "Jakarta") {
        var optionArray = [
            "|",
            "kota_jakarta_barat|Kota Administrasi Jakarta Barat",
            "kota_jakarta_pusat|Kota Administrasi Jakarta Pusat",
            "kota_jakarta_selatan|Kota Administrasi Jakarta Selatan",
            "kota_jakarta_timur|Kota Administrasi Jakarta Timur",
            "kota_jakarta_utara|Kota Administrasi Jakarta Utara",
            "kota_kepulauan_seribu|Kota Administrasi Kepulauan Seribu"
          ];          
    } else if (prov_sl.value == "Jambi") {
        var optionArray = [
            "|",
            "kab_batanghari|Kabupaten Batanghari",
            "kab_bungo|Kabupaten Bungo",
            "kab_kerinci|Kabupaten Kerinci",
            "kab_merangin|Kabupaten Merangin",
            "kab_muaro_jambi|Kabupaten Muaro Jambi",
            "kab_sarolangun|Kabupaten Sarolangun",
            "kab_tanjung_jabung_barat|Kabupaten Tanjung Jabung Barat",
            "kab_tanjung_jabung_timur|Kabupaten Tanjung Jabung Timur",
            "kab_tanjung_jabung_utara|Kabupaten Tanjung Jabung Utara",
            "kab_tebo|Kabupaten Tebo",
            "kota_jambi|Kota Jambi",
            "kota_sungai_penuh|Kota Sungai Penuh"
          ];          
    } else if (prov_sl.value == "Kalimantan_Barat") {
        var optionArray = [
            "|",
            "kab_bengkayang|Kabupaten Bengkayang",
            "kab_kapuas_hulu|Kabupaten Kapuas Hulu",
            "kab_kayong_utara|Kabupaten Kayong Utara",
            "kab_ketapang|Kabupaten Ketapang",
            "kab_kubu_raya|Kabupaten Kubu Raya",
            "kab_landak|Kabupaten Landak",
            "kab_melawi|Kabupaten Melawi",
            "kab_mempawah|Kabupaten Mempawah",
            "kab_sambas|Kabupaten Sambas",
            "kab_sanggau|Kabupaten Sanggau",
            "kab_sekadau|Kabupaten Sekadau",
            "kab_sintang|Kabupaten Sintang",
            "kota_pontianak|Kota Pontianak",
            "kota_singkawang|Kota Singkawang"
          ];          
    } else if (prov_sl.value == "Kalimantan_Timur") {
        var optionArray = [
            "|",
            "kab_berau|Kabupaten Berau",
            "kab_kutai_barat|Kabupaten Kutai Barat",
            "kab_kutai_kartanegara|Kabupaten Kutai Kartanegara",
            "kab_kutai_timur|Kabupaten Kutai Timur",
            "kab_mahakam_ulubelu|Kabupaten Mahakam Ulu",
            "kab_paser|Kabupaten Paser",
            "kab_penajam_paser_utara|Kabupaten Penajam Paser Utara",
            "kab_samarinda|Kabupaten Samarinda",
            "kab_sanggau_wonosobo|Kabupaten Sanggau",
            "kab_tana_tidung|Kabupaten Tana Tidung",
            "kab_tarakan|Kabupaten Tarakan",
            "kota_balikpapan|Kota Balikpapan",
            "kota_bontang|Kota Bontang",
            "kota_samarinda|Kota Samarinda"
          ];          
    } else if (prov_sl.value == "Kalimatan_Selatan") {
        var optionArray = [
            "|",
            "kab_banjar|Kabupaten Banjar",
            "kab_barito_kuala|Kabupaten Barito Kuala",
            "kab_hulu_sungai_selatan|Kabupaten Hulu Sungai Selatan",
            "kab_hulu_sungai_tengah|Kabupaten Hulu Sungai Tengah",
            "kab_hulu_sungai_utara|Kabupaten Hulu Sungai Utara",
            "kab_kotabaru|Kabupaten Kotabaru",
            "kab_tabalong|Kabupaten Tabalong",
            "kab_tanah_bumbu|Kabupaten Tanah Bumbu",
            "kab_tanah_laut|Kabupaten Tanah Laut",
            "kab_tapin|Kabupaten Tapin",
            "kota_banjarbaru|Kota Banjarbaru",
            "kota_banjarmasin|Kota Banjarmasin"
          ];    
    } else if (prov_sl.value == "Kalimatan_Tengah") {
        var optionArray = [
            "|",
            "kab_barito_selatan|Kabupaten Barito Selatan",
            "kab_barito_timur|Kabupaten Barito Timur",
            "kab_barito_utara|Kabupaten Barito Utara",
            "kab_gunung_mas|Kabupaten Gunung Mas",
            "kab_kapuas|Kabupaten Kapuas",
            "kab_katingan|Kabupaten Katingan",
            "kab_kotawaringin_barat|Kabupaten Kotawaringin Barat",
            "kab_kotawaringin_timur|Kabupaten Kotawaringin Timur",
            "kab_lamandau|Kabupaten Lamandau",
            "kab_murung_raya|Kabupaten Murung Raya",
            "kab_pulang_pisau|Kabupaten Pulang Pisau",
            "kab_sukamara|Kabupaten Sukamara",
            "kab_seruyan|Kabupaten Seruyan",
            "kota_palangka_raya|Kota Palangka Raya"
          ];          
    } else if (prov_sl.value == "Kalimatan_Utara") {
        var optionArray = [
            "|",
            "kab_bulungan|Kabupaten Bulungan",
            "kab_malinau|Kabupaten Malinau",
            "kab_nunukan|Kabupaten Nunukan",
            "kab_tana_tidung|Kabupaten Tana Tidung",
            "kota_tarakan|Kota Tarakan"
          ];          
    } else if (prov_sl.value == "Kepulauan_Riau") {
        var optionArray = [
            "|",
            "kab_bintan|Kabupaten Bintan",
            "kab_karimun|Kabupaten Karimun",
            "kab_kepulauan_anambas|Kabupaten Kepulauan Anambas",
            "kab_lingga|Kabupaten Lingga",
            "kab_natuna|Kabupaten Natuna",
            "kota_batam|Kota Batam",
            "kota_tanjungpinang|Kota Tanjung Pinang"
          ];          
    } else if (prov_sl.value == "Lampung") {
        var optionArray = [
            "|",
            "kab_lampung_barat|Kabupaten Lampung Barat",
            "kab_lampung_selatan|Kabupaten Lampung Selatan",
            "kab_lampung_tengah|Kabupaten Lampung Tengah",
            "kab_lampung_timur|Kabupaten Lampung Timur",
            "kab_lampung_utara|Kabupaten Lampung Utara",
            "kab_mesuji|Kabupaten Mesuji",
            "kab_pesawaran|Kabupaten Pesawaran",
            "kab_pringsewu|Kabupaten Pringsewu",
            "kab_tanggamus|Kabupaten Tanggamus",
            "kab_tulang_bawang|Kabupaten Tulang Bawang",
            "kab_tulang_bawang_barat|Kabupaten Tulang Bawang Barat",
            "kab_way_kanan|Kabupaten Way Kanan",
            "kota_bandar_lampung|Kota Bandar Lampung",
            "kota_metro|Kota Metro"
          ];          
    } else if (prov_sl.value == "Maluku") {
        var optionArray = [
            "|",
            "kab_buru|Kabupaten Buru",
            "kab_buru_selatan|Kabupaten Buru Selatan",
            "kab_kepulauan_aru|Kabupaten Kepulauan Aru",
            "kab_maluku_barat_daya|Kabupaten Maluku Barat Daya",
            "kab_maluku_tengah|Kabupaten Maluku Tengah",
            "kab_maluku_tenggara|Kabupaten Maluku Tenggara",
            "kab_maluku_tenggara_barat|Kabupaten Maluku Tenggara Barat",
            "kab_seram_bagian_barat|Kabupaten Seram Bagian Barat",
            "kab_seram_bagian_timur|Kabupaten Seram Bagian Timur",
            "kota_ambon|Kota Ambon",
            "kota_tual|Kota Tual"
          ];          
    } else if (prov_sl.value == "Maluku_Utara") {
        var optionArray = [
            "|",
            "kab_halmahera_barat|Kabupaten Halmahera Barat",
            "kab_halmahera_tengah|Kabupaten Halmahera Tengah",
            "kab_halmahera_selatan|Kabupaten Halmahera Selatan",
            "kab_halmahera_utara|Kabupaten Halmahera Utara",
            "kab_kepulauan_sula|Kabupaten Kepulauan Sula",
            "kab_halmahera_timur|Kabupaten Halmahera Timur",
            "kab_pulau_morotai|Kabupaten Pulau Morotai",
            "kab_pulau_taliabu|Kabupaten Pulau Taliabu",
            "kota_ternate|Kota Ternate",
            "kota_tidore_kepulauan|Kota Tidore Kepulauan"
          ];          
    } else if (prov_sl.value == "Nusa_Tenggara_Barat") {
        var optionArray = [
            "|",
            "kab_bima|Kabupaten Bima",
            "kab_dompu|Kabupaten Dompu",
            "kab_lombok_barat|Kabupaten Lombok Barat",
            "kab_lombok_tengah|Kabupaten Lombok Tengah",
            "kab_lombok_timur|Kabupaten Lombok Timur",
            "kab_lombok_utara|Kabupaten Lombok Utara",
            "kab_sumbawa|Kabupaten Sumbawa",
            "kab_sumbawa_barat|Kabupaten Sumbawa Barat",
            "kota_bima|Kota Bima",
            "kota_mataram|Kota Mataram"
          ];          
    } else if (prov_sl.value == "Nusa_Tenggara_Timur") {
        var optionArray = [
            "|",
            "kab_alor|Kabupaten Alor",
            "kab_belu|Kabupaten Belu",
            "kab_ende|Kabupaten Ende",
            "kab_flores_timur|Kabupaten Flores Timur",
            "kab_kupang|Kabupaten Kupang",
            "kab_lembata|Kabupaten Lembata",
            "kab_manggarai|Kabupaten Manggarai",
            "kab_manggarai_barat|Kabupaten Manggarai Barat",
            "kab_manggarai_timur|Kabupaten Manggarai Timur",
            "kab_ngada|Kabupaten Ngada",
            "kab_rote_ndao|Kabupaten Rote Ndao",
            "kab_sabu_raijua|Kabupaten Sabu Raijua",
            "kab_sikka|Kabupaten Sikka",
            "kab_sumba_barat|Kabupaten Sumba Barat",
            "kab_sumba_barat_daya|Kabupaten Sumba Barat Daya",
            "kab_sumba_tengah|Kabupaten Sumba Tengah",
            "kab_sumba_timur|Kabupaten Sumba Timur",
            "kab_timor_tengah_selatan|Kabupaten Timor Tengah Selatan",
            "kab_timor_tengah_utara|Kabupaten Timor Tengah Utara",
            "kota_kupang|Kota Kupang"
          ];          
    } else if (prov_sl.value == "Papua") {
        var optionArray = [
            "|",
            "kab_asmat|Kabupaten Asmat",
            "kab_biak_numfor|Kabupaten Biak Numfor",
            "kab_boven_digoel|Kabupaten Boven Digoel",
            "kab_deiyai|Kabupaten Deiyai",
            "kab_dogiyai|Kabupaten Dogiyai",
            "kab_intan_jaya|Kabupaten Intan Jaya",
            "kab_jayapura|Kabupaten Jayapura",
            "kab_jayawijaya|Kabupaten Jayawijaya",
            "kab_keerom|Kabupaten Keerom",
            "kab_kepulauan_yapen|Kabupaten Kepulauan Yapen",
            "kab_lanny_jaya|Kabupaten Lanny Jaya",
            "kab_mamberamo_raya|Kabupaten Mamberamo Raya",
            "kab_mamberamo_tengah|Kabupaten Mamberamo Tengah",
            "kab_mappi|Kabupaten Mappi",
            "kab_merauke|Kabupaten Merauke",
            "kab_mimika|Kabupaten Mimika",
            "kab_nabire|Kabupaten Nabire",
            "kab_nduga|Kabupaten Nduga",
            "kab_paniai|Kabupaten Paniai",
            "kab_pegunungan_bintang|Kabupaten Pegunungan Bintang",
            "kab_puncak|Kabupaten Puncak",
            "kab_puncak_jaya|Kabupaten Puncak Jaya",
            "kab_sarmi|Kabupaten Sarmi",
            "kab_supiori|Kabupaten Supiori",
            "kab_tanah_merah|Kabupaten Tanah Merah",
            "kab_toba|Kabupaten Toba",
            "kab_waropen|Kabupaten Waropen",
            "kab_yahukimo|Kabupaten Yahukimo",
            "kab_yalimo|Kabupaten Yalimo",
            "kota_jayapura|Kota Jayapura"
          ];          
    } else if (prov_sl.value == "Papua_Barat") {
        var optionArray = [
            "|",
            "kab_fak_fak|Kabupaten Fakfak",
            "kab_kaimana|Kabupaten Kaimana",
            "kab_manokwari|Kabupaten Manokwari",
            "kab_manokwari_selatan|Kabupaten Manokwari Selatan",
            "kab_maybrat|Kabupaten Maybrat",
            "kab_paniai|Kabupaten Paniai",
            "kab_pegunungan_arfak|Kabupaten Pegunungan Arfak",
            "kab_raja_ampat|Kabupaten Raja Ampat",
            "kab_sorong|Kabupaten Sorong",
            "kab_sorong_selatan|Kabupaten Sorong Selatan",
            "kab_tambrauw|Kabupaten Tambrauw",
            "kab_teluk_bintuni|Kabupaten Teluk Bintuni",
            "kab_teluk_wondama|Kabupaten Teluk Wondama",
            "kab_kepulauan_misool|Kabupaten Kepulauan Misool",
            "kab_kepulauan_sawiati|Kabupaten Kepulauan Sawiat",
            "kab_kepulauan_raja_ampat|Kabupaten Kepulauan Raja Ampat",
            "kota_sorong|Kota Sorong"
          ];          
    } else if (prov_sl.value == "Riau") {
        var optionArray = [
            "|",
            "kab_bengkalis|Kabupaten Bengkalis",
            "kab_indragiri_hilir|Kabupaten Indragiri Hilir",
            "kab_indragiri_hulu|Kabupaten Indragiri Hulu",
            "kab_kampar|Kabupaten Kampar",
            "kab_kepulauan_meranti|Kabupaten Kepulauan Meranti",
            "kab_kuantan_singingi|Kabupaten Kuantan Singingi",
            "kab_pelalawan|Kabupaten Pelalawan",
            "kab_rokan_hulu|Kabupaten Rokan Hulu",
            "kab_rokan_hilir|Kabupaten Rokan Hilir",
            "kab_sabak_auai|Kabupaten Siak",
            "kab_sungaipenuh|Kota Sungai Penuh",
            "kab_kota_dumai|Kota Dumai",
            "kab_kota_pekanbaru|Kota Pekanbaru"
          ];          
    } else if (prov_sl.value == "Sulawesi_Barat") {
        var optionArray = [
            "|",
            "kab_majene|Kabupaten Majene",
            "kab_polewali_mandar|Kabupaten Polewali Mandar",
            "kab_mamasa|Kabupaten Mamasa",
            "kab_mamuju_tengah|Kabupaten Mamuju Tengah",
            "kab_mamuju|Kabupaten Mamuju",
            "kab_mamuju_utara|Kabupaten Mamuju Utara",
            "kota_mamuju|Kota Mamuju"
          ];          
    } else if (prov_sl.value == "Sulawesi_Selatan") {
        var optionArray = [
            "|",
            "kab_bantaeng|Kabupaten Bantaeng",
            "kab_barru|Kabupaten Barru",
            "kab_bone|Kabupaten Bone",
            "kab_bulukumba|Kabupaten Bulukumba",
            "kab_enna|Kabupaten Enrekang",
            "kab_gowa|Kabupaten Gowa",
            "kab_jeneponto|Kabupaten Jeneponto",
            "kab_kepulauan_selayar|Kabupaten Kepulauan Selayar",
            "kab_luwu|Kabupaten Luwu",
            "kab_luwu_timur|Kabupaten Luwu Timur",
            "kab_luwu_utara|Kabupaten Luwu Utara",
            "kab_maros|Kabupaten Maros",
            "kab_pangkajene_dan_kepulauan|Kabupaten Pangkajene dan Kepulauan",
            "kab_pinrang|Kabupaten Pinrang",
            "kab_sidenreng_rappang|Kabupaten Sidenreng Rappang",
            "kab_soppeng|Kabupaten Soppeng",
            "kab_takalar|Kabupaten Takalar",
            "kab_toraja_utara|Kabupaten Toraja Utara",
            "kab_wajo|Kabupaten Wajo",
            "kota_makassar|Kota Makassar",
            "kota_parepare|Kota Parepare",
            "kota_palopo|Kota Palopo"
          ];          
    } else if (prov_sl.value == "Sulawesi_Tengah") {
        var optionArray = [
            "|",
            "kab_banggai|Kabupaten Banggai",
            "kab_banggai_kepulauan|Kabupaten Banggai Kepulauan",
            "kab_banggai_laut|Kabupaten Banggai Laut",
            "kab_buol|Kabupaten Buol",
            "kab_donggala|Kabupaten Donggala",
            "kab_morowali|Kabupaten Morowali",
            "kab_morowali_utara|Kabupaten Morowali Utara",
            "kab_parigi_moutong|Kabupaten Parigi Moutong",
            "kab_poso|Kabupaten Poso",
            "kab_sigi|Kabupaten Sigi",
            "kab_toli_toli|Kabupaten Toli-Toli",
            "kota_palangkaraya|Kota Palangkaraya"
          ];          
    } else if (prov_sl.value == "Sulawesi_Tenggara") {
        var optionArray = [
            "|",
            "kab_bombana|Kabupaten Bombana",
            "kab_buton|Kabupaten Buton",
            "kab_buton_selatan|Kabupaten Buton Selatan",
            "kab_buton_tengah|Kabupaten Buton Tengah",
            "kab_buton_utara|Kabupaten Buton Utara",
            "kab_kolaka|Kabupaten Kolaka",
            "kab_kolaka_timur|Kabupaten Kolaka Timur",
            "kab_kolaka_utara|Kabupaten Kolaka Utara",
            "kab_konawe|Kabupaten Konawe",
            "kab_konawe_kepulauan|Kabupaten Konawe Kepulauan",
            "kab_konawe_selatan|Kabupaten Konawe Selatan",
            "kab_konawe_utara|Kabupaten Konawe Utara",
            "kab_muna|Kabupaten Muna",
            "kab_muna_barat|Kabupaten Muna Barat",
            "kab_wakatobi|Kabupaten Wakatobi",
            "kota_baubau|Kota Baubau",
            "kota_kendari|Kota Kendari"
          ];          
    } else if (prov_sl.value == "Sulawesi_Utara") {
        var optionArray = [
            "|",
            "kab_bolaang_mongondow|Kabupaten Bolaang Mongondow",
            "kab_bolaang_mongondow_selatan|Kabupaten Bolaang Mongondow Selatan",
            "kab_bolaang_mongondow_timur|Kabupaten Bolaang Mongondow Timur",
            "kab_bolaang_mongondow_utara|Kabupaten Bolaang Mongondow Utara",
            "kab_kepulauan_sangir|Kabupaten Kepulauan Sangihe",
            "kab_kepulauan_talaud|Kabupaten Kepulauan Talaud",
            "kab_minahasa|Kabupaten Minahasa",
            "kab_minahasa_selatan|Kabupaten Minahasa Selatan",
            "kab_minahasa_tenggara|Kabupaten Minahasa Tenggara",
            "kab_minahasa_utara|Kabupaten Minahasa Utara",
            "kota_bitung|Kota Bitung",
            "kota_kotamobagu|Kota Kotamobagu",
            "kota_manado|Kota Manado",
            "kota_tomohon|Kota Tomohon"
          ];          
    } else if (prov_sl.value == "Sumatera_Barat") {
        var optionArray = [
            "|",
            "kab_agam|Kabupaten Agam",
            "kab_dharmasraya|Kabupaten Dharmasraya",
            "kab_lima_puluh_kota|Kabupaten Lima Puluh Kota",
            "kab_pariaman|Kabupaten Pariaman",
            "kab_pasaman|Kabupaten Pasaman",
            "kab_pasaman_barat|Kabupaten Pasaman Barat",
            "kab_sijunjung|Kabupaten Sijunjung",
            "kab_solok|Kabupaten Solok",
            "kab_solok_selatan|Kabupaten Solok Selatan",
            "kab_tanah_datar|Kabupaten Tanah Datar",
            "kab_padang_pariaman|Kabupaten Padang Pariaman",
            "kota_bukittinggi|Kota Bukittinggi",
            "kota_padang|Kota Padang",
            "kota_padang_panjang|Kota Padang Panjang",
            "kota_pariaman|Kota Pariaman",
            "kota_payakumbuh|Kota Payakumbuh",
            "kota_sawahlunto|Kota Sawahlunto",
            "kota_solok|Kota Solok"
          ];          
    } else if (prov_sl.value == "Sumatera_Utara") {
        var optionArray = [
            "|",
            "kab_asahan|Kabupaten Asahan",
            "kab_batubara|Kabupaten Batubara",
            "kab_dairi|Kabupaten Dairi",
            "kab_deli_serdang|Kabupaten Deli Serdang",
            "kab_humbang_hasundutan|Kabupaten Humbang Hasundutan",
            "kab_karo|Kabupaten Karo",
            "kab_labuhan_batu|Kabupaten Labuhan Batu",
            "kab_labuhan_batu_selatan|Kabupaten Labuhan Batu Selatan",
            "kab_labuhan_batu_utara|Kabupaten Labuhan Batu Utara",
            "kab_langkat|Kabupaten Langkat",
            "kab_mandailing_natal|Kabupaten Mandailing Natal",
            "kab_nias|Kabupaten Nias",
            "kab_nias_selatan|Kabupaten Nias Selatan",
            "kab_nias_barat|Kabupaten Nias Barat",
            "kab_nias_utara|Kabupaten Nias Utara",
            "kab_padang_lawas|Kabupaten Padang Lawas",
            "kab_padang_lawas_utara|Kabupaten Padang Lawas Utara",
            "kab_pakpak_bharat|Kabupaten Pakpak Bharat",
            "kab_samosir|Kabupaten Samosir",
            "kab_serdang_bedagai|Kabupaten Serdang Bedagai",
            "kab_simalungun|Kabupaten Simalungun",
            "kab_tanjung_balai|Kota Tanjung Balai",
            "kab_tebing_tinggi|Kota Tebing Tinggi",
            "kab_toba_samosir|Kabupaten Toba Samosir",
            "kota_binjai|Kota Binjai",
            "kota_gunungsitoli|Kota Gunungsitoli",
            "kota_medan|Kota Medan",
            "kota_padangsidempuan|Kota Padangsidempuan",
            "kota_pematangsiantar|Kota Pematangsiantar",
            "kota_sibolga|Kota Sibolga",
            "kota_tanjungbalai|Kota Tanjungbalai",
            "kota_tebingtiggi|Kota Tebing Tinggi"
          ];          
    } else if (prov_sl.value == "Yogyakarta") {
        var optionArray = [
            "|",
            "kab_bantul|Kabupaten Bantul",
            "kab_gunung_kidul|Kabupaten Gunung Kidul",
            "kab_kulon_progo|Kabupaten Kulon Progo",
            "kab_sleman|Kabupaten Sleman",
            "kota_yogyakarta|Kota Yogyakarta"
          ];          
    } else if (prov_sl.value == "Sumatera_Selatan") {
        var optionArray = [
            "|",
            "kab_banyu_asin|Kabupaten Banyu Asin",
            "kab_empat_lawang|Kabupaten Empat Lawang",
            "kab_lahat|Kabupaten Lahat",
            "kab_lubuk_linggau|Kabupaten Lubuk Linggau",
            "kab_muaradua|Kabupaten Muara Dua",
            "kab_musirawas|Kabupaten Musi Rawas",
            "kab_musirawas_utara|Kabupaten Musi Rawas Utara",
            "kab_ogan_ilir|Kabupaten Ogan Ilir",
            "kab_ogan_komering_ilir|Kabupaten Ogan Komering Ilir",
            "kab_ogan_komering_uluh|Kabupaten Ogan Komering Uluh",
            "kab_ogan_komering_uluh_selatan|Kabupaten Ogan Komering Uluh Selatan",
            "kab_pagar_alam|Kota Pagar Alam",
            "kab_palembang|Kota Palembang",
            "kab_prabumulih|Kota Prabumulih"
          ];          
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
            
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);            
            console.log(region);

            var city = region.charAt(0).toUpperCase() + region.slice(1);
            var index = city.indexOf("_");
            if (index != -1) {
                city = city.substring(0, index) + " " + city.charAt(index+1).toUpperCase() + city.slice(index+2);
                // city = city.replace("_", " ");
            }

            console.log(city);
            
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