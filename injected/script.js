class UserSettingsKeys {
  static LANGUAGE = "extension-user-language";
  static CONTACT_LANGUAGE = "extension-contact-language";
}

let textMessageLanguage = null;
let textBoxLanguage = null;

const initUserSettings = () => {
  chrome.storage.local.get(
    [UserSettingsKeys.LANGUAGE, UserSettingsKeys.CONTACT_LANGUAGE],
    function (result) {
      textMessageLanguage = result[UserSettingsKeys.LANGUAGE];
      textBoxLanguage = result[UserSettingsKeys.CONTACT_LANGUAGE];
    }
  );
};
initUserSettings();

chrome.storage.onChanged.addListener(function (changes, area) {
  textMessageLanguage =
    changes[UserSettingsKeys.LANGUAGE] == undefined
      ? textMessageLanguage
      : changes[UserSettingsKeys.LANGUAGE];
  textBoxLanguage =
    changes[UserSettingsKeys.CONTACT_LANGUAGE] == undefined
      ? textBoxLanguage
      : changes[UserSettingsKeys.CONTACT_LANGUAGE];
});

const translateText = async (text, languageCode) => {
  const res = await fetch("http://127.0.0.1:5000/translate", {
    method: "POST",
    body: JSON.stringify({
      q: text,
      source: "auto",
      target: languageCode,
      format: "html",
    }),
    headers: { "Content-Type": "application/json" },
  });

  result = await res.json();
  return result["translatedText"];
};

const addConvertLanguageButton = () => {
  if (
    document.querySelector("._ak1r") == null ||
    document.querySelector("._ak1r > :nth-child(3)") != null
  ) {
    return;
  }
  const voiceButton = document.querySelector("._ak1r > :nth-child(2)");
  const clone = voiceButton.cloneNode(true);
  clone.childNodes[0].childNodes[0].childNodes[0].innerHTML = `<path fill="rgb(134, 150, 160)" fill-rule="evenodd" d="M9 2.25a.75.75 0 0 1 .75.75v1.506a49.384 49.384 0 0 1 5.343.371.75.75 0 1 1-.186 1.489c-.66-.083-1.323-.151-1.99-.206a18.67 18.67 0 0 1-2.97 6.323c.318.384.65.753 1 1.107a.75.75 0 0 1-1.07 1.052A18.902 18.902 0 0 1 9 13.687a18.823 18.823 0 0 1-5.656 4.482.75.75 0 0 1-.688-1.333 17.323 17.323 0 0 0 5.396-4.353A18.72 18.72 0 0 1 5.89 8.598a.75.75 0 0 1 1.388-.568A17.21 17.21 0 0 0 9 11.224a17.168 17.168 0 0 0 2.391-5.165 48.04 48.04 0 0 0-8.298.307.75.75 0 0 1-.186-1.489 49.159 49.159 0 0 1 5.343-.371V3A.75.75 0 0 1 9 2.25ZM15.75 9a.75.75 0 0 1 .68.433l5.25 11.25a.75.75 0 1 1-1.36.634l-1.198-2.567h-6.744l-1.198 2.567a.75.75 0 0 1-1.36-.634l5.25-11.25A.75.75 0 0 1 15.75 9Zm-2.672 8.25h5.344l-2.672-5.726-2.672 5.726Z" clip-rule="evenodd" />`;
  voiceButton.insertAdjacentElement("afterend", clone);
  clone.addEventListener("click", async (_) => {
    const textField = document.querySelector("p[dir] span");
    const textMessage = await translateText(
      textField.textContent,
      textBoxLanguage ?? "en"
    );
    // simulating user input
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(textField);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("insertText", false, textMessage);
    //
  });
};

const getHtmlToInsertInMessageBox = (text) =>
  `<div class="injected"><hr style="opacity:0.2;" /><div class="_akbu"><span dir="ltr" aria-label="" class="_ao3e selectable-text copyable-text" style="min-height: 0px;"><span class="">${text}</span></span><span class=""><span class="x3nfvp2 xxymvpz xlshs6z xqtp20y xexx8yu x150jy0e x18d9i69 x1e558r4 x12lo8hy x152skdk" aria-hidden="true"><span class="x1c4vz4f x2lah0s xn6xy2s"></span><span class="x1c4vz4f x2lah0s">12:11</span></span></span></div></div>`;

setInterval(() => {
  addConvertLanguageButton();

  const textMessageContainers = document.querySelectorAll(
    "div[data-pre-plain-text]"
  );
  textMessageContainers.forEach(async (container) => {
    // check if already injected
    let injectedElement = container.querySelector("div.injected");
    if (injectedElement != null) return;

    // get html text message
    textHTML = container.querySelector("._akbu").innerHTML;

    // inject
    container.insertAdjacentHTML(
      "beforeend",
      getHtmlToInsertInMessageBox(
        await translateText(textHTML, textMessageLanguage ?? "en")
      )
    );

    // animate to full height
    injectedElement = container.querySelector("div.injected");
    injectedElement.style.height = `${injectedElement.scrollHeight}px`;
  });
}, 5000);
