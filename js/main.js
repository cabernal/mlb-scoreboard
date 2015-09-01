//TODO: Add NULL checks, proper dates
//TODO: update scoreboard every time we click on date picker or next/previous date links

// Constants
var BLUE_JAYS = "Blue Jays";
var teams = {
    HOME: 0,
    AWAY: 1,
    NONE: -1
};
setup_date_widget();

update_scoreboard();

// Get hashmap containing current year, month and day
function get_date(){
    var date = $('#date-picker').datepicker('getDate');
    var date_map = {};
    date_map['year'] = date.getFullYear();
    // prepend a zero single digit months and days
    date_map['month'] = ("0" + (date.getMonth() + 1)).slice(-2);
    date_map['day'] =  ("0" + (date.getDay())).slice(-2);

    return date_map;
}

function setup_date_widget(){
    // initialize date picker
    $('#date-picker').datepicker({ dateFormat: "DD, MM d, yy"});
    $("#date-picker").datepicker('setDate', new Date());

    $("#date-picker").on("change",function(){
        update_scoreboard();
    });

    // initialize next/previous links
    // Next Day Link
    $('a#next').click(function () {
        var new_dateb = $('#date-picker').datepicker('getDate');
        new_dateb.setDate(new_dateb.getDate() + 1);
        $('#date-picker').datepicker('setDate', new_dateb);
        update_scoreboard();
        return false;
    });

    // Previous Day Link
    $('a#previous').click(function () {
        var new_dateb = $('#date-picker').datepicker('getDate');
        new_dateb.setDate(new_dateb.getDate() - 1);
        $('#date-picker').datepicker('setDate', new_dateb);
        update_scoreboard();
        return false;
    });
}

// Generate api request url for given date
function get_api_request_url(year, month, day){
    var GD2_MLB_BASE = 'http://gd2.mlb.com/components/game/mlb';
    var MASTER_SCOREBOARD = 'master_scoreboard.json';
    var url_elems = [GD2_MLB_BASE, 'year_' + year, 'month_' + month, 'day_' + day, MASTER_SCOREBOARD];
    return url_elems.join('/');
}

function update_scoreboard(){
    // clear scoreboard
    clear_scoreboard();

    // repopulate scoreboard with new game day stats
    var api_feed = 'http://gd2.mlb.com/components/game/mlb/year_2014/month_03/day_06/master_scoreboard.json'
    var cur_date = get_date();
    var api_request_url = get_api_request_url(cur_date['year'], cur_date['month'], cur_date['day']);
    jQuery.getJSON(api_request_url, function(payload) {
        var played_games = (payload.data).games;
        score_card = document.getElementById('scorecard-container');
        score_card.appendChild(make_scores_board(played_games));
    });
}

function clear_scoreboard(){
    var scoreboard = document.getElementById('scores-list');
    if(scoreboard) {
        while(scoreboard.firstChild){
            scoreboard.removeChild(scoreboard.firstChild);
        }
    }
}

// get match winner
function get_winner(match){
    var home_wins = parseInt(match.home_win);
    var away_wins = parseInt(match.away_win);

    if (home_wins > away_wins) {
        return teams.HOME;
    } else if ( home_wins < away_wins){
        return teams.AWAY;
    }
    return teams.NONE;
}

// Generate score board template and populate it with match information
function make_scores_board(games) {
    // create score board list
    var scores_list = document.getElementById('scores-list');

    var matches = games.game;
    for(var i = 0; i < matches.length; i++){
        // create list item containing match information
        var match_item = document.createElement('li');

        // create sublist containing specific match information
        var match_info = document.createElement('ul');
        match_info.className = 'scorecard';

        // home team information template
        var home_team_item = document.createElement('li');
        var home_team_name = document.createElement('p');
        var home_team_wins = document.createElement('p');
        home_team_name.className = 'team-name';
        home_team_wins.className = 'team-wins';
        home_team_item.className = 'home-team'

        // away team information template
        var away_team_item = document.createElement('li');
        var away_team_name = document.createElement('p');
        var away_team_wins = document.createElement('p');
        away_team_name.className = 'team-name';
        away_team_wins.className = 'team-wins';
        away_team_item.className = 'away-team'

        // match status template
        var match_status_item = document.createElement('li');

        // gather match information
        home_team_name.innerHTML = matches[i].home_team_name;
        home_team_wins.innerHTML = matches[i].home_win;
        away_team_name.innerHTML = matches[i].away_team_name;
        away_team_wins.innerHTML = matches[i].away_win;

        // populate home team info
        home_team_item.appendChild(home_team_name);
        home_team_item.appendChild(home_team_wins);
        match_info.appendChild(home_team_item);

        // populate away team info
        away_team_item.appendChild(away_team_name);
        away_team_item.appendChild(away_team_wins);
        match_info.appendChild(away_team_item);

        // highlight winner
        var winner = get_winner(matches[i]);
        if(winner == teams.HOME){
            home_team_item.className = 'team-winner'
        } else if (winner == teams.AWAY){
            away_team_item.className = 'team-winner'
        }

        //populate status info
        var match_status = (matches[i].status).status;
        match_status_item.appendChild(document.createTextNode(match_status));
        match_info.appendChild(match_status_item);

        // append sublist match item
        match_item.appendChild(match_info);

        // prepend to scoreboard if this is a Blue Jays match
        if(home_team_name.innerHTML == BLUE_JAYS ||
            away_team_name.innerHTML == BLUE_JAYS){
            scores_list.insertBefore(match_item, scores_list.childNodes[0]);
            continue;
        }

        // append match item to scores list
        scores_list.appendChild(match_item);
    }

    return scores_list;
}
