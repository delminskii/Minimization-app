function TableBuilder(A, B, C, Cb, Basis, lastZ){
	var table;
	var rows = A.length; // строки для чисел основного фрейма
	var wrapper = document.createElement("DIV");
	var M = 9999;

	/*
		Вернет заголовочную часть таблицы
	*/
	function getHeader(){
		var ret = "<tr class='header'>";
		ret += "<th rowspan=2 class='head'>базис<\/th>"
		ret += "<th rowspan=2 class='head'>C<sub>б</sub><\/th>";
		ret += "<th class='head'>C<\/th>";
		for (var i=0; i<C.length; i++){
			ret += "<th>" + (C[i].val == -9999? "-M": C[i].val) + "<\/th>";
		}
		ret += "<\/tr>";

		ret += "<tr class='header'>";
		ret += "<th class='head'>B<\/th>";
		for (var i=0; i<C.length; i++){
			var index = i+1;
			ret += "<th class='head'>A" + "<sub>" + index +"<\/sub>" + "<\/th>";
		}
		ret += "<\/tr>";

		return ret;
	}


	/*
		Получение Z в нормальном виде: -0.5M + остаток и т.д.
	*/
	function getRealZ(){
		var koefM = 0.0;
		var elseVal = 0.0; // часть без М

		// пересчитаем реальный коэф-т перед M 
		for (var i=0; i<Cb.length; i++){
			if (Cb[i].isSynthetic)
				koefM += B[i];
			else
				elseVal += B[i] * Cb[i].val;
		}

		if (koefM != 0.0){
			koefM *= -1;
			
			var ret = "";
			switch(koefM){
				case -1:
					ret += "-";
				case 1:
					break;
				default:
					ret += koefM.toFixed(2);
			}
			ret += "M" + (elseVal >= 0? "+": "") + elseVal.toFixed(2);
			return ret;
		}

		return lastZ.toFixed(2);
	}


	/*
		Получение дельты в нормальном виде: M - 0.7 и т.д.
	*/
	function getRealDelta(j){
		var koefM = 0.0;
		var elseVal = 0.0;
		for (var i=0; i<Cb.length; i++){
			if (Cb[i].isSynthetic)
				koefM += A[i][j].val;
			else
				elseVal += Cb[i].val * A[i][j].val;
		}

		if (koefM != 0.0){
			if (C[j].isSynthetic){
				koefM--;
			}else{
				elseVal -= C[j].val
			}
			koefM *= -1;
			var ret = "";
			switch(koefM){
				case -1:
					ret += "-";
				case 1:
					break;
				default:
					ret += koefM.toFixed(2);
			}
			ret += "M" + (elseVal >= 0? "+": "") + elseVal.toFixed(2);
			return ret;
		}

		if (C[j].isSynthetic){
			return "M" + (elseVal >= 0? "+": "") + elseVal.toFixed(2);
		}
		return (elseVal - C[j].val).toFixed(2);
	}

	/*
		Вернет нижнюю строку таблицы с Z = ... и значениями delta
	*/
	function getResult(guidingCol){
		var resTr = document.createElement("TR");
		resTr.setAttribute("class", "result")

		var tdZ = document.createElement("TD");
		tdZ.setAttribute("colspan", 2);
		var realZ = getRealZ();
		tdZ.innerHTML = "Z=" + realZ;

		var tdDelta = document.createElement("TD");
		tdDelta.setAttribute("class", "delta");
		tdDelta.innerHTML = "Δ:";

		resTr.appendChild(tdZ);
		resTr.appendChild(tdDelta);
		for (var j=0; j<C.length; j++){
			var tdDeltaVal = document.createElement("TD");
			tdDeltaVal.innerHTML = getRealDelta(j);
			if (j == guidingCol){
				tdDeltaVal.classList.add("guidingCol");
			}
			resTr.appendChild(tdDeltaVal);
		}

		return resTr;
	}

	/*
		Вернет основную часть таблицы в виде фрагмента
	*/
	function getFooter(guidingRow, guidingCol){
		var fragment = document.createDocumentFragment();
		for (var i=0; i<rows; i++){
			var tr = document.createElement("TR");

			var tdBasis = document.createElement("TD");
			tdBasis.innerHTML = Basis[i];

			var tdCb = document.createElement("TD");
			tdCb.innerHTML = Cb[i].val == -9999? "-M": Cb[i].val.toFixed(2); 

			var tdB = document.createElement("TD");
			tdB.innerHTML = B[i].toFixed(2);

			if (i == guidingRow){ // ведущая строка
				tdBasis.classList.add("guidingRow");
				tdCb.classList.add("guidingRow");
				tdB.classList.add("guidingRow");
			}
			tr.appendChild(tdBasis);
			tr.appendChild(tdCb);
			tr.appendChild(tdB);

			for (var j=0; j<A[i].length; j++){
				var tdA = document.createElement("TD");
				tdA.innerHTML = A[i][j].val.toFixed(2);
				if (i == guidingRow){
					tdA.classList.add("guidingRow");
				}
				if (j == guidingCol){
					tdA.classList.add("guidingCol");
				}
				tr.appendChild(tdA);
			}

			fragment.appendChild(tr);
		}

		return fragment;
	}

	// public:
	this.drawTable = function(guidingRow, guidingCol){
		table = document.createElement("TABLE");
		table.setAttribute("border", 2);
		table.innerHTML = getHeader();
		//alert("Ведущая строка: " + (guidingRow+1) + ", столбец: " + (guidingCol+1));
		table.appendChild(getFooter(guidingRow, guidingCol));
		table.appendChild(getResult(guidingCol));

		wrapper.appendChild(table);
		document.getElementsByClassName("container")[0].appendChild(wrapper);
	}
}