const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

let pokemonToDexno, specialList;

function parseTranscript(transcript) {
    let word = "";
    let url = "";
    for (const pokemonName of Object.keys(pokemonToDexno)) {
        if (transcript.endsWith(pokemonName)) {
            // 長いほうを採用（コイルとレアコイルで、レアコイルを採用するため）
            if (word.length <= pokemonName.length) {
                word = pokemonName;
                let dexno = pokemonToDexno[word];
                url = `https://yakkun.com/swsh/zukan/n${dexno}#base_anchor`;
            }
        }
    }
    for (const specialKey of Object.keys(specialList['special'])) {
        if (transcript.endsWith(specialKey)) {
            if (word.length <= specialKey.length) {
                word = specialKey;
                url = specialList['special'][specialKey];
            }
        }
    }

    if (url) {
        const urlElem = document.getElementById('found-page-url');
        urlElem.href = url;
        urlElem.innerText = url;
        document.getElementById('readme').style.display = 'none';
        const iframeElem = document.getElementById('found-page');
        iframeElem.src = url;
        iframeElem.style.display = 'block';
    }

    document.getElementById('recognized-text').innerText = word || "?";
}

window.addEventListener('load', async () => {
    const pokemonList = await (await fetch('pokemonlist.json')).json();
    pokemonToDexno = pokemonList['pokemonToDexno'];
    const alterNames = await (await fetch('pokemonalter.json')).json();
    // TODO: 「認識結果」に補正後の名前を出したい
    for (const key of Object.keys(alterNames)) {
        for (const [alterName, pokemonName] of Object.entries(alterNames[key])) {
            pokemonToDexno[alterName] = pokemonToDexno[pokemonName];
        }
    }

    specialList = await (await fetch('special.json')).json();
    document.getElementById("start-button").disabled = false;
});

function updateResult(transcript) {
    document.getElementById('raw-text').innerText = transcript;
    parseTranscript(transcript);
}

function keyboardInputSubmit() {
    const input = document.getElementById('keyboard-input'); 
    updateResult(input.value);
    input.value = '';
    return false;
}

function start() {
    recognition = new SR();
    recognition.lang = 'ja-JP';
    recognition.interimResults = true;
    recognition.continuous = true;
    
    recognition.onresult = function(event) {
        var results = event.results;
        console.log(results);
        if (results.length > 0) {
            // 認識開始時点からの順にresultsに先頭から埋められていく
            updateResult(results[results.length - 1][0].transcript);
        }
    };

    recognition.onaudiostart = (event) => {
        console.log('onaudiostart', event);
    };

    recognition.onaudioend = (event) => {
        console.log('onaudioend', event);
    };

    recognition.onend = (event) => {
        console.log('onend', event);
        setTimeout(start, 1);
    };

    recognition.onerror = (event) => {
        console.log('onerror', event);
    };

    recognition.onnomatch = (event) => {
        console.log('onnomatch', event);
    };

    recognition.onsoundstart = (event) => {
        console.log('onsoundstart', event);
    };

    recognition.onspeechstart = (event) => {
        console.log('onspeechstart', event);
    };

    recognition.onspeechend = (event) => {
        console.log('onspeechend', event);
    };

    recognition.onstart = (event) => {
        console.log('onstart', event);
    };

    recognition.onsoundend = (event) => {
        console.log('onsoundend', event);
    };

    recognition.start();
}
