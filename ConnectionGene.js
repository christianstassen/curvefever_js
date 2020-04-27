class connectionGene {
  constructor(from, to, w, innoNumber) {
    this.fromNode = from;
    this.toNode   = to;
    this.weight   = w;
    this.enabled  = true;
    this.innovationNo = innoNumber;
  }

  mutateWeight() {
    var rand = random(1);
    if (rand < 0.1) { //10% of the time change the weight completely
      this.weight = random (-1,1);
    } else { // otherwise change a bit
      this.weight += (randomGaussian() / 50);
    }
    if (this.weight > 1){
      this.weight = 1
    }
    if (this.weight < -1) {
      this.weight = -1
    }
  }

  //returns a copy of this connectionGene
  clone(from, to) {
    var clone = new connectionGene(from, to, this.weight, this.innovationNo);
    clone.enabled = this.enabled;

    return clone;
  }

}
