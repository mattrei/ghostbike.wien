import hub from './hub'
import Route from './valhalla'

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
  io.on('connection', (socket) => {

    hub.connectCounter += 1
    console.log(`connected ${hub.connectCounter}`)
    socket.on('set route', (route) => {
      console.log('calc route')

      const cb = broadcastRoute(route, socket)
      Route.getRoute(route, cb)


      /*
      for (const room in socket.rooms) {
        socket.leave(room);
      }
      socket.join(city);
      */
      //sendMessages(city, socket);
      //sendInfo(city, socket);
    })
    socket.on('disconnect', () => {
      hub.connectCounter -= 1;
    })
  });
  setInterval(() => {

  }, 5e3);
};
