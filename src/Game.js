const PIXI = require('pixi.js');
const Grid = require("./Grid");
const AssetLoader = require("./AssetLoader");
const ResultScreen = require("./ResultScreen");
const EntryPoint = require("./Init");

var context;
class Game
{
    constructor()
    {
        this.flags = 0;
        this.flagMode = false;
        this.editMode = false;
        this.mineDetectMode = false;
        this.savedLevels = [];
        context = this;
        this.initialize();
    }

    initialize()
    {
        this.application = new PIXI.Application(window.innerWidth,
            window.innerHeight,
            {
                backgroundColor: 0xc4dcc6,
            });
            this.application.view.addEventListener("contextmenu", (e) => {
			e.preventDefault();
		})
		document.body.append(this.application.view)
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        
        document.getElementById("input_editMines").addEventListener("click", function(){
            var editEnabled = document.getElementById("input_editMines").checked;
            if(editEnabled)
            {
                context.enableEditMode();
            }
            else
            {
                context.disableEditMode();
            }
        });
        document.getElementById("btn_update").addEventListener("click", function(){
            var rows = document.getElementById("input_rows").value;
            var cols = document.getElementById("input_cols").value;
            var mines = document.getElementById("input_mines").value;
            var flags = document.getElementById("input_flags").value;

            if(!rows || !cols || !mines || !flags)
            {
                alert("values can't be empty");
                return;
            }
            if(rows < 3)
            {
                alert("rows >= 3");
                return;
            }
            if(cols < 3)
            {
                alert("col >= 3");
                return;
            }
            if(mines < 0 || mines >= (rows * cols))
            {
                alert("mines can't be less than 0 or greater than total cells - 1");
                return;
            }

            if(flags < 0 )
            {
                alert("flags can't be negative");
                return;
            }

            context.onResize(rows, cols, mines, flags);
            context.turnOffDetectorMode();
        });
        document.getElementById("btn_save").addEventListener("click", function(){
            context.grid.saveLevel();
            context.turnOffDetectorMode();
        });
        document.getElementById("level_name").value = "";

        document.getElementById("btn_loadlevel").addEventListener("click", function(){
            var select = document.getElementById("level_list");
            if(select.options.length == 0)
            {
                alert("no level found");
            }
            else
            {
                var selectedLevel = context.savedLevels[select.selectedIndex];
                context.flags = selectedLevel.flags;
                context.updateFlagCount(context.flags);
                context.disableEditMode();
                context.grid.loadLevel(selectedLevel);
                context.setUIPosition();
                context.hideResultScreen();
                context.turnOffDetectorMode();
            }
        });
    }

    load(game, rows, cols, mines, flags)
    {
        this.flags = flags;
        this.assets = new AssetLoader();
        this.grid = new Grid(game, rows, cols, mines, flags);
        this.resultScreen = new ResultScreen(this);
        
        var style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: ['#ff000c'],
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        });

        var label = new PIXI.Text("FLAGS: " + this.flags, style);
		label.anchor.set(0.5, 0.5);
        this.application.stage.addChild(label); 
        this.flagLabel = label;
        
        var retryBtn = new PIXI.Sprite(game.assets.RetryBtnTex);
        retryBtn.anchor.set(0, 0);
        retryBtn.interactive = true;
        retryBtn.buttonMode = true;
        retryBtn.on('pointerdown', context.onRetry);
        this.application.stage.addChild(retryBtn);
        this.retryBtn = retryBtn;
        
        var flagReveal = new PIXI.Sprite(game.assets.RevealModeTex);
        flagReveal.anchor.set(0, 0);
        flagReveal.interactive = true;
        flagReveal.buttonMode = true;
        flagReveal.on('pointerdown', context.onFlagReveal);
        this.application.stage.addChild(flagReveal);
        this.flagReveal = flagReveal;
        
        var mineDector = new PIXI.Sprite(game.assets.MineDetectorTex);
        mineDector.anchor.set(0, 0);
        mineDector.interactive = true;
        mineDector.buttonMode = true;
        mineDector.on('pointerdown', context.onMineDector);
        this.application.stage.addChild(mineDector);
        this.mineDector = mineDector; 
        
        this.setUIPosition();
    }

    enableEditMode()
    {
        context.grid.enableEditMode();
    }

    disableEditMode()
    {
        document.getElementById("input_editMines").checked = false;
        context.grid.disableEditMode();
    }

    onResize(rows, cols, mines, flags)
    {
        context.grid.resize(rows, cols, mines);
        context.setUIPosition();
        context.flags = flags;
        context.updateFlagCount(context.flags);
        context.disableEditMode();
        context.hideResultScreen();
    }

    setUIPosition()
    {
        context.flagLabel.x = context.application.screen.width / 2;
        context.flagLabel.y = context.grid.container.y - 15;

        var containerRightCorner = context.grid.container.x + context.grid.container.width;
        context.flagReveal.x = containerRightCorner + 60;
        context.flagReveal.y = context.grid.container.y;

        context.mineDector.x = context.flagReveal.x;
        context.mineDector.y = context.flagReveal.y + 96;
        
        context.retryBtn.x = context.mineDector.x;
        context.retryBtn.y = context.mineDector.y + 96;
    }

    onRetry()
    {
        context.grid.reset();
        context.updateFlagCount(context.flags);
        context.disableEditMode();
        context.hideResultScreen();
    }

    onFlagReveal()
    {
        if(this.flagMode)
        {   
            context.flagReveal.texture = context.assets.RevealModeTex;
        }
        else
        {
            context.flagReveal.texture = context.assets.FlagModeTex;
        }
        this.flagMode = !this.flagMode;
        context.grid.setFlagMode(this.flagMode);
        context.turnOffDetectorMode();
    }

    onMineDector()
    {
        context.mineDetectMode = !context.mineDetectMode;       
        context.grid.setMineDetecterMode(context.mineDetectMode);
        context.setDetectorModeSpriteState();

        if(!context.mineDetectMode)
        {
            context.turnOffDetectorMode();
        }
    }

    setDetectorModeSpriteState()
    {
        if(context.mineDetectMode)
        {   
            context.mineDector.tint = "0xff0000";
        }
        else
        {
            context.mineDector.tint = "0xffffff";
        }
    }

    turnOffDetectorMode()
    {
        context.grid.clearDetectorTiles();
        context.mineDetectMode = false;
        context.grid.setMineDetecterMode(this.mineDetectMode);
        context.setDetectorModeSpriteState();
    }

    updateFlagCount(count)
    {
        this.flagLabel.text = "Flags: " + count;
    }

    saveLevel(level)
    {
        var select = document.getElementById('level_list');
        var option = document.createElement('option');
        option.value = option.text = level.name;
        select.add(option);
    }

    showResultScreen(won)
    {
        context.resultScreen.show(won);
    }

    hideResultScreen()
    {
        context.resultScreen.hide();
    }
}

module.exports = Game;