const userLanguageSelect = document.querySelector(".user-language");
const contactLanguageSelect = document.querySelector(".contact-language");

const optionsHtml = Object.entries(languageMap)
  .map(
    ([languageName, languageCode]) =>
      `<option value="${languageCode}">${languageName}</option>`
  )
  .join("");

userLanguageSelect.insertAdjacentHTML("beforeend", optionsHtml);
contactLanguageSelect.insertAdjacentHTML("beforeend", optionsHtml);

function setUserLanguage() {
  const userLanguageSelect = document.querySelector(".user-language");
  console.log(userLanguageSelect.value);

  chrome.storage.local.set(
    { "extension-user-language": userLanguageSelect.value },
    function () {}
  );
}

function setContactLanguage() {
  const contactLanguageSelect = document.querySelector(".contact-language");
  console.log(contactLanguageSelect.value);
  chrome.storage.local.set(
    { "extension-contact-language": contactLanguageSelect.value },
    function () {}
  );
}

document
  .querySelector("button.select-user-language")
  .addEventListener("click", setUserLanguage);
document
  .querySelector("button.select-contact-language")
  .addEventListener("click", setContactLanguage);
