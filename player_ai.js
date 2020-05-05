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
    this.specLen        = 300;
    this.specWidth      = 4;
    this.specHeight     = 4;
    this.specRes        = Math.ceil( this.specLen / ( Math.sqrt( Math.pow(this.specWidth,2) + Math.pow(this.specHeight,2) ) ) ); // This ensures no gaps in the sight

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
          if (!this.alive) {
            this.get_points()
          }
        }
    }

    newDir() {
      if (this.controls.left) {this.dir += this.dirspeed;}
      if (this.controls.right) {this.dir += -this.dirspeed;}
      if (this.dir > 360 || this.dir < 0) {
        this.dir = this.dir%360
      }
    }

    bringBackFromDead() {
      this.alive = true;
    }


    vision() {
      this.detect      = [] // clear previous detection
      var dir          = this.dir-90;


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

      var enemies_near = rect_collision_with_list_return_list(horizon, getEnemiesOfComp(this.id), 1);

      var specAngle;
      var rect;
      var ddx;
      var ddy;

      // Fill detection with maximum value
      for (let ispecAngle=0; ispecAngle<this.nvis; ispecAngle++) {
        this.detect.push(this.specLen);
      }

      // Then check if there are enemies closer
      if (!enemies_near.length==0) { // But only if there are any enemies near
        for (let ispecAngle=0; ispecAngle<this.nvis; ispecAngle++) {
          specAngle = dir - this.specAngleRange/2 + this.specAngleRes*ispecAngle;

          ddx = this.specLen*Math.sin(deg2rad(specAngle))/this.specRes;
          ddy = this.specLen*Math.cos(deg2rad(specAngle))/this.specRes;

          for (let istep=0; istep<this.specRes; istep++) {
            rect = {x:this.x+istep*ddx, y:this.y+istep*ddy, width:this.specWidth, height:this.specHeight};
            // ctx = myGameArea.context;
            // ctx.fillStyle = 'white';
            // ctx.fillRect(rect.x, rect.y, this.specWidth, this.specHeight);

            // checks every rectangle for collision
            if (rect_collision_with_list(rect, enemies_near,1) && !rect_collision_with_list(rect, this.track.slice(this.track.length-5,this.track.length))) {
              this.detect[ispecAngle]= dist_2d({x:rect.x, y:rect.y},{x:this.x, y:this.y});
              break;
            }
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
    // The longer you live the better
    this.fitness = this.track.length / 100;
    // console.log('track length points ', this.track.length / 100)

    // Every enemy killed before you
    this.fitness += this.points


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


function rect_collision_with_list_return_list(rect, rects, resolution) {
  if (!resolution) {resolution=1}
  var list = []
  for (let step = 0; step < rects.length; step+=resolution){
    if (rect.x < rects[step].x + rects[step].width &&
       rect.x + rect.width > rects[step].x &&
       rect.y < rects[step].y + rects[step].height &&
       rect.y + rect.height > rects[step].y){
         list.push(rects[step])
       }
  }
  return list
}
