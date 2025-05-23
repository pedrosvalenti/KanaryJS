const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'casamentos.json');

function loadData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

async function getCasamento(id1, id2) {
  const data = loadData();
  return data.find(
    c =>
      (c.proposer === id1 && c.member === id2) ||
      (c.proposer === id2 && c.member === id1)
  );
}

async function casar(id1, id2, dataCasamento) {
  const data = loadData();
  data.push({
    proposer: id1,
    member: id2,
    data: dataCasamento,
  });
  saveData(data);
}

module.exports = {
  getCasamento,
  casar,
};
