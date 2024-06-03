const Savecode = require('./Savecode');
const { BASE, setCharset } = require('./Base');
const { decodeConfig, oldDecodeConfig } = require('./decodeConfig');
const generateNewCode = require('./GenerateNewCode');

document.getElementById('decoderForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const playerName = document.getElementById('playerName').value;
    const saveCode = document.getElementById('saveCode').value;
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
    roundTimesBody.innerHTML = ''; // Clear previous results
    rewardsBody.innerHTML = ''; // Clear previous results
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




    decodeConfig.slice().reverse().forEach(([name, max_val]) => {
        const decodedValue = savecode.Decode(max_val);
        let row = document.createElement('tr');
        let nameCell = document.createElement('td');
        let valueCell = document.createElement('td');
        nameCell.textContent = name;
        valueCell.textContent = decodedValue;

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
        else if (name.includes("Time")) {
            row.appendChild(nameCell);
            row.appendChild(valueCell);
            roundTimesBody.appendChild(row);
        }
        else {
            row.appendChild(nameCell);
            row.appendChild(valueCell);
            gameStatsBody.appendChild(row);
        }
    });
});
