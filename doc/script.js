'use strict';

// -----------------------------------------------------
//                Utility Functions
// -----------------------------------------------------

//http://stackoverflow.com/a/12034334
var entityMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'\'': '&quot;'
};
function escapeHtml(string) {
	return String(string).replace(/[&<>']/g, function (s) {
		return entityMap[s];
	});
}


// -----------------------------------------------------
//               CSV to HTML table rendering
// -----------------------------------------------------


function formatTableCellValue(cell) {
	let string = cell.replace(/^"|"/g, '');
	return escapeHtml(string);
}

function renderTableRow(tag, row) {
	if (!row || !row.trim()) {
		return '';
	}

	let cells = row.split(';');
	let res = '<tr>';
	for (let cell of cells) {
		res = res + '<' + tag + '>' + formatTableCellValue(cell) + '</' + tag + '>'
	}
	res = res + '</tr>\r\n';
	return res;
}

function renderCSV(data) {
	let rows = data.split('\n');
	let res = '<table>';
	let tag = 'th';
	
	for (let row of rows) {
		res = res + renderTableRow(tag, row);
		tag = 'td';
	}
	res = res + '</table>';
	
	return res;
}


//-----------------------------------------------------
//   Handle KDSF mapping tables
//-----------------------------------------------------


function renderResponse() {
	let url = this.responseURL;
	let pos = url.indexOf('key_mapping/') + 12;
	let file = url.substring(pos);
	let id = '#t' + file.replace('/', '_').replace(/\.csv/, '');
	let html = renderCSV(this.responseText);
	console.log(id);
	document.querySelector(id).innerHTML = html;
}


function handleMappings() {
	let html = '';
	let mapping = JSON.parse(document.querySelector('#mapping-data').textContent);

	// Table of content
	html = html + '<table><tr><th>KDSF</th><th>Name</th><th>Links</th></tr>';
	for (let entry of mapping) {
		let id = escapeHtml(entry.file.replace('/', '_'));
		html = html
			+ "<tr><td>" + escapeHtml(entry.kdsf_id) 
			+ "</td><td>" + escapeHtml(entry.title)
			+ '</td><td><a href="#' + id + '">Tabelle</a> '
			+ '<a href="key_mapping/' + escapeHtml(entry.file) + '.csv">CSV</a></td></tr>';
	}
	html = html + "</table>";

	// Individual tables
	for (let entry of mapping) {
		let id = escapeHtml(entry.file.replace('/', '_'));
		html = html
			+ '<h3 id="' + id + '">' + escapeHtml(entry.title) + '</h3>'
			+ '<div id="t' + id + '"></div>'
			+ '<p><a href="key_mapping/' + escapeHtml(entry.file) + '.csv">CSV-Export</a> * <a href="#mapping">Zurück zur Übersicht</a><br><br>';

		let xhr = new XMLHttpRequest();
		xhr.open('GET', 'key_mapping/' + entry.file + ".csv");
		xhr.send();
		xhr.onload = renderResponse;
	}
	document.querySelector("#mapping-placeholder").innerHTML = html;
}

handleMappings();
