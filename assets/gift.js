document.addEventListener("DOMContentLoaded", function () {
  const checkElement = setInterval(function () {
    const inputElement = document.querySelector(
      "#typeTabPanel_2 > div.sc-card-options > div.sc-card-option > div.sc-card-option__value.sc-card-option__value--custom > div > input[type=number]"
    );

    if (inputElement) {
      inputElement.placeholder = "Enter custom amount";
      clearInterval(checkElement);
    }
  }, 100);
});

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    console.log("Document content:", document.body.innerHTML);

    const cardOptionElement = document.querySelector(".sc-card-option");

    if (!cardOptionElement) {
      console.error(
        "Card option element not found. Please check if the class name is correct and if the element is loaded."
      );
      return;
    }

    const dropdown = document.createElement("select");
    dropdown.id = "giftCardDropdown";
    dropdown.classList.add("gift-card-dropdown");

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "Select a Gift Card Amount";
    dropdown.appendChild(defaultOption);

    console.log("Dropdown created.");

    const cardOptions = document.querySelectorAll(".sc-card-option__value");

    if (!cardOptions.length) {
      console.error("No card options found.");
      return;
    }

    cardOptions.forEach(function (option) {
      const ariaLabel = option.getAttribute("aria-label");
      const moneyElement = option.querySelector(".money");
      const dataPrice = moneyElement
        ? moneyElement.getAttribute("data-geolizr-price")
        : null;

      if (ariaLabel && dataPrice) {
        const dropdownOption = document.createElement("option");
        dropdownOption.value = dataPrice;
        dropdownOption.text = ariaLabel;
        dropdown.appendChild(dropdownOption);
        console.log(`Added option: ${ariaLabel} - ${dataPrice}`);
      }
    });

    // Insert the dropdown before the .sc-card-option element
    cardOptionElement.parentNode.insertBefore(dropdown, cardOptionElement);
    console.log("Dropdown inserted before card options.");

    // Add event listener to handle selection
    dropdown.addEventListener("change", function () {
      const selectedPrice = this.value;

      if (selectedPrice) {
        document
          .querySelectorAll(".sc-card-option__value")
          .forEach(function (option) {
            const moneyElement = option.querySelector(".money");
            const dataPrice = moneyElement
              ? moneyElement.getAttribute("data-geolizr-price")
              : null;

            if (dataPrice === selectedPrice) {
              option.click();
              console.log(`Selected option: ${dataPrice}`);
            }
          });
      }
    });
  }, 1000); // 1 second delay to allow content to load
});

document.addEventListener("DOMContentLoaded", function () {
  // Add a slight delay to ensure all elements are loaded
  setTimeout(function () {
    // Select the dropdown element
    const dropdown = document.querySelector("select#giftCardDropdown");

    // If the dropdown is found, proceed
    if (dropdown) {
      // Create the h3 element
      const h3Title = document.createElement("h3");
      h3Title.textContent = "";

      // Insert the h3 element before the dropdown
      dropdown.parentNode.insertBefore(h3Title, dropdown);

      // Create a div element to hold the text
      const descriptionDiv = document.createElement("div");
      descriptionDiv.classList.add("description"); // Add the 'description' class

      // Add content to the div
      descriptionDiv.innerHTML = `
               <p>The perfect gift for the person who has everything. Our <strong>digital</strong> gift card can be put towards any FIELDBAR product.</p>
<p>The gift card can either be sent to you by email, or directly to the lucky lucky receiver. To redeem, simply enter the unique code at the checkout.</p>
<p>Gift card terms:<br />Non-refundable<br />Valid for 3 years from the date of purchase<br />Non-transferable</p>
            `;

      // Insert the div element after the h3 title
      h3Title.insertAdjacentElement("afterend", descriptionDiv);

      console.log("H3 title and description inserted before dropdown.");
    } else {
      console.error("Dropdown element not found.");
    }
  }, 1000);
});

document.addEventListener("DOMContentLoaded", function () {
  function moveGiftrCard() {
    var giftrCard = document.querySelector(
      "div.sc-giftr-card__add:nth-child(3)"
    );
    var targetForm = document.querySelector("form#typeTabPanel_2");

    if (giftrCard && targetForm) {
      // Move the giftrCard to just after the form
      targetForm.parentNode.insertBefore(giftrCard, targetForm.nextSibling);
      console.log("Moved .sc-giftr-card__add successfully");
    } else {
      // Retry if elements are not found yet
      console.log("Elements not found, retrying...");
      setTimeout(moveGiftrCard, 100); // Retry after 100ms
    }
  }

  // Initial call to attempt the move
  moveGiftrCard();
});

document.addEventListener("DOMContentLoaded", function () {
  function moveGiftrCard() {
    var giftrCard = document.querySelector(
      "div.sc-giftr-card__add:nth-child(3)"
    );
    var targetForm = document.querySelector("form#typeTabPanel_2");

    if (giftrCard && targetForm) {
      // Move the giftrCard to just after the form
      targetForm.parentNode.insertBefore(giftrCard, targetForm.nextSibling);
      console.log("Moved .sc-giftr-card__add successfully");
    } else {
      // Retry if elements are not found yet
      console.log("Elements not found, retrying...");
      setTimeout(moveGiftrCard, 100); // Retry after 100ms
    }
  }

  // Initial call to attempt the move
  moveGiftrCard();
});

window.onload = function () {
  // Select the element with the class 'sc-card-option' (assuming it's the container)
  var cardOptionsElement = document.querySelector(".sc-card-option");

  // Create a new checkbox input element
  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "testCheckbox";
  checkbox.name = "testCheckbox";

  // Create a label for the checkbox
  var label = document.createElement("label");
  label.htmlFor = "testCheckbox";
  label.appendChild(document.createTextNode("  I want to send this as a gift"));

  // Create a wrapper div for the checkbox and label
  var wrapper = document.createElement("div");
  wrapper.appendChild(checkbox);
  wrapper.appendChild(label);

  // Insert the checkbox and label after the sc-card-option element
  cardOptionsElement.insertAdjacentElement("afterend", wrapper);

  // Add event listener to the checkbox
  checkbox.addEventListener("change", function () {
    var cardTextElements = document.querySelectorAll(".sc-card-text");
    if (this.checked) {
      // When checked, display the card text elements
      cardTextElements.forEach(function (element) {
        element.style.display = "block";
      });
    } else {
      // When unchecked, hide the card text elements
      cardTextElements.forEach(function (element) {
        element.style.display = "none";
      });
    }
  });
};

document.addEventListener("DOMContentLoaded", function () {
  const waitForElements = () => {
    const priceField = document.querySelector("div.sc-giftr-card__price");
    const targetHeading = document.querySelector("div.sc-builder > h1");

    if (priceField && targetHeading) {
      // Move price field below the h1 element
      targetHeading.parentNode.insertBefore(
        priceField,
        targetHeading.nextSibling
      );
    } else {
      // Retry after short delay if elements aren't yet available
      setTimeout(waitForElements, 100);
    }
  };

  waitForElements();
});
