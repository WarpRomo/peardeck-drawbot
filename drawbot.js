let safe_key = 'q';

let draw_speed = 0.00;

let image_pos = [150,150];

let skip_threshold = 5;
let skip_search = true;

console.log("Peardeck drawing-bot has been loaded!");

function createMouseEvent(name, coords) {
    return new PointerEvent(name, {
        pointerType: "mouse",
        bubbles: true,
        clientX: coords.x,
        clientY: coords.y,
        button: 0 // Left click
    });
}

function sleep(duration){
  return;
    let now = performance.now();
    let end = now + duration * 1000;
    while(now < end){
      now = performance.now();
    }

}

function get_closest(val, values){
    let closest = 0;
    let distance = 1000000;

    if(val[3] == 0) {
      return -1;
    }

    for(var i = 0; i < values.length; i++){

        let distancei = Math.abs(values[i][0] - val[0]) + Math.abs(values[i][1] - val[1]) + Math.abs(values[i][2] - val[2])

        if(distancei < distance){
          distance = distancei;
          closest = i;
        }

    }

    return closest;
}

function floodfill(x,y,explored,colors,s,p,dx,dy){

    return new Promise((resolve) => {

      let paths = [[0,1], [-1,0], [0,-1], [1,0], [1,1], [-1,1], [-1,-1], [1,-1]];

      floodedpixels++;

      let floodarray = [[x,y,0]];
      let mousecurrent = [x,y];

      let breakout = 0;

      explored[y][x] = 1;

      console.log("do floodfill");

      let lasttime = new Date().getTime();

      process();



      function process(){
        let iterations = 0;

        while(floodarray.length > 0){

            if(!currentlydrawing) return leftup(0,0,0,0,0);;

            if(iterations == 100){
              setTimeout(process, 10)
              drawintervaltimer[2].innerHTML = "Currently Drawing " + floodedpixels + "/" + totalpixels + "<br>Move mouse to cancel";
              return;
            }

            let me = floodarray[floodarray.length-1];

            if(me[2] == paths.length-1){
              floodarray.pop();
              continue;
            }


            for(var i = me[2]; i < paths.length; i++){

                let nx = me[0] + paths[i][0];
                let ny = me[1] + paths[i][1];

                if( !(nx < 0 || nx >= colors[0].length) && !(ny < 0 || ny >= colors.length) && explored[ny][nx] == 0 && colors[ny][nx] == colors[me[1]][me[0]]){
                  explored[ny][nx] = 1;
                  floodarray.push([nx,ny,0]);

                  movebetween(mousecurrent[0], mousecurrent[1], nx, ny, colors, s, p, dx, dy);
                  iterations++;
                  floodedpixels++;

                  mousecurrent = [nx,ny];

                  me[2] = i;
                  break;
                }

                if(i == paths.length-1) floodarray.pop();

            }

        }
        console.log("finished");
        resolve();
      }


    })



}

function movebetween(x,y,x2,y2,colors,s,p,dx,dy){

    let movement = findpath(x,y,x2,y2,colors);


    for(var i = 1; i < movement.length; i++){
      moveto(movement[i][0], movement[i][1],p,dx,dy);
    }

}

function findpath(x,y,x2,y2,colors){

    let paths = [ [[x,y]] ];
    let newpaths = [];
    let choices = [[0,1], [-1,0], [0,-1], [1,0], [1,1], [-1,1], [-1,-1], [1,-1]];

    if(Math.abs(x2 - x) <= 1 && Math.abs(y2 - y) <= 1){
      return [[x,y],[x2,y2]];
    }

    let explored = {};


    while(paths.length > 0){

        for(var i = 0; i < paths.length; i++){
            let me = paths[i][paths[i].length-1];

            for(var j = 0; j < choices.length; j++){

                let nx = me[0] + choices[j][0];
                let ny = me[1] + choices[j][1];

                if(nx == x2 && ny == y2){
                  paths[i].push([nx,ny]);
                  return paths[i];
                }


                if(!(nx < 0 || nx >= colors[0].length) && !(ny < 0 || ny >= colors.length) && ([nx,ny] in explored == false) && colors[ny][nx] == colors[me[1]][me[0]]){
                  explored[[nx,ny]] = true;

                  copyarray = [...paths[i]];
                  copyarray.push([nx,ny]);
                  newpaths.push(copyarray);

                }


            }

        }

        paths = newpaths;
        newpaths = [];

    }

    return false;
}

