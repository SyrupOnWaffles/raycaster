var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

//image definitions
const sky = new Image();
sky.src = "resources/sky.png"

const man = new Image();
man.src = "resources/man.png"

const dake = new Image();
dake.src = "resources/dake.jpeg"

const ball = new Image();
ball.src = "resources/ball.png"
let ball_z =0
//math
const pi = 3.14159
const p2 = pi/2
const p3 = 3*pi/2
const dr = 0.0174533
quality = 60
minimap_scale = .25
let yep = 10
//player
let px= 320,py= 300, pa = 2*pi, pspeed = 1, sensitivity = .001, pdx = Math.cos(pa) * pspeed,pdy=Math.sin(pa) * pspeed;

//map
const mapX = 8, mapY = 8, mapS = 64; 
const map = [1,1,1,1,1,1,1,1,
             1,0,0,0,0,3,0,1,
             1,2,2,0,0,3,0,1,
             1,0,0,0,0,0,0,1,
             1,0,0,0,0,0,0,1,
             1,0,1,1,1,0,0,1,
             1,0,1,0,0,0,0,1,
             1,1,1,1,1,1,1,1,]


//multiplayer
const id = Math.floor(Math.random() * 10000)
let ready = false
let player_data = {
    id,
    type : "data",
    data : {
        px,
        py,
        pa

    }
}
let raw_server_data = {
}

let interpolated_server_data = {
    ball_z : 0,
}

let test_ping = {
    id,
    type : "ping",
    data : {
        message : ""
    }
}

const socket = new WebSocket("ws:localhost:3000", "protocolOne")

socket.onopen = (event) => {
    socket.send( JSON.stringify(player_data));
    ready = true
  };
  
socket.onmessage = (event) => {
    if(JSON.parse(event.data).type == "data"){
        raw_server_data = JSON.parse(event.data)
        document.getElementById("json").innerHTML = JSON.stringify(raw_server_data,null,4);
    }
    else if (JSON.parse(event.data).type == "ping"){
        console.log("ping : " + (Date.now() - JSON.parse(event.data).data.message).toString())
    }
};

//input
keys = {
    w: false,
    a: false,
    s: false,
    d: false,
}

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 65) {
        keys['a'] = true
    }
    else if(event.keyCode == 68) {
        keys['d'] = true
    }
    else if(event.keyCode == 87) {
        keys['w'] = true    }
    else if(event.keyCode == 83) {
        keys['s'] = true
    }
});
document.addEventListener('keyup', function(event) {
    if(event.keyCode == 65) {
        keys['a'] = false
    }
    else if(event.keyCode == 68) {
        keys['d'] = false
    }
    else if(event.keyCode == 87) {
        keys['w'] = false   }
    else if(event.keyCode == 83) {
        keys['s'] = false
    }
});



let timer
let movement = [0,0]
c.addEventListener("mousemove", function (event) {
    clearTimeout(timer)
    movement[0] = event.movementX
    movement[1] = event.movementY
    timer = setTimeout(function (){
        movement = [0,0]
    }, 10)
  });
c.addEventListener("click", async () => {
    await c.requestPointerLock();
});
function process_input(){
    if(movement[0]){
        pa -= sensitivity * -movement[0]
        if(pa>2*pi) pa-=2*pi;if(pa<2*pi) pa+=2*pi;
        pdx = Math.cos(pa)*pspeed;
        pdy=Math.sin(pa) * pspeed;
    }

    if(keys['a'] == true){
        px+=pdy;
        py+=-pdx;
    }
    if(keys['d'] == true){
        // pa += sensitivity
        // if(pa>2*pi) pa-=2*pi; if(pa<2*pi) pa+=2*pi;
        // pdx = Math.cos(pa)*pspeed;
        // pdy=Math.sin(pa) * pspeed;
        px+=-pdy;
        py+=pdx;
    }



    if(keys['w'] == true){
        px+=pdx;
        py+=pdy;
    }
    if(keys['s'] == true){
        px-=pdx;
        py-=pdy;
    }
    
    
}

