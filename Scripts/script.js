const Savecode = require('./Savecode');
const { BASE, setCharset } = require('./Base');
const { decodeConfig, oldDecodeConfig } = require('./decodeConfig');
const generateNewCode = require('./GenerateNewCode');

let extractedSaveCode = '';

document.getElementById('loadFileButton').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            extractedSaveCode = processFile(content);
            document.getElementById('extractedCode').innerText = `Extracted Code: ${extractedSaveCode}`;
            document.getElementById('extractedCodeSection').style.display = 'block';

            document.getElementById('saveCode').value = extractedSaveCode;
        };
        reader.readAsText(file);
    }
});

function processFile(content) {
    // honestly wtf is this, it works??
    const regex = /BlzSetAbilityTooltip\(\d+, ".*?\(\)\s*(.*?)", 0\)/;
    const match = content.match(regex);
    let code = 'Code not found';

    if (match && match[1]) {
        code = match[1];
    }

    return code;
}

document.getElementById('decoderForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const playerName = document.getElementById('playerName').value;
    const saveCode = extractedSaveCode; // Use the extracted save code here
    const actionType = document.getElementById('actionType').value;
    const gameStatsBody = document.getElementById('gameStatsBody');
    const roundTimesBody = document.getElementById('roundTimesBody');
    const rewardsBody = document.getElementById('rewardsBody');
    const newCodeSection = document.getElementById('newCodeSection');
    const newCodeElement = document.getElementById('newCode');

    if(actionType === 'newCode') {
        setCharset('OLD');
    }
    else {
        setCharset('NEW');
    }

    let savecode = new Savecode(BASE());
    const loadSuccess = savecode.Load(playerName, saveCode, 1);

    gameStatsBody.innerHTML = ''; // Clear previous results
    roundTimesBody.innerHTML = '';
    rewardsBody.innerHTML = '';
    newCodeSection.style.display = 'none'; // Hide new code section

    if (!loadSuccess) {
        alert('Invalid save code.');
        return;
    }

    if (actionType === 'newCode') {
        newCodeSection.style.display = 'block';
        newCodeElement.textContent = generateNewCode(savecode, playerName);

        savecode = new Savecode(BASE());
        savecode.Load(playerName, newCodeElement.textContent, 1);
    }

    // MUST DECODE IN REVERSE OF HOW IT WAS SAVED
    decodeConfig.slice().reverse().forEach(([name, max_val]) => {
        const decodedValue = savecode.Decode(max_val);
        let row = document.createElement('tr');
        let nameCell = document.createElement('td');
        let valueCell = document.createElement('td');
        nameCell.textContent = name;
        valueCell.textContent = decodedValue;

        // Rewards
        if (max_val === 1) {
            if (decodedValue === 1) {
                valueCell.classList.add('green-cell');
            }
            else {
                valueCell.classList.add('red-cell');
            }
            row.appendChild(nameCell);
            row.appendChild(valueCell);
            rewardsBody.appendChild(row);
        }
        // Round Times
        else if (name.includes("Time")) {
            row.appendChild(nameCell);
            row.appendChild(valueCell);
            roundTimesBody.appendChild(row);
        }
        // Game Stats
        else {
            row.appendChild(nameCell);
            row.appendChild(valueCell);
            gameStatsBody.appendChild(row);
        }
    });
});
