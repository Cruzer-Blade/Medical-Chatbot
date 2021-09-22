let userInput = document.querySelector('#user-input')
let chatSendBtn = document.querySelector('#send-btn')
let micBtn = document.querySelector('#mic-btn')

let sessionFlag = -1
let html
let treatmentHtml
let knowledgePanel
let featuredSnippet
let patientCondition
let recentQuery = ''
let cardsData = []

speakTTS("Hello! Tell me if you have any medical issues...")

chatSendBtn.onclick = (runSessionHandler=true) => {
    query = userInput.value
    userInput.value = ''
    createUserBubble(query)

    if (runSessionHandler)
        handleSession(query)

    recentQuery = query
    sessionFlag++
}

micBtn.onclick = () => {
    recognizeSpeech()
    micBtn.classList.add('mic-blink')
}

userInput.onkeypress = (e) => {
    if (userInput.value && e.keyCode == 13) {
        let query = userInput.value
        userInput.value = ''
        createUserBubble(query)

        handleSession(query)
        recentQuery = query
        sessionFlag++
    }
}

function getHtmlFromQuery(query) {
    fetch('https://www.google.com/search?q=' + query)
        .then((response) => {
            return response.text()
        })
        .then((htmlString) => {
            html = _handleHtml(htmlString)
            handleSession(query)
        })
}

function send(text, runSessionHandler=true) {
    userInput.value = text
    chatSendBtn.onclick(runSessionHandler)
    handleSession(recentQuery)
}

function recognizeSpeech(autoSendRequest=true) {
    let speech = new webkitSpeechRecognition()
    let recognizedText

    speech.lang = "en-US"

    speech.onresult = function (object) {
        recognizedText = object.results[0][0].transcript
        console.log({voice_text: recognizedText})

        userInput.value = recognizedText

        if (autoSendRequest) {
            send(userInput.value)
        }

        micBtn.classList.remove('mic-blink')
    }

    speech.onerror = function (e) {
        console.log("Speech Recognition Error")
        console.log(e)
        console.log({voice_text: ""})
    }

    speech.onnomatch = function (e) {
        chrome.runtime.sendMessage({voice_text: ""})
    }

    speech.start()
}

function handleSession(query, opts={}) {
    if (sessionFlag == -1) {
        // Load HTML from given query
        getHtmlFromQuery(query)
    }

    else if (sessionFlag == 0) {
        // Allow user to select symptoms

        if (getKnowledgePanel(html)) {
            knowledgePanel = getKnowledgePanel(html)
            let cards = getCards(knowledgePanel)

            for (let i = 0; i < cards.length; i++) {
                cardsData.push(getCardData(cards[i]))
            }

            console.log(cardsData)

            let synptomsBtnsDOM = ``

            for (let i = 0; i < cardsData.length; i++) {
                for (let j = 1; j < cardsData[i]["synptoms"].length; j++) {
                    let synptom = cardsData[i]["synptoms"][j]
                    synptomsBtnsDOM += `<button onclick="send('${synptom}', false)">${synptom}</button>`
                }
            }

            if (synptomsBtnsDOM) {
                let htmlDOM = `
                <div>
                    Which of the following problems are you facing:
                </div>
                <div>
                    ${synptomsBtnsDOM}
                </div>`

                createBotBubble(htmlDOM)
                speakTTS("Which of the following problems are you facing:")
            }
            else {
                sessionFlag = 3
                handleSession(query, {'getRemedies': query})
            }
        }
    }

    else if (sessionFlag == 1) {
        // Get patient condition from symptoms

        let title

        for (let i = 0; i < cardsData.length; i++) {
            for (let j = 1; j < cardsData[i]["synptoms"].length; j++) {
                let synptom = cardsData[i]["synptoms"][j]

                if (synptom.toLowerCase() == recentQuery.toLowerCase()) {
                    patientCondition = cardsData[i]["title"]
                }
            }
        }

        createBotBubble(`You seem to have <b>"${patientCondition}"</b>`)
        speakTTS(`You seem to have "${patientCondition}"`)
        sessionFlag++
        handleSession()
    }

    else if (sessionFlag == 2) {
        // Load treatement

        fetch('https://www.google.com/search?q=' + patientCondition + ' self help')
            .then((response) => {
                return response.text()
            })
            .then((htmlString) => {
                treatmentHtml = _handleHtml(htmlString)
                sessionFlag++
                handleSession(query)
            })
    }

    else if (sessionFlag == 3) {
        // Handle remedies

        if (opts['getRemedies']) {
            let htmlDOM = "<h3>Here are some home remedies you can try:</h3>"

            getBingSelfHelp(opts['getRemedies'])
                .then(listDataStr => {
                    htmlDOM += listDataStr
                    createBotBubble(htmlDOM)
                    speakTTS("Here are some home remedies you can try:")
                })
        }

        else if (hasFeaturedSnippet(treatmentHtml)) {
            let listContents = getFeaturedSnippet(treatmentHtml)

            if (listContents) {
                listContents = listContents["content"]

                let htmlDOM = "<h3>Here are some home remedies you can try:</h3>"

                if (listContents) {
                    htmlDOM += `<div>`
                }
                else {
                    sessionFlag = 3
                    handleSession(query, {'getRemedies': patientCondition + " treatement"})
                }

                for (let i = 0; i < listContents.length; i++) {
                    let treatement = listContents[i].innerText
                    console.log(treatement)

                    htmlDOM += `<li>${treatement}`
                    speakTTS(`${i + 1}. ${treatement.replace(/...\s*$/, '')}`)
                }

                htmlDOM += `</div>`

                createBotBubble(htmlDOM)
                speakTTS("Here are some home remedies you can try:")
            }
            else {
                sessionFlag = 3
                handleSession(query, {'getRemedies': patientCondition})
            }
        }

        setTimeout(() => {
            createBotBubble("Tell me if you have any other issues...")
            speakTTS("Tell me if you have any other issues...")
        }, 1000)

        sessionFlag = -1
        cardsData = []
    }
}