function checknogo(colors,explored,threshold,x,y,skiparray,thresholdsearch){

    if(colors[y][x] == -1 || skiparray[y][x] != 0) return;

    let positions = [[x,y]];
    let exploredclone = {};

    let index = 0;

    let choices = [[0,1], [-1,0], [0,-1], [1,0], [1,1], [-1,1], [-1,-1], [1,-1]];

    let alternatecolor = -1;

    while(index < positions.length){

        let me = positions[index];

        for(var j = 0; j < choices.length; j++){

            let nx = me[0] + choices[j][0];
            let ny = me[1] + choices[j][1];

            if( !(nx < 0 || nx >= colors[0].length) && !(ny < 0 || ny >= colors.length) ){

              if(alternatecolor == -1 && colors[ny][nx] != -1 && colors[ny][nx] != colors[me[1]][me[0]]){
                alternatecolor = colors[ny][nx]
              }


              if([nx,ny] in exploredclone == false && colors[ny][nx] == colors[me[1]][me[0]]){
                exploredclone[[nx,ny]] = 1;
                positions.push([nx,ny]);
              }


            }


        }

        index += 1;

    }

    let num = 1;

    if(positions.length < threshold) num = -1;
    else skiparray[1] += positions.length;

    for(var i = 0; i < positions.length; i++){
        let me = positions[i];
        skiparray[me[1]][me[0]] = num;

        if(thresholdsearch && num == -1) colors[me[1]][me[0]] = alternatecolor;
    }

}

let currentlydrawing = false;
let floodedpixels = 0;
let totalpixels = 0;

async function floodeverything(colors,explored,s,p,dx,dy,threshold,thresholdsearch){

    floodedpixels = 0;
    totalpixels = 0;

    let skiparray = [];

    currentlydrawing = true;

    for(var i = 0; i < colors.length; i++){
      skiparray.push(new Array(colors[0].length).fill(0));
    }

    console.log("calculating");

    await calculate();

    console.log("done calculating");

    async function calculate(){

      return new Promise((resolve) => {
        let startx = 0;
        let starty = 0;
        iterate();
        function iterate(){

          for(var y = starty; y < colors.length; y++){
            for(var x = y == starty ? startx : 0; x < colors[0].length; x++){

              if(!currentlydrawing) return resolve();

              drawintervaltimer[2].innerHTML = "Calculating " + (y * colors[0].length + x) + "/" + (colors.length * colors[0].length) + "<br>Move mouse to cancel"

              checknogo(colors,explored,threshold,x,y,skiparray,thresholdsearch);
              if(colors[y][x] != -1) totalpixels++;

              if((y * colors[0].length + x) % 100 == 0){
                startx = x + 1;
                starty = y;
                setTimeout( iterate, 1 );
                return;
              }

            }
          }
          resolve();
        }

      })


    }

    if(!currentlydrawing) return;


    let floodareas = [];

    startx = 0;
    starty = 0;
    dosearch();

    async function dosearch(){

      for(var y = starty; y < colors.length; y++){
          for(var x = y == starty ? startx : 0; x < colors[0].length; x++){

            if(!currentlydrawing) return leftup(x,y,p,dx,dy);;
            if(colors[y][x] == -1) continue;
            if(explored[y][x] == 0){

              let color = colors[y][x];

              clickcolor(color);

              leftdown(x,y,p,dx,dy);

              leftup(x,y,p,dx,dy);

              moveto(x,y,p,dx,dy);

              leftdown(x,y,p,dx,dy)

              await floodfill(x,y,explored,colors,s,p,dx,dy);

              leftup(x,y,p,dx,dy);

              startx = x;
              starty = y;

              setTimeout(dosearch, 10);

              return;

            }

          }
      }

      drawintervaltimer[2].remove();
      currentlydrawing = false;

    }



}


function clickcolor(index){
  document.getElementsByClassName("drawing-canvas__tool-settings__color-palette__option ng-scope")[index].click()
}

function getcoords(x,y,p,dx,dy){
  return {
    x: x*p + dx,
    y: y*p + dy
  }
}

function leftdown(x,y,p,dx,dy){
  document.getElementsByClassName("upper-canvas")[0].dispatchEvent(createMouseEvent("pointerdown", getcoords(x,y,p,dx,dy)));
}

function leftup(x,y,p,dx,dy){
  document.getElementsByClassName("upper-canvas")[0].dispatchEvent(createMouseEvent("pointerup", getcoords(x,y,p,dx,dy)));
}

function moveto(x,y,p,dx,dy){
  document.getElementsByClassName("upper-canvas")[0].dispatchEvent(createMouseEvent("pointermove", getcoords(x,y,p,dx,dy)));
}

