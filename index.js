require("newrelic");
require("dotenv").config();
const tmi = require("tmi.js");
const axios = require("axios");
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

app.use(express.static(path.join(__dirname, "app")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/app/index.html");
});

const BotName = process.env.BOT_NAME;
const ChannelName = process.env.CHANNEL_NAME;
const mapBoxToken = process.env.MAPBOX_TOKEN;
const accuweatherAPIKey = process.env.WEATHER_TOKEN;
const unit = process.env.UNIT || "F";
const language = process.env.LANGUAGE_WEATHER || "en";

let msgError;
let username;

const opts = {
  identity: {
    username: BotName,
    password: process.env.TOKEN,
  },
  channels: [ChannelName],
};
const client = new tmi.client(opts);

const weatherObject = {
  city: "",
  state: "",
  country: "",
  temperature: "",
  weatherText: "",
  weatherIcon: "",
};

function getCurrentWeather(localCode) {
  const URL = `http://dataservice.accuweather.com/currentconditions/v1/${localCode}?apikey=${accuweatherAPIKey}&language=${language}`;

  try {
    axios.get(URL).then((response) => {
      try {
        if (unit.toLowerCase() === "f") {
          weatherObject.temperature = `${response.data[0].Temperature.Imperial.Value}°F`;
          weatherObject.unitTemperature = "";
        } else if (unit.toLowerCase() === "c") {
          weatherObject.temperature = `${response.data[0].Temperature.Metric.Value}°`;
        }

        weatherObject.weatherText = response.data[0].WeatherText;

        let icon_number =
          response.data[0].WeatherIcon <= 9
            ? "0" + String(response.data[0].WeatherIcon)
            : String(response.data[0].WeatherIcon);

        weatherObject.weatherIcon = `https://developer.accuweather.com/sites/default/files/${icon_number}-s.png`;

        io.emit("weather", weatherObject);
        client.say(
          ChannelName,
          `/me Hi @${username}. The wheater in ${weatherObject.city} is ${weatherObject.temperature}. Look at overlay to get more information.`
        );
      } catch (err) {
        client.say(ChannelName, msgError);
      }
    });
  } catch (err) {
    client.say(ChannelName, msgError);
  }
}

function getLocalization(lon, lat) {
  const URL = `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${accuweatherAPIKey}&q=${lat}%2C${lon}&language=${language}`;

  try {
    axios.get(URL).then((response) => {
      try {
        if (response.data.ParentCity.LocalizedName) {
          weatherObject.city = response.data.ParentCity.LocalizedName;
        } else {
          weatherObject.city = response.data.LocalizedName;
        }

        weatherObject.state = response.data.AdministrativeArea.LocalizedName;
        weatherObject.country = response.data.Country.LocalizedName;

        let localCode = response.data.Key;

        getCurrentWeather(localCode);
      } catch (err) {
        client.say(ChannelName, msgError);
      }
    });
  } catch (err) {
    client.say(ChannelName, msgError);
  }
}

function getCoordinate(city) {
  const URL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURI(
    city
  )}.json?access_token=${mapBoxToken}`;

  try {
    axios.get(URL).then((response) => {
      try {
        const lon = response.data.features[0].geometry.coordinates[0];
        const lat = response.data.features[0].geometry.coordinates[1];

        getLocalization(lon, lat);
      } catch (err) {
        client.say(ChannelName, msgError);
      }
    });
  } catch (err) {
    client.say(ChannelName, msgError);
  }
}

client.on("message", (target, context, message, bot) => {
  username = context.username;
  if (bot) {
    return;
  }

  msgError = `/me ${context.username} we couldn't find the weather. try again`;

  const COMMAND_NAME = "!weather";
  const command = message.split(" ")[0];

  if (command === COMMAND_NAME) {
    const city = message.replace(COMMAND_NAME, "");

    if (city) {
      getCoordinate(city);
    } else {
      client.say(target, `${context.username} please inform a city`);
    }
  }
});

client.on("connected", () => {
  client.say(ChannelName, "Bot is on!");
  console.log("Bot is on!");
});

client.connect();

http.listen(3000, () => {
  console.log("listening on *:3000");
});
