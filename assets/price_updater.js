document.addEventListener("DOMContentLoaded", function () {
  const priceEl = document.querySelector(".optionize-price-updated");
  if (!priceEl) return;

  // Parse base price from data-original-price (e.g., "R 5,000")
  let basePrice = 0;
  const rawBase = priceEl.dataset.originalPrice
    ?.replace(/[^\d.,]/g, "")
    .replace(",", "");
  if (rawBase) basePrice = parseFloat(rawBase);

  function formatMoney(cents) {
    return (cents / 100).toLocaleString("en-ZA", {
      style: "currency",
      currency: "ZAR",
    });
  }

  // Load Optionize prices from JSON
  let optionizePrices = {};
  const priceScript = document.querySelector('[id^="optionize-prices-"]');
  if (priceScript) {
    try {
      optionizePrices = JSON.parse(priceScript.textContent);
    } catch (e) {
      console.warn("Optionize price JSON error", e);
    }
  }

  function getSelectedOptionIds() {
    const selected = [];

    document
      .querySelectorAll(".oz__option-element-radio:checked")
      .forEach((input) => {
        const id =
          input.id || input.closest("[data-variant-id]")?.dataset.variantId;
        if (id) selected.push(id);
      });

    return selected;
  }

  function getAddOnPriceTotal() {
    let total = 0;
    const selectedIds = getSelectedOptionIds();

    selectedIds.forEach((id) => {
      for (const key in optionizePrices) {
        if (key.includes(id)) {
          const price = parseFloat(optionizePrices[key]);
          if (!isNaN(price)) total += price;
        }
      }
    });

    return total;
  }

  function updatePrice() {
    const addOnTotal = getAddOnPriceTotal();
    const finalPrice = (basePrice + addOnTotal) * 100; // cents
    priceEl.textContent = formatMoney(finalPrice);
  }

  // Observe and update on interaction
  const radios = document.querySelectorAll(".oz__option-element-radio");
  if (radios.length > 0) {
    radios.forEach((el) => el.addEventListener("change", updatePrice));
    updatePrice(); // Initial run
  }
});
