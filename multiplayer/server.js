const port = 3000
const WebSocket = require("ws");

const server = new WebSocket.Server({ port: port });

let active_players = 0
let players_data = {}

console.log(active_players.toString() + " active players")

server.on("connection", (socket) => {
  active_players += 1
  console.log(active_players.toString() + " active players")
  let id = null
  socket.on("message", (data) => {
    parsed = JSON.parse(data.toString("utf-8"))
    if(parsed.id){
      if(!id){
        id = parsed.id
        console.log("connected to client with id of " + id.toString())
        players_data[id] = parsed
        socket.send(JSON.stringify(players_data));
      }
      else if (id == parsed.id){
        players_data[id] = parsed
        socket.send(JSON.stringify(players_data));
      }
      
    }else{
      console.log("got no id, ending connection")
      socket.close()
  }
});
  socket.on("close", () => {
    console.log("Connection to " + id.toString() + " ended");
    active_players -= 1
    delete players_data[id]
    console.log(active_players.toString() + " active players")
  });
});

//log database
//setInterval(() => {
//  console.log(players_data)
//}, 1000);