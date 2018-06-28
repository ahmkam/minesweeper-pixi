const PIXI = require('pixi.js');
const Tile = require("./Tile");
const LevelData = require("./LevelData");

var context;
var tileSize = 48;
var gRow;
var gCol;
var maxWidth = 528;
var maxHeight = 528;
var detectorRadius = 1;

function getContainerScaledWidth(size)
{
    return (maxWidth / size);
}
function getContainerScaledHeight(size)
{
    return (maxHeight / size);
}

class Grid
{
    constructor(game, rows, cols, mines, flags)
    {
        context = this;
        this.firstMove = true;
        this.mines = mines;
        this.flags = flags;
        this.game = game;
        this.app = game.application;
        this.assets = game.assets;
        this.flagMode = false;
        this.editMode = false;
        this.mineDetecterMode = false;
        this.flagsPlaced = 0;
        this.mousePointerDown = false;
        this.lastMinePlacedTile = undefined;
        this.currentTile = undefined;
        this.tilesDetectList = [];

        var container = new PIXI.Container();
		container.parentClass = this;
        container.interactive = true;
        container.on('pointerout', function(){

            context.mousePointerDown = false;
            if(context.editMode)
            {
                context.lastMinePlacedTile = null;
            }
            
            if(context.mineDetecterMode)
            {
                context.game.turnOffDetectorMode();
            }
        });
        this.app.stage.addChild(container);
        this.container = container;

        this.initGrid(rows, cols);
        this.placeMines(this.mines);

        document.getElementById("input_mineRadius").value = 2;
        document.getElementById("input_mineRadius").addEventListener("input", function(){
            var rad = document.getElementById("input_mineRadius").value;

            if(!rad || rad < 1)
            {
                document.getElementById("input_mineRadius").value = 1;
                rad = 1;
            }

            detectorRadius = parseInt(rad);
        });
    }

    initGrid(rows, cols)
    {
        var grid = [];
        gRow = rows;
        gCol = cols;
        for(var i = 0; i < rows; i++)
        {
            grid[i] = [];
            for(var j = 0; j < cols; j++)
            {
                var posX = j * tileSize;
                var posY = i * tileSize;
                var tile = new Tile(game, i, j, tileSize,
                    this.onTileDown, this.onPlaceFlag, this.onTileOver, this.onTileUp);
                this.container.addChild(tile.sprite);

                grid[i][j] = tile;
            }
        }
        var currentWidth = gCol * tileSize;
        var currentHeight = gRow * tileSize;

        var scaledWidth = getContainerScaledWidth(currentWidth);
        var scaledHeight = getContainerScaledHeight(currentHeight);

        var scaleValue = scaledWidth < scaledHeight ? scaledWidth:scaledHeight;
        context.container.scale.set(scaleValue);
        this.grid = grid;
        this.container.x = (this.app.screen.width - this.container.width) / 2;
        this.container.y = (this.app.screen.height - this.container.height) / 2;
    }

    placeMines(mines)
    {
        var allTiles = [];
        for(var i = 0; i < gRow; i++)
        {
            for(var j = 0; j < gCol; j++)
            {
                allTiles.push(context.grid[i][j]);
            }
        }
        for(var i = 0; i < mines; i++)
        {
            var rand = Math.floor(Math.random() * allTiles.length);
            allTiles[rand].setMine();
            allTiles.splice(rand,1);
        }

        context.mines = mines;
    }

    resize(rows, cols, mines)
    {
        context.mines = mines;

        for (var i = context.container.children.length - 1; i >= 0; i--)
        {
            context.container.removeChild(context.container.children[i]);
        }

        context.initGrid(rows, cols);
        context.reset();
    }

    reset()
    {
        context.flagsPlaced = 0;
        context.firstMove = true;
        context.setTilesInteraction(true);
        for(var i = 0; i < gRow; i++)
        {
            for(var j = 0; j < gCol; j++)
            {
                context.grid[i][j].reset();
            }
        }
        
        context.placeMines(context.mines);
    }

    clearDetectorTiles()
    {
        for(var i = 0; i < context.tilesDetectList.length; i++)
        {
            context.tilesDetectList[i].setMineDetectorEffect(false);
        }
        context.tilesDetectList = [];
    }

