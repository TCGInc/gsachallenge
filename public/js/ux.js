$(function() {
  $('[data-toggle="popover"]').popover({
    html: 'true',
    trigger: 'hover'
  });
});

$('body').tooltip({
  selector: '.prod-type'
});

$(document).ready(function() {
  $('heatmap > div').append('<div class="map-leg"><div class="leg-less"><i class="fa fa-arrow-left"></i> Fewer Recalls</div><div class="leg-more">More Recalls <i class="fa fa-arrow-right"></i></div></div>');
  setInterval(function () {
    $('iframe').attr('title', 'ShareThis');
  }, 500);
});

window.addEventListener("orientationchange", function() {
  $('#DataTables_Table_0').DataTable().ajax.reload();
}, false);

$(document).on('click', '.btn-coll', function() {
  $(this).addClass('btn-hide');
});

$(document).on('click', '#states option', function() {
  var stateName = $(this).val();
  ga('send', 'event', 'State (Form)', 'Filter', stateName);
});

$(document).on('click', '#DataTables_Table_0 th:not(.sorting_disabled)', function() {
  var colName = $(this).html();
  ga('send', 'event', 'DataTable', 'Sort', colName);
});

$(document).on('click', '.paginate_button:not(.disabled) a', function() {
  var btnName = $(this).html();
  ga('send', 'event', 'DataTable', 'Page', btnName);
});


function convert_state(name, to) {
    var name = name.toUpperCase();
    var states = new Array({
      'name': 'Alabama',
      'abbrev': 'AL'
    }, {
      'name': 'Alaska',
      'abbrev': 'AK'
    }, {
      'name': 'Arizona',
      'abbrev': 'AZ'
    }, {
      'name': 'Arkansas',
      'abbrev': 'AR'
    }, {
      'name': 'California',
      'abbrev': 'CA'
    }, {
      'name': 'Colorado',
      'abbrev': 'CO'
    }, {
      'name': 'Connecticut',
      'abbrev': 'CT'
    }, {
      'name': 'Delaware',
      'abbrev': 'DE'
    }, {
      'name': 'Florida',
      'abbrev': 'FL'
    }, {
      'name': 'Georgia',
      'abbrev': 'GA'
    }, {
      'name': 'Hawaii',
      'abbrev': 'HI'
    }, {
      'name': 'Idaho',
      'abbrev': 'ID'
    }, {
      'name': 'Illinois',
      'abbrev': 'IL'
    }, {
      'name': 'Indiana',
      'abbrev': 'IN'
    }, {
      'name': 'Iowa',
      'abbrev': 'IA'
    }, {
      'name': 'Kansas',
      'abbrev': 'KS'
    }, {
      'name': 'Kentucky',
      'abbrev': 'KY'
    }, {
      'name': 'Louisiana',
      'abbrev': 'LA'
    }, {
      'name': 'Maine',
      'abbrev': 'ME'
    }, {
      'name': 'Maryland',
      'abbrev': 'MD'
    }, {
      'name': 'Massachusetts',
      'abbrev': 'MA'
    }, {
      'name': 'Michigan',
      'abbrev': 'MI'
    }, {
      'name': 'Minnesota',
      'abbrev': 'MN'
    }, {
      'name': 'Mississippi',
      'abbrev': 'MS'
    }, {
      'name': 'Missouri',
      'abbrev': 'MO'
    }, {
      'name': 'Montana',
      'abbrev': 'MT'
    }, {
      'name': 'Nebraska',
      'abbrev': 'NE'
    }, {
      'name': 'Nevada',
      'abbrev': 'NV'
    }, {
      'name': 'New Hampshire',
      'abbrev': 'NH'
    }, {
      'name': 'New Jersey',
      'abbrev': 'NJ'
    }, {
      'name': 'New Mexico',
      'abbrev': 'NM'
    }, {
      'name': 'New York',
      'abbrev': 'NY'
    }, {
      'name': 'North Carolina',
      'abbrev': 'NC'
    }, {
      'name': 'North Dakota',
      'abbrev': 'ND'
    }, {
      'name': 'Ohio',
      'abbrev': 'OH'
    }, {
      'name': 'Oklahoma',
      'abbrev': 'OK'
    }, {
      'name': 'Oregon',
      'abbrev': 'OR'
    }, {
      'name': 'Pennsylvania',
      'abbrev': 'PA'
    }, {
      'name': 'Rhode Island',
      'abbrev': 'RI'
    }, {
      'name': 'South Carolina',
      'abbrev': 'SC'
    }, {
      'name': 'South Dakota',
      'abbrev': 'SD'
    }, {
      'name': 'Tennessee',
      'abbrev': 'TN'
    }, {
      'name': 'Texas',
      'abbrev': 'TX'
    }, {
      'name': 'Utah',
      'abbrev': 'UT'
    }, {
      'name': 'Vermont',
      'abbrev': 'VT'
    }, {
      'name': 'Virginia',
      'abbrev': 'VA'
    }, {
      'name': 'Washington',
      'abbrev': 'WA'
    }, {
      'name': 'West Virginia',
      'abbrev': 'WV'
    }, {
      'name': 'Wisconsin',
      'abbrev': 'WI'
    }, {
      'name': 'Wyoming',
      'abbrev': 'WY'
    });
    var returnthis = false;
    $.each(states, function(index, value){
        if (to == 'name') {
            if (value.abbrev == name){
                returnthis = value.name;
                return false;
            }
        } else if (to == 'abbrev') {
            if (value.name.toUpperCase() == name){
                returnthis = value.abbrev;
                return false;
            }
        }
    });
    return returnthis;
}



angular.module("template/datepicker/day.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/day.html",
    "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <td><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></td>\n" +
    "      <td colspan=\"{{5 + showWeeks}}\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></td>\n" +
    "      <td><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></td>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "      <td ng-show=\"showWeeks\" class=\"text-center\"></td>\n" +
    "      <th ng-repeat=\"label in labels track by $index\" class=\"text-center\"><small aria-label=\"{{label.full}}\">{{label.abbr}}</small></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-show=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
    "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\" ng-class=\"dt.customClass\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-muted': dt.secondary, 'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);