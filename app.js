// State Definitions
const state = {
    isAuthenticated: false,
    pulseStatus: 'normal' // 'normal' | 'error'
};

// Elements
const screens = {
    login: document.getElementById('screen-login'),
    menu: document.getElementById('screen-menu'),
    inbound: document.getElementById('screen-inbound'),
    inboundDetail: document.getElementById('screen-inbound-detail'),
    inboundLov: document.getElementById('screen-inbound-lov'),
    internal: document.getElementById('screen-internal'),
    outbound: document.getElementById('screen-outbound'),
    outboundPallet: document.getElementById('screen-outbound-pallet'),
    kitting: document.getElementById('screen-kitting'),
    kittingScan: document.getElementById('screen-kitting-scan')
};

const appHeader = document.getElementById('app-header');
const pulseIcon = document.getElementById('msi-pulse-icon');

// Overlays
const overlayLoading = document.getElementById('overlay-loading');
const overlayError = document.getElementById('overlay-error');
const overlayDiagnostic = document.getElementById('overlay-diagnostic');
const overlayAdmin = document.getElementById('overlay-admin');
const overlaySuccess = document.getElementById('overlay-success');
const loadingText = document.getElementById('loading-text');

// Init
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    
    // Auth Validation - Scenario setup
    if (user === 'Tigerclaw' && pass === 'TGW773') {
        state.isAuthenticated = true;
        appHeader.classList.remove('hidden');
        document.getElementById('app-footer').classList.remove('hidden');
        navTo('screen-menu');
        // Reset state on login
        setPulseState('normal');
        document.getElementById('inbound-lpn').value = '';
        document.getElementById('kitting-header').value = '';
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
});

function logout() {
    state.isAuthenticated = false;
    appHeader.classList.add('hidden');
    document.getElementById('app-footer').classList.add('hidden');
    navTo('screen-login');
}

// Navigation
let historyStack = ['login'];

function navTo(screenId) {
    const targetId = screenId.replace('screen-', '');
    
    if (targetId === 'login') {
        historyStack = ['login'];
    } else if (targetId === 'menu') {
        historyStack = ['menu'];
    } else {
        if (historyStack[historyStack.length - 1] !== targetId) {
            historyStack.push(targetId);
        }
    }
    
    Object.values(screens).forEach(screen => {
        if(screen) screen.classList.add('hidden');
    });
    const target = screens[targetId] || document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
    }
}

function goBack() {
    if (historyStack.length > 1) {
        historyStack.pop();
        const prevId = historyStack[historyStack.length - 1];
        
        Object.values(screens).forEach(screen => {
            if(screen) screen.classList.add('hidden');
        });
        const target = screens[prevId];
        if (target) {
            target.classList.remove('hidden');
        }
    }
}

// MSI Pulse Logic
function setPulseState(status) {
    state.pulseStatus = status;
    if (status === 'error') {
        pulseIcon.classList.remove('pulse-normal');
        pulseIcon.classList.add('pulse-error');
    } else {
        pulseIcon.classList.remove('pulse-error');
        pulseIcon.classList.add('pulse-normal');
    }
}

// ==========================================
// SCENARIOS
// ==========================================

// --- INBOUND ---
async function processInbound() {
    const lpn = document.getElementById('inbound-lpn').value.trim();
    
    if (lpn === '7738185270') {
        // Scenario A: "Glitch"
        showLoading("Waiting on Server...");
        await sleep(5000);
        hideLoading();
        
        document.getElementById('val-po').innerText = 'PO-991';
        document.getElementById('val-origin').innerText = 'Chicago, IL';
        document.getElementById('val-content').innerText = '50 Cases Spiquita';
        document.getElementById('val-qty').innerText = '50';
        navTo('screen-inbound-detail');
    } else {
        // Normal Sub-200ms
        showLoading("Loading...");
        await sleep(150);
        hideLoading();
        
        document.getElementById('val-po').innerText = `PO-${Math.floor(Math.random() * 9000) + 1000}`;
        document.getElementById('val-origin').innerText = `Local DC - ${Math.floor(Math.random() * 100)}`;
        document.getElementById('val-content').innerText = 'Standard Material';
        document.getElementById('val-qty').innerText = `${Math.floor(Math.random() * 20) + 1}`;
        navTo('screen-inbound-detail');
    }
}

