/**
 * @typedef {Object} Customer
 * @property {number} id
 * @property {string} customerName
 * @property {string} location
 * @property {string} vendorCode
 * @property {boolean} isactive
 */

/**
 * @typedef {Object} CreateCustomerInput
 * @property {string} customerName
 * @property {string} location
 * @property {string} vendorCode
 * @property {boolean} [isactive]
 */

/**
 * Normalize API payload into a Customer object with predictable fields.
 * @param {Partial<Customer>} payload
 * @returns {Customer}
 */
function normalizeCustomer(payload = {}) {
  return {
    id: Number(payload.id ?? 0),
    customerName: payload.customerName ?? '',
    location: payload.location ?? '',
    vendorCode: payload.vendorCode ?? '',
    isactive: Boolean(payload.isactive),
  }
}

export { normalizeCustomer }
