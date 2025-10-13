#!/bin/bash

# Fix emoji characters in all Astro files
find src/pages -name "*.astro" -exec sed -i 's/📱/&#128241;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🚛/&#128739;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/📊/&#128202;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/📡/&#128225;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🔒/&#128274;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/💰/&#128176;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🔗/&#128279;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/✍️/&#9997;&#65039;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🤖/&#129302;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/⚡/&#9889;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/💼/&#128188;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🏭/&#127981;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/☎️/&#9742;&#65039;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/💳/&#128179;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/📲/&#128242;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🎤/&#127908;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🧠/&#129504;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🏷️/&#127991;&#65039;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/⚙️/&#9881;&#65039;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🔌/&#128224;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🏠/&#127968;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🏢/&#127970;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/☁️/&#9729;&#65039;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🛡️/&#128737;&#65039;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🏥/&#127973;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🏦/&#127976;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🛒/&#128722;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/🔐/&#128272;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/📞/&#128222;/g' {} \;
find src/pages -name "*.astro" -exec sed -i 's/💬/&#128172;/g' {} \;

echo "✅ All emoji characters have been converted to HTML entities"