async function confirmInbound(choice) {
    if (choice === 'N') {
        navTo('screen-menu');
        return;
    }
    
    // Complete: Y
    const lpn = document.getElementById('inbound-lpn').value.trim();
    
    if (lpn === '7738185270') {
        // Second part of Glitch A
        showLoading("Processing Transaction...");
        await sleep(10000);
        setPulseState('error');
        hideLoading();
        navTo('screen-inbound-lov');
    } else {
        // Normal sub-200ms part
        showLoading("Processing...");
        await sleep(150);
        hideLoading();
        navTo('screen-inbound-lov');
    }
}

// --- KITTING ---
let kittingCount = 0;
let kittingGlitchDone = false;

async function processKittingHeader() {
    const kit = document.getElementById('kitting-header').value.trim();
    
    if (kit === '6305551212' && !kittingGlitchDone) {
        showLoading("404 - Reloding Page - Please wait");
        await sleep(5000);
        hideLoading();
        kittingGlitchDone = true;
        return;
    }
    
    kittingGlitchDone = false; // reset for normal flow
    showLoading("Verifying Work Order...");
    await sleep(150);
    hideLoading();
    
    kittingCount = 0;
    document.getElementById('kitting-count').innerText = kittingCount;
    document.getElementById('kitting-item').value = '';
    
    navTo('screen-kitting-scan');
}

function addKittingItem() {
    const kit = document.getElementById('kitting-header').value.trim();
    const item = document.getElementById('kitting-item').value.trim();
    if (!item) return;
    
    kittingCount++;
    document.getElementById('kitting-count').innerText = kittingCount;
    document.getElementById('kitting-item').value = '';
    
    // Glitch Scenario B
    if (kit === 'KIT-9900' && kittingCount === 3) {
        showError("NETWORK ERROR", "Socket Timeout (Error 408)");
        setPulseState('error');
        
        const btnRetry = document.getElementById('btn-error-retry');
        btnRetry.disabled = true;
        btnRetry.innerText = "Retry (3s)";
        
        let cd = 3;
        const iv = setInterval(() => {
            cd--;
            if (cd > 0) {
                btnRetry.innerText = `Retry (${cd}s)`;
            } else {
                clearInterval(iv);
                btnRetry.disabled = false;
                btnRetry.innerText = "Retry";
            }
        }, 1000);
    }
}

async function finishKitting(choice) {
    if (choice === 'N') {
        document.getElementById('kitting-item').focus();
        return;
    }
    
    // Finish: Y
    showLoading("Confirming Kit...");
    await sleep(150);
    hideLoading();
    
    showSuccess("Success", "Kitting Confirmed", function() {
        navTo('screen-menu');
    });
}

// --- INTERNAL ---
async function processInternal(choice) {
    if (choice === 'N') {
        // Reset form
        document.getElementById('internal-item').value = '';
        document.getElementById('internal-source').value = '';
        document.getElementById('internal-dest').value = '';
        return;
    }
    
    // Confirm: Y
    const item = document.getElementById('internal-item').value.trim();
    if (item === '6307762361') {
        showLoading("404 - Reloding Page - Please wait");
        await sleep(5000);
        hideLoading();
        // Return screen to normal so the user can continue
        return;
    }

    showLoading("Processing Transfer...");
    await sleep(200);
    hideLoading();
    
    document.getElementById('internal-item').value = '';
    document.getElementById('internal-source').value = '';
    document.getElementById('internal-dest').value = '';
    navTo('screen-menu');
}

// --- OUTBOUND ---
let palletCount = 0;
let outboundGlitchDone = false;

