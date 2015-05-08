function Answerer(){
	// private:
	var wrapper = document.createElement("DIV");
	var answersIndexes; // array
	wrapper.setAttribute("class", "answer");
	var text = "X = (";
	var srcVarsCount;
	var M = 9999;

	/*
		Инициализация answersIndexes. В нем - 
		индексы базисных переменных в результирующей таблице
	*/
	function setIndexes(BasisVect){
		var rE = /\d/ig;
		answersIndexes = BasisVect.join("").match(rE);
		for (var i=0; i<answersIndexes.length; i++){
			var value = parseInt(answersIndexes[i], 10);
			answersIndexes[i] = value-1; // real indexes
		}
	}

	function getCopy(obj){
		var ret = {};
		for (var key in obj){
			ret[key] = obj[key];
		}
		return ret;
	}

	/*
		Есть ли val в answersIndexes? Вернуть с индексом
	*/
	function inAnswers(val){
		for (var i=0; i<answersIndexes.length; i++){
			if (answersIndexes[i] == val)
				return {
					ind: i,
					bool: true
				};
		}
		return {
			ind: -1,
			bool: false
		};
	}

	/*
		Окончательное определение ответа.
		Формирование ответа по кол-ву исходных переменных
	*/
	function setText(B){
		for (var i=0; i<srcVarsCount; i++){
			var res = inAnswers(i);
			if (res.bool == true){
				text += (B[res.ind].toFixed(2) + "; ");
			}else{
				text += "0; ";
			}
		}

		text = text.trim();
		text = text.split("").slice(0, -1).join("");
		text += ")";
	}

	// public:
	this.show = function(BasisVect, BVect, zValue, varsCount, minOrMax){
		srcVarsCount = varsCount;
		setIndexes(BasisVect);
		setText(BVect);
		if (minOrMax == "min") zValue *= -1;
		//text += "<br>Z = " + (minOrMax == "min"? "-":"") + zValue.toFixed(2);
		text += "<br>Z = " + zValue.toFixed(2);

		wrapper.innerHTML = text;
		document.getElementsByClassName("container")[0].appendChild(wrapper);
	};

	this.showNonOptimum = function(minOrMax){
		text = "Задача не имеет оптимального решения<br>";
		text += "Целевая функция Z неограничена " + (minOrMax == "max"? "сверху": "снизу");

		wrapper.innerHTML = text;
		document.getElementsByClassName("container")[0].appendChild(wrapper);
	};

	this.showIncompatible = function(){
		text = "Задача не имеет решений<br>";
		text += "Cистема ограничений несовместна";

		wrapper.innerHTML = text;
		document.getElementsByClassName("container")[0].appendChild(wrapper);		
	};

	/*
		показать решение двойственной задачи.
		Кол-во переменных в двойств. задаче == кол-во ограничений в прямой
	*/
	this.showDual = function(deltaArr, confinesCount){
		text = "Y = (";
		var varsCount = confinesCount;

		for (var j=0; j<deltaArr.length; j++){
			var o = deltaArr[j];
			if (o.isBalanced && varsCount){
				text += o.val.toFixed(2) + "; ";
				varsCount--;
			}
		}
		if (varsCount){
			var j = 0;
			while (varsCount){
				text += deltaArr[j++].val.toFixed(2) + "; ";
				varsCount--;
			}
		}

		text = text.trim();
		text = text.split("").slice(0, -1).join("");
		text += ")";

		wrapper.innerHTML = text;
		document.getElementsByClassName("container")[0].appendChild(wrapper);
	};

	this.showOptimumMsg = function(){
		text = "Альтернативный оптимум";
		wrapper.innerHTML = text;
		document.getElementsByClassName("container")[0].appendChild(wrapper);
	};
}