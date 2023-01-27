from PIL import Image;
import time, ctypes, keyboard;
import copy;

#press the safe_key while drawing to make the program stop
safe_key = 'q';
image_name = "pixelart.png";

#make sure with inspect element that all palette colors are on the screen, so the bot can click on them if needed
#0,0 is top left corner
palette_first = [130,485]; #screen x,y location of the first palette color
palette_last = [1200,485]; #screen x,y location of the last palette color,

#if drawing is too slow, decrease it, if it's too fast and messing up, increase it
draw_speed = 0.005;

#how much to scale image by
image_scale = 1;

#gap between each pixel
image_gap = 1;

#x,y position of top left corner of the image
image_pos = [345,143];

#skip the pixel if it's just like a single color by itself
skip_threshold = 25;
skip_search = True;

def sleep(duration, get_now=time.perf_counter):
    now = get_now();
    end = now + duration;
    while now < end:
        now = get_now();

def get_closest(val, values):
    closest = 0;
    distance = 1000000;

    if(val[3] == 0):
        return -1;


    for i in range(0, len(values)):
        distancei = abs(values[i][0] - val[0]) + abs(values[i][1] - val[1]) + abs(values[i][2] - val[2])

        if distancei < distance:
            distance = distancei;
            closest = i;

    return closest;

def floodfill(x,y,explored,colors,s,p,dx,dy):

    paths = [[0,1], [-1,0], [0,-1], [1,0], [1,1], [-1,1], [-1,-1], [1,-1]];

    floodarray = [[x,y,0]];
    explored[y][x] = 1;
    breakout = 0;

    mousecurrent = [x,y];

    while len(floodarray) > 0:

        me = floodarray[len(floodarray)-1];

        if me[2] == len(paths)-1:
            floodarray.pop();
            continue;

        if keyboard.is_pressed(safe_key):
            return;

        for i in range(me[2],len(paths)):

            nx = me[0] + paths[i][0];
            ny = me[1] + paths[i][1];

            if not (nx < 0 or nx >= len(colors[0])) and not (ny < 0 or ny >= len(colors)) and explored[ny][nx] == 0 and colors[ny][nx] == colors[me[1]][me[0]]:
                explored[ny][nx] = 1;
                floodarray.append([nx,ny,0]);

                movebetween(mousecurrent[0], mousecurrent[1], nx, ny, colors, s, p, dx, dy);

                mousecurrent = [nx,ny];

                me[2] = i;
                break;

            if i == len(paths)-1:
                floodarray.pop();

def movebetween(x,y,x2,y2,colors,s,p,dx,dy):
    movement = findpath(x,y,x2,y2,colors);

    for i in range(1, len(movement)):
        moveto(movement[i][0], movement[i][1],p,dx,dy);
        sleep(s);

def findpath(x,y,x2,y2,colors):

    paths = [ [[x,y]] ];
    newpaths = [];
    choices = [[0,1], [-1,0], [0,-1], [1,0], [1,1], [-1,1], [-1,-1], [1,-1]];

    if abs(x2 - x) <= 1 and abs(y2 - y) <= 1:
        return [[x,y],[x2,y2]];

    explored = [ [0]*len(colors[0]) for _ in range(len(colors)) ];

    while len(paths) > 0:

        for i in range(0, len(paths)):
            me = paths[i][len(paths[i])-1];

            for j in range(0, len(choices)):

                nx = me[0] + choices[j][0];
                ny = me[1] + choices[j][1];

                if nx == x2 and ny == y2:
                    paths[i].append([nx,ny]);
                    return paths[i];

                if not (nx < 0 or nx >= len(colors[0])) and not (ny < 0 or ny >= len(colors)) and explored[ny][nx] == 0 and colors[ny][nx] == colors[me[1]][me[0]]:

                    explored[ny][nx] = 1;

                    copyarray = paths[i].copy();
                    copyarray.append([nx,ny]);
                    newpaths.append(copyarray);

        paths = newpaths;
        newpaths = [];

    return None;



