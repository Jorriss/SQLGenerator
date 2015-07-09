
var PivotGen = function () {
    "use strict";
    this.queryColumns = [];
};

PivotGen.prototype = (function () {
    "use strict";

    var replaceEndLine = function (text, newValue) {
        return text.replace(/\n/g, newValue);
    },
        replaceBlankLine = function (text) {
            text = text.replace(/^\s*[\r\n]/gm, "");
            return text.replace(/[\r\n]?\s*$/gm, "");
        },
        
        replaceCTE = function (text) { 
            return text.replace(getCTE(text), "");
        },
        
        scrubQueryText = function (text) {
            return replaceCTE(replaceEndLine(replaceBlankLine(text), " "));
        },

		getCTE = function(text) {
			var exp =  /^(WITH\s\w.*\).*)SELECT/gm,
			    match = exp.exec(text),
				returnValue = "";

	        if (match != null) {
    	        returnValue = match[1];
       		} else {
            	returnValue = "";
        	}			
	 		return returnValue;
		},

        getSelectColumns = function (query) {
            var exp = /SELECT\s*(.*)\s*FROM/im,
                match = exp.exec(query),
                returnValue = "";

            if (match != null) {
                returnValue = match[1];
            } else {
                returnValue = "";
            }

            return returnValue;
        },

        splitSelectColumns = function (columns) {
            return columns.split(',');
        },

        getColumnName = function (column) {
            var re = /s*(?:(?:(?:(?:.*)\s*AS\s*\[?(\w*)\]?)\s*?,?)|\[?(?:\w*\.)?(\w*[^\]])\]?\s?,?)+\s*/im,
                m,
                val = "";

            if (column !== null) {
                m = re.exec(column.trim());
                if (m !== null) {
                    if (m.index === re.lastIndex) {
                        re.lastIndex = re.lastIndex + 1;
                    }
                }
            }

            if (m != null) {
                if (m[1] === undefined) {
                    val = m[2];
                } else {
                    val = m[1];
                }
            }

            return val;
        },

        ColumnInfo = function (name, pivot, display, agg) {
            this.name = name;
            this.pivot = pivot;
            this.display = display;
            this.agg = agg;
        },

        clearChildNode = function (node) {
            while (node.hasChildNodes()) {
                node.removeChild(node.firstChild);
            }
        },

        getAggRadioInputGroup = function (columnName, checked) {
            var group = "";

            if (checked === true) {
                group += '<div class="input-group" id="aggSelectDiv">';
                group += '<span class="input-group-addon">';
                group += '<input type="radio" name="aggRadio" id="aggSelectRadio" value="' + columnName + '" checked>';
                group += '</span>';
                group += '<select id="aggselect" class="form-control input-sm">';
                group += '<option value="avg">AVG</option>';
                group += '<option value="checksum_agg">CHECKSUM_AGG</option>';
                group += '<option value="count">COUNT</option>';
                group += '<option value="count_big">COUNT_BIG</option>';
                group += '<option value="max">MAX</option>';
                group += '<option value="min">MIN</option>';
                group += '<option value="sum">SUM</option>';
                group += '<option value="stdev">STDEV</option>';
                group += '<option value="stdevp">STDEVP</option>';
                group += '<option value="var">VAR</option>';
                group += '<option value="varp">VARP</option>';
                group += '</select>';
                group += '</div><!-- /input-group -->';
            } else {
                group += '<input type="radio" name="aggRadio" class="radio-table" onmousedown="sqlGen.prevSelection(this);" onclick="pivotDom.swapAggPivotChecked(this);" value="' + columnName + '">';
            }

            return group;
        },

        getColumnTable = function (columnNames) {
            var table,
                i = 0;

            table = "<table class=\"table table-striped\">";
            table += "<thead><tr><th>Column Name</th><th>Agg</th><th>Pivot</th><th>Display</th></th></thead><tbody>";

            for (i = 0; i < columnNames.length; i += 1) {
                table += "<tr>";
                table += '<td class="col-md-4">' + columnNames[i].name + '</td>';
                table += '<td class="col-md-4">' + getAggRadioInputGroup(columnNames[i].name,(i === 0 ? true : false));
                table += "</td>";
                table += '<td><input type="radio" name="pivotRadio" onmousedown="sqlGen.prevSelection(this);" onclick="pivotDom.swapAggPivotChecked(this);" value="' + columnNames[i].name + '"';
                if (i === 1) {
                    table += " checked";
                }
                table += "></td>";
                table += '<td><input type="checkbox" name="displayCheckbox" onclick="pivotDom.verifyDisplayCheckbox(this, event);" value="' + columnNames[i].name + '"></td>';
                table += "</tr>";
            }
            table += "</tbody></table>";
            return table;
        },

        getPivotValues = function (pivotValues) {
            var pivotValueArr = pivotValues.split('\n'),
                values = "",
                i = 0;

            for (i = 0; i < pivotValueArr.length; i += 1) {
                if (pivotValueArr[i].trim() != "") {
                    if (i > 0) {
                        values += ", ";
                    }
                    values += "[" + pivotValueArr[i].trim() + "]";
                }
            }
            return values;
        },

        getPivotColPivot = function (columns) {
            var name = "",
                i = 0;

            for (i = 0; i < columns.length; i += 1) {
                if (columns[i].pivot === true) {
                    name = columns[i].name;
                    break;
                }
            }
            return name;
        },
        getPivotColAgg = function (columns) {
            var name = "",
                i = 0;

            for (i = 0; i < columns.length; i += 1) {
                if (columns[i].agg === true) {
                    name = columns[i].name;
                    break;
                }
            }
            return name;
        },
        getPivotColDisplay = function (columns, escape) {
            var display = "",
                i = 0;

            for (i = 0; i < columns.length; i += 1) {
                if (columns[i].display === true) {
                    if (escape) {
                        display += "[";
                    }
                    display += columns[i].name;
                    if (escape) {
                        display += "]";
                    }
                    display += ", ";
                }
            }
            return display;
        },

        parseQuery = function (queryText, element) {
            var cols = splitSelectColumns(getSelectColumns(scrubQueryText(queryText.trim()))),
                i = 0;

            this.queryColumns = [];
            for (i = 0; i < cols.length; i += 1) {
                this.queryColumns.push(new ColumnInfo(getColumnName(cols[i]), false, false));
            }
            clearChildNode(document.getElementById(element));
            document.getElementById(element).innerHTML = getColumnTable(this.queryColumns);
        },

        getPivotQuery = function (columns, pivotValues, query, aggType) {
            var values = getPivotValues(pivotValues),
                pivot = "",
                queryScrub = "";
                
            queryScrub = replaceEndLine(replaceBlankLine(query), "!~");
            pivot += getCTE(queryScrub).replace(/!~/gm, "\n") + "\n";
            pivot += "SELECT " + getPivotColDisplay(columns, true) + values + "\n";
            pivot += "FROM (\n";
            pivot += replaceCTE(queryScrub).replace(/!~/gm, "\n") + "\n";
            pivot += ") AS sourceTable\n";
            pivot += "PIVOT (\n";
            pivot += "  " + aggType.toUpperCase() + "(sourceTable." + getPivotColAgg(columns) + ")\n";
            pivot += "  FOR sourceTable." + getPivotColPivot(columns) + " IN (" + values + ")\n";
            pivot += ") AS pivotTable;\n";

            return replaceBlankLine(pivot);
        };
        
    return {
        parseQuery: parseQuery,
        pivotQuery: getPivotQuery
    };
} ());
