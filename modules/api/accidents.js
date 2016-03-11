import {graphql} from 'graphql'
import schema from '../schema'

export default function (req, res, { params, location, route }) {
  (params, location, route)

  const query = `{
    accidents {
      shortid,
      name,
      latitude,
      longitude
    }
  }`

  graphql(schema, query)
    .then((result) => {
      res.send(result)
    })
}
