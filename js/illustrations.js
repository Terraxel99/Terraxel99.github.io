
let illustration1 = new p5(illustration1Sketch, "illustration1-canvas");
let illustration2 = new p5(illustration2Sketch, "illustration2-canvas");

const modals = [ 
    { name : 'illustration1', illustration : illustration1 },
    { name : 'illustration2', illustration : illustration2 },
];

modals.forEach(modal => {
    document.querySelectorAll(`.${modal.name}-toggle`)
        .forEach(e => e.addEventListener('click', () => toggleModal(modal.illustration, `${modal.name}-modal`)));
});

function toggleModal(illustration, modalDiv) {
    const modalElement = document.getElementById(modalDiv);

    if (modalElement.style.display === "none" || modalElement.style.display === "") {
        modalElement.style.display = "block";
        illustration.customResize();
    } else {
        modalElement.style.display = "none";
    }
}


