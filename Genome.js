class Genome {
  constructor(inputs, outputs, crossover) {
    this.connectgenes = []; // a list of connections between nodes
    this.nodes = [];
    this.inputs  = inputs;
    this.outputs = outputs;
    this.layers = 2; //input and output layer
    this.nextNode = 0;
    this.network = []; // a list of nodes in the order that they need to be considered in the NN

    // if crossover
    if (crossover) {
      return;
    }

    // set up input nodes
    for (let i=0; i<inputs; i++) {
      this.nodes.push(new Node(this.nextNode));
      this.nodes[this.nextNode].layer = 0;
      this.nextNode++;
    }

    // set up output nodes
    for (let i=0; i<outputs; i++) {
      this.nodes.push(new Node(this.nextNode));
      this.nodes[this.nextNode].layer = 1;
      this.nextNode++;
    }

    // Add one bias node which is always 1
    this.nodes.push(new Node(this.nextNode));
    this.nodes[this.nextNode].layer = 0;
    this.biasNode = this.nextNode;
    this.nextNode++;
  }

  connectNodes() {
    for (let i = 0; i < this.nodes.length; i++) { //clear the connections
      this.nodes[i].outputConnections = [];
    }

    for (let i=0; i< this.connectgenes.length; i++) {
      this.connectgenes[i].fromNode.outputConnections.push(this.connectgenes[i]); //add it to node
    }
  }

  //adds a connection between 2 this.nodes which aren't currently connected
  addConnection(innovationHistory) {
      //cannot add a connection to a fully connected network
      if (this.fullyConnected()) {
        console.log("connection failed");
        return;
      }


      //get random this.nodes
      var randomNode1 = floor(random(this.nodes.length));
      var randomNode2 = floor(random(this.nodes.length));
      while (this.randomConnectionNodesAreShit(randomNode1, randomNode2)) { //while the random this.nodes are no good
        //get new ones
        randomNode1 = floor(random(this.nodes.length));
        randomNode2 = floor(random(this.nodes.length));
      }
      var temp;
      if (this.nodes[randomNode1].layer > this.nodes[randomNode2].layer) { //if the first random node is after the second then switch
        temp = randomNode2;
        randomNode2 = randomNode1;
        randomNode1 = temp;
      }

      //get the innovation number of the connection
      //this will be a new number if no identical genome has mutated in the same way
      var connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.nodes[randomNode1], this.nodes[randomNode2]);
      //add the connection with a random array

      this.connectgenes.push(new connectionGene(this.nodes[randomNode1], this.nodes[randomNode2], random(-1, 1), connectionInnovationNumber)); //changed this so if error here
      this.connectNodes();
    }
    //-------------------------------------------------------------------------------------------------------------------------------------------
  randomConnectionNodesAreShit(r1, r2) {
    if (this.nodes[r1].layer == this.nodes[r2].layer) return true; // if the this.nodes are in the same layer
    if (this.nodes[r1].isConnectedTo(this.nodes[r2])) return true; //if the this.nodes are already connected

    return false;
  }

  //returns whether the network is fully connected or not
  fullyConnected() {

    var maxConnections = 0;
    var nodesInLayers = []; //array which stored the amount of this.nodes in each layer
    for (var i = 0; i < this.layers; i++) {
      nodesInLayers[i] = 0;
    }
    //populate array
    for (var i = 0; i < this.nodes.length; i++) {
      nodesInLayers[this.nodes[i].layer] += 1;
    }
    //for each layer the maximum amount of connections is the number in this layer * the number of this.nodes infront of it
    //so lets add the max for each layer together and then we will get the maximum amount of connections in the network
    for (var i = 0; i < this.layers - 1; i++) {
      var nodesInFront = 0;
      for (var j = i + 1; j < this.layers; j++) { //for each layer infront of this layer
        nodesInFront += nodesInLayers[j]; //add up this.nodes
      }

      maxConnections += nodesInLayers[i] * nodesInFront;
    }
    if (maxConnections <= this.connectgenes.length) { //if the number of connections is equal to the max number of connections possible then it is full
      return true;
    }

    return false;
  }

  //mutate the NN by adding a new node
  //it does this by picking a random connection and disabling it then 2 new connections are added
  //1 between the input node of the disabled connection and the new node
  //and the other between the new node and the output of the disabled connection
