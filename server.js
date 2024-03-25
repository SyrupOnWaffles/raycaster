const port = 3000
const WebSocket = require("ws");

ball_z = 1000
ball_velo = 0

//game 
setInterval(() => {
  ball_velo -= .1
  ball_z += ball_velo
  if (ball_z < -300) {
    ball_velo *= -.80
    ball_z = -300
  }
}, 1000 / 165);

const server = new WebSocket.Server({
  port: port,
});
server.on('error', function (error) {
  console.log(error)
});
server.on('open', function (error) {
  console.log("opened server at " + port.toString())
})
let active_players = 0
let server_data = {
  ball: {
    type : "data",
    data : {
      ball_z,
      ball_velo
    } 
  },
  type: "data",
}
console.log(active_players.toString() + " active players")

server.on("connection", (socket, req) => {
  const ip = req.socket.remoteAddress;
 
  active_players += 1
  console.log(active_players.toString() + " active players")
  let id = null
  socket.on("message", (data) => {
    parsed = null
    
    try {
      parsed = JSON.parse(data.toString("utf-8"))
    } catch (error) {
      console.log("prolly not json: " + error)
      console.log("bad message, ending connection")
    }

    if (parsed.id) {

      if (parsed.type) {
        if (parsed.type == "data") {
          
          if (!id) {
            id = parsed.id
            console.log("connected to client with id of " + id.toString() + " with ip of " + ip.toString())
          } else if (id == parsed.id) {
            // server_data.ball_z = ball_z
            server_data[id] = parsed
            server_data.ball = {
              type : "data",
              data : {
                ball_z,
                ball_velo
              } 
            }
            socket.send(JSON.stringify(server_data));
          }
        } else if (parsed.type == "ping") {
          socket.send(JSON.stringify(parsed))
        } else {
          console.log("unknown type")
        }
      } else {
        console.log("got not type, neglect message")
      }
    } else {
      console.log("got no id, ending connection")
      socket.close()
    }
  });
  socket.on("close", () => {
    console.log("Connection to " + id.toString() + " ended");
    active_players -= 1
    delete server_data[id]
    console.log(active_players.toString() + " active players")
  });
});