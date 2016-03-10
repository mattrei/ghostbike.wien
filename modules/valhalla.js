
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


export default { getRoute: async function (route, cb) {
  fetch(`//valhalla.mapzen.com/route?json=
    {"locations":${route.locations},
      "costing":"bicycle",
      "costing_options":{"bicycle":{"bicycle_type":"road"}},
      "directions_options":{"units":"kilometers"}}&api_key=${API_KEY}`)
      .then((response) => {
          if (response.status >= 400) {
              throw new Error("Bad response from server");
          }
          return response.json();
      })
      .then((route) => {
        console.log("route fetched")
        console.log(route)
          const polyline = {
            shape: decode(route.trip.legs[0].shape)
          }

          cb({
            trip: route.trip,
            polyline: polyline
          })
      })
}
}