addNode(innovationHistory) {
  //pick a random connection to create a node between
  if (this.connectgenes.length == 0) {
    this.addConnection(innovationHistory);
    return;
  }
  var randomConnection = floor(random(this.connectgenes.length));

  while (this.connectgenes[randomConnection].fromNode == this.nodes[this.biasNode] && this.connectgenes.length != 1) { //dont disconnect bias
    randomConnection = floor(random(this.connectgenes.length));
  }

  this.connectgenes[randomConnection].enabled = false; //disable it

  var newNodeNo = this.nextNode;
  this.nodes.push(new Node(newNodeNo));
  this.nextNode++;
  //add a new connection to the new node with a weight of 1
  var connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.connectgenes[randomConnection].fromNode, this.getNode(newNodeNo));
  this.connectgenes.push(new connectionGene(this.connectgenes[randomConnection].fromNode, this.getNode(newNodeNo), 1, connectionInnovationNumber));


  connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.getNode(newNodeNo), this.connectgenes[randomConnection].toNode);
  //add a new connection from the new node with a weight the same as the disabled connection
  this.connectgenes.push(new connectionGene(this.getNode(newNodeNo), this.connectgenes[randomConnection].toNode, this.connectgenes[randomConnection].weight, connectionInnovationNumber));
  this.getNode(newNodeNo).layer = this.connectgenes[randomConnection].fromNode.layer + 1;


  connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.nodes[this.biasNode], this.getNode(newNodeNo));
  //connect the bias to the new node with a weight of 0
  this.connectgenes.push(new connectionGene(this.nodes[this.biasNode], this.getNode(newNodeNo), 0, connectionInnovationNumber));

  //if the layer of the new node is equal to the layer of the output node of the old connection then a new layer needs to be created
  //more accurately the layer numbers of all layers equal to or greater than this new node need to be incrimented
  if (this.getNode(newNodeNo).layer == this.connectgenes[randomConnection].toNode.layer) {
    for (var i = 0; i < this.nodes.length - 1; i++) { //dont include this newest node
      if (this.nodes[i].layer >= this.getNode(newNodeNo).layer) {
        this.nodes[i].layer++;
      }
    }
    this.layers++;
  }
  this.connectNodes();
}

  feedForward(inputValues) {
    // the output of the input nodes is the input itself
    for (let i=0; i<this.inputs; i++) {
      this.nodes[i].outputValue = inputValues[i];
    }
    this.nodes[this.biasNode].outputValue = 1; //output of bias node is always 1

    for (let i=0; i<this.network.length; i++) { // activate each node of the network
      this.network[i].activate();
    }

    var outs = [];
    // console.log(this.nodes.length, this.inputs)
    for (let i = 0; i < this.outputs; i++) {
      outs[i] = this.nodes[this.inputs + i].outputValue;
    }

    for (let i=0; i < this.nodes.length; i++) {
      this.nodes[i].inputSum = 0; // reset all nodes for the next cycle
    }

    return outs

  }

  generateNetwork() {
    this.connectNodes();
    this.network = [];

    for (let j=0; j< this.layers; j++) {
      for (let i=0; i<this.nodes.length; i++) {
        if (this.nodes[i].layer == j) {
          this.network.push(this.nodes[i])
        }
      }
    }
  }


  //mutates the genome
  mutate(innovationHistory) {
    // If there are no connection connectgenes add a connection
    if (this.connectgenes.length == 0) {
      this.addConnection(innovationHistory);
    }

    // 80% of the time mutate the weight of the connection
    var rand1 = random(1);
    if (rand1 < 0.8) {
      for (let i=0; i<this.connectgenes.length; i++)
      this.connectgenes[i].mutateWeight();
    }

    // 5% of the time add a connection
    var rand2 = random(1);
    if (rand2 < 0.05) {
      this.addConnection(innovationHistory);
    }

    //1% of the time add a node
    var rand3 = random(1);
    if (rand3 < 0.01) {
      this.addNode(innovationHistory);
    }
  }

  //returns the innovation number for the new mutation
  //if this mutation has never been seen before then it will be given a new unique innovation number
  //if this mutation matches a previous mutation then it will be given the same innovation number as the previous one
  getInnovationNumber(innovationHistory, from, to) {
      var isNew = true;
      var connectionInnovationNumber = nextConnectionNo;
      for (var i = 0; i < innovationHistory.length; i++) { //for each previous mutation
        if (innovationHistory[i].matches(this, from, to)) { //if match found
          isNew = false; //its not a new mutation
          connectionInnovationNumber = innovationHistory[i].innovationNumber; //set the innovation number as the innovation number of the match
          break;
        }
      }

      if (isNew) { //if the mutation is new then create an arrayList of varegers representing the current state of the genome
        var innoNumbers = [];
        for (var i = 0; i < this.connectgenes.length; i++) { //set the innovation numbers
          innoNumbers.push(this.connectgenes[i].innovationNo);
        }

        //then add this mutation to the innovationHistory
        innovationHistory.push(new connectionHistory(from.number, to.number, connectionInnovationNumber, innoNumbers));
        nextConnectionNo++;
      }
      return connectionInnovationNumber;
    }

    //called when this Genome is better that the other parent
    crossover(parent2) {
      var child = new Genome(this.inputs, this.outputs, true);
      child.connectgenes = [];
      child.nodes = [];
      child.layers = this.layers;
      child.nextNode = this.nextNode;
      child.biasNode = this.biasNode;
      var childGenes = []; // new ArrayList<connectionGene>();//list of connectgenes to be inherrited form the parents
      var isEnabled = []; // new ArrayList<Boolean>();
      //all inherited connectgenes
      for (var i = 0; i < this.connectgenes.length; i++) {
        var setEnabled = true; //is this node in the chlid going to be enabled

        var parent2gene = this.matchingGene(parent2, this.connectgenes[i].innovationNo);
        if (parent2gene != -1) { //if the connectgenes match
          if (!this.connectgenes[i].enabled || !parent2.connectgenes[parent2gene].enabled) { //if either of the matching connectgenes are disabled

            if (random(1) < 0.75) { //75% of the time disabel the childs gene
              setEnabled = false;
            }
          }
          var rand = random(1);
          if (rand < 0.5) {
            childGenes.push(this.connectgenes[i]);

            //get gene from this loser
          } else {
            //get gene from parent2
            childGenes.push(parent2.connectgenes[parent2gene]);
          }
        } else { //disjoint or excess gene
          childGenes.push(this.connectgenes[i]);
          setEnabled = this.connectgenes[i].enabled;
        }
        isEnabled.push(setEnabled);
      }


      //since all excess and disjovar connectgenes are inherrited from the more fit parent (this Genome) the childs structure is no different from this parent | with exception of dormant connections being enabled but this wont effect this.nodes
      //so all the this.nodes can be inherrited from this parent
      for (var i = 0; i < this.nodes.length; i++) {
        child.nodes.push(this.nodes[i].clone());
      }

      //clone all the connections so that they connect the childs new this.nodes

      for (var i = 0; i < childGenes.length; i++) {
        child.connectgenes.push(childGenes[i].clone(child.getNode(childGenes[i].fromNode.number), child.getNode(childGenes[i].toNode.number)));
        child.connectgenes[i].enabled = isEnabled[i];
      }

      child.connectNodes();
      return child;
    }

    //returns whether or not there is a gene matching the input innovation number  in the input genome
  matchingGene(parent2, innovationNumber) {
      for (var i = 0; i < parent2.connectgenes.length; i++) {
        if (parent2.connectgenes[i].innovationNo == innovationNumber) {
          return i;
        }
      }
      return -1; //no matching gene found
    }

    //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //returns the node with a matching number
  //sometimes the this.nodes will not be in order
  getNode(nodeNumber) {
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].number == nodeNumber) {
        return this.nodes[i];
      }
    }
    return null;
  }


  //returns a copy of this genome
  clone() {

      var clone = new Genome(this.inputs, this.outputs, true);

      for (var i = 0; i < this.nodes.length; i++) { //copy this.nodes
        clone.nodes.push(this.nodes[i].clone());
      }

      //copy all the connections so that they connect the clone new this.nodes

      for (var i = 0; i < this.connectgenes.length; i++) { //copy connectgenes
        clone.connectgenes.push(this.connectgenes[i].clone(clone.getNode(this.connectgenes[i].fromNode.number), clone.getNode(this.connectgenes[i].toNode.number)));
      }

      clone.layers = this.layers;
      clone.nextNode = this.nextNode;
      clone.biasNode = this.biasNode;
      clone.connectNodes();

      return clone;
    }



