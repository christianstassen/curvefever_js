class player {
  constructor() {
    this.id = playerID;
    playerID++;

    this.x = 50+random(myGameArea.canvas.width-100)
    this.y = 50+random(myGameArea.canvas.height-100)
    this.height = 5
    this.width = 5
    this.dir = 270
    this.controls = {'left':'ArrowLeft', 'right':'ArrowRight'}
    this.dirspeed = 2
    this.speed = 1.
    this.track = [{x:this.x, y:this.y, width:this.width, height:this.height}]
    this.track_resolution = 3
    this.track_count = 1
    this.nocollen = 10
    this.l_gap = false
    this.gap_counter = 0
    this.gap_length = 18
    this.color = "red"
    this.alive = true
  }


  update() {
        this.newDir()
        this.newPos()
        this.collision()
        this.addTrack()
        this.check_alive()
    }

  newDir() {
      const keys = Object.keys(keysPressed)
      for ( var key of keys ) {
        if (key == this.controls.left) {this.dir += this.dirspeed;}
        if (key == this.controls.right) {this.dir += -this.dirspeed; }
      } ;
      if (this.dir > 360 || this.dir < 0) {
        this.dir = this.dir%360
      }
    }

  newPos() {
      this.x += this.speed * Math.sin(deg2rad(convert_angle(this.dir-90)));
      this.y += this.speed * Math.cos(deg2rad(convert_angle(this.dir-90)));
    }

  addTrack() {
      if (!this.l_gap && this.track.length % Math.ceil(300/this.track_resolution) == 0) {this.l_gap = true; };
      if (this.l_gap && this.gap_counter < this.gap_length) {
        this.gap_counter+=this.track_resolution;

      } else {
        this.l_gap=false
        this.gap_counter = 0

      }

      if (!(this.l_gap) && this.track_count%this.track_resolution==0) {
        this.track.push({x:this.x, y:this.y, width:this.width, height:this.height});
        this.track_count=1;

      } else {
        this.track_count++;

      }
    }

    drawPlayer(ctx) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

  drawTrack(ctx) {
      ctx.fillStyle = this.color
      for (let step = 0; step < this.track.length; step++){
        ctx.fillRect(this.track[step].x, this.track[step].y, this.track[step].width, this.track[step].height);
      }
    }

  collision() {

      // You only have to check this area for a collision
      var horizon      = {x:this.x-this.width*10/2, y:this.y-this.height*10/2, width:this.width*10, height:this.height*10}
      // ctx = myGameArea.context;
      // ctx.beginPath();
      // ctx.lineWidth = "6";
      // ctx.strokeStyle = "red";
      // ctx.rect(horizon.x, horizon.y, horizon.width, horizon.height);
      // ctx.stroke();

      // Find enemies within the horizon
      var enemies_near = rect_collision_with_list_return_list(horizon, getEnemiesOfComp(this.id), 1);

      var rect = {x:this.x, y:this.y, width:this.width, height:this.height}
      var collisions = rect_collision_with_list_return_list(rect, enemies_near); // Check for any collisions

      var nocol      = this.track.slice(this.track.length-10,this.track.length) // Define a no collision zone with your own track

      // Check if there are collisions outside the no collision zone
      for (var col of collisions) {
        if ( !rect_collision_with_list(col, nocol) ) {
          this.alive = false
        }
      }
    }

  check_alive() {
      if (!(this.alive)) {
        this.speed = 0
      }
    }
}

function rect_collision_with_list(rect, rects, resolution) {
  if (!resolution) {resolution=1}
  for (let step = 0; step < rects.length; step+=resolution){
    if (rect.x < rects[step].x + rects[step].width &&
       rect.x + rect.width > rects[step].x &&
       rect.y < rects[step].y + rects[step].height &&
       rect.y + rect.height > rects[step].y){
         return true
       }
  }
  return false
}
