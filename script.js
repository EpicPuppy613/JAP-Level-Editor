const canvas = document.getElementById("main");
G = {};
G.ctx = canvas.getContext("2d");
G.ctx.fillStyle = "white";
G.ctx.fillRect(0, 0, 800, 600);
G.objects = [];
G.deco = [];
G.speed = 5;
G.texts = [];
G.spawn = {};
G.posx = 0;
G.posy = 0;
G.select = 1;
G.mode = 0;
G.gridSize = 0;
G.spawn.x = 50;
G.spawn.y = 50;
G.offset = {};
G.offset.x = 0;
G.offset.y = 0;
G.spawn.width = 20;
G.spawn.height = 20;
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
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
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
function LoadLevel(leveldata) {
    G.objects = [];
    G.texts = [];
    G.deco = [];
    if (leveldata != undefined) {
        G.leveldata = leveldata;
    } else {
        G.leveldata = JSON.parse(document.getElementById("io").value);
    }
    G.spawn.width = G.leveldata.character.width;
    G.spawn.height = G.leveldata.character.height;
    G.spawn.x = G.leveldata.spawn.x;
    G.spawn.y = G.leveldata.spawn.y;
    for (const object of G.leveldata.objects) {
        G.objects.push(new Platform(object.x, object.y, object.width, object.height, object.type));
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
    "#eeee44", //4: Bounce Pad
    "#aaaa44", //5: Double Jump
    "#eeee44", //6: Triple Jump
    "#88aa44", //7: Jump Bounce Pad
    "", //8: None
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
    LoadLevel(G.blank);
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
    G.ctx.fillRect(G.spawn.x + G.offset.x, G.spawn.y + G.offset.y, G.spawn.width, G.spawn.height);
    for (const platform of G.objects) {
        G.ctx.fillStyle = G.colors[platform.type];
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
    if (event.code == "KeyA") G.left = true;
    if (event.code == "KeyD") G.right = true;
    if (event.code == "KeyW") G.up = true;
    if (event.code == "KeyS") G.down = true;
    if (event.key == "Shift") G.speed = 25;
});
window.addEventListener('keyup', (event) => {
    if (event.code == "KeyA") G.left = false;
    if (event.code == "KeyD") G.right = false;
    if (event.code == "KeyW") G.up = false;
    if (event.code == "KeyS") G.down = false;
    if (event.key == "Shift") G.speed = 5;
});
function Main() {
    G.gridSize = parseInt(document.getElementById("gridSize").value);
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
function Click(x, y) {
    console.log(x, y);
    if (G.select == 1) {
        G.select++;
        G.posx = x - G.offset.x;
        G.posy = y - G.offset.y;
    } else if (G.select == 2) {
        G.select = 1;
        if (G.gridSize < 10) {
            G.objects.push(new Platform(G.posx, G.posy, x - G.posx - G.offset.x, y - G.posy - G.offset.y, document.getElementById("platform").value));
        } else {
            xpos = Math.round((G.posx)/G.gridSize) * G.gridSize;
            ypos = Math.round((G.posy)/G.gridSize) * G.gridSize;
            width = Math.round((x - G.posx - G.offset.x)/G.gridSize) * G.gridSize;
            height = Math.round((y - G.posy - G.offset.y)/G.gridSize) * G.gridSize;
            G.objects.push(new Platform(xpos, ypos, width, height, document.getElementById("platform").value));
        }
    }
    if (G.select == 0) {
        var success = true;
        while (success) {
            success = false;
            for (let i = 0; i < G.objects.length; i++) {
                const platform = G.objects[i];
                if (platform.x < x && platform.x + platform.width > x && platform.y < y && platform.y + platform.height > y) {
                    G.objects.splice(i, 1);
                    success = true;
                    break
                }
            }
        }
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
canvas.addEventListener('mousedown', function(e) {
    getCursorPosition(canvas, e);
})
setInterval(function(){
    Main();
}, 25);