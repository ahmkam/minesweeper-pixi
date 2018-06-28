const Game = require("./Game");

var rows = 9;
var cols = 9;
var mines = 10;
var flags = 10;

function load()
{
    document.getElementById("input_editMines").checked = false;
    document.getElementById("input_rows").value = rows;
    document.getElementById("input_cols").value = cols;
    document.getElementById("input_mines").value = mines;
    document.getElementById("input_flags").value = flags;

    window.PointerEvent = null;
    game = new Game();
    game.load(game, rows, cols, mines, flags);
}

load();

exports.load = load;


