
const API_KEY = 'valhalla-Mc60zcM'

const decode = (str, precision) => {
          var index = 0,
              lat = 0,
              lng = 0,
              coordinates = [],
              shift = 0,
              result = 0,
              byte = null,
              latitude_change,
              longitude_change,
              factor = Math.pow(10, precision || 6);

          // Coordinates have variable length when encoded, so just keep
          // track of whether we've hit the end of the string. In each
          // loop iteration, a single coordinate is decoded.
          while (index < str.length) {

              // Reset shift, result, and byte
              byte = null;
              shift = 0;
              result = 0;

              do {
                  byte = str.charCodeAt(index++) - 63;
                  result |= (byte & 0x1f) << shift;
                  shift += 5;
              } while (byte >= 0x20);

              latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

              shift = result = 0;

              do {
                  byte = str.charCodeAt(index++) - 63;
                  result |= (byte & 0x1f) << shift;
                  shift += 5;
              } while (byte >= 0x20);

              longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

              lat += latitude_change;
              lng += longitude_change;

              coordinates.push([lat / factor, lng / factor]);
          }

          return coordinates;
      }

import {graphql} from 'graphql'
import schema from './schema'

async function getRoute(route) {
        console.log("inside getroute")
        console.log(route)

        const fromQuery = `{
          accidents(shortid: "${route.from}") {
            latitude,
            longitude
          }
        }`,
        toQuery = `{
          accidents(shortid: "${route.to}") {
            latitude,
            longitude
          }
        }`

        const from = await graphql(schema, fromQuery),
          to = await graphql(schema, toQuery),
          locations = `[{"lat":${from.data.accidents[0].latitude},"lon":${from.data.accidents[0].longitude}},{"lat":${to.data.accidents[0].latitude},"lon":${to.data.accidents[0].longitude}}]`

        const url = `http://valhalla.mapzen.com/route?json=
          {"locations":${locations},
            "costing":"bicycle",
            "costing_options":{"bicycle":{"bicycle_type":"road"}},
            "directions_options":{"units":"kilometers"}}&api_key=${API_KEY}`

        console.log(url)

        try {
          const response = await fetch(url)
          const data = await response.json()
          return data
        } catch(e) {
          console.error(e)
        }

      }

export { getRoute }
