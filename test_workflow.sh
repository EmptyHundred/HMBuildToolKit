
npm run typecheck -- ./output/test-files/self-contained.ts
npm run typecheck -- ./output/test-files/type-valid.ts ./output/test-files/types/
npm run typecheck -- ./output/test-files/type-invalid.ts ./output/test-files/types/

npm run lint -- ./output/test-files/lint-valid.ts
npm run lint -- ./output/test-files/lint-invalid.ts

npm run transpile -- ./output/test-files/transpile-runtime-err.ts --sourcemap

node scripts/errmapper/dist/index.js "at printUserName (/app/output/test-files/transpile-runtime-err.js:8:35)\n at Object.<anonymous> (/app/output/test-files/transpile-runtime-err.js:11:1)" ./output/test-files/transpile-runtime-err.js.map
    
    