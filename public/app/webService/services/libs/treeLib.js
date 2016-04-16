define(["./Queue.src"], function(Queue) {
	//SCRIPT------------------------------------------------------------------------------
	/*
	 *
	 *@author  Mr. Cho S. Kim
	 *
	 * The code in this script comes from (except for a few additions) the article written by Mr. Cho S. Kim (http://www.choskim.me/)
	 * on http://tutsplus.com/authors/cho-kim
	 *
	 */
	function Node(data) {
		this.data = data;
		this.parent = null;
		this.children = [];
		
		//My addition:
		if (!Node.prototype.addChild) {
			Node.prototype.addChild = function(childData){
				var childNode = new Node(childData);
				childNode.parent = this;
				this.children.push(childNode);
			}
		}
		
	}	

	var Tree = function(data) {
		var node = new Node(data);
		this._root = node;

		if (!Tree.prototype.traverseDF) {
			Tree.prototype = {
				traverseDF : function(callback) {
					// this is a recurse and immediately-invoking function
					(function recurse(currentNode) {
						// step 2
						for (var i = 0,
						    length = currentNode.children.length; i < length; i++) {
							// step 3
							recurse(currentNode.children[i]);
						}

						// step 4
						callback(currentNode);

						// step 1
					})(this._root);

				},

				traverseBF : function(callback) {
					var queue = new Queue();

					queue.enqueue(this._root);

					currentTree = queue.dequeue();

					while (currentTree) {
						for (var i = 0,
						    length = currentTree.children.length; i < length; i++) {
							queue.enqueue(currentTree.children[i]);
						}

						callback(currentTree);
						currentTree = queue.dequeue();
					}
				},

				contains : function(callback, traversal) {
					traversal.call(this, callback);
				},

				add : function(data, toData, traversal) {
					var child = new Node(data),
					    parent = null,
					    callback = function(node) {
						if (node.data === toData) {
							parent = node;
						}
					};

					this.contains(callback, traversal);

					if (parent) {
						parent.children.push(child);
						child.parent = parent;
					} else {
						throw new Error('Cannot add node to a non-existent parent.');
					}
				},

				remove : function(data, fromData, traversal) {
					var tree = this,
					    parent = null,
					    childToRemove = null,
					    index;

					var callback = function(node) {
						if (node.data === fromData) {
							parent = node;
						}
					};

					this.contains(callback, traversal);

					if (parent) {
						index = findIndex(parent.children, data);

						if (index === undefined) {
							throw new Error('Node to remove does not exist.');
						} else {
							childToRemove = parent.children.splice(index, 1);
						}
					} else {
						throw new Error('Parent does not exist.');
					}

					return childToRemove;
				}
				//TODO HASHCODE
				
			}
		}
	}
	
	
	
	
	function findIndex(arr, data) {
		var index;
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].data === data) {
				index = i;
			}
		}
		return index;
	}

	//END OF SCRIPT ----------------------------------------------
	
	var exports={};
	exports.Tree = Tree;
	exports.Node = Node;
	return exports;

});