//enginge

//https://www.30secondsofcode.org/js/s/convert-degrees-radians/

let sprite_queue = []

const degreesToRads = deg => (deg * Math.PI) / 180.0;
  
const dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);

function lerp(a, b, f)
{
    return a * (1.0 - f) + (b * f);
}
function drawSprite(image, x,y,z,scale){
    ctx.fillStyle = "rgba(255,255,0,1)"
    let dist = distance(x,y,px,py)
    let dify = (y - py)
    let difx = (x - px)
    let angle = Math.atan(dify/difx)
    if(dot([pdx,pdy],[difx/dist,dify/dist] )>0){
        let drain = (1/dist*75)
        let gang = scale*drain
        let imageX = (Math.tan(-(pa) + angle)*c.width) + (c.width/2) - gang/2
        let imageY = ((c.height/2)+(-z*drain) - gang/2)
        ctx.drawImage(image ,imageX, imageY,gang,gang)
    }

}
function drawSpriteQueue(queue){
    for(let i = 0; i<queue.length;i++){
        queue[i][5] = distance(queue[i][1],queue[i][2],px,py)
    }

    queue = queue.sort((a, b) => a[5] - b[5]);
    queue.reverse()
    for (let j = 0; j < queue.length; j++) {
        drawSprite(queue[j][0],queue[j][1],queue[j][2],queue[j][3],queue[j][4])
    }
}
function distance(ax,ay,bx,by,angle){
    return Math.sqrt((bx-ax)**2 + (by-ay)**2)
}
function drawPlayer(){
    //ctx.fillStyle = "rgba(255,0,0,1)";
    //ctx.fillRect((px-4)*minimap_scale,(py-4)*minimap_scale,8*minimap_scale,8*minimap_scale);
    obj = interpolated_server_data
    coords = []
    for(var key in obj){
        if(key != "type"){
            var val = obj[key];
            if (obj.hasOwnProperty(key)) {
                //check if is player sync
                if(!isNaN(key)){
                    if(val.id != id){
                        coords.push([val.data.px,val.data.py])
                        sprite_queue.push([man,val.data.px,val.data.py,-150,375])
                    }
                }

          };
        };    
    };    
}
function drawBall(){
    if(interpolated_server_data.ball){
        sprite_queue.push([ball,400,300,interpolated_server_data.ball.data.ball_z,100])
    }
}
function drawMap(){
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0,0, 512*minimap_scale, 512*minimap_scale);
    for(let y = 0; y < mapY; y++){
        for(let x = 0; x < mapX; x++){
            if(map[y*mapX+x]){
                ctx.fillStyle = "rgba(0,0,0,1)";
                ctx.fillRect(x*64*minimap_scale, y*64*minimap_scale, 63*minimap_scale, 63*minimap_scale);}
        }
    }
}
function drawRays(drawMinimap){

    let r,mx,my,mp,dof;
    let rx,ry,ra,xo,yo,disT;
    let color = [0,0,0,1]
    ra=pa-dr*quality/2;
    if(ra<0){ra+=2*pi};if(ra>2*pi){ra -=2*pi};
    if(drawMinimap==true) drawMap();
    
    for(let r =0;r<quality;r++){
        //horizontal
        let distH=100000,hx = px,hy=py
        dof=0
        const atan = -1/Math.tan(ra)
        if(ra>pi){
            ry=(Math.floor(py / 64) * 64) -.00001;
            rx=(py-ry) *atan + px; yo = -64;xo=-yo*atan
            
        }
        if(ra<pi){
            ry=(Math.floor(py / 64) * 64) + 64;
            rx=(py-ry) *atan + px; yo = 64;xo=-yo*atan
        }
        if(ra==0 || ra==pi){
            rx=px;
            ry=py
            dof=8
        }
        while(dof<8){
            mx=Math.floor(rx/64)
            my=Math.floor(ry/64)
            mp=my*mapX+mx
            if(mp>0 && mp<mapX*mapY && map[mp]>0){
                hx=rx
                hy=ry
                distH=distance(px,py,hx,hy,ra)
                dof=8;
            }
            else{
                rx+=xo;
                ry+=yo;
                dof+=1
            }
        }
        hx=rx;
        hy=ry;

        //vertical
        let distV=100000,vx = px,vy=py
        dof=0
        const ntan = -Math.tan(ra)
        if(ra>p2 && ra<p3){
            rx=(Math.floor(px / 64) * 64) -.00001;
            ry=(px-rx) *ntan + py; xo = -64;yo=-xo*ntan
            
        }
        if(ra<p2 || ra>p3){
            rx=(Math.floor(px / 64) * 64) + 64;
            ry=(px-rx) *ntan + py; xo = 64;yo=-xo*ntan
        }
        if(ra==0 || ra==pi){
            rx=px;
            ry=py
            dof=8
        }
        while(dof<8){
            mx=Math.floor(rx/64)
            my=Math.floor(ry/64)
            mp=my*mapX+mx
            if(mp>0 && mp<mapX*mapY && map[mp]>0){
                vx=rx
                vy=ry
                distV=distance(px,py,vx,vy,ra)
                dof=8;
            }
            else{
                rx+=xo;
                ry+=yo;
                dof+=1
            }
        }
        vx=rx;
        vy=ry;
        if(distV<distH){
            rx=vx
            ry=vy
            disT=distV
            color = [167,187,236,1]
        }
        if(distH<distV){
            rx=hx
            ry=hy
            disT=distH;
            color = [144,151,192,1]
}
        

        //draw 3d walls
        ctx.fillStyle = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + ")"
        let ca = pa-ra;if(ca<0){ca+=2*pi};if(ca>2*pi){ca -=2*pi}; disT=disT*Math.cos(ca)

        let lineH =(mapS*640)/disT;if(lineH>630){lineH=630};
        let lineOffset = 315-lineH/2
        ctx.fillRect(r*(840/quality), lineOffset, 840/quality, lineH);


        //draw minimap rays
        if(drawMinimap==true){
            ctx.strokeStyle = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + ")"
            ctx.beginPath();
            //draw direction
            ctx.moveTo(px*minimap_scale, py*minimap_scale);
            ctx.lineTo(rx*minimap_scale,ry*minimap_scale);
            ctx.stroke();
    }
        ra+=dr;
        if(ra<0){ra+=2*pi};if(ra>2*pi){ra -=2*pi};
    }

}
function drawSky(color){
    normal_pa = ((pa/(4*pi) - .5)*2)
    //ctx.fillStyle = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + ")"
    //ctx.fillRect(0,0,c.width,c.height/2 + c.height/2);
    for(let x = 0; x<(840);x++){
        coord = x + normal_pa*3360
        if(coord > 3360){
            coord -= 3360
        }
        ctx.drawImage(sky, coord, 0, 1, c.height, x, 0, 1, c.height );
    }
}
function drawGround(color){
    ctx.fillStyle = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + ")"
    ctx.fillRect(0,canvas.height/2,canvas.width,canvas.height/2)
}
function display(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSky()
    drawGround([254,206,233,1])
    drawRays(true)
    drawSpriteQueue(sprite_queue)
}
function syncToServer(){
    let player_data = {
        id,
        type : "data", 
        data : {
            px,
            py,
            pa
        }
    }
    socket.send( JSON.stringify(player_data));
}

//sync
setInterval(function(){
    syncToServer()
},1000/20)

//sync interpolation
setInterval(function () {
    // if(raw_server_data.ball_z != null){
        // interpolated_server_data.ball_z = lerp(interpolated_server_data.ball_z,raw_server_data.ball_z,.1)
    // }
    interpolated_server_data = raw_server_data
},1000/165)

//ping check
setInterval(function(){
    test_ping.data.message = Date.now()
    socket.send( JSON.stringify(test_ping));
},1000)

//main
setInterval( 
    function () {
        sprite_queue = []   
        process_input()
        drawPlayer()
        drawBall()
        display()
    }, 1000/165);