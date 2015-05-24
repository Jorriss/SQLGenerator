
        function parseQuery() {
            var cols = splitSelectColumns(getSelectColumns(replaceEndLine(document.getElementById("querytext").value.trim())));
            queryColumns = new Array();
            for (var len = cols.length, i=0; i < len; ++i) {
                queryColumns.push(new columnInfo(getColumnName(cols[i]), false, false));
            }
            clearChildNode(document.getElementById('columnTable'));
            document.getElementById('columnTable').innerHTML = getColumnTable(queryColumns);
        }

        function generateQuery(queryCols){
            var agg = document.getElementsByName('aggRadio');
            var pvt = document.getElementsByName('pivotRadio');
            var disp = document.getElementsByName('displayCheckbox');

            for (var i = 0, length = queryCols.length; i < length; i++) {
                if (agg[i].checked) {
                    queryCols[i].agg = true;
                }
                if (pvt[i].checked) {
                    queryCols[i].pivot = true;
                }
                if (disp[i].checked) {
                    queryCols[i].display = true;
                }
            }
            document.getElementById("pivottext").value = getPivotQuery(queryCols ,document.getElementById("valuestext").value, document.getElementById("querytext").value, document.getElementById("aggselect").value);
        }


function clearChildNode(node){
	while (node.hasChildNodes()) {
    	node.removeChild(node.firstChild);
	}
}

function replaceEndLine(query) {	
	return query.replace(/\n/g, " ")
}

function getSelectColumns(query) {
	var exp = /SELECT\s*(.*)\s*FROM/im;
	var match = exp.exec(query);
	return match[1];
}

function splitSelectColumns(columns) {
	return columns.split(',');
}

function getColumnName(column) {
	var re = /s*(?:(?:(?:(?:.*)\s*AS\s*\[?(\w*)\]?)\s*?,?)|\[?(?:\w*\.)?(\w*[^\]])\]?\s?,?)+\s*/im; 
	var m;
 	var val = "";
	 
	if (column !== null) {
		if ((m = re.exec(column.trim())) !== null) {
    		if (m.index === re.lastIndex) {
        		re.lastIndex++;
	    	}
		}
	}
	
	if (m[1] == null) {
		val = m[2];
	}
	else {
		val = m[1];
	}
	return val;
}

function columnInfo(name, pivot, display, agg){
	this.name = name;
	this.pivot = pivot;
	this.display = display;
	this.agg = agg;
}

function getColumnTable(columnNames) {
	var table = "<table class=\"table table-striped\">";
	table += "<thead><tr><th>Column Name</th><th>Agg</th><th>Pivot</th><th>Display</th></th></thead><tbody>";
	
	for (var len = columnNames.length, i=0; i < len; ++i) {
		table += "<tr>";
		table += "<td>" + columnNames[i].name + "</td>";
		table += "<td><input type=\"radio\" name=\"aggRadio\" value=\"" + columnNames[i].name + "\"";
		if (i === 0) { table += " checked"; }
		table +=  "></td>";
		table += "<td><input type=\"radio\" name=\"pivotRadio\" value=\"" + columnNames[i].name + "\"";
		if (i === 1) { table += " checked"; }
		table +=  "></td>";
		table += "<td><input type=\"checkbox\" name=\"displayCheckbox\" value=\"" + columnNames[i].name + "\"></td>";
		table += "</tr>";
	}	
	table += "</tbody></table>";
	return table;
}

function getPivotValues(pivotValues) {
	var pivotValueArr = pivotValues.split('\n');
    var values = "";
	
	for (var len = pivotValueArr.length, i=0; i < len; ++i) {
		if (i > 0) { values += ", "; }
		values += "[" + pivotValueArr[i].trim() + "]";
	}
	return values;	
}

function getPivotColPivot(columns) {
	var name = "";
	
	for (var len = columns.length, i=0; i < len; ++i) {
		if (columns[i].pivot === true) {
			name = columns[i].name;
			break;
		}
	}
	return name;
}

function getPivotColAgg(columns) {
	var name = "";
	
	for (var len = columns.length, i=0; i < len; ++i) {
		if (columns[i].agg === true) {
			name = columns[i].name;
			break;
		}
	}
	return name;
}

function getPivotColDisplay(columns) {
	var display = "";
	
	for (var len = columns.length, i=0; i < len; ++i) {
		if (columns[i].display === true) {
			display += columns[i].name + ", ";
		}
	}
	return display;
}

function getPivotQuery(columns, pivotValues, query, aggType) {
	var values = getPivotValues(pivotValues);
	var pivot = "";
	pivot += "SELECT " +  getPivotColDisplay(columns) + values +"\n";
	pivot += "FROM (\n" ;
	pivot += query + "\n" ;
	pivot += ") AS sourceTable\n";
	pivot += "PIVOT (\n";
	pivot += "  " + aggType.toUpperCase() + "(sourceTable." + getPivotColAgg(columns) + ")\n";
	pivot += "  FOR sourceTable." + getPivotColPivot(columns) + " IN (" + values +")\n";
	pivot += ") AS pivotTable;\n";

	return pivot;
}