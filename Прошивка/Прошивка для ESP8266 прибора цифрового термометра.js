
var WIFI_NAME = "ZEMLJA";
var WIFI_OPTIONS = { password : "jeijisuk" };

var connected = false;
var connectionError = "";
var IP = "";
var rezhim = "ozhidanie"; // mozhet byt' rezhim opyta
var wifi = require("Wifi");
wifi.connect(WIFI_NAME, WIFI_OPTIONS, function(err) {
  if (err) {
    console.log("Connection error: "+err);
    connectionError = err;
    return;
  }
  wifi.setHostname("Cifrovoi Termometr");
  wifi.save();  
  connected = true;
});
wifi.on('connected', function(details) {
  connected = true;
  connectionError = "";
  IP = details.ip;
});
wifi.on('disconnected', function(details) {
  connected = false;
  connectionError = details.reason;
  IP = "";
});


const http = require("http");
var serviceHost = "100.100.10.5:20000"; // IP 8 ?>@B A5@28A0

function sendNovyjOpyt() {
  let url = "http://"+serviceHost+"/api?opyt=new";  
  http.get(url, function (res) {});
  rezhim = "opyt";
   require("Storage").write("rStr", "opyt");
}
function sendData(temperature) {
  let url = "http://"+serviceHost+"/api?temperature="+temperature;  
  http.get(url, function (res) {});
}

var ow = new OneWire(D5);
var sensor = require("DS18B20").connect(ow);
//setInterval(function() {
//  sensor.getTemp(function (temp) {
//    console.log("Temp is "+temp+"°C");
//  });
//}, 1000);

function myWatch(){
  clearWatch();
  //let ltBp = 0; //last time button pressed
  let BTN = D12;
  pinMode(BTN, 'input_pullup');
  setWatch(function(e) {
    //if((getTime() - ltBp)>1){
      ltBp = getTime();
      if(rezhim == "opyt"){
        rezhim = "ozhidani5";
         require("Storage").write("rStr", "ozhidanie");
      }
      else {
        sendNovyjOpyt();
      }
 	    console.log("Button pressed B rezhim: ", rezhim );
    //}
  }, BTN, {  repeat: true, edge: 'rising', debounce: 50 });
}

function screenTemp(temperature){
    g.clear();
    g.setFontBitmap();
    if(connected) {
      g.drawString("Connected: "+IP,2,2);
    }
    else {
      g.drawString(connectionError,2,2);
    }
    if(rezhim == "opyt") {
      g.drawString("Opyt",120,2);
    }
    g.setFontVector(30);
    if(temperature=="-") g.drawString("Start",20,20);
    else {
      g.drawString(String(temperature.toFixed(1)).replace(".",",")+"°C",20,20);
    }
    g.flip();
}

function getTemperature(){
  sensor.getTemp(function (temp) {
    //console.log("Temp is "+temp+"°C");
    screenTemp(temp);
    if(rezhim == "opyt"){
      sendData(temp);    
    }
  });
}

function start(){
  screenTemp("-");
  myWatch();
  setInterval(getTemperature, 1000);
  
 var rStr =  require("Storage").read("rStr") || "ozhidanie";
 if(rStr=="opyt") {
    rezhim = "opyt";
  }

}

var g;
function onInit() {
  wifi.restore();  
  I2C1.setup({scl:D4,sda:D0});
  g = require("SSD1306").connect(I2C1, start);
}
save();

