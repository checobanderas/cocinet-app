import * as fs from "fs";

let code = fs.readFileSync("src/App.tsx", "utf-8");

const renderFunc = `
  const [iaInsumosLoading, setIaInsumosLoading] = useState(false);
  const [iaInsumosResult, setIaInsumosResult] = useState<any[]>([]);
  const [iaInsumosError, setIaInsumosError] = useState("");

  const handleGenerateInsumosWithIA = async () => {
    if (!ticketGeminiApiKey) {
      setIaInsumosError("⚠️ Faltan credenciales: Por favor ingresa tu Clave de Gemini API en la sección 'Configuración' -> 'Ajustes del Sistema' para habilitar a la IA.");
      return;
    }
    if (products.length === 0) {
      setIaInsumosError("No hay productos en el menú. La IA necesita platillos para determinar qué insumos usar.");
      return;
    }
    
    setIaInsumosError("");
    setIaInsumosLoading(true);
    setIaInsumosResult([]);

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const client = new GoogleGenAI({ apiKey: ticketGeminiApiKey });
      
      const promptText = "Analiza el siguiente menú de restaurante:\\n" +
        products.map(p => "- " + p.name).join("\\n") +
        "\\nA partir de este menú, genera una lista completa de los ingredientes/insumos (materia prima) base necesarios para prepararlos. Ten en cuenta que solo deben ser cosas que se puedan medir en stock.\\n" +
        "Importante, toma decisiones de comida real, por ejemplo:\\n" +
        " - 'Tlayuda' es un insumo pieza.\\n" +
        " - 'Burrito' requerirá 'Tortilla de Harina G'\\n" +
        " - 'Sincronizada' requerirá 'Tortilla de Harina Num 4' o 'Normal'\\n" +
        " - 'Taco' requerirá 'Tortilla de Maíz'\\n" +
        " - 'Huevos al gusto' requerirá 'Huevo'\\n\\n" +
        "Asegúrate de NO incluir formato markdown rodeando al JSON ni explicaciones. Responde puramente con un array JSON en este formato:\\n" +
        "[\\n" +
        "  { \\"name\\": \\"Tortilla de Harina G\\", \\"unit\\": \\"pza\\", \\"category\\": \\"Ingredientes\\", \\"minStock\\": 20, \\"cost\\": 3.0 },\\n" +
        "  { \\"name\\": \\"Huevo\\", \\"unit\\": \\"pza\\", \\"category\\": \\"Ingredientes\\", \\"minStock\\": 30, \\"cost\\": 2.5 }\\n" +
        "]";

      console.log("Generando insumos con IA...");
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
      });

      let rawResponse = response.text || "[]";
      rawResponse = rawResponse.replace(/\`\`\`(json)?/g, "").trim();

      const parsedInsumos = JSON.parse(rawResponse);
      if (Array.isArray(parsedInsumos)) {
        setIaInsumosResult(parsedInsumos);
      } else {
        throw new Error("El modelo no retornó un arreglo JSON válido.");
      }
    } catch (e: any) {
      console.error(e);
      setIaInsumosError(e.message || "Oops... Ocurrió un error leyendo al agente.");
    } finally {
      setIaInsumosLoading(false);
    }
  };

  const handleSaveInsumosIa = async () => {
    if (!selectedTenant || iaInsumosResult.length === 0) return;
    
    try {
      for (const inv of iaInsumosResult) {
        const exists = inventory.find(i => i.name.toLowerCase() === inv.name.toLowerCase());
        if (!exists) {
          await addInventoryItemToFirebase({
            name: inv.name,
            unit: inv.unit || "pza",
            stock: 0,
            cost: inv.cost || 0,
            minStock: inv.minStock || 0,
            category: inv.category || "Ingredientes"
          });
        }
      }
      triggerAppNotification("IA: ¡Éxito!", "Los insumos generados han sido añadidos al inventario principal.", "success");
      setIaInsumosResult([]);
    } catch (error) {
      console.error(error);
      triggerAppNotification("Error IA", "Hubo un problema al guardar el inventario generado.", "error");
    }
  };
  
  const handleWipeInsumos = async () => {
    if (window.confirm("⚠️ ALERTA PELIGROSA: ¿Estás seguro de ELIMINAR TODOS los insumos registrados del Inventario actual? Toda esta lista se borrará en la nube.")) {
      try {
        for (const item of inventory) {
          await deleteInventoryItemFromFirebase(item.id);
        }
        triggerAppNotification("Inventario", "Se han borrado todos los insumos.", "info");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const renderIAInsumos = () => {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ "--background": "rgb(40, 45, 52)", "--color": "white" }}>
            <IonButtons slot="start">
              <IonButton onClick={() => setAppMode("admin")}>
                <IonIcon icon={arrowBackOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
            <IonTitle>Asistente de Insumos (IA)</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setAppMode("floorplan")} color="light" fill="clear">
                <IonIcon icon={closeOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
          <div className="max-w-2xl mx-auto py-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4 text-purple-600">
                <IonIcon icon={hardwareChipOutline} style={{ fontSize: "32px" }} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Construir Inventario Inteligente</h2>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed max-w-lg mx-auto">
                Basado en tu carta actual ({products.length} platillos), 
                nuestra IA puede generar una lista de ingredientes (insumos) 
                sugeridos para preparar tu menú.
              </p>
              
              {iaInsumosError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 text-left border border-red-200">
                  {iaInsumosError}
                </div>
              )}

              <div className="flex flex-col gap-3 justify-center max-w-sm mx-auto">
                <button
                  disabled={iaInsumosLoading}
                  onClick={handleGenerateInsumosWithIA}
                  className={"w-full font-bold text-sm px-6 py-3.5 rounded-2xl text-white transition " + (iaInsumosLoading ? "bg-slate-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30")}
                >
                  {iaInsumosLoading ? "Analizando Menú..." : "🧠 Auto-Generar Insumos con IA"}
                </button>
                
                <button
                  disabled={inventory.length === 0}
                  onClick={handleWipeInsumos}
                  className="w-full font-bold text-sm px-6 py-3.5 rounded-2xl text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"
                >
                  🗑️ Borrar Insumos Actuales ({inventory.length})
                </button>
              </div>
            </div>

            {iaInsumosResult.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Sugerencias ({iaInsumosResult.length})</h3>
                  <button
                    onClick={handleSaveInsumosIa}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition"
                  >
                    Guardar Todo 💾
                  </button>
                </div>
                
                <div className="space-y-2">
                  {iaInsumosResult.map((inv, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{inv.name}</p>
                        <p className="text-xs text-slate-500">Unidad: {inv.unit} · Categoría: {inv.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-600">Stock Min: {inv.minStock}</p>
                        <p className="text-xs font-medium text-slate-600">Costo Ref: ${"$"}{inv.cost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </IonContent>
      </IonPage>
    );
  };
`;

code = code.replace(
  "const renderSidebar = () => {",
  renderFunc + "\\n\\n  const renderSidebar = () => {"
);

fs.writeFileSync("src/App.tsx", code);
console.log("Done adding renderIAInsumos");
