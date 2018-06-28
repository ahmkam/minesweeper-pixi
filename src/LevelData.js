class LevelData
{
    constructor(name, rows, cols, mines, flags, grid)
    {
        this.name = name;
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;
        this.flags = flags;
        this.grid = grid;
    }

    print()
    {
        console.log("name : " + this.name);
        console.log("rows : " + this.rows);
        console.log("cols : " + this.cols);
        console.log("mines : " + this.mines);
        console.log("flags : " + this.flags);

        var lvl = "";
        for(var i = 0; i < this.rows; i++)
        {
            for(var j = 0; j < this.cols; j++)
            {
                 lvl += this.grid[i][j];
            }
            lvl += '\n';    
        }
    }
}

module.exports = LevelData;