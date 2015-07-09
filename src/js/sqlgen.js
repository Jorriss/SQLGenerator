var SqlGen = function () {
    "use strict";
    this.prevElement = {}
};

SqlGen.prototype = (function() {
    "use strict";

    var versionNumber = function(element) {
        element.innerHTML = '0.1.3';
    },
    
    showElement = function (name, show) {
        var optionDiv = document.getElementById(name);

        if (show === true) {
            setDisplay(optionDiv, true);
        } else {
            setDisplay(optionDiv, false);
        }
    },

    setDisplay = function (obj, val) {
        if (val === true) {
            obj.style.display = 'block';
        } else {
            obj.style.display = 'none';
        }
    },

    prevSelection = function (element) {
        this.prevElement = $("[name=" + element.name + "]:checked")[0];
    },

    textAreaAdjust = function (element) {
        element.style.height = "1px";
        element.style.height = (25 + element.scrollHeight) + "px";
    };

    return {
        versionNumber: versionNumber,
        showElement: showElement,
        setDisplay: setDisplay,
        prevSelection: prevSelection,
        textAreaAdjust: textAreaAdjust
    };


}());
