function addStyle() {
    var styleElement = document.createElement('style', {type: 'text/css'});
    styleElement.appendChild(document.createTextNode(`
        .HO0hcf {
            right: unset !important;
            top: unset !important;
            left: -25px !important;
            bottom: -25px !important;
            z-index: 5
        }
        .HO0hcf:after {
            content: '';
            display: block;
            height: 28px;
            width: 28px;
        }
        div[jsname="o7uNDd"]{
            padding-bottom: 5px
        }
        .Bl2pUd[jsname="iyUusd"]{
            padding-bottom: 20px;
        }
        
        /* Removes GitHub Enterprise and Google sign-in previews since they always show up empty */
        a[aria-label="Build software better, together, Web Page."],
        a[aria-label$="Google Accounts, Web Page."] {
            display: none;
        }
    `));

    document.head.appendChild(styleElement);
}

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function main() {
    var scrollContainer = document.querySelector('c-wiz[data-group-id][data-is-client-side] > div:nth-child(1)');
    var copyButtonInsertedCount = 0;
    // Iterating on threads and in the case of DMs, the whole message history is one thread
    document.querySelectorAll("c-wiz[data-topic-id][data-local-topic-id]")
        .forEach(
            function (e, t, i) {

                // Iterating on each message in the thread
                e.querySelectorAll('div[jscontroller="VXdfxd"]').forEach(
                    // Adding quote message buttons
                    function (addreactionButton) {

                        const container = document.createElement('div');
                        // Quote svg icon
                        container.innerHTML = `
                            <svg viewBox="0 0 24 24" width="24px" height="24px" xmlns="http://www.w3.org/2000/svg" style="margin-top: 4px">
                                <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 8v3.701c0 2.857-1.869 4.779-4.5 5.299l-.498-1.063c1.219-.459 2.001-1.822 2.001-2.929h-2.003v-5.008h5zm6 0v3.701c0 2.857-1.869 4.779-4.5 5.299l-.498-1.063c1.219-.459 2.001-1.822 2.001-2.929h-2.003v-5.008h5z"/>
                            </svg>`;
                        container.className = addreactionButton.className;
                        container.setAttribute('data-tooltip', 'Quote Message');
                        container.setAttribute('title', 'Quote Message');

                        if (
                            addreactionButton.parentElement.parentElement.querySelector('[data-tooltip*="Quote Message"]') || // Quote reply button already exists
                            addreactionButton.parentElement.parentElement.children.length === 1 // Add reaction button next to existing emoji reactions to a message
                        ) {
                            return;
                        }

                        const quoteSVG = container.children[0]
                        const svg = addreactionButton.querySelector('svg');
                        if (svg) {
                            svg.classList.forEach(c => quoteSVG.classList.add(c));
                        } else {
                            return;
                        }

                        var elRef = addreactionButton;
                        // Find parent container of the message
                        // These messages are then grouped together when they are from the recipient
                        // and the upper most one has the name and time of the message
                        while (!(elRef.className && elRef.className.includes('nF6pT')) && elRef.parentElement) {
                            elRef = elRef.parentElement;
                        }
                        if (elRef.className.includes('nF6pT')) {

                            var messageIndex, name;
                            [...elRef.parentElement.children].forEach((messageEl, index) => {
                                if (messageEl === elRef) {
                                    messageIndex = index;
                                }
                            });

                            addreactionButton.parentElement.parentElement.appendChild(container);
                            container.addEventListener('click', () => {
                                while (messageIndex >= 0) {
                                    if (elRef.parentElement.children[messageIndex].className.includes('AnmYv')) {
                                        const nameContainer = elRef.parentElement.children[messageIndex].querySelector('[data-hovercard-id], [data-member-id]');
                                        name = nameContainer.getAttribute('data-name');
                                        break;
                                        // Can extract time, but adding it into static text surrounded by relative time that's rendered in the chats will only confuse people
                                        // time = el.Ref.parentElement.children[messageIndex].querySelector('span[data-absolute-timestamp]').getAttribute('data-absolute-timestamp');
                                    }
                                    messageIndex -= 1;
                                }

                                var messageContainer = addreactionButton.parentElement.parentElement.parentElement.parentElement.children[0];
                                var quoteText = getQuoteText(messageContainer);

                                let inputEl = e.querySelector('div[contenteditable="true"]'); // This fetches the input element in channels
                                let dmInput = document.body.querySelectorAll('div[contenteditable="true"]'); // This fetches the input in DMs
                                inputEl = inputEl ? inputEl : dmInput[dmInput.length - 1];
                                if (!inputEl) {
                                    return;
                                }

                                inputEl.innerHTML = makeInputText(name, quoteText, inputEl, messageContainer);
                                inputEl.scrollIntoView();
                                inputEl.click();
                                placeCaretAtEnd(inputEl);
                            });
                        }
                    }
                );
            }
        );

    if (copyButtonInsertedCount > 1) {
        scrollContainer.scrollTop += 36;
    }
}