    onTileUp(tile)
    {
        context.mousePointerDown = false;
        if(context.editMode)
        {
            context.lastMinePlacedTile = null;
        }

        if(!PIXI.utils.isMobile.any)
        {
            context.clearDetectorTiles();
        }
    }

    onTileDown(tile)
    {
        if(context.mineDetecterMode)
        {
            context.mousePointerDown = true;
            context.starMineDetection(tile);
            return;
        }

        if(context.editMode)
        {
            context.mousePointerDown = true;
            context.currentTile = tile;
            if(!tile.isMine)
            {
                tile.setMineEditMode();
            }
            else
            {
                if(PIXI.utils.isMobile.any)
                {
                    tile.removeMineEditMode();
                }
            }
            context.lastMinePlacedTile = tile;
            return;
        }

        if(tile.isFlagged && !context.flagMode)
            return;

        if(context.flagMode)
        {
            context.onPlaceFlag(tile);
            return;
        }

        if(tile.isMine)
        {
            if(context.firstMove)
            {
                tile.isMine = false;
                context.uncoverLogic(tile);
            }
            else
            {
                context.onGameLose();
            }
        }
        else
        {
            context.uncoverLogic(tile);
        }
        context.firstMove = false;
    }

    onTileOver(tile)
    {
        if(context.mineDetecterMode)
        {
            if(context.mousePointerDown)
            {
                context.starMineDetection(tile);
            }
            return;
        }

        if(context.editMode)
        {
            if(context.mousePointerDown)
            {
                if(!tile.isMine)
                {
                    if(context.lastMinePlacedTile != null)
                    {
                        context.lastMinePlacedTile.removeMineEditMode();
                    }
                    tile.setMineEditMode();
                    context.lastMinePlacedTile = tile;
                    context.currentTile = tile;
                }
            }
        }
    }


    starMineDetection(tile)
    {
        var startRow = tile.row - detectorRadius;
        var endRow = tile.row + detectorRadius;

        var startCol = tile.col - detectorRadius;
        var endCol = tile.col + detectorRadius;

        if(startRow < 0)
            startRow = 0;
        if(startCol < 0)
            startCol = 0;

        if(endRow >= gRow)
            endRow = gRow - 1; 
        if(endCol >= gCol)
            endCol = gCol - 1;

        context.clearDetectorTiles();    
            
        for(var i = startRow; i <= endRow; i++)
        {
            for(var j = startCol; j <= endCol; j++)
            {
                var tile = context.grid[i][j];
                tile.setMineDetectorEffect(true);
                context.tilesDetectList.push(tile);
            } 
        }    
    }
    
    uncoverLogic(tile)
    {
        var adjCount = context.adjacentMines(tile.row, tile.col);
        tile.open(adjCount);

        var boolMap = [];
        for(var i = 0; i < gRow; i++)
        {
            boolMap[i] = [];
            for(var j = 0; j < gCol; j++)
            {
                boolMap[i][j] = false;
            }
        }
        context.uncoverGrid(tile.row, tile.col, boolMap);
        if(context.isFinished())
        {
            context.onGameWon();
        }
    }

    setFlagMode(flag)
    {
        context.flagMode = flag;
    }

    setMineDetecterMode(flag)
    {
        context.mineDetecterMode = flag;
    }

    setEditMode(flag)
    {
        context.editMode = flag;
    }

    onPlaceFlag(tile)
    {
        if(context.editMode)
        {
            if(tile.isMine)
            {
                tile.removeMineEditMode();
            }
            return;
        }

        if(context.canPlaceFlag())
        {
            if(tile.isFlagged)
            {
                context.flagsPlaced--;
                tile.unFlag();
            }
            else
            {
                context.flagsPlaced++;
                tile.setFlag();
            }
        }
        else
        {
            if(tile.isFlagged)
            {
                context.flagsPlaced--;
                tile.unFlag();
            }
        }

        context.game.updateFlagCount(context.game.flags - context.flagsPlaced);
    }

    onGameWon()
    {
        context.uncoverMines();
        context.setTilesInteraction(false);
        context.game.showResultScreen(true);
    }

    onGameLose()
    {
        context.uncoverMines();
        context.setTilesInteraction(false);
        context.game.showResultScreen(false);
    }

