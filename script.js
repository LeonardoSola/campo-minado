var campo = document.getElementById("campo");
var sizex = document.getElementById("sizex");
var sizey = document.getElementById("sizey");
var bombs = document.getElementById("bombs");
var startBtn = document.getElementById("startBtn");

// prevent default context menu
document.addEventListener("contextmenu", function(e){
    e.preventDefault();
})

class Cell{
    x = 0;
    y = 0;
    bomb = false;
    open = false;
    flag = false;
    bombsAround = 0;
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    setBomb(){
        this.bomb = true;
    }

    position(){
        return this.x + "-" + this.y;
    }

    content(){
        if(this.open) {
            if(this.bomb) return "💣";
            else return this.GetBombsAround();
        }
        
        if(this.flag){
            return "🚩";
        }
        if(this.open){
            if(this.bomb){
                return "💣";
            }else if(this.GetBombsAround() > 0){
                return this.GetBombsAround();
            }else{
                return "";
            }
        }
        return "";
    }

    cssClass(){
        var classes = [];

        if(this.open) classes.push("open");
        else classes.push("closed");
        if(this.flag) classes.push("flag");
        if(this.bomb) classes.push("bomb");

        switch (this.GetBombsAround()) {
            case 1:
                classes.push("one");
                break;
            case 2:
                classes.push("two");
                break;
            case 3:
                classes.push("three");
                break;
            case 4:
                classes.push("four");
                break;
            case 5:
                classes.push("five");
                break;
            case 6:
                classes.push("six");
                break;
            case 7:
                classes.push("seven");
                break;
            case 8:
                classes.push("eight");
                break;
        }
        
        return classes.join(" ");
    }

    GetBombsAround(){
        if(this.bombsAround > 0) return this.bombsAround;
        if(this.bomb) return "💣";
        var count = 0;
        for(var x = this.x - 1; x <= this.x + 1; x++){
            for(var y = this.y - 1; y <= this.y + 1; y++){
                if(x == this.x && y == this.y) continue;
                var cell = game.cells.get(x + "-" + y);
                if(cell == undefined) continue;
                if(cell.bomb) count++;
            }
        }
        this.bombsAround = count;
        return count;
    }
}

var game = {
    size: {
        x: 0,
        y: 0
    },
    bombs: 0,
    cells: new Map(),
    bombsCount: 0,
    bombsFound: 0,
    start: false,
    gameover: false,
    win: false
}

function inital(){
    sizex.value = 10;
    sizey.value = 10;
    bombs.value = 25;
    start();
}
inital()

startBtn.addEventListener("click", start);
function start(){
    game.size.x = sizex.value || 10;
    game.size.y = sizey.value || 10;
    game.bombs = bombs.value || 25;
    
    campGenerator();
    campRender()
}

function campGenerator(){
    game.cells = new Map();
    game.bombsCount = 0;
    game.bombsFound = 0;
    game.gameover = false;
    game.win = false;
    game.start = false;

    if(game.bombs >= game.size.x * game.size.y){
        alert("Número de bombas alterado para o máximo possível");
        game.bombs = game.size.x * game.size.y - 1;
    }

    for(var x = 0; x < game.size.x; x++){
        for(var y = 0; y < game.size.y; y++){
            game.cells.set(x + "-" + y, new Cell(x, y));
        }
    }

    while(game.bombsCount < game.bombs){
        var x = Math.floor(Math.random() * game.size.x);
        var y = Math.floor(Math.random() * game.size.y);
        var cell = game.cells.get(x + "-" + y);
        if(cell.bomb) continue;
        cell.setBomb();
        game.bombsCount++;
    }
}

function campRender(){
    campo.innerHTML = "";

    for(var x = 0; x < game.size.x; x++){
        var newRow = ""
        newRow += `<div class='row' id='row${x}'>`;

        for(var y = 0; y < game.size.y; y++){
            celula = game.cells.get(x + "-" + y);
            if(game.gameover) celula.open = true;
            if(celula == undefined) continue
            newRow += `<div class='cell ${celula.cssClass()}' id='${celula.position()}' onclick='openCell(${x}, ${y})' oncontextmenu='flagCell(${x}, ${y})'>${celula.content()}</div>`;
        }
        
        newRow += "</div>";
        campo.innerHTML += newRow;
    }
}

function openCell(x, y, force = false){
    if(game.gameover || game.win) return;
    var cell = game.cells.get(x + "-" + y);
    if(cell == undefined) return;
    if(cell.open) return;
    if(cell.flag) return;
    cell.open = true;
    if(cell.bomb && !force){
        // Nunca perca no primeiro clique
        if(!game.start){
            campGenerator();
            openCell(x, y);
            return;
        }
        game.gameover = true;
        alert("Você perdeu!");
        campRender();
        return;
    }
    if(cell.bombsAround == 0){
        openAround(x, y);
    }
    if(!force) gameTick()
}

function flagCell(x, y){
    if(game.gameover || game.win) return;
    var cell = game.cells.get(x + "-" + y);
    if(cell == undefined) return;
    if(cell.open) return;
    cell.flag = !cell.flag;
    gameTick()
}

function openAround(row, columns){
    var thisCell = game.cells.get(row + "-" + columns);
    for(let x = row - 1; x <= row + 1; x++){
        for(let y = columns - 1; y <= columns + 1; y++){
            var cell = game.cells.get(x + "-" + y);
            if(cell == undefined) continue;
            if(cell.open) continue;
            if(cell.flag) continue;
            if(cell.bomb) continue;
            if(cell.GetBombsAround() > 0 && thisCell.GetBombsAround()  > 0) continue;
            openCell(x, y, true);
        }
    }
    gameTick()
}

function checkWin(){
    if(game.gameover) return;
    var win = true;
    for(let bomb of game.cells.values()){
        if(bomb.bomb && !bomb.flag){
            win = false;
            break;
        }
    }
    if(win){
        game.win = true;
        alert("Você ganhou!");
    }
}

function gameTick(){
    game.start = true;
    campRender();
    checkWin();
}