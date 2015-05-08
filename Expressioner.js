function Expressioner(vectC){
	// private:
	var text = "maxZ = ";
	var wrapper = document.createElement("DIV");

	//  init text for out
	for (var j=0; j<vectC.length; j++){
		var obj = vectC[j];
		var ind = j+1;
		ind = "<sub>" + ind + "<\/sub>";
		if (!obj.isBalanced && !obj.isSynthetic){
			if (obj.val < 0){
				if (obj.val == -1)
					text += "-x" + ind;
				else
					text += obj.val + "·x" + ind;
			}
			else
				if (obj.val == 1)
					if (text == "maxZ = ")
						text += "x" + ind;
					else
						text += "+x" + ind;
				else
					if (text == "maxZ = ")
						text += obj.val + "·x" + ind;
					else
						text += "+" + obj.val + "·x" + ind;
		}
		if (obj.isBalanced){
			text += "+0·x" + ind;
		}
		if (obj.isSynthetic){
			text += "-M·x" + ind;
		}
	}


	// public:
	this.drawObjectiveFunction = function(){
		wrapper.innerHTML = text;
		wrapper.setAttribute("class", "objectiveFunction")
		document.getElementsByClassName("container")[0].appendChild(wrapper);
	};
}