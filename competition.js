class Competition {
  constructor() {
    this.players = [];
    this.enemies = [];
  }

  addEnemy(enemy) {
    this.enemies.push(enemy)
  }

  addEnemyTracksOfComp() {
    for (var jplayer of this.players) { //Go through all players of this competition}
      for (let i=0; i<jplayer.track.length; i++) { // Add track to enemies for this competition
          this.addEnemy(jplayer.track[i])
        }
      }
    }

    addBordersToComp() {
      for (var b of myGameArea.border.bounds) {
        this.addEnemy(b)
      };
    }
}


function assign_competition(ngroups) {

  var randomColor=[];

  // Create an empty competition list first
  for (let i=0; i<ngroups; i++){
    competitions.push(new Competition);
    randomColor.push(Math.floor(Math.random()*16777215).toString(16));
  }

  // Sort the players into competition groups
  for (player of population.players){
    var randGroup = Math.ceil(random(ngroups));

    //Make sure not one group is too big
    while (competitions[randGroup-1].players.length > Math.ceil(population.players.length / ngroups)) {
      randGroup++;
      if (randGroup>=ngroups+1) {
        randGroup=1
      }
    }
    competitions[randGroup-1].players.push(player);
    player.color='#'.concat(randomColor[randGroup-1]);
  }
};

function getEnemiesOfComp(playerID){
  for (var c of competitions) { // Go through competitions
    for (var p of c.players) { // Go through the players of this competition
      if (p.id == playerID) {
        return c.enemies;
      }
    }
  }
}

function resetCompetitions(ngroups) {
  competitions = [];
  assign_competition(ngroups)
}
