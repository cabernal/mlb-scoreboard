//TODO: Add NULL checks, proper dates

// Constants
var GD2_MLB_BASE = 'http://gd2.mlb.com/components/game/mlb';
var MASTER_SCOREBOARD = 'master_scoreboard.json';
var BLUE_JAYS = "Blue Jays";
var teams = {
    HOME: 0,
    AWAY: 1,
    NONE: -1
};

// setup widget and update game day score board
setup_date_widget();
update_scoreboard();

// Get hashmap containing current year, month and day
function get_date() {
    var date = $('#date-picker').datepicker('getDate');
    var date_map = {};
    date_map['year'] = date.getFullYear();
    // prepend a zero single digit months and days
    date_map['month'] = ("0" + (date.getMonth() + 1)).slice(-2);
    date_map['day'] = ("0" + (date.getDate())).slice(-2);

    return date_map;
}

// set up date picker and next/previous day links
function setup_date_widget() {
    // initialize date picker
    $('#date-picker').datepicker({
        dateFormat: "DD, MM d, yy"
    });
    $("#date-picker").datepicker('setDate', new Date());

    // update board on date change
    $("#date-picker").on("change", function() {
        update_scoreboard();
    });

    // initialize next/previous links
    // Next Day Link
    $('a#next').click(function() {
        var new_dateb = $('#date-picker').datepicker('getDate');
        new_dateb.setDate(new_dateb.getDate() + 1);
        $('#date-picker').datepicker('setDate', new_dateb);
        update_scoreboard();
        return false;
    });

    // Previous Day Link
    $('a#previous').click(function() {
        var new_dateb = $('#date-picker').datepicker('getDate');
        new_dateb.setDate(new_dateb.getDate() - 1);
        $('#date-picker').datepicker('setDate', new_dateb);
        update_scoreboard();
        return false;
    });
}

// Generate api request url for given date
function get_api_request_url(year, month, day) {
    var url_elems = [GD2_MLB_BASE, 'year_' + year, 'month_' + month, 'day_' + day, MASTER_SCOREBOARD];
    return url_elems.join('/');
}

// Update score board with games played on currently selected date
function update_scoreboard() {
    // clear scoreboard
    clear_scoreboard();

    // repopulate scoreboard with new game day stats
    var cur_date = get_date();
    var api_request_url = get_api_request_url(cur_date['year'], cur_date['month'], cur_date['day']);
    jQuery.getJSON(api_request_url, function(payload) {
        var played_games = (payload.data).games;
        score_card = document.getElementById('scorecard-container');
        score_card.appendChild(make_scores_board(played_games));
    });
}

// Clear score board
function clear_scoreboard() {
    var scoreboard = document.getElementById('scores-list');
    if (scoreboard) {
        while (scoreboard.firstChild) {
            scoreboard.removeChild(scoreboard.firstChild);
        }
    }
}

// Get match winner
function get_winner(match) {
    if (match.hasOwnProperty('linescore')) {
        var home_wins = parseInt(((match.linescore).r).home);
        var away_wins = parseInt(((match.linescore).r).away);

        if (home_wins > away_wins) {
            return teams.HOME;
        } else if (home_wins < away_wins) {
            return teams.AWAY;
        }
    }
    return teams.NONE;
}

// Insert match into specified scores list
function insert_match(scores_list, match) {
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
    match_status_item.className = 'match-status';

    // gather match information
    home_team_name.innerHTML = match.home_team_name;
    away_team_name.innerHTML = match.away_team_name;

    // set linescore if available
    if (match.hasOwnProperty('linescore')) {
        home_team_wins.innerHTML = ((match.linescore).r).home;
        away_team_wins.innerHTML = ((match.linescore).r).away;
    }

    // populate home team info
    home_team_item.appendChild(home_team_name);
    home_team_item.appendChild(home_team_wins);
    match_info.appendChild(home_team_item);

    // populate away team info
    away_team_item.appendChild(away_team_name);
    away_team_item.appendChild(away_team_wins);
    match_info.appendChild(away_team_item);

    // highlight winner
    var winner = get_winner(match);
    if (winner == teams.HOME) {
        home_team_item.className = 'team-winner'
    } else if (winner == teams.AWAY) {
        away_team_item.className = 'team-winner'
    }

    //populate status info
    var match_status = (match.status).status;
    match_status_item.appendChild(document.createTextNode(match_status));
    match_info.appendChild(match_status_item);

    // append sublist match item
    match_item.appendChild(match_info);

    // prepend to scoreboard if this is a Blue Jays match
    if (home_team_name.innerHTML == BLUE_JAYS ||
        away_team_name.innerHTML == BLUE_JAYS) {
        scores_list.insertBefore(match_item, scores_list.childNodes[0]);
        return;
    }

    // append match item to scores list
    scores_list.appendChild(match_item);
}

// Generate score board template and populate it with match information
function make_scores_board(games) {
    // create score board list
    var scores_list = document.getElementById('scores-list');
    var matches = games.game;

    // check if there are games that day
    if (!games.hasOwnProperty('game')) {
        scores_list.innerHTML = "No games today";
        return scores_list;
    }

    // if it's a single game, insert it to score board,
    // otherwise iterate throught games list and insert each one
    if (Array.isArray(matches)) {
        for (var i = 0; i < matches.length; i++) {
            insert_match(scores_list, matches[i]);
        }
    } else {
        insert_match(scores_list, matches);
    }

    return scores_list;
}
