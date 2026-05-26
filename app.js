const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const imageUpload = document.getElementById("imageUpload");

// ----------------------
// Center
// ----------------------
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// ----------------------
// Settings
// ----------------------
const radius = 280;
const nailCount = 120;
const steps = 500; // string art iterations

// ----------------------
// Data
// ----------------------
const nails = [];
let lines = [];
let selectedNail = null;
let uploadedImage = null;
let imageData = null;

// ----------------------
// Generate Nails
// ----------------------
for (let i = 0; i < nailCount; i++) {
    const angle = (i / nailCount) * Math.PI * 2;

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    nails.push({ x, y });
}

// ----------------------
// Upload Image
// ----------------------
imageUpload.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        const img = new Image();

        img.onload = function () {
            uploadedImage = img;
            imageData = getImageData(img);
            drawScene();
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

// ----------------------
// MAIN DRAW FUNCTION
// ----------------------
function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Image
    if (uploadedImage) {
        drawImageContain(uploadedImage);
    }

    // Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Nails
    nails.forEach(n => drawNail(n.x, n.y));

    // Lines
    lines.forEach(l => drawLine(l.start, l.end));

    // Highlight
    if (selectedNail) {
        highlightNail(selectedNail.x, selectedNail.y);
    }
}

// ----------------------
// FIX IMAGE SCALE (NO DISTORTION)
// ----------------------
function drawImageContain(img) {
    const ratio = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
    );

    const w = img.width * ratio;
    const h = img.height * ratio;

    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.drawImage(img, x, y, w, h);
}

// ----------------------
// IMAGE DATA (IMPORTANT)
// ----------------------
function getImageData(img) {
    const temp = document.createElement("canvas");
    const tctx = temp.getContext("2d");

    temp.width = canvas.width;
    temp.height = canvas.height;

    drawImageContainToContext(img, tctx, temp);

    return tctx.getImageData(0, 0, temp.width, temp.height);
}

function drawImageContainToContext(img, tctx, temp) {
    const ratio = Math.min(
        temp.width / img.width,
        temp.height / img.height
    );

    const w = img.width * ratio;
    const h = img.height * ratio;

    const x = (temp.width - w) / 2;
    const y = (temp.height - h) / 2;

    tctx.drawImage(img, x, y, w, h);
}

// ----------------------
// DRAW HELPERS
// ----------------------
function drawNail(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
}

function drawLine(start, end) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
}

function highlightNail(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
}

// ----------------------
// CLICK (manual mode)
// ----------------------
canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (let nail of nails) {
        const d = Math.sqrt(
            (mouseX - nail.x) ** 2 +
            (mouseY - nail.y) ** 2
        );

        if (d < 10) {
            if (!selectedNail) {
                selectedNail = nail;
            } else {
                lines.push({
                    start: selectedNail,
                    end: nail
                });

                selectedNail = null;
            }

            drawScene();
            break;
        }
    }
});

// =====================================================
//  STRING ART ENGINE (AUTO)
// =====================================================

// brightness
function getBrightness(r, g, b) {
    return (r + g + b) / 3;
}

// best next nail
function findBestNextNail(currentIndex) {
    let bestScore = -Infinity;
    let bestIndex = 0;

    const img = imageData;

    for (let i = 0; i < nails.length; i++) {
        if (i === currentIndex) continue;

        let score = 0;

        for (let t = 0; t < 1; t += 0.05) {
            const x = Math.floor(
                nails[currentIndex].x +
                (nails[i].x - nails[currentIndex].x) * t
            );

            const y = Math.floor(
                nails[currentIndex].y +
                (nails[i].y - nails[currentIndex].y) * t
            );

            const index = (y * canvas.width + x) * 4;

            const r = img.data[index];
            const g = img.data[index + 1];
            const b = img.data[index + 2];

            score += (255 - getBrightness(r, g, b));
        }

        if (score > bestScore) {
            bestScore = score;
            bestIndex = i;
        }
    }

    return bestIndex;
}

// run engine
function runStringArt() {
    if (!imageData) {
        alert("Upload image first!");
        return;
    }

    let current = 0;
    lines = [];

    for (let i = 0; i < steps; i++) {
        const next = findBestNextNail(current);

        lines.push({
            start: nails[current],
            end: nails[next]
        });

        current = next;
    }

    drawScene();
}

// initial render
drawScene();