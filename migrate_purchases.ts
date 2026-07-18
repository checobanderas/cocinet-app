import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add inventoryTab state
code = code.replace(
  `const [manageMenuTab, setManageMenuTab] = useState<`,
  `const [inventoryTab, setInventoryTab] = useState<"stock" | "purchases">("stock");\n  const [manageMenuTab, setManageMenuTab] = useState<`
);

// 2. Remove "purchases" from manageMenuTab types
code = code.replace(
  `"upload" | "crud" | "recipes" | "purchases"`,
  `"upload" | "crud" | "recipes"`
);

// 3. Remove "purchases" Segment button from manageMenuTab
const segmentToFind = `              <IonSegmentButton
                value="purchases"
                style={
                  manageMenuTab === "purchases"
                    ? {
                        background: "#8b5cf6",
                        borderRadius: "8px",
                        margin: "4px",
                      }
                    : { margin: "4px" }
                }
              >
                <IonLabel style={{ color: "white", fontWeight: "bold" }}>
                  🛒 Compras
                </IonLabel>
              </IonSegmentButton>`;
code = code.replace(segmentToFind, '');

// 4. Find the purchases block inside manageMenuTab
const purchasesStart = '{manageMenuTab === "purchases" && (';
const recipesStart = '{manageMenuTab === "recipes" && (';
const purchasesIdx = code.indexOf(purchasesStart);
const recipesIdx = code.indexOf(recipesStart);

if (purchasesIdx === -1 || recipesIdx === -1) {
    console.log("Could not find purchases or recipes block");
    process.exit(1);
}

// Extract purchases block and swap `manageMenuTab` variable to `inventoryTab`
let purchasesBlock = code.substring(purchasesIdx, recipesIdx);
purchasesBlock = purchasesBlock.replace(`{manageMenuTab === "purchases" && (`, `{inventoryTab === "purchases" && (`);

// Remove the purchases block from manageMenuTab
code = code.substring(0, purchasesIdx) + code.substring(recipesIdx);

// 5. Update renderAdminInventory to include IonSegment and both blocks
const oldRenderAdminInventoryStart = `<IonHeader className="ion-no-border">
          <IonToolbar style={{ "--background": "rgb(40, 45, 52)", "--color": "white" }}>
            <IonButtons slot="start">
              <IonButton onClick={() => setAppMode("admin")}>
                <IonIcon icon={arrowBackOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
            <IonTitle>Inventario y Mov.</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
          
            <div style={{ padding: "10px" }}>`;

const newRenderAdminInventoryStart = `<IonHeader className="ion-no-border">
          <IonToolbar style={{ "--background": "rgb(40, 45, 52)", "--color": "white" }}>
            <IonButtons slot="start">
              <IonButton onClick={() => setAppMode("admin")}>
                <IonIcon icon={arrowBackOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
            <IonTitle>Inventario y Movimientos</IonTitle>
          </IonToolbar>
          <IonToolbar style={{ "--background": "rgb(40, 45, 52)", "--color": "white" }}>
            <IonSegment
              value={inventoryTab}
              onIonChange={(e) => setInventoryTab(e.detail.value as any)}
              style={{ "--background": "rgba(255,255,255,0.1)" }}
            >
              <IonSegmentButton
                value="stock"
                style={
                  inventoryTab === "stock"
                    ? {
                        background: "#8b5cf6",
                        borderRadius: "8px",
                        margin: "4px",
                      }
                    : { margin: "4px" }
                }
              >
                <IonLabel style={{ color: "white", fontWeight: "bold" }}>📦 Insumos / Inventario</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton
                value="purchases"
                style={
                  inventoryTab === "purchases"
                    ? {
                        background: "#10b981",
                        borderRadius: "8px",
                        margin: "4px",
                      }
                    : { margin: "4px" }
                }
              >
                <IonLabel style={{ color: "white", fontWeight: "bold" }}>🛒 Movimientos (Compras)</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
          
${purchasesBlock}

          {inventoryTab === "stock" && (
            <div style={{ padding: "10px" }}>`;

// Before replacing, we need to make sure we close the `inventoryTab === "stock"` block at the end of `renderAdminInventory`.
// `renderAdminInventory` ends at:
/*
        </IonContent>
      </IonPage>
    );
  };
*/
// Inside `renderAdminInventory`, it currently doesn't wrap the content. So we just need to replace the start and then add `)}` before `</IonContent>`.

code = code.replace(oldRenderAdminInventoryStart, newRenderAdminInventoryStart);

// Now find `renderAdminInventory` end to close the stock block.
const adminInvEnd = `        </IonContent>
      </IonPage>
    );
  };`;
const newAdminInvEnd = `          )}
        </IonContent>
      </IonPage>
    );
  };`;
code = code.replace(adminInvEnd, newAdminInvEnd);

fs.writeFileSync('src/App.tsx', code);
console.log('Purchases migrated to renderAdminInventory');
