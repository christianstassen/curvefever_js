function boundary(nx, ny, width, height, color) {

    this.nx     = nx;
    this.ny     = ny;
    this.width  = width;
    this.height = height;
    this.bounds = []


    this.bounds.push({x:0, y:0, width:this.width, height:this.ny});            // left border
    this.bounds.push({x:0, y:0, width:this.nx, height:this.height});          // top border
    this.bounds.push({x:nx-this.width, y:0, width:this.width, height:this.ny});   // right border
    this.bounds.push({x:0, y:ny-this.height, width:this.nx, height:this.height});// bottom border

    this.draw = function(){
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        for (let step=0; step<this.bounds.length; step++){
          ctx.fillRect(this.bounds[step].x, this.bounds[step].y, this.bounds[step].width, this.bounds[step].height);
        }
    }
}
