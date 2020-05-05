
var population = {};
var speciesID = 1;
var competitions=[];
var keysPressed = {};
var nextConnectionNo = 1;
var playerID = 1;

var population_size = 1000;
var ngroups         = 125;

var draw_all          = false;
var draw_comp_of_best = true;

// this is needed for the p5 library to work
// it is always called at the beginning
function setup() {

  window.canvas = createCanvas(500, 500);

  // myGameArea.start();

}

function deg2rad(degrees){
  return degrees * (Math.PI/180);
}

function convert_angle(angle){
    return 1*angle % 360
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.context = this.canvas.getContext("2d");
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.border  = new boundary(this.canvas.width, this.canvas.height, 5, 5, "yellow")

        population  = new Population(population_size);
        assign_competition();
        for (var c=0; c<competitions.length; c++) {
          competitions[c].addBordersToComp()
        };
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
    },
    clear : function() {
        // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

}

document.addEventListener('keydown', (event) => {
 keysPressed[event.key] = true;
});
document.addEventListener('keyup', (event) => {
  delete keysPressed[event.key];
});

function updateGameArea() {
    myGameArea.clear();
    myGameArea.border.draw();

    // console.log(enemies)
    const vplayerList = Object.values(population.players)
    for (vplayer of vplayerList) {
      vplayer.update();
    }
    for (competition of competitions){
      competition.update();
    }

    if (population.allDead()) {
      population.naturalSelection();
      resetCompetitions();
      population.summary();

    }

    population.getBestPlayer();
    population.bestPlayer.brain.drawGenome(10,10,480,480);
    

    if (draw_all) {
      draw_all_players();
    }
    if (draw_comp_of_best) {
      draw_comp_of_bestplayer();
    }
}


function draw_all_players() {
  for (var player of population.players) {
    player.drawPlayer(myGameArea.context);
    player.drawTrack(myGameArea.context);
  }
}

function draw_comp_of_bestplayer() {
  for (var c=0; c<competitions.length; c++) { // Go through all competitions
    for (var p of competitions[c].players){ // Go through all players of this competition
      if (population.bestPlayer.id == p.id) { //Check if best player is in this competition
        for (var player of competitions[c].players) { // Then go through all players of this competition and draw them
          player.drawPlayer(myGameArea.context);
          player.drawTrack(myGameArea.context);
        }
      }
    }
  }
}
