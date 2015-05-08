function Solver(vectC, vectB, matrixA, srcVarsCount, minOrMax){
	// ==============================private:==============================
	var sourceVarsCount = srcVarsCount;

	var minMax = minOrMax; // максимизация или минимизация?
	var varsCount = vectC.length; // кол-во переменных
	var confinesCount = matrixA.length; // кол-во ограничений
	var B = new Array(confinesCount);
	var C = new Array(varsCount);
	var Cb = [];
	var A = new Array(confinesCount); // матрица ограничений размера confinesCount x varsCount
	var delta = new Array(varsCount);
	var Z = [];
	var Basis = []; // массив строк для вывода: x1, x4 и т.д.. Базисные переменные
	
	// ведущие строка и столбец
	var guidingRow;
	var guidingCol;
	var guidingElement;

	var M = 9999;
	var maxCycles = 9999;

	// INITIAliZATION SOURCE DATA:
	for (var i=0; i<confinesCount; i++){
		A[i] = new Array(varsCount);
		for (var j=0; j<varsCount; j++){
			A[i][j] = getCopy(matrixA[i][j]);
			if (i == 0){
				C[j] = getCopy(vectC[j]);
			}
		}
		B[i] = vectB[i];
	}
	// END OF INIT SOURCE DATA

	/*
		Инициализация векторов С_базис. и В для первой таблицы
		Базис обозначен как х1, х2 , х3 ...
	*/
	function firstlyInitCb_Base(){
		for (var i=0; i<A.length; i++){
			for (var j=A[i].length-1; j>=0; j--){
				if (A[i][j].val == 1){
					var copy = getCopy(C[j]);
					Cb.push(copy);

					var index = j + 1;
					Basis.push("x<sub>" + index + "<\/sub>");
					break;
				}
			}
		}
	}

	/*
		Вернет bool: TRUE,
		если в массиве дельта есть отрицательный элемент
	*/
	function deltaIsNegative(){
		var index = getMinIndex(delta);
		return delta[index].val < 0;
	}

	/*
		Обновление базиса Basis для итераций
	*/
	function updateBasis(){
		//delete Basis[guidingRow]; // удалит ключ и значение

		// на место него ставим новую базисную переменную
		var index = guidingCol+1;
		Basis[guidingRow] = "x<sub>" + index + "<\/sub>";
	}

	/*
		Обновление коэф-ов базиса для итераций
	*/
	function updateCb(){
		Cb[guidingRow] = getCopy(C[guidingCol]);
	}

	/*
		Обновление всех(В и А) коэф-ов в ведущей строке.
		Изменения в B[guidingRow] и A[guidingRow][j]
	*/
	function updateByGuidingRow(){
		guidingElement = getCopy(A[guidingRow][guidingCol]);
		B[guidingRow] /= guidingElement.val;
		for (var j=0; j<varsCount; j++){
			A[guidingRow][j].val /= guidingElement.val;
		}
	}

	/*
		Обновить матрицу А и вектор свободных коэф-ов В,
		кроме элементов на ведущей строке и столбце.
		Они изменяются отдельно в вышестоящем и нижестоящем методе
	*/
	function updateAB(){
		var guidingValue = A[guidingRow][guidingCol].val;
		for (var i=0; i<confinesCount; i++){
			if (i == guidingRow) continue;
			
			B[i] -= (B[guidingRow] * A[i][guidingCol].val) / guidingValue;
			for (var j=0; j<varsCount; j++){
				if (j == guidingCol) continue;

				A[i][j].val -= (A[guidingRow][j].val * A[i][guidingCol].val) / guidingValue; 
			}
		}
	}

	/*
		Обновление матрицы А в ведущем столбце. 
		Проставление в ведущем столбце нулей, не задевая ведущий элемент
	*/
	function updateByGuidingCol(){
		for (var i=0; i<confinesCount; i++){
			if (i != guidingRow){
				A[i][guidingCol].val = 0;
			}
		}
	}

	/*
		Обновить вектор алггебраических разностей
		и вычисление Z для текущей итерации
	*/
	function updateDelta(){
		var lastZ = 0.0;
		for (var j=0; j<varsCount; j++){
			var deltaj = 0.0;
			for (var i=0; i<confinesCount; i++){
				deltaj += Cb[i].val * A[i][j].val;
				if (j === 0){
					// подсчет Z один раз
					lastZ += Cb[i].val * B[i];
				}
			}
			var obj = {
				isBalanced: C[j].isBalanced,
				isSynthetic: C[j].isSynthetic,
				val: deltaj-C[j].val
			};
			delta[j] = obj;
		}
		Z.push(lastZ);
	}

	function lastZ(){
		return Z[Z.length-1];
	}

	/*
		return: int
		Вернет индекс минимального элемента массива arr, состоящего из чисел или объектов
	*/
	function getMinIndex(arr){
		var minIndex = 0;
		var minElement = arr[minIndex].val == undefined? arr[minIndex]: arr[minIndex].val;
		for (var i = 1; i < arr.length; i++){
			var val = arr[i].val == undefined? arr[i]: arr[i].val;
			if (val < minElement){
				minElement = val;
				minIndex = i;
			}
		}
		return minIndex;
	}

	/*
		Клонировать объект obj
	*/
	function getCopy(obj){
		var ret = {};
		for (var key in obj){
			ret[key] = obj[key];
		}
		return ret;
	}

	/*
		return : bool
		Если в строке с отрицательным свободным членом нет отрицательных элементов,
		то система ограничений несовместна и задача не имеет решения.
		Вызов перед основным циклом (после построения начальной(1ой) таблицы)
	*/
	function confinesCorrect(){
		for (var i=0; i<confinesCount; i++){
			if (B[i] < 0){
				for (var j=0; j<varsCount; j++){
					if (A[i][j].val < 0) return true;
				}
				return false;
			}
		}
		return true;
	}

	/*
		return: bool
	*/
	function inArray(arr, val){
		for (var i=0; i<arr.length; i++){
			if (arr[i] == val)
				return true;
		}
		return false;
	}

	/*
		При случае, когда получено оптимальное решение (delta[i] >= 0)
		Но существуют также небазисные столбцы с delta[i] == 0
		return: bool
	*/
	function alternativeOptimum(){
		var rE = /\d+/ig;
		var basisIndexes = Basis.join("").match(rE);
		for (var i=0; i<basisIndexes.length; i++){
			basisIndexes[i] = parseInt(basisIndexes[i], 10) - 1; // теперь здесь индексы базиза
		}

		for (var j=0; j<delta.length; j++){
			var deltaVal = delta[j].val;
			
			// если delta[j] == 0 И эта delta [j] небазисная
			if (deltaVal == 0 && !inArray(basisIndexes, j)){
					return true;
			}
		}
		return false;
	}

	/*
		Определение напрявляющих строки и столбца
	*/
	function setGuiding(){
		guidingCol = getMinIndex(delta);

		var ar = []; // разности B[i]/A[i][guidingCol]
		for (var i = 0; i < confinesCount; i++){
			if (A[i][guidingCol].val > 0){
				var elem = B[i] / A[i][guidingCol].val;
				ar.push(elem);
			}else
				ar.push(M);
		}

		guidingRow = getMinIndex(ar);
	}

	/*
		Если в ведущем столбике нет ни одного строго положительного элемента,
		то задача не имеет оптимального решения,
		а целевая функция неограничена снизу (в задаче на минимум)
		или неограничена сверху (в задаче на максимум).
	*/
	function guidingColOK(){ // см. условие в цикле
		for (var i=0; i<confinesCount; i++){
			if (A[i][guidingCol].val > 0)
				return true;
		}
		return false;
	}
	// ==============================public:==============================

	this.executeFirstApprox = function(){
		firstlyInitCb_Base();
		updateDelta();

		setGuiding();

		new Expressioner(C).drawObjectiveFunction();
		new TableBuilder(A, B, C, Cb, Basis, lastZ()).drawTable(guidingRow, guidingCol);
	};

	this.nextSolvings = function(){
		while(maxCycles){
			var negativeDelta = deltaIsNegative();
			var isAlternativeOptimum = alternativeOptimum();

			debugger;
			if (!negativeDelta && !isAlternativeOptimum){
				new Answerer().show(Basis, B, lastZ(), sourceVarsCount, minMax);
				new Answerer().showDual(delta, confinesCount);
				return;
			}

			if (!negativeDelta && isAlternativeOptimum){
				new Answerer().showOptimumMsg();
				new Answerer().show(Basis, B, lastZ(), sourceVarsCount, minMax);
				new Answerer().showDual(delta, confinesCount);
			}

			// проверяем на совместность
			if (!confinesCorrect()){
				new Answerer().showIncompatible();
				return;
			}
			
			setGuiding(); // определение ведущих столбца и строки в матрице А
			if (!guidingColOK()){
				new Answerer().showNonOptimum(minMax); // целевая ф-ция неограничена
				return;
			}

			updateBasis();
			updateCb();
			updateAB();
			updateByGuidingRow();
			updateByGuidingCol();
			updateDelta();
			setGuiding();
			new TableBuilder(A, B, C, Cb, Basis, lastZ()).drawTable(guidingRow, guidingCol);

			maxCycles--;
		}
	};
}