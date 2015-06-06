var PivotGenDom = function (sql) {
    "use strict";
    this.pivot = new PivotGen(sql);
    this.sqlGen = sql;
};

PivotGenDom.prototype = (function () {
    "use strict";

    var replaceEndLine = function (query) {
        return query.replace(/\n/g, " ");
    },

        verifyDisplayCheckbox = function (element, event) {
            var pivotEl = $("[name=pivotRadio]:checked").val(),
                aggEl = $("[name=aggRadio]:checked").val(),
                evEl = element.value;

            if (pivotEl === evEl || aggEl === evEl) {
                event.preventDefault();
            }
        },

        includeExample = function (checked) {
            if (checked == true) {
                document.getElementById("querytext").value = document.getElementById("exampleQuery").innerHTML;
                document.getElementById("valuestext").value = document.getElementById("exampleValues").innerHTML;
            } else {
                document.getElementById("querytext").value = "";
                document.getElementById("valuestext").value = "";
            }
        },

        submitQuery = function () {
            var queryCols = this.pivot.queryColumns,
                isError = false,
                queryErrorText = "",
                i;

            if (queryCols.length <= 1) {
                isError = true;
                queryErrorText = "There needs to be at least two columns in the query.";
            }

            for (i = 0; i < queryCols.length; i += 1) {
                if (queryCols[i].name === "*") {
                    isError = true;
                    if (queryErrorText !== "") { queryErrorText += "<br />"; }
                    queryErrorText += "You cannot use '*' in the PIVOT generator."
                    break;
                }
            }

            if (isError) {
                this.sqlGen.showElement('optiondiv', false);
                this.sqlGen.showElement('pivotdiv', false);
                $('.input-validation-error').parents('.form-group').addClass('has-error');
                $('.field-validation-error').addClass('text-danger');
                $('#querytextError').html(queryErrorText);
                this.sqlGen.showElement('querytextError', true);
            } else {
                this.sqlGen.showElement('optiondiv', true);
                this.sqlGen.showElement('pivotdiv', false);
                document.getElementById('clearButton').innerHTML = "Clear Results";
                $('.input-validation-error').parents('.form-group').removeClass('has-error');
                $('.field-validation-error').removeClass('text-danger');
                this.sqlGen.showElement('querytextError', false);
            }
        },

        clearResult = function () {
            if (document.getElementById("clearButton").innerHTML === 'Clear Results') {
                this.sqlGen.setDisplay(document.getElementById('optiondiv'), false);
                this.sqlGen.setDisplay(document.getElementById('pivotdiv'), false);
                document.getElementById("clearButton").innerHTML = 'Clear Query';
            } else if (document.getElementById("clearButton").innerHTML === 'Clear Query') {
                document.getElementById("querytext").value = '';
                document.getElementById('exampleCheck').checked = false;
            }
        },

        generateQuery = function () {
            var queryCols = this.pivot.queryColumns,
                agg = document.getElementsByName('aggRadio'),
                pvt = document.getElementsByName('pivotRadio'),
                disp = document.getElementsByName('displayCheckbox');

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
            document.getElementById("pivottext").value = this.pivot.pivotQuery(queryCols, document.getElementById("valuestext").value, document.getElementById("querytext").value, document.getElementById("aggselect").value);
            this.sqlGen.textAreaAdjust(document.getElementById("pivottext"));
        },


        getCheckedElement = function (elementName) {
            var el = document.getElementsByName(elementName),
                returnEl;

            for (var i = 0, length = el.length; i < length; i++) {
                if (el[i].checked) {
                    returnEl = el[i];
                    break;
                }
            }
            return returnEl;
        },

        getCheckedElement = function (elementName) {
            var el = document.getElementsByName(elementName),
                returnEl;

            for (var i = 0, length = el.length; i < length; i++) {
                if (el[i].checked) {
                    returnEl = el[i];
                    break;
                }
            }
            return returnEl;
        },

        swapAggPivotChecked = function (element) {
            var sameVal = checkSameValue('pivotRadio', 'aggRadio')

            $("[name=displayCheckbox][value=" + element.value + "]")[0].checked = false;
            if (element.name === 'pivotRadio') {
                if (sameVal) {
                    selectAggMove($("[name=aggRadio][value=" + this.sqlGen.prevElement.value + "]")[0]);
                }
            }
            else {
                if (sameVal) {
                    $("[name=pivotRadio][value=" + this.sqlGen.prevElement.value + "]")[0].checked = true;
                }
                selectAggMove(element);
            }
        },

        checkSameValue = function (pivotName, aggName) {
            var pivotEl = $("[name=" + pivotName + "]:checked").val(),
                aggEl = $("[name=" + aggName + "]:checked").val(),
                returnVal = false;

            if (pivotEl === aggEl) {
                returnVal = true;
            }
            return returnVal;
        },

        selectAggMove = function (radio) {
            var parentTarget = radio.parentNode,
                parentSource = document.getElementById('aggSelectDiv').parentNode,
                sourceValue = radio.value;

            $("#aggSelectDiv").appendTo(parentTarget);
            $(radio).appendTo(parentSource);
            document.getElementById('aggSelectRadio').checked = true;
            radio.value = document.getElementById('aggSelectRadio').value;
            document.getElementById('aggSelectRadio').value = sourceValue;
        },

        queryParseSubmit = function (queryText, element) {
            this.pivot.parseQuery(queryText, element);
            this.submitQuery();
        }

    return {
        includeExample: includeExample,
        submitQuery: submitQuery,
        queryParseSubmit: queryParseSubmit,
        generateQuery: generateQuery,
        swapAggPivotChecked: swapAggPivotChecked,
        verifyDisplayCheckbox: verifyDisplayCheckbox,
        clearResult: clearResult
    };

} ());