function makeInputText(name, quoteText, inputEl, messageContainer) {
    var isDM = window.location.href.includes('/dm/');
    var selection = window.getSelection().toString();
    var text = getText(messageContainer);
    var oneLineQuote = '';
    if (selection && text.includes(selection) && selection.trim()) {
        var regexp = new RegExp('(.*)' + selection + '(.*)');
        var matches = regexp.exec(text);
        if (matches[1]) {
            // Has text before the match
            oneLineQuote += '... ';
        }
        oneLineQuote += selection.trim();

        if (matches[2]) {
            // Has text after the match
            oneLineQuote += ' ...';
        }
    }

    if (isDM) {
        return oneLineQuote ? '`' + oneLineQuote + '`\n' :
            ("```\n" + quoteText + "\n```\n" + inputEl.innerHTML)
    } else {

        return oneLineQuote ? '`' + name + ': ' + oneLineQuote + '`\n' :
            ("```\n" + name + ":\n" + quoteText + "\n```\n" + inputEl.innerHTML);
    }
}

function getQuoteText(messageContainer) {
    var regularText = getText(messageContainer);
    var videoCall = messageContainer.querySelector('a[href*="https://meet.google.com/"]');
    var image = messageContainer.querySelector('a img[alt]');
    var text = regularText ||
        (videoCall ? "🎥: " + videoCall.href : null) ||
        (image ? "📷: " + image.alt : null) ||
        '...';

    return truncateQuoteText(text);
}

function truncateQuoteText(text) {
    let splitText = text.split('\n');
    let quoteText = splitText.slice(0, 3).join('\n') + (splitText.length > 3 ? '\n...' : '');
    if (quoteText.length > 280) {
        quoteText = quoteText.slice(0, 280) + ' ...';
    }
    return quoteText;
}

function getText(messageContainer) {
    const multilineMarkdownClass = 'FMTudf';
    let textContent = '';
    const childNodes = messageContainer.children[0].childNodes;
    for (var i = 0; i < childNodes.length; i += 1) {
        if (childNodes[i].nodeType === Node.TEXT_NODE) {
            textContent += childNodes[i].textContent;
        } else if (childNodes[i].className === 'jn351e') {
            continue;
        } else if (childNodes[i].className === multilineMarkdownClass) {
            textContent += '...\n';
        } else if (childNodes[i].tagName === 'IMG') {
            // emojis
            textContent += childNodes[i].alt;
        } else {
            textContent += childNodes[i].innerHTML;
        }
    }

    return textContent;
}

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
        && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        range.insertNode(document.createElement('br'));
        range.collapse();
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

function debounce(fn, delay) {
    var timeout = null;
    return function () {
        if (timeout) {
            return;
        } else {
            timeout = setTimeout(function () {
                fn();
                timeout = null;
            }, delay);
        }
    }
}

addStyle();
main();
var el = document.documentElement;
el.addEventListener('DOMSubtreeModified', debounce(main, 2000));
