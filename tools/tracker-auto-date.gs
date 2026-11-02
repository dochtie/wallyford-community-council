/**
 * Wallyford Community Council: "You said, we did" tracker helper.
 *
 * When someone changes "You said", "We did", "Status" or "Show on website"
 * on the Tracker tab, this sets "Last updated" on that row to today's date.
 * The website lists the most recently updated entries first, so edited
 * entries move to the top without anyone having to remember the date.
 *
 * How to install (once, on a computer):
 *   1. Open the tracker sheet.
 *   2. Extensions > Apps Script.
 *   3. Delete anything in the editor, paste this whole file in, click Save.
 *   4. Close the Apps Script tab. That's it: no permissions to grant.
 */
function onEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (sheet.getName() !== 'Tracker') return;

  var lastRow = e.range.getLastRow();
  if (lastRow < 2) return; // header row only

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var updatedCol = headers.indexOf('Last updated') + 1;
  if (!updatedCol) return;

  var watched = ['You said', 'We did', 'Status', 'Show on website'];
  var touched = false;
  for (var c = e.range.getColumn(); c <= e.range.getLastColumn(); c++) {
    if (watched.indexOf(headers[c - 1]) !== -1) { touched = true; break; }
  }
  if (!touched) return;

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var youSaidCol = headers.indexOf('You said') + 1;
  for (var r = Math.max(e.range.getRow(), 2); r <= lastRow; r++) {
    // Only date rows that have an entry in them.
    if (youSaidCol && sheet.getRange(r, youSaidCol).getValue() === '') continue;
    sheet.getRange(r, updatedCol).setValue(today);
  }
}
