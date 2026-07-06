
const scanButton = document.getElementById("scanButton");
const manualButton = document.getElementById("manualButton");
const notificationButton = document.getElementById("notificationButton");
const settingsButton = document.getElementById("settingsButton");
const sortButton = document.getElementById("sortButton");
const searchInput = document.getElementById("searchInput");

const productList = document.getElementById("productList");

const safeCount = document.getElementById("safeCount");
const soonCount = document.getElementById("soonCount");
const expiredCount = document.getElementById("expiredCount");

const productSheet = document.getElementById("productSheet");

const saveProductButton = document.getElementById("saveProduct");
const cancelProductButton = document.getElementById("cancelProduct");

const minusDay = document.getElementById("minusDay");
const plusDay = document.getElementById("plusDay");
const dayCount = document.getElementById("dayCount");

const productName = document.getElementById("productName");
const productBarcode = document.getElementById("productBarcode");
const rememberBarcode = document.getElementById("rememberBarcode");

let consumeDays = 5;

function showToast(message){

    let toast = document.getElementById("toast");

    if(!toast){

        toast = document.createElement("div");

        toast.id = "toast";

        toast.style.position = "fixed";
        toast.style.left = "50%";
        toast.style.bottom = "30px";
        toast.style.transform = "translateX(-50%)";
        toast.style.background = "#ff3b3b";
        toast.style.color = "#fff";
        toast.style.padding = "14px 22px";
        toast.style.borderRadius = "16px";
        toast.style.fontWeight = "700";
        toast.style.zIndex = "99999";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.style.opacity = "1";

    clearTimeout(toast.timer);

    toast.timer = setTimeout(()=>{

        toast.style.opacity = "0";

    },2500);

}

function openProductSheet(){

    productName.value = "";
    productBarcode.value = "";

    consumeDays = 5;

    updateDayDisplay();

    productSheet.classList.remove("hidden");
    productSheet.classList.add("show");

}

function closeProductSheet(){

    productSheet.classList.remove("show");
    productSheet.classList.add("hidden");

}

function updateDayDisplay(){

    dayCount.textContent =
        `${consumeDays} Day${consumeDays===1?"":"s"}`;

    document.querySelectorAll(".dayPreset").forEach(button=>{

        button.classList.toggle(

            "active",

            Number(button.dataset.days)===consumeDays

        );

    });

}

manualButton.onclick = openProductSheet;

scanButton.onclick = ()=>{

    startScanner();

};

cancelProductButton.onclick = closeProductSheet;

minusDay.onclick = ()=>{

    if(consumeDays>1){

        consumeDays--;

        updateDayDisplay();

    }

};

plusDay.onclick = ()=>{

    consumeDays++;

    updateDayDisplay();

};

document.querySelectorAll(".dayPreset").forEach(button=>{

    button.onclick = ()=>{

        consumeDays = Number(button.dataset.days);

        updateDayDisplay();

    };

});

saveProductButton.onclick = ()=>{

    if(!productName.value.trim()){

        showToast("Enter a product name.");

        return;

    }

    addProduct({

        name: productName.value.trim(),

        barcode: productBarcode.value.trim(),

        consumeWithinDays: consumeDays,

        openedDate: new Date().toISOString(),

        remember: rememberBarcode.checked

    });

    closeProductSheet();

    renderProducts();

    showToast("Product Saved");

};

function renderProducts(list = getProducts()){

    const stats = calculateStatistics();

    safeCount.textContent = stats.safe;
    soonCount.textContent = stats.soon;
    expiredCount.textContent = stats.expired;

    if(list.length === 0){

        productList.innerHTML = `
            <div class="emptyState">
                <div class="emptyIcon">📦</div>
                <h3>No products yet</h3>
                <p>Tap Scan Product or Add Product Manually.</p>
            </div>
        `;

        return;

    }

    productList.innerHTML = "";

    list.forEach(product=>{

        const days = getDaysRemaining(product);

        let status = "";

        if(days < 0){

            status = "❌ Expired";

        }else if(days === 0){

            status = "⚠ Expires Today";

        }else{

            status = `✅ ${days} Day${days===1?"":"s"} Left`;

        }

        productList.innerHTML += `
            <div class="productCard">

                <div class="productInfo">

                    <h3>${product.name}</h3>

                    <p>${status}</p>

                </div>

                <button
                    class="deleteButton"
                    onclick="removeProduct('${product.id}')">

                    Delete

                </button>

            </div>
        `;

    });

}

function removeProduct(id){

    if(!confirm("Delete this product?")) return;

    deleteProduct(id);

    renderProducts();

    showToast("Product deleted.");

}

notificationButton.onclick = ()=>{

    requestNotificationPermission();

};

settingsButton.onclick = ()=>{

    showToast("Settings coming soon.");

};

sortButton.onclick = ()=>{

    sortNewest();

    renderProducts();

};

searchInput.oninput = ()=>{

    const text = searchInput.value.trim();

    if(text === ""){

        renderProducts();

        return;

    }

    renderProducts(

        searchProducts(text)

    );

};

updateDayDisplay();

renderProducts();

console.log("App Ready ✅");
/* -----------------------------
   Register Service Worker
----------------------------- */

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            const registration = await navigator.serviceWorker.register("./service-worker.js");

            console.log("Service Worker Registered ✅", registration.scope);

        } catch (error) {

            console.error("Service Worker Registration Failed ❌", error);

        }

    });

}