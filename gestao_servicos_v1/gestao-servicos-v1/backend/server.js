const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'db_servicos.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Inicializar banco de dados se não existir
const initializeData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      servicos: [],
      ordens: [],
      parceiros: [],
      financeiro: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
};

const readData = () => {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const getNextId = (items) => {
  if (items.length === 0) return 1;
  return Math.max(...items.map(i => i.id)) + 1;
};

// ==================== SERVIÇOS ====================
app.get('/api/servicos', (req, res) => {
  try {
    const data = readData();
    res.json(data.servicos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

app.post('/api/servicos', (req, res) => {
  try {
    const { nome, descricao, preco, categoria } = req.body;
    const data = readData();
    const novoServico = {
      id: getNextId(data.servicos),
      nome,
      descricao,
      preco: parseFloat(preco),
      categoria,
      status: 'ativo'
    };
    data.servicos.push(novoServico);
    writeData(data);
    res.status(201).json(novoServico);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// ==================== ORDENS DE SERVIÇO ====================
app.get('/api/ordens', (req, res) => {
  try {
    const data = readData();
    res.json(data.ordens);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ordens' });
  }
});

app.post('/api/ordens', (req, res) => {
  try {
    const { servico_id, parceiro_id, observacao } = req.body;
    const data = readData();
    
    const servico = data.servicos.find(s => s.id === parseInt(servico_id));
    if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });

    const novaOrdem = {
      id: getNextId(data.ordens),
      servico_id: parseInt(servico_id),
      parceiro_id: parseInt(parceiro_id),
      valor: servico.preco,
      observacao,
      status: 'pendente',
      data: new Date().toISOString()
    };

    data.ordens.push(novaOrdem);
    writeData(data);
    res.status(201).json(novaOrdem);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar ordem' });
  }
});

// ==================== PARCEIROS ====================
app.get('/api/parceiros', (req, res) => {
  try {
    const data = readData();
    res.json(data.parceiros);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar parceiros' });
  }
});

app.post('/api/parceiros', (req, res) => {
  try {
    const data = readData();
    const novoParceiro = {
      id: getNextId(data.parceiros),
      ...req.body,
      data_cadastro: new Date().toISOString()
    };
    data.parceiros.push(novoParceiro);
    writeData(data);
    res.status(201).json(novoParceiro);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar parceiro' });
  }
});

// ==================== FINANCEIRO ====================
app.get('/api/financeiro', (req, res) => {
  try {
    const data = readData();
    res.json(data.financeiro);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar financeiro' });
  }
});

app.post('/api/financeiro', (req, res) => {
  try {
    const { tipo, valor, descricao } = req.body;
    const data = readData();
    const novaTransacao = {
      id: getNextId(data.financeiro),
      tipo,
      valor: parseFloat(valor),
      descricao,
      data: new Date().toISOString()
    };
    data.financeiro.push(novaTransacao);
    writeData(data);
    res.status(201).json(novaTransacao);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar transação' });
  }
});

// ==================== DASHBOARD ====================
app.get('/api/dashboard', (req, res) => {
  try {
    const data = readData();
    const totalServicos = data.servicos.length;
    const totalOrdens = data.ordens.length;
    const ordensPendentes = data.ordens.filter(o => o.status === 'pendente').length;
    
    const entradas = data.financeiro.filter(f => f.tipo === 'entrada').reduce((sum, f) => sum + f.valor, 0);
    const saidas = data.financeiro.filter(f => f.tipo === 'saida').reduce((sum, f) => sum + f.valor, 0);
    
    res.json({
      resumo: {
        totalServicos,
        totalOrdens,
        ordensPendentes
      },
      financeiro: {
        entradas,
        saidas,
        saldo: entradas - saidas
      },
      ordensRecentes: data.ordens.slice(-5).reverse()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar dashboard' });
  }
});

initializeData();
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 SERVIDOR - GESTÃO DE SERVIÇOS V1                     ║
║   ✅ Rodando em http://localhost:${PORT}                  ║
║                                                            ║
║   💾 Dados: db_servicos.json                              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
