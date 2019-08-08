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
	document.querySelector(id).innerHTML = html;
}


function handleMappings() {
	let html = '';
	window.mapping = JSON.parse(document.querySelector('#mapping-data').textContent);

	// Table of content
	html = html + '<ul>';
	for (let entry of window.mapping) {
		let id = escapeHtml(entry.file.replace('/', '_'));
		html = html + '<li><a href="#' + id + '">' + escapeHtml(entry.title) + '</a>';
	}
	html = html + "</ul>";
	document.querySelector('#mapping-navigation-placeholder').innerHTML = html;

	let aTags = document.querySelectorAll('a');
	for (let a of aTags) {
		a.addEventListener('click', closeMobileNavigation);
	}

	onHashChange();
}

function onHashChange() {
	if (!window.location.hash) {
		document.querySelector('#mapping-placeholder').innerHTML = '';
		return;
	}
	let entryname = window.location.hash.substring(1);
	for (let entry of window.mapping) {
		let id = escapeHtml(entry.file.replace('/', '_'));
		if (id === entryname) {
			let html = '<h3>' + escapeHtml(entry.title) + ' (' + entry.kdsf_id + ')' 
				+ '</h3>'
				+ '<div id="t' + id + '"></div>'
				+ '<p><a href="key_mapping/' + escapeHtml(entry.file) + '.csv">CSV-Export</a><br><br>';
	
			let xhr = new XMLHttpRequest();
			xhr.open('GET', 'key_mapping/' + entry.file + ".csv");
			xhr.send();
			xhr.onload = renderResponse;
			document.querySelector('#mapping-placeholder').innerHTML = html;
			return;
		}
	}
}

function closeMobileNavigation() {
	let nav = document.querySelector('nav');
	nav.className = 'hidenav';
}

function onMobileNavigationButtonClick() {
	let nav = document.querySelector('nav');
	if (nav.className === '') {
		nav.className = 'hidenav';
	} else {
		nav.className = '';
	}
}

window.addEventListener('hashchange', onHashChange);
document.querySelector('#mobilenav').addEventListener('click', onMobileNavigationButtonClick);

handleMappings();
