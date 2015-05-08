window.onload = function(){
	document.getElementById("nextStep").onclick = function(){
		var varsCountSelect = document.getElementById("varsCount");
		var confinesCountSelect = document.getElementById("confinesCount");

		var selectedVarsValue = varsCountSelect.options[varsCountSelect.selectedIndex].text;
		var selectedConfinesValue = confinesCountSelect.options[confinesCountSelect.selectedIndex].text;

		new FrontGenerator({
			varsCount: parseInt(selectedVarsValue, 10),
			confinesCount: parseInt(selectedConfinesValue, 10)
		}).generate();

		this.parentNode.removeChild(this);
	};
};