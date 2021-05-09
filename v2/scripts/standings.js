$(document).ready(function () { 

    // FETCHING DATA FROM JSON FILE GROUP A
    var jsonURL = "data/lfl-standings-a.json";

    $.getJSON(jsonURL, function (data) { 
        var team = ''; 

        // ITERATING THROUGH OBJECTS 
        $.each(data, function (key, value) { 

            //CONSTRUCTION OF ROWS HAVING 
            // DATA FROM JSON OBJECT 
            team += '<tr>'; 
            team += '<td class="position">' + value.Position + '</td>'; 
            team += '<td class="team">' + value.Team + '</td>';
            team += '<td class="played">' + value.Played + '</td>';
            team += '<td class="won"> ' + value.Won + '</td>'; 
            team += '<td class="draw">' + value.Drawn + '</td>';
            team += '<td class="lost">' + value.Lost + '</td>';
            team += '<td class="goal-f">' + value.GF + '</td>';
            team += '<td class="goal-a">' + value.GA + '</td>';
            team += '<td class="goal-d">' + value.GD + '</td>';
            team += '<td class="points">' + value.Points + '</td>';
            team += '</tr>'; 
        }); 
        
        //INSERTING ROWS INTO TABLE 
        $('#table-standings-a').append(team); 
    });
    
    // FETCHING DATA FROM JSON FILE GROUP B
    var jsonURL = "data/lfl-standings-b.json";

    $.getJSON(jsonURL, function (data) { 
        var team = ''; 

        // ITERATING THROUGH OBJECTS 
        $.each(data, function (key, value) { 

            //CONSTRUCTION OF ROWS HAVING 
            // DATA FROM JSON OBJECT 
            team += '<tr>'; 
            team += '<td class="position">' + value.Position + '</td>'; 
            team += '<td class="team">' + value.Team + '</td>';
            team += '<td class="played">' + value.Played + '</td>';
            team += '<td class="won"> ' + value.Won + '</td>'; 
            team += '<td class="draw">' + value.Drawn + '</td>';
            team += '<td class="lost">' + value.Lost + '</td>';
            team += '<td class="goal-f">' + value.GF + '</td>';
            team += '<td class="goal-a">' + value.GA + '</td>';
            team += '<td class="goal-d">' + value.GD + '</td>';
            team += '<td class="points">' + value.Points + '</td>';
            team += '</tr>'; 
        }); 
        
        //INSERTING ROWS INTO TABLE 
        $('#table-standings-b').append(team); 
    });

    // FETCHING DATA FROM JSON FILE TOP SCORERS
    var jsonURL = "data/lfl-scorers.json";

    $.getJSON(jsonURL, function (data) { 
        var team = ''; 

        // ITERATING THROUGH OBJECTS 
        $.each(data, function (key, value) { 

            //CONSTRUCTION OF ROWS HAVING 
            // DATA FROM JSON OBJECT 
            team += '<tr>'; 
            team += '<td class="position">' + value.Position + '</td>'; 
            team += '<td class="p-pic"><img src='+ value.Pic + '></td>';
            team += '<td class="player">' + value.Player + '</td>';
            team += '<td class="goals-f">' + value.Goals + '</td>'; 
            team += '<td class="p-team">' + value.Team + '</td>';
            team += '</tr>'; 
        }); 
        
        //INSERTING ROWS INTO TABLE 
        $('#top-scorers').append(team); 
    });

}); 