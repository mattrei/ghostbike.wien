import hub from './hub'
import {getRoute} from './valhalla'

module.exports = (io) => {
  const sendMessages = (city, socket) => {
    return api.getMessages(city, (error, response) => {
      if (error) {
        return;
      }
      socket = socket || io.to(city);
      socket.emit('response talks', response);
    });
  };

  const broadcastRoute = (data, socket) => {
    console.log("broadcasting route")
    socket.emit('response route', data)
  };
  io.on('connection', async (socket) => {
    hub.connectCounter += 1
    console.log(hub.connectCounter)
    socket.on('set route', async (req) => {
      console.log('set route')
      /*
      const trip = await getRoute(req.data.route)

      const data = {
        data: {ghostbike: req.data.ghostbike}
      }
      Object.assign(data.data, trip)
      broadcastRoute(data, socket)
      */
    })
    socket.on('disconnect', () => {
      hub.connectCounter -= 1;
    })

  });
  setInterval(() => {

  }, 5e3);

};
