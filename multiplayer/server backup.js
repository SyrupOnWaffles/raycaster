const port = 3000
const net = require("net");

const server = net.createServer();

server.on("connection", (socket) => {
  let id = null
  socket.on("data", (data) => {
    parsed = JSON.parse(data.toString("utf-8"))
    if(parsed.id){
      if(!id){
        id = parsed.id
        console.log("connected to client with id of " + id.toString())
        console.log(parsed)
        socket.write("data recieved");
      }
      else if (id == parsed.id){
        console.log(parsed)
      }
    }else{
      console.log("got no id, ending")
      socket.end()
    }

  });
  socket.on("end", () => {
    console.log("Connection to " + id.toString() + " ended");
  });
});

server.listen(port, "localhost", () => {
  console.log("opened server on", server.address());
});