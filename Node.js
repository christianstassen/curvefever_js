class Node {

  constructor(no) {
    this.number = no;
    this.inputSum = 0;    // current sum i.e. before activation
    this.outputValue = 0; // after the activation function is applied
    this.outputConnections = []; // list of connectionGene
    this.layer = 0;
  }

  activate() {
    if (this.layer !=0) {
      // this.outputValue = this.sigmoid(this.inputSum)
      this.outputValue = Math.tanh(this.inputSum)
    }

    for (let i = 0; i<this.outputConnections.length; i++) { //go through all connections that this node has
      if(this.outputConnections[i].enabled) { //only do this if this node is enabled
        this.outputConnections[i].toNode.inputSum += this.outputConnections[i].weight * this.outputValue; //add the weighted output to the sum of the inputs of whatever node this node is connected to
      }
    }
  }

  //sigmoid activation function
  sigmoid(x) {
    return 1.0 / (1.0 + pow(Math.E, -4.9 * x)); //todo check pow
  }

  // Check what nodes are connected
  isConnectedTo(node) {
    if(node.layer == this.layer) { //nodes in the same this.layer cannot be connected
      return false;
    }

    if(node.layer < this.layer) {
      for(var i = 0; i < node.outputConnections.length; i++) {
        if(node.outputConnections[i].toNode == this) {
          return true;
        }
      }
    } else {
      for(var i = 0; i < this.outputConnections.length; i++) {
        if(this.outputConnections[i].toNode == node) {
          return true;
        }
      }
    }
    return false;
  }

  //returns whether this node connected to the parameter node
  //used when adding a new connection
isConnectedTo(node) {
    if(node.layer == this.layer) { //nodes in the same this.layer cannot be connected
      return false;
    }

    //you get it
    if(node.layer < this.layer) {
      for(var i = 0; i < node.outputConnections.length; i++) {
        if(node.outputConnections[i].toNode == this) {
          return true;
        }
      }
    } else {
      for(var i = 0; i < this.outputConnections.length; i++) {
        if(this.outputConnections[i].toNode == node) {
          return true;
        }
      }
    }

    return false;
  }

    //returns a copy of this node
  clone() {
    var clone = new Node(this.number);
    clone.layer = this.layer;
    return clone;
  }
}
