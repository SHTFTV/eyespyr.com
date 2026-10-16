import fs from "node:fs";
const images=JSON.parse(fs.readFileSync(new URL("../journal-images.json",import.meta.url),"utf8"));
fs.mkdirSync("public/journal-cards",{recursive:true});
for(const [slug,data] of Object.entries(images))fs.writeFileSync("public/journal-cards/"+slug+".jpg",Buffer.from(data,"base64"));
