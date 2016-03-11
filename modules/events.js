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

  const broadcastRoute = (route, socket) => {
    console.log("broadcasting route")
    console.log(route)
    socket.broadcast.emit('response route', route)
  };
  io.on('connection', async (socket) => {

    hub.connectCounter += 1
    socket.on('set route', async (route) => {
      console.log('calc route')
      console.log(route)
      const data = await getRoute(route)
      console.log(data)
      broadcastRoute(data, socket)
    })
    socket.on('disconnect', () => {
      hub.connectCounter -= 1;
    })

  });
  setInterval(() => {

  }, 5e3);

};