async function processOutboundDelivery() {
    const del = document.getElementById('outbound-delivery').value.trim();
    
    if (del === '6305551212' && !outboundGlitchDone) {
        showLoading("404 - Reloding Page - Please wait");
        await sleep(5000);
        hideLoading();
        outboundGlitchDone = true;
        return;
    }
    
    outboundGlitchDone = false; // reset for next try

    if (del === '7738185270') {
        showLoading("Waiting on Server...");
        await sleep(5000);
    } else {
        showLoading("Verifying Delivery...");
        await sleep(150);
    }
    hideLoading();
    
    palletCount = 0;
    document.getElementById('pallet-count').innerText = palletCount;
    document.getElementById('outbound-pallet').value = '';
    
    document.getElementById('outbound-end-panel').classList.remove('hidden');
    document.getElementById('outbound-confirm-panel').classList.add('hidden');
    
    navTo('screen-outbound-pallet');
}

function addOutboundPallet() {
    const pallet = document.getElementById('outbound-pallet').value.trim();
    if (!pallet) return;
    
    palletCount++;
    document.getElementById('pallet-count').innerText = palletCount;
    document.getElementById('outbound-pallet').value = '';
}

async function endOutbound(choice) {
    if (choice === 'N') {
        document.getElementById('outbound-pallet').focus();
        return;
    }
    
    // End: Y
    const del = document.getElementById('outbound-delivery').value.trim();
    document.getElementById('outbound-end-panel').classList.add('hidden');
    
    if (del === '6305551212') {
        showLoading("Stock on Resource Violation - Please Report Issue #LPN1200");
        await sleep(5000);
        hideLoading();
        document.getElementById('outbound-issue-panel').classList.remove('hidden');
    } else {
        document.getElementById('outbound-confirm-panel').classList.remove('hidden');
    }
}

function reportOutboundIssue() {
    document.getElementById('outbound-issue-panel').classList.add('hidden');
    document.getElementById('outbound-confirm-panel').classList.remove('hidden');
}

async function confirmOutboundShip() {
    const del = document.getElementById('outbound-delivery').value.trim();

    if (del === '7738185270') {
        showLoading("Processing Transaction...");
        await sleep(10000);
        setPulseState('error');
    } else {
        showLoading("Processing Shipment...");
        await sleep(200);
    }
    hideLoading();
    
    navTo('screen-menu');
}


// ==========================================
// HELPERS / OVERLAYS
// ==========================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showLoading(text) {
    loadingText.innerText = text;
    overlayLoading.classList.remove('hidden');
}

function hideLoading() {
    overlayLoading.classList.add('hidden');
}

function showError(title, msg) {
    document.querySelector('.error-title').innerText = title;
    document.getElementById('error-message').innerText = msg;
    overlayError.classList.remove('hidden');
}

function closeErrorOverlay() {
    overlayError.classList.add('hidden');
}

function openDiagnosticOverlay() {
    overlayDiagnostic.classList.remove('hidden');
}

function closeDiagnosticOverlay() {
    overlayDiagnostic.classList.add('hidden');
}

window.addEventListener('message', function(event) {
    if (event.data === 'closeDiagnosticOverlay') {
        closeDiagnosticOverlay();
    }
});

let iframeScale = 0.5;

function zoomIframe(delta) {
    if (delta === 0) {
        iframeScale = 0.5;
    } else {
        iframeScale += delta;
        if (iframeScale < 0.2) iframeScale = 0.2;
        if (iframeScale > 2.0) iframeScale = 2.0;
    }
    
    const container = document.getElementById('iframe-zoom-container');
    const invScale = 100 / iframeScale;
    container.style.transform = `scale(${iframeScale})`;
    container.style.width = `${invScale}%`;
    container.style.height = `${invScale}%`;
}



function openAdminInfo() {
    overlayAdmin.classList.remove('hidden');
}

function closeAdminInfo() {
    overlayAdmin.classList.add('hidden');
}

function showSuccess(title, msg, callback) {
    document.getElementById('success-title').innerText = title;
    document.getElementById('success-message').innerText = msg;
    overlaySuccess.classList.remove('hidden');
    
    // Attach dynamic callback
    const btn = document.getElementById('btn-success-ok');
    btn.onclick = function() {
        overlaySuccess.classList.add('hidden');
        if (callback) callback();
    };
}