function drawimage(image_data, draw_speed, image_gap, image_pos, image_scale, skip_threshold, skip_search){

  let list = [];
  let explored = [];
  let values = [[255,255,255],[0,0,0],[214,26,33],[239,154,22],[254,207,49],[84,185,73],[13,105,177],[164,69,196],[227,59,218],[229,2,99],[248,144,3],[241,209,2],[221,231,4],[7,217,130],[6,194,235],[85,32,12],[136,86,61],[190,123,78],[176,125,105],[222,154,126],[224,157,87],[214,162,122],[203,177,154],[238,188,153],[248,218,187],[251,220,169],[253,239,213],[102,102,102],[153,153,153],[204,204,204]];

  for(var y = 0; y < image_data.height * image_scale; y++){

    let array = [];
    let explore = [];

    for(var x = 0; x < image_data.width *image_scale; x++){
        array.push([0,0,0,0]);
        explore.push(0);
    }

    explored.push(explore);
    list.push(array);

  }

  let index = 0;
  for(var y = 0; y < image_data.height * image_scale; y++){
      for(var x = 0; x < image_data.width * image_scale; x++){
          index = ( Math.floor(y / image_scale) * image_data.width + Math.floor(x / image_scale) ) * 4;
          list[y][x] = get_closest([image_data.data[index], image_data.data[index+1], image_data.data[index+2], image_data.data[index+3]], values);
      }
  }

  floodeverything(list, explored, draw_speed, image_gap, image_pos[0], image_pos[1], skip_threshold, skip_search)
}

let imagecanvas = document.createElement("canvas");
let imagecontext = imagecanvas.getContext("2d");

function getPixelArray(url){

  return new Promise((resolve, reject) => {
    let img = new Image()
    img.crossOrigin = "Anonymous";
    img.src = url;

    img.onload = () => {

      imagecanvas.width = img.width;
      imagecanvas.height = img.height;
      imagecontext.drawImage(img, 0, 0);

      let data = imagecontext.getImageData(0,0,img.width,img.height);

      resolve(data);
    }



  })

}



let theimage = null;

let drawintervaltimer = [null];

function drawinterval(){


  let distance = (new Date().getTime()) - drawintervaltimer[3];
  let timeleft = (drawintervaltimer[0] - distance)/1000;

  drawintervaltimer[2].innerHTML = "Starting in " + Math.ceil(timeleft) + " <br>To stop drawing, simply move your cursor while the bot is drawing :D";

  if(timeleft < 0){
    getPixelArray(theimage.src).then(data => {
      drawimage(data, draw_speed, 1, drawintervaltimer[4], 1, 25, true)
      theimage.remove();
      theimage = null;
      clearInterval(drawintervaltimer[1]);
      drawintervaltimer[0] = null;
    });

  }

}


window.addEventListener("dragover",function(e){
  e = e || event;
  e.preventDefault();
});
window.addEventListener("drop",function(e){
  e = e || event;
  e.preventDefault();
  for(var i = 0; i < e.dataTransfer.items.length; i++){

    let item = e.dataTransfer.items[i];
    if(item.kind == "file"){
            var blob = item.getAsFile();
            var reader = new FileReader();
            reader.onload = function (event) {


              theimage = new Image();
              theimage.src = event.target.result;
              theimage.style.position = "absolute";

              let currentpos = document.getElementsByClassName("upper-canvas")[0].getBoundingClientRect();
              let dx = e.clientX - currentpos.x;
              let dy = e.clientY - currentpos.y;
              theimage.style.left = dx + "px";
              theimage.style.top = dy + "px";

              document.getElementsByClassName("upper-canvas")[0].parentElement.appendChild(theimage);

            };
            reader.readAsDataURL(blob);
    }

  }



}, false);

window.addEventListener("mousemove",function(e){

  //theimage.style.position = "absolute";

  if(currentlydrawing){
    currentlydrawing = false;
    drawintervaltimer[2].remove();
  }

  if(theimage != null && drawintervaltimer[0] == null){
    let currentpos = document.getElementsByClassName("upper-canvas")[0].getBoundingClientRect();
    let dx = e.clientX - currentpos.x;
    let dy = e.clientY - currentpos.y;
    theimage.style.left = dx + "px";
    theimage.style.top = dy + "px";
  }


}, false);

window.addEventListener("mousedown",function(e){
  if(theimage != null && drawintervaltimer[0] == null){
    let currentpos = document.getElementsByClassName("upper-canvas")[0].getBoundingClientRect();
    let dx = e.clientX - currentpos.x;
    let dy = e.clientY - currentpos.y;
    theimage.style.left = dx + "px";
    theimage.style.top = dy + "px";

    //getPixelArray(theimage.src).then(data => drawimage(data, draw_speed, 1, [e.clientX, e.clientY], 1, 25, true));
    //theimage.remove();
    //theimage = null;

    let imagetext = document.createElement("p");
    imagetext.style.fontSize = "30px";
    imagetext.style.position = "absolute";
    imagetext.style.left = "0px";
    imagetext.style.top = "0px";
    imagetext.style.color = "black";
    imagetext.style.backgroundColor = "red";

    let interval = setInterval(drawinterval, 100);
    drawintervaltimer = [5000, interval, imagetext, new Date().getTime(), [e.clientX, e.clientY]];

    theimage.parentElement.appendChild(imagetext);



  }
}, false);
