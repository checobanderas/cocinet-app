import * as fs from 'fs';

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (!appCode.includes('interface CashMovement')) {
  appCode = appCode.replace(
    'interface ClosedAccount {',
    `export interface CashMovement {
  id: string;
  type: "in" | "out";
  concept: "nomina" | "retiro" | "dotacion" | "fondo" | "otro";
  amount: number;
  description: string;
  date: Date;
  user: string;
}

interface ClosedAccount {`
  );
  fs.writeFileSync('src/App.tsx', appCode);
  console.log('Added CashMovement interface to App.tsx');
}
