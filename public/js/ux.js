$(function() {
  $('[data-toggle="popover"]').popover({
    html: 'true',
    trigger: 'hover'
  });
});

$(document).ready(function() {

  var colorbrewerConfig = {
    palette: "PuBu",
    numberOfBands: 9
  };

  var fillKeys = [];
  var fills = {};
  for (var i = 0; i < colorbrewerConfig.numberOfBands; i++) {
    console.log("band " + i);
    console.log(colorbrewer[colorbrewerConfig.palette][colorbrewerConfig.numberOfBands][i]);
  }

  $('heatmap > div').append('<div class="map-leg"><div class="leg-less"><i class="fa fa-arrow-left"></i> Less Recalls</div><div class="leg-more">More Recalls <i class="fa fa-arrow-right"></i></div></div>');

});