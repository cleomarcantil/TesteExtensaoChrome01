

// const button = document.querySelector("button");
// button.addEventListener("click", async () => {
    
// });

listarAbas();


async function listarAbas() {
    const janelasContainer = document.querySelector(".janelas");
    janelasContainer.innerHTML = "";

    let windows = await chrome.windows.getAll();

    for (const window of windows) {
        let tabsInWindow = await chrome.tabs.query({ windowId: window.id });        

        let tabsAndGroups = [];
        let lastGroup = null;

        for (const tab of tabsInWindow) {
            if (lastGroup == null || lastGroup.group?.id != tab.groupId) {
                lastGroup = { 
                    tabs: [],
                    group: (tab.groupId != -1) ? await chrome.tabGroups.get(tab.groupId) : null
                };

                tabsAndGroups.push(lastGroup);
            }
         
            lastGroup.tabs.push(tab);
        }

        console.log({ window, tabsAndGroups });

        criarElementos(window, tabsAndGroups, tabsInWindow.length);
    }
}

function criarElementos(window, tabsAndGroups, tabsCount) {
    const janelasContainer = document.querySelector(".janelas");

    var divJanela = document.createElement('div');
    divJanela.classList.add("janela");
    janelasContainer.appendChild(divJanela);
    
    var divTitulo = document.createElement('div');
    divTitulo.classList.add("titulo");
    divTitulo.innerText = `Janela ${window.id} (${tabsCount} tabs)`;
    divJanela.appendChild(divTitulo);
    
    for (const { tabs, group } of tabsAndGroups) {
        var divAbas = document.createElement('div');
        divAbas.classList.add("abas");
        divJanela.appendChild(divAbas);

        var divNomeGrupoAbas = document.createElement('div');
        divNomeGrupoAbas.classList.add("nome");
        divNomeGrupoAbas.innerText = group?.title;
        divAbas.appendChild(divNomeGrupoAbas);
        
        if (group != null) {
            divAbas.classList.add("grupo");
            divAbas.style.backgroundColor = group.color;
        }
        
        var ulAbas = document.createElement('ul');
        divAbas.appendChild(ulAbas);
        
        for (const tab of tabs) {
            var liAba = document.createElement('li');
            ulAbas.appendChild(liAba);
            
            var imgFavIcon = document.createElement('img');
            imgFavIcon.src = tab.favIconUrl;
            liAba.appendChild(imgFavIcon);
            
            var link = document.createElement('a');
            link.innerText = tab.title;
            link.href = tab.url;
            liAba.appendChild(link);

            link.addEventListener("click", async () => {
                await chrome.windows.update(window.id, { focused: true });
                await chrome.tabs.update(tab.id, { active: true });
            });
        }
    }
}