def checknogo(colors,explored,threshold,x,y,skiparray,thresholdsearch):

    if colors[y][x] == -1 or skiparray[y][x] != 0:
        return;

    positions = [[x,y]];
    exploredclone = [ [0]*len(colors[0]) for _ in range(len(colors)) ];

    index = 0;

    choices = [[0,1], [-1,0], [0,-1], [1,0], [1,1], [-1,1], [-1,-1], [1,-1]];

    alternatecolor = -1;

    while index < len(positions):

        me = positions[index];

        for j in range(0, len(choices)):

            nx = me[0] + choices[j][0];
            ny = me[1] + choices[j][1];

            if not (nx < 0 or nx >= len(colors[0])) and not (ny < 0 or ny >= len(colors)):

                if alternatecolor == -1 and colors[ny][nx] != -1 and colors[ny][nx] != colors[me[1]][me[0]]:
                    alternatecolor = colors[ny][nx]

                if exploredclone[ny][nx] == 0 and colors[ny][nx] == colors[me[1]][me[0]]:
                    exploredclone[ny][nx] = 1;
                    positions.append([nx,ny]);

        index += 1;

    num = 1;

    if index < threshold: num = -1;

    for i in range(0, len(positions)):
        me = positions[i];
        skiparray[me[1]][me[0]] = num;

        if thresholdsearch and num == -1:
            colors[me[1]][me[0]] = alternatecolor;

def floodeverything(colors,explored,colorpositions,s,p,dx,dy,threshold,thresholdsearch):

    skiparray = [ [0]*len(colors[0]) for _ in range(len(colors)) ];


    for y in range(0, len(colors)):
        for x in range(0, len(colors[0])):
            checknogo(colors,explored,threshold,x,y,skiparray,thresholdsearch);



    for y in range(0, len(colors)):
        for x in range(0, len(colors[0])):

            if keyboard.is_pressed(safe_key):
                return;

            if colors[y][x] == -1: continue;
            if explored[y][x] == 0:

                color = list[y][x];
                position = colorpositions[color];

                moveto(position[0], position[1], 1,0,0);
                sleep(s);
                leftdown();
                sleep(s);
                leftup();
                sleep(s);
                moveto(x,y,p,dx,dy);
                sleep(s);
                leftdown()
                sleep(s);
                floodfill(x,y,explored,colors,s,p,dx,dy);
                leftup();
                sleep(s);

def leftdown():
    ctypes.windll.user32.mouse_event(2, 0, 0, 0,0)

def leftup():
    ctypes.windll.user32.mouse_event(4, 0, 0, 0,0)

def moveto(x,y,p,dx,dy):
    ctypes.windll.user32.SetCursorPos(x*p + dx, y*p + dy)
    return 0;

def interpolate(a1,a2,n):
    a3 = [];

    for i in range(0,n):
        a3.append([ int(a1[0] + i*(a2[0]-a1[0])/(n-1)), int(a1[1] + i*(a2[1]-a1[1])/(n-1)) ]);

    return a3;


im = Image.open(image_name, "r");


pix_val = list(im.getdata());
list = [];
explored = [];


values = [[255,255,255],[0,0,0],[214,26,33],[239,154,22],[254,207,49],[84,185,73],[13,105,177],[164,69,196],[227,59,218],[229,2,99],[248,144,3],[241,209,2],[221,231,4],[7,217,130],[6,194,235],[85,32,12],[136,86,61],[190,123,78],[176,125,105],[222,154,126],[224,157,87],[214,162,122],[203,177,154],[238,188,153],[248,218,187],[251,220,169],[253,239,213],[102,102,102],[153,153,153],[204,204,204]];
colorpositions = interpolate(palette_first,palette_last,30);

index = 0;

for y in range(0,im.size[1] * image_scale):
    array = [];
    explore = [];
    for x in range(0,im.size[0] * image_scale):

        array.append([0,0,0,0]);
        explore.append(0);

    explored.append(explore);
    list.append(array);

for y in range(0,im.size[1] * image_scale):
    for x in range(0,im.size[0] * image_scale):
        index = int(y / image_scale) * im.size[0] + int(x / image_scale);
        list[y][x] = get_closest(pix_val[index], values);


floodeverything(list, explored, colorpositions, draw_speed, image_gap, image_pos[0], image_pos[1], skip_threshold, skip_search)
