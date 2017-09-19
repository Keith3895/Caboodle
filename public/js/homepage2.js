
  var options = [
      {selector: '#pageDisc', offset: 0, callback: function(el) {
        $('#pageDisc').addClass('slideInLeft');
        var int = window.setInterval(function() {
          Materialize.showStaggeredList('.pageDisc');
          clearInterval(int);
        },1000);
        
      } },
      {selector: '#loginCard', offset: 0, callback: function(el) {
        $('#loginCard').addClass('slideInRight');
      } },
      {selector: '#placementDisc', offset: 300, callback: function(el) {
        $('#placementDisc').addClass('slideInRight');
        var int = window.setInterval(function() {
          Materialize.showStaggeredList('.placementDisc ul');
          clearInterval(int);
        },1000);
      } },
      {selector: '#placmentCard', offset: 300, callback: function(el) {
        $('#placmentCard').addClass('slideInLeft');
      } },
      {selector: '#leaderCard', offset: 300, callback: function(el) {
        $('#leaderCard').addClass('slideInRight');
        var int = window.setInterval(function() {
          		  var elem = document.getElementById('leaderCard');
          		  elem.scrollTop = 0;
          		  $(elem).animate({ scrollTop: elem.scrollHeight }, 4000);
          		}, 5000);
        $('#leaderCard').hover(function(){
          clearInterval(int);
        });
      } },
      {selector: '#leaderDisc', offset: 300, callback: function(el) {
        $('#leaderDisc').addClass('slideInLeft');
        var int = window.setInterval(function() {
          Materialize.showStaggeredList('.leaderDisc ul');
          clearInterval(int);
        },1000);
      } },
      {selector: '#vtuDisc', offset: 150, callback: function(el) {
        $('#vtuDisc').addClass('fadeIn');
        // Materialize.fadeInImage('#vtuDisc')
      } },
      {selector: '#search', offset: 200, callback: function(el) {
        $('#search').addClass('zoomInUp');
      } }
    ];
    
    try{
      $.ajax({
          method: "GET",
          url: "/listOfdrives/home",
          // data: Score,
          success: function(company){
              for(i in company){
              // i=0;
                var str = /*'<div class="col s12 m6">'
                          +*/'        <div class="card d3 teal darken-4  z-depth-3 animated">'
                          +'            <div class="card-content white-text">'
                          +'                <span class="card-title">'
                          +'                    <i class="fa fa-building" aria-hidden="true" style="font-size: .7em"></i>'
                          +'                    '+company[i].cName
                          +'                </span>'
                          +'                <span class="date">'
                          +'                    <i class="fa fa-calendar-o" aria-hidden="true" style="font-size: .7em"></i>'
                          +'                    '
                          +'                    <span>'
                          +'                        '+ company[i].date +'</span>'
                          +'                </span>'
                          +'                <p class="divider"></p>'
                          +'                <div class="details">'
                          +'                    <p>'
                          +'                        <i class="fa fa-money" aria-hidden="true"></i> '
                          +'                        Package  : '+ company[i].Package 
                          +'                    </p>'
                          +'                    <p>'
                          +'                        <i class="fa fa-map-marker" aria-hidden="true" style="margin-right: 7px;"></i> '
                          +'                        Location  : '+ company[i].jobLocation 
                          +'                    </p>'
                          +'                    <p>'
                          +'                        <i class="fa fa-compass" aria-hidden="true"></i> '
                          +'                        Drive-location : '+ company[i].driveLocation 
                          +'                    </p>'
                          +'                    <p>'
                          +'                        <i class="fa fa-cogs" aria-hidden="true"></i>'
                          +'                        Skills : '+ company[i].skills 
                          +'                    </p>'
                          +'                    <p>'
                          +'                        <i class="fa fa-wrench" aria-hidden="true"></i>'
                          +'                        Dept :  '+ company[i].department
                          +'                    </p>'
                          +'                </div>'
                          +'            </div>'
                          +'            <div class="card-action">'
                          +'                <a href="/student/registerPlacement/'+ company[i]._id +'" >Register</a>'
                          +'            </div>'
                          +'        </div>'
                          /*+'    </div>'*/;
                          
                          $('#PlacementsCardHolder').append(str);
              }
              var cardsArr=$('#PlacementsCardHolder').children();
              
              for(i=0;i<cardsArr.length;i++){
              	$(cardsArr[i]).addClass('fadeOutRight');
              }
              
              var i=0,j=1;
              $(cardsArr[i]).removeClass('fadeInLeft');
              $(cardsArr[j]).addClass('fadeInLeft');
              var be = setInterval(function() {
              	$(cardsArr[i]).addClass('fadeOutRight');
              	$(cardsArr[i]).removeClass('fadeInLeft');
              	$(cardsArr[j]).addClass('fadeInLeft');
              	$(cardsArr[j]).removeClass('fadeOutRight');
              	temp = i;
              	i=j;
              	j=temp;
              },5000);
          }
        });
    }catch(e){
      console.log('some error occured');
    }
    try{
      $.ajax({
          method: "GET",
          url: "/leader/overall",
          // data: Score,
          success: function(data){
              // console.log(data);
              $('#leaderCard').append(data);
              
              // onLoad();
              onLoad2();
              $('.leaderCard').remove();
              $("table").find("tr:gt(5)").remove();
          }
      });
    }catch(e){
      console.log('some error occured');
    }

    