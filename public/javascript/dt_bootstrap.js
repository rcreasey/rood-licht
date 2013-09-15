$.extend(true, $.fn.dataTable.defaults, {
  sDom: "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-6'i><'col-md-6'p>>",
  sPaginationType: "bootstrap",
  iDisplayLength: 25,
  oLanguage: {
    sLengthMenu: "_MENU_ records per page"
  }
});

$.extend($.fn.dataTableExt.oStdClasses, {
  sWrapper: "dataTables_wrapper form-inline"
});

$.fn.dataTableExt.oApi.fnPagingInfo = function(oSettings) {
  return {
    iStart: oSettings._iDisplayStart,
    iEnd: oSettings.fnDisplayEnd(),
    iLength: oSettings._iDisplayLength,
    iTotal: oSettings.fnRecordsTotal(),
    iFilteredTotal: oSettings.fnRecordsDisplay(),
    iPage: (oSettings._iDisplayLength === -1 ? 0 : Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength)),
    iTotalPages: (oSettings._iDisplayLength === -1 ? 0 : Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength))
  };
};

$.extend($.fn.dataTableExt.oPagination, {
  bootstrap: {
    fnInit: function(oSettings, nPaging, fnDraw) {
      var els, fnClickHandler, oLang;
      oLang = oSettings.oLanguage.oPaginate;
      fnClickHandler = function(e) {
        e.preventDefault();
        if (oSettings.oApi._fnPageChange(oSettings, e.data.action)) {
          return fnDraw(oSettings);
        }
      };
      $(nPaging).addClass("pagination").append("<ul class=\"pagination\">" + "<li class=\"prev disabled\"><a href=\"#\">&laquo;</a></li>" + "<li class=\"next disabled\"><a href=\"#\">&raquo;</a></li>" + "</ul>");
      els = $("a", nPaging);
      $(els[0]).bind("click.DT", {
        action: "previous"
      }, fnClickHandler);
      return $(els[1]).bind("click.DT", {
        action: "next"
      }, fnClickHandler);
    },
    fnUpdate: function(oSettings, fnDraw) {
      var an, i, iEnd, iHalf, iListLength, iStart, ien, j, oPaging, sClass, _results;
      iListLength = 5;
      oPaging = oSettings.oInstance.fnPagingInfo();
      an = oSettings.aanFeatures.p;
      i = void 0;
      ien = void 0;
      j = void 0;
      sClass = void 0;
      iStart = void 0;
      iEnd = void 0;
      iHalf = Math.floor(iListLength / 2);
      if (oPaging.iTotalPages < iListLength) {
        iStart = 1;
        iEnd = oPaging.iTotalPages;
      } else if (oPaging.iPage <= iHalf) {
        iStart = 1;
        iEnd = iListLength;
      } else if (oPaging.iPage >= (oPaging.iTotalPages - iHalf)) {
        iStart = oPaging.iTotalPages - iListLength + 1;
        iEnd = oPaging.iTotalPages;
      } else {
        iStart = oPaging.iPage - iHalf + 1;
        iEnd = iStart + iListLength - 1;
      }
      i = 0;
      ien = an.length;
      _results = [];
      while (i < ien) {
        $("li:gt(0)", an[i]).filter(":not(:last)").remove();
        j = iStart;
        while (j <= iEnd) {
          sClass = (j === oPaging.iPage + 1 ? "class=\"active\"" : "");
          $("<li " + sClass + "><a href=\"#\">" + j + "</a></li>").insertBefore($("li:last", an[i])[0]).bind("click", function(e) {
            e.preventDefault();
            oSettings._iDisplayStart = (parseInt($("a", this).text(), 10) - 1) * oPaging.iLength;
            return fnDraw(oSettings);
          });
          j++;
        }
        if (oPaging.iPage === 0) {
          $("li:first", an[i]).addClass("disabled");
        } else {
          $("li:first", an[i]).removeClass("disabled");
        }
        if (oPaging.iPage === oPaging.iTotalPages - 1 || oPaging.iTotalPages === 0) {
          $("li:last", an[i]).addClass("disabled");
        } else {
          $("li:last", an[i]).removeClass("disabled");
        }
        _results.push(i++);
      }
      return _results;
    }
  }
});

$.extend(jQuery.fn.dataTableExt.oSort, {
  "formatted-num-pre": function(a) {
    a = (a === "-" || a === "" ? 0 : a.replace(/[^\d\-\.]/g, ""));
    return parseFloat(a);
  },
  "formatted-num-asc": function(a, b) {
    return a - b;
  },
  "formatted-num-desc": function(a, b) {
    return b - a;
  }
});

$(document).ready(function() {
  var oTable;
  oTable = $("#contracts").dataTable({
    aoColumns: [
      null, null, null, null, null, {sType: "formatted-num"}, {sType: "formatted-num"}, {sType: "formatted-num"}
    ]
  });
  return oTable.fnSort([[0, "desc"]]);
});

