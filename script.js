const firebaseConfig = {
  apiKey: "AIzaSyCbTDfWU7ucOBsK_UupkVYbQwmhXBOw3So",
  authDomain: "montoya-9acb3.firebaseapp.com",
  projectId: "montoya-9acb3",
  storageBucket: "montoya-9acb3.firebasestorage.app",
  messagingSenderId: "1157734579",
  appId: "1:1157734579:web:e08e0beb9e4360c6f810c6"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- 2. Lógica para renderizar os cards em tempo real ---
const columns = document.querySelectorAll('.cards-container');

// Escuta por mudanças na coleção 'leads'
db.collection('leads').onSnapshot(snapshot => {
    // Limpa todas as colunas antes de redesenhar para evitar duplicatas
    columns.forEach(col => col.innerHTML = '');

    snapshot.forEach(doc => {
        const lead = doc.data();
        const leadId = doc.id;

        // Cria o elemento do card
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-id', leadId);
        card.innerHTML = `<strong>${lead.nome}</strong><p>${lead.telefone}</p>`;
        
        // Adiciona o card à coluna correta baseada na 'etapa'
        const targetColumn = document.querySelector(`#${lead.etapa} .cards-container`);
        if (targetColumn) {
            targetColumn.appendChild(card);
        }
    });
});

// --- 3. Lógica do Modal para Adicionar Novo Lead ---

// Seleciona os elementos do DOM
const addLeadModal = document.getElementById('addLeadModal');
const addLeadBtn = document.querySelector('.add-lead-btn');
const closeBtn = document.querySelector('.close-btn');
const cancelBtn = document.getElementById('cancelBtn');
const addLeadForm = document.getElementById('addLeadForm');

// Função para abrir o modal
const openModal = () => {
    addLeadModal.style.display = 'flex';
};

// Função para fechar o modal
const closeModal = () => {
    addLeadModal.style.display = 'none';
    addLeadForm.reset(); // Limpa o formulário ao fechar
};

// Event Listeners para abrir e fechar o modal
addLeadBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Fecha o modal se o usuário clicar fora da área de conteúdo
window.addEventListener('click', (event) => {
    if (event.target == addLeadModal) {
        closeModal();
    }
});

// Event Listener para o envio do formulário
addLeadForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    // Pega os valores dos inputs
    const nome = document.getElementById('leadName').value;
    const telefone = document.getElementById('leadPhone').value;
    const email = document.getElementById('leadEmail').value;

    // Salva no Firestore
    db.collection('leads').add({
        nome: nome,
        telefone: telefone,
        email: email,
        etapa: "novos",
        dataCriacao: firebase.firestore.FieldValue.serverTimestamp(),
        qualificadoPelaIA: false,
        historico: [{ timestamp: new Date(), acao: "Lead criado manualmente" }]
    }).then(() => {
        console.log("Lead adicionado com sucesso!");
        closeModal(); // Fecha o modal após o sucesso
    }).catch((error) => {
        console.error("Erro ao adicionar lead: ", error);
        alert("Ocorreu um erro ao salvar o lead. Tente novamente.");
    });
});

// --- 4. Lógica de Drag and Drop com SortableJS ---
document.querySelectorAll('.cards-container').forEach(container => {
    new Sortable(container, {
        group: 'leads', // Permite mover cards entre as colunas
        animation: 150,
        onEnd: function (evt) {
            const cardId = evt.item.getAttribute('data-id');
            const novaEtapa = evt.to.parentElement.id; // ID da coluna de destino

            // Atualiza a 'etapa' do lead no Firestore quando ele é movido
            db.collection('leads').doc(cardId).update({
                etapa: novaEtapa
            }).catch(err => console.error("Erro ao mover card:", err));
        }
    });
});
