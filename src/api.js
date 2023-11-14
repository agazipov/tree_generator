// import {createTreeFromGit} from "/src/script.js";

// обработка запросов
// гит
const urlImputUser = document.getElementById("gitUrlImputUser");
const urlImputProject = document.getElementById("gitUrlImputProject");
urlImputUser.value = 'agazipov'; // **
urlImputProject.value = 'react-2023-05-25'; // **
const gitReq = document.getElementById("gitReq");
const urlSelector = document.getElementById("urlSelector");
const gitElements = document.getElementById("gitElements");

let gitBlob = [];
let gitTree = [];

gitReq.addEventListener('click', () => {
    fetch(`https://api.github.com/repos/${urlImputUser.value}/${urlImputProject.value}/git/trees/main?recursive=1`)
        .then((response) => response.json())
        .then((data) => {
            gitTree = data.tree.filter(({ path, type }) => type === 'tree' && !path.includes('/'));
            gitTree.forEach((element) => {
                const newOption = document.createElement('option');
                newOption.textContent = element.path;
                urlSelector.insertAdjacentElement('afterbegin', newOption);
            });
        })

});
urlSelector.addEventListener('change', (event) => {
    let shaTree;
    gitTree.forEach(({ path, sha }) => {
        if (path === event.target.value) {
            shaTree = sha;
        }
    })
    fetch(`https://api.github.com/repos/${urlImputUser.value}/${urlImputProject.value}/git/trees/${shaTree}?recursive=1`)
        .then((response) => response.json())
        .then((data) => {
            gitBlob = data.tree.filter(({ path, type }) => type === 'blob' && path.includes('.jsx')).map(({ path }, index) => {
                const newElement = document.createElement('div');
                newElement.textContent = path.substr(path.lastIndexOf('/') + 1).replace('.jsx', '');
                newElement.className = 'gitElement';
                gitElements.insertAdjacentElement('beforeEnd', newElement);
            });
            createTreeFromGit(data.tree);
        })
});
