"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsMessage = void 0;
exports.OptionsMessage = {
    USER_ROLE: {
        ADMIN: 1,
        PROVIDER: 2,
        CUSTOMER: 3,
    },
    DAYS: {
        SUN: "SUN",
        MON: "MON",
        TUE: "TUE",
        WED: "WED",
        THU: "THU",
        FRI: "FRI",
        SAT: "SAT",
    },
    EMAIL_TEMPLATE: {
        provider_register: "provider_register",
        provider_approve: "provider_approve",
        provider_reject: "provider_reject",
        product_request: "product_request",
        category_request: "category_request",
        forget_password: "forget-password-admin"
    },
    PROVIDER_STATUS: {
        Pending: "Pending",
        Approved: "Approved",
        Rejected: "Rejected"
    },
    WALLET_STATUS: {
        Requested: "Requested",
        Approved: "Approved",
        Rejected: "Rejected"
    },
    CATEGORY_STATUS: {
        Requested: "Requested",
        Approved: "Approved",
        Rejected: "Rejected"
    },
    PRODUCT_STATUS: {
        Requested: "Requested",
        Approved: "Approved",
        Rejected: "Rejected"
    },
    USER_DOCUMENT: {
        Requested: "Requested",
        Approved: "Approved",
        Rejected: "Rejected"
    },
    WALLET_TYPE: {
        Customer: "Customer",
        Provider: "Provider"
    },
    WALLET_PAYMENT_TYPE: {
        Online: "Online",
        Offline: "Offline"
    },
    AMOUNT_STATUS: {
        Credit: "Credit",
        Debit: "Debit"
    },
    PRODUCT_SORT: {
        price_high_to_low: "price_high_to_low",
        price_low_to_high: "price_low_to_high",
        rating_high_to_low: "rating_high_to_low",
        rating_low_to_high: "rating_low_to_high",
        newest: "newest",
        discount: "discount"
    },
    PROVIDER_TYPE: {
        Service_Provider: "Service provider",
        Material_Provider: "Material provider"
    },
    LOCAL_TYPE: {
        ENGLISH: "en",
        ARABIC: "ar"
    },
};
//# sourceMappingURL=options.js.map