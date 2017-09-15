
window.onload = function(){
    onLoad();
    onLoad2();
}

function onLoad2(){
    
    $('.progressLine').each(function(i) {
        var val = $(this).attr('value');
     var bar = new ProgressBar.Line(this, {
  strokeWidth: 1,
  stroke: '#aaa',
  easing: 'easeInOut',
  duration: 1400,
//   color: '#aaa',
  trailColor: '#eee',
  trailWidth: 1,
  svgStyle: {width: '100%', height: '100%',display:'block'},
  text: {
    style: {
      // Text color.
      // Default: same as stroke color (options.color)
      color: '#999',
      autoStyleContainer: true,
        value: (val*100)  +"pts",
        className: 'progressLineText',
        // margin :0,
        autoStyle: false
    },
    autoStyleContainer: false
  },
  from: {color: '#aaa'},
  to: {color: '#333'},
  step: (state, bar) => {
    bar.setText((val * 100) + ' pts');
  }
});

bar.animate(val, {
        from: {
            color: '#aaa'
        },
        to: {
            color: '#333'
        }
    });  // Number from 0.0 to 1.0
});
}

function onLoad() {
    // var ProgressBar = require('progressbar.js');
    $('.progressLeader').each(function(i) {
        var val = $(this).attr('value');
    var circle = new ProgressBar.Circle(this, {
        // color: '#FCB03C',
        duration: 1200,
        strokeWidth: 10,
        trailWidth: 10,
        svgStyle: {display:'inline'},
        from: { color: '#aaa', width: 1 },
        to: { color: '#333', width: 4 },
        text: {
            autoStyleContainer: true,
            value: (val * 100) +"XP",
            className: 'progressbarText',
            autoStyle: false
        
          },
        easing: 'easeInOut'
    });
    
    circle.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
    circle.text.style.fontSize = '17px';
    circle.animate(val, {
        from: {
            color: '#aaa'
        },
        to: {
            color: '#333'
        }
    });
    
   
    });
    
};