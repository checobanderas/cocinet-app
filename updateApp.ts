import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// The rendering of Manage Menu Modal starts at 4001: <IonModal isOpen={showManageMenuModal}
const startMarker = `          {/* Manage Menu Modal */}`;
const endMarker = `          </IonModal>

      {/* Item Cancellation Modal */}`;

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find start or end index");
  console.log({ startIndex, endIndex });
  process.exit(1);
}

const before = code.substring(0, startIndex);
const after = code.substring(endIndex + 22);

const newRenderManageMenu = fs.readFileSync('rendercode.txt', 'utf8');

// Insert the render function right before the Master Render return statement
const renderMarker = '  return (\n    <>\n      {/* Master Render */}';
const renderMarkerIndex = before.indexOf(renderMarker);

if (renderMarkerIndex === -1) {
  console.log("Could not find master render marker");
  process.exit(1);
}

const beforeRender = before.substring(0, renderMarkerIndex);
const afterRenderMarker = before.substring(renderMarkerIndex);

// Also we need to inject `{appMode === 'manage-menu' && renderManageMenu()}` inside the AppMode sequence
const finalCode = beforeRender + newRenderManageMenu + '\n' + afterRenderMarker + `          {appMode === 'manage-menu' && renderManageMenu()}
      {/* Item Cancellation Modal */}` + after;

fs.writeFileSync('src/App.tsx', finalCode);
console.log("Success");
