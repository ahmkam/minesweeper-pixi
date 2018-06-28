const PIXI = require('pixi.js');

class AssetLoader
{
    constructor()
    {
        this.OpenedTileTex = PIXI.Texture.fromImage('assets/opened-tile.png');
        this.ClosedTileTex = PIXI.Texture.fromImage('assets/closed-tile.png');
        this.FlagTileTex = PIXI.Texture.fromImage('assets/flag-tile.png');
        this.BombTileTex = PIXI.Texture.fromImage('assets/bomb-tile.png');
        this.RetryBtnTex = PIXI.Texture.fromImage('assets/retry-button.png');
        this.FlagModeTex = PIXI.Texture.fromImage('assets/flag-mode.png');
        this.RevealModeTex = PIXI.Texture.fromImage('assets/reveal-mode.png');
        this.MineDetectorTex = PIXI.Texture.fromImage('assets/mine-detector.png');
    }
}

module.exports = AssetLoader;