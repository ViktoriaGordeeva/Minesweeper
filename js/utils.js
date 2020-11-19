function renderBoard(selector) {
  var strHTML = '<table border = 1><tbody>';
  for (var i = 0; i < gLevel.size; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < gLevel.size; j++) {
      strHTML += `<td id="cell-${i}-${j}" onClick="cellClicked(this, ${i}, ${j})" oncontextmenu = "cellMarked(event, this, ${i}, ${j})"></td>`
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}