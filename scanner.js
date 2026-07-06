/*
====================================
Expiry Tracker
scanner.js
Part 1 of 2
(Complete replacement)
====================================
*/

const scannerContainer = document.getElementById("scannerContainer");
const scannerElement = document.getElementById("scanner");
const closeScannerButton = document.getElementById("closeScanner");

let html5QrCode = null;
let scannerRunning = false;

/* -----------------------------
   Start Scanner
----------------------------- */

async function startScanner(){

    if(scannerRunning) return;

    scannerContainer.classList.remove("hidden");
    scannerContainer.classList.add("show");

    html5QrCode = new Html5Qrcode("scanner");

    try{

        await html5QrCode.start(

            { facingMode: "environment" },

            {
                fps: 10,
                qrbox: { width: 250, height: 120 }
            },

            onBarcodeScanned

        );

        scannerRunning = true;

    }catch(error){

        console.error(error);
        showToast("Unable to start scanner.");

    }

}

/* -----------------------------
   Stop Scanner
----------------------------- */

async function stopScanner(){

    if(!scannerRunning) return;

    await html5QrCode.stop();
    await html5QrCode.clear();

    scannerRunning = false;

    scannerContainer.classList.remove("show");
    scannerContainer.classList.add("hidden");

}

closeScannerButton.onclick = stopScanner;

/* -----------------------------
   Barcode Scanned
----------------------------- */

async function onBarcodeScanned(decodedText){

    await stopScanner();

    // Normalize the barcode
    const barcode = String(decodedText)
        .trim()
        .replace(/\s+/g,"");

    console.log("Scanned:", barcode);

    showToast("Checking saved products...");

    const remembered = getRememberedBarcode(barcode);

    console.log("Memory:", remembered);

    if(remembered){

        productBarcode.value = barcode;
        productName.value = remembered.name;

        consumeDays = remembered.consumeWithinDays || 5;
        updateDayDisplay();

        showToast("⚡ Found in saved products!");

        productSheet.classList.remove("hidden");
        productSheet.classList.add("show");

        return;

    }

    showToast("Looking up product...");

    lookupBarcode(barcode);

}

/* -----------------------------
   Online Lookup
----------------------------- */

async function lookupBarcode(barcode){

    try{

        const response = await fetch(

            `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`

        );

        const data = await response.json();
                if(data.status === 1){

            const product = data.product || {};

            productBarcode.value = barcode;

            productName.value =
                product.product_name ||
                product.product_name_en ||
                "";

            consumeDays = 5;
            updateDayDisplay();

            if(productName.value){

                showToast("🌐 Product found!");

            }else{

                showToast("Barcode found. Enter a product name.");

            }

        }else{

            productBarcode.value = barcode;
            productName.value = "";

            consumeDays = 5;
            updateDayDisplay();

            showToast("Product not found. Enter it manually.");

        }

    }catch(error){

        console.error(error);

        productBarcode.value = barcode;
        productName.value = "";

        consumeDays = 5;
        updateDayDisplay();

        showToast("Couldn't look up product.");

    }

    productSheet.classList.remove("hidden");
    productSheet.classList.add("show");

}

console.log("Scanner Ready ✅");