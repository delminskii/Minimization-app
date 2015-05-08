function FrontGenerator(obj){
	// private:
	var varsCount = obj.varsCount;
	var confinesCount = obj.confinesCount;
	var wrapper = document.getElementsByClassName("source2")[0];
	var M = 9999;

	/*
		Получить знак неравенства: =, >=, <= из row-го ограничения
	*/
	function getConfine(row){
		var select = document.getElementById("inequality" + row);
		return select.options[select.selectedIndex].text;
	}

	/*
		Вернет полную копию объекта obj
	*/
	function getCopy(obj){
		var ret = {};
		for (var key in obj)
			ret[key] = obj[key];
		return ret;
	}

	/*
		обновить состояние матрицы matrix.
		Добавить в конец строк матрицы аналогичные balanced элементы.
		Происходит при приведении системы к канонич. виду
	*/
	function updateMatrixExceptRow(row, matrix, balanced){
		for (var i=0; i<matrix.length; i++){
			if (i == row) continue;
			var obj = {
				isBalanced: balanced,
				isSynthetic: !balanced,
				val: 0
			};
			matrix[i].push(obj);
		}
	}

	/*
		Установить коэф-т в вектор С. Балансевые все с коэф-том = 0. Искусств.-е = -М при максимизации
	*/
	function updateC(obj, vecC){
		var object = getCopy(obj);
		object.val = object.isBalanced? 0: -M;
		vecC.push(object);
	}

	/*
		#solve.onClick
	*/
	function solve(){
		// Передать в контруктор солвера все вектора: В, С, матрицу ограничений
		// Эти векторы состоят из объектов со свойствами val, isSynthetic, isBalanced
		var B = [];
		var matrixA = new Array(confinesCount);
		var C = [];

		var selectMax = document.getElementById("minmax");
		var minOrMax = selectMax.options[selectMax.selectedIndex].text;
		for (var i = 0; i < confinesCount; i++){
			matrixA[i] = [];
			for (var j = 0; j < varsCount; j++){
				var ijInput = document.getElementById(i.toString() + j.toString());
				var value = parseInt(ijInput.value.trim(), 10);
				var obj = {
					isBalanced: false,
					isSynthetic: false,
					val: value
				};
				matrixA[i].push(obj); // обычные коэффициэнты матрицы ограничений

				/*один раз получаем значения для вектора С*/
				if (i == 0){
					var cInput = document.getElementById("C" + j);
					obj = getCopy(obj);
					obj.val = parseInt(cInput.value.trim(), 10);

					// превращаем в максимизацию, если исх. дано минимизация
					if (minOrMax == "min") obj.val *= -1;
					C.push(obj);
				}
			}

			// свободные коэф-ты
			var inputB = document.getElementById("B" + i);
			var val = parseInt(inputB.value.trim(), 10);
			B.push(val);
		}

		// приведем к каноническому виду:
		// isBalanced && val == 1? свои собственные балансевые...
		// isSynthetic && val == 1? свои собственные искусствю
		// isBalanced && val == 0? не свои балансевые
		// isSynthetic && val == 0? не свои искусственные
		for (var i=0; i<confinesCount; i++){
			var confine = getConfine(i);
			var obj = {
				isBalanced: false,
				isSynthetic: false,
				val: 1
			};
			switch(confine){
				case "<=":
					obj.isBalanced = true;
					break;
				case "=":
					obj.isSynthetic = true;
					break;
				default:{
					obj.isBalanced = true; // при случае >= сначала добавляем баланс. перем-ую со знаком минус, затем искусственную.
					obj.val = -1;
					matrixA[i].push(obj);
					updateMatrixExceptRow(i, matrixA, obj.isBalanced);
					updateC(obj, C);

					obj = getCopy(obj);
					obj.isBalanced = false;
					obj.isSynthetic = true;
					obj.val = 1;
				}
			}
			matrixA[i].push(obj);
			updateMatrixExceptRow(i, matrixA, obj.isBalanced);
			updateC(obj, C);
		}
		this.style.display = "none";

		var solver = new Solver(C, B, matrixA, varsCount, minOrMax);
		solver.executeFirstApprox();
		solver.nextSolvings();
	}


	// public:

	/*
		Генерирует интерфейс для взаимодействия с 
		пользователем для ввода данных
	*/
	this.generate = function(){
		var fragment = document.createDocumentFragment();
		for (var i = 0; i < confinesCount; i++){
			for (var j = 0; j < varsCount; j++){
				var input = document.createElement("INPUT");
				input.setAttribute("id", i.toString() + j.toString());
				var sub = document.createElement("SUB");
				sub.innerHTML = j + 1;
				var text = document.createTextNode("x");

				fragment.appendChild(input);
				fragment.appendChild(text);
				fragment.appendChild(sub);
			}
			var inequality = document.createElement("SELECT");
			inequality.setAttribute("name", "inequality");
			inequality.setAttribute("id", "inequality" + i);
			for (var t = 0; t < 3; t++){
				var option = document.createElement("OPTION");
				option.innerHTML = (function(index){
					switch(index){
						case 1:
							return "<=";
						case 2:
							return ">=";
						case 3:
							return "=";
					}
				})(t+1);
				if (t+1 === 1){
					option.setAttribute("selected", "true");
				}

				inequality.appendChild(option);
			}
			fragment.appendChild(inequality);

			var B = document.createElement("INPUT");
			B.setAttribute("id", "B" + i);

			fragment.appendChild(B);
			fragment.appendChild(document.createElement("BR"));
		} // end for i

		var minMax = document.createElement("SELECT");
		minMax.setAttribute("id", "minmax");
		minMax.setAttribute("name", "minMax");

		for (var i = 0; i < 2; i++){
			var option = document.createElement("OPTION");
			var innerHTML;
			if (i+1 === 1)
				innerHTML = "max";
			else
				innerHTML = "min";
			option.innerHTML = innerHTML;

			if (i+1 === 1){
				option.setAttribute("selected", "true");
			}
			minMax.appendChild(option);
		}
		fragment.appendChild(minMax);
		fragment.appendChild(document.createTextNode("Z ="));

		for (var i = 0; i  < varsCount; i++){
			var input = document.createElement("INPUT");
			input.setAttribute("id", "C" + i);
			
			var sub = document.createElement("SUB");
			sub.innerHTML = i+1;
			var text = document.createTextNode("x");

			fragment.appendChild(input);
			fragment.appendChild(text);
			fragment.appendChild(sub);
		}
		
		var btnSolve = document.createElement("BUTTON");
		btnSolve.id = "solve";
		btnSolve.innerHTML = "Решить";
		btnSolve.onclick = solve;
		
		fragment.appendChild(document.createElement("BR"));
		fragment.appendChild(btnSolve);

		wrapper.appendChild(fragment);
		wrapper.style.display = "block";
	};
}