    isFinished()
    {
        for(var i = 0; i < gRow; i++)
        {
            for(var j = 0; j < gCol; j++)
            {
                var tile = context.grid[i][j];
                if(tile.isClickable() && !tile.isMine)
                    return false;
            }
        }
		return true;
	}

    setTilesInteraction(flag)
    {
        for(var i = 0; i < gRow; i++)
        {
            for(var j = 0; j < gCol; j++)
            {
                context.grid[i][j].setButtonInteraction(flag);
            }
        }
    }

    uncoverMines()
    {
        for(var i = 0; i < gRow; i++)
        {
            for(var j = 0; j < gCol; j++)
            {
                var tile = context.grid[i][j];
                if(tile.isMine)
                {
                    tile.revealMine();
                }
            }
        }
    }

    mineAt(x, y)
	{
        if (x >= 0 && x < gRow && y >= 0 && y < gCol)
            return context.grid[x][y].isMine;
        else
            return false;
    }

    adjacentMines(x, y)
    {
		var count = 0;

        if (context.mineAt(x,   y+1))
            ++count; 
        if (context.mineAt(x+1, y+1))
            ++count; 
        if (context.mineAt(x+1, y  ))
            ++count; 
        if (context.mineAt(x+1, y-1))
            ++count; 
        if (context.mineAt(x,   y-1))
            ++count; 
        if (context.mineAt(x-1, y-1))
            ++count; 
        if (context.mineAt(x-1, y  ))
            ++count; 
        if (context.mineAt(x-1, y+1))
            ++count; 

		return count;
    }
    
    uncoverGrid(x, y, visited)
    {
        if (x >= 0 && x < gRow && y >= 0 && y < gCol)
        {
			if (visited[x][y])
				return;

            context.grid[x][y].open(context.adjacentMines(x, y));

			if (context.adjacentMines(x, y) > 0)
				return;

			visited[x][y] = true;

			context.uncoverGrid(x-1, y, visited);
			context.uncoverGrid(x+1, y, visited);
			context.uncoverGrid(x, y-1, visited);
			context.uncoverGrid(x, y+1, visited);
		}
    }
    
    canPlaceFlag()
    {
       return context.flagsPlaced < this.game.flags;
    }
    
    enableEditMode()
    {
        for(var i = 0; i < gRow; i++)
        {
            for(var j = 0; j < gCol; j++)
            {
                context.grid[i][j].editMode();
            }
        }
        context.setEditMode(true);
    }

    disableEditMode()
    {
        for(var i = 0; i < gRow; i++)
        {
            for(var j = 0; j < gCol; j++)
            {
                context.grid[i][j].removeEditMode();
            }
        }
        context.firstMove = true;
        context.setEditMode(false);
    }

    saveLevel()
    {
        var gridToSave = [];
        for(var i = 0; i < gRow; i++)
        {
            gridToSave[i] = [];
            for(var j = 0; j < gCol; j++)
            {
                gridToSave[i][j] = context.grid[i][j].isMine ? 1:0;
            }
        }

        var lvlName = document.getElementById("level_name").value;
        if(!lvlName)
        {
            alert("please enter a level name");
            return;
        }
        if(context.levelNameAlreadyPresent(lvlName))
        {
            alert("a level with same name already exists");
            return;
        }

        var level = new LevelData(lvlName, gRow, gCol, context.mines, context.game.flags, gridToSave);
        context.game.savedLevels.push(level);
        context.game.saveLevel(level);
    }

    levelNameAlreadyPresent(lvlToSaveName)
    {
        for(var i =0; i < context.game.savedLevels.length; i++)
        {
            var lvlName = context.game.savedLevels[i].name;
            if(lvlName == lvlToSaveName)
                return true;
        }
        return false;
    }

    loadLevel(level)
    {
        context.resize(level.rows, level.cols, level.mines);
        context.placeLevelLoadMines(level.grid);
    }

    placeLevelLoadMines(gridData)
    {
        for(var i = 0; i < gRow; i++)
        {
            for(var j = 0; j < gCol; j++)
            {
                var tile = context.grid[i][j];
                tile.isMine = gridData[i][j] == 1;
            }
        }
		return true;
	}
}

module.exports = Grid;