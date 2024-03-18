const net = require("net");
const readline = require("node:readline/promises");
const port = 3000
const id = Math.floor(Math.random() * 10000)

let data = {
    id,
    "px": 0,
    "py": 0,
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const socket = net.createConnection(
  { host: "localhost", port: port },
  async () => {
    console.log("Connected to server with ID of " + id.toString());
    socket.write(JSON.stringify(data));
    //const message = await rl.question("Enter a message > ");
    //socket.write(JSON.stringify(data));
  }
);

socket.on("end", () => {
  console.log("Connection was ended");
});

socket.on("data", (data) => {
  console.log(data.toString("utf-8"))
})