// --- 1. Configuração do Firebase ---
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- 2. Lógica para renderizar os cards ---
const columns = document.querySelectorAll('.cards-container');

// Escuta por mudanças na coleção 'leads' em tempo real
db.collection('leads').onSnapshot(snapshot => {
    // Limpa todas as colunas antes de redesenhar
    columns.forEach(col => col.innerHTML = '');

    snapshot.forEach(doc => {
        const lead = doc.data();
        const leadId = doc.id;

        // Cria o elemento do card
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-id', leadId);
        card.innerHTML = `<strong>${lead.nome}</strong><p>${lead.telefone}</p>`;
        
        // Adiciona o card à coluna correta
        const targetColumn = document.querySelector(`#${lead.etapa} .cards-container`);
        if (targetColumn) {
            targetColumn.appendChild(card);
        }
    });
});

// --- 3. Lógica para Adicionar um novo Lead (Exemplo) ---
const addLeadBtn = document.querySelector('.add-lead-btn');
addLeadBtn.addEventListener('click', () => {
    const nome = prompt("Nome do Lead:");
    const telefone = prompt("Telefone do Lead:");

    if (nome && telefone) {
        db.collection('leads').add({
            nome: nome,
            telefone: telefone,
            email: "", // Pode adicionar mais campos
            etapa: "novos",
            dataCriacao: firebase.firestore.FieldValue.serverTimestamp(),
            qualificadoPelaIA: false,
            historico: [{ timestamp: new Date(), acao: "Lead criado" }]
        });
    }
});


// --- 4. Lógica de Drag and Drop com SortableJS ---
document.querySelectorAll('.cards-container').forEach(container => {
    new Sortable(container, {
        group: 'leads', // Permite mover cards entre as colunas
        animation: 150,
        onEnd: function (evt) {
            const cardId = evt.item.getAttribute('data-id');
            const novaEtapa = evt.to.parentElement.id; // ID da coluna de destino

            // Atualiza o lead no Firestore quando ele é movido
            db.collection('leads').doc(cardId).update({
                etapa: novaEtapa
            });
        }
    });
});
