import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update Manage Menu tab button
code = code.replace(
  `manageMenuTab === "inventory"`,
  `manageMenuTab === "purchases"`
).replace(
  `value="inventory"`,
  `value="purchases"`
).replace(
  `📦 Insumos`,
  `🛒 Compras`
);

// Add Inventory tab button to Admin Panel
const adminTabs = `<IonSegmentButton value="inventory" className="font-semibold py-2">
              <IonLabel style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <IonIcon icon={listOutline} />
                Inventario
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>`;

code = code.replace(`</IonSegment>\n        </div>\n        <IonContent`, adminTabs + `\n        </div>\n        <IonContent`);

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced segments");
