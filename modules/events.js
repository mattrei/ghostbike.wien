
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

  const sendInfo = (city, socket) => {
    return api.getInfo(city, (error, response) => {
      if (error) {
        return;
      }
      socket = socket || io.to(city);
      socket.emit('response info', response);
    });
  };
  io.on('connection', (socket) => {
    console.log("connected")
    hub.connectCounter += 1;
    socket.on('set city', (city) => {
      for (const room in socket.rooms) {
        socket.leave(room);
      }
      socket.join(city);
      sendMessages(city, socket);
      sendInfo(city, socket);
    });
    socket.on('disconnect', () => {
      hub.connectCounter -= 1;
    });
  });
  setInterval(() => {

  }, 5e3);
};
