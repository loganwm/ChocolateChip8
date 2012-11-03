var columnHeight = 17;

var wordColumnWidth = 12;

var Count = 12;

var Difficulty = 7;

var DudLength = 8;

var Sound = true;

var InfoText = "ROBCO INDUSTRIES (TM) TERMALINK PROTOCOL<br />ENTER PASSWORD NOW";

var Haikus = [
	"Out of memory.<br />We wish to hold the whole sky,<br />But we never will.",
	"Three things are certain:<br />Death, taxes, and lost data.<br />Guess which has occurred.",
	"wind catches lily<br />scatt'ring petals to the wind:<br />segmentation fault",
	"The fence is for you<br />To protect you from danger<br />Don't go past the fence",
	"Joe Roquefort: hero<br />of cryptanalysis in<br />the Second World War.",
	"Math gurus showed us<br />some hash weaknesses. Panic<br />ensues. New hash now!",
	"Two thousand seven,<br />NIST says 'New hash contest now!'<br />Five years later, done."
];

var Correct = "";

var Words = {};

var OutputLines = [];

var AttemptsRemaining = 4;

var Power = "off";

var BracketSets = [
	"<>",
	"[]",
	"{}",
	"()"
];

var gchars =
[
	"'",
	"|",
	"\"",
	"!",
	"@",
	"#",
	"$",
	"%",
	"^",
	"&",
	"*",
	"-",
	"_",
	"+",
	"=",
	".",
	";",
	":",
	"?",
	",",
	"/"
];

Start = function()
{
	$.get("server.php", {
		length: Difficulty,
		count: Count
	}, WordCallback);
}

window.onload = function()
{
	if (Power == "off")
		return;
		
	if ($.browser.safari || $.browser.msie)
		Sound = false;
	
	document.onselectstart = function() { return false; }
	
}


TogglePower = function()
{
	if (Power == "on")
	{

		Power = "off";
		$("#terminal-background-off").css("visibility", "visible");
		$("#terminal").css("background-image", "url('graphics/bg-off.png')");
		$("#terminal-screen-render").css("visibility", "hidden");
	}
	else
	{
		Power = "on";
		$("#terminal-background-off").css("visibility", "hidden");
		$("#terminal").css("background-image", "url('graphics/bg.png')");
		$("#terminal-screen-render").css("visibility", "visible");
		window.onload();
	}
}
