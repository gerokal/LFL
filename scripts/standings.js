document.addEventListener("DOMContentLoaded", function () {

  function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function buildStandingsRow(value) {
    let row = '<tr>';
    row += '<td class="position">' + escapeHTML(value.Position) + '</td>';
    row += '<td class="team">' + escapeHTML(value.Team) + '</td>';
    row += '<td class="played">' + escapeHTML(value.Played) + '</td>';
    row += '<td class="won"> ' + escapeHTML(value.Won) + '</td>';
    row += '<td class="draw">' + escapeHTML(value.Drawn) + '</td>';
    row += '<td class="lost">' + escapeHTML(value.Lost) + '</td>';
    row += '<td class="goal-f">' + escapeHTML(value.GF) + '</td>';
    row += '<td class="goal-a">' + escapeHTML(value.GA) + '</td>';
    row += '<td class="goal-d">' + escapeHTML(value.GD) + '</td>';
    row += '<td class="points">' + escapeHTML(value.Points) + '</td>';
    row += '</tr>';
    return row;
  }

  function loadStandings(url, tableId) {
    fetch(url)
      .then(function (response) { return response.json(); })
      .then(function (data) {
        let html = '';
        data.forEach(function (value) {
          html += buildStandingsRow(value);
        });
        document.getElementById(tableId).querySelector('tbody').innerHTML = html;
      });
  }

  // Load Group A standings
  loadStandings('data/lfl-standings-a.json', 'table-standings-a');

  // Load Group B standings
  loadStandings('data/lfl-standings-b.json', 'table-standings-b');

  // Load Top Scorers
  fetch('data/lfl-scorers.json')
    .then(function (response) { return response.json(); })
    .then(function (data) {
      let html = '';
      data.forEach(function (value) {
        if (value.Player == null) return;
        html += '<tr>';
        html += '<td class="position">' + escapeHTML(value.Position) + '</td>';
        html += '<td class="p-pic"><img src="' + escapeHTML(value.Pic) + '"></td>';
        html += '<td class="player">' + escapeHTML(value.Player) + '</td>';
        html += '<td class="goals-f">' + escapeHTML(value.Goals) + '</td>';
        html += '<td class="p-team">' + escapeHTML(value.Team) + '</td>';
        html += '</tr>';
      });
      document.getElementById('top-scorers').querySelector('tbody').innerHTML = html;
    });

});
