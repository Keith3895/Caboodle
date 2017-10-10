function AllDepartmentPassVsFail(dataE){
	    var allLabels = Object.keys(dataE.passDept);
	    var passVal=[],failVal=[];
        for(i in allLabels){
            passVal.push(dataE.passDept[allLabels[i]]);
            failVal.push(dataE.failDept[allLabels[i]]);
        }
         
        var ultimateColors = ['rgba(93, 164, 214, 0.5)', 'rgba(255, 144, 14, 0.5)', 'rgba(44, 160, 101, 0.5)', 'rgba(255, 65, 54, 0.5)', 'rgba(207, 114, 255, 0.5)', 'rgba(127, 96, 0, 0.5)', 'rgba(255, 140, 184, 0.5)', 'rgba(79, 90, 117, 0.5)', 'rgba(222, 223, 0, 0.5)'];
        
        var data = [{
          values: passVal,
          labels: allLabels,
          title:"Pass",
          type: 'pie',
          name: 'Pass',
          marker: {
            colors: ultimateColors
          },
          domain: {
            x: [0, .8],
            y: [0, .99]
          },
          text:['pass','pass','pass','pass','pass','pass'],
          hoverinfo: 'label+percent+name',
          textinfo: 'percent+text'
        },{
          values: failVal,
          labels: allLabels,
          type: 'pie',
          name: 'Fails',
          marker: {
            colors: ultimateColors
          },
          domain: {
            x: [0.8, 1],
            y: [0, .99]
          },
          hoverinfo: 'label+percent+name',
          textinfo: 'label'
        }];
        
        var layout = {
            showlegend: true,
            title: 'Pass & Fail in each Department'
            };
        
        Plotly.newPlot('AllDepartmentPassVsFail', data, layout);
	}
    function AllSemResults(dataE){
        var xValue = Object.keys(dataE.pass);
            
            var yValue = [];
            var yValue2 = [];
            for(i in xValue){
                
                yValue.push(dataE.fail[xValue[i]]);
                yValue2.push(dataE.pass[xValue[i]]);
            }
            
            
            var Fail = {
              x: xValue,
              y: yValue,
              type: 'bar',
              text: yValue,
              textposition: 'auto',
              hoverinfo: 'none',
              opacity: 0.5,
              name:"Fails",
              marker: {
                color: 'rgb(255,2,25,.5)',
                line: {
                  color: 'rbg(255,48,255)',
                  width: 1.5
                }
              }
            };
            
            var Pass = {
              x: xValue,
              y: yValue2,
              type: 'bar',
              text: yValue2,
              name:'Pass',
              textposition: 'auto',
              hoverinfo: 'none',
              marker: {
                color: 'rgba(58,200,225,.5)',
                line: {
                  color: 'rbg(8,48,107)',
                  width: 1.5
                }
              }
            };
            
            var data = [Fail,Pass];
            
            var layout = {
              title: 'Pass Vs Fail ',
              xaxis:{
              	title: 'Semesters',
                titlefont: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f'
                }
              },
              yaxis:{
              	title: 'Number Of students',
                titlefont: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f'
                }
            
              }
            };
            
            Plotly.newPlot('AllSemResults', data, layout);
    }	
    function SemestersPassVsFail(dataE){
        var xValue = Object.keys(dataE.pass);
            
            var yValue = [];
            var yValue2 = [];
            for(i in xValue){
                yValue.push(dataE.fail[xValue[i]]);
                yValue2.push(dataE.pass[xValue[i]]);
            }
            
            
            var Fail = {
              x: xValue,
              y: yValue,
              type: 'bar',
              text: yValue,
              textposition: 'auto',
              hoverinfo: 'none',
              opacity: 0.5,
              name:"Fails",
              marker: {
                color: 'rgb(255,2,25)',
                line: {
                  color: 'rbg(255,48,7)',
                  width: 1.5
                }
              }
            };
            
            var Pass = {
              x: xValue,
              y: yValue2,
              type: 'bar',
              text: yValue2,
              name:'Pass',
              textposition: 'auto',
              hoverinfo: 'none',
              marker: {
                color: 'rgba(58,200,225,.5)',
                line: {
                  color: 'rbg(8,48,107)',
                  width: 1.5
                }
              }
            };
            
            var data = [Fail,Pass];
            
            var layout = {
              title: 'Pass Vs Fail In ME',
              xaxis:{
              	title: 'Semesters',
                titlefont: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f'
                }
              },
              yaxis:{
              	title: 'Number Of students',
                titlefont: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f'
                }
            
              }
            };
            
            Plotly.newPlot('SemestersPassVsFail', data, layout);
    }
    function BoxPlot(dataE){
        var xData = Object.keys(dataE.subjectsMarks);
        // var yData = [];
        console.log(xData);
        var colors = ['rgba(93, 164, 214, 0.5)', 'rgba(255, 144, 14, 0.5)', 'rgba(44, 160, 101, 0.5)', 'rgba(255, 65, 54, 0.5)', 'rgba(207, 114, 255, 0.5)', 'rgba(127, 96, 0, 0.5)', 'rgba(255, 140, 184, 0.5)', 'rgba(79, 90, 117, 0.5)', 'rgba(222, 223, 0, 0.5)'];
        
        var data = [];
        
        for ( var i = 0; i < xData.length; i ++ ) {
            // console.log(dataE.subjectsMarks[xData[i]]);
          var result = {
            type: 'box',
            y: dataE.subjectsMarks[xData[i]],
            name: xData[i],
            boxpoints: 'outliers',
            jitter: 0.5,
            whiskerwidth: 0.2,
            fillcolor: 'cls',
            marker: {
              size: 2
            },
            line: {
              width: 1
            }
          };
          data.push(result);
        };
        
        layout = {
            title: 'Marks Scored In External for 6th semester',
            yaxis: {
                autorange: true,
                showgrid: true,
                zeroline: true,
                dtick: 5,
                gridcolor: 'rgb(255, 255, 255)',
                gridwidth: 1,
                zerolinecolor: 'rgb(255, 255, 255)',
                zerolinewidth: 2
            },
            margin: {
                l: 40,
                r: 30,
                b: 80,
                t: 100
            },
            paper_bgcolor: 'rgb(243, 243, 243)',
            plot_bgcolor: 'rgb(243, 243, 243)',
            showlegend: false
        };
        
        Plotly.newPlot('BoxPlot', data, layout);
    }
    function DeptResultType(dataE){
        var x=0,y=.20;
        
      var data = [],anot=[];
      
        for(main in dataE){
            
            var labels = Object.keys(dataE[main]);
            var vals=[];
            for(i in labels){
                vals.push(dataE[main][labels[i]]);
            }
            dats={
                values: vals,
                labels: labels,
                name: main,
                domain: {
                  x: [x, y]
                },
                hoverinfo: 'label+percent+name',
                hole: .4,
                type: 'pie',
                textinfo:'none'
              };
             data.push(dats);
             anot.push(
                {
                  font: {
                    size: 14
                  },
                  showarrow: false,
                  text: main,
                  x: x+.12/2,
                  y: .5
                }
              );
             x=y+.01;y+=.12;
        }   
        console.log(data);
      var layout = {
        title: 'All Department results',
        annotations: anot
      };
      
      Plotly.newPlot('DeptResultType', data, layout);
    }