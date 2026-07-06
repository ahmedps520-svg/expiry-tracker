/*
====================================
Expiry Tracker
storage.js
Part 1 of 2
(Complete replacement)
====================================
*/

const STORAGE_KEY = "expiryTrackerProducts";
const BARCODE_MEMORY_KEY = "expiryTrackerBarcodeMemory";

let products = [];
let barcodeMemory = [];

/* -----------------------------
   Load Data
----------------------------- */

function loadProducts(){

    try{

        products = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        ) || [];

    }catch{

        products = [];

    }

    try{

        barcodeMemory = JSON.parse(
            localStorage.getItem(BARCODE_MEMORY_KEY)
        ) || [];

    }catch{

        barcodeMemory = [];

    }

}

/* -----------------------------
   Save Data
----------------------------- */

function saveProducts(){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(products)
    );

}

function saveBarcodeMemory(){

    localStorage.setItem(
        BARCODE_MEMORY_KEY,
        JSON.stringify(barcodeMemory)
    );

}

/* -----------------------------
   Add Product
----------------------------- */

function addProduct(product){

    product.id = crypto.randomUUID();
    product.created = Date.now();

    products.push(product);

    saveProducts();

    if(
        product.remember &&
        product.barcode &&
        product.barcode.trim() !== ""
    ){

        saveRememberedBarcode(

            product.barcode,

            product.name,

            product.consumeWithinDays

        );

    }

}

/* -----------------------------
   Barcode Memory
----------------------------- */

function saveRememberedBarcode(

    barcode,

    name,

    consumeWithinDays

){

    const existing = barcodeMemory.find(

        item => item.barcode === barcode

    );

    if(existing){

        existing.name = name;
        existing.consumeWithinDays = consumeWithinDays;

    }else{

        barcodeMemory.push({

            barcode,

            name,

            consumeWithinDays

        });

    }

    saveBarcodeMemory();

}

function getRememberedBarcode(barcode){

    return barcodeMemory.find(

        item => item.barcode === barcode

    );

}
/* ====================================
   Part 2 of 2
==================================== */

/* -----------------------------
   Delete Product
----------------------------- */

function deleteProduct(id){

    products = products.filter(

        product => product.id !== id

    );

    saveProducts();

}

/* -----------------------------
   Update Product
----------------------------- */

function updateProduct(id, updates){

    const product = products.find(

        product => product.id === id

    );

    if(!product) return;

    Object.assign(product, updates);

    saveProducts();

}

/* -----------------------------
   Get Product(s)
----------------------------- */

function getProduct(id){

    return products.find(

        product => product.id === id

    );

}

function getProducts(){

    return [...products];

}

/* -----------------------------
   Clear Data
----------------------------- */

function clearProducts(){

    products = [];
    barcodeMemory = [];

    saveProducts();
    saveBarcodeMemory();

}

/* -----------------------------
   Sorting
----------------------------- */

function sortNewest(){

    products.sort(
        (a,b)=>b.created-a.created
    );

}

function sortOldest(){

    products.sort(
        (a,b)=>a.created-b.created
    );

}

function sortAlphabetically(){

    products.sort(

        (a,b)=>

        a.name.localeCompare(b.name)

    );

}

/* -----------------------------
   Search
----------------------------- */

function searchProducts(query){

    query = query.toLowerCase();

    return products.filter(product =>

        product.name
            .toLowerCase()
            .includes(query)

    );

}

/* -----------------------------
   Auto Load
----------------------------- */

loadProducts();

console.log("Storage Ready ✅");