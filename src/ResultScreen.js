const PIXI = require('pixi.js');

var context;
class ResultScreen
{
    constructor(game)
    {
        context = this;
        var style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 56,
            fontWeight: 'bold',
            fill: ['#ff0000'],
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        });

        var label = new PIXI.Text("", style);
		label.anchor.set(0.5, 0.5);
		label.x = (game.application.screen.width / 2);
        label.y = (game.application.screen.height / 2);
        label.scale.set(0, 0);
        game.application.stage.addChild(label);
        label.interactive = label.buttonMode = true;
        this.label = label;

        this.label.on('pointerdown', function(){
            game.onRetry();
        });

    }

    show(won)
    {
        var tweenTime = 0.25;
        var tweenStartScale = 0.95;
        if(won)
        {
            context.label.style.fill = "0xffd800";
            context.label.text = "YOU WON!!!! ^_^ \nTRY AGAIN? \nCLICK HERE";   
            tweenTime = 0.5;
            tweenStartScale = 0.75;
        }
        else
        {
            context.label.style.fill = "0x00ffe1";
            context.label.text = "YOU LOSE :( \nTRY AGAIN? \nCLICK HERE";
        }
        
        context.label.scale.set(tweenStartScale, tweenStartScale);
        TweenMax.to(context.label.scale, tweenTime, {x:1, y:1, repeat:-1, yoyo:true});
    }

    hide()
    {
        TweenMax.killTweensOf(context.label.scale);
        context.label.scale.set(0, 0);
    }

}

module.exports = ResultScreen;