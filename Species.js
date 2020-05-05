class Species {
  constructor(p) { // p for player
    this.id      = speciesID; speciesID++;
    this.players = []; // players that belong to this species
    this.bestFitness = 0; // best fitness of this species
    this.champ; // the best player of this species
    this.averageFitness = 0; // average fitness of this species
    this.staleness = 0; //how many generations the species has gone without an improvement
    this.rep;
    //coefficients for testing compatibility
    this.excessCoeff = 1;
    this.weightDiffCoeff = 0.5;
    this.compatibilityThreshold = 3;
    if (p) {
      this.players.push(p);
      //since it is the only one in the species it is by default the best
      this.bestFitness = p.fitness;
      this.rep = p.brain.clone();
    }
  }

  //add a player to the species
  addToSpecies(p) {
    this.players.push(p);
  }

  //returns whether the parameter genome is in this species
  sameSpecies(g) {
    var compatibility;
    var excessAndDisjoint = this.getExcessDisjoint(g, this.rep); //get the number of excess and disjoint connectgenes between this player and the current species this.rep
    var averageWeightDiff = this.averageWeightDiff(g, this.rep); //get the average weight difference between matching connectgenes


    var largeGenomeNormaliser = g.connectgenes.length - 20;
    if (largeGenomeNormaliser < 1) {
      largeGenomeNormaliser = 1;
    }

    compatibility = (this.excessCoeff * excessAndDisjoint / largeGenomeNormaliser) + (this.weightDiffCoeff * averageWeightDiff); //compatibility formula
    return (this.compatibilityThreshold > compatibility);
  }

  //returns the number of excess and disjoint connectgenes between the 2 input genomes
  //i.e. returns the number of connectgenes which dont match
  getExcessDisjoint(brain1, brain2) {
      var matching = 0.0;
      for (var i = 0; i < brain1.connectgenes.length; i++) {
        for (var j = 0; j < brain2.connectgenes.length; j++) {
          if (brain1.connectgenes[i].innovationNo == brain2.connectgenes[j].innovationNo) {
            matching++;
            break;
          }
        }
      }
      return (brain1.connectgenes.length + brain2.connectgenes.length - 2 * (matching)); //return no of excess and disjoint connectgenes
    }

    //returns the avereage weight difference between matching connectgenes in the input genomes
  averageWeightDiff(brain1, brain2) {
      if (brain1.connectgenes.length == 0 || brain2.connectgenes.length == 0) {
        return 0;
      }


      var matching = 0;
      var totalDiff = 0;
      for (var i = 0; i < brain1.connectgenes.length; i++) {
        for (var j = 0; j < brain2.connectgenes.length; j++) {
          if (brain1.connectgenes[i].innovationNo == brain2.connectgenes[j].innovationNo) {
            matching++;
            totalDiff += abs(brain1.connectgenes[i].weight - brain2.connectgenes[j].weight);
            break;
          }
        }
      }
      if (matching == 0) { //divide by 0 error
        return 100;
      }
      return totalDiff / matching;
    }

    //kills off bottom half of the species
  cull() {
      if (this.players.length > 2) {
        for (var i = this.players.length / 2; i < this.players.length; i++) {
          // this.players.remove(i);
          this.players.splice(i, 1);
          i--;
        }
      }
    }

    //sorts the species by fitness
  sortSpecies() {

    var temp = []; // new ArrayList < Player > ();

    //selection short
    for (var i = 0; i < this.players.length; i++) {
      var max = 0;
      var maxIndex = 0;
      for (var j = 0; j < this.players.length; j++) {
        if (this.players[j].fitness > max) {
          max = this.players[j].fitness;
          maxIndex = j;
        }
      }
      temp.push(this.players[maxIndex]);

      this.players.splice(maxIndex, 1);
      // this.players.remove(maxIndex);
      i--;
    }

    // this.players = (ArrayList) temp.clone();
    arrayCopy(temp, this.players);
    if (this.players.length == 0) {
      this.staleness = 200;
      return;
    }
    //if new best player
    if (this.players[0].fitness > this.bestFitness) {
      this.staleness = 0;
      this.bestFitness = this.players[0].fitness;
      this.rep = this.players[0].brain.clone();
    } else { //if no new best player
      this.staleness++;
    }
  }

    //gets baby from the this.players in this species
    giveMeBaby(innovationHistory) {
      var baby;
      if (random(1) < 0.25) { //25% of the time there is no crossover and the child is simply a clone of a random(ish) player

        baby = this.selectPlayer().clone();

      } else { //75% of the time do crossover
        //get 2 random(ish) parents
        var parent1 = this.selectPlayer();

        var parent2 = this.selectPlayer();

        //the crossover function expects the highest fitness parent to be the object and the lowest as the argument
        if (parent1.fitness < parent2.fitness) {

          baby = parent2.crossover(parent1);
        } else {

          baby = parent1.crossover(parent2);
        }

      }
      baby.brain.mutate(innovationHistory); //mutate that baby brain

      return baby;
    }

    //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //selects a player based on it fitness
    selectPlayer() {
        var fitnessSum = 0;
        for (var i = 0; i < this.players.length; i++) {
          fitnessSum += this.players[i].fitness;
        }
        var rand = random(fitnessSum);
        var runningSum = 0;

        for (var i = 0; i < this.players.length; i++) {
          runningSum += this.players[i].fitness;
          if (runningSum > rand) {
            return this.players[i];
          }
        }
        //unreachable code to make the parser happy
        return this.players[0];
      }

      //simple stuff
      setAverage() {
          var sum = 0;
          for (var i = 0; i < this.players.length; i++) {
            sum += this.players[i].fitness;
          }
          this.averageFitness = sum / this.players.length;
        }

}
