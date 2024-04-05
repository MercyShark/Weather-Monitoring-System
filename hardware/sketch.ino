#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <dht.h>

int tempSensor = 2; // D4
// wifi credentails
const char *wifi_username = "YOUR_WIFI_USERNAME";
const char *wifi_password = "YOUR_WIFI_PASSWORD";

// api Endpoint
const char *apiEndpoint = "http://192.168.0.104:8000/add_data/";

dht DHT;
WiFiClient client;
HTTPClient http;

void setup()
{
    Serial.begin(9600);
    delay(500); // Delay to let system boot
    Serial.println("DHT11 Humidity & temperature Sensor\n\n");
    delay(1000); // Wait before accessing Sensor
    WiFi.begin(wifi_username, wifi_password);
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("...");
    }

    Serial.println("NodeMcu Connected");
    Serial.println(WiFi.localIP());
}

void sendTempAndHumiData(int temperature, int humidity)
{
    String apiUrl = apiEndpoint;
    apiUrl += "?temperature=";
    apiUrl += temperature;
    apiUrl += "&humidity=";
    apiUrl += humidity;
    http.begin(client, apiUrl);
    http.addHeader("Content-Type", "application/json");
    Serial.println("request started");
    int httpCode = http.POST("host=arduino");
    Serial.println("request finished");
    Serial.println(httpCode);
    String payload = http.getString();
    Serial.println(payload);
    http.end();
}

void loop()
{
    DHT.read11(tempSensor);
    sendTempAndHumiData(DHT.temperature, DHT.humidity);
    delay(5000);
}