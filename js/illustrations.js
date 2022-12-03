const modals = [ 
    { name : 'illustration1', illustration : new p5(illustration1Sketch, "illustration1-canvas") },
    { name : 'illustration2', illustration : new p5(illustration2Sketch, "illustration2-canvas") },
    { name : 'illustration3', illustration : new p5(illustration3Sketch, "illustration3-canvas") },
    { name : 'illustration4', illustration : new p5(illustration4Sketch, "illustration4-canvas") },
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
