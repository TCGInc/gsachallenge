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
