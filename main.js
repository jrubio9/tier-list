import "./style.css";

// =============
//    INIT
// =============
window.addEventListener("DOMContentLoaded", () => {
  console.log("Hola");
})

// =============
//     UTILS
// =============
const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

const imageInput = $("#image-input");
const itemsSection = $("#selector-items");
const resetButton = $("#reset-button");
const saveButton = $("#save-button");

// =============
//    IMAGE
// =============

function createItem(src) {
  const imageElement = document.createElement("img");
  imageElement.draggable = true;
  imageElement.className = "item-image";
  imageElement.src = src;

  imageElement.addEventListener("dragstart", handleDragStart);
  imageElement.addEventListener("dragend", handleDragEnd);

  return imageElement;
}


function useFilesToCreateItems(files) {
  if (!files || files.length === 0) return;
  // Files no es una array, es una lista de archivos (no podremos hacer forEach)
  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (eventReader) => {
      const imageElement = createItem(eventReader.target.result);
      itemsSection.appendChild(imageElement);
    };

    reader.readAsDataURL(file);
  });
}

imageInput.addEventListener("change", (e) => {
  const { files } = e.target;
  useFilesToCreateItems(files);
});

// =============
//    BUTTONS
// =============

saveButton.addEventListener("click", () => {
  const tierContainer = $(".tier");
  if (!tierContainer) {
    console.error("tierContainer es null");
    return;
  }

  // Import dinámico
  import('html2canvas').then(({ default: html2canvas }) => {
    html2canvas(tierContainer).then((htmlCanvas) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
    
      // Ajustar el tamaño del canvas al del tierContainer
      canvas.width = tierContainer.offsetWidth;
      canvas.height = tierContainer.offsetHeight;

      ctx.drawImage(htmlCanvas, 0, 0, canvas.width, canvas.height);
      // Descargar
      const imgURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'tier.png';
      link.href = imgURL;
      link.click();
    });
  });
})

resetButton.addEventListener("click", () => {
  const items = $$(".tier .item-image"); // Los items colocados

  items.forEach((item) => {
    item.remove();
    itemsSection.appendChild(item);
  });
})

// =============
//    DRAG
// =============

let draggedElement = null;
let originContainer = null;

const rows = $$(".tier .row");

rows.forEach((row) => {
  row.addEventListener("drop", handleDrop);
  row.addEventListener("dragover", handleDragOver);
  row.addEventListener("dragleave", handleDragLeave);
});

itemsSection.addEventListener("drop", handleDrop);
itemsSection.addEventListener("dragover", handleDragOver);
itemsSection.addEventListener("dragleave", handleDragLeave);

itemsSection.addEventListener("drop", handleDropFromDesktop);
itemsSection.addEventListener("dragover", handleDragOverFromDesktop);
itemsSection.addEventListener("dragleave", handleDragLeaveFromDesktop);

function handleDragStart(event) {
  draggedElement = event.target;
  originContainer = draggedElement.parentNode;

  event.dataTransfer.setData("text/plain", draggedElement.src);
  //event.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(event) {
  draggedElement = null;
  originContainer = null;
}

// ========================
//    DROP FROM DESKTOP
// ========================

function handleDragOverFromDesktop(event) {
  event.preventDefault();

  // En este caso dataTransfer ya viene con la informacion.
  const { currentTarget, dataTransfer } = event;

  if (dataTransfer.types.includes("Files")) {
    currentTarget.classList.add("drag-files");
  } else {
    // No permitir
    return;
  }
}

function handleDropFromDesktop(event) { 
  event.preventDefault();

  const { currentTarget, dataTransfer } = event;

  if (!dataTransfer.types.includes("Files")) {
    return;
  } 

  currentTarget.classList.remove("drag-files");
  const { files } = dataTransfer;
  useFilesToCreateItems(files);

}

function handleDragLeaveFromDesktop(event) {
  const { currentTarget } = event;
  currentTarget.classList.remove("drag-files");
}

// =============
//  DROP TO ROW
// =============

function handleDrop(event) {
  event.preventDefault();
  const { currentTarget, dataTransfer } = event;
  if (originContainer && draggedElement) {
    originContainer.removeChild(draggedElement);
  }

  if (draggedElement) {
    const src = dataTransfer.getData("text/plain");
    const imageElement = createItem(src);
    currentTarget.appendChild(imageElement);
  }
  currentTarget.classList.remove("drag-over");
  currentTarget.querySelector(".drag-preview")?.remove();
}

function handleDragOver(event) {
  event.preventDefault();
  const { currentTarget, dataTransfer } = event;

  if (originContainer === currentTarget) {
    return;
  }

  currentTarget.classList.add("drag-over");

  const hayPreview = $(".drag-preview");

  if (draggedElement && !hayPreview) {
    const previewElement = draggedElement.cloneNode(true);
    previewElement.classList.add("drag-preview");
    currentTarget.appendChild(previewElement);
  }
}

function handleDragLeave(event) {
  event.preventDefault();
  const { currentTarget } = event;

  if (!currentTarget) return;

  currentTarget.classList.remove("drag-over");
  currentTarget.querySelector(".drag-preview")?.remove();
}