// I did not write this!
// Taken from code bullet git website!
  //draw the genome on the screen
  drawGenome(startX, startY, w, h) {
    // Clear canvas
    clear();

    //i know its ugly but it works (and is not that important) so I'm not going to mess with it
    var allNodes = []; //new ArrayList<ArrayList<Node>>();
    var nodePoses = []; // new ArrayList<PVector>();
    var nodeNumbers = []; // new ArrayList<Integer>();

    //get the positions on the screen that each node is supposed to be in


    //split the this.nodes varo layers
    for (var i = 0; i < this.layers; i++) {
      var temp = []; // new ArrayList<Node>();
      for (var j = 0; j < this.nodes.length; j++) { //for each node
        if (this.nodes[j].layer == i) { //check if it is in this layer
          temp.push(this.nodes[j]); //add it to this layer
        }
      }
      allNodes.push(temp); //add this layer to all this.nodes
    }

    //for each layer add the position of the node on the screen to the node posses arraylist
    for (var i = 0; i < this.layers; i++) {
      fill(255, 0, 0);
      var x = startX + float((i + 1.0) * w) / float(this.layers + 1.0);
      for (var j = 0; j < allNodes[i].length; j++) { //for the position in the layer
        var y = startY + float((j + 1.0) * h) / float(allNodes[i].length + 1.0);
        nodePoses.push(createVector(x, y));
        nodeNumbers.push(allNodes[i][j].number);
      }
    }

    //draw connections
    stroke(0);
    strokeWeight(2);
    for (var i = 0; i < this.connectgenes.length; i++) {
      if (this.connectgenes[i].enabled) {
        stroke(0);
      } else {
        stroke(100);
      }
      var from;
      var to;
      from = nodePoses[nodeNumbers.indexOf(this.connectgenes[i].fromNode.number)];
      to = nodePoses[nodeNumbers.indexOf(this.connectgenes[i].toNode.number)];

      if (this.connectgenes[i].weight > 0) {
        stroke(255, 0, 0);
      } else {
        stroke(0, 0, 255);
      }
      strokeWeight(map(abs(this.connectgenes[i].weight), 0, 1, 0, 3));
      line(from.x, from.y, to.x, to.y);
    }

    //draw this.nodes last so they appear ontop of the connection lines
    for (var i = 0; i < nodePoses.length; i++) {
      fill(255);
      stroke(0);
      strokeWeight(1);
      ellipse(nodePoses[i].x, nodePoses[i].y, 20, 20);
      textSize(10);
      fill(0);
      textAlign(CENTER, CENTER);
      text(nodeNumbers[i], nodePoses[i].x, nodePoses[i].y);

    }
  }


}
