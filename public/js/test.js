(function() {
  function beep() {
          var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
          snd.play();
        }
  var timelimit = 40;
  var Score={},GTypes=[];
  var questions = [];
  var stoppedTimer=false,blurCheck=false,blurOn=false;
  var questionCounter = 0,subindex=0; //Tracks question number
  var selections = [],selectionsSub={}; //Array containing user choices
  var quiz = $('#quiz'); //Quiz div object
  $.ajax({
    method: "GET",
    url: "/test/questions",
    success: function(data){
      console.log(data);
        questions=data.questions;
        questions = shuffle(questions);
        for(i=0;i<data.context.length;i++){
          questions.push(data.context[i]);
          selectionsSub[data.context[i].type]=[];
        }
        var tempTypes=[];
        for(i=0;i<questions.length;i++)
          tempTypes.push(questions[i].type);
        $.unique(tempTypes);
        questions = category(questions,tempTypes);
        timer();
        NavButtonCreate(tempTypes);
        displayNext();
    }
  });

  function category(array,tempTypes){
    var typeSort = {};
    $.unique(tempTypes);
        // console.log(tempTypes);
        GTypes=tempTypes;
//  console.log(tempTypes);
    for(i in tempTypes){
      typeSort[tempTypes[i]]=[];
    }
    for(j in tempTypes){
      for(i=0;i<array.length;i++){
        if(tempTypes[j]===array[i].type){
          typeSort[tempTypes[j]].push(array[i]); 
        }
      }
    }
    for(i in tempTypes)
      typeSort[tempTypes[i]]=shuffle(typeSort[tempTypes[i]]);
      var arr=[];
    for(i in tempTypes){
      arr=arr.concat(typeSort[tempTypes[i]]);
    }
      return arr;
  }
  function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
  
  
  function NavButtonCreate(tempTypes){
    for(i=1;i<=questions.length;i++){
      for(j in tempTypes){
        if(questions[i-1].type==tempTypes[j]){
          $('.buttonContainer').append("<button class='numberButton questionType"+j+"'>"+i+"</button>");    
        }
        if(i==1)
        $('#legend').append('<div><span class ="label questionType'+j+'"></span><span>'+tempTypes[j]+'</span><div>' );
      }
        
    }   
    $('#legend').append('<div><span class ="label marked"></span><span>Attempted Question</span><div>' );
    
    te = $('.buttonContainer').height()+ 100;
    $('#legend').css({'top':te});
    $('.numberButton').on('click',function(){
            gotopage($(this).html());
          });
  }
  
    
  // Display initial question
//   displayNext();
  
  // Click handler for the 'next' button
  $('#submitTest').on('click',function(){
    check = confirm("do you want to submit your answers?");
    if(check)
      submitTest();
      else
        blurOn = true;
  });
  
  $('#next').on('click', function (e) {
    e.preventDefault();
    
    // Suspend click listener during fade animation
    if(quiz.is(':animated')) {        
      return false;
    }
    choose();
    
    // If no user selection, progress is stopped
    if(questions[questionCounter].context && selectionsSub[questions[questionCounter].type][subindex])
      selections[questionCounter]= +'0';
    questionCounter++;
    subindex=0;
    displayNext();
    $('#container').css({"padding":"0 25px calc(70% - "+$("ul li label").height()+") 10px"});


  });




  $('#nextSub').on('click', function (e) {
    e.preventDefault();
    
    // Suspend click listener during fade animation
    if(quiz.is(':animated')) {        
      return false;
    }
    choose();
      subindex++;
      displayNext();
      $('#container').css({"padding":"0 25px calc(70% - "+$("ul li label").height()+") 10px"});
  });
  $('#prevSub').on('click', function (e) {
    e.preventDefault();
    
    // Suspend click listener during fade animation
    if(quiz.is(':animated')) {        
      return false;
    }
    choose();
      subindex--;
      displayNext();
      $('#container').css({"padding":"0 25px calc(70% - "+$("ul li label").height()+") 10px"});
  });




  
  // Click handler for the 'prev' button
  $('#prev').on('click', function (e) {
    e.preventDefault();
    
    if(quiz.is(':animated')) {
      return false;
    }
    choose();
    
    if(questions[questionCounter].context && selectionsSub[questions[questionCounter].type][subindex])
      selections[questionCounter]= +'0';
    questionCounter--;
    subindex=0;
    displayNext();
  });
  
  // Animates buttons on hover
  $('.button').on('mouseenter', function () {
    $(this).addClass('active');
  });
  $('.button').on('mouseleave', function () {
    $(this).removeClass('active');
  });
  function subFn(){
    var str="";
    for(i=1;i<=questions[questionCounter].questions.length;i++){
      str+="<button class='subButtons'>"+i+"</button>";
    }
    $('.subButton').html(str);
      $('.subButtons').on('click',function(){
        gotopageSub($(this).html());
      });
  }
  function gotopageSub(sub){
      choose();
      // if(questions[questionCounter].context && selectionsSub[questions[questionCounter].type][subindex])
      // selections[questionCounter]= +'0';
      subindex = sub-1;
      displayNext();
  }
  // Creates and returns the div that contains the questions and 
  // the answer selections
  function createQuestionElement(index,subindex) {
    var qElement = $('<div>', {
      id: 'question'
    });
    var header = $('<h2>Question ' + (index + 1) + ': <span style="float:right">marks:'+questions[index].marks+'</span></h2>');
      qElement.append(header);
    if(!questions[index].context){
      
      if(/<img/.test(questions[index].question))
        $('#container').css({"padding":"0 25px calc(70% - "+$("ul li label").height()+") 10px"});
      var question = $('<p>').append(questions[index].question);
      qElement.append(question);
      var radioButtons = createRadios(index);
      qElement.append(radioButtons);
      $('#subNav').hide();
      return qElement;
    }else{
      $('#subNav').show();
      subFn();
      qElement.append("<h3>Context:</h3>");
      qElement.append("'"+questions[index].context+"'");
      qElement.append("<h3> Question  "+(index + 1)+"."+parseInt(subindex+1)+":</h3>");
      console.log(subindex);
      var question = $('<p>').append(questions[index].questions[subindex].question);
      qElement.append(question);
      var radioButtons = createRadiosSub(index,subindex);
      qElement.append(radioButtons);
      return qElement;
    }
    
  }

  function createRadiosSub(index,subindex) {
    var radioList = $('<ul>');
    var item;
    var input = '';
    for (var i = 0; i < questions[index].questions[subindex].choices.length; i++) {
      item = $('<li>');
      input = '<input type="radio" name="answer" value=' + i + ' id="for'+i+'"  />';
      input += "<label for='for"+i+"' >"+questions[index].questions[subindex].choices[i]+"</label> <div class='check'></div>";
      item.append(input);
      radioList.append(item);
      $('#container').css({"padding":"0 25px calc(70% - "+$("ul li label").height()+") 10px"});
    }
    return radioList;

  }

  
  // Creates a list of the answer choices as radio inputs
  function createRadios(index) {
    var radioList = $('<ul>');
    var item;
    var input = '';
    for (var i = 0; i < questions[index].choices.length; i++) {
      item = $('<li>');
      input = '<input type="radio" name="answer" value=' + i + ' id="for'+i+'"  />';
      input += "<label for='for"+i+"' >"+questions[index].choices[i]+"</label> <div class='check'></div>";
      item.append(input);
      radioList.append(item);
      $('#container').css({"padding":"0 25px calc(70% - "+$("ul li label").height()+") 10px"});
      if(questions[index].choices[i].length>20){
        if($('#demo').css('text-align')=='center'){
          $('#container').css({"padding":"0 25px 200% 10px"});
        }
        else
          $('#container').css({"padding":"0 25px 50% 10px"});
        
      }
    }
    return radioList;

  }
  
  // Reads the user selection and pushes the value to an array
  function choose() {
    if(questions[questionCounter].context)
      selectionsSub[questions[questionCounter].type][subindex] = +$('input[name="answer"]:checked').val();
    else 
      selections[questionCounter] = +$('input[name="answer"]:checked').val();
  }
  
  // Displays next requested element
  // $('.buttonContainer').children().remove();
  function displayNext() {
    $('.current').removeClass('current');
    var st = $('.buttonContainer button').siblings();
    for(i=0;i<st.length;i++){
      if(questionCounter== st[i].innerHTML-1){
        $(st[i]).addClass('current');
      }
      if (!(isNaN(selections[i]))) 
        $(st[i]).addClass('marked');
    }

    
    


    quiz.fadeOut(function() {
      $('#question').remove();
      
      if(questionCounter < questions.length){
        if(questions[questionCounter].context){
          if(subindex<questions[questionCounter].questions.length){
            var nextQuestion = createQuestionElement(questionCounter,subindex);
            $('.active').removeClass('active');
            var stSub = $('.subButtons');
            console.log(stSub);
            for(i=0;i<stSub.length;i++){
              if(subindex== stSub[i].innerHTML-1){
                $(stSub[i]).addClass('active');
              }
              if (!(isNaN(selectionsSub[questions[questionCounter].type][i]))) 
                $(stSub[i]).addClass('marked');
            }
            quiz.append(nextQuestion).fadeIn();
            console.log(selectionsSub[questions[questionCounter].type][subindex]);
            if (!(isNaN(selectionsSub[questions[questionCounter].type][subindex])))
              $('input[value='+selectionsSub[questions[questionCounter].type][subindex]+']').prop('checked', true);
            

            if(subindex>=1){
              $('#prevSub').show();
              $('#nextSub').show();
            } else if(subindex === 0){
              
              $('#prevSub').hide();
              $('#nextSub').show();
            }
            if(subindex==questions[questionCounter].questions.length-1)
              $('#nextSub').hide();
          }
        }else{
          var nextQuestion = createQuestionElement(questionCounter,subindex);
          subindex=0;
        }
          
          quiz.append(nextQuestion).fadeIn();
          if (!(isNaN(selections[questionCounter]))) {
            $('input[value='+selections[questionCounter]+']').prop('checked', true);
          }
          // Controls display of 'prev' button
          if(questionCounter>=1){
            $('#prev').show();
            $('#next').show();
          } else if(questionCounter === 0){
            
            $('#prev').hide();
            $('#next').show();
          }
          if(questionCounter == questions.length-1){
            $('#next').hide();
          }
        
      }else {
        var scoreElem = displayScore();
        quiz.append(scoreElem).fadeIn();
        $('#next').hide();
        $('#prev').hide();
        $('#start').show();
      }
    });
    // if($("ul li label").height()>0)
          // $('#container').css({"padding":"0 25px 70% 10px"});
        // else
          $('#container').css({"padding":"0 25px calc(200% - "+$("ul li label").height()+") 10px"});
  }
  function submitTest(){
    choose();
    stoppedTimer=true,blurCheck=true;;
    var scoreElem = displayScore();
    quiz.append(scoreElem).fadeIn();
    $('#question').remove();
    $('#prev').hide();
    $('#next').hide();
    $('#demo').hide();
    $('.subButton').hide();
    $('#submitTest').hide();
    $('.buttonContainer').hide();
    $('#container').css({"padding":"0 25px 10% 10px"});
    getAnalysis();
    alert("test Submiting...");
  }
  // Computes score and returns a paragraph element to be displayed
      
  function displayScore() {
    var score = $('<p>',{id: 'question'});
    var marks=0,markScored=0;
    var numCorrect = 0;
    var Types=GTypes;
    var typeCorrect={},typeCount={};
    var typeCorrectArray=[],typeCountArray=[];
    for(i in questions){
        // Types.push(questions[i].type);
        marks+= parseInt(questions[i].marks);
    }
    console.log(Types);
    for(i in Types){
        typeCorrect[Types[i]]=0;
        typeCount[Types[i]]=0;
    }
    for(i in questions)
        for(j in Types)
            if(Types[j] == questions[i].type)
                typeCount[Types[j]]++;  


    for (var i = 0; i < selections.length; i++) {
      if(!questions[i].context){
        if (questions[i].choices[selections[i]] == questions[i].correctAnswer) {
          numCorrect++;
          // check context
          markScored+=parseInt(questions[i].marks);
          for(j in Types){
              if(Types[j]==questions[i].type)
                  typeCorrect[Types[j]]++;   
              
          }
        }
      }else if(questions[i].questions.length>0){
        var subMarks=0;
        if(selectionsSub[questions[i].type])
          for( k=0;k< selectionsSub[questions[i].type].length;k++){
            var selected =selectionsSub[questions[i].type][k];
            if(questions[i].questions[k].choices[selected]==questions[i].questions[k].correctAnswer){
              subMarks+=parseInt(questions[i].questions[k].marks);
            }
          }
          console.log(subMarks);
        if(subMarks>0){
          numCorrect++;
          markScored+=subMarks;
          for(j in Types){
              if(Types[j]==questions[i].type)
                  typeCorrect[Types[j]]++;   
            }
        }
      }
    }

    score.append('You got ' + numCorrect + ' questions out of ' +
                 questions.length + ' right!!!');
    str = "<div>You got:<br>";
    
    for(i in Types){
        typeCountArray.push(typeCount[Types[i]]);
        typeCorrectArray.push(typeCorrect[Types[i]]);
        str+=typeCorrect[Types[i]]+" out of "+typeCount[Types[i]]+" in "+Types[i]+" questions <br>";
     str+="</div>";
    }
     score.append(str);
     score.append("<br> You got a Total Score of :"+markScored+"/"+marks);
     
     Score={
         marks : markScored,
         typeCount:typeCountArray,
         typeCorrect:typeCorrectArray,
         types:Types
     };
    return score;
  }
  function getAnalysis(){
      console.log(Score);
      $.ajax({
        method: "POST",
        url: "/test/getAnalysis",
        data: Score,
        success: function(data){
            if(data=='rendered')
              alert("the test has been submitted once before.");
              else
            $('body').append(data);
        }
      });
  }
  function gotopage(num){
      choose();
      subindex=0;
      if(questions[questionCounter].context && selectionsSub[questions[questionCounter].type][subindex])
      selections[questionCounter]= +'0';
      questionCounter = num-1;
      displayNext();
  }

function timer(){
  var d1 = new Date (),
      d2 = new Date ( d1 );
  d2.setMinutes ( d1.getMinutes() + timelimit);
  var countDownDate = new Date(d2).getTime();

  // Update the count down every 1 second
  var x = setInterval(function() {

      // Get todays date and time
      var now = new Date().getTime();
      
      // Find the distance between now an the count down date
      var distance = countDownDate - now;
      
      // Time calculations for days, hours, minutes and seconds
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Output the result in an element with id="demo"
      document.getElementById("demo").innerHTML = hours + "h "
      + minutes + "m " + seconds + "s ";
      
      // If the count down is over, write some text 
      if (distance < 0) {
          clearInterval(x);
          document.getElementById("demo").innerHTML = "EXPIRED";
          
          if(!stoppedTimer){
               submitTest();
          }
      }
      if(minutes == Math.floor(timelimit-timelimit/3))
        $("#demo").css({"background":"orange"});
      if(minutes == Math.floor(timelimit/3))
        $("#demo").css({"background":"red"});
      if(hours==0 && minutes== 0 && seconds < 40){
        if(seconds%2==0)
          $('#container').css({"border-color":"red"});
        else
          $('#container').css({"border-color":"orange"});
      }
  }, 1000);

}

window.onresize = function()
{
    if ((window.outerHeight - window.innerHeight) > 100)
        alert('Docked inspector was opened forced submit');
        var i=0;
        var be = setInterval(function() {
          i++;
          beep();
          beep();
          if(i>5){
            clearInterval(be);
            submitTest();
          }
        }, 1000);
}
$(window).focus(function(ele) {
            //do something
            blurOn=false;
            
        });
        $(window).blur(function() {
            //do something
            console.log("blur");
            beep();
             
            if(!blurCheck && !blurOn)
              alert("the next time you change your active window the test will auto submit.");
              submitTest();
        });








})();