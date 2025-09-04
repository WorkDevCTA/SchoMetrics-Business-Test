## Getting Started

This is the all comands used in this project

// Install Tailwind CSS version < "4"

- npm install -D tailwindcss@3.4.0 postcss autoprefixer
- npx tailwindcss init -p
- Modified the file "tailwind.config.js"
  content: [
  "./pages/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./app/**/*.{ts,tsx}",
  "./src/**/*.{ts,tsx}",
  "*.{js,ts,jsx,tsx,mdx}",
  ],
- Add this in the file "globals.css"
  /_ ./styles/globals.css _/
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
-

- npm install prisma --save-dev
- npm install @prisma/client@latest --legacy-peer-deps
- npm i @libsql/client @prisma/adapter-libsql --legacy-peer-deps
- npm i @libsql/client @prisma/adapter-libsql
- npm i bcryptjs --legacy-peer-deps
- npm i jose --legacy-peer-deps // "jose" = (JSON Object Signing and Encryption)
  // Comands For AWS S3
- npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer uuid --legacy-peer-deps
  // UI Resources
- npm i lucide-react --legacy-peer-deps
- npm install react-hot-toast --legacy-peer-deps
- npm i radix-ui --legacy-peer-deps
- npm install @radix-ui/themes --legacy-peer-deps
- npm i clsx --legacy-peer-deps
- npm i motion clsx tailwind-merge --legacy-peer-deps
-
-
-
-
-
-
-
-
-
-
-
-
-
-

This comand generate a ramdom JWT_SECRET Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
