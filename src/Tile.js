const AssetLoader = require("./AssetLoader");
const PIXI = require('pixi.js');

var context;
var textColors = [
    "0x0077FF",
    "0x4CEC00",
    "0xFF0000",
    "0x9400EA",
    "0xE81797",
    "0x0094FF",
    "0x303030",
    "0xC0C0C0"
]
class Tile
{
    constructor(game, row, col, size, onDownCallback, onRightClickCallback, onOverCallback, onUpCallback)
    {
        context = this;
        var thisTile = this;
        this.game = game;
        this.row = row;
        this.col = col;
        this.size = size;
        this.isMine = false;
        this.isFlagged = false;
        this.clickable = true;

        this.sprite = new PIXI.Sprite(game.assets.ClosedTileTex);
        this.sprite.x = this.size * col;
        this.sprite.y = this.size * row;
        if(PIXI.utils.isMobile.any)
        {
            this.sprite.on('pointerdown', function(){
                onDownCallback(thisTile);
            });
            this.sprite.on('pointerup', function(){
                onUpCallback(thisTile);
            });
            // this.sprite.on('touchmove', function(){
            //     onOverCallback(thisTile);
            // });
        }
        else
        {
            this.sprite.on('mousedown', function(){
                onDownCallback(thisTile);
            });
            this.sprite.on('mouseup', function(){
                onUpCallback(thisTile);
            });
            this.sprite.on('mouseover', function(){
                onOverCallback(thisTile);
            });
            this.sprite.on('rightclick', function(){
                onRightClickCallback(thisTile);
            });
        }
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.setClickable(true);

        var style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: this.size * 0.7,
            stroke: '#000000',
            strokeThickness: 6,
        });

        var label = new PIXI.Text("", style);
		label.anchor.set(0.5, 0.5);
		label.x = (this.size / 2);
		label.y = (this.size / 2);
        this.sprite.addChild(label);

        this.label = label;
        this.name = "[" + this.row + "," + this.col + "]";

    }

    setClickable(flag)
    {
        this.clickable = flag;
    }

    setButtonInteraction(flag)
    {
        this.sprite.interactive = flag;
        this.sprite.buttonMode = flag;
    }

    setLabel(count)
    {
        if(count == 0)
        {
            this.label.text = "";
        }
        else
        {
            this.label.text = count;
        }

        this.label.style.fill = textColors[count];
    }

    setMine()
    {
        this.isMine = true;
    }

    setMineEditMode()
    {
        this.setMine();
        this.revealMine();
    }

    removeMineEditMode()
    {
        this.isMine = false;
        this.label.text = "";
        this.sprite.texture = game.assets.OpenedTileTex;
    }

    setFlag()
    {
        this.sprite.texture = game.assets.FlagTileTex;
        this.isFlagged = true;
    }

    unFlag()
    {
        this.sprite.texture = game.assets.ClosedTileTex;
        this.isFlagged = false;
    }

    revealMine()
    {
        this.sprite.texture = game.assets.BombTileTex;
    }

    open(count)
    {
        if(this.isFlagged)
            return;
            
        this.sprite.texture = game.assets.OpenedTileTex;
        this.setLabel(count);
        this.setClickable(false); 
    }

    isClickable()
    {
        return this.clickable;
    }

    editMode()
    {
        if(this.isMine)
        {
            this.revealMine();
        }
        else
        {
            this.sprite.texture = game.assets.OpenedTileTex;
        }

        this.label.text = "";
        this.setClickable(true);
    }

    removeEditMode()
    {
        this.isFlagged = false;
        this.label.text = "";
        this.sprite.texture = game.assets.ClosedTileTex;
        this.setClickable(true);
    }

    reset()
    {
        this.isFlagged = false;
        this.isMine = false;
        this.label.text = "";
        this.sprite.texture = game.assets.ClosedTileTex;
        this.setClickable(true);
    }

    setMineDetectorEffect(flag)
    {
        if(flag)
        {
            if(this.sprite.interactive)
            {
                if(this.isMine)
                {
                    TweenMax.to(this.sprite, 0.1, {tint:0xff0000 , repeat:-1, yoyo:true}); 
                }
            }
        }
        else
        {
            TweenMax.killTweensOf(this.sprite);
            this.sprite.tint = 0xffffff;
        }
    }

}

module.exports = Tile;