var datas={};
    function unique(array){
        var uniqueNames = [];
        $.each(array, function(i, el){
            if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
        });
        return uniqueNames;
    }
    function avg(elmt){
        var sum = 0;
        for( var i = 0; i < elmt.length; i++ ){
            sum += parseInt( elmt[i], 10 ); //don't forget to add the base
        }

        return sum/elmt.length;
    }
        $.ajax({
            method: "GET",
            url: "https://erpdontdelete-mkb95.c9users.io/admin/viewScrapedResults/a",
            success: function(data){
                datas= data;
                
            var config1 ={
        data: {
            datasets: [{
                data: Object.values(datas.fails),
                backgroundColor: [
                    'rgb(135, 189, 226)',
                    'rgb(255, 207, 159)',
                    'rgb(165, 223, 223)',
                    'rgb(255, 99, 132)',
                    'rgb(255, 177, 193)',
                    'rgb(75, 192, 192)',
                    'rgb(255, 205, 86)'
                ],
                label: 'My dataset' // for legend
            }],
            labels: datas.sevenCode
        },
        options: {
            responsive: true,
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Fail\'s in 7th sem'
            },
            scale: {
              ticks: {
                beginAtZero: true
              },
              reverse: false
            },
            animation: {
                animateRotate: false,
                animateScale: true
            }
        }
    };
    var ctx = document.getElementById("polar").getContext("2d");
            window.myCombi = new Chart.PolarArea(ctx, config1);
            for(a in datas.sevenCode){
                datas.sevenCode[a]+= ', '+datas.sixCode[a];
            }
            var config2 ={
        type: 'radar',
        data: {
            labels: datas.sevenCode,
            datasets: [{
                label: "My First dataset",
                backgroundColor: 'rgba(255, 0, 0, 0.58)',
                borderColor: 'red',
                pointBackgroundColor: 'red',
                data: Object.values(datas.marks)
            },
            {
                label: "My Second dataset",
                backgroundColor: 'rgb(215, 236, 251)',
                borderColor: 'blue',
                pointBackgroundColor: 'blue',
                data: Object.values(datas.marks1)
            }
            ]
        },
        options: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Chart.js Radar Chart'
            },
            scale: {
              ticks: {
                beginAtZero: true
              }
            }
        }
    };

            var charData = {
                    labels: ["First","Second","Third","Fourth","Fifth","Sixth","Seventh","Eight"],
                    datasets: [{
                        type: 'line',
                        label: 'failed',
                        borderColor: 'blue',
                        borderWidth: 2,
                        fill: false,
                        data: datas.fail
                    },
                    {
                        type: 'bar',
                        // data: {
                            // datasets: [{
                        label: 'passes by semester',
                        data: datas.pass,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    },
                    {
                    type: 'bar',
                    label: 'to be announced',
                    backgroundColor: "green",
                    data: datas.laterA
                }]
            };
            var config ={
                type: 'bar',
                data: charData,
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Chart.js Combo Bar Line Chart'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: true
                    }
                }
            };
            var config0 = {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [
                        datas.Fail,
                        datas.Pass,
                        datas.later
                    ],
                     backgroundColor: [
                        'red',
                        'green',
                        'blue'
                    ],
                }],
                labels: [
                    "Fail",
                    "Pass",
                    "TO BE ANNOUNCED LATER"
                ]
            },
            options: {
                responsive: true
            }
        };
            var ctx = document.getElementById("donut").getContext("2d");
            window.myLine = new Chart(ctx, config0);
            var ctx = document.getElementById("radar").getContext("2d");
            window.myCombi = new Chart(ctx, config2);
            
            var ctx = document.getElementById("chart-bar").getContext("2d");
            window.myCombi = new Chart(ctx, config);
            
}
        });