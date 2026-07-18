import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const modalStart = "          {/* Closed Account Detail Modal */}";
const modalEndMsg = "            </IonContent>\n          </IonModal>";
const modalStartIndex = code.indexOf(modalStart);
let modalEndIndex = code.indexOf(modalEndMsg, modalStartIndex);

if (modalStartIndex !== -1 && modalEndIndex !== -1) {
  modalEndIndex += modalEndMsg.length;
  code = code.substring(0, modalStartIndex) + code.substring(modalEndIndex);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Removed dead modal code.");
} else {
  console.log("Modal not found or already removed.");
}
