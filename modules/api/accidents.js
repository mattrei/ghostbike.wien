export default function (req, res, { params, location, route }) {
  (params, location, route)

  const accidents = [
    {id: 1, latitude: 48.18, longitude: 16.36 },
    {id: 2, latitude: 48.28, longitude: 16.42 },
    {id: 3, latitude: 48.20, longitude: 16.37 },
    {id: 4, latitude: 48.21, longitude: 16.389 },
    {id: 5, latitude: 48.1987, longitude: 16.367 },
    {id: 6, latitude: 48.2298, longitude: 16.401 },
  ]
  res.send({accidents: accidents})
}
