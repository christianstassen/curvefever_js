function coordinates(x,y) {
  this.x = x;
  this.y = y;
}

class player_ai extends player {

  constructor() {
  super(); // call the super class constructor and pass in the parameters

    // Information about what the player can see
    this.specAngleRange = 120;
    this.specAngleRes   = 7;
    this.specLen        = 200;
    this.specRes        = 30;
    this.specWidth      = 3;
    this.specHeight     = 3;

    this.detect         = [];
    this.nvis           = Math.ceil(this.specAngleRange/this.specAngleRes);

    this.controls = {left: false, right:false}

    // Add some stuff for the neat ai
    this.fitness  = 0;
    this.decision = []; // output of the nuearl network
    this.unadjustedFitness = 0;
    this.lifespan = 0;
    this.score    = 0;
    this.gen      = 0;

    this.genomeInputs  = this.nvis;
    this.genomeOutputs = 1;
    this.brain         = new Genome(this.genomeInputs, this.genomeOutputs)
  }

  update() {
        if (this.alive) { // Those things only need updateding if the player is alive
          this.newDir();
          this.newPos();
          this.collision();
          this.addTrack();
          this.vision();
          this.think();
          this.check_alive();
        }

    }

    newDir() {
      if (this.controls.left) {this.dir += this.dirspeed;}
      if (this.controls.right) {this.dir += -this.dirspeed;}
    }

    bringBackFromDead() {
      this.alive = true;
    }


    vision() {
      this.detect      = [] // clear previous detection
      var dir          = this.dir-90;
      var player_coord = new coordinates(this.x, this.y);


      // //dir-specAngle/2
      var x0 = this.x + this.specLen*Math.sin(deg2rad(dir-this.specAngleRange/2));
      var y0 = this.y + this.specLen*Math.cos(deg2rad(dir-this.specAngleRange/2));
      //dir
      var x1 = this.x + this.specLen*Math.sin(deg2rad(dir));
      var y1 = this.y + this.specLen*Math.cos(deg2rad(dir));
      //dir+specAngle/2
      var x2 = this.x + this.specLen*Math.sin(deg2rad(dir+this.specAngleRange/2));
      var y2 = this.y + this.specLen*Math.cos(deg2rad(dir+this.specAngleRange/2));

      var xMin = Math.min(this.x,x0,x1,x2);
      var xMax = Math.max(this.x,x0,x1,x2);
      var yMin = Math.min(this.y,y0,y1,y2);
      var yMax = Math.max(this.y,y0,y1,y2);

      var horizon = {x:xMin, y:yMin, width:Math.abs(xMax-xMin), height:Math.abs(yMax-yMin)}
      // ctx = myGameArea.context;
      // ctx.beginPath();
      // ctx.lineWidth = "6";
      // ctx.strokeStyle = "red";
      // ctx.rect(horizon.x, horizon.y, horizon.width, horizon.height);
      // ctx.stroke();
      var enemies_near = rect_collision_with_list_return_list(horizon, getEnemiesOfComp(this.id));

      var specAngle;
      var endPoint;
      var sight;
      var rect;
      for (let ispecAngle=0; ispecAngle<this.nvis; ispecAngle++) {
        specAngle = dir - this.specAngleRange/2 + this.specAngleRes*ispecAngle;
        this.detect.push(this.specLen);
        endPoint = new coordinates(this.x + this.specLen*Math.sin(deg2rad(specAngle)), this.y + this.specLen*Math.cos(deg2rad(specAngle)));
        sight = get_line(player_coord, endPoint, this.specRes);
        for (let isight=0; isight<sight.length; isight++) {
          ctx = myGameArea.context;
          ctx.fillStyle = 'white';
          ctx.fillRect(sight[isight].x, sight[isight].y, this.specWidth, this.specHeight);
        }


        for (let isight=0; isight<sight.length; isight++){

          rect = {x:sight[isight].x, y:sight[isight].y, width:this.specWidth, height:this.specHeight};
          if (rect_collision_with_list(rect, enemies_near) && !rect_collision_with_list(rect, this.track.slice(this.track.length-5,this.track.length))) {
            ctx.fillStyle = 'red'
            ctx.fillRect(rect.x,rect.y,this.specWidth,this.specHeight)
            this.detect[ispecAngle]= dist_2d({x:rect.x, y:rect.y},player_coord);
            break;
          }
        }
      }
    }


    think() {
      this.decision = this.brain.feedForward(this.detect);
      // console.log(this.decision)

      // reset controls
      this.controls.left  = false
      this.controls.right = false
      if (this.decision > 0.6) {
        this.controls.left=true
      }
      if (this.decision < -0.6) {
        this.controls.right=true
      }

    }

    //returns a clone of this player with the same brain
  clone() {
    var clone = new player_ai();
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;
    print("cloning done");
    return clone;
  }

  calculateFitness() {
    this.fitness = this.track.length
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  crossover(parent2) {

    var child = new player_ai();
    child.brain = this.brain.crossover(parent2.brain);
    child.brain.generateNetwork();
    return child;
  }


}

function dist_2d(coord0, coord1) {
  return Math.sqrt(Math.pow(coord0.x-coord1.x,2) + Math.pow(coord0.y-coord1.y,2))
}


function rect_collision_with_list_return_list(rect, rects) {
  var list = []
  for (let step = 0; step < rects.length; step+=1){
    if (rect.x < rects[step].x + rects[step].width &&
       rect.x + rect.width > rects[step].x &&
       rect.y < rects[step].y + rects[step].height &&
       rect.y + rect.height > rects[step].y){
         list.push(rects[step])
       }
  }
  return list
}

function get_line(coord0, coord1, nsteps) {
  var line = []
  var dx = coord1.x - coord0.x;
  var dy = coord1.y - coord0.y;

  ddx = dx/nsteps
  ddy = dy/nsteps

  for (let istep=0; istep<nsteps; istep++) {
    coord = new coordinates( coord0.x+istep*ddx, coord0.y+istep*ddy )
    line.push(coord)
  }

  return line

}
