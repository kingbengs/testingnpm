export const commerceAction = Object.freeze({
  __commerce_action__: 'Purchase',
  __currency__: 'Currency',
  __order__: 'Order ID',
  __sku__: 'Product ID',
  __total_in_cents__: 'Total',
  __label__: 'Description'
});

export const COMMERCE_ACTION_NAME = "__commerce_action__";

export const COMMERCE_ACTIONS = ["purchase", "__commerce_action__"];

export const isCommerceAction = (name) => {
  return name === COMMERCE_ACTION_NAME;
};
