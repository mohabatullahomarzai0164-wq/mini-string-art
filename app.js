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

// ----------------------
// Data
// ----------------------
const nails = [];
let lines = [];
let selectedNail = null;
let uploadedImage = null;

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

    // 1. Draw Image (FIXED aspect ratio)
    if (uploadedImage) {
        drawImageContain(uploadedImage);
    }

    // 2. Draw Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Draw Nails
    for (let nail of nails) {
        drawNail(nail.x, nail.y);
    }

    // 4. Draw Lines
    for (let line of lines) {
        drawLine(line.start, line.end);
    }

    // 5. Highlight selected nail
    if (selectedNail) {
        highlightNail(selectedNail.x, selectedNail.y);
    }
}

// ----------------------
// FIXED IMAGE DRAW (NO DISTORTION)
// ----------------------
function drawImageContain(img) {
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;

    let drawWidth, drawHeight;

    if (imgRatio > canvasRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
    } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
    }

    const x = (canvas.width - drawWidth) / 2;
    const y = (canvas.height - drawHeight) / 2;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
}

// ----------------------
// Nail
// ----------------------
function drawNail(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
}

// ----------------------
// Line
// ----------------------
function drawLine(start, end) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
}

// ----------------------
// Highlight Nail
// ----------------------
function highlightNail(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
}

// ----------------------
// CLICK EVENT
// ----------------------
canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (let nail of nails) {
        const distance = Math.sqrt(
            (mouseX - nail.x) ** 2 +
            (mouseY - nail.y) ** 2
        );

        if (distance < 10) {
            if (selectedNail === null) {
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

// ----------------------
// FIRST RENDER
// ----------------------
drawScene();