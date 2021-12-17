const canvas = document.getElementById("main");
G = {};
G.ctx = canvas.getContext("2d");
G.ctx.fillStyle = "white";
G.ctx.fillRect(0, 0, 800, 600);
G.blankTimer = 0;
G.objects = [];
G.testing = false;
G.keys = {};
G.keys.right = false;
G.keys.left = false;
G.jumps = 0;
G.deco = [];
G.speed = 5;
G.terminal = {};
G.terminal.x = 6;
G.terminal.y = 25;
G.terminal.vx = 0.4;
G.texts = [];
G.spawn = {};
G.posx = 0;
G.posy = 0;
G.select = 1;
G.mode = 0;
G.type = 1;
G.gridSize = 0;
G.spawn.x = 50;
G.spawn.y = 50;
G.offset = {};
G.offset.x = 0;
G.offset.y = 0;
G.character = {};
G.character.x = 0;
G.character.y = 0;
G.character.width = 20;
G.character.height = 20;
G.character.vx = 0;
G.character.vy = 0;
G.character.collider = {};
G.character.collider.x = 0;
G.character.collider.y = 0;
G.character.collider.width = 20;
G.character.collider.height = 20;
G.left = false;
G.up = false;
G.right = false;
G.down = false;
G.blank = JSON.parse(`{
    "goal": "flag",
    "character": {
        "width": 20,
        "height": 20
    },
    "spawn": {
        "x": 50,
        "y": -50
    },
    "objects": [
        {
            "type": 3,
            "x": -2000,
            "y": 450,
            "width": 5200,
            "height": 500
        }
    ],
    "decorations": [
        {
            "x": 45,
            "y": -55,
            "width": 30,
            "height": 30,
            "color": "#ccff3377"
        }
    ],
    "texts": [
        
    ]
}`);
class Platform {
    constructor(x, y, width, height, type, power, boost) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.power = power;
        this.boost = boost;
    }
}
class Rect {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
}
class GameText {
    constructor(x, y, size, font, text, color, align = "left") {
        this.x = x;
        this.y = y;
        this.font = size + "px " + font;
        this.text = text;
        this.color = color;
        this.align = align;
    }
}
function CollisionDirection(object) {
    const root = G.character;
    //Get distances from each side
    var root_bottom = root.y + root.height;
    var object_bottom = object.y + object.height;
    var root_right = root.x + root.width;
    var object_right = object.x + object.width;

    var b_collision = object_bottom - root.y;
    var t_collision = root_bottom - object.y;
    var l_collision = root_right - object.x;
    var r_collision = object_right - root.x;

    //Return closest side
    if (
        t_collision == b_collision ||
        t_collision == l_collision ||
        t_collision == r_collision ||
        b_collision == l_collision ||
        b_collision == r_collision ||
        l_collision == r_collision
    ) {
        return;
    }
    if (t_collision < b_collision && t_collision < l_collision && t_collision < r_collision && root.vy > 0) {
        return "t";
    }
    if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision && root.vy < 0) {
        return "b";
    }
    if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision && root.vx < 0) {
        return "l";
    }
    if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision && root.vy > 0) {
        return "r";
    }
    return;
}
function IsCollision(root, object) {
    //Detect if objects are overlapping
    var collision = false;
    if (
        root.x > object.x &&
        root.x < object.x + object.width &&
        root.y > object.y &&
        root.y < object.y + object.height
    ) {
        collision = true;
    } if (
        root.x + root.width > object.x &&
        root.x + root.width < object.x + object.width &&
        root.y > object.y &&
        root.y < object.y + object.height
    ) {
        collision = true;
    } if (
        root.x > object.x &&
        root.x < object.x + object.width &&
        root.y + root.height > object.y &&
        root.y + root.height < object.y + object.height
    ) {
        collision = true;
    } if (
        root.x + root.width > object.x &&
        root.x + root.width < object.x + object.width &&
        root.y + root.height > object.y &&
        root.y + root.height < object.y + object.height
    ) {
        collision = true;
    }
    return collision;
}
function LevelCollision(root) {
    //Run collision with every object in level
    var collisions = [];
    for (const object of G.objects) {
        var collision = IsCollision(root, object);
        if (collision) {
            collisions.push(object);
        }
    }
    return collisions;
}
function LoadLevel(leveldata) {
    G.objects = [];
    G.texts = [];
    G.deco = [];
    if (leveldata != undefined) {
        G.leveldata = leveldata;
    } else {
        G.leveldata = JSON.parse(document.getElementById("io").value);
    }
    G.character.width = G.leveldata.character.width;
    G.character.height = G.leveldata.character.height;
    G.spawn.x = G.leveldata.spawn.x;
    G.spawn.y = G.leveldata.spawn.y;
    G.character.x = G.spawn.x;
    G.character.y = G.spawn.y;
    G.character.collider.width = G.character.width;
    G.character.collider.height = G.character.height;
    for (const object of G.leveldata.objects) {
        G.objects.push(new Platform(object.x, object.y, object.width, object.height, object.type, object.power, object.boost));
    }
    for (const deco of G.leveldata.decorations) {
        G.deco.push(new Rect(deco.x, deco.y, deco.width, deco.height, deco.color));
    }
    for (const text of G.leveldata.texts) {
        var align = "left"
        if ("align" in text) {
            align = text.align
        }
        G.texts.push(new GameText(text.x, text.y, text.size, text.font, text.text, text.color, align));
    }
    G.playing = true;
}
G.colors = [
    "#444444", //0: Normal
    "#666644", //1: Jump
    "#44aa44", //2: Bounce
    "#ee2222", //3: Lava
    "#4444ee", //4: Jump Pad
    "#aaaa44", //5: Double Jump
    "#eeee44", //6: Triple Jump
    "#88aa44", //7: Jump Bounce Pad
    "#ee44ee", //8: Boost
    "#44ff44" //9: Goal
];
G.difficultyColors = [
    "#44dddd", //0
    "#44dd44", //1
    "#dddd44", //2
    "#ee8844", //3
    "#dd4444", //4
]
G.infoTexts = [
    "Select Pos to Delete",
    "Select Pos 1",
    "Select Pos 2"
]
function LoadBlank() {
    if (G.blankTimer > 0) {
        G.blankTimer = 0;
        LoadLevel(G.blank);
    } else {
        G.blankTimer = 200;
        document.getElementById("blank").innerHTML = "Confirm?";
    }
}
function CenterScreen() {
    G.offset.x = 0;
    G.offset.y = 0;
}
function Draw() {
    if (G.right) G.offset.x -= G.speed;
    if (G.left) G.offset.x += G.speed;
    if (G.up) G.offset.y += G.speed;
    if (G.down) G.offset.y -= G.speed;
    G.ctx.fillStyle = "#ffffff";
    G.ctx.fillRect(0, 0, 1200, 700);
    if (G.gridSize >= 10) {
        G.ctx.strokeStyle = "black";
        G.ctx.beginPath();
        const yoffset = G.offset.y % G.gridSize;
        const xoffset = G.offset.x % G.gridSize;
        for (x = 0; x < 1400; x += G.gridSize) {
            G.ctx.moveTo(x + xoffset, -200 + yoffset);
            G.ctx.lineTo(x + xoffset, 800 + yoffset);
        }
        for (y = 0; y < 800; y += G.gridSize) {
            G.ctx.moveTo(-200 + xoffset, y + yoffset);
            G.ctx.lineTo(1400 + xoffset, y + yoffset);
        }
        G.ctx.stroke();
    }
    G.ctx.fillStyle = "gold";
    G.ctx.fillRect(G.character.x + G.offset.x, G.character.y + G.offset.y, G.character.width, G.character.height);
    for (const platform of G.objects) {
        G.ctx.fillStyle = G.colors[platform.type];
        if (platform.type == 4) {
            gval = parseInt(Math.min(platform.power * 12, 255)).toString(16);
            if (gval.length == 1) gval = "0" + gval;
            bval = parseInt(Math.min(platform.power * 20, 255)).toString(16);
            if (bval.length == 1) bval = "0" + bval;
            G.ctx.fillStyle = "#33" + gval + bval;
        }
        if (platform.type == 8) {
            rval = parseInt(Math.min((platform.boost - 0.1) * 300, 255)).toString(16);
            if (rval.length == 1) rval = "0" + rval;
            bval = parseInt(Math.min((platform.power - 1) * 18, 255)).toString(16);
            if (bval.length == 1) bval = "0" + bval;
            G.ctx.fillStyle = `#${rval}33${bval}`;
        }
        G.ctx.fillRect(platform.x + G.offset.x, platform.y + G.offset.y, platform.width, platform.height);
    }
    for (const deco of G.deco) {
        G.ctx.fillStyle = deco.color;
        G.ctx.fillRect(deco.x + G.offset.x, deco.y + G.offset.y, deco.width, deco.height);
    }
    for (const text of G.texts) {
        G.ctx.fillStyle = text.color;
        G.ctx.font = text.font;
        G.ctx.textAlign = text.align;
        G.ctx.fillText(text.text, text.x + G.offset.x, text.y + G.offset.y);
    }
    G.ctx.fillStyle = "#000000";
    G.ctx.font = "24px 'Press Start 2P', sans-serif";
    G.ctx.fillStyle = "#eeeeee";
    G.ctx.fillRect(0, 0, 1400, 40);
    G.ctx.textAlign = "left";
    G.ctx.fillStyle = "#000000";
    G.ctx.textBaseline = "top";
    G.ctx.fillText(G.infoTexts[G.select], 10, 10);
    G.ctx.textAlign = "left";
    G.ctx.textBaseline = "alphabetic"
}
window.addEventListener('keydown', (event) => {
    if (!G.testing) {
        if (event.code == "KeyA") G.left = true;
        if (event.code == "KeyD") G.right = true;
        if (event.code == "KeyW") G.up = true;
        if (event.code == "KeyS") G.down = true;
        if (event.key == "Shift") G.speed = 25;
    }
    if (event.code == "KeyE") ToggleMode();
    if (event.code == "KeyQ") ToggleType();
    if (event.code == "KeyC") CenterScreen();
    if (event.code == "KeyN") LoadBlank();
    if (event.code == "KeyT") ToggleTest();
    if (G.testing) {
        if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1 && G.testing) {
            event.preventDefault();
        }
        if (event.code == "ArrowRight") G.keys.right = true;
        if (event.code == "ArrowLeft") G.keys.left = true;
        if (event.code == "Space" && G.jumps > 0) {
            G.character.vy = -6;
            G.jumps -= 1;
        }
    }
});
window.addEventListener('keyup', (event) => {
    if (event.code == "KeyA") G.left = false;
    if (event.code == "KeyD") G.right = false;
    if (event.code == "KeyW") G.up = false;
    if (event.code == "KeyS") G.down = false;
    if (event.key == "Shift") G.speed = 5;
    if (G.testing) {
        if (event.code == "ArrowRight") G.keys.right = false;
        if (event.code == "ArrowLeft") G.keys.left = false;
    }
});
function Movement() {
    //Change character velocity
    if (G.keys.left && G.character.vx > -G.terminal.x) {
        G.character.vx -= G.terminal.vx;
    } if (G.keys.right && G.character.vx < G.terminal.x) {
        G.character.vx += G.terminal.vx;
    }
    if (G.character.vx < 0) {
        G.character.vx = Math.min(G.character.vx + 0.2, 0);
    } if (G.character.vx > 0) {
        G.character.vx = Math.max(G.character.vx - 0.2, 0);
    }
}
function Main() {
    G.gridSize = parseInt(document.getElementById("gridSize").value);
    G.blankTimer--;
    if (G.blankTimer <= 0) {
        document.getElementById("blank").innerHTML = "New";
    }
    if (G.testing) {
        //Create character collider where it would be next frame
        G.character.collider.x = G.character.x + G.character.vx;
        G.character.collider.y = G.character.y + G.character.vy;
        Movement();
        //Collide with objects
        var collisions = LevelCollision(G.character.collider)
        if (collisions.length != 0) {
            var collide = true;
            //Loop through all collisions
            for (const collision of collisions) {
                const direction = CollisionDirection(collision);
                if (direction == "t") {
                    G.jumps = 0;
                    G.terminal.x = 6;
                    G.terminal.vx = 0.4;
                }
                //Do stuff depending on object type
                if (collision.type == 3) {
                    G.character.x = G.leveldata.spawn.x;
                    G.character.y = G.leveldata.spawn.y;
                    G.character.vx = 0;
                    G.character.vy = 0;
                    collide = false;
                } if (collision.type == 1 && direction == "t") {
                    G.jumps = 1;
                } if (collision.type == 5 && direction == "t") {
                    G.jumps = 2;
                } if (collision.type == 2 && G.character.vy > 4 && direction == "t") {
                    G.character.vy = -G.character.vy * 0.65;
                    collide = false;
                } if (collision.type == 6 && direction == "t") {
                    G.jumps = 3;
                } if (collision.type == 4 && direction == "t") {
                    G.character.vy = -collision.power;
                    collide = false;
                } if (collision.type == 8 && direction == "t") {
                    G.terminal.x = collision.power;
                    G.terminal.vx = collision.boost;
                } if (collision.type == 9) {
                    //Game finished
                    ToggleTest();
                } if (collision.type == 7 && G.character.vy > 4 && direction == "t") {
                    G.character.vy = -G.character.vy * 0.65;
                    G.jumps = 1;
                    collide = false;
                }
                if (collide) {
                    if (direction == "t") {
                        G.character.y = collision.y - G.character.height;
                        G.character.vy = 0;
                    } else if (direction == "b") {
                        G.character.y = collision.y + collision.height;
                        G.character.vy = 0;
                    } else if (direction == "l") {
                        G.character.x = collision.x - G.character.width;
                        G.character.vx = 0;
                    } else if (direction == "r") {
                        G.character.x = collision.x + collision.width;
                        G.character.vx = 0;
                    }
                }
            }
        }
        G.character.x += G.character.vx;
        G.character.y += G.character.vy;
        G.character.vy += 0.25;
        G.character.vy = Math.min(G.character.vy, G.terminal.y);
        G.offset.x = Math.round(-G.character.x + 1200 / 2 - G.character.width / 2);
        G.offset.y = Math.round(-G.character.y + 700 / 2 - G.character.height / 2);
    }
    Draw();
}
function ToggleMode() {
    if (G.select == 1) {
        G.select = 0;
        document.getElementById("mode").innerHTML = "Delete";
    }
    else if (G.select == 0) {
        G.select = 1;
        document.getElementById("mode").innerHTML = "Place";
    }
}
function ToggleType() {
    if (G.type == 1) {
        G.type = 0;
        document.getElementById("type").innerHTML = "Deco";
    }
    else if (G.type == 0) {
        G.type = 1;
        document.getElementById("type").innerHTML = "Platform";
    }
}
function Click(x, y) {
    console.log(x, y);
    if (G.select == 1) {
        G.select++;
        G.posx = x - G.offset.x;
        G.posy = y - G.offset.y;
    } else if (G.select == 2) {
        G.select = 1;
        if (G.gridSize < 10) {
            var xpos = G.posx;
            var ypos = G.posy;
            var width = x - G.posx;
            var height = y - G.posy;
            if (width < 0) {
                xpos += width;
                width = Math.abs(width);
            }
            if (height < 0) {
                ypos += height;
                height = Math.abs(height);
            }
            if (height == 0 || width == 0) {
                return;
            }
            if (G.type == 1) {
                G.objects.push(new Platform(xpos, ypos, width, height, document.getElementById("platform").value, parseFloat(document.getElementById("power").value), parseFloat(document.getElementById("boost").value)));
            } else {
                const color = document.getElementById("color").value + parseInt(document.getElementById("alpha").value).toString(16);
                console.log(color);
                G.deco.push(new Rect(xpos, ypos, width, height, color));
            }
        } else {
            var xpos = Math.round((G.posx) / G.gridSize) * G.gridSize;
            var ypos = Math.round((G.posy) / G.gridSize) * G.gridSize;
            var width = Math.round((x - G.posx - G.offset.x) / G.gridSize) * G.gridSize;
            var height = Math.round((y - G.posy - G.offset.y) / G.gridSize) * G.gridSize;
            if (width < 0) {
                xpos += width;
                width = Math.abs(width);
            }
            if (height < 0) {
                ypos += height;
                height = Math.abs(height);
            }
            if (height == 0 || width == 0) {
                return;
            }
            if (G.type == 1) {
                G.objects.push(new Platform(xpos, ypos, width, height, parseInt(document.getElementById("platform").value), parseFloat(document.getElementById("power").value), parseFloat(document.getElementById("boost").value)));
            } else {
                const color = document.getElementById("color").value + parseInt(document.getElementById("alpha").value).toString(16);
                console.log(color);
                G.deco.push(new Rect(xpos, ypos, width, height, color));
            }
        }
    }
    if (G.select == 0) {
        var success = true;
        while (success) {
            success = false;
            for (let i = 0; i < G.objects.length; i++) {
                const platform = G.objects[i];
                if (platform.x < x - G.offset.x && platform.x + platform.width > x - G.offset.x && platform.y < y - G.offset.y && platform.y + platform.height > y - G.offset.y) {
                    G.objects.splice(i, 1);
                    success = true;
                    break
                }
            }
        }
        var success = true;
        while (success) {
            success = false;
            for (let i = 0; i < G.deco.length; i++) {
                const platform = G.deco[i];
                if (platform.x < x - G.offset.x && platform.x + platform.width > x - G.offset.x && platform.y < y - G.offset.y && platform.y + platform.height > y - G.offset.y) {
                    G.deco.splice(i, 1);
                    success = true;
                    break
                }
            }
        }
    }
}
function ToggleTest() {
    G.terminal.x = 6;
    G.terminal.vx = 0.4;
    G.character.vx = 0;
    G.character.vy = 0;
    if (G.testing) {
        G.testing = false;
        G.character.x = G.spawn.x;
        G.character.y = G.spawn.y;
        document.getElementById("test").innerHTML = "Test";
    } else {
        G.testing = true;
        G.character.x = G.spawn.x;
        G.character.y = G.spawn.y;
        document.getElementById("test").innerHTML = "Edit";
    }
}
function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    Click(x, y);
}
function Export() {
    const output = {}
    output.goal = "flag";
    output.character = {};
    output.character.width = G.spawn.width;
    output.character.height = G.spawn.height;
    output.spawn = {};
    output.spawn.x = G.spawn.x;
    output.spawn.y = G.spawn.y;
    output.objects = G.objects;
    output.decorations = G.deco;
    output.texts = G.texts;
    document.getElementById("io").value = JSON.stringify(output);
}
canvas.addEventListener('mousedown', function (e) {
    getCursorPosition(canvas, e);
})
setInterval(function () {
    Main();
}, 20);