import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix master render condition
code = code.replace(
  `!currentUser && appMode !== "admin" && appMode !== "manage-menu" ? (`,
  `!currentUser && appMode !== "admin" && appMode !== "manage-menu" && appMode !== "inventory" ? (`
);

// Fix ultra modern title in renderLogin
const oldTitle = `                  color: "#e2e8f0",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  margin: 0,
                  fontWeight: "bold",
                }}
              >
                ★ Sistema Restaurantero ★
              </h2>`;

const newTitle = `                  background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  margin: 0,
                  fontWeight: "900",
                  fontSize: "1.4rem",
                  textShadow: "0px 4px 20px rgba(0, 242, 254, 0.4)",
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                SISTEMA RESTAURANTERO
              </h2>`;

code = code.replace(oldTitle, newTitle);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed logic and modern title');
