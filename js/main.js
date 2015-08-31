//TODO: Add NULL checks, proper dates

var api_feed = 'http://gd2.mlb.com/components/game/mlb/year_2014/month_03/day_06/master_scoreboard.json'
jQuery.getJSON(api_feed, function(payload) {
    var played_games = (payload.data).games;
    score_card = document.getElementById('scorecard-container');
    score_card.appendChild(make_scores_board(played_games));
});

function setup_date_widget(){
}

// Generate api request url for given date
function get_api_request_url(year, month, day){
    var GD2_MLB_BASE = 'http://gd2.mlb.com/components/game/mlb';
    var MASTER_SCOREBOARD = 'master_scoreboard.json';
    var url_elems = [GD2_MLB_BASE, year, month, day, MASTER_SCOREBOARD];
    return url_elems.join('/');
}

function make_scores_board(games) {
    // create score board list
    var scores_list = document.getElementById('scores-list');

    // append date item to score board
    var date_item = document.getElementById('date-picker');
    var date_text = games.day + "/" + games.month + "/" + games.year;
    date_item.appendChild(document.createTextNode(date_text));
    scores_list.appendChild(date_item);

    var matches = games.game;
    for(var i = 0; i < matches.length; i++){
        // create list item containing match information
        var match_item = document.createElement('li');

        // create sublist containing specific match information
        var match_info = document.createElement('ul');
        match_info.className = 'scorecard';
        var home_team_item = document.createElement('li');
        var away_team_item = document.createElement('li');
        var match_status_item = document.createElement('li');

        // populate home team info
        home_team_item.appendChild(document.createTextNode(matches[i].home_team_name));
        home_team_item.appendChild(document.createTextNode(matches[i].home_win));
        match_info.appendChild(home_team_item);

        // populate away team info
        away_team_item.appendChild(document.createTextNode(matches[i].away_team_name));
        away_team_item.appendChild(document.createTextNode(matches[i].away_win));
        match_info.appendChild(away_team_item);

        //populate status info
        var match_status = (matches[i].status).status;
        match_status_item.appendChild(document.createTextNode(match_status));
        match_info.appendChild(match_status_item);

        // append sublist match item
        match_item.appendChild(match_info);

        // append match item to scores list
        scores_list.appendChild(match_item);
    }

    return scores_list;
}
