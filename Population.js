class Population {
  constructor(size) {
    this.players = []; //new ArrayList<Player>();
    this.bestPlayer; //the best ever player
    this.bestScore = 0; //the score of the best ever player
    this.globalBestScore = 0;
    this.gen = 1;
    this.innovationHistory = []; // new ArrayList<connectionHistory>();
    this.genPlayers = []; //new ArrayList<Player>();
    this.species = []; //new ArrayList<Species>();

    this.massExtinctionEvent = false;
    this.newStage = false;

    this.gensSinceNewWorld = 0;

    var controls;

    for (let i=0; i<size; i++) {
      this.players.push(new player_ai() );
      this.players[i].brain.mutate(this.innovationHistory);
      this.players[i].brain.generateNetwork();
    }
  }

  //------------------------------------------------------------------------------------------------------------------------------------------
//seperate this.players into this.species based on how similar they are to the leaders of each this.species in the previousthis.gen
speciate() {
    for (var s of this.species) { //empty this.species
      s.players = [];
    }
    for (var i = 0; i < this.players.length; i++) { //for each player
      var speciesFound = false;
      for (var s of this.species) { //for each this.species
        if (s.sameSpecies(this.players[i].brain)) { //if the player is similar enough to be considered in the same this.species
          s.addToSpecies(this.players[i]); //add it to the this.species
          speciesFound = true;
          break;
        }
      }
      if (!speciesFound) { //if no this.species was similar enough then add a new this.species with this as its champion
        this.species.push(new Species(this.players[i]));
      }
    }
  }

  allDead() {
    for (var i of this.players) {
      if (i.alive) {
        return false
      }
    }
    return true
  }

  //returns the sum of each this.species average fitness
getAvgFitnessSum() {
  var averageSum = 0;
  for (var s of this.species) {
    averageSum += s.averageFitness;
  }
  return averageSum;
}

  naturalSelection() {
    this.speciate()
    this.calculateFitness()
    this.cullSpecies(); //kill off the bottom half of each this.species
    var averageSum = this.getAvgFitnessSum();

    var children = [];
    for (var j = 0; j < this.species.length; j++) { //for each this.species

      // children.push(this.species[j].champ.clone()); //add champion without any mutation
      var NoOfChildren = floor(this.species[j].averageFitness / averageSum * this.players.length) - 1; //the number of children this this.species is allowed, note -1 is because the champ is already added


      for (var i = 0; i < NoOfChildren; i++) { //get the calculated amount of children from this this.species
        children.push(this.species[j].giveMeBaby(this.innovationHistory));
      }
    }

    while (children.length < this.players.length) { //if not enough babies (due to flooring the number of children to get a whole var)
      children.push(this.species[0].giveMeBaby(this.innovationHistory)); //get babies from the best this.species
    }

    this.players = [];
    arrayCopy(children, this.players); //set the children as the current this.playersulation
    this.gen += 1;
    for (var i = 0; i < this.players.length; i++) { //generate networks for each of the children
      this.players[i].brain.generateNetwork();
    }

  }

  //calculates the fitness of all of the players
  calculateFitness() {
    for (var i = 1; i < this.players.length; i++) {
      this.players[i].calculateFitness();
    }
  }

  //kill the bottom half of each this.species
  cullSpecies() {
    for (var s of this.species) {
      s.cull(); //kill bottom half
      s.setAverage(); //reset averages because they will have changed
    }
  }

  resetPlayers() {
    for (var player of this.players) {
      player.bringBackFromDead();
    }
  }

  summary() {
    console.log('There are ', this.species.length, ' species')
    for (let i=0; i<this.species.length; i++) {
      console.log('Species', i, ' has ', this.species[i].players.length, ' players', 'avgFitness', this.getAvgFitnessSum())
    }
  }

  getBestPlayer() {
    var tmp = 0;
    for (var player of this.players) {
      if (player.calculateFitness() > tmp) {
        this.bestPlayer = player
      }
    }
  }

}
