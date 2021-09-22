let parser = new DOMParser()

function _handleHtml(htmlString) {
    let html = parser.parseFromString(htmlString, 'text/html')
    return html
}

function getKnowledgePanel(htmlDoc) {
    return htmlDoc.querySelector('.knowledge-panel')
}

function isMedicalKnowledgePanel(knowledge_panel) {
    return knowledge_panel && knowledge_panel.innerText().contains('medical')
}

function hasFeaturedSnippet(htmlDoc) {
    return htmlDoc.querySelector('h2.bNg8Rb')
}

function getFeaturedSnippet(htmlDoc) {
    let res = htmlDoc.querySelector('span.ILfuVd')
    let listRes = htmlDoc.querySelector('.di3YZe')

    if (res) {
        return {
            'heading': null,
            'content': res.text
        }
    }

    else if (listRes) {
        let heading = listRes.querySelector('.gsrt[role="heading"]')
        let content = listRes.querySelectorAll('li.TrT0Xe')

        for (let i = 0; i < content.length; i++) {
            content[i] = content[i].innerText
        }

        return {
            'heading': heading.text,
            'content': content
        }
    }
}

function getCards(knowledge_panel) {
    // h-carousel-item
    return knowledge_panel.querySelectorAll('g-inner-card')
}

function getCardData(card) {
    let title = card.querySelector('.gsmt').innerText
    let description = card.querySelector('.k1mQyc').innerText
    let url = card.querySelector('a').getAttribute('href')
    let synptomsList = []

    let synptoms = card.querySelectorAll('span.KqnMib').forEach(
        (x) => synptomsList.push(x.innerText)
    )

    return {
        'title': title,
        'desc': description,
        'url': 'https://www.google.com' + url,
        'synptoms': synptomsList
    }
}

function getKnowlwdgePanelDesc(knowledge_panel) {
    let res = knowledge_panel.querySelectorAll('.kno-fb-ctx.K9xsvf')

    if (res && res[1].classList.contains('mydhs')) {
        return res[1].innerText
    }
}

function getSelfHelp(htmlDoc) {
    let selfHelpPanel = htmlDoc.querySelector('.gy6Qzb.kno-aex.kno-aoc')
    let headingsElements = selfHelpPanel.querySelectorAll('a')
    let headings = []
    let contents = []

    // for (let i = 0; i < headings.length; i++) {
    //     headings.push(headingsElements[i])
    // }

    let contentsElements = selfHelpPanel.querySelectorAll('.Rs3Epd').map((x) => x.innerText)

    return {
        'headings': headingsElements,
        'content': contentsElements
    }
}

function getMedications(htmlDoc) {
    let medicationsPanel = htmlDoc.querySelector('.gy6Qzb.kno-aex.kno-aex')
    let headings = medicationsPanel.querySelectorAll('a').map((x) => x.innerText)
    let contents = medicationsPanel.querySelectorAll('.Rs3Epd').map((x) => x.innerText)

    return {
        'headings': headings,
        'content': contents
    }
}

async function getBingSelfHelp(query, custom_css_selector=null) {
    let response = await fetch('https://www.bing.com/search?q=' + query)
    let htmlStr = await response.text()
    let htmlData = parser.parseFromString(htmlStr, 'text/html')
    let listDataStr

    let selectors = [
        "#b_context > li > div.b_entityTP > div:nth-child(5) > div > div > div:nth-child(3) > div.trt_list > ul",
        "#wire5 > div > div > div > ul"
    ]

    for (i = 0; i < selectors.length; i++) {
        listDataStr = htmlData.querySelector(selectors[i])

        if (listDataStr) {
            return listDataStr.innerHTML
        }
    }

    return ""
}

// Speech functions

function getTTSUrl(text) {
    let url = `https://www.google.com/speech-api/v1/synthesize?text=${text}&lang=en-US&client=EcoutezJsTts&enc=mpeg`
    return url
}

let audio_queue = []
let aud = document.createElement('audio')
aud.play()

function speakTTS(text) {
    let url = getTTSUrl(text)
    // aud.src = url
    audio_queue.push(url)

    if (!aud.src || aud.ended) {
        console.log('Playing from queue!')
        playAudioFromQueue()
    }
}

function playAudioFromQueue() {
    if (audio_queue.length != 0) {
        aud.src = audio_queue.shift()
        aud.play()
        aud.addEventListener('ended', playAudioFromQueue)
    }
}

// UI FUNCTIONS

function createUserBubble(htmlDoc) {
    let chatContainer = document.querySelector('#chat-container')
    console.log(chatContainer)

    let userChatDOM = `
    <div class="user-chat-parent fade-in-from-bottom">
        <div class="user-chat-bubble">
            ${htmlDoc}
        </div>
        <div class="user-chat-avatar"></div>
    </div>`

    chatContainer.innerHTML += userChatDOM
    scrollToBottom()

    setTimeout(
        () => document.querySelector('.fade-in-from-bottom').classList.remove('fade-in-from-bottom'),
        250
    )
}

function createBotBubble(htmlDoc) {
    let chatContainer = document.querySelector('#chat-container')

    let botChatDOM = `
    <div class="chatbot-chat-parent fade-in-from-bottom">
        <div class="chatbot-chat-avatar"></div>
        <div class="chatbot-chat-bubble">
            ${htmlDoc}
        </div>
    </div>`

    chatContainer.innerHTML += botChatDOM
    scrollToBottom()

    setTimeout(
        () => document.querySelector('.fade-in-from-bottom').classList.remove('fade-in-from-bottom'),
        250
    )
}

function scrollToBottom() {
    document.querySelector('#chat-container').scrollTo(0,document.querySelector('#chat-container').scrollHeight)
}
