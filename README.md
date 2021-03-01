# Weather Bot

![Overlay](./assets/weatherbot.png)

Weather Bot is a Twitch bot to know about weather of cities using chat commands, like `!weather` and your city, to show the weather in the screen.

![Overlay](./assets/overlay.png)

# Used technologies

This project uses New Relic to monitore the application, with the time of each request, and performance data.

This project uses too NodeJS for Backend, and Javascript, CSS, HTML, And Socket.io for Frontend.

Was used [Mapbox](https://docs.mapbox.com/api/overview/) to get the coordinates of city only with the name. And [AccuWeather](https://developer.accuweather.com/apis) to get the wather with the coordinates of the city.

# Installing and running locally

Clone the project, and create a file named `.env`, with some credentials, being:

```
BOT_NAME= Name of your Twitch bot
CHANNEL_NAME= Name of your Twitch channel
TOKEN= Your Twitch Token

MAPBOX_TOKEN= Your Mapbox Token
WEATHER_TOKEN= Your Accuweather Token

UNIT= Your temperature unit, like F (Fahrenheit) or C (Celsius)
LANGUAGE_WEATHER= The language of Weather, like en or pt
```

After this, create a project in [New Relic](https://one.newrelic.com/) get the file `newrelic.js`, and put in the same folder of `index.js`, and WeatherBot will be connected to New Relic.

Now, you need to run `npm install` to install all dependencies, and `npm start` to start the bot. After starting the bot, acess `http://localhost:3000` in your OBS (Using a OBS Browser Overlay), and the data will be shown on the screen.
