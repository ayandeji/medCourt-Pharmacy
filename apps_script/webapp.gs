// Apps Script web app: receive registrations, generate 6-char voucher, append to sheet
// Replace SPREADSHEET_ID with your Google Sheet ID before deploying.

var SPREADSHEET_ID = '1N_lROhfqKdJyAZGHfs8b65Vg-rv6Suo6fZnxmsgnLeM';
var SHEET_NAME = 'Registrations';

function doPost(e) {
  var output = { success: false };
  try {
    var payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      // fallback to form-encoded
      payload = e.parameter;
    }

    if (!payload.phone) {
      output.error = 'phone_required';
      return jsonOutput(output);
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    // canonical headers we expect in the sheet
    var expected = ['Timestamp','Name','Phone','Email','Children','AgeRange','Interest','Service','Message','Voucher','Redeemed','RedeemedBy','RedeemedAt'];

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(expected);
    }

    // ensure header row contains expected columns; append any missing headers to the end
    var lastCol = Math.max(1, sheet.getLastColumn());
    var headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0] || [];
    var headerSet = {};
    for (var i = 0; i < headerRow.length; i++) headerSet[headerRow[i]] = true;
    var appended = false;
    for (var j = 0; j < expected.length; j++) {
      if (!headerSet[expected[j]]) {
        sheet.getRange(1, headerRow.length + 1).setValue(expected[j]);
        headerRow.push(expected[j]);
        headerSet[expected[j]] = true;
        appended = true;
      }
    }
    if (appended) {
      lastCol = sheet.getLastColumn();
    }

    // find Voucher column index dynamically
    var voucherCol = headerRow.indexOf('Voucher');
    if (voucherCol === -1) {
      sheet.getRange(1, headerRow.length + 1).setValue('Voucher');
      voucherCol = headerRow.length;
      headerRow.push('Voucher');
    }
    var voucherColIndex = voucherCol + 1; // 1-based

    var voucher = generateUniqueVoucher(sheet, voucherColIndex);

    // build a row matching the header order so values land in correct columns
    var rowValues = [];
    for (var k = 0; k < headerRow.length; k++) {
      var key = headerRow[k];
      switch (key) {
        case 'Timestamp': rowValues.push(new Date()); break;
        case 'Name': rowValues.push(payload.name || ''); break;
        case 'Phone': rowValues.push(payload.phone || ''); break;
        case 'Email': rowValues.push(payload.email || ''); break;
        case 'Children': rowValues.push(payload.children || ''); break;
        case 'AgeRange': rowValues.push(payload.ageRange || ''); break;
        case 'Interest': rowValues.push(payload.interest || ''); break;
        case 'Service': rowValues.push(payload.service || ''); break;
        case 'Message': rowValues.push(payload.message || ''); break;
        case 'Voucher': rowValues.push(voucher); break;
        case 'Redeemed': rowValues.push('FALSE'); break;
        case 'RedeemedBy': rowValues.push(''); break;
        case 'RedeemedAt': rowValues.push(''); break;
        default: rowValues.push(''); break;
      }
    }
    sheet.appendRow(rowValues);

    output.success = true;
    output.voucher = voucher;
  } catch (err) {
    output.success = false;
    output.error = err.message;
  }
  return jsonOutput(output);
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function generateUniqueVoucher(sheet, voucherColIndex) {
  var maxAttempts = 12;
  var attempts = 0;
  var existing = getExistingVouchers(sheet, voucherColIndex);
  var voucher = '';
  do {
    voucher = generateVoucher(6);
    attempts++;
    if (attempts > maxAttempts) break;
  } while (existing[voucher]);
  return voucher;
}

function getExistingVouchers(sheet, voucherColIndex) {
  var out = {};
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return out;
  try {
    var vals = sheet.getRange(2, voucherColIndex, lastRow - 1, 1).getValues();
    for (var i = 0; i < vals.length; i++) {
      var v = vals[i][0];
      if (v) out[String(v).toUpperCase()] = true;
    }
  } catch (err) {
    // fallback: return empty map
  }
  return out;
}

function generateVoucher(len) {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit confusing chars
  var out = '';
  for (var i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}
