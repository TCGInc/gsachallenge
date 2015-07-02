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
